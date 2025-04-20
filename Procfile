web: gunicorn backend.rifas_project.wsgi --chdir backend
worker: celery -A backend.rifas_project.celery worker --loglevel=info
beat: celery -A backend.rifas_project.celery beat --loglevel=info
