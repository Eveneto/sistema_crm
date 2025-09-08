"""
ASGI config for crm_backend project.
"""

import os
from django.core.asgi import get_asgi_application

# Configurar Django primeiro
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_backend.settings')
django_asgi_app = get_asgi_application()

# Importar após configurar Django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from apps.chat.middleware import WebSocketAuthenticationMiddlewareStack
import apps.chat.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        WebSocketAuthenticationMiddlewareStack(
            URLRouter(
                apps.chat.routing.websocket_urlpatterns
            )
        )
    ),
})
