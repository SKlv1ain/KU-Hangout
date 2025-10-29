from datetime import timedelta
from django.utils import timezone
from django.db.models import F, FloatField, ExpressionWrapper, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from plans.models import Plans
from plans.serializers.plans_serializers import PlansSerializer
from rest_framework.permissions import AllowAny


class PlansView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, plan_id=None):
        # 1) GET by ID
        if plan_id:
            try:
                plan = Plans.objects.get(id=plan_id)
            except Plans.DoesNotExist:
                return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

            serializer = PlansSerializer(plan)

            # Support ?field=<field_name>
            field = request.query_params.get("field", None)
            if field:
                if field in serializer.data:
                    return Response({field: serializer.data[field]}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": f"Field '{field}' not found"}, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data, status=status.HTTP_200_OK)

        # 2) GET by filters
        filter_type = request.query_params.get("filter", None)
        category = request.query_params.get("category", None)  # Get category/tag filter
        search = request.query_params.get("search", None)  # Get search term
        now = timezone.now()
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Start with base queryset (only active plans)
        plans_qs = Plans.objects.filter(event_time__gt=now)

        # Apply filter type
        if filter_type == "hot":
            # Plans with >= 60% capacity filled
            plans_qs = plans_qs.annotate(
                join_ratio=ExpressionWrapper(
                    F("people_joined") * 1.0 / F("max_people"),
                    output_field=FloatField()
                )
            ).filter(join_ratio__gte=0.6).order_by("-join_ratio")

        elif filter_type == "new":
            # return new plan
            last_48h = now - timedelta(hours=48)
            plans_qs = plans_qs.filter(create_at__gte=last_48h).order_by("-create_at")

        elif filter_type == "expiring":
            # return expiring plan (within next 3 days, but still active)
            end_of_day = start_of_day + timedelta(days=3)
            plans_qs = plans_qs.filter(event_time__gte=now, event_time__lte=end_of_day).order_by("event_time")
        
        elif filter_type == "all":
            # return all active plans (not expired)
            plans_qs = plans_qs.order_by("-create_at")

        else:
            # Default = active plans (not expired)
            plans_qs = plans_qs.order_by("-create_at")

        # Apply category/tag filter if provided
        if category and category != "all":
            # Map frontend category IDs to tag names
            category_map = {
                'sports': 'Sports',
                'food': 'Food',
                'travel': 'Travel',
                'art': 'Art',
                'music': 'Music',
                'movie': 'Movies',
                'game': 'Games',
                'other': 'Other'
            }
            tag_name = category_map.get(category.lower(), category)
            # Filter by tag name (case-insensitive)
            plans_qs = plans_qs.filter(tags__name__iexact=tag_name).distinct()

        # Apply search filter if provided
        if search and search.strip():
            # Search in title and description (case-insensitive)
            plans_qs = plans_qs.filter(
                Q(title__icontains=search.strip()) | Q(description__icontains=search.strip())
            ).distinct()

        serializer = PlansSerializer(plans_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
