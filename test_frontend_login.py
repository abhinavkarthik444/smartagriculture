#!/usr/bin/env python3
"""
Test Frontend Login Request
"""

import requests
import json

def test_frontend_login():
    """Test login exactly like the frontend does"""
    
    base_url = "http://localhost:5000"
    
    print("TESTING FRONTEND LOGIN REQUEST")
    print("=" * 50)
    
    # Test exactly like the frontend JavaScript
    login_data = {"username": "abhinav", "password": "pass123"}
    
    try:
        # Simulate the exact frontend request
        response = requests.post(
            f"{base_url}/api/login",
            method="POST",
            headers={"Content-Type": "application/json"},
            data=json.dumps(login_data),
            cookies=None,  # Frontend uses credentials: 'include'
            timeout=5
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("SUCCESS: Frontend-style login working")
        else:
            print("ERROR: Frontend-style login failed")
            
    except Exception as e:
        print(f"Exception: {e}")
    
    # Test with different content types
    print(f"\n" + "=" * 50)
    print("TESTING WITH DIFFERENT HEADERS")
    
    try:
        response = requests.post(
            f"{base_url}/api/login",
            json=login_data,  # This sets Content-Type automatically
            timeout=5
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_frontend_login()
