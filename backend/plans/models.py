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

# Model for tags
class tags(models.Model):
    name = models.CharField(max_length=50, unique=True)

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
    people_joined = models.IntegerField(default=1)
    create_at = models.DateTimeField(auto_now_add=True)

# Model for participnats
class Participants(models.Model):
    user = models.ForeignKey(users, on_delete=models.CASCADE, related_name='plans')
    plan = models.ForeignKey(plans, on_delete=models.CASCADE, related_name='participants')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'plan') #prevent duplicate join

# Model reviews
class reviews(models.Model):
    reviewer_id = models.ForeignKey(users, on_delete=models.CASCADE,related_name="review_made")
    leader_id = models.ForeignKey(users, on_delete=models.CASCADE,related_name="review_recived")
    plan_id = models.ForeignKey(plans, on_delete=models.CASCADE,related_name="reviews")
    rating = models.DecimalField(decimal_places=2)
    comment = models.TextField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

# Model for chat threads
class chat_threads(models.Model):
    title = models.CharField(max_length=120)
    plan = models.ForeignKey(plans, on_delete=models.CASCADE,related_name="chat_thread")
    created_by = models.ForeignKey(users, on_delete=models.CASCADE,related_name="thread_created")
    create_at = models.DateTimeField(auto_now_add=True)

# Model for chat_member
class chat_member(models.Model):
    thread = models.ForeignKey(chat_threads, on_delete=models.CASCADE, related_name="member")
    user = models.ForeignKey(users, on_delete=models.CASCADE,related_name="chat_member")

    class Meta:
        unique_together = ("thread", "user")

# Model for chat message
class chat_messages(models.Model):
    thread = models.ForeignKey(chat_threads, on_delete=models.CASCADE)
    sender = models.ForeignKey(users, on_delete=models.CASCADE,related_name="sender")
    body = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)

