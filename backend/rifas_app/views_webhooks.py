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
        data = request.data
        log.debug(f"🔍 Payload: {data}")

        # Solo procesamos eventos de tipo payment
        if (data.get("type") or data.get("topic")) != "payment":
            log.info("⏭️ Evento ignorado por tipo")
            return Response({"message": "Evento ignorado"}, status=200)

        # Extraer payment_id
        payment_id = (
            data.get("data", {}).get("id") or
            data.get("id") or
            request.query_params.get("id")
        )
        if not payment_id:
            return Response({"error": "Sin ID de pago"}, status=400)

        log.info(f"🔎 Consultando pago {payment_id}")
        headers = {
            "Authorization": f"Bearer {settings.MERCADO_PAGO_ACCESS_TOKEN}"
        }
        r = requests.get(f"https://api.mercadopago.com/v1/payments/{payment_id}", headers=headers)
        if r.status_code != 200:
            log.warning(f"❌ No se pudo consultar el pago {payment_id}: {r.text}")
            return Response({"error": "Pago no encontrado"}, status=200)

        pago = r.json()
        status_pago = pago.get("status")
        tipo_pago = pago.get("payment_type_id")
        external_reference = pago.get("external_reference")
        order_id = pago.get("order", {}).get("id") or pago.get("order_id")

        log.debug(f"🧾 Detalles del pago — status: {status_pago} | tipo: {tipo_pago} | ext_ref: {external_reference} | order_id: {order_id}")

        if status_pago != "approved" or tipo_pago != "credit_card":
            log.info("⏭️ Webhook ignorado por estado o tipo de pago")
            return Response({"message": "Pago no aplicable"}, status=200)

        if not external_reference:
            return Response({"error": "Folio (external_reference) ausente"}, status=400)

        try:
            trans = Transaccion.objects.select_related("codigo_usado").prefetch_related("boletos").get(folio=external_reference)
        except Transaccion.DoesNotExist:
            log.error(f"❌ Transacción no encontrada para folio: {external_reference}")
            return Response({"error": "Transacción no encontrada"}, status=404)

        # Guardar payment_id si no estaba registrado
        if not trans.payment_id:
            trans.payment_id = str(payment_id)
            trans.save(update_fields=["payment_id"])
            log.info(f"💾 payment_id guardado en transacción: {payment_id}")

        # Completar si aún no estaba completada
        if trans.estado != "completado":
            trans.estado = "completado"
            trans.save(update_fields=["estado"])
            procesar_transaccion_completada(trans)
            log.info(f"✅ Transacción completada con éxito: {trans.folio}")

        return Response({"ok": True, "payment_id": payment_id, "folio": trans.folio}, status=200)

    except Exception as e:
        log.exception("❌ Error procesando webhook")
        return Response({"error": str(e)}, status=400)
