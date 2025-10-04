from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from plans.models import Plans
from plans.serializers.plans_serializers import PlansSerializer

class PlansCreate(APIView):
    permission_classes = [IsAuthenticated]  #require JWT token

    def get_object(self, pk):
        try:
            return Plans.objects.get(pk=pk)
        except Plans.DoesNotExist:
            return None

    # POST: create a new plan
    def post(self, request):
        serializer = PlansSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(leader_id=request.user)
            return Response(serializer.data, status=201)
        else:
            print(serializer.errors)  # tell exactly what casue the error
            return Response(serializer.errors, status=400)

    # PUT: update a plan
    def put(self, request, pk):
        plan = self.get_object(pk)
        if not plan:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        if plan.leader_id != request.user.id:  #only owner can edit
            return Response({"error": "You do not have permission to edit this plan."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = PlansSerializer(plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, pk):
        plan = self.get_object(pk)
        if not plan:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        if plan.leader_id != request.user.id:  #only owner can delete
            return Response({"error": "You do not have permission to delete this plan."},
                            status=status.HTTP_403_FORBIDDEN)

        plan.delete()
        return Response({"message": "Plan deleted successfully"},
                        status=status.HTTP_204_NO_CONTENT)

