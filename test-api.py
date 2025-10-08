#!/usr/bin/env python
"""
Test API endpoints
"""

import requests
import json

def test_api():
    """Test API endpoints"""
    base_url = "https://deafabilitywebservicedeploy.onrender.com"
    
    print("🔍 Testing API endpoints...")
    
    # Test courses endpoint
    try:
        response = requests.get(f"{base_url}/api/courses/")
        print(f"📚 Courses API: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Found {len(data)} courses")
            if data:
                print(f"   First course: {data[0].get('name', 'N/A')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test jobs endpoint
    try:
        response = requests.get(f"{base_url}/api/jobs/")
        print(f"💼 Jobs API: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Found {len(data)} jobs")
            if data:
                print(f"   First job: {data[0].get('title', 'N/A')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test CSRF endpoint
    try:
        response = requests.get(f"{base_url}/api/csrf/")
        print(f"🔒 CSRF API: {response.status_code}")
        if response.status_code == 200:
            print(f"   CSRF token available")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == '__main__':
    test_api()
