# users/urls/profile_urls.py
from django.urls import path
from users.views import user_profiles

urlpatterns = [
    path('create/', user_profiles.create_user, name='user-create'),           # POST
    path('list/', user_profiles.list_users, name='user-list'),                # GET all users
    path('<int:pk>/', user_profiles.get_user, name='user-detail'),            # GET single user
    path('<int:pk>/update/', user_profiles.update_user, name='user-update'),  # PUT
    path('<int:pk>/delete/', user_profiles.delete_user, name='user-delete'),  # DELETE
]
