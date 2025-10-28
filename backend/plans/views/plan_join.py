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
        Join a plan. Idempotent.
        - Returns 404 if the plan was auto-deleted (or never existed).
        - Sets role:
            LEADER if the user owns the plan
            MEMBER otherwise
        - Increments people_joined only on first MEMBER join.
        """
        try:
            plan = Plans.objects.select_for_update().get(pk=plan_id)
        except Plans.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        role = 'LEADER' if plan.leader_id_id == request.user.id else 'MEMBER'

        # Capacity check only for MEMBERs
        if role == 'MEMBER' and plan.people_joined >= plan.max_people:
            return Response({"detail": "Plan is full."}, status=status.HTTP_409_CONFLICT)

        try:
            participant, created = Participants.objects.get_or_create(
                plan=plan,
                user=request.user,
                defaults={"role": role}
            )
            # If already exists but we detect the user is leader, normalize the role
            if not created and role == 'LEADER' and participant.role != 'LEADER':
                participant.role = 'LEADER'
                participant.save(update_fields=["role"])
        except IntegrityError:
            # Unique race—treat as already joined
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
        Leave a plan. Idempotent.
        - Returns 404 if the plan was auto-deleted (or never existed).
        - Members can leave; leader cannot (optional rule).
        """
        try:
            plan = Plans.objects.select_for_update().get(pk=plan_id)
        except Plans.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        participant = Participants.objects.filter(plan=plan, user=request.user).first()
        if not participant:
            # Not joined -> already "left"
            return Response({
                "id": plan.id,
                "joined": False,
                "people_joined": plan.people_joined,
                "max_people": plan.max_people
            }, status=status.HTTP_200_OK)

        if participant.role == 'LEADER':
            return Response({"detail": "Leader cannot leave the plan they own."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Member leaves
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
