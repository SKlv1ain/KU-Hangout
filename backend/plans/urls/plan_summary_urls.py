from django.urls import path
from plans.views.plan_summary import PlanSummaryView

urlpatterns = [
    path('<int:plan_id>/summary/', PlanSummaryView.as_view(), name='plan-summary'),
]
