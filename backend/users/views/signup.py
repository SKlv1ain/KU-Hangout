from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views import View

class SignUpView(View):
    def get(self, request, **kwargs):
        # Placeholder for frontend
        return JsonResponse({"message": "This is the KU Hangout sign-up page (frontend not implemented yet)."})

    def post(self, request, **kwargs):
        username = request.POST.get('username')
        password = request.POST.get('password')

        if not username or not password:
            return JsonResponse({"error": "Username and password are required."}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "This username already exists. Please choose another one."}, status=400)

        User.objects.create_user(username=username, password=password)
        return JsonResponse({"message": "Account created successfully! Please log in."}, status=201)