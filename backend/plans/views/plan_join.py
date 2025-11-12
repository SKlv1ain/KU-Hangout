from django.db import transaction, IntegrityError
from django.db.models import F
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from plans.models import Plans
from participants.models import Participants
from plans.serializers.plans_serializers import PlansSerializer


class PlanJoinView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, plan_id: int):
        """
        Join a plan (idempotent).
        - Leader is already counted on create; don't increment for leader.
        - Increment only on the first MEMBER join.
        - Enforce capacity safely under concurrency.
        """
        try:
            plan = Plans.objects.select_for_update().get(pk=plan_id)
        except Plans.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        role = 'LEADER' if plan.leader_id_id == request.user.id else 'MEMBER'

        if role == 'MEMBER' and plan.people_joined >= plan.max_people:
            return Response({"detail": "Plan is full."}, status=status.HTTP_409_CONFLICT)

        try:
            participant, created = Participants.objects.get_or_create(
                plan=plan,
                user=request.user,
                defaults={"role": role}
            )
            if not created and role == 'LEADER' and participant.role != 'LEADER':
                participant.role = 'LEADER'
                participant.save(update_fields=["role"])
        except IntegrityError:
            created = False

        if role == 'MEMBER' and created:
            Plans.objects.filter(pk=plan.pk).update(people_joined=F('people_joined') + 1)
            plan.refresh_from_db(fields=['people_joined'])

            # double-check capacity under race
            if plan.people_joined > plan.max_people:
                Participants.objects.filter(pk=participant.pk).delete()
                Plans.objects.filter(pk=plan.pk).update(people_joined=F('people_joined') - 1)
                plan.refresh_from_db(fields=['people_joined'])
                return Response({"detail": "Plan is full."}, status=status.HTTP_409_CONFLICT)

        # return full plan including 'members'
        data = PlansSerializer(plan, context={"request": request}).data
        return Response(data, status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request, plan_id: int):
        """
        Leave a plan (idempotent).
        - Leader cannot leave their own plan.
        - Never decrement below 1 (leader always counted).
        """
        try:
            plan = Plans.objects.select_for_update().get(pk=plan_id)
        except Plans.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        participant = Participants.objects.filter(plan=plan, user=request.user).first()
        if not participant:
            data = PlansSerializer(plan, context={"request": request}).data
            return Response(data, status=status.HTTP_200_OK)

        if participant.role == 'LEADER':
            return Response({"detail": "Leader cannot leave the plan they own."},
                            status=status.HTTP_400_BAD_REQUEST)

        deleted, _ = Participants.objects.filter(pk=participant.pk).delete()
        if deleted:
            Plans.objects.filter(pk=plan.pk).update(people_joined=F('people_joined') - 1)
            plan.refresh_from_db(fields=['people_joined'])
            if plan.people_joined < 1:
                Plans.objects.filter(pk=plan.pk).update(people_joined=1)
                plan.refresh_from_db(fields=['people_joined'])

        # Reload plan from database to ensure we have the latest data
        plan = Plans.objects.get(pk=plan_id)  # pylint: disable=no-member
        
        # Return full plan data including updated people_joined count
        data = PlansSerializer(plan, context={"request": request}).data
        print(f"[DEBUG] Leave plan - plan_id: {plan_id}, people_joined: {plan.people_joined}, serialized people_joined: {data.get('people_joined')}")
        return Response(data, status=status.HTTP_200_OK)

