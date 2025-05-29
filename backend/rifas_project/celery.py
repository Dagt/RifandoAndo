# backend/rifas_project/celery.py

import os
import ssl
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv
import environ

load_dotenv()
env = environ.Env()

# Configuración base
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rifas_project.settings')

REDIS_URL = env.str("REDIS_URL", default="redis://localhost:6379/0")

app = Celery('rifas_project')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Configuración segura para rediss://
if REDIS_URL.startswith("rediss://"):
    ssl_options = {"ssl_cert_reqs": ssl.CERT_NONE}
    app.conf.broker_use_ssl = ssl_options
    app.conf.redis_backend_use_ssl = ssl_options

app.conf.broker_url = REDIS_URL
app.conf.result_backend = REDIS_URL

# Tareas periódicas
app.conf.beat_schedule = {
    'liberar-boletos-cada-minuto': {
        'task': 'rifas_app.tasks.liberar_boletos_expirados',
        'schedule': crontab(minute='*/5'), # Cada 5 minutos
    },
    'actualizar-estado-rifas': {
        'task': 'rifas_app.tasks.actualizar_estado_rifas',
        'schedule': crontab(minute=1, hour=0), #A la media noche
    },
    'marcar-links-referidos-expirados': {
        'task': 'rifas_app.tasks.marcar_links_referidos_expirados',
        'schedule': crontab(minute='*/10'),  # Cada 5 minutos
    },
}

app.autodiscover_tasks()
