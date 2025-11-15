from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from plans.models import Plans
from plans.serializers.plans_serializers import PlansSerializer, PlansWithImagesSerializer


class PlansCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        """Helper method to get plan by pk"""
        try:
            return Plans.objects.get(pk=pk)
        except Plans.DoesNotExist:
            return None

    def format_errors(self, serializer_errors):
        """Format serializer errors into readable messages"""
        formatted_errors = []
        for field, errors in serializer_errors.items():
            for error in errors:
                if field == "non_field_errors":
                    formatted_errors.append(str(error))
                else:
                    # Convert field name to readable format (e.g., max_people -> Max People)
                    readable_field = field.replace('_', ' ').title()
                    formatted_errors.append(f"{readable_field}: {str(error)}")
        return formatted_errors

    def post(self, request):
        """
        Create a new plan.

        Returns clear, human-friendly error messages so the frontend
        can show them as notifications.
        """

        # Extra safety check (though IsAuthenticated already enforced)
        if not request.user.is_authenticated:
            return Response(
                {
                    "message": "You cannot create a plan.",
                    "reason": "You must log in before creating a plan.",
                    "status_code": status.HTTP_401_UNAUTHORIZED,
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = PlansSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            try:
                plan = serializer.save()
            except Exception as e:
                # Catch unexpected errors during save (DB issues, etc.)
                return Response(
                    {
                        "message": "You cannot create this plan right now.",
                        "reason": "An unexpected error occurred while saving the plan.",
                        "detail": str(e),  # you can remove this in production
                        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response(
                {
                    "message": "Plan created successfully.",
                    "status_code": status.HTTP_201_CREATED,
                    "plan": PlansSerializer(plan, context={"request": request}).data,
                },
                status=status.HTTP_201_CREATED,
            )

        # Validation failed
        formatted_errors = self.format_errors(serializer.errors)
        return Response(
            {
                "message": "You cannot create this plan because some information is invalid.",
                "status_code": status.HTTP_400_BAD_REQUEST,
                "errors": formatted_errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


    def get(self, request, pk=None):
        """Get plan details (single or list)"""
        if pk:
            # Get single plan with images
            plan = self.get_object(pk)
            if not plan:
                return Response(
                    {"message": "Plan not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = PlansWithImagesSerializer(plan, context={"request": request})
            return Response(
                {
                    "message": "Plan retrieved successfully",
                    "plan": serializer.data
                },
                status=status.HTTP_200_OK
            )
        else:
            # List all plans (without images for performance)
            plans = Plans.objects.all().order_by('-created_at')
            serializer = PlansSerializer(plans, many=True, context={"request": request})
            return Response(
                {
                    "message": "Plans retrieved successfully",
                    "count": plans.count(),
                    "plans": serializer.data
                },
                status=status.HTTP_200_OK
            )

    def put(self, request, pk):
        """Full update of a plan with human-friendly error messages."""
        plan = self.get_object(pk)

        if not plan:
            return Response(
                {
                    "message": "You cannot update this plan.",
                    "reason": "The plan you are trying to edit does not exist.",
                    "status_code": status.HTTP_404_NOT_FOUND,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Permission check
        if plan.leader_id != request.user:
            return Response(
                {
                    "message": "You cannot update this plan.",
                    "reason": "Only the leader who created the plan can edit it.",
                    "status_code": status.HTTP_403_FORBIDDEN,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Prevent leader change
        incoming = request.data.copy()
        incoming.pop("leader_id", None)

        serializer = PlansSerializer(
            plan,
            data=incoming,
            partial=False,
            context={"request": request},
        )

        if serializer.is_valid():
            try:
                updated_plan = serializer.save()
            except Exception as e:
                return Response(
                    {
                        "message": "Plan update failed.",
                        "reason": "An unexpected error occurred while saving.",
                        "detail": str(e),
                        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response(
                {
                    "message": "Plan updated successfully.",
                    "status_code": status.HTTP_200_OK,
                    "plan": PlansSerializer(updated_plan, context={"request": request}).data,
                },
                status=status.HTTP_200_OK,
            )

        # Validation error → human friendly
        formatted_errors = self.format_errors(serializer.errors)
        return Response(
            {
                "message": "You cannot update this plan because some information is invalid.",
                "errors": formatted_errors,
                "status_code": status.HTTP_400_BAD_REQUEST,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, pk):
        """Partial update of a plan with consistent notifications."""
        plan = self.get_object(pk)

        if not plan:
            return Response(
                {
                    "message": "You cannot update this plan.",
                    "reason": "The plan you are trying to edit does not exist.",
                    "status_code": status.HTTP_404_NOT_FOUND,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Permission check
        if plan.leader_id != request.user:
            return Response(
                {
                    "message": "You cannot update this plan.",
                    "reason": "Only the leader who created the plan can edit it.",
                    "status_code": status.HTTP_403_FORBIDDEN,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Prevent leader change
        incoming = request.data.copy()
        incoming.pop("leader_id", None)

        serializer = PlansSerializer(
            plan,
            data=incoming,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            try:
                updated_plan = serializer.save()
            except Exception as e:
                return Response(
                    {
                        "message": "Plan update failed.",
                        "reason": "An unexpected error occurred while saving.",
                        "detail": str(e),
                        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_INTERNAL_SERVER_ERROR,
                )

            return Response(
                {
                    "message": "Plan updated successfully.",
                    "status_code": status.HTTP_200_OK,
                    "plan": PlansSerializer(updated_plan, context={"request": request}).data,
                },
                status=status.HTTP_200_OK,
            )

        # Validation error → human friendly
        formatted_errors = self.format_errors(serializer.errors)
        return Response(
            {
                "message": "You cannot update this plan because some information is invalid.",
                "errors": formatted_errors,
                "status_code": status.HTTP_400_BAD_REQUEST,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        """
        Delete a plan.

        Returns clear messages for:
        - Plan not found
        - No permission (not leader)
        - Successful delete
        """
        plan = self.get_object(pk)
        if not plan:
            return Response(
                {
                    "message": "You cannot delete this plan.",
                    "reason": "The plan you are trying to delete does not exist.",
                    "status_code": status.HTTP_404_NOT_FOUND,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check permission
        if plan.leader_id != request.user:
            return Response(
                {
                    "message": "You cannot delete this plan.",
                    "reason": "Only the leader who created the plan can delete it.",
                    "status_code": status.HTTP_403_FORBIDDEN,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        plan_title = plan.title
        try:
            plan.delete()
        except Exception as e:
            return Response(
                {
                    "message": "You cannot delete this plan right now.",
                    "reason": "An unexpected error occurred while deleting the plan.",
                    "detail": str(e),  # remove in production if you don't want to expose
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": f"Plan '{plan_title}' deleted successfully.",
                "status_code": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )