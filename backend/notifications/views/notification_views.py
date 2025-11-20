from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from notifications.serializers import NotificationSerializer


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        List notifications for the current user.
        Optional: ?unread_only=true
        """
        unread_only = request.query_params.get("unread_only") == "true"

        qs = Notification.objects.filter(user=request.user)
        if unread_only:
            qs = qs.filter(is_read=False)

        serializer = NotificationSerializer(qs, many=True)

        return Response(
            {
                "message": "Notifications retrieved successfully.",
                "status_code": status.HTTP_200_OK,
                "count": qs.count(),
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
        updated = (
            Notification.objects.filter(user=request.user, is_read=False)
            .update(is_read=True, read_at=now)
        )

        return Response(
            {
                "message": "All notifications marked as read.",
                "status_code": status.HTTP_200_OK,
                "updated_count": updated,
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
            notif = Notification.objects.get(pk=pk, user=request.user)
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
        return Response(
            {
                "message": "Notification marked as read.",
                "status_code": status.HTTP_200_OK,
                "notification": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
