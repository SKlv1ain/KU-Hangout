from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class AccountsAPITestCase(APITestCase):
    def setUp(self):
        """Set up test data"""
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        
    def test_register_user(self):
        """Test user registration"""
        url = reverse('auth-register')
        response = self.client.post(url, self.user_data, format='json')
        
        # Debug: print response details
        print(f"Response status: {response.status_code}")
        print(f"Response data: {response.data}")
        
        # Check if user was created
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check response contains user data and token
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)
        self.assertIn('refresh', response.data)
        
    def test_login_user(self):
        """Test user login"""
        # Create a user first
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        url = reverse('auth-login')
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)
        self.assertIn('refresh', response.data)
        
    def test_me_endpoint_authenticated(self):
        """Test /me endpoint with authenticated user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Authenticate the client
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        url = reverse('users-me')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
        
    def test_me_endpoint_unauthenticated(self):
        """Test /me endpoint without authentication"""
        url = reverse('users-me')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_logout(self):
        """Test logout endpoint"""
        url = reverse('auth-logout')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'ok')
