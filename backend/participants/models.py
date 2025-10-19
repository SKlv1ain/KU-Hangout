from django.db import models
from django.conf import settings
from plans.models import Plans
from users.models import Users


# Model for participnats
class Participants(models.Model):
    ROLE_CHOICES = (
        ('LEADER', 'Leader'),
        ('MEMBER', 'Member'),
    )

    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='participations')
    plan = models.ForeignKey(Plans, on_delete=models.CASCADE, related_name='participants')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MEMBER')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'plan')  # prevent duplicate join

    def __str__(self):
        return f'{self.user_id} -> {self.plan_id} ({self.role})'