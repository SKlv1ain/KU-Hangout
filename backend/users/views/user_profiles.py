from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import Users
from users.serializers.UserSerializer import user_serializer

# List all users
class UsersListView(APIView):
    """
    GET all users
    """
    def get(self, request):
        all_users = Users.objects.all()
        serializer = user_serializer(all_users, many=True)
        return Response(serializer.data)

# Create new user
class UsersCreateView(APIView):
    """
    POST new user
    """
    def post(self, request):
        serializer = user_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Single user operations
class UserDetailView(APIView):
    """
    GET / PUT / PATCH / DELETE for single user
    """
    def get_object(self, pk):
        try:
            return Users.objects.get(pk=pk)
        except Users.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = user_serializer(user)
        field = request.query_params.get("field", None)
        if field:
            if field in serializer.data:
                return Response({field: serializer.data[field]})
            return Response({"error": f"Field '{field}' not found"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data)

    def put(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = user_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
