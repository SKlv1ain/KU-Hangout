from django.urls import path
from plans.views.homepage import PlansView

urlpatterns = [
    path('list/', PlansView.as_view(), name="plans-list"),             # GET /plans/list/?filter=hot|new|expiring (default=today)
    path('<int:plan_id>/', PlansView.as_view(), name="plan-detail"),  # GET /plans/1/ (single plan, or ?field=title)
]
