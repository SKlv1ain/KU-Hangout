from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Notification
from .utils import push_notification_to_user


@receiver(post_save, sender=Notification)
def send_realtime_notification(sender, instance, created, **kwargs):
    if created:
        push_notification_to_user(instance)
