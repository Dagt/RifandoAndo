import os
import sys
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv
import environ
from urllib.parse import urlparse

# === Cargar variables de entorno ===
load_dotenv()
env = environ.Env()

# === Leer REDIS_URL correctamente ===
redis_url_raw = env.str("REDIS_URL", default="redis://localhost:6379/0")
redis_parsed = urlparse(redis_url_raw)
if redis_parsed.scheme == "rediss":
    redis_url_clean = f"redis://{redis_parsed.hostname}:{redis_parsed.port}"
else:
    redis_url_clean = redis_url_raw

# === Configuración de Celery ===
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rifas_project.settings')

app = Celery('rifas_project')
app.config_from_object('django.conf:settings', namespace='CELERY')

# === Sobrescribir Redis si el settings aún no lo toma correctamente ===
app.conf.broker_url = redis_url_clean
app.conf.result_backend = redis_url_clean

app.autodiscover_tasks()

# === Tareas periódicas ===
app.conf.beat_schedule = {
    'liberar-boletos-cada-minuto': {
        'task': 'rifas_app.tasks.liberar_boletos_expirados',
        'schedule': crontab(),
    },
    "actualizar-estado-rifas": {
        "task": "rifas_app.tasks.actualizar_estado_rifas",
        "schedule": crontab(minute=1, hour=0),
    },
}

# === Asegurar que el path del proyecto esté en sys.path ===
current_path = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_path, ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
