from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(["POST"])
def conekta_webhook(request):
    print("🔥 ¡ENTRÓ AL WEBHOOK!")
    return Response({"mensaje": "¡Webhook recibido correctamente!"}, status=200)
