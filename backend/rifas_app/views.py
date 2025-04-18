from rest_framework import viewsets, status
from collections import defaultdict
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now, timedelta, localtime, datetime,  get_current_timezone
from django.core.cache import cache
from django.db.models import Sum, Count, Q, F
from datetime import timedelta
from .models import Rifa, BoletoSeleccionado, Transaccion, Galeria
from .conekta_utils import crear_orden_oxxo, crear_orden_tarjeta
from django.utils import timezone
from .sms_utils import enviar_sms
from rest_framework.pagination import PageNumberPagination
from .serializers import RifaSerializer, RifaFinalizadaSerializer, ProximasRifasSerializer, TransaccionSerializer
from rest_framework.decorators import (
    api_view,
    permission_classes,
    parser_classes
)


class RifaActivaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rifa.objects.filter(estado='activa', fecha_inicio__lte=now())
    serializer_class = RifaSerializer

    def get_serializer_context(self):
        return {'request': self.request}

#Endpoint que regresa una lista de boletos diponibles
@api_view(['GET'])
def boletos_disponibles(request, rifa_id):
    try:
        rifa = Rifa.objects.get(pk=rifa_id)
    except Rifa.DoesNotExist:
        return Response({"error": "Rifa no encontrada"}, status=404)

    total = rifa.total_boletos
    ocupados = BoletoSeleccionado.objects.filter(rifa=rifa).values_list('numero', flat=True)
    disponibles = [i for i in range(total) if i not in ocupados]

    return Response({"disponibles": disponibles})

#Endpoint encargado de recabar la informacion de una venta
@api_view(["POST"])
def confirmar_compra(request):
    from .conekta_utils import crear_orden_oxxo, crear_orden_tarjeta, crear_orden_spei  # asegúrate de importar

    data = request.data
    campos_requeridos = [
        "nombre", "correo", "telefono", "nacimiento",
        "rifa_id", "boletos", "monto", "metodo_pago"
    ]

    if not all(k in data for k in campos_requeridos):
        return Response({"error": "Faltan campos obligatorios"}, status=400)

    try:
        rifa = Rifa.objects.get(pk=data["rifa_id"])
    except Rifa.DoesNotExist:
        return Response({"error": "La rifa no existe"}, status=404)

    boletos_solicitados = data["boletos"]
    boletos_ocupados = BoletoSeleccionado.objects.filter(
        rifa=rifa, numero__in=boletos_solicitados
    )
    if boletos_ocupados.exists():
        conflictivos = [b.numero for b in boletos_ocupados]
        return Response({
            "error": f"Los siguientes boletos ya no están disponibles: {conflictivos}"
        }, status=400)

    telefono = data["telefono"]
    if telefono.isdigit() and len(telefono) == 10:
        telefono = f"+52{telefono}"

    tiempo_expiracion = timezone.now() + timedelta(minutes=5)
    expires_at = int(tiempo_expiracion.timestamp())

    transaccion = Transaccion.objects.create(
        nombre_completo=data["nombre"],
        correo=data["correo"],
        telefono=telefono,
        fecha_nacimiento=data["nacimiento"],
        monto=data["monto"],
        metodo_pago=data["metodo_pago"],
        fecha_expiracion=tiempo_expiracion,
        rifa_nombre=rifa.nombre
    )

    metodo = data["metodo_pago"].lower()
    instrucciones = None

    if metodo == "oxxo":
        instrucciones = crear_orden_oxxo(
            nombre=data["nombre"],
            correo=data["correo"],
            telefono=telefono,
            monto=data["monto"],
            folio=transaccion.folio,
            expires_at=expires_at
        )
    elif metodo == "spei":
        instrucciones = crear_orden_spei(
            nombre=data["nombre"],
            correo=data["correo"],
            telefono=telefono,
            monto=data["monto"],
            folio=transaccion.folio,
            expires_at=expires_at
        )
    elif metodo == "tarjeta":
        checkout = crear_orden_tarjeta(
            nombre=data["nombre"],
            correo=data["correo"],
            telefono=telefono,
            monto=data["monto"],
            folio=transaccion.folio,
            expires_at=expires_at
        )
        if checkout and checkout.get("checkout_url"):
            instrucciones = {
                "checkout_url": checkout["checkout_url"],
                "expires_at": expires_at
            }

    try:
        BoletoSeleccionado.objects.bulk_create([
            BoletoSeleccionado(
                rifa=rifa,
                transaccion=transaccion,
                numero=numero,
                apartado=True,
                pagado=False
            )
            for numero in boletos_solicitados
        ])
    except Exception:
        transaccion.delete()
        return Response({
            "error": "No se pudieron apartar los boletos. Puede que uno de ellos ya haya sido seleccionado. Intenta con otros números."
        }, status=400)

    # Construcción de mensaje SMS
    hora_limite = transaccion.fecha_expiracion.astimezone(get_current_timezone()).strftime('%d/%b %H:%Mh')
    verificador_url = f"https://www.rifandoando.club/verificador?folio={transaccion.folio}"
    folio = transaccion.folio
    monto = transaccion.monto

    mensaje = None

    if instrucciones and metodo == "oxxo":
        mensaje = (
            f"RifandoAndo\n\n"
            f"Folio: {folio}\n\n"
            f"Ref. OXXO: {instrucciones['referencia']}\n"
            f"Monto: ${monto}\n\n"
            f"Paga antes de: {hora_limite}\n"
            f"Verifica tu compra\n{verificador_url}"
        )

    elif instrucciones and metodo == "spei":
        mensaje = (
            f"RifandoAndo\n\n"
            f"CLABE: {instrucciones['clabe']}\n"
            f"Folio/Concepto: {instrucciones['concepto']}\n"
            f"Monto: ${monto}\n\n"
            f"Paga antes del: {hora_limite}\n"
            f"Verifica tu compra en:\n{verificador_url}"
        )
    else:
        mensaje = None  # no SMS para tarjeta

    if mensaje:
        try:
            enviar_sms(mensaje, telefono)
        except Exception as e:
            print("❌ Error al enviar SMS:", e)

    response_data = {
        "success": True,
        "folio": transaccion.folio,
        "nombre": transaccion.nombre_completo,
        "telefono": transaccion.telefono,
        "correo": transaccion.correo,
        "metodo_pago": transaccion.metodo_pago,
        "fecha": transaccion.fecha_creacion,
        "expira_pago": expires_at,
        "monto": transaccion.monto,
        "rifa": transaccion.rifa_nombre,
        "boletos": boletos_solicitados,
        "total_boletos": rifa.total_boletos,
    }

    if instrucciones:
        response_data["instrucciones"] = instrucciones

    return Response(response_data)


