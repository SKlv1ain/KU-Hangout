from django.db import models
from django.contrib.auth.models import AbstractUser

# Model for users
class users(AbstractUser):
    username = models.CharField(max_length=50)
    role = models.CharField(max_length=50, choices=["user", "leader", "participlant"])
    avg_rating = models.DecimalField(max_digits=4, decimal_places=2)
    review_count = models.FloatField(max_length=100)
    contact = models.CharField(max_length=100)
    create_at = models.TimeField(auto_now_add=True)

# Model for plans