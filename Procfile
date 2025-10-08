web: cd deafability && python manage.py collectstatic --noinput && python manage.py migrate && gunicorn deafability.wsgi:application --bind 0.0.0.0:$PORT
