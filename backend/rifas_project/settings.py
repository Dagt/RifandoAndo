import os
from pathlib import Path
from datetime import timedelta
import environ

# Carga variables de entorno desde .env
env = environ.Env(
    DEBUG=(bool, False)
)
environ.Env.read_env(os.path.join(Path(__file__).resolve().parent.parent, '.env'))

BASE_DIR = Path(__file__).resolve().parent.parent

# Seguridad
SECRET_KEY = env("SECRET_KEY", default="insecure-dev-key")
DEBUG = env("DEBUG", default=False)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["*"])

# Aplicaciones
INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django_celery_beat',
    'rifas_app',
]

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'rifas_project.urls'

# Plantillas (usa build de React)
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'frontend' / 'build'],  # React build folder
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'rifas_project.wsgi.application'

# Base de datos (usa DATABASE_URL de Heroku si está disponible)
DATABASES = {
    'default': env.db(default='sqlite:///db.sqlite3')
}

# Redis y Celery
CELERY_BROKER_URL = env('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env('REDIS_URL', default='redis://localhost:6379/0')
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Archivos estáticos
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'frontend' / 'build' / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Archivos multimedia
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Internacionalización
LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'America/Mexico_City'
USE_I18N = True
USE_TZ = True

# CORS
CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS", default=True)

# Autenticación
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# APIs externas
TWILIO_ACCOUNT_SID = env("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = env("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = env("TWILIO_PHONE_NUMBER")

CONEKTA_API_KEY = env("CONEKTA_API_KEY")
CONEKTA_API_VERSION = env("CONEKTA_API_VERSION")

# Campo ID por defecto
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
