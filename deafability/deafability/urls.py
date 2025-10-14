"""
URL configuration for deafability project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve as static_serve

from rest_framework.routers import DefaultRouter
from courses.views import (
    CourseViewSet, csrf_bootstrap, course_list, course_detail, lesson_detail,
    enroll_course, lesson_complete, course_progress, reset_course_progress,
    JobListAPIView, JobDetailAPIView, quiz_list, quiz_detail, quiz_check
)
router = DefaultRouter()
router.register(r'courses', CourseViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/csrf/', csrf_bootstrap),
    path('api/courses-list/', course_list, name='course-list'),
    path('api/courses/<int:course_id>/', course_detail, name='course-detail'),
    path('api/courses/<int:course_id>/enroll/', enroll_course, name='enroll-course'),
    path('api/courses/<int:course_id>/lessons/<int:lesson_id>/', lesson_detail, name='lesson-detail'),
    path('api/courses/<int:course_id>/progress/', course_progress, name='course_progress'),
    path('api/courses/<int:course_id>/lessons/<int:lesson_id>/complete/', lesson_complete, name='lesson_complete'),
    
    path("api/jobs/", JobListAPIView.as_view(), name="job_list"),
    path("api/jobs/<int:job_id>/", JobDetailAPIView.as_view(), name="job_detail"),
    
    path('api/courses/<int:course_id>/reset_progress/', reset_course_progress),

    path("api/quiz/questions/", quiz_list),
    path("api/quiz/questions/<int:pk>/", quiz_detail),
    path("api/quiz/questions/<int:pk>/check/", quiz_check),
]
# ---- เสิร์ฟ media "ก่อน" catch-all เสมอ ----
# ใช้ static() แค่ dev; ถ้า DEBUG อาจมาจาก env ให้ fallback เสมอ
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # เผื่อกรณี DEBUG=False แต่ยังรัน dev server
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', static_serve, {'document_root': settings.MEDIA_ROOT}),
    ]

# ---- React catch-all: ยกเว้น api/admin/media ----
urlpatterns += [
    re_path(r'^(?!api/|admin/|media/).*$',
            static_serve, {'document_root': settings.STATIC_ROOT, 'path': 'index.html'}),
]