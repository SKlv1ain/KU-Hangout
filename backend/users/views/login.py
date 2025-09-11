# users/views/login.py
from django.views import View
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from users.models import Users

@method_decorator(csrf_exempt, name='dispatch')
class SignInView(View):
    def get(self, request, **kwargs):
        return JsonResponse({
            "message": "Login endpoint. Send POST with username and password."
        })

    def post(self, request, **kwargs):
        try:
            username = request.POST.get("username")
            password = request.POST.get("password")

            if not username or not password:
                return JsonResponse({"error": "Username and password required."}, status=400)

            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                return JsonResponse({"message": f"Login successful! Welcome {user.username}"})
            else:
                return JsonResponse({"error": "Invalid username or password."}, status=401)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
