# views.py
from rest_framework import viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, Lesson, LessonProgress, Job
from .serializers import CourseSerializer, LessonSerializer, CourseProgressSerializer, JobSerializer
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models import Q
from rest_framework.generics import ListAPIView, RetrieveAPIView


# -------------------------------------------
# CSRF bootstrap (for frontend)
# -------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_bootstrap(request):
    return Response({'detail': 'ok'})


# -------------------------------------------
# Reset course progress for current user
# -------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_course_progress(request, course_id):
    user = request.user
    course = get_object_or_404(Course, id=course_id)
    deleted, _ = LessonProgress.objects.filter(user=user, course=course).delete()
    return Response({'ok': True, 'deleted_count': deleted})


# -------------------------------------------
# Course ViewSet (for DRF router)
# -------------------------------------------
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]


# -------------------------------------------
# Course list and detail (API)
# -------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def course_list(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    serializer = CourseSerializer(course)
    return Response(serializer.data)


# -------------------------------------------
# Lesson detail (include course video URL)
# -------------------------------------------
@api_view(['GET'])
def lesson_detail(request, course_id, lesson_id):
    course = get_object_or_404(Course, id=course_id)
    lesson = get_object_or_404(Lesson, id=lesson_id, course=course)

    data = {
        'id': lesson.id,
        'title': lesson.title,
        'description': lesson.description,
        'order': lesson.order,
        'course_id': course.id,
        'video_url': course.video_url  # <-- new: single video URL per course
    }
    return Response(data)


# -------------------------------------------
# Enroll in course
# -------------------------------------------
@api_view(['POST'])
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    # Enrollment logic can go here (if needed)
    return Response({
        'message': f'Successfully enrolled in course: {course.name}',
        'course_id': course_id
    })


# -------------------------------------------
# Mark lesson as complete
# -------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lesson_complete(request, course_id, lesson_id):
    user = request.user
    course = get_object_or_404(Course, id=course_id)
    lesson = get_object_or_404(Lesson, id=lesson_id, course=course)

    obj, _ = LessonProgress.objects.get_or_create(user=user, course=course, lesson=lesson)
    obj.completed = True
    obj.completed_at = timezone.now()
    obj.save()

    return Response({
        'ok': True,
        'lesson_id': lesson.id,
        'completed': True,
        'completed_at': obj.completed_at
    })


# -------------------------------------------
# Course progress (per course)
# -------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def course_progress(request, course_id):
    user = getattr(request, 'user', None)
    course = get_object_or_404(Course, id=course_id)

    total = 1  # each course has 1 video
    if not user or not getattr(user, 'is_authenticated', False):
        return Response({'course_id': course.id, 'total_videos': total, 'completed': 0, 'percent': 0.0})

    completed = LessonProgress.objects.filter(user=user, course=course, completed=True).count()
    percent = (completed / total * 100.0) if total else 0.0

    return Response({'course_id': course.id, 'total_videos': total, 'completed': completed, 'percent': round(percent, 2)})


# -------------------------------------------
# Jobs API
# -------------------------------------------
class JobListAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = JobSerializer

    def get_queryset(self):
        qs = Job.objects.prefetch_related("courses").order_by("-created_at")
        q = self.request.query_params.get("q")
        pos = self.request.query_params.get("position_type")

        if q:
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(courses__name__icontains=q)
            ).distinct()

        if pos:
            qs = qs.filter(position_type__icontains=pos)

        return qs


class JobDetailAPIView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = JobSerializer
    queryset = Job.objects.prefetch_related("courses").all()
    lookup_url_kwarg = "job_id"
