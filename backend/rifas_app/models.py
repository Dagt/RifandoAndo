from django.db import models
from django.utils import timezone
from cloudinary.models import CloudinaryField
from django.core.exceptions import ValidationError
from django.utils.timezone import now
import uuid



#================================================Rifas Normales===============================================================

#Modelo Principal-----------------------------------------
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


#Galeria de imagenes-------------------------------------------------------------------------
class Galeria(models.Model):
    rifa = models.ForeignKey(Rifa, related_name='imagenes', on_delete=models.CASCADE)
    imagen = CloudinaryField('image')

    def __str__(self):
        return f"Imagen de {self.rifa.nombre}"

#Transaccione--------------------------------------------------------------------------
class Transaccion(models.Model):
    METODO_PAGO_CHOICES = [
        ('OXXO', 'OXXO'),
        ('SPEI', 'Transferencia SPEI'),
        ('tarjeta', 'Tarjeta'),
        ('premio', 'Premio'),
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
    codigo_usado = models.ForeignKey(
        "CodigoUsado",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transacciones"
    )
    codigo_referido = models.CharField(max_length=100, null=True, blank=True)
    es_premio = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.folio:
            timestamp = now().strftime('%Y%m%d')
            short_uuid = str(uuid.uuid4())[:8]
            self.folio = f"{timestamp}-{short_uuid}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.folio} - {self.nombre_completo}"

#Boletos Seleccionados------------------------------------------------------------------------------------------
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


#Codigos Promocionales----------------------------------------------------------------------------------------
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
    pausado = models.BooleanField(default=False)

    def esta_activo(self):
        if self.pausado:
            return False
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

#Codigos promocionales usados----------------------------------------------------------------------------------------
class CodigoUsado(models.Model):
    codigo = models.ForeignKey(CodigoPromocional, on_delete=models.CASCADE)
    telefono = models.CharField(max_length=15)  # o email si prefieres
    fecha_uso = models.DateTimeField(auto_now_add=True)
    monto_generado = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.telefono} usó {self.codigo.codigo}"

