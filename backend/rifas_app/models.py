from django.db import models
from cloudinary.models import CloudinaryField
from django.utils.timezone import now
import uuid

class Rifa(models.Model):
    ESTADO_CHOICES = [
        ('activa', 'Activa'),
        ('finalizada', 'Finalizada'),
        ('en_espera', 'En espera'),
    ]

    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    precio_boleto = models.DecimalField(max_digits=6, decimal_places=2)
    total_boletos = models.PositiveIntegerField()
    numero_ganador = models.PositiveIntegerField(null=True, blank=True)
    enlace_video = models.URLField(null=True, blank=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='en_espera')

    def __str__(self):
        return self.nombre


class Galeria(models.Model):
    rifa = models.ForeignKey(Rifa, related_name='imagenes', on_delete=models.CASCADE)
    imagen = CloudinaryField('image')

    def __str__(self):
        return f"Imagen de {self.rifa.nombre}"


class Transaccion(models.Model):
    METODO_PAGO_CHOICES = [
        ('OXXO', 'OXXO'),
        ('SPEI', 'Transferencia SPEI'),
        ('tarjeta', 'Tarjeta'),
    ]

    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]

    nombre_completo = models.CharField(max_length=150)
    correo = models.EmailField()
    telefono = models.CharField(max_length=20)
    fecha_nacimiento = models.DateField()
    folio = models.CharField(max_length=100, unique=True, blank=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_expiracion = models.DateTimeField(null=True, blank=True)
    rifa_nombre = models.CharField(max_length=200, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.folio:
            timestamp = now().strftime('%Y%m%d')
            short_uuid = str(uuid.uuid4())[:8]
            self.folio = f"{timestamp}-{short_uuid}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.folio} - {self.nombre_completo}"


class BoletoSeleccionado(models.Model):
    rifa = models.ForeignKey(Rifa, on_delete=models.CASCADE)
    transaccion = models.ForeignKey(Transaccion, on_delete=models.CASCADE, related_name='boletos')
    numero = models.PositiveIntegerField()
    apartado = models.BooleanField(default=True)
    pagado = models.BooleanField(default=False)

    class Meta:
        unique_together = ('rifa', 'numero')  # No se puede repetir el mismo número en la misma rifa

    def __str__(self):
        return f"Boleto {self.numero} - Rifa: {self.rifa.nombre}"
