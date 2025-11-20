from django.urls import path

from plans.views.plan_history import PlanHistoryView

urlpatterns = [
    path('history/', PlanHistoryView.as_view(), name='plan-history'),
]