#Links de referidos---------------------------------------------------------------------------------------------------
class LinkReferido(models.Model):
    codigo = models.CharField(max_length=100, unique=True, editable=False)
    transaccion_origen = models.ForeignKey('Transaccion', on_delete=models.CASCADE, related_name='referidos_generados')
    rifa = models.ForeignKey('Rifa', on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_expiracion = models.DateTimeField()
    usado = models.BooleanField(default=False)
    transaccion_usada = models.ForeignKey('Transaccion', null=True, blank=True, related_name='referral_usado', on_delete=models.SET_NULL)
    expirado = models.BooleanField(default=False)
    transaccion_premio = models.ForeignKey(
        'Transaccion',
        null=True,
        blank=True,
        related_name='premio_referido',
        on_delete=models.SET_NULL
    )

    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = f"REF-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)

    def esta_activo(self):
        return not self.usado and self.fecha_expiracion > timezone.now()

    def __str__(self):
        return f"Referido {self.codigo} para rifa {self.rifa.nombre}"


#Configuracion de reglas de referidos--------------------------------------------------------------------------------
class ConfiguracionReferidos(models.Model):
    activo = models.BooleanField(default=False)
    monto_minimo_para_generar = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monto_minimo_para_validar = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    permitir_cadena_referidos = models.BooleanField(default=False)
    reglas_premios = models.JSONField(default=list)  # Ejemplo de reglas

    def __str__(self):
        return "Configuración Global de Referidos"

    class Meta:
        verbose_name = "Configuración de Referidos"
        verbose_name_plural  = "Configuración de Referidos"

#================================================Rifas Exclusivas===============================================================

#Modelo de las rifas Exclusivas-----------------------------------------------------------------------------------
class RifaExclusiva(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    total_boletos = models.PositiveIntegerField()
    numero_ganador = models.PositiveIntegerField(null=True, blank=True)
    valor_premio = models.DecimalField(max_digits=10, decimal_places=2)
    enlace_video = models.URLField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    finalizada = models.BooleanField(default=False)
    permitir_finalizacion_por_valor = models.BooleanField(
        default=False, help_text="Permitir finalizar si el monto acumulado >= valor del premio"
    )

    def __str__(self):
        return self.nombre

#Modelo de la rifa Jackpot----------------------------------------------------------------------------------------
class Jackpot(models.Model):
    nombre = models.CharField(max_length=200, default="Jackpot")
    rifa_exclusiva = models.OneToOneField(RifaExclusiva, on_delete=models.CASCADE, related_name="jackpot")
    acumulado = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    ganador = models.ForeignKey("BoletoJackpot", on_delete=models.SET_NULL, null=True, blank=True, related_name="es_ganador")

    finalizado = models.BooleanField(default=False)

    def __str__(self):
        return f"Jackpot - {self.rifa_exclusiva.nombre}"

#Modelo para las cajas sorpresa---------------------------------------------------------------------------------
class CajaSorpresa(models.Model):
    rifa_exclusiva = models.OneToOneField(RifaExclusiva, on_delete=models.CASCADE, related_name="caja")
    precio = models.DecimalField(max_digits=6, decimal_places=2)
    porcentaje_jackpot = models.FloatField(default=10.0)
    drop_boleto_exclusivo = models.FloatField(default=0.025)  # 2.5%
    permite_ajustes_dinamicos = models.BooleanField(default=True)

    def __str__(self):
        return f"Caja para {self.rifa_exclusiva.nombre}"

#Modelo para los premios que entregan las cajas---------------------------------------------------------------
class PremioCaja(models.Model):
    caja = models.ForeignKey(CajaSorpresa, on_delete=models.CASCADE, related_name="premios")
    nombre = models.CharField(max_length=100)
    valor_relativo = models.FloatField(default=0.0)
    drop = models.FloatField(help_text="Probabilidad entre 0 y 1")

    def __str__(self):
        return f"{self.nombre} ({self.drop * 100:.2f}%)"

#Modelo para registrar transacciones de las cajas-------------------------------------------------
class TransaccionCaja(models.Model):
    folio = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    anon_id = models.CharField(max_length=200)
    rifa_exclusiva = models.ForeignKey(RifaExclusiva, on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=8, decimal_places=2)
    metodo_pago = models.CharField(max_length=50)
    estado = models.CharField(max_length=20, default="pendiente")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Compra Caja {self.folio}"


#Modelo para registrar la apertura de una caja_______________________________________________________________________
class AperturaCaja(models.Model):
    transaccion = models.ForeignKey(TransaccionCaja, on_delete=models.CASCADE, related_name="aperturas")
    premio_nombre = models.CharField(max_length=100)
    valor = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    fue_boleto_exclusivo = models.BooleanField(default=False)
    fue_jackpot = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)

    # Datos del usuario (solo si gana boleto exclusivo u otros boletos de otras rifas)
    nombre_completo = models.CharField(max_length=200, null=True, blank=True)
    correo = models.EmailField(null=True, blank=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Premio: {self.premio_nombre} - {self.transaccion.folio}"

#Modelo para los boletos de las rifas exclusivos---------------------------------------------------------------------
class BoletoExclusivo(models.Model):
    rifa = models.ForeignKey(RifaExclusiva, on_delete=models.CASCADE, related_name="boletos")
    numero = models.PositiveIntegerField()
    apertura = models.OneToOneField(AperturaCaja, on_delete=models.SET_NULL, null=True, blank=True)
    asignado = models.BooleanField(default=False)

    def __str__(self):
        return f"Boleto #{self.numero} - {self.rifa.nombre}"

#Modelo para galeria de imagenes de rifas Exclusivas---------------------------------------------------------------
class GaleriaExclusiva(models.Model):
    rifa_exclusiva = models.ForeignKey("RifaExclusiva", related_name="imagenes", on_delete=models.CASCADE)
    imagen = CloudinaryField("image")

    def __str__(self):
        return f"Imagen de {self.rifa_exclusiva.nombre}"

#Modelo para los boletos de la rifa del jackpot------------------------------------------------------------------------
class BoletoJackpot(models.Model):
    jackpot = models.ForeignKey("Jackpot", on_delete=models.CASCADE, related_name="boletos")
    apertura = models.ForeignKey("AperturaCaja", on_delete=models.CASCADE, related_name="boleto_jackpot")
    numero = models.PositiveIntegerField()

    class Meta:
        unique_together = ("jackpot", "numero")

    def __str__(self):
        return f"Boleto #{self.numero} - {self.jackpot.rifa_exclusiva.nombre}"
