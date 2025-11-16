from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from users.models import Users
from tags.models import Tags

# Model for plans
class Plans(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    lat = models.DecimalField(decimal_places=2, max_digits=8, default=None, null=True, blank=True)
    lng = models.DecimalField(decimal_places=2, max_digits=8, default=None, null=True, blank=True)
    leader_id = models.ForeignKey(Users, related_name="leader", on_delete=models.CASCADE)
    event_time = models.DateTimeField()
    max_people = models.IntegerField(default=1)
    tags = models.ManyToManyField(Tags, related_name='plans', default=" ", null=True)
    people_joined = models.IntegerField(default=0)
    create_at = models.DateTimeField(auto_now_add=True)


# Model for plan images stored in Cloudinary
class PlanImage(models.Model):
    plan = models.ForeignKey(Plans, related_name='images', on_delete=models.CASCADE)
    image_url = models.URLField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']
        verbose_name = 'Plan Image'
        verbose_name_plural = 'Plan Images'

    def __str__(self):
        return f"Image for {self.plan.title} (uploaded at {self.uploaded_at})"


# Model for saved plans (user bookmarks)
class SavedPlan(models.Model):
    user = models.ForeignKey(Users, related_name='saved_plans', on_delete=models.CASCADE)
    plan = models.ForeignKey(Plans, related_name='saved_by_users', on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'plan')
        ordering = ['-saved_at']
        verbose_name = 'Saved Plan'
        verbose_name_plural = 'Saved Plans'

    def __str__(self):
        return f"{self.user.username} saved {self.plan.title}"