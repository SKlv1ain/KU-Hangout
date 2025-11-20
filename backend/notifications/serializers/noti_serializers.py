from rest_framework import serializers
from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    plan_title = serializers.CharField(source="plan.title", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "message",
            "notification_type",
            "plan",
            "plan_title",
            "is_read",
            "created_at",
        ]
