from django.urls import path
from plans.views.edit_plan import edit_plan

urlpatterns = [
    path('<int:plan_id>/edit/', edit_plan, name='edit_plan'),
]
