from rest_framework import serializers
from .models import Course, Lesson, LessonLink
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
        fields = ['id', 'title', 'kind', 'href', 'embed_url', 'created_at']

    def get_href(self, obj):
        request = self.context.get("request")
        if obj.kind == "file" and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return obj.url

    def get_embed_url(self, obj):
        if obj.kind == "youtube" and obj.url:
            return youtube_embed(obj.url)
        return None
class LessonSerializer(serializers.ModelSerializer):

    links = LessonLinkSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'order', 'links', 'created_at', 'updated_at']
class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'level', 'category', 'description', 'lessons', 'created_at', 'updated_at']


