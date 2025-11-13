from rest_framework import serializers
from plans.models import Plans
from tags.models import Tags
from participants.models import Participants

class PlansSerializer(serializers.ModelSerializer):
    tags_data = validated_data.pop('tags', [])
    if tags_data:
        for name in tags_data:
            name = name.strip()
            if name:
                tag_obj, _ = Tags.objects.get_or_create(name=name)  # creates new if not exist
                Plans.tags.add(tag_obj)

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
            'tags',               # write-only input list of names
            'tags_display',       # read-only
            'is_expired',         # read-only
            'time_until_event'    # read-only
        ]
        read_only_fields = (
            'id',
            'leader_id',
            'people_joined',
            'create_at',
            'creator_username',
            'tags_display',
            'is_expired',
            'time_until_event',
        )
        # keep extra_kwargs if you need others read_only/required settings

    def get_tags_display(self, obj):
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
        # pop tags BEFORE creating
        tags_data = validated_data.pop('tags', [])

        # attach current user as leader
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["leader_id"] = request.user

        plan = Plans.objects.create(**validated_data)

        # add tags if provided
        if tags_data:
            tag_names = [t.strip() for t in tags_data if t and t.strip()]
            for name in tag_names:
                tag_obj, _ = Tags.objects.get_or_create(name=name)
                plan.tags.add(tag_obj)

        return plan

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.tags.clear()
            tag_names = [t.strip() for t in tags_data if t and t.strip()]
            for name in tag_names:
                tag_obj, _ = Tags.objects.get_or_create(name=name)
                instance.tags.add(tag_obj)

        return instance
    
    def get_role(self, obj):
        """Get user's role in this plan."""
        user = self.context.get('user')
        if user:
            participant = Participants.objects.filter(plan=obj, user=user).first()
            return participant.role if participant else None
        return None
    
    def get_joined_at(self, obj):
        """Get when user joined this plan."""
        user = self.context.get('user')
        if user:
            participant = Participants.objects.filter(plan=obj, user=user).first()
            return participant.joined_at if participant else None
        return None

