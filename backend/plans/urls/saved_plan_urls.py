from django.urls import path
from plans.views.saved_plan_views import SavedPlanView, SavedPlansListView

urlpatterns = [
    path('saved/', SavedPlansListView.as_view(), name='saved-plans-list'),
    path('<int:plan_id>/save/', SavedPlanView.as_view(), name='save-plan'),
]

