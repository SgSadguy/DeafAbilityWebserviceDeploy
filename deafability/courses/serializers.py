from rest_framework import serializers
from .models import Course, Lesson, LessonLink, LessonProgress , Job ,QuizQuestion
from urllib.parse import urlparse, parse_qs
import random

class QuizQuestionSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.name", read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ["id", "prompt", "words", "correct_order", "course", "course_name", "created_at"]
class QuizCheckSerializer(serializers.Serializer):
    answer = serializers.ListField(
        child=serializers.CharField(), allow_empty=False, help_text="ลิสต์คำที่ผู้ใช้เรียง"
    )


def youtube_embed(u: str):
    try:
        p = urlparse(u); host = (p.hostname or "").lower()
        vid = None
        if host == "youtu.be":
            vid = p.path.lstrip("/")
        elif host.endswith("youtube.com"):
            if p.path == "/watch":
                vid = parse_qs(p.query).get("v", [None])[0]
            elif p.path.startswith("/shorts/") or p.path.startswith("/embed/"):
                parts = p.path.split("/")
                vid = parts[2] if len(parts) > 2 else None
        return f"https://www.youtube-nocookie.com/embed/{vid}" if vid else None
    except Exception:
        return None

class LessonLinkSerializer(serializers.ModelSerializer):
    href = serializers.SerializerMethodField()
    embed_url = serializers.SerializerMethodField()

    class Meta:
        model = LessonLink
        fields = ['id', 'title', 'kind','role' ,'href', 'embed_url', 'created_at']

    def get_href(self, obj):
        request = self.context.get("request")
        if obj.kind == "file" and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return obj.url

    def get_embed_url(self, obj):
        if obj.kind == "youtube" and obj.url:
            return youtube_embed(obj.url)
        return None
    
class CourseProgressSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    total_lessons = serializers.IntegerField()
    completed_lessons = serializers.IntegerField()
    percent = serializers.FloatField()

class LessonSerializer(serializers.ModelSerializer):
    links = LessonLinkSerializer(many=True, read_only=True)
    next_lesson_id = serializers.SerializerMethodField()
    is_last_lesson = serializers.SerializerMethodField()
    completed = serializers.SerializerMethodField()
    cover_url = serializers.SerializerMethodField()
    course_video_url = serializers.SerializerMethodField()   # <— เพิ่ม
    course_id = serializers.IntegerField(source='course.id', read_only=True)  # ถ้า frontend ต้องใช้

    class Meta:
        model = Lesson
        fields = [
            'id','title','description','order','links',
            'next_lesson_id','is_last_lesson','completed',
            'cover_url',
            'course_id',          # (ตัวเลือก)
            'course_video_url',   # <— เพิ่ม
            'created_at','updated_at'
        ]

    def get_course_video_url(self, obj):
        # ถ้าใน model Course มี field video_url (ลิงก์กลางของคอร์ส)
        return getattr(obj.course, 'video_url', None)

    def _user(self):
        req = self.context.get('request')
        return getattr(req, 'user', None) if req else None

    def get_next_lesson_id(self, obj):
        nxt = (Lesson.objects
               .filter(course=obj.course, order__gt=obj.order)
               .order_by('order','id')
               .first())
        return nxt.id if nxt else None

    def get_is_last_lesson(self, obj):
        return not Lesson.objects.filter(course=obj.course, order__gt=obj.order).exists()

    def get_completed(self, obj):
        user = self._user()
        if not user or not user.is_authenticated:
            return False
        return LessonProgress.objects.filter(user=user, lesson=obj, completed=True).exists()
    def get_cover_url(self, obj):
        # ✅ ส่งเป็น relative URL เช่น "/media/lesson_covers/xxx.png"
        return obj.cover.url if getattr(obj, "cover", None) else None
    
class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    cover_url = serializers.SerializerMethodField()
    class Meta:
         model = Course
         fields = "__all__"
         extra_fields = [] 
    def get_cover_url(self, obj):
        # ✅ relative URL
        return obj.cover.url if getattr(obj, "cover", None) else None


class CourseMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name", "level", "category"]

class JobSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    courses = CourseMiniSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "company",
            "location",
            "salary",
            "description",
            "position_type",
            "image_url",    
            "courses",      
            "created_at",
            "updated_at",
        ]


    def get_image_url(self, obj):
        # ✅ relative URL
        return obj.image.url if getattr(obj, "image", None) else None
    

    