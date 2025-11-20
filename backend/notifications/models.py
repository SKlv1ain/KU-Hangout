from django.db import models
from django.utils import timezone

from users.models import Users
from plans.models import Plans
from chat.models import chat_threads, chat_messages
# from reviews.models import reviews   # <-- COMMENTED OUT


class Notification(models.Model):
    """
    Notification Model สำหรับเก็บการแจ้งเตือนทั้งหมดในระบบ
    รองรับ Plan + Chat, มี soft delete, metadata และ timestamps
    """

    DEFAULT_TITLES = {
        "PLAN_JOIN_REQUEST": "Plan Join Request",
        "PLAN_JOINED": "Plan Joined",
        "PLAN_CANCELLED": "Plan Cancelled",
        "PLAN_UPDATED": "Plan Updated",
        "PLAN_REMINDER": "Plan Reminder",
        "PLAN_CREATED": "Plan Created",
        "PLAN_LEFT": "Plan Left",
        "PLAN_DELETED": "Plan Deleted",
        "NEW_MESSAGE": "New Message",
        "MENTIONED": "You Were Mentioned",
        "THREAD_CREATED": "New Chat Thread",
    }

    # ========== Notification Types ==========
    NOTIFICATION_TYPES = (
        # Plan-related Notifications
        ('PLAN_JOIN_REQUEST', 'Plan Join Request'),
        ('PLAN_JOINED', 'Plan Joined'),
        ('PLAN_CANCELLED', 'Plan Cancelled'),
        ('PLAN_UPDATED', 'Plan Updated'),
        ('PLAN_REMINDER', 'Plan Reminder'),

        # เพิ่มของโปรเจค
        ('PLAN_CREATED', 'Plan Created'),
        ('PLAN_LEFT', 'Plan Left'),
        ('PLAN_DELETED', 'Plan Deleted'),

        # Chat/Message Notifications
        ('NEW_MESSAGE', 'New Message'),
        ('MENTIONED', 'Mentioned'),
        ('THREAD_CREATED', 'Thread Created'),

        # --- REVIEW TYPES (COMMENTED OUT) ---
        # ('NEW_REVIEW', 'New Review'),
        # ('REVIEW_REPLY', 'Review Reply'),
    )

    # ========== Topic Categories ==========
    TOPIC_CATEGORIES = (
        ('PLAN', 'Plan'),
        ('CHAT', 'Chat'),
        # ('REVIEW', 'Review'),  # <-- COMMENTED OUT
    )

    # ========== Core Fields ==========

    # Keep "user" field for compatibility with your existing code
    user = models.ForeignKey(
        Users,
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True,
        help_text="ผู้ใช้ที่รับการแจ้งเตือน (recipient)"
    )

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        db_index=True,
        help_text="ประเภทของการแจ้งเตือน"
    )

    topic = models.CharField(
        max_length=20,
        choices=TOPIC_CATEGORIES,
        db_index=True,
        default='PLAN',
        help_text="หมวดหมู่ของ notification (PLAN, CHAT)"
    )

    # ========== Status Fields ==========
    is_read = models.BooleanField(
        default=False,
        db_index=True,
        help_text="สถานะว่าอ่านแล้วหรือยัง"
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="เวลาที่อ่าน notification"
    )

    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        help_text="สถานะว่าถูกลบแล้วหรือยัง (soft delete)"
    )

    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="เวลาที่ลบ notification"
    )

    # ========== Content Fields ==========
    title = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="หัวข้อของ notification (optional)"
    )

    message = models.TextField(
        help_text="ข้อความของ notification"
    )

    action_url = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        help_text="URL สำหรับไปยังหน้าที่เกี่ยวข้อง"
    )

    # ========== Related Objects ==========

    # Plan-related (active)
    plan = models.ForeignKey(
        Plans,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        help_text="Plan ที่เกี่ยวข้อง"
    )

    # Chat-related (active)
    chat_thread = models.ForeignKey(
        chat_threads,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        help_text="Chat thread ที่เกี่ยวข้อง"
    )

    chat_message = models.ForeignKey(
        chat_messages,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        help_text="Chat message ที่เกี่ยวข้อง"
    )

    # --- REVIEW FK (COMMENTED OUT) ---
    # review = models.ForeignKey(
    #     reviews,
    #     on_delete=models.CASCADE,
    #     null=True,
    #     blank=True,
    #     related_name='notifications',
    #     help_text="Review ที่เกี่ยวข้อง"
    # )

    # Actor
    actor = models.ForeignKey(
        Users,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notification_actions',
        help_text="ผู้ใช้ที่ทำ action"
    )

    # ========== Metadata ==========
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="ข้อมูลเพิ่มเติม"
    )

    # ========== Timestamps ==========
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # ========== Meta ==========
    class Meta:
        ordering = ['-created_at']

        indexes = [
            models.Index(fields=['user', 'is_read', 'is_deleted']),
            models.Index(fields=['user', 'topic', 'is_deleted']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['notification_type', 'is_deleted']),
        ]

        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(notification_type__startswith='PLAN_', topic='PLAN') |
                    models.Q(notification_type__in=['NEW_MESSAGE', 'MENTIONED', 'THREAD_CREATED'], topic='CHAT')
                    # Or + REVIEW constraints if re-enabled
                ),
                name='notification_type_topic_match'
            ),
        ]

    # ========== Methods ==========

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

    def soft_delete(self):
        if not self.is_deleted:
            self.is_deleted = True
            self.deleted_at = timezone.now()
            self.save(update_fields=['is_deleted', 'deleted_at'])

    def save(self, *args, **kwargs):
        if not self.title:
            title = self.DEFAULT_TITLES.get(self.notification_type)
            if not title:
                display = self.get_notification_type_display()
                title = display or (self.notification_type or "").replace('_', ' ').title()
            self.title = title
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.notification_type} - {self.user.username} ({'read' if self.is_read else 'unread'})"
