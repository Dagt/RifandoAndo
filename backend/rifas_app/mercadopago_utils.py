import mercadopago
from django.conf import settings
from datetime import datetime, timezone
import os

sdk = mercadopago.SDK(settings.MERCADO_PAGO_ACCESS_TOKEN)

def crear_preferencia_pago(transaccion, rifa, boletos_solicitados, tiempo_expiracion):
    expires_at_dt = tiempo_expiracion.astimezone(timezone.utc)

    preference_data = {
        "items": [
            {
                "title": f"Boletos para {rifa.nombre}",
                "quantity": 1,
                "currency_id": "MXN",
                "unit_price": float(transaccion.monto),
            }
        ],
        "payer": {
            "name": transaccion.nombre_completo,
            "email": transaccion.correo,
        },
        "metadata": {
            "rifa_id": rifa.id,
            "folio": transaccion.folio,
            "boletos": boletos_solicitados,
        },
        "notification_url": settings.MP_WEBHOOK_URL,
        "external_reference": transaccion.folio,
        "expires": True,
        "date_of_expiration": expires_at_dt.strftime("%Y-%m-%dT%H:%M:%S.000-06:00"),
        "back_urls": {
            "success": f"{settings.BASE_FRONTEND_URL}/verificador?folio={transaccion.folio}",
            "failure": f"{settings.BASE_FRONTEND_URL}/verificador?folio={transaccion.folio}"
        },
        "auto_return": "approved"
    }

    result = sdk.preference().create(preference_data)
    response = result.get("response", {})

    if "init_point" not in response:
        raise Exception(f"Preferencia no válida: {response}")

    return {
        "checkout_url": response["init_point"],
        "expires_at": int(expires_at_dt.timestamp())
    }
