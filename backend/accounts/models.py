from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_USER = 'user'
    ROLE_ADMIN = 'admin'
    ROLE_CHOICES = [(ROLE_USER, 'User'), (ROLE_ADMIN, 'Admin')]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_USER)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.IntegerField(default=0)
    contact = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self) -> str:
        return str(self.username)
