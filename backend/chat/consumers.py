import json
import pytz
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

BANGKOK_TZ = pytz.timezone("Asia/Bangkok")

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.plan_id = self.scope['url_route']['kwargs']['plan_id']
            self.room_group_name = f'plan_{self.plan_id}'

            # Get authenticated user from middleware
            user = self.scope.get('user')
            if not user or not user.is_authenticated:
                await self.accept()
                await self.send(json.dumps({
                    'error': 'You must log in to join this chat.'
                }))
                await self.close()
                return

            # Get or create chat thread
            thread = await self.get_or_create_thread(self.plan_id, user)
            if not thread:
                await self.accept()
                await self.send(json.dumps({
                    'error': 'Plan not found or access denied.'
                }))
                await self.close()
                return
            
            self.thread_id = thread.id

            # Add user as chat member
            await self.add_chat_member(thread, user)

            # Join the chat room
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

            # Send connection confirmation
            await self.send(json.dumps({
                "status": "connected",
                "plan_id": self.plan_id,
                "message": f"Connected as {user.username}"
            }))

            # Send chat history
            history = await self.get_chat_history(thread)
            await self.send(json.dumps({
                "type": "chat_history",
                "messages": history or []
            }))

        except Exception as e:
            await self.accept()
            await self.send(json.dumps({
                'error': f'Something went wrong: {str(e)}'
            }))
            await self.close()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        except Exception:
            pass

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message', '').strip()

            user = self.scope.get('user')
            if not user or not user.is_authenticated:
                await self.send(json.dumps({'error': 'You must be logged in to send messages.'}))
                return

            if not message:
                await self.send(json.dumps({'error': 'Message cannot be empty.'}))
                return

            # Save message to database
            saved_message = await self.save_message(self.thread_id, user, message)
            if not saved_message:
                await self.send(json.dumps({'error': 'Failed to save message.'}))
                return

            display_name = getattr(user, 'display_name', None) or user.get_full_name() or user.username

            # Broadcast message to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user': display_name,
                    'timestamp': saved_message['timestamp'],  # Already converted to Bangkok time
                }
            )

        except Exception as e:
            await self.send(json.dumps({
                'error': f'Message send error: {str(e)}'
            }))

    async def chat_message(self, event):
        try:
            await self.send(json.dumps({
                'type': 'new_message',
                'user': event['user'],
                'message': event['message'],
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            await self.send(json.dumps({
                'error': f'Display message error: {str(e)}'
            }))

    # Database Operations
    @database_sync_to_async
    def get_or_create_thread(self, plan_id, user):
        """Get or create a chat thread for the plan."""
        from chat.models import chat_threads
        from plans.models import Plans
        
        try:
            plan = Plans.objects.get(id=plan_id)
            thread, _ = chat_threads.objects.get_or_create(
                plan=plan,
                defaults={
                    'title': f'Chat for {plan.title}',
                    'created_by': user
                }
            )
            return thread
        except Plans.DoesNotExist:
            return None

    @database_sync_to_async
    def add_chat_member(self, thread, user):
        """Add user as a chat member if not already added."""
        from chat.models import chat_member
        chat_member.objects.get_or_create(thread=thread, user=user)

    @database_sync_to_async
    def get_chat_history(self, thread):
        """Retrieve all messages for this thread with Bangkok timestamps."""
        from chat.models import chat_messages
        
        messages = chat_messages.objects.filter(
            thread=thread
        ).select_related('sender').order_by('create_at')
        
        return [
            {
                'id': msg.id,
                'user': getattr(msg.sender, 'display_name', None) or msg.sender.get_full_name() or msg.sender.username,
                'message': msg.body,
                'timestamp': timezone.localtime(msg.create_at, BANGKOK_TZ).strftime("%Y-%m-%d %H:%M:%S")
            }
            for msg in messages
        ]

    @database_sync_to_async
    def save_message(self, thread_id, user, message_body):
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
