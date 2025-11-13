import json
import pytest
import datetime
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from channels.routing import URLRouter
from chat.middleware import JWTAuthMiddleware
from chat.routing import websocket_urlpatterns
from rest_framework_simplejwt.tokens import AccessToken
from asgiref.sync import sync_to_async

User = get_user_model()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
class TestChatConsumer:

    async def setup_user_and_token(self):
        """Create user and JWT token safely."""
        user = await sync_to_async(User.objects.create_user)(
            username="testuser",
            password="pass123"
        )
        token = str(AccessToken.for_user(user))
        return user, token

    async def create_valid_plan(self, user, title="Test Plan", desc="Chat testing"):
        """Create a valid plan with all required fields."""
        from plans.models import Plans
        # Adjust field names based on your actual Plans model
        return await sync_to_async(Plans.objects.create)(
            title=title,
            description=desc,
            leader_id=user,
            event_time=datetime.datetime.now(datetime.timezone.utc),
            max_people=5,
        )

    async def test_connect_and_chat_flow(self):
        """Full flow: connect → send → receive → edit → delete."""
        user, token = await self.setup_user_and_token()
        plan = await self.create_valid_plan(user)

        # Setup app + communicator
        application = JWTAuthMiddleware(URLRouter(websocket_urlpatterns))
        communicator = WebsocketCommunicator(
            application, f"/ws/plan/{plan.id}/?token={token}"
        )

        connected, _ = await communicator.connect()
        assert connected, "WebSocket connection failed"

        # Connection confirmation
        response = await communicator.receive_json_from()
        assert response["status"] == "connected"
        assert response["plan_id"] == str(plan.id)

        # History should be empty
        history = await communicator.receive_json_from()
        assert history["type"] == "chat_history"
        assert history["messages"] == []

        # === Send message ===
        await communicator.send_json_to({
            "action": "send_message",
            "message": "Hello world"
        })
        new_message = await communicator.receive_json_from()
        assert new_message["type"] == "new_message"
        assert new_message["message"] == "Hello world"
        msg_id = new_message["message_id"]

        # === Edit message ===
        await communicator.send_json_to({
            "action": "edit_message",
            "message_id": msg_id,
            "message": "Edited text"
        })
        edited = await communicator.receive_json_from()
        assert edited["type"] == "message_edited"
        assert edited["message"] == "Edited text"

        # === Delete message ===
        await communicator.send_json_to({
            "action": "delete_message",
            "message_id": msg_id
        })
        deleted = await communicator.receive_json_from()
        assert deleted["type"] == "message_deleted"
        assert deleted["message_id"] == int(msg_id)

        await communicator.disconnect()

    async def test_connect_with_invalid_token(self):
        """Invalid JWT token should trigger an error response."""
        user = await sync_to_async(User.objects.create_user)(
            username="invaliduser",
            password="test123"
        )
        plan = await self.create_valid_plan(user, title="Invalid Token Plan")

        bad_token = "notavalid.jwt.token"
        application = JWTAuthMiddleware(URLRouter(websocket_urlpatterns))
        communicator = WebsocketCommunicator(
            application, f"/ws/plan/{plan.id}/?token={bad_token}"
        )

        connected, _ = await communicator.connect()
        assert connected

        response = await communicator.receive_json_from()
        assert "error" in response, f"Expected error in response, got {response}"

        await communicator.disconnect()
