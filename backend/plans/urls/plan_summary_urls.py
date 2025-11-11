from django.urls import path
from plans.views.plan_summary import PlanSummaryView

urlpatterns = [
    path('<int:plan_id>/member/', PlanSummaryView.as_view(), name='plan-summary'), #Get member of plan base on plan id
]
