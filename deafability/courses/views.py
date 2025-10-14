# views.py
from rest_framework import viewsets ,status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, Lesson, LessonProgress, Job ,QuizQuestion
from .serializers import CourseSerializer, LessonSerializer, CourseProgressSerializer, JobSerializer ,QuizQuestionSerializer, QuizCheckSerializer
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models import Q
from rest_framework.generics import ListAPIView, RetrieveAPIView


from django.contrib.auth import get_user_model

User = get_user_model()

# helper: คืน user ที่จะใช้ (จริงหรือ guest)
def _get_or_create_dev_guest_user():
    """
    คืน user ที่ล็อกอินถ้ามี ถ้าไม่มีก็หา/สร้าง user ชื่อ 'guest_dev' แบบไม่ต้องพาสเวิร์ด
    เฉพาะสำหรับ dev/testing เท่านั้น — ห้ามใช้ใน production
    """
    try:
        # ถ้ามี request.user ที่ authenticated ให้ใช้
        # (เราเรียก helper จากภายใน view และส่ง request.user ถ้ามี)
        # แต่ helper นี้ไม่เห็น request, ดังนั้น caller ควรตรวจก่อนเรียก
        # ใน view ด้านล่างเราจะตรวจและใช้ request.user ถ้า authenticated
        return None
    except Exception:
        return None

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


# -------------------------------------------
# Course list and detail (API)
# -------------------------------------------
@api_view(['GET'])
def course_list(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(['GET'])
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    serializer = CourseSerializer(course, context={"request": request})
    return Response(serializer.data)


# -------------------------------------------
# Lesson detail (include course video URL)
# -------------------------------------------
@api_view(['GET'])
def lesson_detail(request, course_id, lesson_id):
    lesson = get_object_or_404(
        Lesson.objects.select_related('course').prefetch_related('links'),
        id=lesson_id, course_id=course_id
    )
    ser = LessonSerializer(lesson, context={'request': request})
    return Response(ser.data)


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
@permission_classes([AllowAny])  # ระหว่าง dev ให้เปิดไว้
def lesson_complete(request, course_id, lesson_id):
    # ใช้ user ที่ล็อกอิน ถ้าไม่มี ให้หา/สร้าง guest_dev
    if getattr(request, 'user', None) and request.user.is_authenticated:
        user = request.user
    else:
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username='guest_dev',
            defaults={'is_active': True}
        )
        # ให้พาสเวิร์ด unusable เพื่อความปลอดภัย (ถ้ามีไปสร้างผ่าน shell)
        try:
            user.set_unusable_password()
            user.save(update_fields=['password'])
        except Exception:
            pass

    course = get_object_or_404(Course, id=course_id)
    lesson = get_object_or_404(Lesson, id=lesson_id, course=course)

    obj, _ = LessonProgress.objects.get_or_create(user=user, course=course, lesson=lesson)
    obj.completed = True
    obj.completed_at = timezone.now()
    obj.save()

    # คำนวณ progress ใหม่
    total_lessons = Lesson.objects.filter(course=course).count()
    completed_lessons = LessonProgress.objects.filter(user=user, course=course, completed=True).count()
    percent = (completed_lessons / total_lessons * 100.0) if total_lessons else 0.0

    return Response({
        'ok': True,
        'course_id': course.id,
        'lesson_id': lesson.id,
        'completed_lessons': completed_lessons,
        'total_lessons': total_lessons,
        'percent': round(percent, 2)
    })

# -------------------------------------------
# Course progress (per course)
# -------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])  # ระหว่าง dev ให้เปิดไว้
def course_progress(request, course_id):
    if getattr(request, 'user', None) and request.user.is_authenticated:
        user = request.user
    else:
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username='guest_dev',
            defaults={'is_active': True}
        )
        try:
            user.set_unusable_password()
            user.save(update_fields=['password'])
        except Exception:
            pass

    course = get_object_or_404(Course, id=course_id)
    total_lessons = Lesson.objects.filter(course=course).count()
    completed_lessons = LessonProgress.objects.filter(user=user, course=course, completed=True).count()
    percent = (completed_lessons / total_lessons * 100.0) if total_lessons else 0.0

    return Response({
        'course_id': course.id,
        'completed_lessons': completed_lessons,
        'total_lessons': total_lessons,
        'percent': round(percent, 2)
    })

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





# -------------------------------------------
# Quiz API
# -------------------------------------------
@api_view(["GET"])
@authentication_classes([])               
@permission_classes([AllowAny])
def quiz_list(request):
    course_id = request.GET.get("course")
    qs = QuizQuestion.objects.all()
    if course_id:
        qs = qs.filter(course_id=course_id)
    data = QuizQuestionSerializer(qs, many=True).data
    return Response(data)


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def quiz_detail(request, pk):
    try:
        q = QuizQuestion.objects.get(pk=pk)
    except QuizQuestion.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)
    return Response(QuizQuestionSerializer(q).data)

@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def quiz_check(request, pk):
    try:
        q = QuizQuestion.objects.get(pk=pk)
    except QuizQuestion.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    ser = QuizCheckSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    answer = ser.validated_data["answer"]


    correct = list(answer) == list(q.correct_order or [])

    return Response({
        "question_id": q.id,
        "correct": correct,
        "expected": q.correct_order,
        "your_answer": answer,
    }, status=status.HTTP_200_OK)