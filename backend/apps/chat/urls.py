from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import ChatRoomViewSet, ChatMessageViewSet, ChatAttachmentViewSet

# Configurar routers para as APIs REST
router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='chatroom')
router.register(r'messages', ChatMessageViewSet, basename='chatmessage')
router.register(r'attachments', ChatAttachmentViewSet, basename='chatattachment')

# Nested router para mensagens dentro de salas
rooms_router = routers.NestedDefaultRouter(router, 'rooms', lookup='room')
rooms_router.register(r'messages', ChatMessageViewSet, basename='room-messages')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(rooms_router.urls)),
]
