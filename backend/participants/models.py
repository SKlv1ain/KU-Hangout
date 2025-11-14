from django.db import models
from plans.models import Plans
from users.models import Users

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
        constraints = [
            models.UniqueConstraint(fields=['user', 'plan'], name='uniq_user_plan')
        ]
        indexes = [
            models.Index(fields=['plan', 'user']),
        ]

    def __str__(self):
        return f'Participants(user={self.user_id}, plan={self.plan_id}, role={self.role})'
