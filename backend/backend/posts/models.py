from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Plan(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=100)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    event_time = models.DateTimeField()
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name="plans_led")
    max_people = models.IntegerField()
    people_joined = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} at {self.location}"
