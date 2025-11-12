from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from plans.models import Plans
from participants.models import Participants
from plans.serializers.plans_serializers import PlansSerializer


class PlanMembershipView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, plan_id: int):
        """
        Return full plan (including 'members') and convenience flags:
        - joined: whether requester is part of the plan
        - role: requester's role or None
        """
        try:
            plan = Plans.objects.prefetch_related('participants__user').get(pk=plan_id)
        except Plans.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        data = PlansSerializer(plan, context={"request": request}).data

        # joined/role shortcuts (optional, but handy for UI)
        participant = Participants.objects.filter(plan=plan, user=request.user).only('role').first()
        if participant:
            data["joined"] = True
            data["role"] = participant.role
        elif plan.leader_id_id == request.user.id:
            data["joined"] = True
            data["role"] = "LEADER"
        else:
            data["joined"] = False
            data["role"] = None

        return Response(data, status=status.HTTP_200_OK)
