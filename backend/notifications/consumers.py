from channels.generic.websocket import AsyncJsonWebsocketConsumer


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for per-user notifications.
    Group name format: user_<user_id>
    """

    async def connect(self):
        user = self.scope.get("user")

        # JWTAuthMiddleware should set scope["user"]
        if user is None or user.is_anonymous:
            await self.close()
            return

        self.user = user
        self.group_name = f"user_{user.id}"

        # Join the user-specific group
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        # Optional: handle messages from frontend (e.g., ping)
        msg_type = content.get("type")
        if msg_type == "ping":
            await self.send_json({"type": "pong"})

    async def notification(self, event):
        """
        Called when group_send uses type="notification".
        """
        notification_data = event.get("notification")
        await self.send_json({
            "type": "notification",
            "notification": notification_data,
        })
