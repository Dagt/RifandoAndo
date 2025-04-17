from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.generic import View
from django.shortcuts import render
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('rifas_app.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Vista para servir el frontend (SPA)
class FrontendRender(View):
    def get(self, request, *args, **kwargs):
        return render(request, "index.html")

# Cualquier ruta que no sea API va al frontend
urlpatterns += [
    re_path(r"^(?!api/).*", TemplateView.as_view(template_name="index.html")),
]
