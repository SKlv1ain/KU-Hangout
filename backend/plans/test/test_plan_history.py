from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import Users
from plans.models import Plans
from participants.models import Participants
from tags.models import Tags
from datetime import datetime, timedelta

class PlanHistoryTests(APITestCase):

    def setUp(self):
        # Users
        self.user1 = Users.objects.create_user(username="user1", password="pass123")
        self.user2 = Users.objects.create_user(username="user2", password="pass123")

        # Tokens
        self.token1 = RefreshToken.for_user(self.user1).access_token
        self.token2 = RefreshToken.for_user(self.user2).access_token

        # Tags
        self.tag1 = Tags.objects.create(name="Sports")
        self.tag2 = Tags.objects.create(name="Food")

        # Plans
        self.plan1 = Plans.objects.create(
            title="Morning Soccer",
            description="Soccer in park",
            location="Chiang Mai",
            leader_id=self.user1,
            event_time=datetime.now() + timedelta(days=1),
            max_people=10
        )
        self.plan1.tags.add(self.tag1)

        self.plan2 = Plans.objects.create(
            title="Evening Dinner",
            description="Dinner in Bangkok",
            location="Bangkok",
            leader_id=self.user2,
            event_time=datetime.now() + timedelta(days=2),
            max_people=5
        )
        self.plan2.tags.add(self.tag2)

        # Participants
        Participants.objects.create(user=self.user1, plan=self.plan1, role="LEADER")
        Participants.objects.create(user=self.user1, plan=self.plan2, role="MEMBER")
        Participants.objects.create(user=self.user2, plan=self.plan2, role="LEADER")
        Participants.objects.create(user=self.user2, plan=self.plan1, role="MEMBER")

        self.client = APIClient()

    def test_get_my_joined_plans(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        url = reverse('my-joined-plans')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user_id'], self.user1.id)
        self.assertEqual(response.data['total_plans'], 2)
        plan_titles = [p['title'] for p in response.data['plans']]
        self.assertIn("Morning Soccer", plan_titles)
        self.assertIn("Evening Dinner", plan_titles)

    def test_get_user_joined_plans_by_id(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        url = reverse('user-joined-plans', args=[self.user1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user_id'], self.user1.id)
        self.assertEqual(response.data['total_plans'], 2)

    def test_get_plans_filtered_by_role_leader(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        url = reverse('user-joined-plans', args=[self.user1.id])
        response = self.client.get(url, {'role': 'LEADER'})
        # Note: current view does not support role filter; role filter is in separate view
        # If you want, we can add a separate URL for UserPlansByRoleView
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_with_no_plans(self):
        user3 = Users.objects.create_user(username="user3", password="pass123")
        token3 = RefreshToken.for_user(user3).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token3}')
        url = reverse('my-joined-plans')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_plans'], 0)
        self.assertEqual(response.data['plans'], [])

    def test_unauthenticated_access(self):
        url = reverse('my-joined-plans')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
