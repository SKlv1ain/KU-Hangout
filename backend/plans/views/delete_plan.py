from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from plans.models import plans

@csrf_exempt
def delete_plan(request, plan_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=403)

    try:
        plan = plans.objects.get(id=plan_id, leader_id=request.user)
    except plans.DoesNotExist:
        return JsonResponse({"error": "Plan not found or not authorized"}, status=404)

    if request.method == "DELETE":
        plan.delete()
        return JsonResponse({"message": "Plan deleted successfully"}, status=200)

    return JsonResponse({"error": "Only DELETE method allowed"}, status=405)
