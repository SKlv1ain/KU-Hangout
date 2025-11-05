from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from plans.models import Plans


class CleanupExpiredPlansView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Delete all expired plans where event_time <= now.
        """
        now = timezone.now()
        expired_qs = Plans.objects.filter(event_time__lte=now)  # <-- use event_time
        count = expired_qs.count()
        expired_qs.delete()
        return Response({"message": f"Deleted {count} expired plans."}, status=status.HTTP_200_OK)
