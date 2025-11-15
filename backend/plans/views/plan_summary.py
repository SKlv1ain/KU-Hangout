from django.db import models 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from plans.models import Plans

class PlanSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, plan_id: int):
        """
        Return a single plan summary with:
        - plan_id
        - title
        - tags: [{id, name}]
        - members: [{user_id, username, role, joined_at}]
        """
        try:
            plan = (
                Plans.objects
                .prefetch_related('tags', 'participants__user')
                .get(pk=plan_id)
            )
        except Plans.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        tags = [{"id": t.id, "name": t.name} for t in plan.tags.all()]

        # Leader first, then by join time
        participants = plan.participants.select_related('user').order_by(
            models.Case(
                models.When(role='LEADER', then=0),
                default=1,
                output_field=models.IntegerField()
            ),
            'joined_at'
        )

        members = [{
            "user_id": p.user.id,
            "username": getattr(p.user, "username", None),
            "role": p.role,
            "joined_at": p.joined_at,
        } for p in participants]

        return Response({
            "plan_id": plan.id,
            "title": plan.title,
            "tags": tags,
            "members": members,
        }, status=status.HTTP_200_OK)
