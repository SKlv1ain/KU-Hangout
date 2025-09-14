from django.urls import path
from users.views.user_profiles import UsersView

urlpatterns = [
    path('', UsersView.as_view()),                  # GET all users / POST new user
    path('<int:pk>/', UsersView.as_view()),         # GET, PUT, PATCH, DELETE single user
]
