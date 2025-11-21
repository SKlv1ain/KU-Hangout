from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from users.models import Users
from plans.models import Plans, SavedPlan
from tags.models import Tags


class SavedPlanTests(APITestCase):

    def setUp(self):
        self.client = APIClient()

        # Users
        self.user = Users.objects.create_user(username="user1", password="pass")
        self.client.force_authenticate(user=self.user)

        # Plan
        self.plan = Plans.objects.create(
            title="Soccer Game",
            description="Fun game",
            location="Bangkok",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=self.user,
            people_joined=1
        )

        # Tag
        self.tag = Tags.objects.create(name="Sports")
        self.plan.tags.add(self.tag)

        # URLs
        self.save_url = reverse("save-plan", kwargs={"plan_id": self.plan.id})
        self.list_url = reverse("saved-plans-list")

    # ------------------------
    # POST (Save plan)
    # ------------------------
    def test_save_plan_success(self):
        """Save a plan successfully."""
        response = self.client.post(self.save_url)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(SavedPlan.objects.filter(user=self.user, plan=self.plan).exists())

    def test_save_plan_idempotent(self):
        """Saving the same plan twice should not duplicate."""
        self.client.post(self.save_url)
        response = self.client.post(self.save_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(SavedPlan.objects.filter(user=self.user, plan=self.plan).count(), 1)

    def test_save_plan_not_found(self):
        """Saving a nonexistent plan returns 404."""
        url = reverse("save-plan", kwargs={"plan_id": 99999})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Plan not found.")

    # ------------------------
    # DELETE (Unsave plan)
    # ------------------------
    def test_unsave_plan_success(self):
        """Unsave a previously saved plan."""
        SavedPlan.objects.create(user=self.user, plan=self.plan)
        response = self.client.delete(self.save_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Plan unsaved successfully.")
        self.assertFalse(SavedPlan.objects.filter(user=self.user, plan=self.plan).exists())

    def test_unsave_plan_idempotent(self):
        """Unsave a plan that was not saved returns idempotent success."""
        response = self.client.delete(self.save_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Plan was not saved.")

    # ------------------------
    # GET (List saved plans)
    # ------------------------
    def test_list_saved_plans(self):
        """List all saved plans for the user."""
        # Save two plans
        plan2 = Plans.objects.create(
            title="Basketball Game",
            description="Fun game 2",
            location="Chiang Mai",
            event_time=timezone.now() + timezone.timedelta(days=2),
            max_people=5,
            leader_id=self.user,
            people_joined=1
        )
        SavedPlan.objects.create(user=self.user, plan=self.plan)
        SavedPlan.objects.create(user=self.user, plan=plan2)

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        titles = [p["title"] for p in response.data]
        self.assertIn("Soccer Game", titles)
        self.assertIn("Basketball Game", titles)

    def test_list_saved_plans_empty(self):
        """Return empty list if no saved plans."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)
