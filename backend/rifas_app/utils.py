# backend/rifas_app/utils.py
from django.conf import settings
from django.utils.timezone import localtime
from rifas_app.sms_utils import enviar_sms

def enviar_sms_pago_creado(trans, referencia=None, lugar_pago=None, tipo_pago=None):
    if tipo_pago == "bank_transfer":
        texto_referencia = f"CLABE para transferencia:\n{referencia}"
    else:
        texto_referencia = f"con referencia:\n{referencia}"

    mensaje = (
        f"RifandoAndo\n"
        f"Paga hoy ${trans.monto} en {lugar_pago or 'el establecimiento seleccionado'}\n"
        f"{texto_referencia}\n"
        f"o los boletos se liberaran\n"
        f"Verificar boletos:\n{settings.BASE_FRONTEND_URL}/verificador?folio={trans.folio}"
    )

    enviar_sms(mensaje.strip(), trans.telefono)



def enviar_sms_pago_exitoso(trans):
    mensaje = (
        f"Gracias por tu usar RifandoAndo!\n\n"
        
        f"Verifica tu compra en:\n{settings.BASE_FRONTEND_URL}/verificador?folio={trans.folio}"
    )
    enviar_sms(mensaje, trans.telefono)
