from django.contrib import admin
from .models import Course

# Register your models here.

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'level', 'category', 'created_at']
    list_filter = ['level', 'category', 'created_at']
    search_fields = ['name', 'level', 'category']
    ordering = ['-created_at']
