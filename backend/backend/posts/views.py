import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import Plan

@csrf_exempt
@login_required
def create_plan(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            required_fields = ["title", "description", "location", "lat", "lng", "event_time", "max_people"]
            missing = [f for f in required_fields if f not in data]
            if missing:
                return JsonResponse({"error": f"Missing fields: {missing}"}, status=400)

            plan = Plan.objects.create(
                title=data["title"],
                description=data["description"],
                location=data["location"],
                lat=data["lat"],
                lng=data["lng"],
                event_time=data["event_time"],  # frontend should send ISO 8601 string
                leader=request.user,
                max_people=data["max_people"]
            )

            return JsonResponse({
                "id": plan.id,
                "title": plan.title,
                "description": plan.description,
                "location": plan.location,
                "lat": str(plan.lat),
                "lng": str(plan.lng),
                "event_time": plan.event_time,
                "leader": plan.leader.username,
                "max_people": plan.max_people,
                "people_joined": plan.people_joined,
                "created_at": plan.created_at,
            }, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)
