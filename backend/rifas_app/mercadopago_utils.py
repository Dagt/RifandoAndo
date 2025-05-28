import mercadopago
from django.conf import settings
from datetime import datetime, timedelta, timezone
import os

sdk = mercadopago.SDK(settings.MERCADO_PAGO_ACCESS_TOKEN)

def crear_preferencia_pago(transaccion, rifa, boletos_solicitados):
    base_url = os.environ.get("BASE_FRONTEND_URL", "http://localhost:3000")
    expires_at_dt = datetime.now(timezone.utc) + timedelta(hours=2)

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
        "notification_url": os.environ.get("MP_WEBHOOK_URL", "https://tusitio.com/api/webhook-mercadopago/"),
        "external_reference": transaccion.folio,
        "expires": True,
        "expiration_date_to": expires_at_dt.isoformat(),
        "back_urls": {
            "success": f"{base_url}/compra-exitosa?folio={transaccion.folio}&payment_status=paid",
            "failure": f"{base_url}/fallo-pago?folio={transaccion.folio}"
        }
    }

    result = sdk.preference().create(preference_data)
    response = result.get("response", {})

    if "init_point" not in response:
        raise Exception(f"Preferencia no válida: {response}")

    return {
        "checkout_url": response["init_point"],
        "expires_at": int(expires_at_dt.timestamp())
    }
