# plans/models.py
from django.db import models
from users.models import Users

class Plans(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    lat = models.DecimalField(decimal_places=2, max_digits=8, null=True, blank=True)
    lng = models.DecimalField(decimal_places=2, max_digits=8, null=True, blank=True)
    leader_id = models.ForeignKey(Users, related_name="leader", on_delete=models.CASCADE)
    event_time = models.DateTimeField()
    max_people = models.IntegerField(default=1)
    people_joined = models.IntegerField(default=0)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class PlanImage(models.Model):
    plan = models.ForeignKey(Plans, on_delete=models.CASCADE, related_name='images')
    image_data = models.BinaryField()  # store raw binary data
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.plan.title}"
