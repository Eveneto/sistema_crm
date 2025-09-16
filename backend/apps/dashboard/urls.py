from django.urls import path
from .views import health_check, ready_check, performance_metrics

urlpatterns = [
    # Health check endpoints
    path('health/', health_check, name='health_check'),
    path('ready/', ready_check, name='ready_check'),
    path('metrics/', performance_metrics, name='performance_metrics'),
    # Dashboard URLs will be implemented here
]
