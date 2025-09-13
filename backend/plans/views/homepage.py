from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from plans.model import plans
from plans.serializers.plans_serializers import PlansSerializer

@api_view(['GET'])
def plans_expiring_today(request):
    now = timezone.now()
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)

    today_plans = plans.objects.filter(event_time__gte=start_of_day, event_time__lt=end_of_day)

    if not today_plans.exists():
        return Response({"message": "No plans expiring today"}, status=status.HTTP_200_OK)

    serializer = PlansSerializer(today_plans, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Get plan by ID
@api_view(['GET'])
def get_plan_by_id(request, plan_id):
    try:
        plan = plans.objects.get(id=plan_id)
    except plans.DoesNotExist:
        return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = PlansSerializer(plan)
    return Response(serializer.data, status=status.HTTP_200_OK)