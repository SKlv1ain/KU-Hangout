from django.urls import path
from plans.views.plan_creation import PlansCreate
from plans.views.plan_images import PlanImageUpload, PlanImageDetail

urlpatterns = [
    # Plan CRUD
    path('create/', PlansCreate.as_view(), name='plan-create'),  # POST: create plan
    path('<int:pk>/', PlansCreate.as_view(), name='plan-detail'),  # GET, PUT, PATCH, DELETE
    
    # Plan Images
    path('<int:plan_id>/images/', PlanImageUpload.as_view(), name='plan-images'),  # GET, POST, DELETE (batch)
    path('<int:plan_id>/images/<int:image_id>/', PlanImageDetail.as_view(), name='plan-image-detail'),  # DELETE (single)
]