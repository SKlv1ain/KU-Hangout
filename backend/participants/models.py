from django.db import models
from django.conf import settings
from plans import plans
from users import users


# Model for participnats
class Participants(models.Model):
    user = models.ForeignKey(users, on_delete=models.CASCADE, related_name='plans')
    plan = models.ForeignKey(plans, on_delete=models.CASCADE, related_name='participants')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'plan') #prevent duplicate join