from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from plans.model import plans
from plans.serializers.plans_serializers import PlansSerializer


class PlansView(APIView):
    def get(self, request, plan_id=None):
        # GET by ID
        if plan_id:
            try:
                plan = plans.objects.get(id=plan_id)
            except plans.DoesNotExist:
                return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

            serializer = PlansSerializer(plan)

            # Check for ?field=<field_name>
            field = request.query_params.get("field", None)
            if field:
                if field in serializer.data:
                    return Response({field: serializer.data[field]}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": f"Field '{field}' not found"}, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data, status=status.HTTP_200_OK)

        # GET today’s plans
        now = timezone.now()
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)

        today_plans = plans.objects.filter(event_time__gte=start_of_day, event_time__lt=end_of_day)

        if not today_plans.exists():
            return Response({"message": "No plans expiring today"}, status=status.HTTP_200_OK)

        serializer = PlansSerializer(today_plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
