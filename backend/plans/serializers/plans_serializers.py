from django.db import models
from rest_framework import serializers
from plans.models import Plans, PlanImage
from tags.models import Tags
from participants.models import Participants
from users.models import Users



# ------------------- PlanImage Serializer -------------------
class PlanImageSerializer(serializers.ModelSerializer):
    # Use a custom field that handles both base64 and file uploads
    image = serializers.ImageField(required=False)

    class Meta:
        model = PlanImage
        fields = ["id", "image",  "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]

    def validate(self, attrs):
        """Ensure either image or image_base64 is provided"""
        if not attrs.get('image'):
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
    is_expired = serializers.SerializerMethodField()
    time_until_event = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()  # <- exact shape per your ask

    class Meta:
        model = Plans
        fields = [
            'id',
            'title',
            'description',
            'location',
            'leader_id',
            'creator_username',
            'event_time',
            'max_people',
            'people_joined',
            'created_at',
            'tags',               # write-only
            'tags_display',       # read-only
            'is_expired',         # read-only
            'time_until_event',   # read-only
            'members',            # read-only
            'people_joined',             # read-only
        ]
        read_only_fields = (
            'id',
            'leader_id',
            'people_joined',
            'created_at',
            'creator_username',
            'tags_display',
            'is_expired',
            'time_until_event',
            'members',
            'joined',
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

    def get_members(self, obj):
        """
        Return only: user_id, username, role, joined_at
        Leader first, then by join time.
        """
        qs = obj.participants.select_related('user').order_by(
            models.Case(
                models.When(role='LEADER', then=0),
                default=1,
                output_field=models.IntegerField()
            ),
            'joined_at'
        )
        out = []
        for p in qs:
            u = p.user
            out.append({
                "user_id": u.id,
                "username": getattr(u, "username", None),
                "role": p.role,
                "joined_at": p.joined_at,
            })
        return out

    def get_joined(self, obj):
        """Check if current user has joined this plan."""
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is the leader
        if obj.leader_id_id == request.user.id:
            return True
        
        # Check if user is a participant
        return Participants.objects.filter(plan=obj, user=request.user).exists()  # pylint: disable=no-member

    def get_role(self, obj):
        """Get current user's role in this plan."""
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return None
        
        # Check if user is the leader
        if obj.leader_id_id == request.user.id:
            return 'LEADER'
        
        # Check if user is a participant
        participant = Participants.objects.filter(plan=obj, user=request.user).first()  # pylint: disable=no-member
        if participant:
            return participant.role
        
        return None

    def create(self, validated_data):
        # pop tags BEFORE creating
        tags_data = validated_data.pop('tags', [])

        # attach current user as leader and count them as joined
        request = self.context.get("request")
        
        if request and request.user.is_authenticated:
            validated_data["leader_id"] = request.user

        # initial count to 1 (leader already joined)
        validated_data["people_joined"] = 1

        plan = Plans.objects.create(**validated_data)  # pylint: disable=no-member

        # ensure leader participant row
        if plan.leader_id_id:
            Participants.objects.get_or_create(  # pylint: disable=no-member
                user=plan.leader_id,
                plan=plan,
                defaults={"role": "LEADER"},
            )

            # Initialize chat thread for this plan and add leader as member
            try:
                from chat.models import chat_threads, chat_member  # pylint: disable=import-outside-toplevel

                thread, _ = chat_threads.objects.get_or_create(
                    plan=plan,
                    defaults={
                        "title": f"Chat for {plan.title}",
                        "created_by": plan.leader_id,
                    },
                )
                chat_member.objects.get_or_create(thread=thread, user=plan.leader_id)
            except Exception as chat_error:  # pragma: no cover - guard against chat failures
                print(f"[PlansSerializer] Failed to initialize chat for plan {plan.id}: {chat_error}")

        # add tags if provided
        if tags_data:
            tag_names = [t.strip() for t in tags_data if t and t.strip()]
            for name in tag_names:
                tag_obj, _ = Tags.objects.get_or_create(name=name)  # pylint: disable=no-member
                plan.tags.add(tag_obj)

        return plan

    def update(self, instance, validated_data):
        # prevent client from changing leader/people count
        validated_data.pop('leader_id', None)
        validated_data.pop('people_joined', None)

        tags_data = validated_data.pop('tags', None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update tags if provided
        if tags_data is not None:
            instance.tags.clear()
            tag_names = [t.strip() for t in tags_data if t and t.strip()]
            for name in tag_names:
                tag_obj, _ = Tags.objects.get_or_create(name=name)  # pylint: disable=no-member
                instance.tags.add(tag_obj)

        return instance


# ------------------- Plans with Images Serializer (for detail view) -------------------
class PlansWithImagesSerializer(PlansSerializer):
    """Extended serializer that includes images"""
    images = PlanImageSerializer(many=True, read_only=True)

    class Meta(PlansSerializer.Meta):
        fields = PlansSerializer.Meta.fields + ['images']