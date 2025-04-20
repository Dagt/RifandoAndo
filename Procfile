web: gunicorn rifas_project.wsgi --chdir backend
worker: celery -A rifas_project worker --loglevel=info --chdir backend
beat: celery -A rifas_project beat --loglevel=info --chdir backend
