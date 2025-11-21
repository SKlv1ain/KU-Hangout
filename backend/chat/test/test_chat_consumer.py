# tests/test_chat_consumer.py
import json
import pytest
import asyncio

from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.utils import timezone

from chat.consumers import ChatConsumer
from chat.models import chat_threads, chat_messages, chat_member
from plans.models import Plans

User = get_user_model()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestChatConsumer:
    async def setup_users_and_plan(self):
        # Create users
        self.user = User.objects.create_user(username="user1", password="pass123")
        self.other_user = User.objects.create_user(username="user2", password="pass123")

        # Create a plan
        self.plan = Plans.objects.create(
            title="Test Plan",
            description="Test plan description",
            location="Test location",
            leader_id=self.other_user,
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
        )

        # Add user as participant
        from participants.models import Participants
        Participants.objects.create(user=self.user, plan=self.plan)
    
    async def test_chat_flow(self, settings):
        await self.setup_users_and_plan()

        application = ChatConsumer.as_asgi()

        # Provide scope with authenticated user
        communicator = WebsocketCommunicator(
            application,
            f"/ws/plan/{self.plan.id}/",
            # Mimic ASGI scope
            headers=[(b"cookie", b"")],
        )
        communicator.scope['user'] = self.user

        connected, _ = await communicator.connect()
        assert connected

        # Receive initial connection confirmation
        response = await communicator.receive_json_from()
        assert response['status'] == 'connected'
        assert response['plan_id'] == self.plan.id

        # Receive chat history (empty)
        response = await communicator.receive_json_from()
        assert response['type'] == 'chat_history'
        assert response['messages'] == []

        # Send a new message
        message_text = "Hello world!"
        await communicator.send_json_to({
            "action": "send_message",
            "message": message_text
        })

        # Wait for broadcast
        response = await communicator.receive_json_from()
        assert response['type'] == 'new_message'
        assert response['message'] == message_text
        assert response['user_id'] == self.user.id

        message_id = response['message_id']

        # Edit message
        new_content = "Edited message"
        await communicator.send_json_to({
            "action": "edit_message",
            "message_id": message_id,
            "message": new_content
        })

        response = await communicator.receive_json_from()
        assert response['type'] == 'message_edited'
        assert response['message'] == new_content
        assert response['message_id'] == message_id

        # Delete message
        await communicator.send_json_to({
            "action": "delete_message",
            "message_id": message_id
        })
        response = await communicator.receive_json_from()
        assert response['type'] == 'message_deleted'
        assert response['message_id'] == message_id

        # Disconnect
        await communicator.disconnect()
