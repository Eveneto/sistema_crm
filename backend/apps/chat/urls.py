from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet

# Configurar routers para as APIs REST
router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='chatroom')
# ChatMessageViewSet não é registrado separadamente
# Mensagens são acessadas via ChatRoomViewSet actions

urlpatterns = [
    path('', include(router.urls)),
]
