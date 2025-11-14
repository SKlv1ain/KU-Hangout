from django.urls import path

from chat.views import UserChatThreadsView

urlpatterns = [
    path("threads/", UserChatThreadsView.as_view(), name="chat-threads"),
]

