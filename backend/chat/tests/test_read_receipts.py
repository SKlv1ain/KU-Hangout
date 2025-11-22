from asgiref.sync import async_to_sync
from django.test import TestCase
from django.utils import timezone
from unittest.mock import AsyncMock

from chat.database import ChatDatabase
from chat.handlers import MessageHandler
from chat.models import chat_message_reads, chat_messages, chat_threads
from plans.models import Plans
from users.models import Users


class ChatReadReceiptTests(TestCase):
    def setUp(self):
        self.user1 = Users.objects.create_user(username="alice", password="pass1234")
        self.user2 = Users.objects.create_user(username="bob", password="pass1234")
        self.user3 = Users.objects.create_user(username="carol", password="pass1234")
        self.plan = Plans.objects.create(
            title="Test Plan",
            description="desc",
            location="here",
            leader_id=self.user1,
            event_time=timezone.now(),
            max_people=5,
        )
        self.thread = chat_threads.objects.create(
            title="Chat Thread",
            plan=self.plan,
            created_by=self.user1,
        )
        self.message = chat_messages.objects.create(
            thread=self.thread,
            sender=self.user1,
            body="Hello world",
        )
        self.db = ChatDatabase()

    def test_mark_messages_read_creates_receipt(self):
        async_to_sync(self.db.mark_messages_read)(self.thread, self.user2, [self.message.id])
        exists = chat_message_reads.objects.filter(message=self.message, user=self.user2).exists()
        self.assertTrue(exists)

    def test_get_chat_history_includes_receipts(self):
        chat_message_reads.objects.create(message=self.message, user=self.user2)
        chat_message_reads.objects.create(message=self.message, user=self.user3)

        history = async_to_sync(self.db.get_chat_history)(self.thread)
        self.assertEqual(len(history), 1)
        receipts = history[0].get("read_receipts", [])
        usernames = [entry["username"] for entry in receipts]
        self.assertIn("bob", usernames)
        self.assertIn("carol", usernames)


class MessageHandlerMarkReadTests(TestCase):
    def setUp(self):
        self.user1 = Users.objects.create_user(username="alice", password="pass1234")
        self.user2 = Users.objects.create_user(username="bob", password="pass1234")
        self.plan = Plans.objects.create(
            title="Test Plan",
            description="desc",
            location="here",
            leader_id=self.user1,
            event_time=timezone.now(),
            max_people=5,
        )
        self.thread = chat_threads.objects.create(
            title="Chat Thread",
            plan=self.plan,
            created_by=self.user1,
        )
        self.message = chat_messages.objects.create(
            thread=self.thread,
            sender=self.user1,
            body="Hello",
        )

        class DummyConsumer:
            def __init__(self, thread):
                self.thread = thread
                self.thread_id = thread.id
                self.room_group_name = f"plan_{thread.plan.id}"
                self.channel_layer = type("layer", (), {"group_send": AsyncMock()})()
                self.sent = []

            async def send(self, payload):
                self.sent.append(payload)

        self.consumer = DummyConsumer(self.thread)
        self.handler = MessageHandler(self.consumer)

    def test_handle_mark_read_broadcasts_event(self):
        async_to_sync(self.handler.handle_mark_read)(
            {"message_ids": [self.message.id]},
            self.user2,
        )
        self.consumer.channel_layer.group_send.assert_awaited()
        args, kwargs = self.consumer.channel_layer.group_send.await_args
        self.assertEqual(args[0], self.consumer.room_group_name)
        event = args[1]
        self.assertEqual(event.get("type"), "read_receipt")
        self.assertEqual(event.get("message_id"), self.message.id)
