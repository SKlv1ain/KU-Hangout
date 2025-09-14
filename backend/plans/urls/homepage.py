from django.urls import path
from plans.views.homepage import PlansView

urlpatterns = [
    path('today/', PlansView.as_view()),        # GET today’s plans
    path('today/<int:plan_id>/', PlansView.as_view()),  # GET by ID
]
