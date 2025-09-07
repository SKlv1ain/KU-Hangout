from django.urls import path, include

urlpatterns = [
    path('profile/', include('users.urls.profile_urls')), # profile create/edit
]