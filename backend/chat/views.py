from datetime import datetime

from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.models import chat_threads, chat_messages

import pytz


BANGKOK_TZ = pytz.timezone("Asia/Bangkok")


class UserChatThreadsView(APIView):
    """Return all chat threads the current user participates in."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        threads_qs = (
            chat_threads.objects.filter(member__user=user)
            .select_related("plan", "plan__leader_id")
            .prefetch_related("member")
            .distinct()
        )

        threads = list(threads_qs)

        # Fetch latest message per thread
        latest_messages = (
            chat_messages.objects.filter(thread__in=threads)
            .select_related("thread", "sender")
            .order_by("thread_id", "-create_at")
        )

        latest_message_map = {}
        for message in latest_messages:
            if message.thread_id not in latest_message_map:
                latest_message_map[message.thread_id] = message

        payloads = []
        for thread in threads:
            plan = thread.plan
            last_message = latest_message_map.get(thread.id)

            if last_message:
                timestamp = timezone.localtime(last_message.create_at, BANGKOK_TZ).isoformat()
                sender_name = (
                    getattr(last_message.sender, "display_name", None)
                    or last_message.sender.get_full_name()
                    or last_message.sender.username
                )
                sort_key = last_message.create_at
            else:
                timestamp = None
                sender_name = None
                sort_key = plan.event_time if plan and plan.event_time else thread.create_at

            payloads.append(
                (
                    sort_key,
                    {
                        "thread_id": thread.id,
                        "plan_id": plan.id if plan else None,
                        "plan_title": plan.title if plan else None,
                        "plan_event_time": plan.event_time if plan else None,
                        "is_owner": plan.leader_id_id == user.id if plan else False,
                        "last_message": last_message.body if last_message else None,
                        "last_message_timestamp": timestamp,
                        "last_message_sender": sender_name,
                    },
                )
            )

        payloads.sort(
            key=lambda item: item[0] or datetime(1970, 1, 1, tzinfo=timezone.utc),
            reverse=True,
        )

        return Response([item[1] for item in payloads])

