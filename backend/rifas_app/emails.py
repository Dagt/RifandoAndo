# rifas_app/emails.py

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def enviar_correo_confirmacion_compra(transaccion, boletos, link_referido=None, monto_minimo_para_validar=None):
    """
    Envía un correo de confirmación de compra al usuario.
    Si se genera un link de referido, lo incluye en el correo junto con el monto mínimo para validarlo.
    """
    subject = "🎟️ Confirmación de tu compra - Rifando Ando"
    destinatario = transaccion.correo

    context = {
        "nombre": transaccion.nombre_completo,
        "folio": transaccion.folio,
        "fecha": transaccion.fecha_creacion.strftime("%d/%m/%Y %H:%M"),
        "nombre_rifa": transaccion.rifa_nombre,
        "monto": transaccion.monto,
        "boletos": boletos,
        "link_referido": link_referido,
        "monto_minimo_para_validar": monto_minimo_para_validar,
    }

    mensaje_html = render_to_string("emails/confirmacion_compra.html", context)

    send_mail(
        subject,
        "",  # Texto plano vacío
        settings.DEFAULT_FROM_EMAIL,
        [destinatario],
        html_message=mensaje_html,
        fail_silently=False,
    )



def enviar_correo_boletos_regalo(transaccion_origen, boletos_regalados):
    subject = "🎉 ¡Te hemos regalado boletos! - Rifando Ando"
    destinatario = transaccion_origen.correo

    context = {
        "nombre": transaccion_origen.nombre_completo,
        "rifa_nombre": transaccion_origen.rifa_nombre,
        "boletos_regalados": boletos_regalados,
    }

    mensaje_html = render_to_string("emails/boletos_regalo.html", context)

    send_mail(
        subject,
        "",
        settings.DEFAULT_FROM_EMAIL,
        [destinatario],
        html_message=mensaje_html,
        fail_silently=False,
    )
