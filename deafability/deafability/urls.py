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
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from courses.views import CourseViewSet, course_list, course_detail, lesson_detail, enroll_course

router = DefaultRouter()
router.register(r'courses', CourseViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/courses-list/', course_list, name='course-list'),
    path('api/courses/<int:course_id>/', course_detail, name='course-detail'),
    path('api/courses/<int:course_id>/enroll/', enroll_course, name='enroll-course'),
    path('api/courses/<int:course_id>/lessons/<int:lesson_id>/', lesson_detail, name='lesson-detail'),
]
