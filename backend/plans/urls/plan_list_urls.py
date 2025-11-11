from django.urls import path
from plans.views.plan_list import PlanListView

urlpatterns = [
    path('list/', PlanListView.as_view(), name='plan-list'),
]
