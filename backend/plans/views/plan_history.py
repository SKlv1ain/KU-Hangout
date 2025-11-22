from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from plans.models import Plans
from participants.models import Participants
from plans.serializers.plans_serializers import PlansSerializer


class PlanHistoryView(APIView):
    """
    Return plans that the current user has created or joined in the past.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        participant_plan_ids = Participants.objects.filter(
            user=user
        ).values_list("plan_id", flat=True)

        plans_qs = Plans.objects.filter(
            Q(id__in=participant_plan_ids) | Q(leader_id=user)
        ).order_by("-event_time")

        serializer = PlansSerializer(plans_qs, many=True, context={"request": request})

        return Response(
            {
                "count": len(serializer.data),
                "plans": serializer.data,
            }
        )

