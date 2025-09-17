from django.urls import path
from users.views.user_profiles import UsersListView, UsersCreateView, UserDetailView

urlpatterns = [
    path('list/', UsersListView.as_view(), name='users-list'),       # GET all users
    path('create/', UsersCreateView.as_view(), name='users-create'), # POST new user
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'), # GET, PUT, PATCH, DELETE single user
]
