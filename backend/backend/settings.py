INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'django_ratelimit',  # Rate limiting
    'apps.authentication',
    'apps.companies',
    'apps.kanban',  # Adicionar o app kanban
    # ...existing code...
]