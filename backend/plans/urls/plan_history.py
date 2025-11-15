from django.urls import path
from plans.views.plan_history import (
    UserJoinedPlansView,
    UserPlansByRoleView
)

urlpatterns = [
    path('users/<int:user_id>/plans/', UserJoinedPlansView.as_view(), name='user-joined-plans'), # Get plan/sers/<int:user_id>/plans/ get specific user history by id
    path('users/me/plans/', UserJoinedPlansView.as_view(), name='my-joined-plans'), # Get only user that still login
]