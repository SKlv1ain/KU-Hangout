from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import users
from users.serializers import UserSerializer

# CREATE user
@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid(): #check for validation
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED) #if valid save user profiels and send status
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) #if not return error


# READ user
@api_view(['GET'])
def get_user(request, pk):
    try:
        user = users.objects.get(pk=pk) #check for user primary key (user id)
    except users.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND) #if not find send status 404 not found

    serializer = UserSerializer(user)
    return Response(serializer.data)


# UPDATE user
@api_view(['PUT'])
def update_user(request, pk):
    try:
        user = users.objects.get(pk=pk)
    except users.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user, data=request.data, partial=True)  # allow partial update
    if serializer.is_valid():
        if 'password' in request.data:
            user.set_password(request.data['password'])
            user.save()
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE user
@api_view(['DELETE'])
def delete_user(request, pk):
    try:
        user = users.objects.get(pk=pk)
    except users.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    user.delete()
    return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT) #if have user delete that user
