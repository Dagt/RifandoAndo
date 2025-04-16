# rifas_app/tasks.py

from celery import shared_task
from django.utils.timezone import now
from .models import BoletoSeleccionado, Transaccion, Rifa

@shared_task
def liberar_boletos_expirados():
    expiradas = Transaccion.objects.filter(
        estado='pendiente',
        fecha_expiracion__lt=now()
    )

    total_boletos = 0
    for trans in expiradas:
        boletos = BoletoSeleccionado.objects.filter(transaccion=trans)
        total_boletos += boletos.count()
        boletos.delete()
        trans.estado = 'cancelado'
        trans.save()

    if total_boletos > 0:
        print(f"🔁 Liberados {total_boletos} boletos de {expiradas.count()} transacciones expiradas.")
    else:
        print("⏳ No hay boletos para liberar.")


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
