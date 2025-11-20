from django.contrib import admin
from plans.models import Plans, PlanImage, SavedPlan, PinnedPlan

# Register your models here.
admin.site.register(Plans)
admin.site.register(PlanImage)
admin.site.register(SavedPlan)
admin.site.register(PinnedPlan)
