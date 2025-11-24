from django.urls import path
from . import views
from .oauth_views import GoogleLogin

urlpatterns = [
    path("auth/register", views.RegisterView.as_view(), name="auth-register"),
    path("auth/login", views.LoginView.as_view(), name="auth-login"),
    path("auth/logout", views.LogoutView.as_view(), name="auth-logout"),
    path("users/me", views.MeView.as_view(), name="users-me"),
    
    # OAuth endpoints
    path("oauth/google", GoogleLogin.as_view(), name="google-login"),
    
]