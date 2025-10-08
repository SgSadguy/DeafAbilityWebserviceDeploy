#!/usr/bin/env python
"""
Create production data for courses and jobs
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deafability.settings')
django.setup()

from courses.models import Course, Lesson, Job

def create_production_data():
    """Create production courses and jobs"""
    
    # Create courses
    courses_data = [
        {
            'name': 'คอร์สพื้นฐานการออกแบบ UI/UX',
            'level': 'เริ่มต้น',
            'category': 'การออกแบบ',
            'description': 'เรียนรู้พื้นฐานการออกแบบ UI/UX สำหรับผู้พิการทางการได้ยิน',
            'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
            'name': 'คอร์สการพัฒนาเว็บไซต์',
            'level': 'กลาง',
            'category': 'การพัฒนา',
            'description': 'เรียนรู้การพัฒนาเว็บไซต์ที่เข้าถึงได้สำหรับผู้พิการทางการได้ยิน',
            'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
            'name': 'คอร์สการเขียนโปรแกรม Python',
            'level': 'เริ่มต้น',
            'category': 'การพัฒนา',
            'description': 'เรียนรู้การเขียนโปรแกรม Python สำหรับผู้พิการทางการได้ยิน',
            'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
            'name': 'คอร์สการออกแบบกราฟิก',
            'level': 'กลาง',
            'category': 'การออกแบบ',
            'description': 'เรียนรู้การออกแบบกราฟิกและสื่อสำหรับผู้พิการทางการได้ยิน',
            'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
    ]
    
    created_courses = []
    
    for course_data in courses_data:
        course, created = Course.objects.get_or_create(
            name=course_data['name'],
            defaults={
                'level': course_data['level'],
                'category': course_data['category'],
                'description': course_data['description'],
                'video_url': course_data['video_url']
            }
        )
        created_courses.append(course)
        if created:
            print(f"✅ Created course: {course.name}")
        else:
            print(f"ℹ️ Course already exists: {course.name}")
    
    # Create jobs
    jobs_data = [
        {
            'title': 'UI/UX Designer',
            'description': 'ออกแบบ UI/UX สำหรับแอปพลิเคชันที่เข้าถึงได้สำหรับผู้พิการทางการได้ยิน',
            'position_type': 'Full-time',
            'courses': [created_courses[0], created_courses[3]]  # UI/UX + Graphic Design
        },
        {
            'title': 'Frontend Developer',
            'description': 'พัฒนาเว็บไซต์และแอปพลิเคชันที่เข้าถึงได้สำหรับผู้พิการทางการได้ยิน',
            'position_type': 'Full-time',
            'courses': [created_courses[1], created_courses[2]]  # Web Development + Python
        },
        {
            'title': 'Python Developer',
            'description': 'พัฒนาแอปพลิเคชัน Python ที่เข้าถึงได้สำหรับผู้พิการทางการได้ยิน',
            'position_type': 'Part-time',
            'courses': [created_courses[2]]  # Python
        },
        {
            'title': 'Graphic Designer',
            'description': 'ออกแบบกราฟิกและสื่อสำหรับผู้พิการทางการได้ยิน',
            'position_type': 'Freelance',
            'courses': [created_courses[3]]  # Graphic Design
        }
    ]
    
    for job_data in jobs_data:
        job, created = Job.objects.get_or_create(
            title=job_data['title'],
            defaults={
                'description': job_data['description'],
                'position_type': job_data['position_type']
            }
        )
        
        if created:
            print(f"✅ Created job: {job.title}")
            # Add courses to job
            for course in job_data['courses']:
                job.courses.add(course)
        else:
            print(f"ℹ️ Job already exists: {job.title}")
    
    print("\n🎉 Production data creation completed!")
    print(f"📚 Total courses: {Course.objects.count()}")
    print(f"💼 Total jobs: {Job.objects.count()}")

if __name__ == '__main__':
    create_production_data()
