"""WebSocket consumer for chat functionality."""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from chat.database import ChatDatabase
from chat.handlers import MessageHandler


class ChatConsumer(AsyncWebsocketConsumer):
    """Handles WebSocket connections for chat."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.db = ChatDatabase()
        self.message_handler = None
    
    async def connect(self):
        """Handle WebSocket connection."""
        try:
            self.plan_id = self.scope['url_route']['kwargs']['plan_id']
            self.room_group_name = f'plan_{self.plan_id}'

            # Get authenticated user from middleware
            user = self.scope.get('user')
            if not user or not user.is_authenticated:
                await self._reject_connection('You must log in to join this chat.')
                return

            # Get or create chat thread
            thread = await self.db.get_or_create_thread(self.plan_id, user)
            if not thread:
                await self._reject_connection('Plan not found or access denied.')
                return
            
            self.thread_id = thread.id
            self.message_handler = MessageHandler(self)

            # Add user as chat member
            await self.db.add_chat_member(thread, user)

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
            history = await self.db.get_chat_history(thread)
            await self.send(json.dumps({
                "type": "chat_history",
                "messages": history or []
            }))

        except Exception as e:
            await self._reject_connection(f'Something went wrong: {str(e)}')

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        except Exception:
            pass

    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            text_data_json = json.loads(text_data)
            action = text_data_json.get('action', 'send_message')
            
            user = self.scope.get('user')
            if not user or not user.is_authenticated:
                await self.send(json.dumps({'error': 'You must be logged in.'}))
                return

            # Route to appropriate handler
            if action == 'delete_message':
                await self.message_handler.handle_delete_message(text_data_json, user)
            else:  # Default to send_message
                await self.message_handler.handle_send_message(text_data_json, user)

        except Exception as e:
            await self.send(json.dumps({
                'error': f'Message send error: {str(e)}'
            }))

    async def chat_message(self, event):
        """Handle chat message broadcast."""
        try:
            await self.send(json.dumps({
                'type': 'new_message',
                'message_id': event['message_id'],
                'user': event['user'],
                'user_id': event['user_id'],
                'message': event['message'],
                'timestamp': event.get('timestamp')
            }))
        except Exception as e:
            await self.send(json.dumps({
                'error': f'Display message error: {str(e)}'
            }))

    async def message_deleted(self, event):
        """Handle message deletion broadcast."""
        try:
            await self.send(json.dumps({
                'type': 'message_deleted',
                'message_id': event['message_id']
            }))
        except Exception as e:
            await self.send(json.dumps({
                'error': f'Delete message error: {str(e)}'
            }))
    
    async def _reject_connection(self, error_message):
        """Helper to reject connection with error message."""
        await self.accept()
        await self.send(json.dumps({'error': error_message}))
        await self.close()