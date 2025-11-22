from rest_framework import serializers
from reviews.models import reviews
from users.models import Users
from decimal import Decimal


class ReviewSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    leader_id = serializers.IntegerField(write_only=True)
    comment = serializers.CharField(max_length=200, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = reviews
        fields = ['id', 'reviewer_id', 'leader_id', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer_id', 'created_at']

    def validate_rating(self, value):
        """Convert integer 1-5 to Decimal (1.00, 2.00, ..., 5.00)"""
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return Decimal(str(value))

    def validate(self, attrs):
        """Validate that reviewer_id != leader_id"""
        reviewer_id = self.context['request'].user.id
        leader_id = attrs.get('leader_id')

        if reviewer_id == leader_id:
            raise serializers.ValidationError({
                'leader_id': 'You cannot rate yourself'
            })

        # Note: We don't check unique constraint here because create() method
        # handles update logic for existing reviews

        return attrs

    def create(self, validated_data):
        """Create or update review"""
        reviewer = self.context['request'].user
        leader_id = validated_data.pop('leader_id')
        
        # Try to get existing review
        existing_review = reviews.objects.filter(
            reviewer_id=reviewer,
            leader_id=leader_id
        ).first()

        if existing_review:
            # Update existing review
            existing_review.rating = validated_data['rating']
            existing_review.comment = validated_data.get('comment', existing_review.comment)
            existing_review.save()
            return existing_review
        else:
            # Create new review
            leader = Users.objects.get(id=leader_id)
            return reviews.objects.create(
                reviewer_id=reviewer,
                leader_id=leader,
                **validated_data
            )