#Endpoint para verificar los folios y regresa la informacion de una transaccion
@api_view(['GET'])
def verificar_folio(request, folio):
    try:
        transaccion = Transaccion.objects.get(folio=folio)
    except Transaccion.DoesNotExist:
        return Response({"error": "No se encontró ninguna transacción con ese folio."}, status=404)

    boletos = BoletoSeleccionado.objects.filter(transaccion=transaccion).values_list('numero', flat=True)

    return Response({
        "nombre": transaccion.nombre_completo,
        "folio":transaccion.folio,
        "telefono": transaccion.telefono,
        "correo": transaccion.correo,
        "estado": transaccion.estado,
        "monto": transaccion.monto,
        "metodo_pago": transaccion.metodo_pago,
        "fecha": transaccion.fecha_creacion,
        "expira_pago": int(transaccion.fecha_expiracion.timestamp()),
        "boletos": list(boletos),
        "rifa": transaccion.rifa_nombre,
        "total_boletos": transaccion.boletos.first().rifa.total_boletos if transaccion.boletos.exists() else None,
    })

#Endpoint que regresa las rifas que ya finalizaron
@api_view(['GET'])
def rifas_finalizadas(request):
    rifas = Rifa.objects.filter(estado='finalizada').order_by('-fecha_fin')
    serializer = RifaFinalizadaSerializer(rifas, many=True, context={'request': request})
    return Response(serializer.data)

#Endpoint que regresa lista de rifas proximas
@api_view(['GET'])
def proximas_rifas(request):
    rifas = Rifa.objects.filter(estado='en_espera').order_by('-fecha_fin')
    serializer = ProximasRifasSerializer(rifas, many=True, context={'request': request})
    return Response(serializer.data)

#Endpoint para regresar rifas acvtivas
@api_view(["GET"])
def rifas_activas(request):
    rifas = Rifa.objects.filter(
        estado='activa',
        fecha_inicio__lte=now()
    ).order_by("fecha_fin")

    serializer = RifaSerializer(rifas, many=True, context={"request": request})
    return Response(serializer.data)


#Endpoint para crear una rifa desde el admin panel
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def crear_rifa(request):
    data = request.data

    campos = ["nombre", "descripcion", "precio_boleto", "total_boletos", "fecha_inicio", "fecha_fin"]
    if not all(k in data and data[k] for k in campos):
        return Response({"error": "Faltan campos obligatorios"}, status=400)

    rifa = Rifa.objects.create(
        nombre=data["nombre"],
        descripcion=data["descripcion"],
        precio_boleto=data["precio_boleto"],
        total_boletos=data["total_boletos"],
        fecha_inicio=data["fecha_inicio"],
        fecha_fin=data["fecha_fin"],
        enlace_video=data.get("enlace_video", None)
    )

    return Response({"success": True, "id": rifa.id})

