from rest_framework import serializers
from .models import Rifa, Galeria, BoletoSeleccionado, Transaccion

#Serializer para rifas activas
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
        return [request.build_absolute_uri(img.imagen.url) for img in obj.imagenes.all()]


#Serializer para rifas con estado finalzadas para presentar a los ganadores
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

#Serializer de rifas en estado "en espera" (Creadas pero no activas)
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
        return [request.build_absolute_uri(img.imagen.url) for img in obj.imagenes.all()]

    def get_boletos_vendidos(self, obj):
        return obj.boletoseleccionado_set.count()

#Serializer para la transaccion
class TransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        fields = [
            "id", "folio", "nombre_completo", "correo", "telefono",
            "estado", "metodo_pago", "monto", "fecha_creacion", "rifa_nombre"
        ]
