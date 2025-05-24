from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse

@require_POST
@csrf_exempt
def conekta_webhook(request):
    print("🎯 Webhook recibido correctamente")
    return JsonResponse({"ok": True})
