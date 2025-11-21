from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from users.models import Users
from users.serializers.UserSerializer import UserSerializer
import json

class UsersModelTest(TestCase):

    def setUp(self):
        self.user = Users.objects.create_user(
            username="testuser",
            password="password123",
            display_name="Test User",
            bio="Bio text",
            website="https://example.com",
            role="user",
            avg_rating=4.5,
            review_count=10,
            contact="1234567890",
            profile_picture="https://example.com/image.png",
            social_links=["https://twitter.com/test", "https://github.com/test"]
        )

    def test_user_creation(self):
        """Test that a user is created correctly"""
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.display_name, "Test User")
        self.assertEqual(self.user.role, "user")
        self.assertEqual(self.user.avg_rating, 4.5)
        self.assertEqual(self.user.review_count, 10)
        self.assertTrue(self.user.check_password("password123"))
        self.assertEqual(self.user.social_links, ["https://twitter.com/test", "https://github.com/test"])

    def test_user_str_method(self):
        """Test __str__ method returns display_name if available"""
        self.assertEqual(str(self.user), "Test User")
        self.user.display_name = None
        self.user.save()
        self.assertEqual(str(self.user), "testuser")


class UserSerializerTest(TestCase):

    def setUp(self):
        self.user_data = {
            "username": "serializer_user",
            "password": "password123",
            "display_name": "Serializer User",
            "bio": "Bio for serializer",
            "website": "https://example.com",
            "role": "user",
            "avg_rating": 4.0,
            "review_count": 5,
            "contact": "9876543210",
            "social_links": ["https://linkedin.com/test"]
        }

    def test_serializer_create_user(self):
        """Test creating a user via UserSerializer"""
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.username, "serializer_user")
        self.assertTrue(user.check_password("password123"))
        self.assertEqual(user.display_name, "Serializer User")
        self.assertEqual(user.social_links, ["https://linkedin.com/test"])

    def test_serializer_update_user(self):
        """Test updating a user via UserSerializer"""
        user = Users.objects.create_user(username="update_user", password="pass")
        update_data = {"display_name": "Updated Name", "social_links": json.dumps(["https://twitter.com/new"])}
        serializer = UserSerializer(user, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_user = serializer.save()
        self.assertEqual(updated_user.display_name, "Updated Name")
        self.assertEqual(updated_user.social_links, ["https://twitter.com/new"])

    def test_serializer_invalid_display_name(self):
        """Test that too long display_name raises validation error"""
        invalid_data = self.user_data.copy()
        invalid_data["display_name"] = "x" * 100  # exceeds 50 chars
        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())

    def test_serializer_invalid_social_links(self):
        """Test invalid social_links raise validation error"""
        invalid_data = self.user_data.copy()
        invalid_data["social_links"] = "not-a-json"
        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("Invalid JSON for social links", str(serializer.errors))

    def test_serializer_exceed_max_social_links(self):
        """Test providing more than 4 social links fails"""
        invalid_data = self.user_data.copy()
        invalid_data["social_links"] = json.dumps([
            "link1", "link2", "link3", "link4", "link5"
        ])
        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("You can provide at most 4 social links", str(serializer.errors))
