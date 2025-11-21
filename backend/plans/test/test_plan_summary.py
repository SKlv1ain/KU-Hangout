from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from users.models import Users
from plans.models import Plans
from participants.models import Participants
from tags.models import Tags


class PlanSummaryViewTests(APITestCase):

    def setUp(self):
        self.client = APIClient()

        # Users
        self.leader = Users.objects.create_user(username="leader", password="pass")
        self.member1 = Users.objects.create_user(username="member1", password="pass")
        self.member2 = Users.objects.create_user(username="member2", password="pass")

        # Authenticate as any user for testing (leader)
        self.client.force_authenticate(self.leader)

        # Plan
        self.plan = Plans.objects.create(
            title="Soccer Game",
            description="Fun game",
            location="Bangkok",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=self.leader,
            people_joined=3
        )

        # Tags
        self.tag1 = Tags.objects.create(name="Sports")
        self.tag2 = Tags.objects.create(name="Outdoor")
        self.plan.tags.set([self.tag1, self.tag2])

        # Participants
        Participants.objects.create(plan=self.plan, user=self.leader, role="LEADER")
        Participants.objects.create(plan=self.plan, user=self.member1, role="MEMBER")
        Participants.objects.create(plan=self.plan, user=self.member2, role="MEMBER")

        # URL
        self.url = reverse("plan-summary", kwargs={"plan_id": self.plan.id})

    def test_get_plan_summary_success(self):
        """Successfully retrieve plan summary with tags and members."""
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        data = response.data

        self.assertEqual(data["plan_id"], self.plan.id)
        self.assertEqual(data["title"], self.plan.title)

        # Tags
        self.assertEqual(len(data["tags"]), 2)
        tag_names = [t["name"] for t in data["tags"]]
        self.assertIn("Sports", tag_names)
        self.assertIn("Outdoor", tag_names)

        # Members: leader first
        self.assertEqual(len(data["members"]), 3)
        self.assertEqual(data["members"][0]["role"], "LEADER")
        self.assertEqual(data["members"][0]["user_id"], self.leader.id)
        self.assertEqual(data["members"][1]["role"], "MEMBER")
        self.assertEqual(data["members"][2]["role"], "MEMBER")

    def test_get_plan_summary_plan_not_found(self):
        """Return 404 if plan does not exist."""
        url = reverse("plan-summary", kwargs={"plan_id": 99999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["detail"], "Plan not found.")
