from django.urls import path
from . import views

urlpatterns = [
    # path('register/', views.RegisterView.as_view(), name='register'),
    # path('login/', views.LoginView.as_view(), name='login'),
    # path('me/', views.MeView.as_view(), name='me'),
    # path('logout/', views.LogoutView.as_view(), name='logout'),
    
    path("auth/register", views.RegisterView.as_view(), name="auth-register"),
    path("auth/login", views.LoginView.as_view(), name="auth-login"),
    path("auth/logout", views.LogoutView.as_view(), name="auth-logout"),
]