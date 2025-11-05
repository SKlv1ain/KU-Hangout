from django.urls import re_path
from chat.consumers import ChatConsumer

websocket_urlpatterns = [
    #bind chat room to plan id
    re_path(r'ws/plan/(?P<plan_id>\d+)/$', ChatConsumer.as_asgi()),
]
