# rifas_project/celery.py
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rifas_project.settings')

app = Celery('rifas_project')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    # Liberar boletos no pagados cada minuto
    'liberar-boletos-cada-minuto': {
        'task': 'rifas_app.tasks.liberar_boletos_expirados',
        'schedule': crontab(),  # cada minuto
    },
    # Actualizar estado de rifas una vez al día a las 00:01
    "actualizar-estado-rifas": {
        "task": "rifas_app.tasks.actualizar_estado_rifas",
        "schedule": crontab(minute=1, hour=0),
    },
}


# Asegura que la ruta del proyecto esté en sys.path
current_path = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_path, ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
