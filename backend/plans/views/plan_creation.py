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
        """Create a new plan"""
        
        # Check if user is authenticated (extra safety check)
        if not request.user.is_authenticated:
            return Response(
                {"message": "You must login before creating a plan"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = PlansSerializer(data=request.data, context={"request": request})
        
        if serializer.is_valid():
            plan = serializer.save()
            return Response(
                {
                    "message": "Plan created successfully",
                    "plan": PlansSerializer(plan, context={"request": request}).data
                },
                status=status.HTTP_201_CREATED
            )
        
        # Format errors to be more readable
        formatted_errors = self.format_errors(serializer.errors)
        
        return Response(
            {
                "message": "Failed to create plan",
                "errors": formatted_errors
            },
            status=status.HTTP_400_BAD_REQUEST
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
        """Update an existing plan (full update)"""
        plan = self.get_object(pk)
        if not plan:
            return Response(
                {"message": "Plan not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if plan.leader_id != request.user:
            return Response(
                {"message": "You do not have permission to edit this plan"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Prevent leader changes
        incoming = request.data.copy()
        incoming.pop("leader_id", None)

        serializer = PlansSerializer(
            plan, 
            data=incoming, 
            partial=False,
            context={"request": request}
        )
        
        if serializer.is_valid():
            updated_plan = serializer.save()
            return Response(
                {
                    "message": "Plan updated successfully",
                    "plan": PlansSerializer(updated_plan, context={"request": request}).data
                },
                status=status.HTTP_200_OK
            )
        
        formatted_errors = self.format_errors(serializer.errors)
        return Response(
            {
                "message": "Failed to update plan",
                "errors": formatted_errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, pk):
        """Partial update of a plan"""
        plan = self.get_object(pk)
        if not plan:
            return Response(
                {"message": "Plan not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if plan.leader_id != request.user:
            return Response(
                {"message": "You do not have permission to edit this plan"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Prevent leader changes
        incoming = request.data.copy()
        incoming.pop("leader_id", None)

        serializer = PlansSerializer(
            plan, 
            data=incoming, 
            partial=True,
            context={"request": request}
        )
        
        if serializer.is_valid():
            updated_plan = serializer.save()
            return Response(
                {
                    "message": "Plan updated successfully",
                    "plan": PlansSerializer(updated_plan, context={"request": request}).data
                },
                status=status.HTTP_200_OK
            )
        
        formatted_errors = self.format_errors(serializer.errors)
        return Response(
            {
                "message": "Failed to update plan",
                "errors": formatted_errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        """Delete a plan"""
        plan = self.get_object(pk)
        if not plan:
            return Response(
                {"message": "Plan not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if plan.leader_id != request.user:
            return Response(
                {"message": "You do not have permission to delete this plan"},
                status=status.HTTP_403_FORBIDDEN
            )

        plan_title = plan.title
        plan.delete()
        return Response(
            {"message": f"Plan '{plan_title}' deleted successfully"}, 
            status=status.HTTP_200_OK
        )