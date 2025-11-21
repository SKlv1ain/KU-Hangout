# tests/test_notifications_api.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone

from users.models import Users
from plans.models import Plans, PlanImage
from notifications.models import Notification

class NotificationAPITestCase(TestCase):
    def setUp(self):
        # Create users
        self.user = Users.objects.create_user(username="user1", password="pass123")
        self.other_user = Users.objects.create_user(username="user2", password="pass123")

        # Create a plan
        self.plan = Plans.objects.create(
            title="Test Plan",
            description="Test plan description",
            location="Test location",
            leader_id=self.other_user,
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5
        )

        # Create notifications
        self.notif1 = Notification.objects.create(
            user=self.user,
            notification_type="PLAN_CREATED",
            topic="PLAN",
            message="Plan created!",
            plan=self.plan,
            actor=self.other_user
        )
        self.notif2 = Notification.objects.create(
            user=self.user,
            notification_type="PLAN_REMINDER",
            topic="PLAN",
            message="Reminder for your plan",
            plan=self.plan,
            actor=self.other_user
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_list_notifications(self):
        url = reverse("notifications-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(len(response.data["notifications"]), 2)

    def test_list_notifications_with_unread_only(self):
        url = reverse("notifications-list")
        response = self.client.get(url, {"unread_only": "true"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["unread_count"], 2)

        # Mark one as read
        self.notif1.mark_as_read()
        response = self.client.get(url, {"unread_only": "true"})
        self.assertEqual(response.data["unread_count"], 1)

    def test_notification_summary(self):
        url = reverse("notifications-summary")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_count"], 2)
        self.assertEqual(response.data["unread_count"], 2)
        self.assertIsNotNone(response.data["latest_notification"])

    def test_mark_all_read(self):
        url = reverse("notifications-mark-all-read")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["updated_count"], 2)
        self.assertEqual(response.data["unread_count"], 0)

    def test_mark_single_notification_read(self):
        url = reverse("notifications-mark-read", args=[self.notif1.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)

    def test_delete_notification(self):
        url = reverse("notifications-delete", args=[self.notif1.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_deleted)

    def test_clear_notifications(self):
        url = reverse("notifications-clear")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["cleared_count"], 2)
        self.assertEqual(Notification.objects.filter(user=self.user, is_deleted=False).count(), 0)

    def test_list_notifications_invalid_topic(self):
        url = reverse("notifications-list")
        response = self.client.get(url, {"topic": "INVALID"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_mark_all_read_invalid_topic(self):
        url = reverse("notifications-mark-all-read")
        response = self.client.post(url, {"topic": "INVALID"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_clear_notifications_invalid_topic(self):
        url = reverse("notifications-clear")
        response = self.client.post(url, {"topic": "INVALID"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
