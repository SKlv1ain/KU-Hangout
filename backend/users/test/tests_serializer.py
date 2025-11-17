from django.test import TestCase
from users.serializers.UserSerializer import UserSerializer
from users.models import Users

class UserSerializerUnitTests(TestCase):
    """Unit tests for UserSerializer"""

    def setUp(self):
        self.user_data = {
            "username": "testuser",
            "display_name": "TestUser",
            "password": "securepass123",
            "contact": "0123456789",
            "role": "user",
            "avg_rating": 4.5,
            "review_count": 3
        }

    def test_valid_user_serializer(self):
        """Serializer should validate correct data"""
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_create_user_successfully(self):
        """Serializer should create a user and hash password"""
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertIsInstance(user, Users)
        self.assertNotEqual(user.password, self.user_data["password"])  # password should be hashed
        self.assertTrue(user.check_password("securepass123"))

    def test_missing_username_should_fail(self):
        """Serializer should reject data without username"""
        invalid_data = self.user_data.copy()
        invalid_data.pop("username")
        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("username", serializer.errors)

    def test_update_user(self):
        """Serializer should update existing user correctly"""
        user = Users.objects.create_user(username="olduser", password="oldpass123")
        serializer = UserSerializer(
            instance=user, data={"username": "updateduser", "contact": "999888777"}, partial=True
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_user = serializer.save()
        self.assertEqual(updated_user.username, "updateduser")
        self.assertEqual(updated_user.contact, "999888777")
