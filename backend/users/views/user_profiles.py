from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Q
from datetime import datetime
from collections import defaultdict
from users.models import Users
from users.serializers.UserSerializer import UserSerializer
from plans.models import Plans, PinnedPlan
from plans.serializers.plans_serializers import PlansSerializer
from participants.models import Participants

# List all users
class UsersListView(APIView):
    """
    GET all users
    """
    def get(self, request):
        all_users = Users.objects.all()
        serializer = UserSerializer(all_users, many=True)
        return Response(serializer.data)

# Create new user
class UsersCreateView(APIView):
    """
    POST new user
    """
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
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
        serializer = UserSerializer(user)
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
        serializer = UserSerializer(user, data=request.data, partial=True)
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


# Get user profile by username
class UserProfileByUsernameView(APIView):
    """
    GET user profile by username
    """
    permission_classes = [AllowAny]
    
    def get(self, request, username):
        try:
            user = Users.objects.get(username=username)
        except Users.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserSerializer(user)
        return Response(serializer.data)


# Get user plans (created and joined)
class UserPlansView(APIView):
    """
    GET plans created by user and plans user joined
    """
    permission_classes = [AllowAny]
    
    def get(self, request, username):
        try:
            user = Users.objects.get(username=username)
        except Users.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get plans created by user
        created_plans = Plans.objects.filter(leader_id=user).order_by('-create_at')
        created_serializer = PlansSerializer(created_plans, many=True, context={'request': request})
        
        # Get plans user joined (as participant, not leader)
        joined_participations = Participants.objects.filter(user=user).select_related('plan')
        joined_plans = [p.plan for p in joined_participations]
        joined_serializer = PlansSerializer(joined_plans, many=True, context={'request': request})
        
        # Get pinned plan IDs for this user
        try:
            pinned_plan_ids = set(
                PinnedPlan.objects.filter(user=user).values_list('plan_id', flat=True)  # pylint: disable=no-member
            )
        except Exception as e:
            # Fallback if PinnedPlan table doesn't exist yet (migration not run)
            print(f"[UserPlansView] Warning: Could not fetch pinned plans: {e}")
            pinned_plan_ids = set()
        
        return Response({
            'created_plans': created_serializer.data,
            'joined_plans': joined_serializer.data,
            'pinned_plan_ids': list(pinned_plan_ids)
        }, status=status.HTTP_200_OK)


# Get user contributions (activity timeline)
class UserContributionsView(APIView):
    """
    GET contribution data for activity graph
    Returns: { date: "YYYY-MM-DD", type: "created" | "joined", plan_id: number, plan_title: string }[]
    """
    permission_classes = [AllowAny]
    
    def get(self, request, username):
        try:
            user = Users.objects.get(username=username)
        except Users.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        contributions = []
        
        # Get plans created by user
        created_plans = Plans.objects.filter(leader_id=user).only('id', 'title', 'create_at')
        for plan in created_plans:
            contributions.append({
                'date': plan.create_at.date().isoformat(),
                'type': 'created',
                'plan_id': plan.id,
                'plan_title': plan.title
            })
        
        # Get plans user joined
        joined_participations = Participants.objects.filter(user=user).select_related('plan').only('plan__id', 'plan__title', 'joined_at')
        for participation in joined_participations:
            contributions.append({
                'date': participation.joined_at.date().isoformat(),
                'type': 'joined',
                'plan_id': participation.plan.id,
                'plan_title': participation.plan.title
            })
        
        # Sort by date
        contributions.sort(key=lambda x: x['date'])
        
        return Response(contributions, status=status.HTTP_200_OK)
