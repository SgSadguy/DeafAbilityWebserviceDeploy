from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from rest_framework.routers import DefaultRouter
import os

from courses.views import (
    CourseViewSet, csrf_bootstrap, course_list, course_detail, lesson_detail,
    enroll_course, lesson_complete, course_progress, reset_course_progress,
    JobListAPIView, JobDetailAPIView, quiz_list, quiz_detail, quiz_check
)

router = DefaultRouter()
router.register(r"courses", CourseViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/csrf/", csrf_bootstrap),
    path("api/courses-list/", course_list, name="course-list"),
    path("api/courses/<int:course_id>/", course_detail, name="course-detail"),
    path("api/courses/<int:course_id>/enroll/", enroll_course, name="enroll-course"),
    path("api/courses/<int:course_id>/lessons/<int:lesson_id>/", lesson_detail, name="lesson-detail"),
    path("api/courses/<int:course_id>/progress/", course_progress, name="course_progress"),
    path("api/courses/<int:course_id>/lessons/<int:lesson_id>/complete/", lesson_complete, name="lesson_complete"),

    path("api/jobs/", JobListAPIView.as_view(), name="job_list"),
    path("api/jobs/<int:job_id>/", JobDetailAPIView.as_view(), name="job_detail"),

    path("api/courses/<int:course_id>/reset_progress/", reset_course_progress),

    path("api/quiz/questions/", quiz_list),
    path("api/quiz/questions/<int:pk>/", quiz_detail),
    path("api/quiz/questions/<int:pk>/check/", quiz_check),
]

# ---- เสิร์ฟสื่อ (ต้องมาก่อน catch-all) ----
if settings.DEBUG or os.environ.get("SERVE_MEDIA", "1") == "1":
    urlpatterns += [
        re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
    ]

# ---- เสิร์ฟ React index.html แบบ catch-all แต่ 'ยกเว้น' api/admin/media ----
urlpatterns += [
    re_path(r"^$", serve, {"document_root": settings.STATIC_ROOT, "path": "index.html"}),
    re_path(
        r"^(?!api/|admin/|media/).*$",
        serve,
        {"document_root": settings.STATIC_ROOT, "path": "index.html"},
    ),
]
