"""Utility functions for chat."""


def get_display_name(user):
    """Get display name for a user."""
    return getattr(user, 'display_name', None) or user.get_full_name() or user.username

