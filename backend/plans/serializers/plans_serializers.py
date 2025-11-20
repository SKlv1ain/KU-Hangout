from django.db import models
from rest_framework import serializers

from participants.models import Participants
from plans.models import Plans, PlanImage
from tags.models import Tags


class PlanImageSerializer(serializers.ModelSerializer):
    """Serializer for plan images stored in Cloudinary."""

    class Meta:
        model = PlanImage
        fields = ("id", "image_url", "uploaded_at")
        read_only_fields = ("id", "image_url", "uploaded_at")


class PlansSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True,
    )
    tags_display = serializers.SerializerMethodField()
    creator_username = serializers.CharField(source="leader_id.username", read_only=True)
    is_expired = serializers.SerializerMethodField()
    time_until_event = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    joined = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Plans
        fields = [
            "id",
            "title",
            "description",
            "location",
            "lat",
            "lng",
            "leader_id",
            "creator_username",
            "event_time",
            "max_people",
            "people_joined",
            "create_at",
            "tags",
            "tags_display",
            "is_expired",
            "time_until_event",
            "members",
            "joined",
            "role",
            "images",
            "is_saved",
        ]
        read_only_fields = (
            "id",
            "leader_id",
            "people_joined",
            "create_at",
            "creator_username",
            "tags_display",
            "is_expired",
            "time_until_event",
            "members",
            "joined",
            "role",
            "is_saved",
        )

    def get_tags_display(self, obj):
        return [{"id": tag.id, "name": tag.name} for tag in obj.tags.all()]

    def get_is_expired(self, obj):
        from django.utils import timezone

        return obj.event_time <= timezone.now()

    def get_time_until_event(self, obj):
        from django.utils import timezone

        now = timezone.now()
        diff = obj.event_time - now
        if diff.total_seconds() <= 0:
            return "Expired"

        days = diff.days
        hours = diff.seconds // 3600
        minutes = (diff.seconds % 3600) // 60
        if days > 0:
            return f"{days}d {hours}h"
        if hours > 0:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"

    def get_members(self, obj):
        """
        Return enriched participant info:
        user_id, username, display_name, profile_picture, role, joined_at.
        Leader first, then by join time.
        """

        qs = obj.participants.select_related("user").order_by(
            models.Case(
                models.When(role="LEADER", then=0),
                default=1,
                output_field=models.IntegerField(),
            ),
            "joined_at",
        )

        members = []
        for participant in qs:
            user = participant.user
            display_name = getattr(user, "display_name", None) or user.username
            profile_picture_url = user.profile_picture if getattr(user, "profile_picture", None) else None

            members.append(
                {
                    "user_id": user.id,
                    "username": getattr(user, "username", None),
                    "display_name": display_name,
                    "profile_picture": profile_picture_url,
                    "role": participant.role,
                    "joined_at": participant.joined_at,
                }
            )
        return members

    def get_joined(self, obj):
        """Check if the current user has joined this plan."""
        request = self.context.get("request")
        if not request or not getattr(request, "user", None) or not request.user.is_authenticated:
            return False

        if obj.leader_id_id == request.user.id:
            return True

        return Participants.objects.filter(plan=obj, user=request.user).exists()

    def get_role(self, obj):
        """Return the current user's role for the plan."""
        request = self.context.get("request")
        if not request or not getattr(request, "user", None) or not request.user.is_authenticated:
            return None

        if obj.leader_id_id == request.user.id:
            return "LEADER"

        participant = Participants.objects.filter(plan=obj, user=request.user).first()
        return participant.role if participant else None

    def get_images(self, obj):
        """Return simple list of image URLs for compatibility with existing frontend."""
        return [image.image_url for image in obj.images.all()]

    def get_is_saved(self, obj):
        """Check if the current user saved this plan."""
        request = self.context.get("request")
        if not request or not getattr(request, "user", None) or not request.user.is_authenticated:
            return False

        from plans.models import SavedPlan  # pylint: disable=import-outside-toplevel

        return SavedPlan.objects.filter(user=request.user, plan=obj).exists()

    def create(self, validated_data):
        tags_data = validated_data.pop("tags", [])

        request = self.context.get("request")
        if request and getattr(request, "user", None) and request.user.is_authenticated:
            validated_data["leader_id"] = request.user

        validated_data["people_joined"] = 1
        plan = Plans.objects.create(**validated_data)

        if request and hasattr(request, "FILES"):
            images = request.FILES.getlist("images")
            if images:
                from plans.utils import upload_image_to_cloudinary  # pylint: disable=import-outside-toplevel

                for image_file in images:
                    try:
                        image_url = upload_image_to_cloudinary(image_file)
                        PlanImage.objects.create(plan=plan, image_url=image_url)
                    except Exception as exc:  # pragma: no cover - best-effort logging
                        print(f"[PlansSerializer] Failed to upload image: {exc}")

        if plan.leader_id_id:
            Participants.objects.get_or_create(
                user=plan.leader_id,
                plan=plan,
                defaults={"role": "LEADER"},
            )

            try:
                from chat.models import chat_member, chat_threads  # pylint: disable=import-outside-toplevel

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

        if tags_data:
            tag_names = [tag.strip() for tag in tags_data if tag and tag.strip()]
            for name in tag_names:
                tag_obj, _ = Tags.objects.get_or_create(name=name)
                plan.tags.add(tag_obj)

        return plan

    def update(self, instance, validated_data):
        validated_data.pop("leader_id", None)
        validated_data.pop("people_joined", None)

        tags_data = validated_data.pop("tags", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.tags.clear()
            tag_names = [tag.strip() for tag in tags_data if tag and tag.strip()]
            for name in tag_names:
                tag_obj, _ = Tags.objects.get_or_create(name=name)
                instance.tags.add(tag_obj)

        return instance


class PlansWithImagesSerializer(PlansSerializer):
    """Extended serializer that includes structured image data."""

    images = PlanImageSerializer(many=True, read_only=True)

    class Meta(PlansSerializer.Meta):
        fields = PlansSerializer.Meta.fields
