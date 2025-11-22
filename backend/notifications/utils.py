from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .serializers.noti_serializers import NotificationSerializer


def push_notification_to_user(notification):
    """
    Push a Notification instance to the user's WebSocket group.
    """
    channel_layer = get_channel_layer()
    user = notification.user
    group_name = f"user_{user.id}"

    data = NotificationSerializer(notification).data

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "notification",  # calls NotificationConsumer.notification
            "notification": data,
        }
    )
