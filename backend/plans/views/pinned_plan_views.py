from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from plans.models import PinnedPlan, Plans
from plans.serializers.pinned_plan_serializer import PinnedPlanSerializer
from plans.serializers.plans_serializers import PlansSerializer


class PinnedPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, plan_id: int):
        """Pin a plan for the current user (idempotent)."""
        try:
            plan = Plans.objects.get(pk=plan_id)  # pylint: disable=no-member
        except Plans.DoesNotExist:  # pylint: disable=no-member
            return Response(
                {"error": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Use get_or_create to make it idempotent
        pinned_plan, created = PinnedPlan.objects.get_or_create(  # pylint: disable=no-member
            user=request.user,
            plan=plan
        )

        serializer = PinnedPlanSerializer(pinned_plan, context={'request': request})
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    def delete(self, request, plan_id: int):
        """Unpin a plan for the current user."""
        try:
            pinned_plan = PinnedPlan.objects.get(  # pylint: disable=no-member
                user=request.user,
                plan_id=plan_id
            )
            pinned_plan.delete()
            return Response(
                {"message": "Plan unpinned successfully."},
                status=status.HTTP_200_OK
            )
        except PinnedPlan.DoesNotExist:  # pylint: disable=no-member
            return Response(
                {"message": "Plan was not pinned."},
                status=status.HTTP_200_OK  # Idempotent - already unpinned
            )


class PinnedPlansListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all pinned plans for the current user."""
        pinned_plans = PinnedPlan.objects.filter(  # pylint: disable=no-member
            user=request.user
        ).select_related('plan').order_by('-pinned_at')

        # Extract plans from pinned_plans
        plans = [pinned_plan.plan for pinned_plan in pinned_plans]
        
        serializer = PlansSerializer(plans, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

