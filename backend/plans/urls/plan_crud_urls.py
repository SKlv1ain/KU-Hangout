from django.urls import path
from plans.views.plan_creation import PlansCreate
from plans.views.cleanup_expired_plans import CleanupExpiredPlansView  # <-- add this

urlpatterns = [
    path('create/', PlansCreate.as_view(), name='create-plan'),       # POST new plan
    path('<int:pk>/', PlansCreate.as_view(), name='plan-detail'),     # PUT, DELETE plan by ID
    path('auto-delete-expired/', CleanupExpiredPlansView.as_view(), name='auto-delete-expired'),  # <-- AUTO DELETE expired plans
]
