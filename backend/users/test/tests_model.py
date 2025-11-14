from django.test import TestCase
from users.models import Users

class UsersModelUnitTests(TestCase):
    """Unit tests for the Users model"""

    def test_create_user(self):
        """Should create user and hash password"""
        user = Users.objects.create_user(username="john", password="mypass123")
        self.assertEqual(user.username, "john")
        self.assertTrue(user.check_password("mypass123"))

    def test_str_method(self):
        """Should return readable string representation"""
        user = Users.objects.create_user(username="struser", password="pass123")
        self.assertIn("struser", str(user))  # depends on __str__ implementation
