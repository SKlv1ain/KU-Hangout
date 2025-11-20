"""Utility functions for plans app."""

import cloudinary
import cloudinary.uploader
from django.conf import settings


class CloudinaryNotConfiguredError(Exception):
    """Raised when Cloudinary is not configured."""
    pass


class CloudinaryUploadError(Exception):
    """Raised when image upload to Cloudinary fails."""
    pass


def upload_image_to_cloudinary(image_file):
    """
    Upload an image file to Cloudinary and return the URL.
    
    Args:
        image_file: Django UploadedFile object
        
    Returns:
        str: Cloudinary URL of the uploaded image
        
    Raises:
        CloudinaryNotConfiguredError: If Cloudinary is not configured
        CloudinaryUploadError: If upload fails
    """
    if not settings.USE_CLOUDINARY:
        raise CloudinaryNotConfiguredError("Cloudinary is not enabled. Set USE_CLOUDINARY=True in .env")
    
    # Configure Cloudinary (if not already configured)
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
        api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
        api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
    )
    
    # Upload to Cloudinary
    # Use folder 'plan_images' to organize images
    try:
        result = cloudinary.uploader.upload(
            image_file,
            folder='plan_images',
            resource_type='image'
        )
        return result['secure_url']  # Return HTTPS URL
    except Exception as e:
        raise CloudinaryUploadError(f"Failed to upload image to Cloudinary: {str(e)}") from e

