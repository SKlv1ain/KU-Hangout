from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import Users
from reviews.models import reviews
from decimal import Decimal

class ReviewModelTest(TestCase):

    def setUp(self):
        self.reviewer = Users.objects.create_user(username="reviewer", password="pass123")
        self.leader = Users.objects.create_user(username="leader", password="pass123")

    def test_create_review(self):
        """Test creating a review object"""
        review = reviews.objects.create(
            reviewer_id=self.reviewer,
            leader_id=self.leader,
            rating=Decimal('4.00'),
            comment="Good leader"
        )
        self.assertEqual(review.reviewer_id, self.reviewer)
        self.assertEqual(review.leader_id, self.leader)
        self.assertEqual(review.rating, Decimal('4.00'))
        self.assertEqual(review.comment, "Good leader")

    def test_review_str(self):
        """Test string representation of review"""
        review = reviews.objects.create(
            reviewer_id=self.reviewer,
            leader_id=self.leader,
            rating=5
        )
        self.assertEqual(str(review), f"Review by {self.reviewer.username} for {self.leader.username}")


class ReviewAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.reviewer = Users.objects.create_user(username="reviewer", password="pass123")
        self.leader = Users.objects.create_user(username="leader", password="pass123")
        self.url = reverse('review-create-update')

    def test_create_review_api(self):
        """Test POST creating a review"""
        self.client.force_authenticate(user=self.reviewer)
        data = {
            "leader_id": self.leader.id,
            "rating": 5,
            "comment": "Excellent"
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['rating'], 5.0)
        self.assertEqual(response.data['comment'], "Excellent")
        self.assertEqual(response.data['leader_id'], self.leader.id)

    def test_update_review_api(self):
        """Test POST updates existing review"""
        self.client.force_authenticate(user=self.reviewer)
        # Create initial review
        review = reviews.objects.create(
            reviewer_id=self.reviewer,
            leader_id=self.leader,
            rating=3,
            comment="Good"
        )
        data = {
            "leader_id": self.leader.id,
            "rating": 4,
            "comment": "Very Good"
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        review.refresh_from_db()
        self.assertEqual(review.rating, Decimal('4.00'))
        self.assertEqual(review.comment, "Very Good")

    def test_cannot_review_self(self):
        """User cannot review themselves"""
        self.client.force_authenticate(user=self.reviewer)
        data = {
            "leader_id": self.reviewer.id,
            "rating": 5,
            "comment": "Self review"
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('leader_id', response.data)

    def test_get_existing_review(self):
        """Test GET returns current user's review"""
        review = reviews.objects.create(
            reviewer_id=self.reviewer,
            leader_id=self.leader,
            rating=4,
            comment="Nice"
        )
        self.client.force_authenticate(user=self.reviewer)
        response = self.client.get(self.url, {"leader_id": self.leader.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['rating'], 4.0)
        self.assertEqual(response.data['comment'], "Nice")

    def test_get_no_review(self):
        """GET when no review exists returns 404"""
        self.client.force_authenticate(user=self.reviewer)
        response = self.client.get(self.url, {"leader_id": self.leader.id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_invalid_leader_id(self):
        """GET with invalid leader_id returns 400"""
        self.client.force_authenticate(user=self.reviewer)
        response = self.client.get(self.url, {"leader_id": "abc"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_missing_leader_id(self):
        """GET without leader_id returns 400"""
        self.client.force_authenticate(user=self.reviewer)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
