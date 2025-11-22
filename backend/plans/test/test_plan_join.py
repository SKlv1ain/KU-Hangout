from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from users.models import Users
from plans.models import Plans
from participants.models import Participants
from notifications.models import Notification


class PlanJoinViewTests(APITestCase):

    def setUp(self):
        self.client = APIClient()

        # Main user
        self.user = Users.objects.create_user(
            username="owner",
            password="password123"
        )
        self.client.force_authenticate(self.user)

        # Another user
        self.other_user = Users.objects.create_user(
            username="other",
            password="password123"
        )

        # Base plan
        self.plan = Plans.objects.create(
            title="Test Plan",
            description="Join test",
            location="Bangkok",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            people_joined=1,  # leader counts as 1
            leader_id=self.other_user
        )

        # Updated URL: same endpoint for join (POST) & leave (DELETE)
        self.join_leave_url = reverse("plan-join", kwargs={"plan_id": self.plan.id})

    # ------------------------
    # JOIN TESTS (POST)
    # ------------------------

    def test_join_plan_success(self):
        """User joins plan as MEMBER first time."""
        response = self.client.post(self.join_leave_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["joined"], True)
        self.assertEqual(response.data["already_member"], False)
        self.assertEqual(response.data["role"], "MEMBER")

        self.assertTrue(
            Participants.objects.filter(plan=self.plan, user=self.user).exists()
        )

        self.plan.refresh_from_db()
        self.assertEqual(self.plan.people_joined, 2)

        # Notifications created
        self.assertEqual(Notification.objects.filter(plan=self.plan).count(), 2)

    def test_join_plan_idempotent_second_time(self):
        """Second join attempt → no increment, no duplicate."""
        Participants.objects.create(plan=self.plan, user=self.user, role="MEMBER")
        before = self.plan.people_joined

        response = self.client.post(self.join_leave_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["already_member"], True)

        self.plan.refresh_from_db()
        self.assertEqual(self.plan.people_joined, before)

    def test_join_plan_leader_role(self):
        """Leader joining should assign LEADER role and NOT increment counter."""
        self.client.force_authenticate(self.other_user)  # leader

        response = self.client.post(self.join_leave_url)

        self.assertEqual(response.data["role"], "LEADER")

        self.plan.refresh_from_db()
        self.assertEqual(self.plan.people_joined, 1)  # unchanged

    def test_join_full_plan(self):
        """Cannot join when plan is full."""
        self.plan.max_people = 1
        self.plan.save()

        response = self.client.post(self.join_leave_url)

        self.assertEqual(response.status_code, 409)
        self.assertIn("already full", response.data["reason"])

    def test_join_nonexistent_plan(self):
        url = reverse("plan-join", kwargs={"plan_id": 99999})
        response = self.client.post(url)

        self.assertEqual(response.status_code, 404)
        self.assertIn("does not exist", response.data["reason"])

    # ------------------------
    # LEAVE TESTS (DELETE)
    # ------------------------

    def test_leave_plan_success(self):
        """Member leaves plan, counter decrements."""
        Participants.objects.create(plan=self.plan, user=self.user, role="MEMBER")
        self.plan.people_joined = 2
        self.plan.save()

        response = self.client.delete(self.join_leave_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["left"], True)

        self.plan.refresh_from_db()
        self.assertEqual(self.plan.people_joined, 1)  # never drops below 1 (leader)

        self.assertFalse(
            Participants.objects.filter(plan=self.plan, user=self.user).exists()
        )

        # Notifications created
        self.assertEqual(Notification.objects.filter(plan=self.plan).count(), 2)

    def test_leave_idempotent_when_not_member(self):
        """If user is not in the plan, leaving is idempotent."""
        response = self.client.delete(self.join_leave_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["left"], False)

        self.plan.refresh_from_db()
        self.assertEqual(self.plan.people_joined, 1)

    def test_leave_plan_leader_forbidden(self):
        """Leader cannot leave; they must delete plan instead."""
        self.client.force_authenticate(self.other_user)  # leader
        Participants.objects.create(plan=self.plan, user=self.other_user, role="LEADER")

        response = self.client.delete(self.join_leave_url)

        self.assertEqual(response.status_code, 400)
        self.assertIn("leader cannot leave", response.data["reason"].lower())

    def test_leave_nonexistent_plan(self):
        url = reverse("plan-join", kwargs={"plan_id": 99999})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, 404)
        self.assertIn("does not exist", response.data["reason"])
