from django.urls import path
from reviews.views.review_views import ReviewCreateOrUpdateView

urlpatterns = [
    path('api/reviews/', ReviewCreateOrUpdateView.as_view(), name='review-create-update'),
]

