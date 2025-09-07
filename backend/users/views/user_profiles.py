from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import Users
from users.serializers.UserSerializer import user_serializer

# CREATE user
@api_view(['POST'])
def create_user(request):
    serializer = user_serializer(data=request.data)
    if serializer.is_valid(): #check for validation
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED) #if valid save user profiels and send status
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) #if not return error


# READ user
@api_view(['GET'])
def get_user(request, pk):
    try:
        user = Users.objects.get(pk=pk) #check for user primary key (user id)
    except Users.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND) #if not find send status 404 not found

    serializer = user_serializer(user)
    return Response(serializer.data)


# UPDATE user
@api_view(['PUT', 'PATCH'])
def update_user(request, pk):
    try:
        user = Users.objects.get(pk=pk)
    except Users.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = user_serializer(user, data=request.data, partial=True)  # allow partial updates
    if serializer.is_valid():
        serializer.save()  # password handling is inside serializer.update()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# DELETE user
@api_view(['DELETE'])
def delete_user(request, pk):
    try:
        user = Users.objects.get(pk=pk)
    except Users.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    user.delete()
    return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT) #if have user delete that user

#get all users
@api_view(['GET'])
def list_users(request):
    all_users = Users.objects.all()
    serializer = user_serializer(all_users, many=True)
    return Response(serializer.data)