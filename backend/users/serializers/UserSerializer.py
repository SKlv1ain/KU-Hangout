from rest_framework import serializers
from users.models import Users

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for converting user model to JSON and handling profile creation/update.
    """

    # Explicitly declare profile_picture to handle file uploads or URL strings
    profile_picture = serializers.ImageField(required=False, allow_null=True, write_only=True)
    profile_picture_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Users
        fields = [
            'id',
            'username',
            'display_name',
            'role',
            'avg_rating',
            'review_count',
            'contact',
            'password',
            'profile_picture',  # write-only (for file upload)
            'profile_picture_url'  # read-only (returns URL string)
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_profile_picture_url(self, obj):
        """Return profile picture URL (string) for read operations."""
        return obj.profile_picture if obj.profile_picture else None

    def create(self, validated_data):
        profile_picture = validated_data.pop('profile_picture', None)
        user = Users(
            username=validated_data['username'],
            display_name=validated_data.get('display_name', ''), 
            role=validated_data.get('role', 'user'),
            avg_rating=validated_data.get('avg_rating', 0),
            review_count=validated_data.get('review_count', 0),
            contact=validated_data.get('contact', '')
        )
        user.set_password(validated_data['password'])
        
        # Upload profile picture to Cloudinary if provided
        if profile_picture:
            try:
                from users.utils import upload_profile_picture_to_cloudinary  # pylint: disable=import-outside-toplevel
                # Upload to Cloudinary and get URL
                profile_picture_url = upload_profile_picture_to_cloudinary(profile_picture)
                # Store URL in profile_picture field
                user.profile_picture = profile_picture_url
            except Exception as e:
                print(f"[UserSerializer] Failed to upload profile picture: {e}")
                # If Cloudinary is not enabled or upload fails, skip profile picture
                # (profile_picture will remain None/empty)
        
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
            try:
                from users.utils import upload_profile_picture_to_cloudinary  # pylint: disable=import-outside-toplevel
                # Upload to Cloudinary and get URL
                profile_picture_url = upload_profile_picture_to_cloudinary(profile_picture)
                # Store URL in profile_picture field
                instance.profile_picture = profile_picture_url
            except Exception as e:
                print(f"[UserSerializer] Failed to upload profile picture: {e}")
                # If Cloudinary is not enabled or upload fails, skip profile picture update
                # (profile_picture will remain unchanged)

        instance.save()
        return instance
