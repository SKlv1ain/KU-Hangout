from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone

from users.models import Users
from plans.models import Plans
from participants.models import Participants


class PlanHistoryTests(APITestCase):

    def setUp(self):
        self.client = APIClient()

        # Create user
        self.user = Users.objects.create_user(
            username="owner",
            password="password123"
        )
        self.client.force_authenticate(user=self.user)

        # URL
        self.url = reverse("plan-history")

    # ------------------------
    # AUTHENTICATION
    # ------------------------
    def test_history_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 401)

    # ------------------------
    # EMPTY HISTORY
    # ------------------------
    def test_history_empty(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(len(response.data["plans"]), 0)

    # ------------------------
    # OWNER HISTORY (CREATOR)
    # ------------------------
    def test_history_as_creator(self):
        plan = Plans.objects.create(
            title="Owner Event",
            description="Test event",
            location="Bangkok",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=self.user
        )

        # Auto add leader as participant is NOT done here,
        # but history should still include plans where leader = user
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["plans"][0]["id"], plan.id)

    # ------------------------
    # HISTORY AS PARTICIPANT
    # ------------------------
    def test_history_as_participant(self):
        other_user = Users.objects.create_user(username="x", password="123")

        plan = Plans.objects.create(
            title="Joined Event",
            description="Test join",
            location="CNX",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=other_user
        )

        Participants.objects.create(plan=plan, user=self.user, role="MEMBER")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["plans"][0]["id"], plan.id)

    # ------------------------
    # MULTIPLE PLANS (JOINED + CREATED)
    # ------------------------
    def test_history_mixed(self):
        # created by user
        plan1 = Plans.objects.create(
            title="Created Plan",
            description="Plan A",
            location="BKK",
            event_time=timezone.now() + timezone.timedelta(days=3),
            max_people=10,
            leader_id=self.user
        )

        # joined by user
        other_user = Users.objects.create_user(username="y", password="123")
        plan2 = Plans.objects.create(
            title="Joined Plan",
            description="Plan B",
            location="CNX",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=10,
            leader_id=other_user
        )
        Participants.objects.create(plan=plan2, user=self.user, role="MEMBER")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

        ids = [p["id"] for p in response.data["plans"]]
        self.assertIn(plan1.id, ids)
        self.assertIn(plan2.id, ids)

    # ------------------------
    # ORDERING (REVERSE BY event_time)
    # ------------------------
    def test_history_ordering(self):
        t1 = timezone.now() + timezone.timedelta(days=1)
        t2 = timezone.now() + timezone.timedelta(days=3)

        # older event
        plan_old = Plans.objects.create(
            title="Old Event",
            description="Old",
            location="BKK",
            event_time=t1,
            max_people=5,
            leader_id=self.user
        )

        # newer event
        plan_new = Plans.objects.create(
            title="New Event",
            description="New",
            location="BKK",
            event_time=t2,
            max_people=5,
            leader_id=self.user
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)

        returned_ids = [p["id"] for p in response.data["plans"]]

        # Must be ordered newest first
        self.assertEqual(returned_ids, [plan_new.id, plan_old.id])
