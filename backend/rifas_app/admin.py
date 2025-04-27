from django.contrib import admin
from .models import Rifa, Galeria, Transaccion, BoletoSeleccionado, CodigoPromocional, CodigoUsado, LinkReferido, ConfiguracionReferidos

@admin.register(Rifa)
class RifaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio_boleto', 'total_boletos', 'estado', 'fecha_inicio', 'fecha_fin')
    list_filter = ('estado',)
    search_fields = ('nombre',)
    ordering = ('-fecha_inicio',)


@admin.register(Galeria)
class GaleriaAdmin(admin.ModelAdmin):
    list_display = ('rifa', 'imagen')


@admin.register(Transaccion)
class TransaccionAdmin(admin.ModelAdmin):
    list_display = ('folio', 'nombre_completo', 'monto', 'estado', 'metodo_pago', 'fecha_creacion')
    list_filter = ('estado', 'metodo_pago')
    search_fields = ('folio', 'nombre_completo', 'correo', 'telefono')
    ordering = ('-fecha_creacion',)


@admin.register(BoletoSeleccionado)
class BoletoSeleccionadoAdmin(admin.ModelAdmin):
    list_display = ('numero', 'rifa', 'transaccion', 'apartado', 'pagado')
    list_filter = ('apartado', 'pagado')
    search_fields = ('numero', 'rifa__nombre', 'transaccion__folio')
    ordering = ('rifa', 'numero')

@admin.register(CodigoPromocional)
class CodigoPromocionalAdmin(admin.ModelAdmin):
    list_display = (
        'codigo', 'tipo', 'valor', 'usos_maximos', 'usos_actuales',
        'fecha_expiracion', 'compra_minima'
    )
    list_filter = ('tipo', 'rifas')
    search_fields = ('codigo',)
    ordering = ('-fecha_expiracion',)

@admin.register(CodigoUsado)
class CodigoUsadoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'telefono', 'fecha_uso')
    list_filter = ('codigo',)
    search_fields = ('codigo__codigo', 'telefono')
    ordering = ('-fecha_uso',)

@admin.register(LinkReferido)
class LinkReferidoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'rifa', 'transaccion_origen', 'usado', 'fecha_creacion', 'fecha_expiracion')
    search_fields = ('codigo', 'transaccion_origen__folio', 'rifa__nombre')
    list_filter = ('usado', 'rifa')

@admin.register(ConfiguracionReferidos)
class ConfiguracionReferidosAdmin(admin.ModelAdmin):
    list_display = ('activo', 'monto_minimo_para_generar', 'monto_minimo_para_validar', 'permitir_cadena_referidos')
    readonly_fields = ('id',)