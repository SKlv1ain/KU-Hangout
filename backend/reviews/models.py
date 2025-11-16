from django.db import models
from django.conf import settings
from users.models import Users
from plans.models import Plans

# Model reviews
class reviews(models.Model):
    reviewer_id = models.ForeignKey(Users, on_delete=models.CASCADE,related_name="review_made")
    leader_id = models.ForeignKey(Users, on_delete=models.CASCADE,related_name="review_recived")
    plan_id = models.ForeignKey(Plans, on_delete=models.CASCADE,related_name="reviews")
    rating = models.DecimalField(decimal_places=2)
    comment = models.TextField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
