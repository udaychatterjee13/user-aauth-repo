"""
API views for user management.

This module contains RESTful API views for:
- User registration
- User profile retrieval
- Token refresh (handled by SimpleJWT)

All views include proper error handling and logging.
"""

import logging
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .serializers import RegisterSerializer, UserSerializer


logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """
    API view for user registration.
    
    Endpoint: POST /api/auth/register/
    Permission: AllowAny (public endpoint)
    
    Request Body:
        - username (str): Unique username (3-30 chars, alphanumeric with _.-).
        - email (str): Valid unique email address.
        - first_name (str): User's first name.
        - last_name (str): User's last name.
        - password (str): Password (min 8 chars, meets Django requirements).
        - password2 (str): Password confirmation.
    
    Responses:
        - 201 Created: User successfully registered.
        - 400 Bad Request: Validation errors.
    """
    
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """
        Handle user registration request.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: JSON response with user data or errors.
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Return user data without password
            response_serializer = UserSerializer(user)
            
            logger.info(f"User registered successfully: {user.username}")
            
            return Response(
                {
                    'message': 'User registered successfully.',
                    'user': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            
            # If validation errors, serializer.errors will be populated
            if hasattr(serializer, 'errors') and serializer.errors:
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generic error response
            return Response(
                {'error': 'Registration failed. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(generics.RetrieveAPIView):
    """
    API view for retrieving the authenticated user's profile.
    
    Endpoint: GET /api/auth/profile/
    Permission: IsAuthenticated (requires valid JWT token)
    
    Headers Required:
        Authorization: Bearer <access_token>
    
    Responses:
        - 200 OK: User profile data.
        - 401 Unauthorized: Invalid or missing token.
    """
    
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """
        Get the currently authenticated user.
        
        Returns:
            User: The authenticated user instance.
        """
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        """
        Handle profile retrieval request.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: JSON response with user profile data.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            
            logger.info(f"Profile retrieved for user: {instance.username}")
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Profile retrieval error: {str(e)}")
            
            return Response(
                {'error': 'Failed to retrieve profile.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutView(APIView):
    """
    API view for user logout (token blacklisting).
    
    Endpoint: POST /api/auth/logout/
    Permission: IsAuthenticated (requires valid JWT token)
    
    Request Body:
        - refresh (str): The refresh token to blacklist.
    
    Headers Required:
        Authorization: Bearer <access_token>
    
    Responses:
        - 200 OK: Successfully logged out.
        - 400 Bad Request: Invalid or missing refresh token.
        - 401 Unauthorized: Invalid or missing access token.
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Handle logout request by blacklisting the refresh token.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: JSON response confirming logout or error.
        """
        try:
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            logger.info(f"User logged out: {request.user.username}")
            
            return Response(
                {'message': 'Successfully logged out.'},
                status=status.HTTP_200_OK
            )
            
        except TokenError as e:
            logger.warning(f"Logout token error: {str(e)}")
            
            return Response(
                {'error': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            
            return Response(
                {'error': 'Logout failed. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class HealthCheckView(APIView):
    """
    API view for health check (useful for monitoring).
    
    Endpoint: GET /api/auth/health/
    Permission: AllowAny (public endpoint)
    
    Responses:
        - 200 OK: API is healthy.
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Handle health check request.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: JSON response indicating API health.
        """
        return Response(
            {
                'status': 'healthy',
                'message': 'User Authentication API is running.'
            },
            status=status.HTTP_200_OK
        )
