"""
App configuration for users app.

This module contains the configuration class for the users Django app.
"""

from django.apps import AppConfig


class UsersConfig(AppConfig):
    """
    Configuration class for the users application.
    
    Attributes:
        default_auto_field: The type of auto-generated primary key field.
        name: The name of the application.
        verbose_name: Human-readable name for the application.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    verbose_name = 'User Management'
