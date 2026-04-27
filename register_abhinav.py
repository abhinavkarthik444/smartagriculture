#!/usr/bin/env python3
"""
Register a new user abhinav in the database
"""

import requests
import json

def register_abhinav():
    """Register a new user through the API"""
    
    base_url = "http://localhost:5000"
    
    user_data = {
        "username": "abhinav",
        "email": "abhinavkarthik444@gmail.com",
        "password": "pass123",
        "full_name": "Abhinav Karthik",
        "farm_location": "Tamil Nadu"
    }
    
    print("Registering new user abhinav...")
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
            print("SUCCESS: User abhinav registered successfully!")
            print(f"Message: {data['message']}")
            print(f"User ID: {data.get('user_id', 'N/A')}")
            return True
        else:
            print(f"ERROR: Registration failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"ERROR: Exception occurred: {str(e)}")
        print("Make sure the Flask server is running on http://localhost:5000")
        return False

if __name__ == "__main__":
    register_abhinav()
