from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from users import users
from tags import tags

# Model for plans
class plans(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    lat = models.DecimalField(decimal_places=2, max_digits=8, default=None, null=True, blank=True)
    lng = models.DecimalField(decimal_places=2, max_digits=8, default=None, null=True, blank=True)
    leader_id = models.ForeignKey(users, related_name="leader")
    event_time = models.DateTimeField()
    max_people = models.IntegerField(default=1)
    tags = models.ManyToManyField(tags, related_name='plans')
    people_joined = models.IntegerField(default=0)
    create_at = models.DateTimeField(auto_now_add=True)