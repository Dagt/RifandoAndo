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

        if evento.get("type") not in ["payment.updated", "payment.created"]:
            return Response({"message": "Evento no relevante"}, status=200)

        payment_id = evento.get("data", {}).get("id")
        if not payment_id:
            return Response({"error": "Sin ID de pago"}, status=400)

        # Consulta el estado del pago directamente a MP
        headers = {
            "Authorization": f"Bearer {settings.MERCADO_PAGO_ACCESS_TOKEN}"
        }
        r = requests.get(f"https://api.mercadopago.com/v1/payments/{payment_id}", headers=headers)
        if r.status_code != 200:
            log.warning(f"❌ No se pudo consultar el pago {payment_id}: {r.text}")
            return Response({"error": "No se pudo verificar el pago"}, status=400)

        pago = r.json()
        if pago.get("status") != "approved":
            log.info(f"ℹ️ Pago {payment_id} no aprobado: estado = {pago.get('status')}")
            return Response({"message": "Pago aún no aprobado"}, status=200)

        folio = pago.get("external_reference")
        if not folio:
            log.error("❌ No se encontró external_reference en el pago")
            return Response({"error": "Folio faltante en metadata"}, status=400)

        tx = Transaccion.objects.select_for_update().get(folio=folio)
        procesar_transaccion_completada(tx)

        return Response({"message": "Transacción procesada"}, status=200)

    except Transaccion.DoesNotExist:
        log.error(f"❌ No se encontró transacción con folio recibido")
        return Response({"error": "Transacción no encontrada"}, status=404)
    except Exception as e:
        log.exception(f"❌ Error en webhook Mercado Pago")
        return Response({"error": str(e)}, status=400)
