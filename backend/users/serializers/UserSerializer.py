from rest_framework import serializers
from users.models import Users

class user_serializer(serializers.ModelSerializer):
    """
    Class userserializer for convert python model into json format for api
    """
    class Meta:
        model = Users
        fields = ['id', 'username', 'role', 'avg_rating', 'review_count', 'contact', 'password']
        extra_kwargs = {
            'password': {'write_only': True}  # don’t expose passwords in API response
        }

    #function for create user profiels and check for validation
    def create(self, validated_data):
        user = Users(
            username=validated_data['username'],
            role=validated_data.get('role', 'user'),
            avg_rating=validated_data.get('avg_rating', 0),
            review_count=validated_data.get('review_count', 0),
            contact=validated_data.get('contact', '')
        )
        user.set_password(validated_data['password'])  # hash the password
        user.save()
        return user
