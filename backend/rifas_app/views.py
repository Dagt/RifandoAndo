from rest_framework import viewsets, status
from collections import defaultdict
import traceback
import math
import random
import requests
import logging
from rest_framework.response import Response
from rifas_app.services import procesar_transaccion_completada, cancelar_transaccion_completa
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.timezone import now, timedelta, localtime, datetime,  get_current_timezone
from django.core.cache import cache
from django.db import transaction
from django.db.models import Sum, Count, Q, F, Avg
from django.db.models.functions import NullIf
from decimal import Decimal
from django.shortcuts import get_object_or_404
from datetime import timedelta
from django.conf import settings
from .models import Rifa, BoletoSeleccionado, Transaccion, Galeria, CodigoPromocional, CodigoUsado, ConfiguracionReferidos, LinkReferido, GaleriaExclusiva, RifaExclusiva, Jackpot, CajaSorpresa, BoletoJackpot, PremioCaja, TransaccionCaja, AperturaCaja
from .mercadopago_utils import crear_preferencia_pago
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from django.core.exceptions import ValidationError
from .serializers import RifaSerializer, RifaFinalizadaSerializer, ProximasRifasSerializer, TransaccionSerializer, CodigoPromocionalSerializer, RifaExclusivaSerializer, JackpotSerializer, TransaccionCajaSerializer, AperturaCajaSerializer
from rest_framework.decorators import (
    api_view,
    permission_classes,
    parser_classes
)
logger = logging.getLogger(__name__)
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
    logger = logging.getLogger(__name__)
    data = request.data
    campos_requeridos = [
        "nombre", "correo", "telefono", "nacimiento",
        "rifa_id", "boletos", "monto"
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

    tiempo_expiracion = timezone.now() + timedelta(hours=4)
    expires_at = int(tiempo_expiracion.timestamp())

    # Código promocional (si aplica)
    codigo_usado = None
    codigo_promocional = data.get("codigo_promocional")
    if codigo_promocional:
        try:
            promo = CodigoPromocional.objects.get(codigo=codigo_promocional)
            if promo.esta_activo():
                codigo_usado = CodigoUsado.objects.create(
                    codigo=promo,
                    telefono=telefono,
                    monto_generado=0  # Solo lo actualizaremos si se completa el pago
                )
        except CodigoPromocional.DoesNotExist:
            print("⚠️ Código promocional no encontrado")

    # Creamos la transacción pero no asignamos boletos aún
    transaccion = Transaccion.objects.create(
        nombre_completo=data["nombre"],
        correo=data["correo"],
        telefono=telefono,
        fecha_nacimiento=data["nacimiento"],
        monto=data["monto"],
        fecha_expiracion=tiempo_expiracion,
        rifa_nombre=rifa.nombre,
        codigo_usado = codigo_usado,
        codigo_referido=data.get("codigo_referido")
    )
    instrucciones = None

    try:
        instrucciones = crear_preferencia_pago(
            transaccion=transaccion,
            rifa=rifa,
            boletos_solicitados=boletos_solicitados,
            tiempo_expiracion=tiempo_expiracion
        )

        if instrucciones is None:
            transaccion.delete()
            return Response({"error": "No se pudieron generar las instrucciones de pago"}, status=400)

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

    except Exception as e:
        transaccion.delete()
        logger.error("❌ Error al generar la orden", exc_info=True)
        return Response({"error": f"Error al generar la orden: {str(e)}"}, status=400)

    response_data = {
        "success": True,
        "folio": transaccion.folio,
        "nombre": transaccion.nombre_completo,
        "telefono": transaccion.telefono,
        "correo": transaccion.correo,
        "fecha": transaccion.fecha_creacion,
        "expira_pago": expires_at,
        "monto": transaccion.monto,
        "rifa": transaccion.rifa_nombre,
        "boletos": boletos_solicitados,
        "total_boletos": rifa.total_boletos,
        "instrucciones": instrucciones
    }

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
        "fecha": transaccion.fecha_creacion,
        "expira_pago": int(transaccion.fecha_expiracion.timestamp()) if transaccion.fecha_expiracion else None,
        "boletos": list(boletos),
        "rifa": transaccion.rifa_nombre,
        "total_boletos": transaccion.boletos.first().rifa.total_boletos if transaccion.boletos.exists() else None,
        "es_premio": transaccion.es_premio,
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
@permission_classes([AllowAny])
def resumen_estadisticas(request):
    fecha_inicio = request.GET.get("fecha_inicio")
    fecha_fin = request.GET.get("fecha_fin")
    rifa_id = request.GET.get("rifa_id")

    rifas = Rifa.objects.all()
    transacciones = Transaccion.objects.filter(estado="completado")
    boletos = BoletoSeleccionado.objects.filter(pagado=True)

    if rifa_id:
        rifas = rifas.filter(id=rifa_id)
        transacciones = transacciones.filter(rifa_nombre__in=rifas.values_list("nombre", flat=True))
        boletos = boletos.filter(rifa__id=rifa_id)

    if fecha_inicio:
        transacciones = transacciones.filter(fecha_creacion__gte=fecha_inicio)
        boletos = boletos.filter(transaccion__fecha_creacion__gte=fecha_inicio)

    if fecha_fin:
        transacciones = transacciones.filter(fecha_creacion__lte=fecha_fin)
        boletos = boletos.filter(transaccion__fecha_creacion__lte=fecha_fin)

    transacciones_sin_premio = transacciones.filter(es_premio=False)

    activas = rifas.filter(estado='activa').count()
    en_espera = rifas.filter(estado='en_espera').count()
    finalizadas = rifas.filter(estado='finalizada').count()

    boletos_vendidos = boletos.count()
    boletos_regalados = BoletoSeleccionado.objects.filter(transaccion__es_premio=True, pagado=True).count()

    ingresos_totales = transacciones_sin_premio.aggregate(total=Sum("monto"))['total'] or 0

    transacciones_canceladas = Transaccion.objects.filter(estado="cancelado").count()
    transacciones_completadas = Transaccion.objects.filter(estado="completado").count()
    transacciones_totales = Transaccion.objects.count()

    boletos_por_rifa = rifas.annotate(
        vendidos=Count('boletoseleccionado', filter=Q(boletoseleccionado__pagado=True))
    ).values("nombre", "vendidos").order_by("-vendidos")

    rifas_por_mes = defaultdict(int)
    for r in rifas:
        mes = r.fecha_inicio.strftime("%Y-%m")
        rifas_por_mes[mes] += 1
    rifas_por_mes = dict(rifas_por_mes)

    porcentaje_por_tamano = defaultdict(lambda: {"vendidos": 0, "total": 0})
    for rifa in rifas:
        vendidos = rifa.boletoseleccionado_set.filter(pagado=True).count()
        porcentaje_por_tamano[rifa.total_boletos]["vendidos"] += vendidos
        porcentaje_por_tamano[rifa.total_boletos]["total"] += rifa.total_boletos

    porcentaje_vendidos = {
        str(k): round((v["vendidos"] / v["total"]) * 100, 2) if v["total"] else 0
        for k, v in porcentaje_por_tamano.items()
    }

    boletos_por_precio = (
        boletos
        .values(precio=F("rifa__precio_boleto"))
        .annotate(total=Count("id"))
    )
    total_vendidos = sum(b["total"] for b in boletos_por_precio)
    porcentaje_por_precio = {
        str(b["precio"]): round((b["total"] / total_vendidos) * 100, 2)
        for b in boletos_por_precio
    }

    ticket_promedio_raw = (
        transacciones_sin_premio
        .values("rifa_nombre")
        .annotate(
            total=Sum("monto"),
            cantidad=Count("id")
        )
    )

    ticket_promedio_por_rifa = [
        {"nombre": t["rifa_nombre"], "ticket_promedio": round(t["total"] / t["cantidad"], 2)}
        for t in ticket_promedio_raw if t["total"] and t["cantidad"]
    ]

    ahora = now()
    codigos = CodigoPromocional.objects.all()
    codigos_activos = codigos.filter(
        Q(fecha_expiracion__isnull=True) | Q(fecha_expiracion__gt=ahora),
        Q(usos_maximos__isnull=True) | Q(usos_actuales__lt=F("usos_maximos"))
    ).count()
    codigos_expirados = codigos.count() - codigos_activos

    codigos_agrupados = defaultdict(lambda: {
        "tipo": "",
        "usos": 0,
        "monto_generado": 0,
        "rifas_ids": set()
    })
    tipo_distribucion = defaultdict(int)
    ingresos_por_codigo = defaultdict(float)
    usos_por_codigo_por_mes = defaultdict(int)

    for cu in CodigoUsado.objects.select_related("codigo"):
        trans = Transaccion.objects.filter(codigo_usado=cu, estado="completado", es_premio=False).first()
        if not trans:
            continue
        codigo_txt = cu.codigo.codigo
        codigos_agrupados[codigo_txt]["tipo"] = cu.codigo.tipo
        codigos_agrupados[codigo_txt]["usos"] += 1
        codigos_agrupados[codigo_txt]["monto_generado"] += float(trans.monto or 0)
        codigos_agrupados[codigo_txt]["rifas_ids"].update(cu.codigo.rifas.values_list("id", flat=True))
        tipo_distribucion[cu.codigo.tipo] += 1
        ingresos_por_codigo[codigo_txt] += float(trans.monto or 0)
        mes = cu.fecha_uso.strftime("%Y-%m")
        usos_por_codigo_por_mes[mes] += 1

    ventas_por_rifa = (
        transacciones_sin_premio.values("rifa_nombre")
        .annotate(total=Sum("monto"))
    )
    ventas_por_rifa_dict = {v["rifa_nombre"]: float(v["total"] or 0) for v in ventas_por_rifa}

    codigos_resumen = []
    for codigo, datos in codigos_agrupados.items():
        monto_total_rifas = sum(
            ventas_por_rifa_dict.get(Rifa.objects.filter(id=rifa_id).first().nombre, 0)
            for rifa_id in datos["rifas_ids"]
        )
        porcentaje_rifa = round((float(datos["monto_generado"]) / monto_total_rifas) * 100, 2) if monto_total_rifas else 0
        codigos_resumen.append({
            "codigo": codigo,
            "tipo": datos["tipo"],
            "usos": datos["usos"],
            "monto_generado": datos["monto_generado"],
            "ticket_promedio": round(datos["monto_generado"] / datos["usos"], 2) if datos["usos"] else 0,
            "porcentaje_del_total": porcentaje_rifa
        })

    total_links_generados = LinkReferido.objects.count()
    total_links_usados = LinkReferido.objects.filter(usado=True).count()
    total_links_expirados = LinkReferido.objects.filter(usado=False, fecha_expiracion__lt=now()).count()
    porcentaje_conversion = (total_links_usados / total_links_generados * 100) if total_links_generados else 0

    ventas_generaron_link = (
        Transaccion.objects.filter(estado="completado", referidos_generados__isnull=False, es_premio=False)
        .aggregate(total=Sum('monto'))["total"] or 0
    )
    ventas_usando_link = (
        Transaccion.objects.filter(estado="completado", referral_usado__isnull=False, es_premio=False)
        .aggregate(total=Sum('monto'))["total"] or 0
    )
    proporcion_ventas = (ventas_usando_link / ventas_generaron_link * 100) if ventas_generaron_link else 0

    rifas_links = []
    for rifa in Rifa.objects.all():
        links_usados = LinkReferido.objects.filter(rifa=rifa, usado=True).count()
        ventas_con_link = (
            Transaccion.objects.filter(referral_usado__rifa=rifa, estado="completado", es_premio=False)
            .aggregate(total=Sum('monto'))["total"] or 0
        )
        ventas_totales_rifa = (
            Transaccion.objects.filter(rifa_nombre=rifa.nombre, estado="completado", es_premio=False)
            .aggregate(total=Sum('monto'))["total"] or 0
        )
        if ventas_totales_rifa > 0:
            rifas_links.append({
                "nombre_rifa": rifa.nombre,
                "usos": links_usados,
                "ventas_con_link": ventas_con_link,
                "ventas_totales": ventas_totales_rifa,
                "porcentaje_ventas_con_link": round((ventas_con_link / ventas_totales_rifa) * 100, 2)
            })

    rifas_links = sorted(rifas_links, key=lambda r: r["usos"], reverse=True)[:10]

    return Response({
        "activas": activas,
        "en_espera": en_espera,
        "finalizadas": finalizadas,
        "boletos_vendidos": boletos_vendidos,
        "boletos_regalados": boletos_regalados,
        "ingresos_totales": ingresos_totales,
        "codigos_activos": codigos_activos,
        "codigos_expirados": codigos_expirados,
        "total_generado_por_codigos": sum(c["monto_generado"] for c in codigos_resumen),
        "boletos_por_rifa": list(boletos_por_rifa),
        "rifas_por_mes": rifas_por_mes,
        "porcentaje_vendidos_por_tamano": porcentaje_vendidos,
        "porcentaje_por_precio": porcentaje_por_precio,
        "ticket_promedio_por_rifa": ticket_promedio_por_rifa,
        "top_rifas_mas_vendidas": list(boletos_por_rifa)[:10],
        "codigos_mas_usados": codigos_resumen,
        "distribucion_tipo_codigo": dict(tipo_distribucion),
        "ingresos_por_codigo": dict(ingresos_por_codigo),
        "usos_por_codigo_por_mes": dict(usos_por_codigo_por_mes),
        "transacciones_completadas": transacciones_completadas,
        "transacciones_canceladas": transacciones_canceladas,
        "transacciones_totales": transacciones_totales,
        "links_referidos": {
            "total_generados": total_links_generados,
            "total_usados": total_links_usados,
            "total_expirados": total_links_expirados,
            "porcentaje_conversion": round(porcentaje_conversion, 2)
        },
        "ventas_por_links": {
            "total_generaron_link": round(ventas_generaron_link, 2),
            "total_usando_link": round(ventas_usando_link, 2),
            "proporcion_ventas": round(proporcion_ventas, 2)
        },
        "uso_links_por_rifa": rifas_links,
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
@permission_classes([IsAuthenticated])
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
    except Rifa.DoesNotExist:
        return Response({"error": "Rifa no encontrada"}, status=404)

    serializer = RifaSerializer(rifa, context={"request": request})
    return Response(serializer.data)



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
    buscar = request.GET.get("buscar", "").strip()

    if estado:
        transacciones = transacciones.filter(estado__iexact=estado)

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


#Endpoint para completar transacciones manualmente
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def completar_transaccion(request, folio):
    tx = get_object_or_404(Transaccion, folio=folio)
    procesar_transaccion_completada(tx)
    return Response({"mensaje": "Transacción completada correctamente"})



#Endpoint para poder cancelar Transacciones
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def cancelar_transaccion(request, folio):
    try:
        transaccion = Transaccion.objects.get(folio=folio)
    except Transaccion.DoesNotExist:
        return Response({"error": "Transacción no encontrada."}, status=404)

    if not cancelar_transaccion_completa(transaccion):
        return Response({"error": "La transacción ya fue cancelada."}, status=400)

    return Response({
        "mensaje": "Transacción cancelada correctamente, boletos liberados, links y códigos revertidos si aplicaban."
    }, status=200)


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
            "estado_rifa": boleto.rifa.estado,
            "pagado": boleto.pagado,
            "folio": transaccion.folio,
            "nombre_completo": transaccion.nombre_completo,
            "correo": transaccion.correo,
            "telefono": transaccion.telefono,
            "estado_transaccion": transaccion.estado,
            "fecha_transaccion": transaccion.fecha_creacion,
        })

    if not resultados:
        return Response({"mensaje": "Boleto no ha sido vendido aún."}, status=200)

    return Response(resultados)

#Endpoint para validar codigos de promocion
@api_view(["POST"])
def validar_codigo(request):
    codigo_txt = request.data.get("codigo", "").strip()
    rifa_id = request.data.get("rifa_id")
    monto = float(request.data.get("monto", 0))

    if not all([codigo_txt, rifa_id]):
        return Response({"error": "Faltan datos para validar el código."}, status=400)

    try:
        codigo = CodigoPromocional.objects.get(codigo=codigo_txt)
    except CodigoPromocional.DoesNotExist:
        return Response({"valido": False, "razon": "Código no válido."}, status=200)

    if not codigo.esta_activo():
        return Response({"valido": False, "razon": "Este código ya expiró o alcanzó su límite de usos."}, status=200)

    if not codigo.rifas.filter(id=rifa_id).exists():
        return Response({"valido": False, "razon": "Este código no aplica para esta rifa."}, status=200)


    serializer = CodigoPromocionalSerializer(codigo)
    return Response({
        "valido": True,
        "detalle": serializer.data,
        "cumple_minimo": not codigo.compra_minima or monto >= float(codigo.compra_minima),
        "razon": None
    })

#Endpoint que regresa una lista de codigos promocionales
@api_view(["GET"])
def listar_codigos_promocionales(request):
    codigos = CodigoPromocional.objects.all().order_by("-id")
    serializer = CodigoPromocionalSerializer(codigos, many=True)
    return Response(serializer.data)

#Endpoint que se encarga de crear un nuevo codigo de promocion
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def crear_codigo_promocional(request):
    serializer = CodigoPromocionalSerializer(data=request.data)
    if serializer.is_valid():
        rifas_ids = request.data.get("rifas", [])

        # Si no se especifican rifas, se asignan todas las activas
        if not rifas_ids:
            rifas = Rifa.objects.filter(estado="activa")
        else:
            rifas = Rifa.objects.filter(id__in=rifas_ids)

        # Limpiamos los datos validados para evitar conflicto al crear el objeto
        validated_data = serializer.validated_data.copy()
        validated_data.pop("rifas", None)

        codigo = CodigoPromocional(**validated_data)

        try:
            codigo.full_clean()  # validación del modelo
            codigo.save()
            codigo.rifas.set(rifas)  # ahora sí, establecemos las rifas
            return Response(CodigoPromocionalSerializer(codigo).data, status=201)
        except ValidationError as e:
            return Response({"error": e.message_dict}, status=400)

    return Response(serializer.errors, status=400)

#Endpoint para pausar un codigo promocional
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_codigo_pausado(request, codigo_id):
    try:
        codigo = CodigoPromocional.objects.get(id=codigo_id)
        codigo.pausado = not codigo.pausado
        codigo.save()
        return Response({"id": codigo.id, "pausado": codigo.pausado})
    except CodigoPromocional.DoesNotExist:
        return Response({"error": "Código no encontrado."}, status=404)

#Endpoint para consultar la configuracion del programa de referidos
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_configuracion_referidos(request):
    try:
        configuracion, _ = ConfiguracionReferidos.objects.get_or_create(id=1)  # 👈 así
        data = {
            "activo": configuracion.activo,
            "monto_minimo_para_generar": float(configuracion.monto_minimo_para_generar),
            "monto_minimo_para_validar": float(configuracion.monto_minimo_para_validar),
            "permitir_cadena_referidos": configuracion.permitir_cadena_referidos,
            "reglas_premios": configuracion.reglas_premios,
        }
        return Response(data)

    except Exception as e:
        return Response({"error": str(e)}, status=500)



#Endpoint para actualizar la configuracion del programa de referidos
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def actualizar_configuracion_referidos(request):
    try:
        # 🔥 Este get_or_create garantiza que SIEMPRE haya una configuración
        configuracion, _ = ConfiguracionReferidos.objects.get_or_create(id=1)

        data = request.data

        configuracion.activo = data.get("activo", configuracion.activo)
        configuracion.monto_minimo_para_generar = data.get("monto_minimo_para_generar", configuracion.monto_minimo_para_generar)
        configuracion.monto_minimo_para_validar = data.get("monto_minimo_para_validar", configuracion.monto_minimo_para_validar)
        configuracion.permitir_cadena_referidos = data.get("permitir_cadena_referidos", configuracion.permitir_cadena_referidos)
        configuracion.reglas_premios = data.get("reglas_premios", configuracion.reglas_premios)

        configuracion.save()

        return Response({"success": True, "mensaje": "Configuración actualizada correctamente."})

    except Exception as e:
        return Response({"error": str(e)}, status=500)



# ---- Toggle "activo" o "permitir_cadena_referidos" ----
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_campo_referidos(request, campo):
    try:
        config = ConfiguracionReferidos.objects.first()
        if not config:
            return Response({"error": "Configuración no encontrada."}, status=404)

        if campo not in ["activo", "permitir_cadena_referidos"]:
            return Response({"error": "Campo inválido."}, status=400)

        valor_actual = getattr(config, campo)
        setattr(config, campo, not valor_actual)
        config.save()
        return Response({"success": True, "nuevo_valor": getattr(config, campo)})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ---- Actualizar montos mínimos referidos----
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def actualizar_minimos_referidos(request):
    try:
        config = ConfiguracionReferidos.objects.first()
        if not config:
            return Response({"error": "Configuración no encontrada."}, status=404)

        monto_generar = request.data.get("monto_minimo_para_generar")
        monto_validar = request.data.get("monto_minimo_para_validar")

        if monto_generar is not None:
            config.monto_minimo_para_generar = monto_generar
        if monto_validar is not None:
            config.monto_minimo_para_validar = monto_validar

        config.save()
        return Response({"success": True})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ---- Agregar nueva regla referidos ----
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def agregar_regla_referidos(request):
    try:
        config = ConfiguracionReferidos.objects.first()
        if not config:
            return Response({"error": "Configuración no encontrada."}, status=404)

        monto_minimo = request.data.get("monto_minimo")
        boletos_regalo = request.data.get("boletos_regalo")

        if monto_minimo is None or boletos_regalo is None:
            return Response({"error": "Datos incompletos."}, status=400)

        nuevas_reglas = config.reglas_premios or []
        nuevas_reglas.append({"monto_minimo": monto_minimo, "boletos_regalo": boletos_regalo})
        nuevas_reglas = sorted(nuevas_reglas, key=lambda x: x["monto_minimo"])

        config.reglas_premios = nuevas_reglas
        config.save()

        return Response({"success": True, "reglas_premios": config.reglas_premios})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ---- Eliminar regla existente referidos----
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def eliminar_regla_referidos(request):
    try:
        config = ConfiguracionReferidos.objects.first()
        if not config:
            return Response({"error": "Configuración no encontrada."}, status=404)

        indice = request.data.get("indice")
        if indice is None:
            return Response({"error": "No se especificó índice."}, status=400)

        reglas_actuales = config.reglas_premios or []

        if not (0 <= indice < len(reglas_actuales)):
            return Response({"error": "Índice fuera de rango."}, status=400)

        reglas_actuales.pop(indice)
        config.reglas_premios = reglas_actuales
        config.save()

        return Response({"success": True, "reglas_premios": config.reglas_premios})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


#Endpoint para regresar listado de todos los links de referidos
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def listar_links_referidos(request):
    try:
        links = LinkReferido.objects.select_related('transaccion_origen', 'rifa', 'transaccion_usada').order_by('-fecha_creacion')
        paginator = PageNumberPagination()
        paginator.page_size = 10

        resultado = paginator.paginate_queryset(links, request)

        data = []
        for link in resultado:
            try:
                data.append({
                    "id": link.id,
                    "folio_transaccion": link.transaccion_origen.folio if link.transaccion_origen else "—",
                    "nombre_cliente": link.transaccion_origen.nombre_completo if link.transaccion_origen else "—",
                    "nombre_rifa": link.rifa.nombre if link.rifa else "—",
                    "codigo": link.codigo,
                    "vence": localtime(link.fecha_expiracion).isoformat() if link.fecha_expiracion else "—",
                    "usado": link.usado,
                    "expirado": link.expirado,
                    "folio_usado": link.transaccion_usada.folio if link.transaccion_usada else "—",
                })
            except Exception as e:
                print(f"❌ Error procesando link ID {link.id}: {str(e)}")  # <- Este log

        return paginator.get_paginated_response(data)

    except Exception as e:
        print(f"❌ Error general en listar_links_referidos: {str(e)}")  # <- Este log
        return Response({"error": str(e)}, status=500)


#Endpoint para invalidar links de referidos manualmente
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def invalidar_link_referido(request, link_id):
    try:
        link = LinkReferido.objects.get(id=link_id)
        if link.usado:
            return Response({"error": "El link ya estaba marcado como usado."}, status=400)

        link.usado = True
        link.fecha_expiracion = timezone.now()
        link.save()

        return Response({"success": True, "mensaje": "Link invalidado correctamente."})
    except LinkReferido.DoesNotExist:
        return Response({"error": "Link no encontrado."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


#Endpoint para validar links de referidos
@api_view(['GET'])
@permission_classes([AllowAny])
def usar_link_referido(request, codigo):
    with transaction.atomic():
        try:
            link = LinkReferido.objects.select_for_update().select_related('rifa').get(codigo=codigo)
        except LinkReferido.DoesNotExist:
            return Response({
                "success": False,
                "mensaje": "El link de referido es inválido o no existe."
            }, status=404)

        if link.usado:
            return Response({
                "success": False,
                "mensaje": "Este link de referido ya fue usado."
            }, status=400)

        if timezone.now() > link.fecha_expiracion:
            return Response({
                "success": False,
                "mensaje": "Este link de referido ha expirado."
            }, status=400)

        rifa = link.rifa

        # Obtener las URLs absolutas de las imágenes
        request = request  # Asegurar que tenemos el request
        imagenes_urls = []
        if hasattr(rifa, 'imagenes'):
            imagenes = rifa.imagenes.all()
            for img in imagenes:
                if img.imagen:
                    imagenes_urls.append(request.build_absolute_uri(img.imagen.url))

        # Calcular boletos disponibles
        boletos_vendidos = rifa.boletoseleccionado_set.count()
        boletos_disponibles = rifa.total_boletos - boletos_vendidos

        return Response({
            "success": True,
            "mensaje": "¡Bienvenido! Has entrado con un link de referido.",
            "rifa": {
                "id": rifa.id,
                "nombre": rifa.nombre,
                "descripcion": rifa.descripcion,
                "precio_boleto": rifa.precio_boleto,
                "total_boletos": rifa.total_boletos,
                "boletos_disponibles": boletos_disponibles,
                "fecha_fin": rifa.fecha_fin,
                "imagenes": imagenes_urls
            },
            "codigo_referido": link.codigo
        }, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def consultar_pagos(request):
    folio = request.GET.get("folio")

    if not folio:
        return Response({"error": "Folio no proporcionado."}, status=400)

    try:
        tx = Transaccion.objects.get(folio=folio)
    except Transaccion.DoesNotExist:
        return Response({"error": "Transacción no encontrada."}, status=404)

    if not tx.payment_id:
        return Response({
            "folio": tx.folio,
            "estado": tx.estado,
            "payment_id": None,
            "mensaje": "Transacción sin payment_id (posiblemente colgada)."
        }, status=200)

    # Consultar a Mercado Pago
    url = f"https://api.mercadopago.com/v1/payments/{tx.payment_id}"
    headers = {
        "Authorization": f"Bearer {settings.MERCADO_PAGO_ACCESS_TOKEN}"
    }
    r = requests.get(url, headers=headers)

    if r.status_code != 200:
        return Response({"error": "No se pudo obtener información desde Mercado Pago."}, status=502)

    pago = r.json()
    return Response({
        "folio": tx.folio,
        "payment_id": tx.payment_id,
        "estado_interno": tx.estado,
        "estado_mp": pago.get("status"),
        "detalle_status_mp": pago.get("status_detail"),
        "tipo_pago": pago.get("payment_type_id"),
        "metodo_pago": pago.get("payment_method_id"),
        "referencia": pago.get("transaction_details", {}).get("payment_method_reference_id"),
        "fecha_creacion": pago.get("date_created"),
        "fecha_aprobacion": pago.get("date_approved"),
        "fecha_expiracion": pago.get("date_of_expiration"),
        "monto_total": pago.get("transaction_amount"),
        "neto_recibido": pago.get("transaction_details", {}).get("net_received_amount"),
        "link_ticket": pago.get("transaction_details", {}).get("external_resource_url"),
        "acreditado": pago.get("status") == "approved",
        "cancelado": pago.get("status") in ["cancelled", "rejected", "expired"],
    }, status=200)


#Endpoint con la simulacion y estructura de las Cajas Sorpresa.
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def simular_caja_sorpresa(request):
    try:
        valor_premio = float(request.data.get("valorPremio"))
        boletos_totales = int(request.data.get("boletosTotales"))
        precio_caja = float(request.data.get("precioCaja"))
        drop_deseado = float(request.data.get("dropDeseado", 2.5)) / 100
        porcentaje_jackpot = float(request.data.get("porcentajeJackpot", 10)) / 100

        if not valor_premio or not boletos_totales or not precio_caja:
            return Response({"error": "Faltan datos requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        # ⚠️ NUEVO: Usa los premios que manda el frontend (si existen)
        modelo_premios = request.data.get("premios")
        if not modelo_premios:
            modelo_premios = [
            {"nombre": "🎟️ Boleto exclusivo", "valor_relativo": 1.0, "drop": drop_deseado},
            {"nombre": "🎫 Boletos económicos (≤30%)", "valor_relativo": 0.3, "drop": 0.20},
            {"nombre": "🎫 Boletos intermedios (≤50%)", "valor_relativo": 0.5, "drop": 0.15},
            {"nombre": "🎫 Boletos raros (≤65%)", "valor_relativo": 0.65, "drop": 0.08},

            {"nombre": "🎁 Descuento 5%", "valor_relativo": 0.0, "drop": 0.12},
            {"nombre": "🎁 Descuento 10%", "valor_relativo": 0.0, "drop": 0.10},
            {"nombre": "🎁 Descuento 15%", "valor_relativo": 0.0, "drop": 0.06},
            {"nombre": "🎁 Descuento 20%", "valor_relativo": 0.0, "drop": 0.04},
            {"nombre": "🎁 Descuento 30%", "valor_relativo": 0.0, "drop": 0.02},

            {"nombre": "🧩 Código coleccionable", "valor_relativo": 0.0, "drop": 0.05},
            {"nombre": "🧧 Caja gratis", "valor_relativo": 1.0, "drop": drop_deseado},
            {"nombre": "🎫 +2 boletos para Jackpot", "valor_relativo": 0.0, "drop": 0.04},
            {"nombre": "🎫 +3 boletos para Jackpot", "valor_relativo": 0.0, "drop": 0.02},
            {"nombre": "— Sin premio visible (solo boleto para Jackpot)", "valor_relativo": 0.0, "drop": 1.0}
        ]

        # Costo promedio de premios menores
        costo_premio_menor = sum([
            precio_caja * p["valor_relativo"] * p["drop"]
            for p in modelo_premios if p["valor_relativo"] > 0
        ])

        # Escenario 1: Rentabilidad mínima
        cajas_para_liberar = math.ceil(boletos_totales / drop_deseado)
        probabilidad_boleto = boletos_totales / cajas_para_liberar
        ingreso_liberar = cajas_para_liberar * precio_caja
        ingreso_neto_liberar = ingreso_liberar * (1 - porcentaje_jackpot)
        utilidad_liberar = ingreso_neto_liberar - valor_premio - (cajas_para_liberar * costo_premio_menor)

        total_costo = valor_premio + cajas_para_liberar * costo_premio_menor
        cajas_para_rentabilidad = math.ceil(total_costo / precio_caja)
        ingreso_rentabilidad = cajas_para_rentabilidad * precio_caja
        utilidad_rentabilidad = ingreso_rentabilidad - valor_premio - (cajas_para_rentabilidad * costo_premio_menor)

        # Escenario 2: Punto medio realista
        cajas_punto_medio = math.ceil((cajas_para_rentabilidad + cajas_para_liberar) / 2)
        ingreso_punto_medio = (ingreso_rentabilidad + ingreso_liberar) / 2
        jackpot_punto_medio = ingreso_punto_medio * porcentaje_jackpot
        ingreso_neto_medio = ingreso_punto_medio - jackpot_punto_medio
        utilidad_punto_medio = (utilidad_rentabilidad + utilidad_liberar) / 2

        return Response({
            "dropUsado": drop_deseado,
            "precioCaja": precio_caja,
            "costoPremioMenor": round(costo_premio_menor, 2),

            "cajasParaRentabilidad": cajas_para_rentabilidad,
            "ingresoRentabilidad": round(ingreso_rentabilidad, 2),
            "utilidadRentabilidad": round(utilidad_rentabilidad, 2),

            "cajasParaLiberarTodos": cajas_para_liberar,
            "ingresoTodosBoletos": round(ingreso_liberar, 2),
            "ingresoNetoLiberar": round(ingreso_neto_liberar, 2),
            "utilidadNetaLiberar": round(utilidad_liberar, 2),
            "probabilidadBoleto": round(probabilidad_boleto, 4),

            "escenarioPuntoMedio": {
                "cajas": cajas_punto_medio,
                "ingreso": round(ingreso_punto_medio, 2),
                "jackpot": round(jackpot_punto_medio, 2),
                "utilidad": round(utilidad_punto_medio, 2),
            },

            "modeloPremios": modelo_premios
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)

#Endpoint para cargar imagenes a la galeria de rifas exclusivas
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def subir_imagen_rifa_exclusiva(request, rifa_id):
    try:
        rifa = RifaExclusiva.objects.get(id=rifa_id)
    except RifaExclusiva.DoesNotExist:
        return Response({"error": "Rifa exclusiva no encontrada"}, status=404)

    imagen = request.FILES.get("imagen")
    if not imagen:
        return Response({"error": "No se recibió imagen"}, status=400)

    GaleriaExclusiva.objects.create(rifa_exclusiva=rifa, imagen=imagen)
    return Response({"success": True})

#Endpoint para crear Rifas exclusivas
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def crear_rifa_exclusiva(request):
    data = request.data

    campos = ["nombre", "descripcion", "total_boletos", "valor_premio"]
    if not all(k in data and data[k] for k in campos):
        return Response({"error": "Faltan campos obligatorios"}, status=400)

    try:
        with transaction.atomic():
            # Crear rifa exclusiva sin asignar aún el Jackpot
            rifa = RifaExclusiva.objects.create(
                nombre=data["nombre"],
                descripcion=data["descripcion"],
                total_boletos=data["total_boletos"],
                valor_premio=data["valor_premio"],
                enlace_video=data.get("enlace_video", None)
            )

            # Crear el Jackpot ligado a la rifa exclusiva
            jackpot = Jackpot.objects.create(rifa_exclusiva=rifa)

            # Asignar el Jackpot a la rifa (OneToOne bidireccional)
            rifa.jackpot = jackpot
            rifa.save()

        return Response({"success": True, "id": rifa.id})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

#Endpoint para listar las rifas Exclusivas
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def listar_rifas_exclusivas(request):
    rifas = RifaExclusiva.objects.all().order_by("-fecha_creacion")

    buscar = request.GET.get("buscar", "")
    if buscar:
        rifas = rifas.filter(nombre__icontains=buscar)

    finalizada_param = request.GET.get("finalizada")
    if finalizada_param == "true":
        rifas = rifas.filter(finalizada=True)
    elif finalizada_param == "false":
        rifas = rifas.filter(finalizada=False)

    paginator = PageNumberPagination()
    paginator.page_size = 10
    result_page = paginator.paginate_queryset(rifas, request)
    serializer = RifaExclusivaSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


#Endpoint para editar las rifas exclusivas
# views.py
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def editar_rifa_exclusiva(request, rifa_id):
    try:
        rifa = RifaExclusiva.objects.get(id=rifa_id)
    except RifaExclusiva.DoesNotExist:
        return Response({"error": "Rifa no encontrada"}, status=404)

    data = request.data

    campos_editables = [
        "nombre", "descripcion", "numero_ganador", "enlace_video", "permitir_finalizacion_por_valor"
    ]

    for campo in campos_editables:
        if campo in data:
            setattr(rifa, campo, data[campo])

    # Solo permitir editar numero_ganador y enlace_video si está finalizada
    if not rifa.finalizada and ("numero_ganador" in data or "enlace_video" in data):
        return Response({"error": "Solo puedes asignar número ganador o video si la rifa está finalizada."}, status=400)

    # Actualizar boleto ganador del jackpot si viene en la petición
    if "id_boleto_jackpot" in data:
        try:
            boleto = BoletoJackpot.objects.get(id=data["id_boleto_jackpot"])
            if boleto.jackpot != rifa.jackpot:
                return Response({"error": "Ese boleto no pertenece al Jackpot de esta rifa."}, status=400)
            rifa.jackpot.ganador = boleto
            rifa.jackpot.save()
        except BoletoJackpot.DoesNotExist:
            return Response({"error": "Boleto de Jackpot no encontrado."}, status=404)

    rifa.save()
    return Response({"success": True})


#Endpoint para obtener una rifa Exclusiva especifica
# views.py
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_rifa_exclusiva(request, rifa_id):
    try:
        rifa = RifaExclusiva.objects.get(id=rifa_id)
    except RifaExclusiva.DoesNotExist:
        return Response({"error": "Rifa no encontrada"}, status=404)

    data = {
        "id": rifa.id,
        "nombre": rifa.nombre,
        "descripcion": rifa.descripcion,
        "total_boletos": rifa.total_boletos,
        "numero_ganador": rifa.numero_ganador,
        "valor_premio": float(rifa.valor_premio),
        "enlace_video": rifa.enlace_video,
        "fecha_creacion": rifa.fecha_creacion,
        "finalizada": rifa.finalizada,
        "permitir_finalizacion_por_valor": rifa.permitir_finalizacion_por_valor,
        "id_boleto_jackpot": rifa.jackpot.ganador.id if rifa.jackpot and rifa.jackpot.ganador else None,
    }

    return Response(data)

#Endpoint que regresa la rifa Exclusiva activa en el momento
@api_view(["GET"])
@permission_classes([AllowAny])
def rifa_exclusiva_activa(request):
    try:
        rifa = (
            RifaExclusiva.objects
            .filter(finalizada=False)
            .annotate(boletos_encontrados=Count("boletos", filter=Q(boletos__asignado=True)))
            .latest("fecha_creacion")
        )
        jackpot = Jackpot.objects.get(rifa_exclusiva=rifa)

        data = {
            "rifa": RifaExclusivaSerializer(rifa).data,
            "jackpot": JackpotSerializer(jackpot).data,
        }
        return Response(data)
    except RifaExclusiva.DoesNotExist:
        return Response({"rifa": None, "jackpot": None})
    except Jackpot.DoesNotExist:
        return Response({"rifa": RifaExclusivaSerializer(rifa).data, "jackpot": None})

#Endpoint para crear una caja sorpresa
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def crear_caja_sorpresa(request):
    try:
        rifa = RifaExclusiva.objects.filter(finalizada=False).latest("fecha_creacion")
    except RifaExclusiva.DoesNotExist:
        return Response({"error": "No hay rifa activa"}, status=400)

    data = request.data

    # Eliminar cualquier caja anterior asociada a esta rifa para evitar duplicados
    CajaSorpresa.objects.filter(rifa_exclusiva=rifa).delete()

    try:
        with transaction.atomic():
            caja = CajaSorpresa.objects.create(
                rifa_exclusiva=rifa,
                precio=data["precio"],
                porcentaje_jackpot=data["porcentaje_jackpot"],
                drop_boleto_exclusivo=data["drop_boleto_exclusivo"],
                permite_ajustes_dinamicos=True
            )

            for premio in data["premios"]:
                PremioCaja.objects.create(
                    caja=caja,
                    nombre=premio["nombre"],
                    valor_relativo=premio["valor_relativo"],
                    drop=premio["drop"]
                )

        return Response({"success": True})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

#Endpoint para obtener la config de la caja actual
@api_view(["GET"])
@permission_classes([AllowAny])
def obtener_caja_actual(request):
    try:
        rifa = RifaExclusiva.objects.filter(finalizada=False).latest("fecha_creacion")
        caja = CajaSorpresa.objects.get(rifa_exclusiva=rifa)
        premios = list(caja.premios.values("nombre", "drop", "valor_relativo"))

        return Response({
            "precio": float(caja.precio),
            "porcentaje_jackpot": caja.porcentaje_jackpot,
            "drop_boleto_exclusivo": caja.drop_boleto_exclusivo,
            "valor_premio": float(rifa.valor_premio),
            "total_boletos": rifa.total_boletos,
            "premios": premios
        })

    except (RifaExclusiva.DoesNotExist, CajaSorpresa.DoesNotExist):
        return Response({"error": "No hay caja activa"}, status=404)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def actualizar_premios_caja(request):
    try:
        rifa = RifaExclusiva.objects.filter(finalizada=False).latest("fecha_creacion")
        caja = CajaSorpresa.objects.get(rifa_exclusiva=rifa)

        # Eliminar premios anteriores
        caja.premios.all().delete()

        # Agregar nuevos premios desde el frontend
        for premio in request.data.get("premios", []):
            PremioCaja.objects.create(
                caja=caja,
                nombre=premio["nombre"],
                valor_relativo=premio["valor_relativo"],
                drop=premio["drop"]
            )

        return Response({"success": True})
    except RifaExclusiva.DoesNotExist:
        return Response({"error": "No hay rifa activa"}, status=400)
    except CajaSorpresa.DoesNotExist:
        return Response({"error": "No hay caja creada aún"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


#Endpoint para listar transacciones exclusivas
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def listar_transacciones_caja(request):
    pagina = request.query_params.get("page", 1)
    buscar = request.query_params.get("buscar", "").strip()
    estado = request.query_params.get("estado", "").lower()

    transacciones = TransaccionCaja.objects.all().order_by("-fecha_creacion")

    if buscar:
        transacciones = transacciones.filter(
            Q(folio__icontains=buscar) |
            Q(anon_id__icontains=buscar) |
            Q(nombre_completo__icontains=buscar)
        )

    if estado:
        transacciones = transacciones.filter(estado__iexact=estado)


    paginator = PageNumberPagination()
    paginator.page_size = 10
    resultado_paginado = paginator.paginate_queryset(transacciones, request)

    data_final = []
    for trans in resultado_paginado:
        aperturas = AperturaCaja.objects.filter(transaccion=trans)
        premios = [
            {
                "nombre": ap.premio_nombre,
                "valor": ap.valor,
                "boleto_exclusivo": ap.fue_boleto_exclusivo,
                "jackpot": ap.fue_jackpot
            } for ap in aperturas
        ]

        data_final.append({
            **TransaccionCajaSerializer(trans).data,
            "aperturas": premios,
        })

    return paginator.get_paginated_response(data_final)