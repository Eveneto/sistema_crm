from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import CommunityViewSet, CommunityMemberViewSet

# Router principal para comunidades
router = DefaultRouter()
router.register(r'communities', CommunityViewSet, basename='community')

# Router aninhado para membros de comunidades
communities_router = routers.NestedDefaultRouter(
    router, 
    r'communities', 
    lookup='community'
)
communities_router.register(
    r'members', 
    CommunityMemberViewSet, 
    basename='community-members'
)

urlpatterns = [
    path('', include(router.urls)),
    path('', include(communities_router.urls)),
]
