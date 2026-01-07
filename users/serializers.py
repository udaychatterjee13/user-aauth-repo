"""
Serializers for user management.

This module contains DRF serializers for:
- User registration with validation
- User profile data serialization
- Login request validation

All serializers include comprehensive validation and meaningful error messages.
"""

import re
import logging
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import User


logger = logging.getLogger(__name__)


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Handles validation of:
    - Username (alphanumeric with underscores/hyphens)
    - Email (valid format, unique)
    - Password (Django's password validation)
    - Password confirmation (must match password)
    - First name and last name (required)
    
    Attributes:
        password: Write-only password field.
        password2: Write-only password confirmation field.
    """
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Password must be at least 8 characters long.'
    )
    
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Confirm your password.'
    )
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'password2',
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'username': {'required': True},
        }
        read_only_fields = ['id']
    
    def validate_username(self, value: str) -> str:
        """
        Validate that the username is properly formatted.
        
        Args:
            value: The username to validate.
            
        Returns:
            str: The validated username.
            
        Raises:
            ValidationError: If username format is invalid or already exists.
        """
        # Check username format (alphanumeric with underscores/hyphens)
        if not re.match(r'^[\w.-]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, underscores, hyphens, and periods."
            )
        
        # Check minimum length
        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must be at least 3 characters long."
            )
        
        # Check maximum length
        if len(value) > 30:
            raise serializers.ValidationError(
                "Username cannot exceed 30 characters."
            )
        
        # Check if username already exists (case-insensitive)
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with that username already exists."
            )
        
        return value.lower()  # Normalize to lowercase
    
    def validate_email(self, value: str) -> str:
        """
        Validate that the email is properly formatted and unique.
        
        Args:
            value: The email to validate.
            
        Returns:
            str: The validated email.
            
        Raises:
            ValidationError: If email format is invalid or already exists.
        """
        # Validate email format
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError(
                "Please enter a valid email address."
            )
        
        # Check if email already exists (case-insensitive)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email address already exists."
            )
        
        return value.lower()  # Normalize to lowercase
    
    def validate_password(self, value: str) -> str:
        """
        Validate that the password meets Django's password requirements.
        
        Args:
            value: The password to validate.
            
        Returns:
            str: The validated password.
            
        Raises:
            ValidationError: If password doesn't meet requirements.
        """
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        return value
    
    def validate_first_name(self, value: str) -> str:
        """
        Validate the first name field.
        
        Args:
            value: The first name to validate.
            
        Returns:
            str: The validated and stripped first name.
            
        Raises:
            ValidationError: If first name is empty or invalid.
        """
        value = value.strip()
        
        if not value:
            raise serializers.ValidationError(
                "First name is required."
            )
        
        if len(value) < 2:
            raise serializers.ValidationError(
                "First name must be at least 2 characters long."
            )
        
        if len(value) > 50:
            raise serializers.ValidationError(
                "First name cannot exceed 50 characters."
            )
        
        return value.title()  # Capitalize first letter
    
    def validate_last_name(self, value: str) -> str:
        """
        Validate the last name field.
        
        Args:
            value: The last name to validate.
            
        Returns:
            str: The validated and stripped last name.
            
        Raises:
            ValidationError: If last name is empty or invalid.
        """
        value = value.strip()
        
        if not value:
            raise serializers.ValidationError(
                "Last name is required."
            )
        
        if len(value) < 2:
            raise serializers.ValidationError(
                "Last name must be at least 2 characters long."
            )
        
        if len(value) > 50:
            raise serializers.ValidationError(
                "Last name cannot exceed 50 characters."
            )
        
        return value.title()  # Capitalize first letter
    
    def validate(self, attrs: dict) -> dict:
        """
        Object-level validation to check password confirmation.
        
        Args:
            attrs: Dictionary of field values.
            
        Returns:
            dict: The validated attributes.
            
        Raises:
            ValidationError: If passwords don't match.
        """
        password = attrs.get('password')
        password2 = attrs.get('password2')
        
        if password and password2 and password != password2:
            raise serializers.ValidationError({
                'password2': "Passwords don't match."
            })
        
        return attrs
    
    def create(self, validated_data: dict) -> User:
        """
        Create a new user with hashed password.
        
        Args:
            validated_data: The validated data from the serializer.
            
        Returns:
            User: The newly created user instance.
        """
        # Remove password2 as it's not needed for user creation
        validated_data.pop('password2', None)
        
        # Extract password before creating user
        password = validated_data.pop('password')
        
        # Create user instance
        user = User(**validated_data)
        
        # Hash and set password securely
        user.set_password(password)
        
        # Save user to database
        user.save()
        
        logger.info(f"New user registered: {user.username}")
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile data.
    
    Used for returning user profile information without sensitive data.
    Includes read-only fields that cannot be modified through this serializer.
    """
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'profile_picture',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'username',
            'email',
            'created_at',
            'updated_at',
        ]
    
    def get_full_name(self, obj: User) -> str:
        """
        Get the full name of the user.
        
        Args:
            obj: The User instance.
            
        Returns:
            str: The full name of the user.
        """
        return obj.get_full_name()


class LoginSerializer(serializers.Serializer):
    """
    Serializer for login request validation.
    
    Note: This serializer is optional as SimpleJWT's TokenObtainPairView
    handles login validation automatically. It's included for potential
    customization of the login process.
    """
    
    username = serializers.CharField(
        required=True,
        help_text='Your username.'
    )
    
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text='Your password.'
    )
    
    def validate_username(self, value: str) -> str:
        """
        Validate and normalize the username.
        
        Args:
            value: The username to validate.
            
        Returns:
            str: The normalized username.
            
        Raises:
            ValidationError: If username is empty.
        """
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Username is required."
            )
        
        return value.strip().lower()
    
    def validate_password(self, value: str) -> str:
        """
        Validate the password field.
        
        Args:
            value: The password to validate.
            
        Returns:
            str: The password.
            
        Raises:
            ValidationError: If password is empty.
        """
        if not value:
            raise serializers.ValidationError(
                "Password is required."
            )
        
        return value
