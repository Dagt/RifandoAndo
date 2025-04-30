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

    total_boletos = transaccion.boletos.first().rifa.total_boletos if transaccion.boletos.exists() else 1000
    digitos = len(str(total_boletos - 1))
    boletos_formateados = [str(n).zfill(digitos) for n in boletos]

    context = {
        "nombre": transaccion.nombre_completo,
        "folio": transaccion.folio,
        "fecha": transaccion.fecha_creacion.strftime("%d/%m/%Y %H:%M"),
        "nombre_rifa": transaccion.rifa_nombre,
        "monto": transaccion.monto,
        "boletos": boletos_formateados,
        "link_referido": link_referido,
        "monto_minimo_para_validar": monto_minimo_para_validar,
    }

    mensaje_html = render_to_string("emails/confirmacion_compra.html", context)

    send_mail(
        subject,
        "",
        settings.DEFAULT_FROM_EMAIL,
        [destinatario],
        html_message=mensaje_html,
        fail_silently=False,
    )

def enviar_correo_boletos_regalo(transaccion_origen, rifa_nombre, boletos_regalados, folio, nombre_comprador):
    subject = "🎉 ¡Te hemos regalado boletos! - Rifando Ando"
    destinatario = transaccion_origen.correo

    total_boletos = transaccion_origen.boletos.first().rifa.total_boletos if transaccion_origen.boletos.exists() else 1000
    digitos = len(str(total_boletos - 1))
    boletos_formateados = [str(n).zfill(digitos) for n in boletos_regalados]

    context = {
        "nombre": transaccion_origen.nombre_completo,
        "rifa_nombre": rifa_nombre,
        "boletos_regalados": boletos_formateados,
        "folio": folio,
        "nombre_comprador": nombre_comprador,
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
