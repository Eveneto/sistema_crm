from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.authentication.urls')),
    path('', include('apps.companies.urls')),
    path('', include('apps.kanban.urls')),  # Adicionar URLs do kanban
]