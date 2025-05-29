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
    limite = now() - timedelta(hours=48)

    transacciones = Transaccion.objects.filter(
        estado__in=['pendiente', 'in_process'],
        fecha_expiracion__lt=limite
    )

    total_canceladas = 0
    for trans in transacciones:
        if cancelar_transaccion_completa(trans):
            total_canceladas += 1

    if total_canceladas > 0:
        print(f"🗑️ Celery canceló {total_canceladas} transacciones colgadas (48h vencidas).")
    else:
        print("⏳ No hay transacciones colgadas para cancelar.")


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
