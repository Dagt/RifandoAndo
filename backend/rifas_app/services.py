import random, logging
from datetime import timedelta
from django.db import transaction as db_tx
from django.utils import timezone
from rifas_app.models import (
    BoletoSeleccionado, ConfiguracionReferidos, LinkReferido,
    Transaccion, CodigoPromocional, CodigoUsado
)
from rifas_app.emails import (
    enviar_correo_boletos_regalo, enviar_correo_confirmacion_compra
)

log = logging.getLogger(__name__)

@db_tx.atomic
def procesar_transaccion_completada(transaccion: Transaccion) -> None:
    if transaccion.estado == "completado":
        return

    configuracion = ConfiguracionReferidos.objects.first()

    # Marcar transacción como completada
    transaccion.estado = "completado"
    transaccion.save()

    # Marcar boletos como pagados y no apartados
    BoletoSeleccionado.objects.filter(transaccion=transaccion).update(pagado=True, apartado=False)

    # Procesar referidos si existe un código de referido
    if transaccion.codigo_referido:
        try:
            with db_tx.atomic():
                link = LinkReferido.objects.select_for_update().select_related('transaccion_origen').get(codigo=transaccion.codigo_referido)

                if not link.usado:
                    if configuracion and transaccion.monto >= configuracion.monto_minimo_para_validar:
                        transaccion_origen = link.transaccion_origen

                        link.usado = True
                        link.transaccion_usada = transaccion
                        link.save()

                        boletos_ocupados = BoletoSeleccionado.objects.filter(rifa=link.rifa).values_list('numero', flat=True)
                        todos_los_numeros = set(range(1, link.rifa.total_boletos + 1))
                        numeros_disponibles = list(todos_los_numeros - set(boletos_ocupados))
                        numeros_disponibles.sort()

                        if numeros_disponibles:
                            boletos_a_regalar = 1
                            reglas = sorted(configuracion.reglas_premios, key=lambda x: x['monto_minimo'], reverse=True) if configuracion and configuracion.reglas_premios else []

                            for regla in reglas:
                                if transaccion.monto >= regla['monto_minimo']:
                                    boletos_a_regalar = regla['boletos_regalo']
                                    break

                            boletos_a_regalar = min(boletos_a_regalar, len(numeros_disponibles))
                            random.shuffle(numeros_disponibles)

                            nueva_transaccion = Transaccion.objects.create(
                                nombre_completo=transaccion_origen.nombre_completo,
                                correo=transaccion_origen.correo,
                                telefono=transaccion_origen.telefono,
                                fecha_nacimiento=transaccion_origen.fecha_nacimiento,
                                monto=0,
                                estado='completado',
                                rifa_nombre=link.rifa.nombre,
                                es_premio=True
                            )

                            link.transaccion_premio = nueva_transaccion
                            link.save()

                            for _ in range(boletos_a_regalar):
                                numero = numeros_disponibles.pop(0)
                                BoletoSeleccionado.objects.create(
                                    rifa=link.rifa,
                                    transaccion=nueva_transaccion,
                                    numero=numero,
                                    pagado=True,
                                    apartado=False
                                )
                            log.info(f"🎁 Se asignaron {boletos_a_regalar} boletos de regalo a {transaccion_origen.nombre_completo}")
                            try:
                                boletos_asignados = list(
                                    BoletoSeleccionado.objects.filter(transaccion=nueva_transaccion)
                                    .values_list('numero', flat=True)
                                )
                                digitos = len(str(link.rifa.total_boletos - 1))
                                boletos_formateados = [str(n).zfill(digitos) for n in boletos_asignados]

                                enviar_correo_boletos_regalo(
                                    transaccion_origen,
                                    link.rifa.nombre,
                                    boletos_formateados,
                                    nueva_transaccion.folio,
                                    transaccion.nombre_completo
                                )
                            except Exception as e:
                                log.warning(f"⚠️ Error al enviar correo de boletos de regalo: {e}")
                        else:
                            log.warning(f"❌ No se encontraron boletos disponibles para asignar premio.")
                    else:
                        log.info(f"⚠️ El comprador no cumplió el monto mínimo para premio. Link sigue disponible.")
        except LinkReferido.DoesNotExist:
            log.warning(f"⚠️ No se encontró LinkReferido con código {transaccion.codigo_referido}")
        except Exception as e:
            log.error(f"❌ Error procesando premios de referido: {str(e)}")

    # Registrar uso de código promocional si aplica
    if transaccion.codigo_usado:
        try:
            transaccion.codigo_usado.fecha_uso = timezone.now()
            transaccion.codigo_usado.save()
            codigo = transaccion.codigo_usado.codigo
            codigo.usos_actuales = (codigo.usos_actuales or 0) + 1
            codigo.save()
        except Exception as e:
            log.warning(f"❌ Error registrando uso de código promocional: {e}")

    # Crear Link de Referido si aplica
    link_url = None
    try:
        if configuracion and configuracion.activo:
            cumple_monto = transaccion.monto >= configuracion.monto_minimo_para_generar
            permitir_cadena = configuracion.permitir_cadena_referidos if configuracion.permitir_cadena_referidos is not None else False

            puede_generar_link = False
            if cumple_monto:
                if not transaccion.codigo_referido:
                    puede_generar_link = True
                elif permitir_cadena:
                    puede_generar_link = True

            if puede_generar_link:
                if not LinkReferido.objects.filter(transaccion_origen=transaccion).exists():
                    primera_rifa = transaccion.boletos.first().rifa if transaccion.boletos.exists() else None
                    if primera_rifa:
                        link_obj = LinkReferido.objects.create(
                            transaccion_origen=transaccion,
                            rifa=primera_rifa,
                            fecha_creacion=timezone.now(),
                            fecha_expiracion=timezone.now() + timedelta(days=1),
                        )
                        link_url = f"https://www.rifandoando.club/usar-link/{link_obj.codigo}/"
                        log.info(f"✅ Link generado: {link_url}")
            else:
                if not cumple_monto:
                    log.info(f"⛔️ No se generó link: No cumplió monto mínimo (${configuracion.monto_minimo_para_generar})")
                elif transaccion.codigo_referido and not permitir_cadena:
                    log.info(f"🔒 No se generó link: Usó referido y no se permiten cadenas")
    except Exception as e:
        log.warning(f"⚠️ Error al crear link de referido: {e}")

    # Enviar correo de confirmación
    try:
        boletos_pagados = list(
            BoletoSeleccionado.objects.filter(transaccion=transaccion, pagado=True)
            .values_list('numero', flat=True)
        )
        rifa = transaccion.boletos.first().rifa if transaccion.boletos.exists() else None
        if rifa:
            digitos = len(str(rifa.total_boletos - 1))
            boletos_formateados = [str(n).zfill(digitos) for n in boletos_pagados]
        else:
            boletos_formateados = [str(n) for n in boletos_pagados]
        enviar_correo_confirmacion_compra(
            transaccion,
            boletos_formateados,
            link_url,
            configuracion.monto_minimo_para_validar if configuracion else None
        )

    except Exception as e:
        log.error(f"⚠️ Error al enviar correo de confirmación: {e}")
