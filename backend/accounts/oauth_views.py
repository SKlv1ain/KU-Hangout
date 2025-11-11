from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserPublicSerializer
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
import os

User = get_user_model()


class GoogleLogin(APIView):
    """
    Google OAuth2 login endpoint using JWT credential token.
    
    Frontend sends the Google credential (JWT token) and we verify it,
    then create/login the user and return our JWT tokens.
    
    Request body:
    {
        "access_token": "google_jwt_credential_token"
    }
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        token = request.data.get('access_token')
        
        if not token:
            return Response(
                {'error': 'access_token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify the Google JWT token
            client_id = os.getenv('GOOGLE_CLIENT_ID')
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                client_id
            )
            
            # Get user info from the token
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            
            if not email:
                return Response(
                    {'error': 'Email not provided by Google'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create or get user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],  # Use email prefix as username
                }
            )
            
            # Generate JWT tokens for our app
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserPublicSerializer(user).data,
                'token': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            # Invalid token
            return Response(
                {'error': f'Invalid Google token: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Login failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleLoginCallback(APIView):
    """
    Alternative endpoint for handling Google OAuth callback with authorization code.
    
    This can be used as an alternative to GoogleLogin if you want more control.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        code = request.data.get('code')
        
        if not code:
            return Response(
                {'error': 'Authorization code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process the OAuth code through allauth
        # This is handled by the GoogleLogin view above
        return Response(
            {'message': 'Use /api/oauth/google endpoint instead'},
            status=status.HTTP_400_BAD_REQUEST
        )
