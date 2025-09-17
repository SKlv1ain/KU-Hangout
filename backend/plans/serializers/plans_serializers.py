from rest_framework import serializers
from plans.models import Plans
from tags.serializers.tag_serializers import TagsSerializer  # import the new tags serializer
from tags.models import Tags

class PlansSerializer(serializers.ModelSerializer):
    tags = TagsSerializer(many=True, required=False)  # nested serializer

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
            'event_time',
            'max_people',
            'people_joined',
            'create_at',
            'tags'
        ]
        extra_kwargs = {
            'create_at': {'read_only': True}
        }

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        plan = Plans.objects.create(**validated_data)
        
        # Add tags
        for tag_data in tags_data:
            tag_obj, created = Tags.objects.get_or_create(name=tag_data['name'])
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
            for tag_data in tags_data:
                tag_obj, created = tags.objects.get_or_create(name=tag_data['name'])
                instance.tags.add(tag_obj)

        return instance
