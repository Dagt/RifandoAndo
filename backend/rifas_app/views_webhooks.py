from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
from django.views.decorators.http import require_POST
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import base64
import json
from rifas_app.models import Transaccion
from rifas_app.services import procesar_transaccion_completada

@csrf_exempt
@require_POST
def conekta_webhook(request):
    if request.method != "POST":
        return HttpResponse("Método no permitido", status=405)

    try:
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
        if data.get("type") != "order.paid":
            return HttpResponse("Evento ignorado", status=200)

        folio = data.get("data", {}).get("object", {}).get("metadata", {}).get("folio")
        if not folio:
            return HttpResponse("No folio", status=400)

        tx = Transaccion.objects.select_for_update().get(folio=folio)
        procesar_transaccion_completada(tx)
        return HttpResponse("OK", status=200)

    except Exception as e:
        return HttpResponse(f"Firma inválida o error: {e}", status=400)


def csrf_failure_custom(request, reason=""):
    if request.path.startswith("/webhooks/conekta/"):
        return HttpResponse("CSRF bypass para webhook", status=200)
    return HttpResponse("Forbidden: CSRF", status=403)
