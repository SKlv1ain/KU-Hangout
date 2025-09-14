from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import Users
from users.serializers.UserSerializer import user_serializer

class UsersView(APIView):
    """
    Class-based view to handle CRUD operations for Users
    """

    def get_object(self, pk):
        try:
            return Users.objects.get(pk=pk)
        except Users.DoesNotExist:
            return None

    # GET single user or query specific field
    def get(self, request, pk=None):
        if pk:
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

        # GET all users
        all_users = Users.objects.all()
        serializer = user_serializer(all_users, many=True)
        return Response(serializer.data)

    # POST: create user
    def post(self, request):
        serializer = user_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PUT/PATCH: update user
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
        return self.put(request, pk)  # reuse PUT logic for PATCH

    # DELETE: remove user
    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
