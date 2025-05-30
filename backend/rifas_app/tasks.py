# rifas_app/tasks.py

from celery import shared_task
from django.utils.timezone import now, timedelta
from .models import Transaccion, BoletoSeleccionado, Rifa
from rifas_app.services import cancelar_transaccion_completa
from django.conf import settings
import requests
import logging

log = logging.getLogger(__name__)

@shared_task
def liberar_boletos_expirados():
    ahora = now()
    limite_48h = ahora - timedelta(hours=48)
    limite_2h = ahora - timedelta(hours=2)

    # 1. Cancelar transacciones con estado pendiente/in_process vencidas hace más de 48h
    transacciones_lentas = Transaccion.objects.filter(
        estado__in=['pendiente', 'in_process'],
        fecha_expiracion__lt=limite_48h
    )

    # 2. Transacciones abandonadas sin método de pago elegido por más de 2h
    transacciones_abandonadas = Transaccion.objects.filter(
        estado='pendiente',
        payment_id__isnull=True,
        fecha_creacion__lt=limite_2h
    )

    # 3. Transacciones con ticket generado (OXXO, SPEI, etc.) que ya expiraron
    transacciones_expiradas_sin_webhook = Transaccion.objects.filter(
        estado='pendiente',
        fecha_expiracion__lt=ahora,
        payment_id__isnull=False
    )

    total_canceladas = 0
    for trans in list(transacciones_lentas) + list(transacciones_abandonadas) + list(transacciones_expiradas_sin_webhook):
        if cancelar_transaccion_completa(trans):
            total_canceladas += 1

    if total_canceladas > 0:
        log.info(f"🗑️ Celery canceló {total_canceladas} transacciones colgadas (vencidas o abandonadas).")
    else:
        log.info("⏳ No hay transacciones colgadas para cancelar.")


@shared_task
def actualizar_estado_rifas():
    ahora = now()

    # 1. Rifas que deben activarse
    rifas_a_activar = Rifa.objects.filter(estado='en_espera', fecha_inicio__lte=ahora)
    for rifa in rifas_a_activar:
        rifa.estado = 'activa'
        rifa.save()

    # 2. Rifas que deben finalizarse
    rifas_a_finalizar = Rifa.objects.filter(estado='activa', fecha_fin__lte=ahora)
    for rifa in rifas_a_finalizar:
        rifa.estado = 'finalizada'
        rifa.save()

    return {
        "activadas": rifas_a_activar.count(),
        "finalizadas": rifas_a_finalizar.count()
    }


@shared_task
def marcar_links_referidos_expirados():
    from rifas_app.models import LinkReferido  # Import aquí adentro para evitar problemas circulares
    ahora = now()
    links = LinkReferido.objects.filter(expirado=False, usado=False, fecha_expiracion__lt=ahora)

    cantidad = links.update(expirado=True)

    if cantidad > 0:
        print(f"⏳ {cantidad} links de referidos marcados como expirados automáticamente.")
    else:
        print("🔎 No había links de referidos para expirar.")
