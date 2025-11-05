from rest_framework import serializers
from plans.models import Plans
from tags.models import Tags

class PlansSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True
    )
    tags_display = serializers.SerializerMethodField()
    creator_username = serializers.CharField(source='leader_id.username', read_only=True)
    is_expired = serializers.SerializerMethodField()
    time_until_event = serializers.SerializerMethodField()

    class Meta:
        model = Plans
        fields = [
            'id',
            'title',
            'description',
            'location',
            'lat',
            'lng',
            'leader_id',
            'creator_username',
            'event_time',
            'max_people',
            'people_joined',
            'create_at',
            'tags',
            'tags_display',
            'is_expired',
            'time_until_event'
        ]
        extra_kwargs = {
            'create_at': {'read_only': True}
        }

    def get_tags_display(self, obj):
        """Return list of tag names for display"""
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]

    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.event_time <= timezone.now()

    def get_time_until_event(self, obj):
        from django.utils import timezone
        
        now = timezone.now()
        time_diff = obj.event_time - now
        
        if time_diff.total_seconds() <= 0:
            return "Expired"
        
        days = time_diff.days
        hours = time_diff.seconds // 3600
        minutes = (time_diff.seconds % 3600) // 60
        
        if days > 0:
            return f"{days}d {hours}h"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        
        plan = Plans.objects.create(**validated_data)
        
        # Add tags if provided
        if tags_data:
            # Filter out empty strings and None values
            tag_names = [tag_name.strip() for tag_name in tags_data if tag_name and tag_name.strip()]
            
            if tag_names:
                # Bulk get or create tags
                for tag_name in tag_names:
                    tag_obj, _ = Tags.objects.get_or_create(name=tag_name)
                    plan.tags.add(tag_obj)
        
        return plan

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)

        # Update plan fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update tags if provided
        if tags_data is not None:
            instance.tags.clear()
            
            # Filter out empty strings and None values
            tag_names = [tag_name.strip() for tag_name in tags_data if tag_name and tag_name.strip()]
            
            if tag_names:
                for tag_name in tag_names:
                    tag_obj, _ = Tags.objects.get_or_create(name=tag_name)
                    instance.tags.add(tag_obj)

        return instance