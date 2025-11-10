"""Message handlers for chat actions."""

import json
from chat.database import ChatDatabase
from chat.utils import get_display_name


class MessageHandler:
    """Handles different types of chat messages."""
    
    def __init__(self, consumer):
        self.consumer = consumer
        self.db = ChatDatabase()
    
    async def handle_send_message(self, text_data_json, user):
        """Handle sending a new message."""
        message = text_data_json.get('message', '').strip()

        if not message:
            await self.consumer.send(json.dumps({'error': 'Message cannot be empty.'}))
            return

        # Save message to database
        saved_message = await self.db.save_message(self.consumer.thread_id, user, message)
        if not saved_message:
            await self.consumer.send(json.dumps({'error': 'Failed to save message.'}))
            return

        display_name = get_display_name(user)

        # Broadcast message to group
        await self.consumer.channel_layer.group_send(
            self.consumer.room_group_name,
            {
                'type': 'chat_message',
                'message_id': saved_message['id'],
                'message': message,
                'user': display_name,
                'user_id': user.id,
                'timestamp': saved_message['timestamp'],
            }
        )
    
    async def handle_delete_message(self, text_data_json, user):
        """Handle deleting a message."""
        message_id = text_data_json.get('message_id')
        if not message_id:
            await self.consumer.send(json.dumps({'error': 'Message ID is required.'}))
            return

        # Delete the message
        result = await self.db.delete_message(message_id, self.consumer.thread_id, user)
        if result['success']:
            # Broadcast deletion to all users in the room
            await self.consumer.channel_layer.group_send(
                self.consumer.room_group_name,
                {
                    'type': 'message_deleted',
                    'message_id': message_id,
                }
            )
        else:
            await self.consumer.send(json.dumps({'error': result['error']}))

    async def handle_edit_message(self, text_data_json, user):
        """Handle editing a message."""
        message_id = text_data_json.get('message_id')
        new_content = text_data_json.get('message', '').strip()
        
        if not message_id:
            await self.consumer.send(json.dumps({'error': 'Message ID is required.'}))
            return
        
        if not new_content:
            await self.consumer.send(json.dumps({'error': 'Message content cannot be empty.'}))
            return
        
        # Edit the message
        result = await self.db.edit_message(message_id, self.consumer.thread_id, user, new_content)
        if result['success']:
            # Broadcast edit to all users in the room
            await self.consumer.channel_layer.group_send(
                self.consumer.room_group_name,
                {
                    'type': 'message_edited',
                    'message_id': message_id,
                    'message': new_content,
                    'timestamp': result['timestamp'],
                }
            )
        else:
            await self.consumer.send(json.dumps({'error': result['error']}))
