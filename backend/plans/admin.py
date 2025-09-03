from django.contrib import admin
from .models import users, plans, tags, Participants, reviews, chat_member, chat_messages, chat_threads
# Register your models here.
admin.site.register(users)
admin.site.register(plans)
admin.site.register(tags)
admin.site.register(Participants)
admin.site.register(reviews)
admin.site.register(chat_member)
admin.site.register(chat_messages)
admin.site.register(chat_threads)