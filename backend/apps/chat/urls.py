from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet, ChatMessageViewSet, ChatAttachmentViewSet

# Configurar routers para as APIs REST
router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='chatroom')
router.register(r'messages', ChatMessageViewSet, basename='chatmessage')
router.register(r'attachments', ChatAttachmentViewSet, basename='chatattachment')

urlpatterns = [
    path('', include(router.urls)),
]
