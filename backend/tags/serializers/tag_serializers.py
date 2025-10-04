from rest_framework import serializers
from tags.models import Tags

class TagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tags
        fields = ['id', 'name']