from django.urls import path
from plans.views.create_plan import create_plan

urlpatterns = [
    path('new/', create_plan, name='create_plan'),
]
