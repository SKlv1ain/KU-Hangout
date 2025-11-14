from django.db import models
from users.models import Users
from tags.models import Tags


class Plans(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    leader_id = models.ForeignKey(Users, related_name="leader", on_delete=models.CASCADE)
    event_time = models.DateTimeField()
    max_people = models.IntegerField(default=1)
    people_joined = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField(Tags, related_name="plans", blank=True)

    class Meta:
        verbose_name_plural = "Plans"
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class PlanImage(models.Model):
    plan = models.ForeignKey(Plans, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='plan_images/')  # Uploads to Cloudinary automatically
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']
        verbose_name = "Plan Image"
        verbose_name_plural = "Plan Images"

    def __str__(self):
        return f"Image for {self.plan.title}"