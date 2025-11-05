import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.plan_id = self.scope['url_route']['kwargs']['plan_id']
            self.room_group_name = f'plan_{self.plan_id}'

            #get authenticated user from middleware
            user = self.scope.get('user')
            if not user or not user.is_authenticated:
                await self.accept()
                await self.send(json.dumps({
                    'error': 'You must log in to join this chat.'
                }))
                await self.close()
                return

            #Join the chat room
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

            await self.send(json.dumps({
                "status": "connected",
                "plan_id": self.plan_id,
                "message": f"Connected as {user.username}"
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
            #load text from server
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message', '').strip()

            user = self.scope.get('user')
            if not user or not user.is_authenticated:
                await self.send(json.dumps({'error': 'You must be logged in to send messages.'}))
                return

            if not message:
                await self.send(json.dumps({'error': 'Message cannot be empty.'}))
                return

            display_name = getattr(user, 'display_name', None) or user.get_full_name() or user.username

            #Broadcast message to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user': display_name,
                }
            )

        except Exception as e:
            await self.send(json.dumps({
                'error': f'Message send error: {str(e)}'
            }))

    async def chat_message(self, event):
        try:
            await self.send(json.dumps({
                'user': event['user'],
                'message': event['message']
            }))
        except Exception as e:
            await self.send(json.dumps({
                'error': f'Display message error: {str(e)}'
            }))