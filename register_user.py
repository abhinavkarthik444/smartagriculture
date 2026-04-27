#!/usr/bin/env python3
"""
Register a new user in the database
"""

import requests
import json

def register_user():
    """Register a new user through the API"""
    
    base_url = "http://localhost:5000"
    
    user_data = {
        "username": "vijay",
        "email": "vnani8219@gmail.com",
        "password": "pass123",
        "full_name": "Vijay",
        "farm_location": "Tamil Nadu"
    }
    
    print("Registering new user...")
    print("=" * 50)
    print(f"Username: {user_data['username']}")
    print(f"Email: {user_data['email']}")
    print(f"Password: {user_data['password']}")
    print(f"Full Name: {user_data['full_name']}")
    print(f"Farm Location: {user_data['farm_location']}")
    print("=" * 50)
    
    try:
        response = requests.post(
            f"{base_url}/api/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            print("SUCCESS: User registered successfully!")
            print(f"Message: {data['message']}")
            print(f"User ID: {data.get('user_id', 'N/A')}")
        else:
            print(f"ERROR: Registration failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"ERROR: Exception occurred: {str(e)}")
        print("Make sure the Flask server is running on http://localhost:5000")

if __name__ == "__main__":
    register_user()
