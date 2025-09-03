from django.db import models
from django.conf import settings
from plans import plans
from users import users

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

