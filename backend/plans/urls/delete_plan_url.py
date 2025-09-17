from django.urls import path
from plans.views.delete_plan import delete_plan

urlpatterns = [
    path('<int:plan_id>/delete/', delete_plan, name='delete_plan'),
]
