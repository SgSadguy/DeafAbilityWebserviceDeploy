from rest_framework import serializers
from .models import Course, Lesson, LessonLink, LessonProgress , Job
from urllib.parse import urlparse, parse_qs

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

    class Meta:
        model = Lesson
        fields = ['id','title','description','order','links',
                  'next_lesson_id','is_last_lesson','completed',
                  'created_at','updated_at']

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

    
class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'level', 'category', 'description', 'lessons', 'created_at', 'updated_at', 'video_url']





class CourseMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name", "level", "category"]

class JobSerializer(serializers.ModelSerializer):
    courses = CourseMiniSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "description",
            "position_type",
            "courses",        # ← รายการคอร์สแบบย่อ
            "created_at",
            "updated_at",
        ]