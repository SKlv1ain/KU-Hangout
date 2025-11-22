from rest_framework import serializers

from notifications.models import Notification
from users.models import Users


class NotificationActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = [
            "id",
            "username",
            "display_name",
            "profile_picture",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    plan_title = serializers.CharField(source="plan.title", read_only=True)
    plan_id = serializers.IntegerField(source="plan.id", read_only=True)
    chat_thread_id = serializers.IntegerField(source="chat_thread.id", read_only=True)
    chat_message_id = serializers.IntegerField(source="chat_message.id", read_only=True)
    actor = NotificationActorSerializer(read_only=True)
    notification_type_display = serializers.CharField(
        source="get_notification_type_display",
        read_only=True,
    )
    topic_display = serializers.CharField(
        source="get_topic_display",
        read_only=True,
    )
    plan_cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "notification_type_display",
            "topic",
            "topic_display",
            "plan",
            "plan_title",
            "plan_id",
            "plan_cover_image",
            "chat_thread",
            "chat_thread_id",
            "chat_message",
            "chat_message_id",
            "actor",
            "action_url",
            "metadata",
            "is_read",
            "read_at",
            "created_at",
            "updated_at",
            "is_deleted",
        ]

    def get_plan_cover_image(self, obj):
        plan = getattr(obj, "plan", None)
        if not plan:
            return None

        images_manager = getattr(plan, "images", None)
        if not images_manager:
            return None

        images = images_manager.all()
        if not images:
            return None

        first_image = images[0]
        return getattr(first_image, "image_url", None)
