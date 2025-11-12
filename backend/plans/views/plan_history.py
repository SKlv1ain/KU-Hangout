from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from plans.models import Plans
from participants.models import Participants
from users.models import Users
from plans.serializers.plans_serializers import PlansSerializer


class UserJoinedPlansView(APIView):
    """Get all plans that a user has joined."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id=None):
        """
        Get all plans joined by a user.
        
        Examples:
            GET /plans/users/1/plans/  # Get plans for user 1
            GET /plans/users/me/plans/ # Get plans for current user
        """
        # If user_id is 'me' or not provided, use current user
        if user_id == 'me' or user_id is None:
            user = request.user
        else:
            user = get_object_or_404(Users, id=user_id)
        
        # Get all participations for this user
        participations = Participants.objects.filter(
            user=user
        ).select_related('plan').order_by('-joined_at')
        
        # Extract plans and build response
        plans_data = []
        for participation in participations:
            plan = participation.plan
            plans_data.append({
                'plan_id': plan.id,
                'title': plan.title,
                'description': plan.description,
                'location': plan.location,
                'lat': plan.lat,
                'lng': plan.lng,
                'leader_id': plan.leader_id.id,
                'creator_username': plan.leader_id.username,
                'event_time': plan.event_time,
                'max_people': plan.max_people,
                'people_joined': plan.people_joined,
                'create_at': plan.create_at,
                'tags': [{'id': tag.id, 'name': tag.name} for tag in plan.tags.all()],
                'role': participation.role,
                'joined_at': participation.joined_at,
            })
        
        return Response({
            'user_id': user.id,
            'username': user.username,
            'total_plans': len(plans_data),
            'plans': plans_data
        }, status=status.HTTP_200_OK)



class UserPlansByRoleView(APIView):
    """Get plans filtered by user's role (LEADER or MEMBER)."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id=None):
        """
        Get plans grouped by role.
        
        Query params:
            ?role=LEADER  # Get only plans where user is leader
            ?role=MEMBER  # Get only plans where user is member
        """
        # Get user
        if user_id == 'me' or user_id is None:
            user = request.user
        else:
            user = get_object_or_404(Users, id=user_id)
        
        # Get role filter from query params
        role_filter = request.query_params.get('role', None)
        
        # Base query
        query = Participants.objects.filter(user=user).select_related('plan')
        
        # Apply role filter if provided
        if role_filter and role_filter in ['LEADER', 'MEMBER']:
            query = query.filter(role=role_filter)
        
        # Build response
        plans_data = []
        for participation in query.order_by('-joined_at'):
            plan = participation.plan
            plans_data.append({
                'plan_id': plan.id,
                'title': plan.title,
                'description': plan.description,
                'location': plan.location,
                'lat': plan.lat,
                'lng': plan.lng,
                'leader_id': plan.leader_id.id,
                'creator_username': plan.leader_id.username,
                'event_time': plan.event_time,
                'max_people': plan.max_people,
                'people_joined': plan.people_joined,
                'create_at': plan.create_at,
                'tags': [{'id': tag.id, 'name': tag.name} for tag in plan.tags.all()],
                'role': participation.role,
                'joined_at': participation.joined_at,
            })
        
        return Response({
            'user_id': user.id,
            'username': user.username,
            'filter': role_filter or 'all',
            'total_plans': len(plans_data),
            'plans': plans_data
        }, status=status.HTTP_200_OK)
