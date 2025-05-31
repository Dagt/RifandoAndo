# backend/rifas_app/utils.py
from django.conf import settings
from django.utils.timezone import localtime
from rifas_app.sms_utils import enviar_sms

def enviar_sms_pago_creado(trans, referencia=None):
    mensaje = (
        f"RifandoAndo\n"
        f"Paga hoy ${trans.monto} con referencia:\n"
        f"{referencia}\n"
        f"o los boletos se liberaran\n"
        f"Verifica tus boletos:\n{settings.BASE_FRONTEND_URL}/verificador?folio={trans.folio}"

    )

    enviar_sms(mensaje.strip(), trans.telefono)


def enviar_sms_pago_exitoso(trans):
    mensaje = (
        f"Gracias por tu usar RifandoAndo!\n\n"
        
        f"Verifica tu compra en:\n{settings.BASE_FRONTEND_URL}/verificador?folio={trans.folio}"
    )
    enviar_sms(mensaje, trans.telefono)
