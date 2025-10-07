from django.contrib import admin
from .models import Course, Lesson, LessonLink,Job

# Register your models here.
class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ("title", "order", "description")
    ordering = ("order", "id")
    can_delete = True  

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'category', 'video_url', 'created_at')
    list_filter = ['level', 'category', 'created_at']
    search_fields = ['name', 'level', 'category']
    inlines = [LessonInline]
    ordering = ['-created_at']


class LessonLinkInline(admin.TabularInline):
    model = LessonLink
    extra = 2
    fields = ('title', 'kind', 'role', 'url')
    ordering = ('id',)

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "order", "created_at")
    inlines = [LessonLinkInline]
    list_filter = ("course",)
    search_fields = ("title", "course__name")
    ordering = ("course", "order", "id")
    actions = ['delete_selected']  





@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "position_type", "courses_count", "created_at")
    list_filter  = ("position_type", "created_at")  # ✅ filter ตามตำแหน่งงานที่พิมพ์
    search_fields = ("title", "description", "position_type", "courses__name")
    autocomplete_fields = ["courses"]  # พิมพ์หาคอร์สได้

    def courses_count(self, obj):
        return obj.courses.count()
    courses_count.short_description = "จำนวนคอร์ส"


