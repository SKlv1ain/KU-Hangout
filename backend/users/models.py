from django.db import models
from django.contrib.auth.models import AbstractUser

class Users(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('leader', 'Leader'),
        ('participant', 'Participant'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    avg_rating = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    review_count = models.PositiveIntegerField(default=0)
    contact = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True) # Profile picture URL (stored in Cloudinary)
    display_name = models.CharField(max_length=50, blank=True, null=True) #filed for display name
    bio = models.TextField(blank=True, null=True)
    website = models.URLField(max_length=255, blank=True, null=True)
    social_links = models.JSONField(default=list, blank=True)

    def __str__(self):
        # Use display name if available, else fallback to username
        return self.display_name or self.username
