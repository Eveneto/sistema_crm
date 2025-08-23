"""
CRM Backend URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# TODO: Enable when drf_yasg is installed
# from rest_framework import permissions
# from drf_yasg.views import get_schema_view
# from drf_yasg import openapi

# Swagger Documentation (disabled for now)
# schema_view = get_schema_view(
#    openapi.Info(
#       title="CRM API",
#       default_version='v1',
#       description="API documentation for CRM System",
#       contact=openapi.Contact(email="admin@crm.com"),
#       license=openapi.License(name="MIT License"),
#    ),
#    public=True,
#    permission_classes=(permissions.AllowAny,),
# )

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/auth/', include('apps.authentication.urls')),
    path('api/companies/', include('apps.companies.urls')),
    path('api/kanban/', include('apps.kanban.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    
    # TODO: Enable API Documentation when drf_yasg is installed
    # path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    # path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # path('api/schema/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
