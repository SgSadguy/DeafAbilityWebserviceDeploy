from django.contrib import admin
from .models import Course, Lesson, LessonLink

# Register your models here.

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'level', 'category', 'created_at']
    list_filter = ['level', 'category', 'created_at']
    search_fields = ['name', 'level', 'category']
    ordering = ['-created_at']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "order", "created_at")
    list_filter = ("course",)

@admin.register(LessonLink)
class LessonLinkAdmin(admin.ModelAdmin):
    list_display = ("id", "lesson", "title", "kind", "url", "created_at")
    list_filter = ("kind", "lesson__course")
    search_fields = ("title", "url")
