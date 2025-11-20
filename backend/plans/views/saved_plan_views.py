from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from plans.models import SavedPlan, Plans
from plans.serializers.saved_plan_serializer import SavedPlanSerializer
from plans.serializers.plans_serializers import PlansSerializer


class SavedPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, plan_id: int):
        """Save a plan for the current user (idempotent)."""
        try:
            plan = Plans.objects.get(pk=plan_id)  # pylint: disable=no-member
        except Plans.DoesNotExist:  # pylint: disable=no-member
            return Response(
                {"error": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Use get_or_create to make it idempotent
        saved_plan, created = SavedPlan.objects.get_or_create(  # pylint: disable=no-member
            user=request.user,
            plan=plan
        )

        serializer = SavedPlanSerializer(saved_plan, context={'request': request})
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    def delete(self, request, plan_id: int):
        """Unsave a plan for the current user."""
        try:
            saved_plan = SavedPlan.objects.get(  # pylint: disable=no-member
                user=request.user,
                plan_id=plan_id
            )
            saved_plan.delete()
            return Response(
                {"message": "Plan unsaved successfully."},
                status=status.HTTP_200_OK
            )
        except SavedPlan.DoesNotExist:  # pylint: disable=no-member
            return Response(
                {"message": "Plan was not saved."},
                status=status.HTTP_200_OK  # Idempotent - already unsaved
            )


class SavedPlansListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all saved plans for the current user."""
        saved_plans = SavedPlan.objects.filter(  # pylint: disable=no-member
            user=request.user
        ).select_related('plan').order_by('-saved_at')

        # Extract plans from saved_plans
        plans = [saved_plan.plan for saved_plan in saved_plans]
        
        serializer = PlansSerializer(plans, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

