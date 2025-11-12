from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta

from users.models import Users
from plans.models import Plans
from participants.models import Participants

class PlanJoinTests(APITestCase):

    def setUp(self):
        # Users
        self.user1 = Users.objects.create_user(username="user1", password="pass123")
        self.user2 = Users.objects.create_user(username="user2", password="pass123")

        # Tokens
        self.token1 = RefreshToken.for_user(self.user1).access_token
        self.token2 = RefreshToken.for_user(self.user2).access_token

        # Plan
        self.plan = Plans.objects.create(
            title="Morning Soccer",
            description="Soccer in park",
            location="Chiang Mai",
            leader_id=self.user1,
            event_time=timezone.now() + timedelta(days=1),
            max_people=1,  # small capacity for test
        )

        # Add leader to participants
        Participants.objects.create(user=self.user1, plan=self.plan, role='LEADER')

        self.client = APIClient()

    def test_join_plan_as_member(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        url = reverse('plan-join', args=[self.plan.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'MEMBER')
        self.assertEqual(response.data['people_joined'], 1)

    def test_join_plan_as_leader(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        url = reverse('plan-join', args=[self.plan.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'LEADER')

    def test_join_full_plan(self):
        # Plan already full (user2 already joined)
        Participants.objects.create(user=self.user2, plan=self.plan, role='MEMBER')
        self.plan.people_joined = 1
        self.plan.save()

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        url = reverse('plan-join', args=[self.plan.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_join_twice_idempotent(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        url = reverse('plan-join', args=[self.plan.id])
        response1 = self.client.post(url)
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        response2 = self.client.post(url)
        self.assertEqual(response2.status_code, status.HTTP_409_CONFLICT)

    def test_leave_plan_as_member(self):
        Participants.objects.create(user=self.user2, plan=self.plan, role='MEMBER')
        self.plan.people_joined = 1
        self.plan.save()

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        url = reverse('plan-join', args=[self.plan.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['joined'], False)
        self.assertEqual(response.data['people_joined'], 0)

    def test_leave_plan_not_joined_idempotent(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        url = reverse('plan-join', args=[self.plan.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['joined'], False)

    def test_leader_cannot_leave(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        url = reverse('plan-join', args=[self.plan.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_nonexistent_plan(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        url = reverse('plan-join', args=[999])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_leave_nonexistent_plan(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        url = reverse('plan-join', args=[999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_access(self):
        url = reverse('plan-join', args=[self.plan.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
