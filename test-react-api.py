#!/usr/bin/env python
"""
Test React app API calls
"""

import requests
import json

def test_react_api():
    """Test API calls that React app makes"""
    base_url = "https://deafabilitywebservicedeploy.onrender.com"
    
    print("🔍 Testing React API calls...")
    
    # Test courses endpoint (what React calls)
    try:
        response = requests.get(f"{base_url}/api/courses/")
        print(f"📚 /api/courses/: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Found {len(data)} courses")
            if data:
                print(f"   First course: {data[0].get('name', 'N/A')}")
                print(f"   Course fields: {list(data[0].keys())}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test jobs endpoint (what React calls)
    try:
        response = requests.get(f"{base_url}/api/jobs/")
        print(f"💼 /api/jobs/: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Found {len(data)} jobs")
            if data:
                print(f"   First job: {data[0].get('title', 'N/A')}")
                print(f"   Job fields: {list(data[0].keys())}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test CORS
    try:
        headers = {
            'Origin': 'https://deafabilitywebservicedeploy.onrender.com',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{base_url}/api/courses/", headers=headers)
        print(f"🌐 CORS preflight: {response.status_code}")
        print(f"   CORS headers: {dict(response.headers)}")
    except Exception as e:
        print(f"   CORS Error: {e}")

if __name__ == '__main__':
    test_react_api()
