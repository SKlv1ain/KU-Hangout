import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.plan_id = self.scope['url_route']['kwargs']['plan_id']
            self.room_group_name = f'plan_{self.plan_id}'

            await self.accept()  # Accept connection first

            user = self.scope['user']
            if not user.is_authenticated:
                # Send a error to frontend
                await self.send(text_data=json.dumps({
                    'error': 'You must log in to join this chat.'
                }))
                await self.close()
                return

            # Join group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

        except Exception as e:
            await self.accept()  # Accept connection first to be able to send
            await self.send(text_data=json.dumps({
                'error': 'Something went wrong while connecting. Please try again.'
            }))
            await self.close()


    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e:
            #log error
            pass

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message', '')

            user = self.scope['user']
            if user.is_authenticated:
                display_name = getattr(user, 'display_name', None) or user.get_full_name() or user.username
            else:
                display_name = 'Anonymous'

            # Broadcast message to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user': display_name,
                }
            )

        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': f'Message send error: {str(e)}'
            }))

    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                'user': event['user'],
                'message': event['message']
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': f'Display message error: {str(e)}'
            }))
