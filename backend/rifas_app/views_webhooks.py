# backend/rifas_app/views_webhooks.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.db import transaction
from rifas_app.models import Transaccion
from rifas_app.services import procesar_transaccion_completada, cancelar_transaccion_completa
from rifas_app.utils import enviar_sms_pago_exitoso, enviar_sms_pago_creado
import requests
import logging

log = logging.getLogger(__name__)

@csrf_exempt
@api_view(["POST"])
@permission_classes([])
def mercadopago_webhook(request):
    log.info("📦 Webhook recibido de Mercado Pago")

    try:
        data = request.data
        log.debug(f"🔍 Payload recibido: {data}")

        if (data.get("type") or data.get("topic")) != "payment":
            log.info("⏭️ Webhook ignorado por tipo")
            return Response({"message": "Evento ignorado"}, status=200)

        payment_id = (
            data.get("data", {}).get("id") or
            data.get("id") or
            request.query_params.get("id")
        )
        if not payment_id:
            return Response({"error": "Sin ID de pago"}, status=400)

        log.info(f"🔎 Consultando pago {payment_id}")
        headers = {"Authorization": f"Bearer {settings.MERCADO_PAGO_ACCESS_TOKEN}"}
        r = requests.get(f"https://api.mercadopago.com/v1/payments/{payment_id}", headers=headers)
        if r.status_code != 200:
            log.warning(f"❌ No se pudo consultar el pago {payment_id}: {r.text}")
            return Response({"error": "Pago no encontrado"}, status=200)

        pago = r.json()
        status_pago = pago.get("status")
        tipo_pago = pago.get("payment_type_id")
        external_reference = pago.get("external_reference")

        log.debug(f"🧾 status: {status_pago} | tipo: {tipo_pago} | external_ref: {external_reference}")

        if not external_reference:
            return Response({"error": "Folio (external_reference) ausente"}, status=400)

        try:
            with transaction.atomic():
                tx = Transaccion.objects.select_for_update().get(folio=external_reference)

                if not tx.payment_id:
                    tx.payment_id = str(payment_id)
                    tx.save(update_fields=["payment_id"])
                    log.info(f"💾 payment_id guardado en transacción: {payment_id}")


                if status_pago == "approved":
                    if tx.estado != "completado":
                        procesar_transaccion_completada(tx, tipo_pago)
                        log.info(f"✅ Transacción completada: {tx.folio}")


                elif status_pago in ["rejected", "cancelled", "expired"]:
                    if tx.estado != "cancelado":
                        cancelada = cancelar_transaccion_completa(tx)
                        if cancelada:
                            log.info(f"❌ Transacción cancelada correctamente con lógica completa: {tx.folio}")

        except Transaccion.DoesNotExist:
            log.error(f"❌ Transacción no encontrada con folio {external_reference}")
            return Response({"error": "Transacción no encontrada"}, status=404)

        return Response({"ok": True, "payment_id": payment_id, "folio": external_reference}, status=200)

    except Exception as e:
        log.exception("❌ Error procesando webhook")
        return Response({"error": str(e)}, status=400)