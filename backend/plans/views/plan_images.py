from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from plans.models import Plans, PlanImage
from plans.serializers.plans_serializers import PlanImageSerializer


class PlanImageUpload(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, plan_id):
        """Upload images for a specific plan"""
        try:
            plan = Plans.objects.get(id=plan_id)
        except Plans.DoesNotExist:
            return Response(
                {"message": "Plan not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is the plan creator
        if plan.leader_id != request.user:
            return Response(
                {"message": "Only the plan creator can upload images"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Handle both JSON (base64) and form-data (file upload)
        images_data = []
        
        # Check if it's JSON with base64 images
        if 'images' in request.data and isinstance(request.data.get('images'), list):
            images_data = request.data.get('images', [])
        # Check if it's form-data with file uploads
        elif request.FILES:
            # Get all files from form-data
            images_data = [request.FILES[key] for key in request.FILES.keys()]
        else:
            return Response(
                {"message": "No images provided. Send either 'images' array (base64) or file uploads."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not images_data:
            return Response(
                {"message": "No images provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check existing images count
        existing_count = PlanImage.objects.filter(plan=plan).count()
        total_count = existing_count + len(images_data)
        
        if total_count > 12:
            return Response(
                {"message": f"Maximum 12 images allowed. You already have {existing_count} image(s)."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create images
        created_images = []
        errors = []
        
        for idx, img_data in enumerate(images_data):
            # Handle base64 strings (from JSON)
            if isinstance(img_data, str):
                serializer = PlanImageSerializer(
                    data={'image': img_data},
                    context={'request': request}
                )
            # Handle file uploads (from form-data)
            else:
                serializer = PlanImageSerializer(
                    data={'image': img_data},
                    context={'request': request}
                )
            
            if serializer.is_valid():
                image = serializer.save(plan=plan)
                created_images.append(PlanImageSerializer(image, context={'request': request}).data)
            else:
                errors.append({
                    'index': idx,
                    'errors': serializer.errors
                })

        if errors:
            return Response(
                {
                    "message": "Some images failed to upload",
                    "created": created_images,
                    "errors": errors
                }, 
                status=status.HTTP_207_MULTI_STATUS
            )

        return Response(
            {
                "message": f"{len(created_images)} image(s) uploaded successfully",
                "images": created_images
            }, 
            status=status.HTTP_201_CREATED
        )

    def get(self, request, plan_id):
        """Get all images for a specific plan"""
        try:
            plan = Plans.objects.get(id=plan_id)
        except Plans.DoesNotExist:
            return Response(
                {"message": "Plan not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        images = PlanImage.objects.filter(plan=plan).order_by('uploaded_at')
        serializer = PlanImageSerializer(images, many=True, context={'request': request})
        
        return Response(
            {
                "message": "Images retrieved successfully",
                "plan_id": plan_id,
                "plan_title": plan.title,
                "image_count": images.count(),
                "images": serializer.data
            }, 
            status=status.HTTP_200_OK
        )

    def delete(self, request, plan_id):
        """Delete specific images or all images for a plan"""
        try:
            plan = Plans.objects.get(id=plan_id)
        except Plans.DoesNotExist:
            return Response(
                {"message": "Plan not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if plan.leader_id != request.user:
            return Response(
                {"message": "Only the plan creator can delete images"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        image_ids = request.data.get('image_ids', [])
        
        if image_ids:
            # Delete specific images
            images_to_delete = PlanImage.objects.filter(plan=plan, id__in=image_ids)
            deleted_count = images_to_delete.count()
            
            if deleted_count == 0:
                return Response(
                    {"message": "No matching images found to delete"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            images_to_delete.delete()
            
            return Response(
                {"message": f"{deleted_count} image(s) deleted successfully"}, 
                status=status.HTTP_200_OK
            )
        else:
            # Delete all images for this plan
            deleted_count = PlanImage.objects.filter(plan=plan).count()
            
            if deleted_count == 0:
                return Response(
                    {"message": "No images to delete"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            PlanImage.objects.filter(plan=plan).delete()
            
            return Response(
                {"message": f"All {deleted_count} image(s) deleted successfully"}, 
                status=status.HTTP_200_OK
            )


class PlanImageDetail(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, plan_id, image_id):
        """Delete a single image"""
        try:
            plan = Plans.objects.get(id=plan_id)
        except Plans.DoesNotExist:
            return Response(
                {"message": "Plan not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if plan.leader_id != request.user:
            return Response(
                {"message": "Only the plan creator can delete images"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            image = PlanImage.objects.get(id=image_id, plan=plan)
            image.delete()
            return Response(
                {"message": "Image deleted successfully"}, 
                status=status.HTTP_200_OK
            )
        except PlanImage.DoesNotExist:
            return Response(
                {"message": "Image not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )