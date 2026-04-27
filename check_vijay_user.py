#!/usr/bin/env python3
"""
Check if user vijay exists and test login
"""

import requests
import json

def check_user_login():
    """Check if user vijay can login with provided credentials"""
    
    base_url = "http://localhost:5000"
    
    login_data = {
        "username": "vijay",
        "password": "pass123"
    }
    
    print("Checking if user vijay exists with provided credentials...")
    print("=" * 50)
    print(f"Username: {login_data['username']}")
    print(f"Password: {login_data['password']}")
    print("=" * 50)
    
    try:
        response = requests.post(
            f"{base_url}/api/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS: User vijay exists and login successful!")
            print(f"Message: {data['message']}")
            print("User is already registered in the database.")
            return True
        else:
            print(f"Login failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            
            # Try to register with different username
            print("\nTrying to register with username 'vijay_user'...")
            register_data = {
                "username": "vijay_user",
                "email": "vnani8219@gmail.com",
                "password": "pass123",
                "full_name": "Vijay",
                "farm_location": "Tamil Nadu"
            }
            
            register_response = requests.post(
                f"{base_url}/api/register",
                json=register_data,
                headers={"Content-Type": "application/json"}
            )
            
            if register_response.status_code == 201:
                data = register_response.json()
                print("SUCCESS: User registered successfully with username 'vijay_user'!")
                print(f"Message: {data['message']}")
                print(f"User ID: {data.get('user_id', 'N/A')}")
                return True
            else:
                print(f"Registration failed with status code: {register_response.status_code}")
                print(f"Error: {register_response.text}")
                return False
            
    except Exception as e:
        print(f"ERROR: Exception occurred: {str(e)}")
        print("Make sure the Flask server is running on http://localhost:5000")
        return False

if __name__ == "__main__":
    check_user_login()