#Endpoint para subir imagenes en la creacion de rifas
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def subir_imagen_rifa(request, rifa_id):
    try:
        rifa = Rifa.objects.get(id=rifa_id)
    except Rifa.DoesNotExist:
        return Response({"error": "Rifa no encontrada"}, status=404)

    imagen = request.FILES.get("imagen")
    if not imagen:
        return Response({"error": "No se recibió imagen"}, status=400)

    Galeria.objects.create(rifa=rifa, imagen=imagen)
    return Response({"success": True})

#Endpoint para regresar estadisticas personalizadas
@api_view(["GET"])
def resumen_estadisticas(request):
    total_rifas = Rifa.objects.count()
    activas = Rifa.objects.filter(estado='activa').count()
    en_espera = Rifa.objects.filter(estado='en_espera').count()
    finalizadas = Rifa.objects.filter(estado='finalizada').count()

    boletos_vendidos = BoletoSeleccionado.objects.filter(pagado=True).count()
    ingresos_totales = Transaccion.objects.filter(estado='completado').aggregate(total=Sum("monto"))["total"] or 0

    # Boletos vendidos por rifa
    boletos_por_rifa = (
        Rifa.objects.annotate(vendidos=Count('boletoseleccionado', filter=Q(boletoseleccionado__pagado=True)))
        .values("nombre", "vendidos")
    )

    # Rifas creadas por mes
    rifas_por_mes = defaultdict(int)
    for rifa in Rifa.objects.all():
        mes = rifa.fecha_inicio.strftime("%B")
        rifas_por_mes[mes] += 1

    # Métodos de pago
    metodos_pago = defaultdict(int)
    pagos = Transaccion.objects.filter(estado='completado').values("metodo_pago").annotate(total=Count("id"))
    for pago in pagos:
        metodo = pago["metodo_pago"].upper()  # Aseguramos mayúsculas para coincidir con el frontend
        metodos_pago[metodo] = pago["total"]

    # % de boletos vendidos por tamaño de rifa
    porcentaje_por_tamano = defaultdict(lambda: {"vendidos": 0, "total": 0})
    for rifa in Rifa.objects.all():
        total = rifa.total_boletos
        vendidos = rifa.boletoseleccionado_set.filter(pagado=True).count()
        porcentaje_por_tamano[total]["total"] += total
        porcentaje_por_tamano[total]["vendidos"] += vendidos

    porcentaje_vendidos = {
        str(k): round((v["vendidos"] / v["total"]) * 100, 2) if v["total"] > 0 else 0
        for k, v in porcentaje_por_tamano.items()
    }

    # % de ventas por precio
    boletos_por_precio = (
        BoletoSeleccionado.objects
        .filter(pagado=True)
        .values(precio=F("rifa__precio_boleto"))
        .annotate(total=Count("id"))
    )
    total_vendidos = sum(b["total"] for b in boletos_por_precio)
    porcentaje_por_precio = {
        str(b["precio"]): round((b["total"] / total_vendidos) * 100, 2) if total_vendidos > 0 else 0
        for b in boletos_por_precio
    }

    return Response({
        "total_rifas": total_rifas,
        "activas": activas,
        "en_espera": en_espera,
        "finalizadas": finalizadas,
        "boletos_vendidos": boletos_vendidos,
        "ingresos_totales": ingresos_totales,
        "boletos_por_rifa": list(boletos_por_rifa),
        "rifas_por_mes": rifas_por_mes,
        "metodos_pago": metodos_pago,
        "porcentaje_vendidos_por_tamano": porcentaje_vendidos,
        "porcentaje_por_precio": porcentaje_por_precio
    })


#Endpoint para listar rifas
@api_view(["GET"])
def listar_rifas(request):
    rifas = Rifa.objects.all().order_by("-fecha_inicio")

    # Filtro por estado si se proporciona
    estado = request.GET.get("estado")
    if estado:
        rifas = rifas.filter(estado=estado)

    # Búsqueda por nombre o ID
    buscar = request.GET.get("buscar")
    if buscar:
        rifas = rifas.filter(
            Q(nombre__icontains=buscar) |
            Q(id__icontains=buscar)
        )

    # Paginación
    paginador = PageNumberPagination()
    paginador.page_size = int(request.GET.get("page_size", 10))
    resultado_paginado = paginador.paginate_queryset(rifas, request)

    serializer = RifaSerializer(resultado_paginado, many=True, context={'request': request})
    return paginador.get_paginated_response(serializer.data)


