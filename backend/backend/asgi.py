import os
import django

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

from chat.middleware import JWTAuthMiddleware
import chat.routing
import notifications.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            chat.routing.websocket_urlpatterns
            + notifications.routing.websocket_urlpatterns
        )
    ),
})
