from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
from django.views.decorators.http import require_POST
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import base64
import json
import logging

from rifas_app.models import Transaccion
from rifas_app.services import procesar_transaccion_completada

log = logging.getLogger(__name__)

@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_exempt
def conekta_webhook(request):
    try:
        log.info("🎯 Webhook recibido")
        log.info(f"📩 Headers: {dict(request.headers)}")
        log.info(f"📩 Body: {request.body.decode()}")

        signature_b64 = request.headers.get("x-conekta-signature-256", "")
        signature = base64.b64decode(signature_b64)

        public_key_pem = settings.CONEKTA_PUBLIC_KEY_PEM.encode()
        public_key = serialization.load_pem_public_key(public_key_pem, backend=default_backend())

        public_key.verify(
            signature,
            request.body,
            padding.PKCS1v15(),
            hashes.SHA256()
        )

        data = json.loads(request.body)
        log.info(f"✅ Webhook parseado: {data}")

        if data.get("type") != "order.paid":
            return HttpResponse("Evento ignorado", status=200)

        folio = data.get("data", {}).get("object", {}).get("metadata", {}).get("folio")
        if not folio:
            for item in data.get("data", {}).get("object", {}).get("line_items", {}).get("data", []):
                if "Folio" in item.get("name", ""):
                    folio = item["name"].split("Folio")[-1].strip()
                    break

        if not folio:
            log.warning("⚠️ Webhook sin folio.")
            return HttpResponse("No folio", status=400)

        tx = Transaccion.objects.select_for_update().get(folio=folio)
        procesar_transaccion_completada(tx)
        return HttpResponse("OK", status=200)

    except Exception as e:
        log.error(f"❌ Error en webhook: {e}")
        return HttpResponse(f"Firma inválida o error: {e}", status=400)

def csrf_failure_custom(request, reason=""):
    if request.path.startswith("/webhooks/conekta/"):
        return HttpResponse("CSRF bypass para webhook", status=200)
    return HttpResponse("Forbidden: CSRF", status=403)
