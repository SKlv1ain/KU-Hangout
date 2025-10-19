from django.db import transaction, IntegrityError
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from plans.models import Plans
from participants.models import Participants

class PlanJoinView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, plan_id: int):
        """
        Join a plan. Idempotent. Sets role:
          - LEADER if the user is the plan.leader_id
          - MEMBER otherwise
        Also increments Plans.people_joined when a new member joins.
        """
        try:
            plan = Plans.objects.select_for_update().get(pk=plan_id)
        except Plans.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        # Determine role per plan
        role = 'LEADER' if plan.leader_id_id == request.user.id else 'MEMBER'

        # Capacity check (optional, based on your fields)
        if role == 'MEMBER' and plan.people_joined >= plan.max_people:
            return Response({"detail": "Plan is full."}, status=status.HTTP_409_CONFLICT)

        try:
            participant, created = Participants.objects.get_or_create(
                plan=plan,
                user=request.user,
                defaults={"role": role}
            )
            if not created:
                # If the row exists but role changed (e.g., they are leader),
                # keep leader, otherwise keep existing.
                if role == 'LEADER' and participant.role != 'LEADER':
                    participant.role = 'LEADER'
                    participant.save(update_fields=['role'])
        except IntegrityError:
            # Unique race — treat as already joined
            created = False

        if created and role == 'MEMBER':
            plan.people_joined = plan.people_joined + 1
            plan.save(update_fields=['people_joined'])

        return Response({
            "id": plan.id,
            "joined": True,
            "role": role,
            "people_joined": plan.people_joined,
            "max_people": plan.max_people
        }, status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request, plan_id: int):
        """
        Leave a plan. Idempotent. Members can leave; leader typically cannot (optional).
        """
        try:
            plan = Plans.objects.select_for_update().get(pk=plan_id)
        except Plans.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        # Prevent leader from leaving their own plan (optional rule)
        deleted = 0
        participant = Participants.objects.filter(plan=plan, user=request.user).first()
        if participant:
            if participant.role == 'LEADER':
                return Response({"detail": "Leader cannot leave the plan they own."},
                                status=status.HTTP_400_BAD_REQUEST)
            # member can leave
            deleted, _ = Participants.objects.filter(pk=participant.pk).delete()
            if deleted:
                plan.people_joined = max(plan.people_joined - 1, 0)
                plan.save(update_fields=['people_joined'])

        return Response({
            "id": plan.id,
            "joined": False,
            "people_joined": plan.people_joined,
            "max_people": plan.max_people
        }, status=status.HTTP_200_OK)
