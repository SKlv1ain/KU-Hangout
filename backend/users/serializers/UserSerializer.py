import json
from rest_framework import serializers
from users.models import Users

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for converting user model to JSON and handling profile creation/update.
    """

    # Explicitly declare profile_picture to handle file uploads or URL strings
    profile_picture = serializers.ImageField(required=False, allow_null=True, write_only=True)
    profile_picture_url = serializers.SerializerMethodField(read_only=True)
    social_links = serializers.JSONField(required=False)

    class Meta:
        model = Users
        fields = [
            'id',
            'username',
            'display_name',
            'bio',
            'website',
            'social_links',
            'role',
            'avg_rating',
            'review_count',
            'contact',
            'password',
            'profile_picture',  # write-only (for file upload)
            'profile_picture_url',  # read-only (returns URL string)
            'created_at',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'created_at': {'read_only': True}
        }
    
    def get_profile_picture_url(self, obj):
        """Return profile picture URL (string) for read operations."""
        return obj.profile_picture if obj.profile_picture else None

    def validate_display_name(self, value):
        if value is None:
            return value
        value = value.strip()
        if len(value) > 50:
            raise serializers.ValidationError("Display name must be 50 characters or fewer.")
        return value

    def validate_social_links(self, value):
        if value in (None, ""):
            return []
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError as exc:
                raise serializers.ValidationError("Invalid JSON for social links.") from exc
        if not isinstance(value, (list, tuple)):
            raise serializers.ValidationError("Social links must be a list of URLs.")
        cleaned = []
        for link in value:
            if not link:
                continue
            if not isinstance(link, str):
                raise serializers.ValidationError("Each social link must be a string.")
            cleaned.append(link)
        if len(cleaned) > 4:
            raise serializers.ValidationError("You can provide at most 4 social links.")
        return cleaned

    def create(self, validated_data):
        profile_picture = validated_data.pop('profile_picture', None)
        display_name = validated_data.get('display_name')
        if display_name is not None:
            display_name = display_name.strip()

        user = Users(
            username=validated_data['username'],
            display_name=display_name or None, 
            bio=validated_data.get('bio', ''),
            website=validated_data.get('website', ''),
            social_links=validated_data.get('social_links', []),
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
        if 'display_name' in validated_data:
            display_name = validated_data.get('display_name')
            if display_name is not None:
                display_name = display_name.strip()
            instance.display_name = display_name or None
        instance.bio = validated_data.get('bio', instance.bio)
        instance.website = validated_data.get('website', instance.website)
        if 'social_links' in validated_data:
            instance.social_links = validated_data.get('social_links') or []
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
