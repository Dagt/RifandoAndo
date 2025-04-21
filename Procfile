web: gunicorn rifas_project.wsgi --chdir backend
worker: celery -A rifas_project.celery worker --loglevel=info --workdir backend
beat: celery -A rifas_project.celery beat --loglevel=info --workdir backend
