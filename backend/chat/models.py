from django.db import models
from django.conf import settings
from plans.models import Plans
from users.models import Users

# Model for chat threads
class chat_threads(models.Model):
    title = models.CharField(max_length=120)
    plan = models.ForeignKey(Plans, on_delete=models.CASCADE,related_name="chat_thread")
    created_by = models.ForeignKey(Users, on_delete=models.CASCADE,related_name="thread_created")
    create_at = models.DateTimeField(auto_now_add=True)

# Model for chat_member
class chat_member(models.Model):
    thread = models.ForeignKey(chat_threads, on_delete=models.CASCADE, related_name="member")
    user = models.ForeignKey(Users, on_delete=models.CASCADE,related_name="chat_member")

    class Meta:
        unique_together = ("thread", "user")

# Model for chat message
class chat_messages(models.Model):
    thread = models.ForeignKey(chat_threads, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(Users, on_delete=models.CASCADE, related_name="sent_messages")
    body = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True, db_index=True)  # Add index

    class Meta:
        ordering = ['create_at']  # Default ordering


class chat_message_reads(models.Model):
    message = models.ForeignKey(chat_messages, on_delete=models.CASCADE, related_name="read_receipts")
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name="message_reads")
    read_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = ("message", "user")
        ordering = ["-read_at"]
