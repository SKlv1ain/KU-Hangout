from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import Users
from plans.models import Plans
from datetime import datetime, timedelta

class PlansCreateTests(APITestCase):

    def setUp(self):
        # Create users
        self.owner = Users.objects.create_user(username="owner", password="pass123")
        self.other_user = Users.objects.create_user(username="other", password="pass123")

        # JWT tokens
        self.owner_token = RefreshToken.for_user(self.owner).access_token
        self.other_token = RefreshToken.for_user(self.other_user).access_token

        # Create a plan by owner
        self.plan = Plans.objects.create(
            title="Evening Dinner",
            description="Dinner at local restaurant",
            location="Bangkok",
            leader_id=self.owner,
            event_time=datetime.now() + timedelta(days=1),
            max_people=5
        )

        # API client
        self.client = APIClient()

    def create_url(self):
        return reverse("create-plan")  # /plans/create/

    def detail_url(self, pk):
        return reverse("plan-update", args=[pk])  # /plans/<id>/

    # ---------------- CREATE ----------------
    def test_create_plan(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.owner_token}')
        data = {
            "title": "Morning Soccer",
            "description": "Soccer game in park",
            "location": "Chiang Mai",
            "event_time": (datetime.now() + timedelta(days=2)).isoformat(),
            "max_people": 10
        }
        response = self.client.post(self.create_url(), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Morning Soccer")
        self.assertEqual(response.data["leader_id"], self.owner.id)

    # ---------------- UPDATE ----------------
    def test_update_plan_by_owner(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.owner_token}')
        data = {"title": "Evening Dinner Updated"}
        response = self.client.put(self.detail_url(self.plan.id), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.plan.refresh_from_db()
        self.assertEqual(self.plan.title, "Evening Dinner Updated")

    def test_update_plan_by_non_owner(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.other_token}')
        data = {"title": "Hacked Title"}
        response = self.client.put(self.detail_url(self.plan.id), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.plan.refresh_from_db()
        self.assertNotEqual(self.plan.title, "Hacked Title")

    def test_update_plan_cannot_change_leader(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.owner_token}')
        data = {"leader_id": self.other_user.id, "title": "Attempt Change Leader"}
        response = self.client.put(self.detail_url(self.plan.id), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.plan.refresh_from_db()
        self.assertEqual(self.plan.leader_id, self.owner)  # leader unchanged
        self.assertEqual(self.plan.title, "Attempt Change Leader")

    # ---------------- DELETE ----------------
    def test_delete_plan_by_owner(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.owner_token}')
        response = self.client.delete(self.detail_url(self.plan.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Plans.objects.filter(id=self.plan.id).exists())

    def test_delete_plan_by_non_owner(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.other_token}')
        response = self.client.delete(self.detail_url(self.plan.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Plans.objects.filter(id=self.plan.id).exists())
