#!/usr/bin/env python3
"""
Register user vijay with unique username if needed
"""

import requests
import json

def check_and_register_user():
    """Check if user exists and register with unique username if needed"""
    
    base_url = "http://localhost:5000"
    
    # First try with original username
    user_data = {
        "username": "vijay",
        "email": "vnani8219@gmail.com",
        "password": "pass123",
        "full_name": "Vijay",
        "farm_location": "Tamil Nadu"
    }
    
    print("Attempting to register user vijay...")
    print("=" * 50)
    
    try:
        response = requests.post(
            f"{base_url}/api/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            print("SUCCESS: User vijay registered successfully!")
            print(f"Message: {data['message']}")
            print(f"User ID: {data.get('user_id', 'N/A')}")
            return True
        elif response.status_code == 409:
            print("User vijay already exists. Trying with unique username...")
            
            # Try with unique username
            unique_user_data = user_data.copy()
            unique_user_data["username"] = "vijay_" + str(hash(user_data["email"]) % 10000)
            
            response2 = requests.post(
                f"{base_url}/api/register",
                json=unique_user_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response2.status_code == 201:
                data = response2.json()
                print("SUCCESS: User registered with unique username!")
                print(f"Username: {unique_user_data['username']}")
                print(f"Email: {unique_user_data['email']}")
                print(f"Message: {data['message']}")
                print(f"User ID: {data.get('user_id', 'N/A')}")
                return True
            else:
                print(f"ERROR: Registration failed with status code: {response2.status_code}")
                print(f"Error: {response2.text}")
                return False
        else:
            print(f"ERROR: Registration failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"ERROR: Exception occurred: {str(e)}")
        print("Make sure the Flask server is running on http://localhost:5000")
        return False

if __name__ == "__main__":
    check_and_register_user()
