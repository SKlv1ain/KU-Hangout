from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import json
from datetime import datetime
from ..model import plans
from tags.models import tags
from users.models import users

@method_decorator(csrf_exempt, name='dispatch')
class CreatePlanView(View):
    def get(self, request, **kwargs):
        """Return available activity types for the frontend dropdown"""
        activity_types = [
            {"value": "sport", "label": "🏃‍♂️ Sport & Fitness"},
            {"value": "drink", "label": "🍹 Drinks & Social"},
            {"value": "study", "label": "📚 Study & Academic"},
            {"value": "food", "label": "🍜 Food & Dining"},
            {"value": "entertainment", "label": "🎬 Entertainment & Movies"},
            {"value": "outdoor", "label": "🌳 Outdoor Activities"},
            {"value": "gaming", "label": "🎮 Gaming"},
            {"value": "shopping", "label": "🛍️ Shopping"},
            {"value": "travel", "label": "✈️ Travel & Exploration"},
            {"value": "culture", "label": "🎨 Arts & Culture"},
            {"value": "music", "label": "🎵 Music & Concerts"},
            {"value": "volunteer", "label": "🤝 Volunteering"},
            {"value": "networking", "label": "💼 Networking & Professional"},
            {"value": "hobby", "label": "🎯 Hobbies & Crafts"},
            {"value": "wellness", "label": "🧘‍♀️ Wellness & Mindfulness"},
        ]
        
        return JsonResponse({
            "activity_types": activity_types,
            "message": "Available activity types retrieved successfully"
        })

    def post(self, request, **kwargs):
        """Create a new plan/post"""
        try:
            # Check if user is authenticated
            if not request.user.is_authenticated:
                return JsonResponse({
                    "error": "You must be logged in to create a plan"
                }, status=401)

            # Get form data
            title = request.POST.get('title')
            description = request.POST.get('description')
            location = request.POST.get('location')
            event_time = request.POST.get('event_time')
            max_people = request.POST.get('max_people')
            tags_value = request.POST.get('tags')

            # Validate required fields
            if not all([title, description, location, event_time, max_people, tags_value]):
                return JsonResponse({
                    "error": "All fields are required: title, description, location, event_time, max_people, tags"
                }, status=400)

            # Validate field lengths
            if len(title) < 3 or len(title) > 100:
                return JsonResponse({
                    "error": "Title must be between 3 and 100 characters"
                }, status=400)

            if len(description) < 10 or len(description) > 200:
                return JsonResponse({
                    "error": "Description must be between 10 and 200 characters"
                }, status=400)

            if len(location) < 3 or len(location) > 100:
                return JsonResponse({
                    "error": "Location must be between 3 and 100 characters"
                }, status=400)

            # Validate max_people
            try:
                max_people_int = int(max_people)
                if max_people_int < 1 or max_people_int > 50:
                    return JsonResponse({
                        "error": "Maximum people must be between 1 and 50"
                    }, status=400)
            except ValueError:
                return JsonResponse({
                    "error": "Maximum people must be a valid number"
                }, status=400)

            # Validate event_time
            try:
                event_datetime = datetime.fromisoformat(event_time.replace('Z', '+00:00'))
                if event_datetime <= datetime.now():
                    return JsonResponse({
                        "error": "Event time must be in the future"
                    }, status=400)
            except ValueError:
                return JsonResponse({
                    "error": "Invalid event time format"
                }, status=400)

            # Get or create the user from users app
            try:
                user_profile = users.objects.get(username=request.user.username)
            except users.DoesNotExist:
                # Create user profile if it doesn't exist
                user_profile = users.objects.create(
                    username=request.user.username,
                    email=request.user.email
                )

            # Get or create the tag
            tag, created = tags.objects.get_or_create(name=tags_value)

            # Create the plan
            plan = plans.objects.create(
                title=title,
                description=description,
                location=location,
                event_time=event_datetime,
                max_people=max_people_int,
                leader_id=user_profile,
                people_joined=1  # Creator is automatically joined
            )

            # Add the tag to the plan
            plan.tags.add(tag)

            return JsonResponse({
                "message": "Plan created successfully! 🎉",
                "plan": {
                    "id": plan.id,
                    "title": plan.title,
                    "description": plan.description,
                    "location": plan.location,
                    "event_time": plan.event_time.isoformat(),
                    "max_people": plan.max_people,
                    "people_joined": plan.people_joined,
                    "leader": plan.leader_id.username,
                    "tags": [tag.name for tag in plan.tags.all()],
                    "created_at": plan.create_at.isoformat()
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({
                "error": f"An unexpected error occurred: {str(e)}"
            }, status=500)


# Additional view for getting all plans (for feed/listing)
class PlanListView(View):
    def get(self, request, **kwargs):
        """Get list of all plans"""
        try:
            # Get query parameters for filtering
            tag_filter = request.GET.get('tag')
            location_filter = request.GET.get('location')
            
            # Base queryset
            plans_queryset = plans.objects.all().order_by('-create_at')
            
            # Apply filters
            if tag_filter:
                plans_queryset = plans_queryset.filter(tags__name=tag_filter)
            
            if location_filter:
                plans_queryset = plans_queryset.filter(location__icontains=location_filter)
            
            # Serialize plans data
            plans_data = []
            for plan in plans_queryset[:20]:  # Limit to 20 recent plans
                plans_data.append({
                    "id": plan.id,
                    "title": plan.title,
                    "description": plan.description,
                    "location": plan.location,
                    "event_time": plan.event_time.isoformat(),
                    "max_people": plan.max_people,
                    "people_joined": plan.people_joined,
                    "leader": plan.leader_id.username,
                    "tags": [tag.name for tag in plan.tags.all()],
                    "created_at": plan.create_at.isoformat(),
                    "is_full": plan.people_joined >= plan.max_people,
                    "spots_left": plan.max_people - plan.people_joined
                })

            return JsonResponse({
                "plans": plans_data,
                "total": len(plans_data),
                "message": "Plans retrieved successfully"
            })

        except Exception as e:
            return JsonResponse({
                "error": f"An error occurred: {str(e)}"
            }, status=500)


# View for joining a plan
class JoinPlanView(View):
    def post(self, request, plan_id, **kwargs):
        """Join an existing plan"""
        try:
            if not request.user.is_authenticated:
                return JsonResponse({
                    "error": "You must be logged in to join a plan"
                }, status=401)

            # Get the plan
            try:
                plan = plans.objects.get(id=plan_id)
            except plans.DoesNotExist:
                return JsonResponse({
                    "error": "Plan not found"
                }, status=404)

            # Check if plan is full
            if plan.people_joined >= plan.max_people:
                return JsonResponse({
                    "error": "This plan is already full"
                }, status=400)

            # Check if user is already the leader
            if plan.leader_id.username == request.user.username:
                return JsonResponse({
                    "error": "You are already the leader of this plan"
                }, status=400)

            # TODO: Add logic to check if user already joined
            # For now, just increment people_joined
            plan.people_joined += 1
            plan.save()

            return JsonResponse({
                "message": f"Successfully joined '{plan.title}'! 🎉",
                "plan": {
                    "id": plan.id,
                    "title": plan.title,
                    "people_joined": plan.people_joined,
                    "spots_left": plan.max_people - plan.people_joined
                }
            })

        except Exception as e:
            return JsonResponse({
                "error": f"An error occurred: {str(e)}"
            }, status=500)
