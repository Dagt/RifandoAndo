web: gunicorn rifas_project.wsgi --chdir backend
worker: celery -A rifas_project.celery worker --loglevel=info --chdir backend
beat: celery -A rifas_project.celery beat --loglevel=info --chdir backend
