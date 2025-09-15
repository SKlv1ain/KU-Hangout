from django import forms
from .models import Plan

class PlanForm(forms.ModelForm):
    class Meta:
        model = Plan
        fields = ['title', 'description', 'location', 'lat', 'lng', 'event_time', 'max_people', 'tags']
