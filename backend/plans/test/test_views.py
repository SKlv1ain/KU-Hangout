from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from plans.models import Plans
from users.models import Users
from django.utils import timezone
from datetime import timedelta

class PlansViewTests(APITestCase):
    """Tests for PlansView (homepage) GET operations only"""

    def setUp(self):
        now = timezone.now()
        self.user = Users.objects.create_user(username="leader", password="password")

        # Sample plans
        self.plan1 = Plans.objects.create(
            title="Morning Soccer",
            description="Soccer at the park",
            max_people=10,
            people_joined=7,
            create_at=now - timedelta(hours=1),
            event_time=now + timedelta(days=1),
            leader_id=self.user,
        )

        self.plan2 = Plans.objects.create(
            title="Evening Dinner",
            description="Dinner party",
            max_people=5,
            people_joined=2,
            create_at=now - timedelta(days=10),
            event_time=now + timedelta(days=2),
            leader_id=self.user,
        )

        self.plan2.create_at = timezone.now() - timedelta(days=3)
        self.plan2.save()

        # URLs
        self.list_url = reverse("plans-list")
        self.detail_url = lambda plan_id: reverse("plan-detail", kwargs={"plan_id": plan_id})

    def test_get_all_active_plans(self):
        """GET /plans/list/ should return all active plans"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_single_plan(self):
        """GET /plans/<id>/ should return a single plan"""
        response = self.client.get(self.detail_url(self.plan1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], self.plan1.title)

    def test_get_single_plan_field(self):
        """GET /plans/<id>/?field=title should return only the title"""
        response = self.client.get(self.detail_url(self.plan1.id) + "?field=title")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"title": self.plan1.title})

    def test_get_hot_plans(self):
        """GET /plans/list/?filter=hot should return plans with >=60% capacity filled"""
        response = self.client.get(self.list_url + "?filter=hot")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data]
        self.assertIn(self.plan1.title, titles)
        self.assertNotIn(self.plan2.title, titles)

    def test_get_new_plans(self):
        """GET /plans/list/?filter=new should return plans created in last 48h"""
        response = self.client.get(self.list_url + "?filter=new")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data]
        self.assertIn(self.plan1.title, titles)
        self.assertNotIn(self.plan2.title, titles)

    def test_get_expiring_plans(self):
        """GET /plans/list/?filter=expiring should return plans within next 3 days"""
        response = self.client.get(self.list_url + "?filter=expiring")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data]
        self.assertIn(self.plan1.title, titles)
        self.assertIn(self.plan2.title, titles)

    def test_get_plan_search(self):
        """GET /plans/list/?search=dinner should return matching plans"""
        response = self.client.get(self.list_url + "?search=dinner")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], self.plan2.title)

