import json, hmac, hashlib, logging
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.conf import settings
from rifas_app.models import Transaccion
from rifas_app.services import procesar_transaccion_completada

log = logging.getLogger(__name__)

def firma_valida(body: bytes, firma: str) -> bool:
    secret = settings.CONEKTA_WEBHOOK_SECRET.encode()
    calculada = hmac.new(secret, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(calculada, firma)

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def conekta_webhook(request):
    if not firma_valida(request.body, request.headers.get("x-conekta-signature-256", "")):
        return HttpResponse("Bad signature", status=400)

    data = json.loads(request.body)
    if data.get("type") != "order.paid":
        return HttpResponse(status=200)

    folio = data.get("data", {}).get("object", {}).get("metadata", {}).get("folio")
    if not folio:
        return HttpResponse("No folio", status=400)

    try:
        tx = Transaccion.objects.select_for_update().get(folio=folio)
    except Transaccion.DoesNotExist:
        return HttpResponse("Folio not found", status=404)

    procesar_transaccion_completada(tx)
    return HttpResponse(status=200)
