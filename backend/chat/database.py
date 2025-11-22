"""Database operations for chat functionality."""

import pytz
from channels.db import database_sync_to_async
from django.utils import timezone

BANGKOK_TZ = pytz.timezone("Asia/Bangkok")


class ChatDatabase:
    """Handles all database operations for chat."""
    
    @staticmethod
    @database_sync_to_async
    def get_or_create_thread(plan_id, user):
        """Get or create a chat thread for the plan."""
        from chat.models import chat_threads
        from plans.models import Plans
        
        try:
            # Ensure plan_id is int
            plan_id_int = int(plan_id) if not isinstance(plan_id, int) else plan_id
            plan = Plans.objects.get(id=plan_id_int)
            thread, _ = chat_threads.objects.get_or_create(
                plan=plan,
                defaults={
                    'title': f'Chat for {plan.title}',
                    'created_by': plan.leader_id
                }
            )
            return thread
        except Plans.DoesNotExist:
            print(f"[ChatDatabase] Plan {plan_id} does not exist")
            return None
        except Exception as e:
            print(f"[ChatDatabase] Error getting/creating thread: {e}")
            return None

    @staticmethod
    @database_sync_to_async
    def add_chat_member(thread, user):
        """Add user as a chat member if not already added."""
        from chat.models import chat_member
        chat_member.objects.get_or_create(thread=thread, user=user)

    @staticmethod
    @database_sync_to_async
    def user_has_plan_access(plan_id, user):
        """Check whether the user is allowed to access the plan's chat."""
        from plans.models import Plans
        from participants.models import Participants

        try:
            plan_id_int = int(plan_id) if not isinstance(plan_id, int) else plan_id
            plan = Plans.objects.get(id=plan_id_int)
        except Plans.DoesNotExist:
            return False

        if plan.leader_id_id == user.id:
            return True

        return Participants.objects.filter(plan=plan, user=user).exists()

    @staticmethod
    @database_sync_to_async
    def get_chat_history(thread):
        """Retrieve all messages for this thread with Bangkok timestamps."""
        from chat.models import chat_messages
        
        messages = chat_messages.objects.filter(
            thread=thread
        ).select_related('sender').order_by('create_at')
        
        return [
            {
                'id': msg.id,
                'user': ChatDatabase._get_display_name(msg.sender),
                'user_id': msg.sender.id,
                'username': getattr(msg.sender, "username", None),
                'profile_picture': getattr(msg.sender, "profile_picture", None) or None,
                'message': msg.body,
                'timestamp': timezone.localtime(msg.create_at, BANGKOK_TZ).strftime("%Y-%m-%d %H:%M:%S")
            }
            for msg in messages
        ]

    @staticmethod
    @database_sync_to_async
    def save_message(thread_id, user, message_body):
        """Save a new message to the database with Bangkok timestamp."""
        from chat.models import chat_messages, chat_threads
        from django.db import transaction
        
        try:
            thread = chat_threads.objects.get(id=thread_id)
            with transaction.atomic():
                message = chat_messages.objects.create(
                    thread=thread,
                    sender=user,
                    body=message_body
                )
                ChatDatabase._create_chat_notifications(thread, message)

            bangkok_time = timezone.localtime(message.create_at, BANGKOK_TZ)
            formatted_time = bangkok_time.strftime("%Y-%m-%d %H:%M:%S")

            return {
                'id': message.id,
                'timestamp': formatted_time
            }
        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    @staticmethod
    def _create_chat_notifications(thread, chat_message):
        """Create notification records for new chat messages."""
        try:
            from chat.models import chat_member
            from notifications.models import Notification
            from participants.models import Participants

            recipients_qs = chat_member.objects.filter(thread=thread).select_related("user")
            recipient_users = {member.user_id: member.user for member in recipients_qs}

            plan = getattr(thread, "plan", None)
            if plan:
                participant_qs = Participants.objects.filter(plan=plan).select_related("user")
                for participant in participant_qs:
                    recipient_users.setdefault(participant.user_id, participant.user)

                leader = getattr(plan, "leader_id", None)
                if leader:
                    recipient_users.setdefault(leader.id, leader)

            sender = chat_message.sender
            sender_name = getattr(sender, "display_name", None) or getattr(sender, "username", "") or "Someone"
            preview = chat_message.body.strip()
            if len(preview) > 140:
                preview = preview[:137].rstrip() + "..."

            action_url = None
            if plan:
                action_url = f"/messages?planId={plan.id}"

            for user_id, recipient in recipient_users.items():
                if user_id == sender.id:
                    continue

                Notification.objects.create(
                    user=recipient,
                    actor=sender,
                    notification_type="NEW_MESSAGE",
                    topic="CHAT",
                    plan=plan,
                    chat_thread=thread,
                    chat_message=chat_message,
                    message=f"{sender_name}: {preview}",
                    action_url=action_url,
                    metadata={
                        "thread_id": thread.id,
                        "plan_id": plan.id if plan else None,
                        "plan_title": plan.title if plan else None,
                        "sender_id": sender.id,
                        "message_id": chat_message.id,
                    },
                )
        except Exception as exc:  # pragma: no cover - notification failures shouldn't block chat
            print(f"[ChatDatabase] Failed to create chat notifications: {exc}")

    @staticmethod
    @database_sync_to_async
    def delete_message(message_id, thread_id, user):
        """Delete a message if the user is the sender."""
        from chat.models import chat_messages
        
        try:
            message = chat_messages.objects.get(id=message_id, thread_id=thread_id)
            
            # Check if the user is the sender
            if message.sender.id != user.id:
                return {
                    'success': False,
                    'error': 'You can only delete your own messages.'
                }
            
            # Delete the message
            message.delete()
            return {'success': True}
            
        except chat_messages.DoesNotExist:
            return {
                'success': False,
                'error': 'Message not found.'
            }
        except Exception as e:
            print(f"Error deleting message: {e}")
            return {
                'success': False,
                'error': 'Failed to delete message.'
            }
    
    @staticmethod
    @database_sync_to_async
    def edit_message(message_id, thread_id, user, new_content):
        """Edit a message if the user is the sender."""
        from chat.models import chat_messages
        from django.utils import timezone
        
        try:
            message = chat_messages.objects.get(id=message_id, thread_id=thread_id)
            
            # Check if the user is the sender
            if message.sender.id != user.id:
                return {
                    'success': False,
                    'error': 'You can only edit your own messages.'
                }
            
            # Update the message content
            message.body = new_content
            message.save()
            
            # Get updated timestamp
            bangkok_time = timezone.localtime(message.create_at, BANGKOK_TZ)
            formatted_time = bangkok_time.strftime("%Y-%m-%d %H:%M:%S")
            
            return {
                'success': True,
                'timestamp': formatted_time
            }
            
        except chat_messages.DoesNotExist:
            return {
                'success': False,
                'error': 'Message not found.'
            }
        except Exception as e:
            print(f"Error editing message: {e}")
            return {
                'success': False,
                'error': 'Failed to edit message.'
            }
    
    @staticmethod
    def _get_display_name(user):
        """Get display name for a user."""
        return getattr(user, 'display_name', None) or user.get_full_name() or user.username
