from rest_framework import serializers
from users.models import Users

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for converting user model to JSON and handling profile creation/update.
    """

    # Explicitly declare profile_picture to handle file uploads
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Users
        fields = [
            'id',
            'username',
            'role',
            'avg_rating',
            'review_count',
            'contact',
            'password',
            'profile_picture'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        profile_picture = validated_data.pop('profile_picture', None)  # extract image if provided
        user = Users(
            username=validated_data['username'],
            role=validated_data.get('role', 'user'),
            avg_rating=validated_data.get('avg_rating', 0),
            review_count=validated_data.get('review_count', 0),
            contact=validated_data.get('contact', '')
        )
        user.set_password(validated_data['password'])
        if profile_picture:
            user.profile_picture = profile_picture  # save image if uploaded
        user.save()
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.role = validated_data.get('role', instance.role)
        instance.avg_rating = validated_data.get('avg_rating', instance.avg_rating)
        instance.review_count = validated_data.get('review_count', instance.review_count)
        instance.contact = validated_data.get('contact', instance.contact)

        # handle password securely
        password = validated_data.get('password')
        if password:
            instance.set_password(password)

        # handle profile picture update
        profile_picture = validated_data.get('profile_picture', None)
        if profile_picture is not None:
            instance.profile_picture = profile_picture

        instance.save()
        return instance
