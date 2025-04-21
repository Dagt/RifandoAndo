web: gunicorn rifas_project.wsgi --chdir backend
worker: cd backend && celery -A rifas_project.celery worker --loglevel=info
beat: cd backend && celery -A rifas_project.celery beat --loglevel=info
