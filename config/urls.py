"""
URL configuration for config project.

This module handles the main URL routing for the Django application.

Routes:
    - /admin/ : Django admin panel
    - /api/auth/ : User authentication APIs (register, login, profile)
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
