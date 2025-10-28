from django.urls import path
from plans.views.plan_join import PlanJoinView
from plans.views.plan_membership import PlanMembershipView  # optional

urlpatterns = [
    path('<int:plan_id>/join/', PlanJoinView.as_view(), name='plan-join'),                # POST join, DELETE leave
    path('<int:plan_id>/membership/', PlanMembershipView.as_view(), name='plan-membership'),  # GET status
]
