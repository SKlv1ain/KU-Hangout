from decimal import Decimal
from django.db.models import Avg, Count
from users.models import Users
from reviews.models import reviews


def update_user_rating_stats(user_id):
    """
    Calculate and update avg_rating and review_count for a user.
    This should be called after creating, updating, or deleting a review.
    """
    try:
        user = Users.objects.get(id=user_id)
        
        # Calculate average rating from all reviews where this user is the leader
        rating_stats = reviews.objects.filter(leader_id=user_id).aggregate(
            avg_rating=Avg('rating'),
            review_count=Count('id')
        )
        
        # Update user's avg_rating and review_count
        user.avg_rating = rating_stats['avg_rating'] or Decimal('0.00')
        user.review_count = rating_stats['review_count'] or 0
        user.save(update_fields=['avg_rating', 'review_count'])
        
        return {
            'avg_rating': float(user.avg_rating),
            'review_count': user.review_count
        }
    except Users.DoesNotExist:
        return None

