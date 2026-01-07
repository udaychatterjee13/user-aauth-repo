"""
URL routing for users app.

This module defines the URL patterns for user authentication endpoints:
- /register/ : User registration
- /login/ : User login (JWT token generation)
- /profile/ : Get authenticated user's profile
- /logout/ : Logout (blacklist refresh token)
- /token/refresh/ : Refresh access token
- /health/ : Health check endpoint
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import RegisterView, ProfileView, LogoutView, HealthCheckView


app_name = 'users'

urlpatterns = [
    # User registration
    path('register/', RegisterView.as_view(), name='register'),
    
    # User login (JWT token generation)
    path('login/', TokenObtainPairView.as_view(), name='login'),
    
    # Get authenticated user's profile
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # Logout (blacklist refresh token)
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Refresh access token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Health check endpoint
    path('health/', HealthCheckView.as_view(), name='health'),
]
