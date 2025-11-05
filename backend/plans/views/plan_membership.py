from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from plans.models import Plans
from participants.models import Participants

class PlanMembershipView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, plan_id: int):
        """
        Membership status for a specific plan (safe with auto-deletion).
        """
        try:
            plan = Plans.objects.get(pk=plan_id)
        except Plans.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        # Explicit participation?
        participant = Participants.objects.filter(plan=plan, user=request.user).only('role').first()
        if participant:
            return Response({
                "id": plan.id,
                "joined": True,
                "role": participant.role,
                "people_joined": plan.people_joined,
                "max_people": plan.max_people
            }, status=status.HTTP_200_OK)

        # Owner is implicitly leader for viewing
        if plan.leader_id_id == request.user.id:
            return Response({
                "id": plan.id,
                "joined": True,
                "role": "LEADER",
                "people_joined": plan.people_joined,
                "max_people": plan.max_people
            }, status=status.HTTP_200_OK)

        return Response({
            "id": plan.id,
            "joined": False,
            "role": None,
            "people_joined": plan.people_joined,
            "max_people": plan.max_people
        }, status=status.HTTP_200_OK)
