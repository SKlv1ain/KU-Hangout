from django.db import models
from rest_framework import serializers
from plans.models import Plans, PlanImage
from tags.models import Tags
from participants.models import Participants


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
    joined = serializers.SerializerMethodField()  # Whether current user has joined this plan
    role = serializers.SerializerMethodField()  # Current user's role in this plan (LEADER/MEMBER/None)
    images = serializers.SerializerMethodField()  # Read-only field for image URLs
    is_saved = serializers.SerializerMethodField()  # Whether current user has saved this plan

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
            'tags',               # write-only
            'tags_display',       # read-only
            'is_expired',         # read-only
            'time_until_event',   # read-only
            'members',            # read-only
            'joined',             # read-only
            'role',               # read-only
            'images',             # read-only
            'is_saved',           # read-only
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
            'members',
            'joined',
            'role',
            'is_saved',
        )

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

    def get_members(self, obj):
        """
        Return: user_id, username, display_name, profile_picture, role, joined_at
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
            # Get display_name or fallback to username
            display_name = getattr(u, "display_name", None) or u.username
            
            # Get profile_picture URL
            # profile_picture is now a URLField, so it's always a string (URL)
            profile_picture_url = u.profile_picture if u.profile_picture else None
            
            out.append({
                "user_id": u.id,
                "username": getattr(u, "username", None),
                "display_name": display_name,
                "profile_picture": profile_picture_url,
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

    def get_images(self, obj):
        """Return list of image URLs for this plan."""
        return [img.image_url for img in obj.images.all()]

    def get_is_saved(self, obj):
        """Check if current user has saved this plan."""
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        
        from plans.models import SavedPlan  # pylint: disable=import-outside-toplevel
        return SavedPlan.objects.filter(user=request.user, plan=obj).exists()  # pylint: disable=no-member

    def create(self, validated_data):
        # pop tags BEFORE creating
        tags_data = validated_data.pop('tags', [])

        # attach current user as leader and count them as joined
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["leader_id"] = request.user

        # initial count to 1 (leader already joined)
        validated_data["people_joined"] = 1

        plan = Plans.objects.create(**validated_data)  # pylint: disable=no-member

        # Upload images to Cloudinary if provided
        if request and hasattr(request, 'FILES'):
            images = request.FILES.getlist('images')
            if images:
                from plans.utils import upload_image_to_cloudinary  # pylint: disable=import-outside-toplevel
                
                for image_file in images:
                    try:
                        # Upload to Cloudinary
                        image_url = upload_image_to_cloudinary(image_file)
                        # Create PlanImage record
                        PlanImage.objects.create(  # pylint: disable=no-member
                            plan=plan,
                            image_url=image_url
                        )
                    except Exception as e:
                        print(f"[PlansSerializer] Failed to upload image: {e}")
                        # Continue with other images even if one fails

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

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.tags.clear()
            tag_names = [t.strip() for t in tags_data if t and t.strip()]
            for name in tag_names:
                tag_obj, _ = Tags.objects.get_or_create(name=name)  # pylint: disable=no-member
                instance.tags.add(tag_obj)

        return instance
