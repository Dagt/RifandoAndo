import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv
import environ

# Cargar entorno
load_dotenv()
env = environ.Env()

# Configuración base de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rifas_project.settings')

# Crear instancia de Celery
app = Celery('rifas_project')

# Usar configuración desde settings.py (usa CELERY_BROKER_URL, CELERY_RESULT_BACKEND, etc.)
app.config_from_object('django.conf:settings', namespace='CELERY')

# Tareas periódicas
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

# Descubrir tareas
app.autodiscover_tasks()
