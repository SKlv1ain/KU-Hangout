from django.contrib.auth.models import User
from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class SignUpView(View):
    def get(self, request, **kwargs):
        # Render the signup form template
        return render(request, "signup.html")

    def post(self, request, **kwargs):
        username = request.POST.get("username")
        password = request.POST.get("password")

        if not username or not password:
            return render(request, "signup.html", {
                "error": "Username and password are required."
            })

        if User.objects.filter(username=username).exists():
            return render(request, "signup.html", {
                "error": "This username already exists."
            })

        User.objects.create_user(username=username, password=password)
        return JsonResponse({"message": "Account created successfully! Please log in."}, status=201)
