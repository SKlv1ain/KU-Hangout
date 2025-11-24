from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserPublicSerializer
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import requests

User = get_user_model()


class GoogleLogin(APIView):
    """
    Google OAuth2 login endpoint that accepts Google ID tokens (credential)
    or OAuth access tokens from Google Identity Services.

    Frontend sends the Google token and we verify it before creating/logging in
    the user and returning our JWT tokens.

    Request body:
    {
        "access_token": "google_token_value"
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
            client_id = os.getenv('GOOGLE_CLIENT_ID')
            email = None
            name = ''
            validation_error = None

            # First, assume the incoming value is a Google ID token (credential)
            try:
                idinfo = id_token.verify_oauth2_token(
                    token,
                    google_requests.Request(),
                    client_id
                )
                email = idinfo.get('email')
                name = idinfo.get('name', '')
            except ValueError as exc:
                validation_error = str(exc)

            # Fallback: treat it as an OAuth access token and hit the userinfo endpoint
            if not email:
                try:
                    userinfo_response = requests.get(
                        'https://www.googleapis.com/oauth2/v3/userinfo',
                        params={'access_token': token},
                        timeout=5,
                    )
                    userinfo_response.raise_for_status()
                    profile = userinfo_response.json()
                    email = profile.get('email')
                    name = profile.get('name') or profile.get('given_name') or ''
                except requests.RequestException as exc:
                    if not validation_error:
                        validation_error = str(exc)

            if not email:
                message = validation_error or 'Email not provided by Google'
                return Response(
                    {'error': f'Invalid Google token: {message}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create or get user
            user, _ = User.objects.get_or_create(
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

        except Exception as exc:
            return Response(
                {'error': f'Login failed: {str(exc)}'},
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