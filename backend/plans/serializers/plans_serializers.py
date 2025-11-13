from rest_framework import serializers
from plans.models import Plans, PlanImage
from tags.models import Tags
from participants.models import Participants


class PlanImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanImage
        fields = ["id", "image_base64"]


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
    images = PlanImageSerializer(many=True, required=True)

    class Meta:
        model = Plans
        fields = [
            'id', 'title', 'description', 'location', 'lat', 'lng', 'leader_id',
            'creator_username', 'event_time', 'max_people', 'people_joined',
            'create_at', 'tags', 'tags_display', 'is_expired', 'time_until_event',
            'images'
        ]
        read_only_fields = (
            'id', 'leader_id', 'people_joined', 'create_at', 'creator_username',
            'tags_display', 'is_expired', 'time_until_event',
        )

    # ========== Custom Methods ==========
    def get_tags_display(self, obj):
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]

    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.event_time <= timezone.now()

    def get_time_until_event(self, obj):
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

    # ========== Create & Update ==========
    def create(self, validated_data):
        images_data = validated_data.pop("images", [])
        tags_data = validated_data.pop("tags", [])
        request = self.context.get("request")

        if not images_data:
            raise serializers.ValidationError("At least one image is required.")
        if len(images_data) > 12:
            raise serializers.ValidationError("You can upload up to 12 images only.")

        if request and request.user and request.user.is_authenticated:
            validated_data["leader_id"] = request.user

        plan = Plans.objects.create(**validated_data)

        # Tags
        for name in tags_data:
            tag_obj, _ = Tags.objects.get_or_create(name=name.strip())
            plan.tags.add(tag_obj)

        # Images
        for img in images_data:
            PlanImage.objects.create(plan=plan, **img)

        return plan

    def update(self, instance, validated_data):
        images_data = validated_data.pop("images", None)
        tags_data = validated_data.pop("tags", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.tags.clear()
            for name in tags_data:
                tag_obj, _ = Tags.objects.get_or_create(name=name.strip())
                instance.tags.add(tag_obj)

        if images_data is not None:
            if len(images_data) > 12:
                raise serializers.ValidationError("You can upload up to 12 images only.")
            instance.images.all().delete()
            for img in images_data:
                PlanImage.objects.create(plan=instance, **img)

        return instance
