from django.db.models import Count
from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from notifications.serializers import NotificationSerializer
from plans.models import PlanImage


def _valid_topic_or_none(value):
    if not value:
        return None
    topic_value = value.upper()
    valid_topics = {choice[0] for choice in Notification.TOPIC_CATEGORIES}
    if topic_value not in valid_topics:
        return None
    return topic_value


def _unread_counts_by_topic(user):
    qs = Notification.objects.filter(user=user, is_deleted=False, is_read=False)
    counts = qs.values("topic").annotate(total=Count("id"))
    return {entry["topic"]: entry["total"] for entry in counts}


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    @staticmethod
    def _positive_int(value, default, *, max_value=None):
        try:
            parsed = int(value)
            if parsed < 1:
                raise ValueError
            if max_value:
                return min(parsed, max_value)
            return parsed
        except (TypeError, ValueError):
            return default

    def get(self, request):
        """List notifications for the current user with optional filters and pagination."""

        params = request.query_params
        unread_only = params.get("unread_only") == "true"
        topic_filter = params.get("topic")
        page_size = self._positive_int(params.get("page_size") or params.get("limit"), 20, max_value=50)
        page = self._positive_int(params.get("page"), 1)

        qs = Notification.objects.filter(user=request.user, is_deleted=False)
        if unread_only:
            qs = qs.filter(is_read=False)

        topic_value = _valid_topic_or_none(topic_filter)
        if topic_filter and not topic_value:
            return Response(
                {
                    "message": "Invalid topic parameter.",
                    "status_code": status.HTTP_400_BAD_REQUEST,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if topic_value:
            qs = qs.filter(topic=topic_value)

        total_count = qs.count()
        offset = (page - 1) * page_size
        slice_end = offset + page_size

        plan_images_prefetch = Prefetch(
            "plan__images",
            queryset=PlanImage.objects.order_by("uploaded_at"),
        )

        notifications = (
            qs.select_related("plan", "actor", "chat_thread", "chat_message")
            .prefetch_related(plan_images_prefetch)
            .order_by("-created_at")[offset:slice_end]
        )
        serializer = NotificationSerializer(notifications, many=True)

        unread_qs = Notification.objects.filter(
            user=request.user,
            is_deleted=False,
            is_read=False,
        )
        unread_count = unread_qs.count()
        unread_counts_by_topic = _unread_counts_by_topic(request.user)

        return Response(
            {
                "message": "Notifications retrieved successfully.",
                "status_code": status.HTTP_200_OK,
                "count": total_count,
                "page": page,
                "page_size": page_size,
                "has_next": slice_end < total_count,
                "unread_count": unread_count,
                "unread_counts_by_topic": unread_counts_by_topic,
                "notifications": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Mark all notifications as read for the current user.
        """
        now = timezone.now()
        topic_param = request.data.get("topic") or request.query_params.get("topic")
        topic_filter = _valid_topic_or_none(topic_param)

        if topic_param and not topic_filter:
            return Response(
                {
                    "message": "Invalid topic parameter.",
                    "status_code": status.HTTP_400_BAD_REQUEST,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        filter_kwargs = {
            "user": request.user,
            "is_read": False,
            "is_deleted": False,
        }
        if topic_filter:
            filter_kwargs["topic"] = topic_filter

        updated = Notification.objects.filter(**filter_kwargs).update(is_read=True, read_at=now)

        unread_count = Notification.objects.filter(
            user=request.user,
            is_deleted=False,
            is_read=False,
        ).count()
        unread_counts_by_topic = _unread_counts_by_topic(request.user)

        return Response(
            {
                "message": "All notifications marked as read.",
                "status_code": status.HTTP_200_OK,
                "updated_count": updated,
                "unread_count": unread_count,
                "unread_counts_by_topic": unread_counts_by_topic,
            },
            status=status.HTTP_200_OK,
        )


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk: int):
        """
        Mark a single notification as read.
        """
        try:
            notif = Notification.objects.get(pk=pk, user=request.user, is_deleted=False)
        except Notification.DoesNotExist:
            return Response(
                {
                    "message": "Notification not found.",
                    "status_code": status.HTTP_404_NOT_FOUND,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        notif.mark_as_read()

        serializer = NotificationSerializer(notif)
        unread_count = Notification.objects.filter(
            user=request.user,
            is_deleted=False,
            is_read=False,
        ).count()
        unread_counts_by_topic = _unread_counts_by_topic(request.user)
        return Response(
            {
                "message": "Notification marked as read.",
                "status_code": status.HTTP_200_OK,
                "notification": serializer.data,
                "unread_count": unread_count,
                "unread_counts_by_topic": unread_counts_by_topic,
            },
            status=status.HTTP_200_OK,
        )


class NotificationSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return quick stats about the user's notifications."""

        plan_images_prefetch = Prefetch(
            "plan__images",
            queryset=PlanImage.objects.order_by("uploaded_at"),
        )

        base_qs = Notification.objects.filter(user=request.user, is_deleted=False)
        latest = (
            base_qs.select_related("plan", "actor", "chat_thread", "chat_message")
            .prefetch_related(plan_images_prefetch)
            .order_by("-created_at")
            .first()
        )

        data = {
            "message": "Notification summary retrieved successfully.",
            "status_code": status.HTTP_200_OK,
            "total_count": base_qs.count(),
            "unread_count": base_qs.filter(is_read=False).count(),
            "latest_notification": NotificationSerializer(latest).data if latest else None,
        }

        return Response(data, status=status.HTTP_200_OK)


class NotificationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk: int):
        try:
            notif = Notification.objects.get(pk=pk, user=request.user, is_deleted=False)
        except Notification.DoesNotExist:
            return Response(
                {
                    "message": "Notification not found.",
                    "status_code": status.HTTP_404_NOT_FOUND,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        notif.soft_delete()

        unread_count = Notification.objects.filter(
            user=request.user,
            is_deleted=False,
            is_read=False,
        ).count()
        unread_counts_by_topic = _unread_counts_by_topic(request.user)

        return Response(
            {
                "message": "Notification deleted.",
                "status_code": status.HTTP_200_OK,
                "notification_id": pk,
                "unread_count": unread_count,
                "unread_counts_by_topic": unread_counts_by_topic,
            },
            status=status.HTTP_200_OK,
        )


class NotificationClearView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        topic_param = request.data.get("topic") or request.query_params.get("topic")
        topic_filter = _valid_topic_or_none(topic_param)

        if topic_param and not topic_filter:
            return Response(
                {
                    "message": "Invalid topic parameter.",
                    "status_code": status.HTTP_400_BAD_REQUEST,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        filter_kwargs = {
            "user": request.user,
            "is_deleted": False,
        }
        if topic_filter:
            filter_kwargs["topic"] = topic_filter

        now = timezone.now()
        updated = Notification.objects.filter(**filter_kwargs).update(is_deleted=True, deleted_at=now)

        unread_count = Notification.objects.filter(
            user=request.user,
            is_deleted=False,
            is_read=False,
        ).count()
        unread_counts_by_topic = _unread_counts_by_topic(request.user)

        return Response(
            {
                "message": "Notifications cleared.",
                "status_code": status.HTTP_200_OK,
                "cleared_count": updated,
                "unread_count": unread_count,
                "unread_counts_by_topic": unread_counts_by_topic,
            },
            status=status.HTTP_200_OK,
        )
