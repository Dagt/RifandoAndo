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

        # Aceptamos solo eventos de tipo payment
        if (data.get("type") or data.get("topic")) != "payment":
            return Response({"message": "Evento ignorado"}, status=200)

        # Intentamos obtener el ID de pago
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
            log.warning(f"❌ Error al consultar pago: {r.text}")
            return Response({"error": "Pago no encontrado"}, status=200)  # Respondemos 200 aunque sea error

        pago = r.json()
        status_pago = pago.get("status")
        tipo_pago = pago.get("payment_type_id")
        external_reference = pago.get("external_reference")

        if status_pago != "approved" or tipo_pago != "credit_card":
            log.info(f"⏭️ Ignorado: status {status_pago} tipo {tipo_pago}")
            return Response({"message": "No procesado"}, status=200)

        if not external_reference:
            return Response({"error": "Sin folio (external_reference)"}, status=400)

        # Buscar transacción y completar
        try:
            trans = Transaccion.objects.select_related("codigo_usado").prefetch_related("boletos").get(folio=external_reference)
        except Transaccion.DoesNotExist:
            log.error(f"❌ No se encontró la transacción con folio {external_reference}")
            return Response({"error": "Transacción no encontrada"}, status=404)

        if not trans.payment_id:
            trans.payment_id = payment_id
            trans.save(update_fields=["payment_id"])

        if trans.estado != "completado":
            trans.estado = "completado"
            trans.save(update_fields=["estado"])
            procesar_transaccion_completada(trans)
            log.info(f"✅ Transacción completada: {trans.folio}")

        return Response({"ok": True}, status=200)

    except Exception as e:
        log.exception("❌ Error procesando webhook")
        return Response({"error": str(e)}, status=400)
