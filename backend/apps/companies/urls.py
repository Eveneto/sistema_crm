from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, CompanyContactViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'contacts', CompanyContactViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
