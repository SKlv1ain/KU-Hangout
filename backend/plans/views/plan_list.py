from django.db import models  # for Case/When
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from plans.models import Plans

class PlanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Return list of plans with:
        - plan_id
        - title
        - tags: [{id, name}]
        - members: [{user_id, username, role, joined_at}]
        """
        plans = (
            Plans.objects
            .prefetch_related('tags', 'participants__user')
            .order_by('-create_at')
        )

        out = []
        for plan in plans:
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

            out.append({
                "plan_id": plan.id,
                "title": plan.title,
                "tags": tags,
                "members": members,
            })

        return Response(out, status=status.HTTP_200_OK)
