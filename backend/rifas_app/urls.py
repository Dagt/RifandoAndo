from django.urls import path
from .views import (
    boletos_disponibles,
    confirmar_compra,
    verificar_folio,
    rifas_finalizadas,
    proximas_rifas,
    crear_rifa,
    subir_imagen_rifa,
    resumen_estadisticas,
    listar_rifas,
    eliminar_rifa,
    obtener_rifa,
    editar_rifa,
    rifas_activas,
    listar_transacciones,
    completar_transaccion,
    cancelar_transaccion,
    buscar_boleto,
    conekta_success
)

urlpatterns = [
    path('rifas/', listar_rifas, name="listar_rifas"),
    path('rifas/<int:rifa_id>/', obtener_rifa, name="obtener_rifa"),
    path('rifas/<int:rifa_id>/editar/', editar_rifa, name="editar_rifa"),
    path('rifas/<int:rifa_id>/eliminar/', eliminar_rifa, name="eliminar_rifa"),
    path('rifas/<int:rifa_id>/boletos-disponibles/', boletos_disponibles),
    path('confirmar-compra/', confirmar_compra, name='confirmar_compra'),
    path('verificar/<str:folio>/', verificar_folio),
    path('rifas-finalizadas/', rifas_finalizadas),
    path('proximas-rifas/', proximas_rifas),
    path('crear-rifa/', crear_rifa),
    path('subir-imagen/<int:rifa_id>/', subir_imagen_rifa),
    path('estadisticas/', resumen_estadisticas),
    path("rifas-activas/", rifas_activas, name="rifas_activas"),
    path("transacciones/", listar_transacciones, name="listar_transacciones"),
    path("transacciones/<str:folio>/completar/", completar_transaccion, name="completar_transaccion"),
    path("transacciones/<str:folio>/cancelar/", cancelar_transaccion, name="cancelar_transaccion"),
    path("buscar-boletos/", buscar_boleto, name="buscar_boleto"),
    path("conekta/success/<str:order_id>/", conekta_success),

]
