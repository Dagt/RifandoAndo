# backend/rifas_app/utils.py
from django.conf import settings
from django.utils.timezone import localtime
from rifas_app.sms_utils import enviar_sms

def enviar_sms_pago_creado(trans):
    fecha_exp = localtime(trans.fecha_expiracion).strftime("%H:%M del %d/%m")
    mensaje = (
        f"RifandoAndo\n\n"
        f"Monto: ${trans.monto}\n"
        f"Paga hoy o los boletos se liberarán\n"
        f"Verifica tu estatus:\n{settings.BASE_FRONTEND_URL}/verificador?folio={trans.folio}"
    )
    enviar_sms(mensaje, trans.telefono)

def enviar_sms_pago_exitoso(trans):
    mensaje = (
        f"Gracias por tu usar RifandoAndo!\n\n"
        
        f"Verifica tu compra en:\n{settings.BASE_FRONTEND_URL}/verificador?folio={trans.folio}"
    )
    enviar_sms(mensaje, trans.telefono)
