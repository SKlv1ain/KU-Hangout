from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, UserPublicSerializer

# JWT views จาก simplejwt
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import generics, permissions, status, serializers

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # แนบข้อมูล user กลับไปพร้อม token ให้ตรงกับ frontend ที่คาดว่า { user, token }
    def validate(self, attrs):
        data = super().validate(attrs)
        user_data = UserPublicSerializer(self.user).data
        data["user"] = user_data
        # รวม access token ไว้ใน field token (ตาม frontend)
        data["token"] = data.get("access")
        return data

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    # override create เพื่อคืน token + user ทันที (auto-login)
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(username=response.data["username"])
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserPublicSerializer(user).data,
            "token": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response({"user": UserPublicSerializer(request.user).data})

class LogoutView(APIView):
    # ฝั่ง JWT การ "logout" ฝั่ง server จะมีผลถ้าเราใช้ blacklist (สามารถเพิ่มภายหลัง)
    # ตอนนี้ให้ client เคลียร์ token เอง (เรา return 200 เฉยๆ)
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return Response({"detail": "ok"})
