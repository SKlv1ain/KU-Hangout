from django.urls import path
from users.views.user_profiles import (
    UsersListView, 
    UsersCreateView, 
    UserDetailView,
    UserProfileByUsernameView,
    UserPlansView,
    UserContributionsView
)

urlpatterns = [
    path('list/', UsersListView.as_view(), name='users-list'),       # GET all users
    path('create/', UsersCreateView.as_view(), name='users-create'), # POST new user
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'), # GET, PUT, PATCH, DELETE single user
    path('profile/<str:username>/', UserProfileByUsernameView.as_view(), name='user-profile-by-username'), # GET user by username
    path('<str:username>/plans/', UserPlansView.as_view(), name='user-plans'), # GET user plans
    path('<str:username>/contributions/', UserContributionsView.as_view(), name='user-contributions'), # GET user contributions
]
