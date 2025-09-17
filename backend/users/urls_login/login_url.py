from django.urls import path
from users.views.login import SignInView
from users.views.signup import SignUpView

urlpatterns = [
    path("signin/", SignInView.as_view(), name="signin"),
    path("signup/", SignUpView.as_view(), name="signup"),
]
