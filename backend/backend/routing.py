from chat.routing import websocket_urlpatterns as chat_ws
from notifications.routing import websocket_urlpatterns as noti_ws

websocket_urlpatterns = chat_ws + noti_ws
