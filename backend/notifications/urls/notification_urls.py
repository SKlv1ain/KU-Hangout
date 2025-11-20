from django.urls import path
from notifications.views import (
    NotificationListView,
    NotificationMarkAllReadView,
    NotificationMarkReadView,
    NotificationSummaryView,
    NotificationDeleteView,
    NotificationClearView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications-list"),
    path("summary/", NotificationSummaryView.as_view(), name="notifications-summary"),
    path("mark-all-read/", NotificationMarkAllReadView.as_view(), name="notifications-mark-all-read"),
    path("clear/", NotificationClearView.as_view(), name="notifications-clear"),
    path("<int:pk>/read/", NotificationMarkReadView.as_view(), name="notifications-mark-read"),
    path("<int:pk>/", NotificationDeleteView.as_view(), name="notifications-delete"),
]
