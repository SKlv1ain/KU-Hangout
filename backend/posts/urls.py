from django.urls import path
from .views import create_plan

urlpatterns = [
    path('new/', create_plan, name='create_plan'),
]
