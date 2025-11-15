from django.db import models
from django.conf import settings

# Model for tags
class Tags(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Tag"
        verbose_name_plural = "Tags"