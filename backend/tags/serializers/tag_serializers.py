from rest_framework import serializers
from tags.models import tags

class TagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = tags
        fields = ['id', 'name']