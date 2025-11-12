from django.urls import path
from plans.views.plan_creation import PlansCreate

urlpatterns = [
    path('create/', PlansCreate.as_view(), name='create-plan'),       # POST new plan
    path('<int:pk>/', PlansCreate.as_view(), name='plan-update'),     # PUT, DELETE plan by ID
]
