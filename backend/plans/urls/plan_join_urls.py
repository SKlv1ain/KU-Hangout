from django.urls import path
from plans.views.plan_join import PlanJoinView

urlpatterns = [
    path('<int:plan_id>/join', PlanJoinView.as_view(), name='plan-join'),  # POST join, DELETE leave
]
