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
                    'created_by': user
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
        
        try:
            thread = chat_threads.objects.get(id=thread_id)
            message = chat_messages.objects.create(
                thread=thread,
                sender=user,
                body=message_body
            )

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
