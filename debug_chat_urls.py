#!/usr/bin/env python
"""
Script para testar as URLs geradas pelo router do chat
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_backend.settings')
sys.path.append('/home/dev_pc/Documentos/crm_freela/backend')
django.setup()

from rest_framework.routers import DefaultRouter
from apps.chat.views import ChatRoomViewSet, ChatMessageViewSet

# Criar router igual ao do urls.py
router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='chatroom')
router.register(r'messages', ChatMessageViewSet, basename='chatmessage')

# Listar todas as URLs geradas
print("URLs geradas pelo router:")
for url_pattern in router.urls:
    print(f"- {url_pattern.pattern}")
    
# Testar especificamente as actions do ChatRoomViewSet
print("\nActions do ChatRoomViewSet:")
viewset = ChatRoomViewSet()
for action_name, action_method in viewset.get_extra_actions():
    print(f"- {action_name}: {action_method.__name__}")
