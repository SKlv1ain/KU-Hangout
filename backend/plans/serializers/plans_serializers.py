from rest_framework import serializers
from plans.model import plans
from users.models import Users
from tags.models import tags  # adjust if your tags app is named differently


class PlansSerializer(serializers.ModelSerializer):
    """
    Serializer for converting Plans model to/from JSON
    """

    class Meta:
        model = plans
        fields = [
            'id',
            'title',
            'description',
            'location',
            'lat',
            'lng',
            'leader_id',
            'event_time',
            'max_people',
            'people_joined',
            'create_at'
        ]
        extra_kwargs = {
            'create_at': {'read_only': True}  # don’t allow overriding created_at
        }

    # Create new Plan
    def create(self, validated_data):
        plan = plans.objects.create(**validated_data)
        return plan

    # Update existing Plan
    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.location = validated_data.get('location', instance.location)
        instance.lat = validated_data.get('lat', instance.lat)
        instance.lng = validated_data.get('lng', instance.lng)
        instance.event_time = validated_data.get('event_time', instance.event_time)
        instance.max_people = validated_data.get('max_people', instance.max_people)
        instance.people_joined = validated_data.get('people_joined', instance.people_joined)

        leader = validated_data.get('leader_id', None)
        if leader:
            instance.leader_id = leader

        instance.save()
        return instance