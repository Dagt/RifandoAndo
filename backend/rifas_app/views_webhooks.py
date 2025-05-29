# rifas_app/views_webhooks.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rifas_app.models import Transaccion
from rifas_app.services import procesar_transaccion_completada, cancelar_transaccion_completa
from rifas_app.utils import enviar_sms_pago_creado, enviar_sms_pago_exitoso
import requests
import logging

log = logging.getLogger(__name__)

@csrf_exempt
@api_view(["POST"])
@permission_classes([])  # No requiere autenticación
def mercadopago_webhook(request):
    log.info("📦 Webhook recibido de Mercado Pago")

    try:
        evento = request.data
        log.debug(f"🔍 Payload recibido: {evento}")

        # Compatibilidad con "topic" o "type"
        topic = evento.get("topic") or evento.get("type")
        if topic != "payment":
            log.info(f"🟡 Evento ignorado — topic recibido: {topic}")
            return Response({"message": "Evento no relevante"}, status=200)

        # Obtener ID de pago
        payment_id = (
            evento.get("data", {}).get("id") or
            evento.get("id") or
            request.query_params.get("id")
        )
        if not payment_id:
            return Response({"error": "Sin ID de pago"}, status=400)

        log.info(f"🔎 Consultando pago {payment_id}")

        # Consultar detalles reales del pago en la API de MP
        headers = {
            "Authorization": f"Bearer {settings.MERCADO_PAGO_ACCESS_TOKEN}"
        }
        r = requests.get(f"https://api.mercadopago.com/v1/payments/{payment_id}", headers=headers)
        if r.status_code != 200:
            log.warning(f"❌ No se pudo consultar el pago {payment_id}: {r.text}")
            return Response({"error": "No se pudo verificar el pago"}, status=400)

        pago = r.json()
        status_pago = pago.get("status")
        tipo_pago = pago.get("payment_type_id")
        external_reference = pago.get("external_reference")
        log.debug(f"🔎 Estado del pago {payment_id}: {status_pago}")

        if not external_reference:
            return Response({"error": "Folio no disponible"}, status=400)

        try:
            trans = Transaccion.objects.get(folio=external_reference)
        except Transaccion.DoesNotExist:
            log.error("❌ No se encontró transacción con ese folio")
            return Response({"error": "Transacción no encontrada"}, status=404)

        if trans.estado == "completado":
            return Response({"ok": "Transacción ya procesada"}, status=200)

        # Procesar por estado
        if status_pago == "approved":
            trans.estado = "completado"
            trans.save()
            procesar_transaccion_completada(trans)
            enviar_sms_pago_exitoso(trans)

        elif status_pago in ["rejected", "cancelled", "expired"]:
            cancelar_transaccion_completa(trans)

        elif evento.get("action") == "payment.created" and tipo_pago in ["ticket", "bank_transfer"]:
            enviar_sms_pago_creado(trans)

        return Response({"message": f"Estado procesado: {status_pago}"}, status=200)

    except Exception as e:
        log.exception("❌ Error procesando webhook Mercado Pago")
        return Response({"error": str(e)}, status=400)
