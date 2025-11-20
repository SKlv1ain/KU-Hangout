from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from reviews.serializers.review_serializer import ReviewSerializer
from reviews.utils import update_user_rating_stats
from reviews.models import reviews


class ReviewCreateOrUpdateView(APIView):
    """
    POST /api/reviews/ - Create or update a rating for a user
    GET /api/reviews/?leader_id={id} - Get current user's rating for a specific user
    If a rating already exists for this reviewer-leader pair, it will be updated.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user's rating for a specific leader"""
        leader_id = request.query_params.get('leader_id')
        
        if not leader_id:
            return Response(
                {"error": "leader_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            leader_id_int = int(leader_id)
        except ValueError:
            return Response(
                {"error": "leader_id must be a valid integer"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get existing review
        existing_review = reviews.objects.filter(
            reviewer_id=request.user,
            leader_id=leader_id_int
        ).first()
        
        if existing_review:
            return Response({
                'id': existing_review.id,
                'rating': float(existing_review.rating),
                'comment': existing_review.comment,
                'leader_id': leader_id_int,
                'created_at': existing_review.created_at,
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "No rating found"},
                status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request):
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            review = serializer.save()
            
            # Update the leader's rating statistics
            leader_id = review.leader_id.id
            stats = update_user_rating_stats(leader_id)
            
            # Return review data with updated stats
            response_data = {
                'id': review.id,
                'rating': float(review.rating),
                'comment': review.comment,
                'leader_id': leader_id,
                'created_at': review.created_at,
                'updated_stats': stats
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

