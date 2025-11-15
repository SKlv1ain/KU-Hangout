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
        Returns human-friendly messages for frontend notifications.
        """
        try:
            plan = Plans.objects.select_for_update().get(pk=plan_id)
        except Plans.DoesNotExist:
            return Response(
                {
                    "message": "You cannot join this plan.",
                    "reason": "The plan you are trying to join does not exist.",
                    "status_code": status.HTTP_404_NOT_FOUND,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        role = 'LEADER' if plan.leader_id_id == request.user.id else 'MEMBER'

        # Capacity check for members
        if role == 'MEMBER' and plan.people_joined >= plan.max_people:
            return Response(
                {
                    "message": "You cannot join this plan.",
                    "reason": "This plan is already full.",
                    "status_code": status.HTTP_409_CONFLICT,
                },
                status=status.HTTP_409_CONFLICT,
            )

        try:
            participant, created = Participants.objects.get_or_create(
                plan=plan,
                user=request.user,
                defaults={"role": role}
            )

            # If user is leader but existing row is MEMBER → upgrade role
            if not created and role == 'LEADER' and participant.role != 'LEADER':
                participant.role = 'LEADER'
                participant.save(update_fields=["role"])

        except IntegrityError as e:
            return Response(
                {
                    "message": "You cannot join this plan right now.",
                    "reason": "There was a problem while saving your participation.",
                    "detail": str(e),
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Only increment people_joined on first MEMBER join
        if role == 'MEMBER' and created:
            Plans.objects.filter(pk=plan.pk).update(people_joined=F('people_joined') + 1)
            plan.refresh_from_db(fields=['people_joined'])

            # Double-check capacity under race conditions
            if plan.people_joined > plan.max_people:
                # rollback this member
                Participants.objects.filter(pk=participant.pk).delete()
                Plans.objects.filter(pk=plan.pk).update(people_joined=F('people_joined') - 1)
                plan.refresh_from_db(fields=['people_joined'])
                return Response(
                    {
                        "message": "You cannot join this plan.",
                        "reason": "This plan just became full. Please try another one.",
                        "status_code": status.HTTP_409_CONFLICT,
                    },
                    status=status.HTTP_409_CONFLICT,
                )

        # Ensure chat membership for joining user (leaders and members)
        try:
            from chat.models import chat_threads, chat_member  # pylint: disable=import-outside-toplevel

            thread, _ = chat_threads.objects.get_or_create(
                plan=plan,
                defaults={
                    "title": f"Chat for {plan.title}",
                    "created_by": plan.leader_id,
                },
            )
            chat_member.objects.get_or_create(thread=thread, user=request.user)
        except Exception as chat_error:  # pragma: no cover - prevent chat failure from blocking join
            print(f"[PlanJoinView] Failed to ensure chat membership for plan {plan_id}: {chat_error}")

        # Reload updated plan & serialize
        plan.refresh_from_db()
        data = PlansSerializer(plan, context={"request": request}).data

        # Human-friendly success message
        if created:
            msg = "You joined this plan successfully."
        else:
            msg = "You are already a member of this plan."

        return Response(
            {
                "message": msg,
                "status_code": status.HTTP_200_OK,
                "joined": True,
                "already_member": not created,
                "role": role,
                "plan": data,
            },
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def delete(self, request, plan_id: int):
        """
        Leave a plan (idempotent).
        - Leader cannot leave their own plan.
        - Never decrement below 1 (leader always counted).
        Returns human-friendly messages for frontend notifications.
        """
        try:
            plan = Plans.objects.select_for_update().get(pk=plan_id)
        except Plans.DoesNotExist:
            return Response(
                {
                    "message": "You cannot leave this plan.",
                    "reason": "The plan you are trying to leave does not exist.",
                    "status_code": status.HTTP_404_NOT_FOUND,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        participant = Participants.objects.filter(plan=plan, user=request.user).first()

        # User is not in this plan → idempotent leave
        if not participant:
            data = PlansSerializer(plan, context={"request": request}).data
            return Response(
                {
                    "message": "You are not a member of this plan.",
                    "status_code": status.HTTP_200_OK,
                    "left": False,
                    "plan": data,
                },
                status=status.HTTP_200_OK,
            )

        # Leader cannot leave their own plan
        if participant.role == 'LEADER':
            return Response(
                {
                    "message": "You cannot leave this plan.",
                    "reason": "The leader cannot leave their own plan. You can delete the plan instead.",
                    "status_code": status.HTTP_400_BAD_REQUEST,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Normal member leave
        deleted, _ = Participants.objects.filter(pk=participant.pk).delete()
        if deleted:
            Plans.objects.filter(pk=plan.pk).update(people_joined=F('people_joined') - 1)
            plan.refresh_from_db(fields=['people_joined'])

            # Safety: never go below 1 (leader)
            if plan.people_joined < 1:
                Plans.objects.filter(pk=plan.pk).update(people_joined=1)
                plan.refresh_from_db(fields=['people_joined'])

            # Remove user from chat thread for this plan
            try:
                from chat.models import chat_member  # pylint: disable=import-outside-toplevel
                chat_member.objects.filter(thread__plan=plan, user=request.user).delete()
            except Exception as chat_error:  # pragma: no cover - graceful degradation
                print(f"[PlanJoinView] Failed to remove chat membership for plan {plan_id}: {chat_error}")

        # Reload plan from database to ensure latest data
        plan = Plans.objects.get(pk=plan_id)  # pylint: disable=no-member
        data = PlansSerializer(plan, context={"request": request}).data

        return Response(
            {
                "message": "You left this plan successfully.",
                "status_code": status.HTTP_200_OK,
                "left": True,
                "plan": data,
            },
            status=status.HTTP_200_OK,
        )
