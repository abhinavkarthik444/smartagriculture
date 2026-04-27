#!/usr/bin/env python3
"""
Debug Login Credentials Issue
"""

import requests
import json

def debug_login():
    """Debug login credentials and authentication"""
    
    base_url = "http://localhost:5000"
    
    print("DEBUGGING LOGIN CREDENTIALS")
    print("=" * 50)
    
    # Test credentials that should work
    test_credentials = [
        {"username": "abhinav", "password": "pass123"},
        {"username": "vijay", "password": "pass123"},
        {"username": "admin", "password": "admin123"},
        {"username": "test", "password": "test"}
    ]
    
    for i, creds in enumerate(test_credentials, 1):
        print(f"\nTest {i}: {creds['username']} / {creds['password']}")
        
        try:
            response = requests.post(
                f"{base_url}/api/login",
                json=creds,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("SUCCESS: Login working!")
                print(f"User: {data.get('user', {}).get('username', 'N/A')}")
                print(f"Email: {data.get('user', {}).get('email', 'N/A')}")
            else:
                print(f"ERROR: {response.text}")
                
        except Exception as e:
            print(f"EXCEPTION: {e}")
    
    # Test registration to see if we can create a new user
    print(f"\n" + "=" * 50)
    print("TESTING REGISTRATION")
    
    new_user = {
        "username": "debuguser",
        "email": "debug@test.com",
        "password": "debug123",
        "full_name": "Debug User",
        "farm_location": "Debug Farm"
    }
    
    try:
        reg_response = requests.post(
            f"{base_url}/api/register",
            json=new_user,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        print(f"Registration Status: {reg_response.status_code}")
        print(f"Response: {reg_response.text}")
        
        # Now try to login with the new user
        if reg_response.status_code == 200:
            print("\nTrying to login with new user...")
            login_response = requests.post(
                f"{base_url}/api/login",
                json={"username": "debuguser", "password": "debug123"},
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            print(f"New User Login Status: {login_response.status_code}")
            print(f"New User Login Response: {login_response.text}")
            
    except Exception as e:
        print(f"Registration Exception: {e}")

if __name__ == "__main__":
    debug_login()
