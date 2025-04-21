# rifas_project/celery.py

import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv
import environ

# === Cargar variables de entorno desde .env ===
load_dotenv()
env = environ.Env()

# === Obtener REDIS_URL desde entorno (sin modificarla) ===
REDIS_URL = env.str("REDIS_URL", default="redis://localhost:6379/0")

# === Configuración base de Django ===
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rifas_project.settings')

app = Celery('rifas_project')
app.config_from_object('django.conf:settings', namespace='CELERY')

# === Configurar Redis como broker/backend ===
app.conf.broker_url = REDIS_URL
app.conf.result_backend = REDIS_URL

# === Cargar tareas automáticamente ===
app.autodiscover_tasks()

# === Definir tareas periódicas ===
app.conf.beat_schedule = {
    'liberar-boletos-cada-minuto': {
        'task': 'rifas_app.tasks.liberar_boletos_expirados',
        'schedule': crontab(),  # cada minuto
    },
    'actualizar-estado-rifas': {
        'task': 'rifas_app.tasks.actualizar_estado_rifas',
        'schedule': crontab(minute=1, hour=0),  # cada día a las 00:01
    },
}
