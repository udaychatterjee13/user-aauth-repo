"""
Unit tests for users app.

This module contains comprehensive tests for:
- User registration
- User login
- Profile retrieval
- Token refresh

Uses Django's TestCase and DRF's APIClient for API testing.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from .models import User


class UserModelTests(TestCase):
    """Test cases for the User model."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User'
        )
    
    def test_user_creation(self):
        """Test that a user can be created successfully."""
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.first_name, 'Test')
        self.assertEqual(self.user.last_name, 'User')
        self.assertTrue(self.user.check_password('TestPass123!'))
    
    def test_user_str_representation(self):
        """Test the string representation of a user."""
        self.assertEqual(str(self.user), 'testuser')
    
    def test_user_full_name(self):
        """Test the get_full_name method."""
        self.assertEqual(self.user.get_full_name(), 'Test User')
    
    def test_user_short_name(self):
        """Test the get_short_name method."""
        self.assertEqual(self.user.get_short_name(), 'Test')
    
    def test_email_uniqueness(self):
        """Test that email must be unique."""
        with self.assertRaises(Exception):
            User.objects.create_user(
                username='anotheruser',
                email='test@example.com',  # Same email
                password='AnotherPass123!'
            )


class RegisterAPITests(TestCase):
    """Test cases for the user registration API."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.register_url = reverse('users:register')
        self.valid_payload = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!'
        }
    
    def test_register_with_valid_data(self):
        """Test registration with valid data."""
        response = self.client.post(
            self.register_url,
            self.valid_payload,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')
        
        # Verify user was created in database
        self.assertTrue(
            User.objects.filter(username='newuser').exists()
        )
    
    def test_register_with_duplicate_username(self):
        """Test registration with an existing username."""
        # Create a user first
        User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='ExistPass123!'
        )
        
        # Try to register with the same username
        payload = self.valid_payload.copy()
        payload['username'] = 'existinguser'
        payload['email'] = 'different@example.com'
        
        response = self.client.post(
            self.register_url,
            payload,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
    
    def test_register_with_duplicate_email(self):
        """Test registration with an existing email."""
        # Create a user first
        User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='ExistPass123!'
        )
        
        # Try to register with the same email
        payload = self.valid_payload.copy()
        payload['email'] = 'existing@example.com'
        
        response = self.client.post(
            self.register_url,
            payload,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
    
    def test_register_with_mismatched_passwords(self):
        """Test registration with non-matching passwords."""
        payload = self.valid_payload.copy()
        payload['password2'] = 'DifferentPass123!'
        
        response = self.client.post(
            self.register_url,
            payload,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password2', response.data)
    
    def test_register_with_weak_password(self):
        """Test registration with a weak password."""
        payload = self.valid_payload.copy()
        payload['password'] = '123'
        payload['password2'] = '123'
        
        response = self.client.post(
            self.register_url,
            payload,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
    
    def test_register_with_invalid_email(self):
        """Test registration with an invalid email format."""
        payload = self.valid_payload.copy()
        payload['email'] = 'notanemail'
        
        response = self.client.post(
            self.register_url,
            payload,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
    
    def test_register_with_missing_fields(self):
        """Test registration with missing required fields."""
        response = self.client.post(
            self.register_url,
            {},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginAPITests(TestCase):
    """Test cases for the user login API."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.login_url = reverse('users:login')
        
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User'
        )
    
    def test_login_with_valid_credentials(self):
        """Test login with correct username and password."""
        response = self.client.post(
            self.login_url,
            {
                'username': 'testuser',
                'password': 'TestPass123!'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_login_with_invalid_username(self):
        """Test login with non-existent username."""
        response = self.client.post(
            self.login_url,
            {
                'username': 'nonexistent',
                'password': 'TestPass123!'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_login_with_wrong_password(self):
        """Test login with incorrect password."""
        response = self.client.post(
            self.login_url,
            {
                'username': 'testuser',
                'password': 'WrongPassword123!'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_login_with_empty_credentials(self):
        """Test login with empty credentials."""
        response = self.client.post(
            self.login_url,
            {
                'username': '',
                'password': ''
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProfileAPITests(TestCase):
    """Test cases for the user profile API."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.profile_url = reverse('users:profile')
        self.login_url = reverse('users:login')
        
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User'
        )
    
    def get_auth_token(self):
        """Helper method to get authentication token."""
        response = self.client.post(
            self.login_url,
            {
                'username': 'testuser',
                'password': 'TestPass123!'
            },
            format='json'
        )
        return response.data.get('access')
    
    def test_get_profile_with_valid_token(self):
        """Test profile retrieval with valid JWT token."""
        token = self.get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')
    
    def test_get_profile_without_token(self):
        """Test profile retrieval without authentication token."""
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_profile_with_invalid_token(self):
        """Test profile retrieval with invalid token."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenRefreshAPITests(TestCase):
    """Test cases for the token refresh API."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.refresh_url = reverse('users:token_refresh')
        self.login_url = reverse('users:login')
        
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User'
        )
    
    def get_tokens(self):
        """Helper method to get access and refresh tokens."""
        response = self.client.post(
            self.login_url,
            {
                'username': 'testuser',
                'password': 'TestPass123!'
            },
            format='json'
        )
        return response.data.get('access'), response.data.get('refresh')
    
    def test_refresh_with_valid_token(self):
        """Test token refresh with valid refresh token."""
        _, refresh_token = self.get_tokens()
        
        response = self.client.post(
            self.refresh_url,
            {'refresh': refresh_token},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_refresh_with_invalid_token(self):
        """Test token refresh with invalid refresh token."""
        response = self.client.post(
            self.refresh_url,
            {'refresh': 'invalid_refresh_token'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class HealthCheckAPITests(TestCase):
    """Test cases for the health check API."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.health_url = reverse('users:health')
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = self.client.get(self.health_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')
