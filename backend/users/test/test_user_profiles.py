from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.utils import timezone

from users.models import Users
from plans.models import Plans, PinnedPlan
from participants.models import Participants

class UserProfilesTests(APITestCase):

    def setUp(self):
        self.client = APIClient()

        # Create test users
        self.user1 = Users.objects.create_user(username="user1", password="pass")
        self.user2 = Users.objects.create_user(username="user2", password="pass")
        self.staff_user = Users.objects.create_user(username="staff", password="pass", is_staff=True)

        # Authenticate as user1 by default
        self.client.force_authenticate(user=self.user1)

        # Create test plans
        self.plan1 = Plans.objects.create(
            title="Plan 1",
            description="Desc 1",
            location="Location 1",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=self.user1
        )
        self.plan2 = Plans.objects.create(
            title="Plan 2",
            description="Desc 2",
            location="Location 2",
            event_time=timezone.now() + timezone.timedelta(days=2),
            max_people=5,
            leader_id=self.user2
        )

        # user1 joins plan2 as participant
        Participants.objects.create(user=self.user1, plan=self.plan2, role="MEMBER")

    # ------------------------
    # Users List & Create
    # ------------------------
    def test_users_list(self):
        url = reverse("users-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 2)
        usernames = [u["username"] for u in response.data]
        self.assertIn("user1", usernames)
        self.assertIn("user2", usernames)

    def test_create_user_success(self):
        url = reverse("users-create")
        payload = {
            "username": "newuser",
            "password": "newpass123",
            "role": "user"
        }
        self.client.force_authenticate(user=None)  # unauthenticated for creation
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["username"], "newuser")

    def test_create_user_invalid(self):
        url = reverse("users-create")
        payload = {"username": ""}  # missing password
        self.client.force_authenticate(user=None)
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, 400)

    # ------------------------
    # User Detail
    # ------------------------
    def test_get_user_detail(self):
        url = reverse("user-detail", kwargs={"pk": self.user1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], self.user1.username)

    def test_get_user_detail_field(self):
        url = reverse("user-detail", kwargs={"pk": self.user1.id}) + "?field=username"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], self.user1.username)

    def test_update_user_detail_self(self):
        url = reverse("user-detail", kwargs={"pk": self.user1.id})
        payload = {"display_name": "Updated Name"}
        response = self.client.put(url, payload)
        self.assertEqual(response.status_code, 200)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.display_name, "Updated Name")

    def test_delete_user(self):
        url = reverse("user-detail", kwargs={"pk": self.user2.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Users.objects.filter(id=self.user2.id).exists())

    # ------------------------
    # User Profile By Username
    # ------------------------
    def test_get_profile_by_username(self):
        url = reverse("user-profile-by-username", kwargs={"username": self.user1.username})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], self.user1.username)

    def test_patch_profile_self(self):
        url = reverse("user-profile-by-username", kwargs={"username": self.user1.username})
        payload = {"display_name": "New Display Name"}
        response = self.client.patch(url, payload)
        self.assertEqual(response.status_code, 200)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.display_name, "New Display Name")

    def test_patch_profile_forbidden(self):
        url = reverse("user-profile-by-username", kwargs={"username": self.user2.username})
        payload = {"display_name": "Hack"}
        response = self.client.patch(url, payload)
        self.assertEqual(response.status_code, 403)

    def test_patch_profile_staff_can_edit(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("user-profile-by-username", kwargs={"username": self.user1.username})
        payload = {"display_name": "Staff Edit"}
        response = self.client.patch(url, payload)
        self.assertEqual(response.status_code, 200)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.display_name, "Staff Edit")

    # ------------------------
    # User Plans
    # ------------------------
    def test_user_plans_view(self):
        url = reverse("user-plans", kwargs={"username": self.user1.username})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["created_plans"]), 1)
        self.assertEqual(len(response.data["joined_plans"]), 1)
        self.assertIn(self.plan1.id, [p["id"] for p in response.data["created_plans"]])
        self.assertIn(self.plan2.id, [p["id"] for p in response.data["joined_plans"]])

    # ------------------------
    # User Contributions
    # ------------------------
    def test_user_contributions_view(self):
        url = reverse("user-contributions", kwargs={"username": self.user1.username})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        contributions_types = [c["type"] for c in response.data]
        self.assertIn("created", contributions_types)
        self.assertIn("joined", contributions_types)
