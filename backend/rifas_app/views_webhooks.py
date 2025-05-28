from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rifas_app.models import Transaccion
from rifas_app.services import procesar_transaccion_completada
import requests
import logging

log = logging.getLogger(__name__)

@csrf_exempt
@api_view(["POST"])
@permission_classes([])
def mercadopago_webhook(request):
    log.info("📦 Webhook recibido de Mercado Pago")

    try:
        evento = request.data
        log.debug(f"🔍 Payload recibido: {evento}")

        # Soporte para topic o type
        topic = evento.get("topic") or evento.get("type")
        if topic != "payment":
            log.info(f"🟡 Evento ignorado — topic recibido: {topic}")
            return Response({"message": "Evento no relevante"}, status=200)

        # Obtener ID del pago
        payment_id = (
            evento.get("data", {}).get("id") or
            evento.get("id") or
            request.query_params.get("id")
        )
        if not payment_id:
            return Response({"error": "Sin ID de pago"}, status=400)

        log.info(f"🔎 Consultando pago {payment_id}")

        # Consultar estado real del pago
        headers = {
            "Authorization": f"Bearer {settings.MERCADO_PAGO_ACCESS_TOKEN}"
        }
        r = requests.get(f"https://api.mercadopago.com/v1/payments/{payment_id}", headers=headers)
        if r.status_code != 200:
            log.warning(f"❌ No se pudo consultar el pago {payment_id}: {r.text}")
            return Response({"error": "No se pudo verificar el pago"}, status=400)

        pago = r.json()
        status_pago = pago.get("status")
        log.debug(f"🔎 Estado del pago {payment_id}: {status_pago}")

        if status_pago != "approved":
            return Response({"message": f"Estado actual: {status_pago}"}, status=200)

        # Marcar transacción como completada
        folio = pago.get("external_reference")
        if not folio:
            return Response({"error": "Folio no disponible"}, status=400)

        tx = Transaccion.objects.get(folio=folio)
        procesar_transaccion_completada(tx)

        return Response({"message": "Transacción procesada correctamente"}, status=200)

    except Transaccion.DoesNotExist:
        log.error(f"❌ No se encontró transacción con ese folio")
        return Response({"error": "Transacción no encontrada"}, status=404)
    except Exception as e:
        log.exception("❌ Error procesando webhook Mercado Pago")
        return Response({"error": str(e)}, status=400)
