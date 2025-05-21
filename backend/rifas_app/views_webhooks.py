import json, hmac, hashlib, logging
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
from rifas_app.models import Transaccion
from rifas_app.services import procesar_transaccion_completada

log = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def conekta_webhook(request):
    firma = request.headers.get("x-conekta-signature-256", "")
    secret = settings.CONEKTA_WEBHOOK_SECRET.encode()
    calculada = hmac.new(secret, request.body, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calculada, firma):
        log.warning("❌ Firma inválida del webhook")
        return HttpResponse("Bad signature", status=400)

    try:
        data = json.loads(request.body)
    except Exception as e:
        log.error(f"❌ Error al parsear JSON: {e}")
        return HttpResponse("Invalid JSON", status=400)

    if data.get("type") != "order.paid":
        return HttpResponse("Evento ignorado", status=200)

    folio = data.get("data", {}).get("object", {}).get("metadata", {}).get("folio")
    if not folio:
        return HttpResponse("No folio", status=400)

    try:
        tx = Transaccion.objects.select_for_update().get(folio=folio)
        procesar_transaccion_completada(tx)
        return HttpResponse("OK", status=200)
    except Transaccion.DoesNotExist:
        log.warning(f"⚠️ Transacción con folio {folio} no encontrada.")
        return HttpResponse("Folio not found", status=404)
    except Exception as e:
        log.error(f"❌ Error procesando transacción: {e}")
        return HttpResponse("Internal error", status=500)
