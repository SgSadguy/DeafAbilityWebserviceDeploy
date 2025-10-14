from django.contrib import admin, messages
from django.utils.html import mark_safe
from .models import Course, Lesson, LessonLink, Job, QuizQuestion
from .youtube import fetch_youtube_duration_seconds_noapi
# ------------ Lesson Inline ----------------
class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ("title", "order", "description", "cover")
    ordering = ("order", "id")
    can_delete = True


# ------------ Course ----------------
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'category', 'video_url', 'created_at')
    list_filter = ['level', 'category', 'created_at']
    search_fields = ['name', 'level', 'category']
    inlines = [LessonInline]
    ordering = ['-created_at']


# ------------ LessonLink Inline ----------------
class LessonLinkInline(admin.TabularInline):
    model = LessonLink
    extra = 2
    fields = ('title', 'kind', 'role', 'url', 'duration_seconds', 'duration_fetched_at')
    readonly_fields = ('duration_seconds', 'duration_fetched_at')
    ordering = ('id',)


# ------------ Admin Action: ดึงเวลาจาก YouTube ----------------
@admin.action(description="📺 ดึงเวลาวิดีโอ (yt_dlp ไม่ใช้ API)")
def fetch_youtube_durations_action(modeladmin, request, queryset):
    ok = fail = 0
    for link in queryset:
        try:
            if (link.kind or "").lower() == "youtube" and link.url:
                sec = fetch_youtube_duration_seconds_noapi(link.url)
                if sec:
                    link.mark_duration(sec)
                    ok += 1
                else:
                    fail += 1
        except Exception:
            fail += 1
    messages.info(request, f"✅ OK={ok}, ❌ FAIL={fail}")

# ------------ LessonLink ----------------
@admin.register(LessonLink)
class LessonLinkAdmin(admin.ModelAdmin):
    list_display = ("id", "lesson", "title", "kind", "role", "duration_seconds", "duration_fetched_at", "created_at")
    list_filter = ("kind", "role")
    search_fields = ("title", "url", "lesson__title")
    actions = [fetch_youtube_durations_action]


# ------------ Lesson ----------------
@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "order", "cover_preview", "created_at")
    inlines = [LessonLinkInline]
    list_filter = ("course",)
    search_fields = ("title", "course__name")
    ordering = ("course", "order", "id")
    actions = ['delete_selected']

    def cover_preview(self, obj):
        if obj.cover:
            return mark_safe(f'<img src="{obj.cover.url}" style="height:40px;border-radius:6px" />')
        return "-"
    cover_preview.short_description = "รูป"


# ------------ Job ----------------
@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "position_type", "company", "location", "salary", "courses_count", "created_at")
    list_filter  = ("position_type", "created_at")
    search_fields = ("title", "company", "location")
    autocomplete_fields = ["courses"]

    def courses_count(self, obj):
        return obj.courses.count()
    courses_count.short_description = "จำนวนคอร์ส"


# ------------ Quiz ----------------
@admin.register(QuizQuestion)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("id", "prompt", "course", "created_at")
    list_filter = ("course",)
    search_fields = ("prompt", "course__name")
