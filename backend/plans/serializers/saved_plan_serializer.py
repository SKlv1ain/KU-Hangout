from rest_framework import serializers
from plans.models import SavedPlan, Plans
from plans.serializers.plans_serializers import PlansSerializer


class SavedPlanSerializer(serializers.ModelSerializer):
    plan_id = serializers.IntegerField(write_only=True, required=True)
    plan = PlansSerializer(read_only=True)

    class Meta:
        model = SavedPlan
        fields = ['id', 'user', 'plan', 'plan_id', 'saved_at']
        read_only_fields = ['id', 'user', 'plan', 'saved_at']

    def validate_plan_id(self, value):
        """Validate that the plan exists."""
        try:
            Plans.objects.get(pk=value)  # pylint: disable=no-member
        except Plans.DoesNotExist:  # pylint: disable=no-member
            raise serializers.ValidationError("Plan not found.")
        return value

    def create(self, validated_data):
        """Create a saved plan record."""
        plan_id = validated_data.pop('plan_id')
        request = self.context.get('request')
        
        if not request or not request.user:
            raise serializers.ValidationError("User must be authenticated.")
        
        plan = Plans.objects.get(pk=plan_id)  # pylint: disable=no-member
        
        # Use get_or_create to make it idempotent
        saved_plan, created = SavedPlan.objects.get_or_create(  # pylint: disable=no-member
            user=request.user,
            plan=plan,
            defaults={'user': request.user, 'plan': plan}
        )
        
        return saved_plan

