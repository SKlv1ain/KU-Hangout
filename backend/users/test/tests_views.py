from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from users.models import Users
from rest_framework_simplejwt.tokens import RefreshToken

class UsersProfileViewTests(APITestCase):
    """Integration tests for user profile CRUD APIs"""

    def setUp(self):
            self.user1 = Users.objects.create_user(username="user1", password="testpass12345")
            refresh = RefreshToken.for_user(self.user1)
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


            self.user2 = Users.objects.create(
                username="user2",
                display_name="User Two",
                contact="987654321",
            )
            self.user2.set_password("testpass")
            self.user2.save()

            # URLs
            self.list_url = reverse('users-list')     # /users/list/
            self.create_url = reverse('users-create') # /users/create/

    def test_get_all_users(self):
        """GET /users/list/ should return all users"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn("username", response.data[0])
        self.assertIn("role", response.data[0])

    def test_create_user_success(self):
        """POST /users/create/ should create a new user"""
        data = {
            "username": "newuser",
            "display_name": "New User",
            "password": "newuser12345",
            "contact": "000111222",
        }
        response = self.client.post(self.create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["username"], "newuser")

        created_user = Users.objects.get(username="newuser")
        # Password should be hashed, not stored as plain text
        self.assertNotEqual(created_user.password, "newuser12345")
        self.assertTrue(created_user.check_password("newuser12345"))

    def test_get_single_user(self):
        """GET /users/<pk>/ should return a single user"""
        url = reverse('user-detail', kwargs={'pk': self.user1.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "user1")
        self.assertEqual(response.data["display_name"], None)

    def test_get_user_not_found(self):
        """GET /users/<pk>/ invalid id should return 404"""
        url = reverse('user-detail', kwargs={'pk': 999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "User not found")

    def test_update_user(self):
        """PUT /users/<pk>/ should update existing user"""
        url = reverse('user-detail', kwargs={'pk': self.user1.pk})
        data = {"username": "UpdatedName"}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "UpdatedName")

        updated_user = Users.objects.get(pk=self.user1.pk)
        self.assertEqual(updated_user.username, "UpdatedName")

    def test_delete_user(self):
        """DELETE /users/<pk>/ should delete user successfully"""
        url = reverse('user-detail', kwargs={'pk': self.user2.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data["message"], "User deleted successfully")
        self.assertFalse(Users.objects.filter(pk=self.user2.pk).exists())
