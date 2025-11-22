from django.db import models

from plans.models import Plans
from users.models import Users


class reviews(models.Model):
    reviewer_id = models.ForeignKey(Users, on_delete=models.CASCADE, related_name="review_made")
    leader_id = models.ForeignKey(Users, on_delete=models.CASCADE, related_name="review_recived")
    plan_id = models.ForeignKey(Plans, on_delete=models.CASCADE, related_name="reviews", null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2)
    comment = models.TextField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("reviewer_id", "leader_id")
