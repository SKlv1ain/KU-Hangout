from django.urls import path
from plans.views.pinned_plan_views import PinnedPlanView, PinnedPlansListView

urlpatterns = [
    path('pinned/', PinnedPlansListView.as_view(), name='pinned-plans-list'),
    path('<int:plan_id>/pin/', PinnedPlanView.as_view(), name='pin-plan'),
]

