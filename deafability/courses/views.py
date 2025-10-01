from rest_framework import viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, redirect
from .models import Course, Lesson, LessonLink, LessonProgress
from .serializers import CourseSerializer, LessonSerializer, CourseProgressSerializer
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import ensure_csrf_cookie




@api_view(['GET'])
@permission_classes([AllowAny])      
@ensure_csrf_cookie              
def csrf_bootstrap(request):
    return Response({'detail': 'ok'})



@api_view(['POST'])
@permission_classes([IsAuthenticated])  # เดโมจะ AllowAny ก็ได้ แต่โปรดเปลี่ยนในโปรดักชัน
def reset_course_progress(request, course_id):
    user = request.user
    course = get_object_or_404(Course, id=course_id)
    deleted, _ = LessonProgress.objects.filter(user=user, course=course).delete()
    return Response({'ok': True, 'deleted_count': deleted})



class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

@api_view(['GET'])
def course_list(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    serializer = CourseSerializer(course)
    return Response(serializer.data)

@api_view(['GET'])
def lesson_detail(request, course_id, lesson_id):
    course = get_object_or_404(Course, id=course_id)
    lesson = get_object_or_404(Lesson, id=lesson_id, course=course)
    serializer = LessonSerializer(lesson, context={'request': request})  
    return Response(serializer.data) 

@api_view(['POST'])
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    return Response({
        'message': f'Successfully enrolled in course: {course.name}',
        'course_id': course_id
    })



@api_view(['POST'])
@permission_classes([AllowAny])  
def lesson_complete(request, course_id, lesson_id):
    user = getattr(request, 'user', None)
    if not user or not getattr(user, 'is_authenticated', False):
        return Response({'detail': 'Please login to record progress.'}, status=401)

    course = get_object_or_404(Course, id=course_id)
    lesson = get_object_or_404(Lesson, id=lesson_id, course=course)

    obj, _ = LessonProgress.objects.get_or_create(user=user, course=course, lesson=lesson)
    obj.completed = True
    obj.completed_at = timezone.now()
    obj.save()

    return Response({'ok': True, 'lesson_id': lesson.id, 'completed': True, 'completed_at': obj.completed_at})

@api_view(['GET'])
@permission_classes([AllowAny]) 
def course_progress(request, course_id):
    user = getattr(request, 'user', None)
    course = get_object_or_404(Course, id=course_id)
    total = course.lessons.count()
    if not user or not getattr(user, 'is_authenticated', False):
        return Response({'course_id': course.id, 'total_lessons': total, 'completed_lessons': 0, 'percent': 0.0})

    completed = (LessonProgress.objects
                 .filter(user=user, course=course, completed=True)
                 .count())
    percent = (completed / total * 100.0) if total else 0.0
    data = {'course_id': course.id, 'total_lessons': total, 'completed_lessons': completed, 'percent': round(percent, 2)}
    ser = CourseProgressSerializer(data)
    return Response(data)
