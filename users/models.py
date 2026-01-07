"""
User model definition.

This module contains the custom User model that extends Django's AbstractUser.
It includes additional fields for profile management and timestamps.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    
    This model adds additional fields for:
    - Unique email address
    - Optional profile picture
    - Automatic timestamps (created_at, updated_at)
    
    Attributes:
        email: Unique email address for the user (required for authentication).
        profile_picture: Optional image field for user's profile picture.
        created_at: Timestamp when the user was created.
        updated_at: Timestamp when the user was last updated.
    """
    
    email = models.EmailField(
        unique=True, 
        max_length=255,
        verbose_name='Email Address',
        help_text='A valid email address is required.'
    )
    
    profile_picture = models.ImageField(
        upload_to='profiles/', 
        blank=True, 
        null=True,
        verbose_name='Profile Picture',
        help_text='Optional profile picture for the user.'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Created At',
        help_text='Timestamp when the user account was created.'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Updated At',
        help_text='Timestamp when the user account was last updated.'
    )
    
    # Additional required fields for user creation
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']
    
    class Meta:
        """
        Meta options for the User model.
        
        Attributes:
            verbose_name: Singular name for the model.
            verbose_name_plural: Plural name for the model.
            ordering: Default ordering (by creation date, newest first).
        """
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        """
        String representation of the user.
        
        Returns:
            str: The username of the user.
        """
        return self.username
    
    def get_full_name(self) -> str:
        """
        Get the full name of the user.
        
        Returns:
            str: The first and last name combined.
        """
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self) -> str:
        """
        Get the short name of the user.
        
        Returns:
            str: The first name of the user.
        """
        return self.first_name
