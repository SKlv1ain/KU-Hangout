from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from participants.models import Participants
from plans.models import Plans
from plans.serializers.plans_serializers import PlansSerializer, PlansWithImagesSerializer


class PlansCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Plans.objects.get(pk=pk)
        except Plans.DoesNotExist:
            return None

    @staticmethod
    def format_errors(serializer_errors):
        """Convert serializer errors into readable strings for the UI."""
        formatted = []
        for field, errors in serializer_errors.items():
            for error in errors:
                if field == "non_field_errors":
                    formatted.append(str(error))
                else:
                    readable = field.replace("_", " ").title()
                    formatted.append(f"{readable}: {error}")
        return formatted

    def _notify_plan_updated(self, plan):
        """Notify the leader and members that the plan has been updated."""
        leader = plan.leader_id

        if leader:
            Notification.objects.create(
                user=leader,
                message=f"You updated your plan '{plan.title}'.",
                notification_type="PLAN_UPDATED",
                plan=plan,
            )

        members = Participants.objects.filter(plan=plan).select_related("user")
        if leader:
            members = members.exclude(user=leader)

        for participant in members:
            Notification.objects.create(
                user=participant.user,
                message=f"{leader.username if leader else 'Leader'} updated the plan '{plan.title}'.",
                notification_type="PLAN_UPDATED",
                plan=plan,
            )

    def post(self, request):
        """Create a new plan with clear success and error responses."""
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
                Notification.objects.create(
                    user=request.user,
                    message=f"You created the plan '{plan.title}'.",
                    notification_type="PLAN_CREATED",
                    plan=plan,
                )
            except Exception as exc:  # pragma: no cover
                return Response(
                    {
                        "message": "You cannot create this plan right now.",
                        "reason": "An unexpected error occurred while saving the plan.",
                        "detail": str(exc),
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
        """Return a single plan (with images) or all plans."""
        if pk:
            plan = self.get_object(pk)
            if not plan:
                return Response(
                    {"message": "Plan not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            serializer = PlansWithImagesSerializer(plan, context={"request": request})
            return Response(
                {
                    "message": "Plan retrieved successfully",
                    "plan": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        plans = Plans.objects.all().order_by("-create_at")
        serializer = PlansSerializer(plans, many=True, context={"request": request})
        return Response(
            {
                "message": "Plans retrieved successfully",
                "count": plans.count(),
                "plans": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        """Full update of a plan."""
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

        if plan.leader_id != request.user:
            return Response(
                {
                    "message": "You cannot update this plan.",
                    "reason": "Only the leader who created the plan can edit it.",
                    "status_code": status.HTTP_403_FORBIDDEN,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

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
                self._notify_plan_updated(updated_plan)
            except Exception as exc:  # pragma: no cover
                return Response(
                    {
                        "message": "Plan update failed.",
                        "reason": "An unexpected error occurred while saving.",
                        "detail": str(exc),
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
        """Partial update with the same validation/notification flow as PUT."""
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

        if plan.leader_id != request.user:
            return Response(
                {
                    "message": "You cannot update this plan.",
                    "reason": "Only the leader who created the plan can edit it.",
                    "status_code": status.HTTP_403_FORBIDDEN,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

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
                self._notify_plan_updated(updated_plan)
            except Exception as exc:  # pragma: no cover
                return Response(
                    {
                        "message": "Plan update failed.",
                        "reason": "An unexpected error occurred while saving.",
                        "detail": str(exc),
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
        """Delete a plan and notify impacted users."""
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
        leader = plan.leader_id
        leader_name = leader.username if leader else "The leader"

        participants = list(
            Participants.objects.filter(plan=plan).select_related("user")
        )

        try:
            plan.delete()
        except Exception as exc:  # pragma: no cover
            return Response(
                {
                    "message": "You cannot delete this plan right now.",
                    "reason": "An unexpected error occurred while deleting the plan.",
                    "detail": str(exc),
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if leader:
            Notification.objects.create(
                user=leader,
                message=f"You deleted your plan '{plan_title}'.",
                notification_type="PLAN_DELETED",
                plan=None,
            )

        for participant in participants:
            if leader and participant.user_id == leader.id:
                continue

            Notification.objects.create(
                user=participant.user,
                message=f"{leader_name} deleted the plan '{plan_title}'.",
                notification_type="PLAN_DELETED",
                plan=None,
            )

        return Response(
            {
                "message": f"Plan '{plan_title}' deleted successfully.",
                "status_code": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

