from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import json
import base64
import logging

from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend

from rifas_app.models import Transaccion
from rifas_app.services import procesar_transaccion_completada

log = logging.getLogger(__name__)

class ConektaWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        log.info("✅ Webhook recibido")

        try:
            # Obtener la firma si existe
            signature_b64 = request.headers.get("x-conekta-signature-256", "")
            if not signature_b64:
                log.error("❌ Error en webhook: Falta header de firma")
                return Response({"message": "Evento recibido sin firma. Ignorado."}, status=200)

            # Verificar firma
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
            log.info(f"📦 Evento recibido: {data.get('type')}")

            if data.get("type") != "order.paid":
                return Response({"message": "Evento ignorado"}, status=200)

            # Extraer el folio desde metadata o line_items
            folio = data.get("data", {}).get("object", {}).get("metadata", {}).get("folio")
            if not folio:
                for item in data.get("data", {}).get("object", {}).get("line_items", {}).get("data", []):
                    if "Folio" in item.get("name", ""):
                        folio = item["name"].split("Folio")[-1].strip()
                        break

            if not folio:
                log.warning("⚠️ Webhook sin folio.")
                return Response({"error": "No folio"}, status=400)

            tx = Transaccion.objects.select_for_update().get(folio=folio)
            procesar_transaccion_completada(tx)
            return Response({"message": "Transacción procesada"}, status=200)

        except Exception as e:
            log.error(f"❌ Error en webhook: {e}")
            return Response({"error": str(e)}, status=400)
