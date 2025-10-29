from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    #bind chat room to plan id
    re_path(r'ws/plan/(?P<plan_id>\d+)/$', consumers.PlanChatConsumer.as_asgi()),
]
