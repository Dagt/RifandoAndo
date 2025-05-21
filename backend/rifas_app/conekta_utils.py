# rifas_app/conekta_utils.py
import requests
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
import re

def crear_orden_oxxo(nombre, correo, telefono, monto, folio, expires_at=None):
    try:
        if expires_at is None:
            expires_at = int((timezone.now() + timedelta(hours=2)).timestamp())

        headers = {
            "Accept": f"application/vnd.conekta-v{settings.CONEKTA_API_VERSION}+json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.CONEKTA_API_KEY}"
        }

        data = {
            "currency": "MXN",
            "customer_info": {
                "name": nombre,
                "email": correo,
                "phone": telefono
            },
            "line_items": [{
                "name": f"Compra RifandoAndo - Folio {folio}",
                "unit_price": int(float(monto) * 100),
                "quantity": 1
            }],
            "charges": [{
                "payment_method": {
                    "type": "oxxo_cash",
                    "expires_at": expires_at
                }
            }]
        }

        response = requests.post("https://api.conekta.io/orders", json=data, headers=headers)

        if response.status_code not in [200, 201]:
            print("❌ Error al crear orden:", response.status_code, response.text)
            return None

        orden = response.json()

        for charge in orden.get("charges", {}).get("data", []):
            metodo = charge.get("payment_method", {})
            if metodo.get("type") == "cash" or metodo.get("type") == "oxxo_cash":
                return {
                    "referencia": metodo.get("reference"),
                    "codigo_barras": metodo.get("barcode_url"),
                    "expires_at": metodo.get("expires_at")
                }

        print("⚠️ No se encontró un método de pago OXXO válido.")
        return None

    except Exception as e:
        print("❌ Excepción inesperada:", str(e))
        return None

def crear_orden_spei(nombre, correo, telefono, monto, folio, expires_at=None):
    try:
        if expires_at is None:
            expires_at = int((datetime.now() + timedelta(hours=2)).timestamp())

        nombre_limpio = limpiar_nombre(nombre)

        headers = {
            "Accept": f"application/vnd.conekta-v{settings.CONEKTA_API_VERSION}+json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.CONEKTA_API_KEY}"
        }

        data = {
            "currency": "MXN",
            "customer_info": {
                "name": nombre_limpio,
                "email": correo,
                "phone": telefono
            },
            "line_items": [{
                "name": f"Compra RifandoAndo - Folio {folio}",
                "unit_price": int(float(monto) * 100),
                "quantity": 1
            }],
            "charges": [{
                "payment_method": {
                    "type": "spei",
                    "expires_at": expires_at
                }
            }],
            "metadata": {
                "folio": folio,
                "concepto": folio  # este es solo para que quede claro en Conekta
            }
        }

        response = requests.post("https://api.conekta.io/orders", json=data, headers=headers)

        if response.status_code not in [200, 201]:
            print("❌ Error al crear orden SPEI:", response.status_code, response.text)
            return None

        orden = response.json()
        charge = orden.get("charges", {}).get("data", [])[0] if orden.get("charges", {}).get("data") else None
        metodo = charge.get("payment_method", {}) if charge else {}

        return {
            "banco": metodo.get("receiving_account_bank"),
            "clabe": metodo.get("receiving_account_number"),
            "concepto": folio,  # usamos el folio como concepto
            "expires_at": metodo.get("expires_at")
        }

    except Exception as e:
        print("❌ Excepción inesperada en SPEI:", str(e))
        return None



def limpiar_nombre(nombre):
    return re.sub(r"[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]", "", nombre)

def crear_orden_tarjeta(nombre, correo, telefono, monto, folio, expires_at=None):
    try:
        if expires_at is None:
            expires_at = int((timezone.now() + timedelta(hours=2)).timestamp())
        nombre_limpio = limpiar_nombre(nombre)

        headers = {
            "Accept": f"application/vnd.conekta-v{settings.CONEKTA_API_VERSION}+json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.CONEKTA_API_KEY}"
        }

        data = {
            "currency": "MXN",
            "customer_info": {
                "name": nombre_limpio,
                "email": correo,
                "phone": telefono
            },
            "line_items": [{
                "name": f"Compra RifandoAndo - Folio {folio}",
                "unit_price": int(float(monto) * 100),
                "quantity": 1
            }],
            "checkout": {
                "type": "HostedPayment",
                "allowed_payment_methods": ["card"],
                "expires_at": expires_at,
                "success_url": f"https://www.rifandoando.club/compra-exitosa?folio={folio}",
                "failure_url": "https://www.rifandoando.club/fallo-pago"
            },
            "metadata": {
                "folio": folio
            }
        }

        response = requests.post("https://api.conekta.io/orders", json=data, headers=headers)

        if response.status_code not in [200, 201]:
            print("❌ Error al crear orden tarjeta:", response.status_code, response.text)
            return None

        orden = response.json()
        return {
            "checkout_url": orden.get("checkout", {}).get("url")
        }

    except Exception as e:
        print("❌ Excepción al crear orden tarjeta:", e)
        return None