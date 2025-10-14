from django.contrib import admin
from .models import Course, Lesson, LessonLink,Job ,QuizQuestion
from django.utils.html import mark_safe

# Register your models here.
class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ("title", "order", "description", "cover")  
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
    list_display = ("id", "title", "course", "order", "cover_preview", "created_at")
    inlines = [LessonLinkInline]
    list_filter = ("course",)
    search_fields = ("title", "course__name")
    ordering = ("course", "order", "id")
    actions = ['delete_selected']

    # ✅ พรีวิวในลิสต์
    def cover_preview(self, obj):
        if obj.cover:
            return mark_safe(f'<img src="{obj.cover.url}" style="height:40px;border-radius:6px" />')
        return "-"
    cover_preview.short_description = "รูป"




@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "position_type"  ,"company", "location", "salary","courses_count", "created_at")
    list_filter  = ("position_type", "created_at")  
    list_display = ("title", "company", "location", "salary", "created_at")
    search_fields = ("title", "company", "location")
    autocomplete_fields = ["courses"]  

    def courses_count(self, obj):
        return obj.courses.count()
    courses_count.short_description = "จำนวนคอร์ส"





@admin.register(QuizQuestion)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("id", "prompt", "course", "created_at")
    list_filter = ("course",)
    search_fields = ("prompt", "course__name")