from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings

from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend

import base64
import json
from rifas_app.models import Transaccion
from rifas_app.services import procesar_transaccion_completada
import logging

log = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class ConektaWebhookView(APIView):
    def post(self, request):
        print("🎯 Webhook recibido")
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
            log.info(f"✅ Webhook parseado: {data}")

            if data.get("type") != "order.paid":
                return Response({"message": "Evento ignorado"}, status=status.HTTP_200_OK)

            folio = data.get("data", {}).get("object", {}).get("metadata", {}).get("folio")
            if not folio:
                for item in data.get("data", {}).get("object", {}).get("line_items", {}).get("data", []):
                    if "Folio" in item.get("name", ""):
                        folio = item["name"].split("Folio")[-1].strip()
                        break

            if not folio:
                log.warning("⚠️ Webhook sin folio.")
                return Response({"error": "No folio"}, status=status.HTTP_400_BAD_REQUEST)

            tx = Transaccion.objects.select_for_update().get(folio=folio)
            procesar_transaccion_completada(tx)

            return Response({"message": "OK"}, status=status.HTTP_200_OK)

        except Exception as e:
            log.error(f"❌ Error en webhook: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