#Endpoint para eliminar rifas
@api_view(["DELETE"])
def eliminar_rifa(request, rifa_id):
    try:
        rifa = Rifa.objects.get(id=rifa_id)
        if rifa.estado != 'en_espera':
            return Response(
                {"detail": "Solo se pueden eliminar rifas en espera."},
                status=status.HTTP_400_BAD_REQUEST
            )
        rifa.delete()
        return Response({"detail": "Rifa eliminada correctamente."})
    except Rifa.DoesNotExist:
        return Response({"detail": "Rifa no encontrada."}, status=404)

#Endpoint para buscar rifa por ID
@api_view(["GET"])
def obtener_rifa(request, rifa_id):
    try:
        rifa = Rifa.objects.get(id=rifa_id)
        data = {
            "id": rifa.id,
            "nombre": rifa.nombre,
            "descripcion": rifa.descripcion,
            "estado": rifa.estado,
            "total_boletos": rifa.total_boletos,
            "precio_boleto": rifa.precio_boleto,
            "fecha_inicio": rifa.fecha_inicio.strftime("%Y-%m-%d"),
            "fecha_fin": rifa.fecha_fin.strftime("%Y-%m-%d"),
            "numero_ganador": rifa.numero_ganador,
            "video_sorteo_url": rifa.enlace_video
        }
        return Response(data)
    except Rifa.DoesNotExist:
        return Response({"error": "Rifa no encontrada"}, status=404)


#Endpoint para editar rifa segun Estado
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def editar_rifa(request, rifa_id):
    try:
        rifa = Rifa.objects.get(id=rifa_id)
    except Rifa.DoesNotExist:
        return Response({"error": "Rifa no encontrada"}, status=404)

    estado = rifa.estado
    data = request.data

    # En espera: se puede modificar todo
    if estado == "en_espera":
        campos = ["nombre", "descripcion", "total_boletos", "precio_boleto", "fecha_inicio", "fecha_fin"]
        for campo in campos:
            if campo in data:
                setattr(rifa, campo, data[campo])

    # Activa: solo nombre y descripción
    elif estado == "activa":
        if "nombre" in data:
            rifa.nombre = data["nombre"]
        if "descripcion" in data:
            rifa.descripcion = data["descripcion"]

    # Finalizada: solo número ganador y video
    elif estado == "finalizada":
        if "numero_ganador" in data:
            rifa.numero_ganador = data["numero_ganador"]
        if "video_sorteo_url" in data:
            rifa.enlace_video = data["video_sorteo_url"]

    else:
        return Response({"error": "Estado de rifa no válido"}, status=400)

    rifa.save()
    return Response({"success": True, "mensaje": "Rifa actualizada correctamente"})

#Endpoint para listar las transacciones
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def listar_transacciones(request):
    transacciones = Transaccion.objects.all().order_by("-fecha_creacion")

    estado = request.GET.get("estado", "").lower().strip()
    metodo = request.GET.get("metodo", "").lower().strip()
    buscar = request.GET.get("buscar", "").strip()

    if estado:
        transacciones = transacciones.filter(estado__iexact=estado)

    if metodo:
        transacciones = transacciones.filter(metodo_pago__iexact=metodo)

    if buscar:
        transacciones = transacciones.filter(
            Q(folio__icontains=buscar) |
            Q(nombre_completo__icontains=buscar) |
            Q(rifa_nombre__icontains=buscar)
        )

    paginador = PageNumberPagination()
    paginador.page_size = int(request.GET.get("page_size", 10))
    resultado_paginado = paginador.paginate_queryset(transacciones, request)
    serializer = TransaccionSerializer(resultado_paginado, many=True)

    return paginador.get_paginated_response(serializer.data)


#Endpoint para completar transacciones manualmente@api_view(["PUT"])
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def completar_transaccion(request, folio):
    try:
        transaccion = Transaccion.objects.get(folio=folio)
    except Transaccion.DoesNotExist:
        return Response({"error": "Transacción no encontrada."}, status=status.HTTP_404_NOT_FOUND)

    if transaccion.estado == "completado":
        return Response({"mensaje": "La transacción ya está marcada como completada."})

    # Marcar transacción como completada
    transaccion.estado = "completado"  # 👈 Asegúrate que sea igual al valor en tu modelo
    transaccion.save()

    # Marcar boletos como pagados y dejar de estar apartados
    BoletoSeleccionado.objects.filter(transaccion=transaccion).update(pagado=True, apartado=False)

    return Response({"mensaje": "Transacción completada y boletos actualizados."})



