from django.db import models
from rest_framework import serializers
from plans.models import Plans
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

    def create(self, validated_data):
        # pop tags BEFORE creating
        tags_data = validated_data.pop('tags', [])

        # attach current user as leader and count them as joined
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["leader_id"] = request.user

        # initial count to 1 (leader already joined)
        validated_data["people_joined"] = 1

        plan = Plans.objects.create(**validated_data)

        # ensure leader participant row
        if plan.leader_id_id:
            Participants.objects.get_or_create(
                user=plan.leader_id,
                plan=plan,
                defaults={"role": "LEADER"},
            )

        # add tags if provided
        if tags_data:
            tag_names = [t.strip() for t in tags_data if t and t.strip()]
            for name in tag_names:
                tag_obj, _ = Tags.objects.get_or_create(name=name)
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
                tag_obj, _ = Tags.objects.get_or_create(name=name)
                instance.tags.add(tag_obj)

        return instance
