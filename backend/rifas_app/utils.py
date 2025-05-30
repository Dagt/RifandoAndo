# backend/rifas_app/utils.py
from django.conf import settings
from django.utils.timezone import localtime
from rifas_app.sms_utils import enviar_sms

def enviar_sms_pago_creado(trans, url_pago=None):

    mensaje = (
        f"RifandoAndo\n\n"
        f"Paga ${trans.monto} hoy o los boletos se liberarán.\n"
        f"Verificador:\n{settings.BASE_FRONTEND_URL}/verificador?folio={trans.folio}"
    )

    if url_pago:
        mensaje += f"\n\n Link de pago:\n{url_pago}"

    enviar_sms(mensaje, trans.telefono)

def enviar_sms_pago_exitoso(trans):
    mensaje = (
        f"Gracias por tu usar RifandoAndo!\n\n"
        
        f"Verifica tu compra en:\n{settings.BASE_FRONTEND_URL}/verificador?folio={trans.folio}"
    )
    enviar_sms(mensaje, trans.telefono)
