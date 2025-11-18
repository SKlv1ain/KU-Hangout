from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from users.models import Users
from reviews.models import reviews
from decimal import Decimal


class ReviewViewTests(APITestCase):

    def setUp(self):
        # Users
        self.reviewer = Users.objects.create_user(
            username="reviewer",
            email="reviewer@example.com",
            password="password123"
        )

        self.leader = Users.objects.create_user(
            username="leader",
            email="leader@example.com",
            password="password123"
        )

        # Authenticated client
        self.client = APIClient()
        self.client.force_authenticate(user=self.reviewer)

        self.url = "/api/reviews/"

    # --------------------------------------------------------
    # POST: Create new review
    # --------------------------------------------------------
    def test_create_review(self):
        data = {
            "leader_id": self.leader.id,
            "rating": 5,
            "comment": "Great!"
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        review = reviews.objects.first()
        self.assertIsNotNone(review)
        self.assertEqual(review.reviewer_id, self.reviewer)
        self.assertEqual(review.leader_id, self.leader)

        # rating must be Decimal('5.00')
        self.assertEqual(review.rating, Decimal("5"))

        # response rating is float
        self.assertEqual(float(response.data["rating"]), 5.0)

    # --------------------------------------------------------
    # POST: Update existing review
    # --------------------------------------------------------
    def test_update_existing_review(self):
        # Existing review
        existing = reviews.objects.create(
            reviewer_id=self.reviewer,
            leader_id=self.leader,
            rating=Decimal("3"),
            comment="Old comment"
        )

        data = {
            "leader_id": self.leader.id,
            "rating": 4,
            "comment": "Updated!"
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        existing.refresh_from_db()
        self.assertEqual(existing.rating, Decimal("4"))
        self.assertEqual(existing.comment, "Updated!")

    # --------------------------------------------------------
    # POST: Reviewer cannot rate themselves
    # --------------------------------------------------------
    def test_reviewer_cannot_rate_self(self):
        data = {
            "leader_id": self.reviewer.id,  # same user!
            "rating": 5,
            "comment": "Self review"
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("You cannot rate yourself", str(response.data))

    # --------------------------------------------------------
    # POST: Rating must be between 1–5
    # --------------------------------------------------------
    def test_invalid_rating_value(self):
        data = {
            "leader_id": self.leader.id,
            "rating": 10,   # invalid
            "comment": "Bad rating"
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("{'rating': [ErrorDetail(string='Ensure this value is less than or equal to 5.', code='max_value')]}", str(response.data))

    # --------------------------------------------------------
    # GET: Get existing review
    # --------------------------------------------------------
    def test_get_existing_review(self):
        r = reviews.objects.create(
            reviewer_id=self.reviewer,
            leader_id=self.leader,
            rating=Decimal("4"),
            comment="Nice"
        )

        response = self.client.get(self.url, {"leader_id": self.leader.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data["rating"]), 4.0)
        self.assertEqual(response.data["id"], r.id)

    # --------------------------------------------------------
    # GET: No review exists
    # --------------------------------------------------------
    def test_get_no_review(self):
        response = self.client.get(self.url, {"leader_id": self.leader.id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # --------------------------------------------------------
    # GET: Missing leader_id
    # --------------------------------------------------------
    def test_get_missing_leader_id(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("leader_id parameter is required", str(response.data))

    # --------------------------------------------------------
    # GET: Invalid leader_id
    # --------------------------------------------------------
    def test_get_invalid_leader_id(self):
        response = self.client.get(self.url, {"leader_id": "abc"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("leader_id must be a valid integer", str(response.data))
