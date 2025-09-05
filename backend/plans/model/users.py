from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

# Model for users
class users(AbstractUser):
    ROLE_CHOICES = [
    ('user', 'User'),
    ('leader', 'Leader'),
    ('participant', 'Participant')
]
    username = models.CharField(max_length=50)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    avg_rating = models.DecimalField(max_digits=4, decimal_places=2)
    review_count = models.FloatField(max_length=100)
    contact = models.CharField(max_length=100)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username}'s profile"