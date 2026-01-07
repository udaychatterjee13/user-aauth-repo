"""
Admin configuration for users app.

This module customizes the Django admin interface for the User model.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin configuration for the User model.
    
    Extends Django's built-in UserAdmin to include custom fields
    and improved organization for the admin interface.
    """
    
    # Fields to display in the list view
    list_display = [
        'username',
        'email',
        'first_name',
        'last_name',
        'is_staff',
        'is_active',
        'created_at',
    ]
    
    # Fields to filter by in the sidebar
    list_filter = [
        'is_staff',
        'is_superuser',
        'is_active',
        'created_at',
    ]
    
    # Fields to search by
    search_fields = [
        'username',
        'email',
        'first_name',
        'last_name',
    ]
    
    # Default ordering
    ordering = ['-created_at']
    
    # Read-only fields
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'date_joined']
    
    # Fields for the detail view (organized in fieldsets)
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'profile_picture')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',),
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    # Fields for the add user form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username',
                'email',
                'first_name',
                'last_name',
                'password1',
                'password2',
                'is_staff',
                'is_active',
            ),
        }),
    )
    
    # Number of items to display per page
    list_per_page = 25
    
    # Fields that can be clicked to open detail view
    list_display_links = ['username', 'email']
    
    # Enable actions on top and bottom of list
    actions_on_top = True
    actions_on_bottom = True
