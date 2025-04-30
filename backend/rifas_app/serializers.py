from rest_framework import serializers
from .models import Rifa, Galeria, BoletoSeleccionado, Transaccion, CodigoPromocional

class RifaSerializer(serializers.ModelSerializer):
    imagen_destacada = serializers.SerializerMethodField()
    boletos_vendidos = serializers.SerializerMethodField()
    imagenes = serializers.SerializerMethodField()

    class Meta:
        model = Rifa
        fields = [
            'id',
            'nombre',
            'descripcion',
            'precio_boleto',
            'total_boletos',
            'estado',
            'fecha_fin',
            'fecha_inicio',
            'numero_ganador',
            'enlace_video',
            'boletos_vendidos',
            'imagen_destacada',
            'imagenes',
        ]

    def get_imagen_destacada(self, obj):
        imagen = obj.imagenes.first()
        if imagen and imagen.imagen:
            request = self.context.get('request')
            return request.build_absolute_uri(imagen.imagen.url) if request else imagen.imagen.url
        return None

    def get_boletos_vendidos(self, obj):
        return obj.boletoseleccionado_set.count()

    def get_imagenes(self, obj):
        request = self.context.get('request')
        return [
            request.build_absolute_uri(img.imagen.url) if request else img.imagen.url
            for img in obj.imagenes.all()
        ]

class RifaFinalizadaSerializer(RifaSerializer):
    boletos_pagados = serializers.SerializerMethodField()

    class Meta(RifaSerializer.Meta):
        fields = RifaSerializer.Meta.fields + ['boletos_pagados']

    def get_boletos_pagados(self, obj):
        boletos = BoletoSeleccionado.objects.filter(rifa=obj, pagado=True).select_related("transaccion")
        return [
            {
                "numero": b.numero,
                "transaccion": {
                    "nombre_completo": b.transaccion.nombre_completo
                }
            }
            for b in boletos
        ]

class ProximasRifasSerializer(serializers.ModelSerializer):
    imagen_destacada = serializers.SerializerMethodField()
    imagenes = serializers.SerializerMethodField()
    boletos_vendidos = serializers.SerializerMethodField()

    class Meta:
        model = Rifa
        fields = [
            'id',
            'nombre',
            'descripcion',
            'precio_boleto',
            'total_boletos',
            'estado',
            'fecha_inicio',
            'fecha_fin',
            'imagen_destacada',
            'imagenes',
            'boletos_vendidos',
        ]

    def get_imagen_destacada(self, obj):
        imagen = obj.imagenes.first()
        if imagen and imagen.imagen:
            request = self.context.get("request")
            return request.build_absolute_uri(imagen.imagen.url) if request else imagen.imagen.url
        return None

    def get_imagenes(self, obj):
        request = self.context.get("request")
        return [
            request.build_absolute_uri(img.imagen.url) if request else img.imagen.url
            for img in obj.imagenes.all()
        ]

    def get_boletos_vendidos(self, obj):
        return obj.boletoseleccionado_set.count()

class TransaccionSerializer(serializers.ModelSerializer):
    es_referido = serializers.SerializerMethodField()
    uso_codigo = serializers.SerializerMethodField()

    class Meta:
        model = Transaccion
        fields = [
            "id", "folio", "nombre_completo", "correo", "telefono",
            "estado", "metodo_pago", "monto", "fecha_creacion", "rifa_nombre",
            "es_referido", "uso_codigo"
        ]

    def get_es_referido(self, obj):
        return bool(obj.codigo_referido)

    def get_uso_codigo(self, obj):
        return bool(obj.codigo_usado)

class CodigoPromocionalSerializer(serializers.ModelSerializer):
    descuento = serializers.SerializerMethodField()
    x = serializers.SerializerMethodField()
    y = serializers.SerializerMethodField()

    class Meta:
        model = CodigoPromocional
        fields = '__all__'

    def get_descuento(self, obj):
        return obj.valor if obj.tipo == "porcentaje" else None

    def get_x(self, obj):
        return obj.minimo_boletos_para_regalo if obj.tipo == "boletos_extra" else None

    def get_y(self, obj):
        return obj.boletos_regalo if obj.tipo == "boletos_extra" else None
