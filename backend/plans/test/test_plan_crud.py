import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.utils import timezone
from unittest.mock import patch

from users.models import Users
from plans.models import Plans
from participants.models import Participants
from notifications.models import Notification


class PlanCreationTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = Users.objects.create_user(
            username="owner",
            password="password123"
        )
        self.client.force_authenticate(user=self.user)

        self.valid_payload = {
            "title": "Morning Soccer",
            "description": "Soccer game in park",
            "location": "Bangkok",
            "event_time": (timezone.now() + timezone.timedelta(days=1)).isoformat(),
            "max_people": 10,
            "tags": [1, 2],
        }

    # ------------------------
    # POST (CREATE)
    # ------------------------
    def test_create_plan_success(self):
        url = reverse("create-plan")
        response = self.client.post(url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertIn("plan", response.data)
        self.assertEqual(response.data["plan"]["title"], "Morning Soccer")

        # Leader should be auto added
        plan_id = response.data["plan"]["id"]
        self.assertTrue(
            Participants.objects.filter(plan_id=plan_id, user=self.user).exists()
        )

    def test_create_plan_unauthenticated(self):
        self.client.force_authenticate(user=None)
        url = reverse("create-plan")
        response = self.client.post(url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, 401)

    def test_create_plan_invalid_data(self):
        url = reverse("create-plan")
        invalid_payload = self.valid_payload.copy()
        invalid_payload["title"] = ""

        response = self.client.post(url, invalid_payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("errors", response.data)

    # ------------------------
    # GET (DETAIL)
    # ------------------------
    def test_get_plan_detail(self):
        plan = Plans.objects.create(
            title="Test",
            description="Desc",
            location="CNX",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=self.user
        )

        url = reverse("plan-detail", kwargs={"pk": plan.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["plan"]["id"], plan.id)

    # ------------------------
    # PUT (UPDATE)
    # ------------------------
    def test_update_plan_success(self):
        plan = Plans.objects.create(
            title="Old",
            description="Desc",
            location="CNX",
            lat=10,
            lng=20,
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=self.user
        )
        Participants.objects.create(plan=plan, user=self.user, role="LEADER")

        url = reverse("plan-detail", kwargs={"pk": plan.id})

        update_payload = {
            "title": "Updated Title",
            "description": "Updated Desc",
            "location": "Bangkok",
            "lat": 14.0,
            "lng": 100.0,
            "event_time": (timezone.now() + timezone.timedelta(days=2)).isoformat(),
            "max_people": 8,
            "tags": ["updated", "soccer"],
        }

        response = self.client.put(url, update_payload, format="json")

        self.assertEqual(response.status_code, 200)

    def test_update_plan_permission_denied(self):
        other_user = Users.objects.create_user(username="x", password="123")
        plan = Plans.objects.create(
            title="Old",
            description="Desc",
            location="CNX",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=other_user
        )

        url = reverse("plan-detail", kwargs={"pk": plan.id})
        response = self.client.put(url, {"title": "Hack"}, format="json")

        self.assertEqual(response.status_code, 403)
        self.assertIn("reason", response.data)

    # ------------------------
    # PATCH
    # ------------------------
    def test_patch_plan_success(self):
        plan = Plans.objects.create(
            title="Old",
            description="Desc",
            location="CNX",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=self.user
        )
        Participants.objects.create(plan=plan, user=self.user, role="LEADER")

        url = reverse("plan-detail", kwargs={"pk": plan.id})
        response = self.client.patch(url, {"description": "New Desc"}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["plan"]["description"], "New Desc")

    # ------------------------
    # DELETE
    # ------------------------
    def test_delete_plan_success(self):
        plan = Plans.objects.create(
            title="Temp",
            description="Desc",
            location="CNX",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=self.user
        )
        Participants.objects.create(plan=plan, user=self.user, role="LEADER")

        url = reverse("plan-detail", kwargs={"pk": plan.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Plans.objects.filter(id=plan.id).exists())

    def test_delete_plan_permission_denied(self):
        other_user = Users.objects.create_user(username="hack", password="123")
        plan = Plans.objects.create(
            title="Temp",
            description="Desc",
            location="CNX",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=other_user
        )

        url = reverse("plan-detail", kwargs={"pk": plan.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, 403)
