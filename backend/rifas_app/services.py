import logging, random
from django.db import transaction as db_tx
from django.utils import timezone
from datetime import timedelta
from rifas_app.models import (
    BoletoSeleccionado, ConfiguracionReferidos, LinkReferido,
    Transaccion, CodigoPromocional
)
from rifas_app.emails import (
    enviar_correo_boletos_regalo, enviar_correo_confirmacion_compra
)

log = logging.getLogger(__name__)

@db_tx.atomic
def procesar_transaccion_completada(tx: Transaccion):
    """
    Marca la transacción como completada y ejecuta TODA la lógica
    (boletos, referidos, correos…).  Es idempotente.
    """
    if tx.estado == "completado":
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
                    metodo_pago="premio",
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

    log.info("Transacción %s completada", tx.folio)