#Endpoint para poder cancelar Transacciones
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def cancelar_transaccion(request, folio):
    try:
        transaccion = Transaccion.objects.get(folio=folio)
    except Transaccion.DoesNotExist:
        return Response({"error": "Transacción no encontrada."}, status=404)

    if transaccion.estado == "cancelado":
        return Response({"error": "La transacción ya fue cancelada."}, status=400)

    # Cambiar estado
    transaccion.estado = "cancelado"
    transaccion.save()

    # Eliminar todos los boletos asociados (pagados o no)
    BoletoSeleccionado.objects.filter(transaccion=transaccion).delete()

    return Response({"mensaje": "Transacción cancelada y boletos liberados correctamente."})

#Endpoint para la busqueda de boletos
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def buscar_boleto(request):
    numero = request.GET.get("numero")
    rifa_id = request.GET.get("rifa_id")

    if numero is None:
        return Response({"error": "El número de boleto es obligatorio."}, status=400)

    filtros = Q(numero=numero)
    if rifa_id:
        filtros &= Q(rifa__id=rifa_id)

    boletos = BoletoSeleccionado.objects.filter(filtros).select_related("rifa", "transaccion")

    if not boletos.exists():
        rifas_validas = Rifa.objects.exclude(estado='en_espera')
        rifa_ids_validas = rifas_validas.values_list('id', flat=True)

        if not rifa_id or int(rifa_id) in rifa_ids_validas:
            return Response({"mensaje": "Boleto no ha sido vendido aún."}, status=200)
        return Response({"error": "No se encontró ningún boleto con ese número."}, status=404)

    resultados = []
    for boleto in boletos:
        if boleto.rifa.estado == "en_espera":
            continue  # omitimos rifas no activas

        transaccion = boleto.transaccion
        resultados.append({
            "numero": boleto.numero,
            "rifa": boleto.rifa.nombre,
            "pagado": boleto.pagado,
            "folio": transaccion.folio,
            "nombre_completo": transaccion.nombre_completo,
            "correo": transaccion.correo,
            "telefono": transaccion.telefono,
            "metodo_pago": transaccion.metodo_pago,
            "estado_transaccion": transaccion.estado,
            "fecha_transaccion": transaccion.fecha_creacion,
        })

    if not resultados:
        return Response({"mensaje": "Boleto no ha sido vendido aún."}, status=200)

    return Response(resultados)

#Endpoint para marcar como completada la transaccion pagada con tdc
@api_view(["POST"])
def conekta_success(request):
    from .models import Transaccion, BoletoSeleccionado
    import requests

    checkout_id = request.data.get("checkout_id")
    order_id = request.data.get("order_id")

    if not checkout_id or not order_id:
        return Response({"error": "Faltan datos"}, status=400)

    # Consultar la orden en Conekta
    headers = {
        "Accept": f"application/vnd.conekta-v2.1.0+json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.CONEKTA_API_KEY}"
    }

    url = f"https://api.conekta.io/orders/{order_id}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return Response({"error": "No se pudo obtener información de Conekta"}, status=400)

    orden = response.json()
    folio = None

    # Obtener el folio desde metadata o nombre del producto
    try:
        for item in orden["line_items"]["data"]:
            if "Folio" in item["name"]:
                folio = item["name"].split("Folio")[-1].strip()
                break
    except:
        return Response({"error": "No se pudo extraer el folio"}, status=400)

    if not folio:
        return Response({"error": "Folio no encontrado"}, status=400)

    try:
        transaccion = Transaccion.objects.get(folio=folio)
    except Transaccion.DoesNotExist:
        return Response({"error": "Transacción no encontrada"}, status=404)

    # Marcar como completada si no lo está
    if transaccion.estado != "completado":
        transaccion.estado = "completado"
        transaccion.save()

        BoletoSeleccionado.objects.filter(transaccion=transaccion).update(pagado=True)

    boletos = list(
        BoletoSeleccionado.objects.filter(transaccion=transaccion).values_list("numero", flat=True)
    )

    return Response({
        "success": True,
        "folio": transaccion.folio,
        "nombre": transaccion.nombre_completo,
        "correo": transaccion.correo,
        "telefono": transaccion.telefono,
        "metodo": transaccion.metodo_pago,
        "estado": transaccion.estado,
        "monto": transaccion.monto,
        "rifa": transaccion.rifa_nombre,
        "boletos": boletos,
        "fecha": transaccion.fecha_creacion,
        "total_boletos": transaccion.rifa.total_boletos if hasattr(transaccion, 'rifa') else 10000
    })
