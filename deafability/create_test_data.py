#!/usr/bin/env python
"""
Create test data for courses and lessons
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deafability.settings')
django.setup()

from courses.models import Course, Lesson

def create_test_data():
    """Create test courses and lessons"""
    
    # Create test course 1
    course1, created = Course.objects.get_or_create(
        name='คอร์สพื้นฐานการออกแบบ UI/UX',
        defaults={
            'level': 'เริ่มต้น',
            'category': 'การออกแบบ',
            'description': 'เรียนรู้พื้นฐานการออกแบบ UI/UX สำหรับผู้พิการทางการได้ยิน'
        }
    )
    
    if created:
        print("✅ Created course 1: คอร์สพื้นฐานการออกแบบ UI/UX")
        
        # Create lessons for course 1
        lessons1 = [
            {
                'title': 'บทที่ 1: แนะนำการออกแบบ UI/UX',
                'description': 'เรียนรู้พื้นฐานการออกแบบ UI/UX และหลักการสำคัญ',
                'order': 1
            },
            {
                'title': 'บทที่ 2: หลักการออกแบบสำหรับผู้พิการทางการได้ยิน',
                'description': 'เข้าใจหลักการออกแบบที่เหมาะสมสำหรับผู้พิการทางการได้ยิน',
                'order': 2
            },
            {
                'title': 'บทที่ 3: การใช้งานเครื่องมือออกแบบ',
                'description': 'เรียนรู้การใช้งานเครื่องมือออกแบบต่างๆ เช่น Figma, Adobe XD',
                'order': 3
            }
        ]
        
        for lesson_data in lessons1:
            lesson, created = Lesson.objects.get_or_create(
                course=course1,
                title=lesson_data['title'],
                defaults={
                    'description': lesson_data['description'],
                    'order': lesson_data['order']
                }
            )
            if created:
                print(f"  ✅ Created lesson: {lesson.title}")
    else:
        print("ℹ️ Course 1 already exists")
    
    # Create test course 2
    course2, created = Course.objects.get_or_create(
        name='คอร์สการพัฒนาเว็บไซต์',
        defaults={
            'level': 'กลาง',
            'category': 'การพัฒนา',
            'description': 'เรียนรู้การพัฒนาเว็บไซต์ที่เข้าถึงได้สำหรับผู้พิการทางการได้ยิน'
        }
    )
    
    if created:
        print("✅ Created course 2: คอร์สการพัฒนาเว็บไซต์")
        
        # Create lessons for course 2
        lessons2 = [
            {
                'title': 'บทที่ 1: HTML และ Accessibility',
                'description': 'เรียนรู้ HTML พื้นฐานและหลักการ Accessibility',
                'order': 1
            },
            {
                'title': 'บทที่ 2: CSS และ Responsive Design',
                'description': 'เรียนรู้ CSS และการออกแบบ Responsive',
                'order': 2
            },
            {
                'title': 'บทที่ 3: JavaScript และ Interactive Features',
                'description': 'เรียนรู้ JavaScript และการสร้าง Interactive Features',
                'order': 3
            },
            {
                'title': 'บทที่ 4: Testing และ Deployment',
                'description': 'เรียนรู้การทดสอบและ Deploy เว็บไซต์',
                'order': 4
            }
        ]
        
        for lesson_data in lessons2:
            lesson, created = Lesson.objects.get_or_create(
                course=course2,
                title=lesson_data['title'],
                defaults={
                    'description': lesson_data['description'],
                    'order': lesson_data['order']
                }
            )
            if created:
                print(f"  ✅ Created lesson: {lesson.title}")
    else:
        print("ℹ️ Course 2 already exists")
    
    print("\n🎉 Test data creation completed!")
    print(f"📚 Total courses: {Course.objects.count()}")
    print(f"📖 Total lessons: {Lesson.objects.count()}")

if __name__ == '__main__':
    create_test_data()
