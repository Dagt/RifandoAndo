from django.core.management.base import BaseCommand
from django.utils.timezone import now
from rifas_app.models import Transaccion, BoletoSeleccionado

class Command(BaseCommand):
    help = "Libera boletos de transacciones expiradas"

    def handle(self, *args, **kwargs):
        expiradas = Transaccion.objects.filter(estado="pendiente", fecha_expiracion__lt=now())
        for trans in expiradas:
            BoletoSeleccionado.objects.filter(transaccion=trans).delete()
            trans.estado = "cancelado"
            trans.save()
            self.stdout.write(f"❌ Liberados boletos de {trans.folio}")
