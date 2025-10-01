from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, redirect
from .models import Course, Lesson, LessonLink
from .serializers import CourseSerializer, LessonSerializer

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
