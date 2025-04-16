from django.conf import settings
from twilio.rest import Client

def enviar_sms(mensaje, telefono):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    # Forzamos el prefijo internacional si es número mexicano de 10 dígitos
    if telefono.startswith("52"):
        telefono = f"+{telefono}"
    elif len(telefono) == 10:
        telefono = f"+52{telefono}"

    print(f"📤 Enviando SMS a: {telefono}")
    print(f"📨 Contenido: {mensaje}")

    client.messages.create(
        body=mensaje,
        from_=settings.TWILIO_PHONE_NUMBER,
        to=telefono
    )
