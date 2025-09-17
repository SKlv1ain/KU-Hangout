import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from plans.models import plans

@csrf_exempt
def edit_plan(request, plan_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=403)

    try:
        plan = plans.objects.get(id=plan_id, leader_id=request.user)
    except plans.DoesNotExist:
        return JsonResponse({"error": "Plan not found or not authorized"}, status=404)

    if request.method == "PUT":
        try:
            data = json.loads(request.body)

            for field in ["title", "description", "location", "lat", "lng", "event_time", "max_people"]:
                if field in data:
                    setattr(plan, field, data[field])

            plan.save()

            return JsonResponse({
                "id": plan.id,
                "title": plan.title,
                "description": plan.description,
                "location": plan.location,
                "lat": str(plan.lat) if plan.lat else None,
                "lng": str(plan.lng) if plan.lng else None,
                "event_time": plan.event_time,
                "leader": plan.leader_id.username if plan.leader_id else None,
                "max_people": plan.max_people,
                "people_joined": plan.people_joined,
                "created_at": plan.create_at,
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Only PUT method allowed"}, status=405)
