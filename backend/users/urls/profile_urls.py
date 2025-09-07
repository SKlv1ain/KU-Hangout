from django.urls import path
from users.views import user_profiles

urlpatterns = [
    path('users/', user_profiles.create_user, name='create-user'), #create
    path('users/<int:pk>/', user_profiles.get_user, name='users-detail'), #get detail
    path('users/<int:pk>/', user_profiles.update_user, name='user-update'), #update user
    path('users/<int:pk>/', user_profiles.delete_user, name='user-delete'), #delete user
]
