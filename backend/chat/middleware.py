from urllib.parse import parse_qs
from channels.db import database_sync_to_async

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Lazy import to avoid "Apps aren't loaded yet"
        from django.contrib.auth.models import AnonymousUser

        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        scope["user"] = AnonymousUser()  # Default

        if token:
            try:
                # Authenticate user with token (async)
                user = await self.authenticate_user(token)
                if user:
                    scope["user"] = user
            except Exception as e:
                print("JWT Middleware error:", e)

        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def authenticate_user(self, token):
        """
        Validate JWT token and return user.
        This method runs in a thread pool to avoid blocking the async event loop.
        """
        from rest_framework_simplejwt.tokens import UntypedToken
        from rest_framework_simplejwt.authentication import JWTAuthentication

        try:
            # Validate token
            UntypedToken(token)
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user
        except Exception as e:
            print(f"Token validation error: {e}")
            return None