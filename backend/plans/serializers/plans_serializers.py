from rest_framework import serializers
from plans.models import Plans
from tags.models import Tags
from tags.serializers.tag_serializers import TagsSerializer

class PlansSerializer(serializers.ModelSerializer):
    # Accept list of IDs
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tags.objects.all(),
        many=True,
        required=False
    )
    # Nested detail for output
    tags_detail = TagsSerializer(source='tags', many=True, read_only=True)

    class Meta:
        model = Plans
        fields = [
            'id', 'title', 'description', 'location', 'lat', 'lng',
            'leader_id', 'event_time', 'max_people', 'people_joined',
            'create_at', 'tags', 'tags_detail'
        ]
        read_only_fields = ('id', 'leader_id', 'people_joined', 'create_at')

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        plan = Plans.objects.create(**validated_data)

        # Assign tags, automatically create any new ones by name
        tag_objs = []
        for tag in tags_data:
            # tag here is a Tag instance if passed via ID
            tag_objs.append(tag)
        plan.tags.set(tag_objs)
        return plan

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.tags.set(tags_data)
        return instance
