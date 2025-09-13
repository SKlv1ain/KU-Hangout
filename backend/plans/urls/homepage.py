from django.urls import path
from plans.views import homepage

urlpatterns = [
    path('today/', homepage.plans_expiring_today, name='plans-today'),
    path('<int:plan_id>/', homepage.get_plan_by_id, name='get_plan_by_id'),
]
