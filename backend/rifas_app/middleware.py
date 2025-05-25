# rifas_app/middleware.py
from django.utils.deprecation import MiddlewareMixin

class CsrfBypassWebhookMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith("/webhooks/conekta/"):
            setattr(request, "_dont_enforce_csrf_checks", True)
