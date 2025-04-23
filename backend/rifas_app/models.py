from django.db import models
from django.utils import timezone
from cloudinary.models import CloudinaryField
from django.core.exceptions import ValidationError
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


class CodigoPromocional(models.Model):
    TIPO_CHOICES = [
        ("porcentaje", "Descuento por porcentaje"),
        ("boletos_extra", "Boletos extra"),
    ]

    codigo = models.CharField(max_length=50, unique=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    valor = models.PositiveIntegerField(null=True, blank=True, help_text="Porcentaje (ej. 10) o número de boletos extra (ej. 2)")
    compra_minima = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fecha_expiracion = models.DateTimeField(null=True, blank=True)
    usos_maximos = models.PositiveIntegerField(null=True, blank=True)
    usos_actuales = models.PositiveIntegerField(default=0)
    rifas = models.ManyToManyField("Rifa", blank=True, help_text="Rifas en las que aplica este código")
    minimo_boletos_para_regalo = models.PositiveIntegerField(
        null=True, blank=True, help_text="Ej. 2 significa que por cada 2 comprados se regala 1"
    )
    boletos_regalo = models.PositiveIntegerField(
        null=True, blank=True, help_text="Cuántos boletos regalar (normalmente 1)"
    )
    def esta_activo(self):
        if self.fecha_expiracion and timezone.now() > self.fecha_expiracion:
            return False
        if self.usos_maximos is not None and self.usos_actuales >= self.usos_maximos:
            return False
        return True

    def clean(self):
        if self.tipo == "porcentaje":
            if self.minimo_boletos_para_regalo or self.boletos_regalo:
                raise ValidationError(
                    "Los campos de boletos extra no deben estar definidos si el tipo es 'porcentaje'.")
        elif self.tipo == "boletos_extra":
            if not self.minimo_boletos_para_regalo or not self.boletos_regalo:
                raise ValidationError(
                    "Debes definir los campos 'mínimo de boletos' y 'boletos regalo' si el tipo es 'boletos_extra'.")


    def __str__(self):
        return self.codigo


class CodigoUsado(models.Model):
    codigo = models.ForeignKey(CodigoPromocional, on_delete=models.CASCADE)
    telefono = models.CharField(max_length=15)  # o email si prefieres
    fecha_uso = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('codigo', 'telefono')  # evita múltiples usos por persona

    def __str__(self):
        return f"{self.telefono} usó {self.codigo.codigo}"
