from django.db import transaction
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from plans.models import Plans
from plans.serializers.plans_serializers import PlansSerializer


class PlansCreate(APIView):
    permission_classes = [IsAuthenticated]  # require JWT token

    # --- helper: delete all expired plans in one shot ---
    def _purge_expired_plans(self) -> int:
        """
        Delete all plans whose event_time has passed. Returns number deleted.
        """
        now = timezone.now()
        qs = Plans.objects.filter(event_time__lte=now)  # <-- use event_time
        count = qs.count()
        if count:
            qs.delete()  # CASCADE will remove Participants safely
        return count

    
    permission_classes = [IsAuthenticated]  #require JWT token

    def get_object(self, pk):
        try:
            return Plans.objects.get(pk=pk)
        except Plans.DoesNotExist:
            return None

    @transaction.atomic
    def post(self, request):
        self._purge_expired_plans()

        serializer = PlansSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Force current user as owner/leader
        plan = serializer.save(leader_id=request.user)

        # Optional: reject already-expired plan
        if getattr(plan, "event_time", None) and plan.event_time <= timezone.now():
            plan.delete()
            return Response(
                {"detail": "event_time must be in the future."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            PlansSerializer(plan, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


    @transaction.atomic
    def put(self, request, pk):
        # opportunistic cleanup
        self._purge_expired_plans()

        plan = self.get_object(pk)
        if not plan:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        if plan.leader_id_id != request.user.id:
            return Response({"detail": "You do not have permission to edit this plan."},
                            status=status.HTTP_403_FORBIDDEN)

        incoming = request.data.copy()
        incoming.pop("leader_id", None)

        serializer = PlansSerializer(plan, data=incoming, partial=True, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        plan = serializer.save()

        # Auto-delete if now in the past (your rule)
        if getattr(plan, "event_time", None) and plan.event_time <= timezone.now():
            plan_id = plan.id
            plan.delete()
            return Response(
                {"detail": f"Plan {plan_id} reached its time and was auto-deleted."},
                status=status.HTTP_200_OK
            )

        return Response(PlansSerializer(plan, context={"request": request}).data,
                        status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request, pk):
        # opportunistic cleanup
        self._purge_expired_plans()

        plan = self.get_object(pk)
        if not plan:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        if plan.leader_id_id != request.user.id:
            return Response({"detail": "You do not have permission to delete this plan."},
                            status=status.HTTP_403_FORBIDDEN)

        plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
