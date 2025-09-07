from django.db import models
from django.conf import settings

# Model for tags
class tags(models.Model):
    name = models.CharField(max_length=50, unique=True)