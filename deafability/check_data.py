#!/usr/bin/env python
"""
Check data in database
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deafability.settings')
django.setup()

from courses.models import Course, Job

def check_data():
    """Check data in database"""
    
    print("🔍 Checking database data...")
    print(f"📚 Total courses: {Course.objects.count()}")
    print(f"💼 Total jobs: {Job.objects.count()}")
    
    if Course.objects.count() > 0:
        print("\n📚 Courses:")
        for course in Course.objects.all():
            print(f"  - {course.name} ({course.level}, {course.category})")
    
    if Job.objects.count() > 0:
        print("\n💼 Jobs:")
        for job in Job.objects.all():
            print(f"  - {job.title} ({job.position_type})")
    
    print("\n✅ Data check completed!")

if __name__ == '__main__':
    check_data()
