# notifications/models.py
from django.conf import settings
from django.db import models
from plans.models import Plans


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ("PLAN_CREATED", "Plan Created"),
        ("PLAN_JOINED", "Plan Joined"),
        ("PLAN_LEFT", "Plan Left"),
        ("PLAN_UPDATED", "Plan Updated"),
        ("PLAN_DELETED", "Plan Deleted"),
        ("OTHER", "Other"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    message = models.CharField(max_length=255)
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default="OTHER",
    )
    plan = models.ForeignKey(
        Plans,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.message[:50]}"
