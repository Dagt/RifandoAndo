# rifas_project/celery.py

import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv
import environ

# === Variables de entorno ===
load_dotenv()
env = environ.Env()

# === Config Redis con rediss incluido ===
REDIS_URL = env.str("REDIS_URL", default="redis://localhost:6379/0")

# === Configuración base de Celery ===
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rifas_project.settings')

app = Celery('rifas_project')
app.config_from_object('django.conf:settings', namespace='CELERY')

# === Usar la misma URL original, incluso si es rediss:// ===
app.conf.broker_url = REDIS_URL
app.conf.result_backend = REDIS_URL

# === Descubrir tareas ===
app.autodiscover_tasks()

# === Tareas periódicas programadas ===
app.conf.beat_schedule = {
    'liberar-boletos-cada-minuto': {
        'task': 'rifas_app.tasks.liberar_boletos_expirados',
        'schedule': crontab(),
    },
    'actualizar-estado-rifas': {
        'task': 'rifas_app.tasks.actualizar_estado_rifas',
        'schedule': crontab(minute=1, hour=0),
    },
}
