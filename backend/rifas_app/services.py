import logging, random
from django.db import transaction as db_tx
from django.utils import timezone
from datetime import timedelta
from rifas_app.utils import enviar_sms_pago_exitoso, enviar_sms_pago_creado
from rifas_app.models import (
    BoletoSeleccionado, ConfiguracionReferidos, LinkReferido,
    Transaccion, CodigoPromocional
)
from rifas_app.emails import (
    enviar_correo_boletos_regalo, enviar_correo_confirmacion_compra
)

log = logging.getLogger(__name__)

@db_tx.atomic
def procesar_transaccion_completada(tx: Transaccion, tipo_pago=None):
    """
    Marca la transacción como completada y ejecuta TODA la lógica
    (boletos, referidos, correos…).  Es idempotente.
    """

    tx = Transaccion.objects.select_for_update().get(id=tx.id)
    if tx.estado in ["completado", "cancelado"]:
        return

    cfg = ConfiguracionReferidos.objects.first()

    # ── 1. Cambiar estado ────────────────────────────────
    tx.estado = "completado"
    tx.save(update_fields=["estado"])

    # ── 2. Boletos pagados ───────────────────────────────
    BoletoSeleccionado.objects.filter(
        transaccion=tx
    ).update(pagado=True, apartado=False)

    # ── 3. Premios por referido ──────────────────────────
    if tx.codigo_referido:
        try:
            with transaction.atomic():
                link = (
                    LinkReferido.objects.select_for_update()
                    .select_related("transaccion_origen", "rifa")
                    .get(codigo=tx.codigo_referido)
                )

                if link.usado or not cfg or tx.monto < cfg.monto_minimo_para_validar:
                    raise Exception("No cumple para premio referidos")

                link.usado = True
                link.transaccion_usada = tx
                link.save()

                # Boletos disponibles
                boletos_ocupados = BoletoSeleccionado.objects.filter(
                    rifa=link.rifa
                ).values_list("numero", flat=True)
                disponibles = sorted(
                    set(range(1, link.rifa.total_boletos + 1)) - set(boletos_ocupados)
                )
                if not disponibles:
                    raise Exception("Sin boletos libres para premio")

                # ¿Cuántos regalar?
                boletos_a_regalar = 1
                for regla in sorted(cfg.reglas_premios, key=lambda r: r["monto_minimo"], reverse=True):
                    if tx.monto >= regla["monto_minimo"]:
                        boletos_a_regalar = regla["boletos_regalo"]
                        break
                boletos_a_regalar = min(boletos_a_regalar, len(disponibles))
                random.shuffle(disponibles)

                # Transacción “premio”
                origen = link.transaccion_origen
                nueva_tx = Transaccion.objects.create(
                    nombre_completo=origen.nombre_completo,
                    correo=origen.correo,
                    telefono=origen.telefono,
                    fecha_nacimiento=origen.fecha_nacimiento,
                    monto=0,
                    estado="completado",
                    rifa_nombre=link.rifa.nombre,
                    es_premio=True
                )
                link.transaccion_premio = nueva_tx
                link.save()

                for _ in range(boletos_a_regalar):
                    BoletoSeleccionado.objects.create(
                        rifa=link.rifa,
                        transaccion=nueva_tx,
                        numero=disponibles.pop(0),
                        pagado=True,
                        apartado=False,
                    )

                # Correo premio
                numeros = list(
                    BoletoSeleccionado.objects.filter(transaccion=nueva_tx)
                    .values_list("numero", flat=True)
                )
                digitos = len(str(link.rifa.total_boletos - 1))
                formateados = [str(n).zfill(digitos) for n in numeros]
                enviar_correo_boletos_regalo(
                    origen, link.rifa.nombre, formateados,
                    nueva_tx.folio, tx.nombre_completo
                )

        except Exception as e:
            log.warning("Premio referidos saltado: %s", e)

    # ── 4. Código promocional ────────────────────────────
    if tx.codigo_usado:
        try:
            cp = tx.codigo_usado.codigo
            cp.usos_actuales = (cp.usos_actuales or 0) + 1
            cp.save()
        except CodigoPromocional.DoesNotExist:
            log.warning("Código promo ausente")

    # ── 5. Generar link referido nuevo ───────────────────
    link_url = None
    try:
        if cfg and cfg.activo and tx.monto >= cfg.monto_minimo_para_generar:
            cadena_ok = cfg.permitir_cadena_referidos or not tx.codigo_referido
            if cadena_ok and not LinkReferido.objects.filter(transaccion_origen=tx).exists():
                rifa = tx.boletos.first().rifa if tx.boletos.exists() else None
                if rifa:
                    link = LinkReferido.objects.create(
                        transaccion_origen=tx,
                        rifa=rifa,
                        fecha_creacion=timezone.now(),
                        fecha_expiracion=timezone.now() + timedelta(days=1)
                    )
                    link_url = f"https://www.rifandoando.club/usar-link/{link.codigo}/"
    except Exception as e:
        log.warning("No se pudo generar link referido: %s", e)

    # ── 6. Correo de confirmación ────────────────────────
    try:
        numeros = list(
            BoletoSeleccionado.objects.filter(transaccion=tx, pagado=True)
            .values_list("numero", flat=True)
        )
        if numeros:
            rifa = tx.boletos.first().rifa
            digitos = len(str(rifa.total_boletos - 1)) if rifa else len(str(max(numeros)))
            formateados = [str(n).zfill(digitos) for n in numeros]
            enviar_correo_confirmacion_compra(
                tx, formateados, link_url,
                cfg.monto_minimo_para_validar if cfg else None
            )
    except Exception as e:
        log.warning("Correo confirmación falló: %s", e)

    # ── 7. Enviar SMS ───────────────────────────────────────
    try:
        if tipo_pago in ["credit_card", "debit_card", "account_money"]:
            enviar_sms_pago_exitoso(tx)
            log.info(f"📲 SMS de confirmación enviado: {tx.folio}")
    except Exception as e:
        log.warning(f"⚠️ Error al enviar SMS: {e}")

    log.info("Transacción %s completada", tx.folio)


def cancelar_transaccion_completa(transaccion: Transaccion) -> bool:
    if transaccion.estado == "cancelado":
        return False

    # Cambiar estado de la transacción
    transaccion.estado = "cancelado"
    transaccion.save()

    # Eliminar todos los boletos asociados a la transacción
    BoletoSeleccionado.objects.filter(transaccion=transaccion).delete()

    # Invalidar link de referido generado (si existe)
    try:
        link = LinkReferido.objects.get(transaccion_origen=transaccion)
        link.expirado = True
        link.usado = True
        link.save()

        # Cancelar la transacción de boletos de premio, si existiera
        if link.transaccion_premio:
            transaccion_premio = link.transaccion_premio
            transaccion_premio.estado = "cancelado"
            transaccion_premio.save()

            # Borrar boletos de la transacción de premio
            BoletoSeleccionado.objects.filter(transaccion=transaccion_premio).delete()

    except LinkReferido.DoesNotExist:
        pass  # No hay problema si no existe

    # Revertir uso de código promocional (si aplicaba)
    if transaccion.codigo_usado:
        try:
            codigo_usado = transaccion.codigo_usado
            codigo_promocional = codigo_usado.codigo

            if codigo_promocional:
                # Disminuir usos_actuales
                codigo_promocional.usos_actuales = max((codigo_promocional.usos_actuales or 1) - 1, 0)
                codigo_promocional.save()

            # Eliminar registro de uso
            codigo_usado.delete()

        except Exception as e:
            log.warning(f"⚠️ Error al revertir uso de código promocional: {str(e)}")

    return True
