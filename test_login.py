#!/usr/bin/env python3
"""
Test script to verify login functionality
"""
import requests
import json

# Test data
BASE_URL = "http://localhost:8000/api"
LOGIN_ENDPOINT = f"{BASE_URL}/users/auth/login/"

def test_login(username, password="", description=""):
    """Test login with given credentials"""
    print(f"\n🧪 Testing: {description}")
    print(f"   Username: {username}")
    print(f"   Password: {'[PROVIDED]' if password else '[EMPTY]'}")
    
    try:
        response = requests.post(
            LOGIN_ENDPOINT,
            json={
                "username": username,
                "password": password
            },
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ SUCCESS!")
            print(f"   User: {data['user']['first_name']} {data['user']['last_name']}")
            print(f"   Role: {data['user']['role']}")
            print(f"   Student ID: {data['user'].get('student_id', 'N/A')}")
            return True
        else:
            print(f"   ❌ FAILED!")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ EXCEPTION: {str(e)}")
        return False

def main():
    print("🚀 Testing Login Functionality")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        # Student login tests (no password required)
        ("C01-M-G01-A-0001", "", "Student ID login"),
        ("student123", "", "Student username login"),
        ("John", "", "Student first name login"),
        ("Doe", "", "Student last name login"),
        
        # Admin login test (password required)
        ("admin@school.com", "admin123", "Admin email login"),
        ("admin", "admin123", "Admin username login"),
    ]
    
    success_count = 0
    total_tests = len(test_cases)
    
    for username, password, description in test_cases:
        if test_login(username, password, description):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Results: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 All tests passed! Login functionality is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()