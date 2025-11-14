from rest_framework import serializers
from plans.models import Plans, PlanImage
from tags.models import Tags
from drf_extra_fields.fields import Base64ImageField


# ------------------- PlanImage Serializer -------------------
class PlanImageSerializer(serializers.ModelSerializer):
    # Use a custom field that handles both base64 and file uploads
    image = serializers.ImageField(required=False)
    image_base64 = Base64ImageField(required=False, write_only=True)

    class Meta:
        model = PlanImage
        fields = ["id", "image", "image_base64", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]

    def validate(self, attrs):
        """Ensure either image or image_base64 is provided"""
        if not attrs.get('image') and not attrs.get('image_base64'):
            raise serializers.ValidationError({"image": "Image is required"})
        
        # If base64 provided, use it as the image
        if attrs.get('image_base64'):
            attrs['image'] = attrs.pop('image_base64')
        
        return attrs

    def to_representation(self, instance):
        """Return image URL in response"""
        representation = super().to_representation(instance)
        # Remove image_base64 from response
        representation.pop('image_base64', None)
        
        if instance.image:
            representation['image_url'] = instance.image.url
        return representation
    
# ------------------- Plans Serializer (without images) -------------------
class PlansSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(), 
        required=False, 
        write_only=True
    )
    tags_display = serializers.SerializerMethodField()
    creator_username = serializers.CharField(source='leader_id.username', read_only=True)
    creator_id = serializers.IntegerField(source='leader_id.id', read_only=True)
    is_expired = serializers.SerializerMethodField()
    time_until_event = serializers.SerializerMethodField()
    image_count = serializers.SerializerMethodField()

    class Meta:
        model = Plans
        fields = [
            'id', 'title', 'description', 'location', 'leader_id', 
            'creator_username', 'creator_id', 'event_time', 'max_people', 
            'people_joined', 'created_at', 'tags', 'tags_display', 
            'is_expired', 'time_until_event', 'image_count'
        ]
        read_only_fields = (
            'id', 'leader_id', 'people_joined', 'created_at', 
            'creator_username', 'creator_id', 'tags_display', 
            'is_expired', 'time_until_event', 'image_count'
        )

    def get_tags_display(self, obj):
        """Return list of tags with id and name"""
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]

    def get_is_expired(self, obj):
        """Check if event has passed"""
        from django.utils import timezone
        return obj.event_time <= timezone.now()

    def get_time_until_event(self, obj):
        """Calculate human-readable time until event"""
        from django.utils import timezone
        now = timezone.now()
        diff = obj.event_time - now
        
        if diff.total_seconds() <= 0:
            return "Expired"
        
        days, seconds = diff.days, diff.seconds
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        
        if days > 0:
            return f"{days}d {hours}h"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"

    def get_image_count(self, obj):
        """Return number of images for this plan"""
        return obj.images.count()

    def validate_max_people(self, value):
        """Validate max_people is reasonable"""
        if value < 1:
            raise serializers.ValidationError("Maximum people must be at least 1.")
        if value > 1000:
            raise serializers.ValidationError("Maximum people cannot exceed 1000.")
        return value

    def create(self, validated_data):
        """Create plan with tags"""
        tags_data = validated_data.pop("tags", [])
        request = self.context.get("request")
        
        if request and request.user.is_authenticated:
            validated_data["leader_id"] = request.user

        plan = Plans.objects.create(**validated_data)

        # Create/add tags
        for name in tags_data:
            tag_obj, _ = Tags.objects.get_or_create(name=name.strip())
            plan.tags.add(tag_obj)

        return plan

    def update(self, instance, validated_data):
        """Update plan and tags"""
        tags_data = validated_data.pop("tags", None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update tags if provided
        if tags_data is not None:
            instance.tags.clear()
            for name in tags_data:
                tag_obj, _ = Tags.objects.get_or_create(name=name.strip())
                instance.tags.add(tag_obj)

        return instance


# ------------------- Plans with Images Serializer (for detail view) -------------------
class PlansWithImagesSerializer(PlansSerializer):
    """Extended serializer that includes images"""
    images = PlanImageSerializer(many=True, read_only=True)

    class Meta(PlansSerializer.Meta):
        fields = PlansSerializer.Meta.fields + ['images']