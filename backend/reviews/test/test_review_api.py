import json
from unittest.mock import patch
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from users.models import Users
from reviews.models import reviews


class ReviewViewTests(APITestCase):

    def setUp(self):
        # Create two users: reviewer and leader
        self.reviewer = Users.objects.create_user(
            username="reviewer",
            password="testpass123"
        )
        self.leader = Users.objects.create_user(
            username="leader",
            password="testpass123"
        )

        self.client = APIClient()
        self.url = reverse("review-create-update")  # /api/reviews/

    def authenticate(self):
        """Helper: authenticate reviewer"""
        self.client.force_authenticate(user=self.reviewer)

    # -------------------------------
    #           GET TESTS
    # -------------------------------
    def test_get_review_missing_leader_id(self):
        self.authenticate()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("leader_id parameter is required", response.data["error"])

    def test_get_review_invalid_leader_id(self):
        self.authenticate()
        response = self.client.get(self.url, {"leader_id": "abc"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("leader_id must be a valid integer", response.data["error"])

    def test_get_review_not_found(self):
        self.authenticate()
        response = self.client.get(self.url, {"leader_id": self.leader.id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("No rating found", response.data["error"])

    def test_get_existing_review(self):
        self.authenticate()
        # Create a review
        review_obj = reviews.objects.create(
            reviewer_id=self.reviewer,
            leader_id=self.leader,
            rating=4.5,
            comment="Good",
        )

        response = self.client.get(self.url, {"leader_id": self.leader.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["rating"], 4.5)
        self.assertEqual(response.data["comment"], "Good")
        self.assertEqual(response.data["leader_id"], self.leader.id)

    # -------------------------------
    #           POST TESTS
    # -------------------------------
    @patch("reviews.views.review_views.update_user_rating_stats")
    def test_post_create_review(self, mock_update_stats):
        self.authenticate()

        mock_update_stats.return_value = {
            "average_rating": 5.0,
            "total_reviews": 1
        }

        payload = {
            "leader_id": self.leader.id,
            "rating": 5,
            "comment": "Excellent!"
        }

        response = self.client.post(
            self.url,
            data=json.dumps(payload),
            content_type="application/json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["rating"], 5.0)
        self.assertEqual(response.data["comment"], "Excellent!")
        self.assertEqual(response.data["leader_id"], self.leader.id)

        # Stats returned correctly
        self.assertIn("updated_stats", response.data)
        self.assertEqual(response.data["updated_stats"]["average_rating"], 5.0)

        # Ensure review is saved to DB
        self.assertEqual(reviews.objects.count(), 1)

    @patch("reviews.views.review_views.update_user_rating_stats")
    def test_post_update_existing_review(self, mock_update_stats):
        self.authenticate()

        # Create existing review
        review_obj = reviews.objects.create(
            reviewer_id=self.reviewer,
            leader_id=self.leader,
            rating=3,
            comment="Okay"
        )

        mock_update_stats.return_value = {
            "average_rating": 4.0,
            "total_reviews": 1
        }

        payload = {
            "leader_id": self.leader.id,
            "rating": 4,
            "comment": "Improved review!"
        }

        response = self.client.post(
            self.url,
            data=json.dumps(payload),
            content_type="application/json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["rating"], 4.0)
        self.assertEqual(response.data["comment"], "Improved review!")

        # Should still be only 1 review in DB
        self.assertEqual(reviews.objects.count(), 1)

    def test_post_unauthenticated(self):
        payload = {
            "leader_id": self.leader.id,
            "rating": 5,
            "comment": "Great"
        }
        response = self.client.post(self.url, payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
