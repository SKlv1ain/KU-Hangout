from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views import View

class SignInView(View):
    def get(self, request, **kwargs):
        # Placeholder for frontend
        return JsonResponse({"message": "This is the KU Hangout sign-in page (frontend not implemented yet)."})

    def post(self, request, **kwargs):
        username = request.POST.get('username')
        password = request.POST.get('password')

        if not username or not password:
            return JsonResponse({"error": "Username and password are required."}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"message": "Login successful! Welcome to KU Hangout."})
        else:
            return JsonResponse({"error": "Invalid username or password."}, status=401)