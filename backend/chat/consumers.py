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
            # Get plan_id from URL and convert to int
            plan_id_str = self.scope['url_route']['kwargs']['plan_id']
            try:
                self.plan_id = int(plan_id_str)
            except (ValueError, TypeError):
                print(f"[WebSocket] Invalid plan_id: {plan_id_str}")
                await self._reject_connection('Invalid plan ID.')
                return
            
            self.room_group_name = f'plan_{self.plan_id}'
            print(f"[WebSocket] Attempting to connect to plan {self.plan_id}")

            # Get authenticated user from middleware
            user = self.scope.get('user')
            if not user or not user.is_authenticated:
                print(f"[WebSocket] Authentication failed for plan {self.plan_id}")
                await self._reject_connection('You must log in to join this chat.')
                return

            print(f"[WebSocket] User authenticated: {user.username} (ID: {user.id})")

            # Ensure user has access to this plan's chat
            has_access = await self.db.user_has_plan_access(self.plan_id, user)
            if not has_access:
                print(f"[WebSocket] Access denied for user {user.username} to plan {self.plan_id}")
                await self._reject_connection('Please join this plan before accessing its chat.')
                return

            # Get or create chat thread
            thread = await self.db.get_or_create_thread(self.plan_id, user)
            if not thread:
                print(f"[WebSocket] Thread not found for plan {self.plan_id}")
                await self._reject_connection('Plan not found or access denied.')
                return
            
            print(f"[WebSocket] Thread found/created: {thread.id}")
            self.thread_id = thread.id
            self.message_handler = MessageHandler(self)

            # Add user as chat member
            await self.db.add_chat_member(thread, user)
            print("[WebSocket] User added as chat member")

            # Join the chat room
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            print(f"[WebSocket] Added to channel layer group: {self.room_group_name}")
            
            await self.accept()
            print(f"[WebSocket] Connection accepted for plan {self.plan_id}")

            # Send connection confirmation
            await self.send(json.dumps({
                "status": "connected",
                "plan_id": self.plan_id,
                "message": f"Connected as {user.username}"
            }))
            print("[WebSocket] Sent connection confirmation")

            # Send chat history
            history = await self.db.get_chat_history(thread)
            await self.send(json.dumps({
                "type": "chat_history",
                "messages": history or []
            }))
            print(f"[WebSocket] Sent chat history ({len(history) if history else 0} messages)")

        except Exception as e:
            import traceback
            print(f"[WebSocket] Error in connect: {str(e)}")
            print(f"[WebSocket] Traceback: {traceback.format_exc()}")
            await self._reject_connection(f'Something went wrong: {str(e)}')

    async def disconnect(self, close_code):  # pylint: disable=unused-argument
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
            elif action == 'edit_message':
                await self.message_handler.handle_edit_message(text_data_json, user)
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
                'username': event.get('username'),
                'profile_picture': event.get('profile_picture'),
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
    
    async def message_edited(self, event):
        """Handle message edit broadcast."""
        try:
            await self.send(json.dumps({
                'type': 'message_edited',
                'message_id': event['message_id'],
                'message': event['message'],
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            await self.send(json.dumps({
                'error': f'Edit message error: {str(e)}'
            }))
    
    async def _reject_connection(self, error_message):
        """Helper to reject connection with error message."""
        print(f"[WebSocket] Rejecting connection: {error_message}")
        import traceback
        print(f"[WebSocket] Reject traceback: {traceback.format_exc()}")
        try:
            # Check if connection is already accepted
            if hasattr(self, 'channel_layer') and self.channel_name:
                # Try to accept first (required before sending messages)
                try:
                    await self.accept()
                    print("[WebSocket] Connection accepted for rejection")
                except Exception as accept_error:
                    print(f"[WebSocket] Error accepting connection for rejection: {accept_error}")
                    # If accept fails, connection might already be closed
                    return
                
                # Send error message before closing
                try:
                    await self.send(json.dumps({'error': error_message}))
                    print("[WebSocket] Error message sent")
                except Exception as send_error:
                    print(f"[WebSocket] Error sending error message: {send_error}")
                
                # Give a small delay to ensure message is sent
                import asyncio
                await asyncio.sleep(0.1)
                
                # Close with policy violation code (1008) and error message as reason
                try:
                    await self.close(code=1008, reason=error_message[:125])  # WebSocket reason max 125 bytes
                    print(f"[WebSocket] Connection rejected with code 1008: {error_message[:125]}")
                except Exception as close_error:
                    print(f"[WebSocket] Error closing connection: {close_error}")
            else:
                print("[WebSocket] Channel layer not available, cannot reject properly")
        except Exception as e:
            print(f"[WebSocket] Error in _reject_connection: {str(e)}")
            print(f"[WebSocket] Reject error traceback: {traceback.format_exc()}")
            # If accept fails, try to close without sending message
            try:
                await self.close(code=1008, reason=str(e)[:125])
            except Exception as close_error:
                print(f"[WebSocket] Error closing connection: {str(close_error)}")
