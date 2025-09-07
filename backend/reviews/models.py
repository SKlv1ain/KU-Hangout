from django.db import models
from django.conf import settings
from users import users
from plans import plans

# Model reviews
class reviews(models.Model):
    reviewer_id = models.ForeignKey(users, on_delete=models.CASCADE,related_name="review_made")
    leader_id = models.ForeignKey(users, on_delete=models.CASCADE,related_name="review_recived")
    plan_id = models.ForeignKey(plans, on_delete=models.CASCADE,related_name="reviews")
    rating = models.DecimalField(decimal_places=2)
    comment = models.TextField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
