from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from plans.models import Plans
from plans.serializers.plans_serializers import PlansSerializer

class PlansCreate(APIView):
    permission_classes = [IsAuthenticated]  # require JWT token

    def get_object(self, pk):
        try:
            return Plans.objects.get(pk=pk)
        except Plans.DoesNotExist:
            return None

    # POST: create a new plan
    def post(self, request):
        serializer = PlansSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            plan = serializer.save()  # leader set inside serializer.create()
            return Response(
                PlansSerializer(plan, context={"request": request}).data,
                status=status.HTTP_201_CREATED
            )
        else:
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PUT: update a plan
    def put(self, request, pk):
        plan = self.get_object(pk)
        if not plan:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        if plan.leader_id_id != request.user.id:  # only owner can edit
            return Response(
                {"error": "You do not have permission to edit this plan."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Prevent leader changes from client
        incoming = request.data.copy()
        incoming.pop("leader_id", None)

        serializer = PlansSerializer(plan, data=incoming, partial=True, context={"request": request})
        if serializer.is_valid():
            plan = serializer.save()
            return Response(
                PlansSerializer(plan, context={"request": request}).data,
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        plan = self.get_object(pk)
        if not plan:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        if plan.leader_id_id != request.user.id:
            return Response(
                {"error": "You do not have permission to delete this plan."},
                status=status.HTTP_403_FORBIDDEN
            )

        plan.delete()
        return Response({"message": "Plan deleted successfully"}, status=status.HTTP_200_OK)
