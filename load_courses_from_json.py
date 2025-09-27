#!/usr/bin/env python
"""
Script สำหรับโหลดข้อมูล course จาก JSON file
"""
import os
import sys
import json
import django

# เพิ่ม path ของ Django project
sys.path.append('deafability')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deafability.settings')
django.setup()

from courses.models import Course

def load_courses_from_json():
    """โหลดข้อมูล course จาก JSON file"""
    json_file_path = 'courses_data.json'
    
    if not os.path.exists(json_file_path):
        print(f"ไม่พบไฟล์ {json_file_path}")
        return
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as file:
            courses_data = json.load(file)
        
        print(f"กำลังโหลดข้อมูลจาก {json_file_path}...")
        
        for course_data in courses_data:
            course, created = Course.objects.get_or_create(
                name=course_data['name'],
                defaults={
                    'level': course_data['level'],
                    'category': course_data['category'],
                    'description': course_data.get('description', '')
                }
            )
            if created:
                print(f"✅ สร้างคอร์ส: {course.name}")
            else:
                print(f"⚠️  คอร์สมีอยู่แล้ว: {course.name}")
        
        print(f"\nเสร็จสิ้น! โหลดข้อมูล {len(courses_data)} คอร์ส")
        
    except json.JSONDecodeError as e:
        print(f"❌ ข้อผิดพลาดในการอ่าน JSON: {e}")
    except Exception as e:
        print(f"❌ ข้อผิดพลาด: {e}")

if __name__ == '__main__':
    load_courses_from_json()
