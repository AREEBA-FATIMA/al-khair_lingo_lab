#!/usr/bin/env python3
"""
Simple test script to test login API
"""
import requests
import json

# Test data
login_data = {
    "username": "testuser",
    "password": "testpass123"
}

# API endpoint
url = "http://127.0.0.1:8000/api/users/auth/login/"

# Headers
headers = {
    "Content-Type": "application/json"
}

print("Testing login API...")
print(f"URL: {url}")
print(f"Data: {json.dumps(login_data, indent=2)}")

try:
    response = requests.post(url, json=login_data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Login successful!")
    else:
        print("❌ Login failed!")
        
except requests.exceptions.ConnectionError:
    print("❌ Connection failed! Make sure Django server is running on port 8000")
except Exception as e:
    print(f"❌ Error: {e}")
