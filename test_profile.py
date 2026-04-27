#!/usr/bin/env python3
"""
Test the profile API endpoint
"""

import requests
import json

def test_profile_api():
    """Test the profile API endpoint"""
    
    base_url = "http://localhost:5000"
    
    print("Testing Profile API Endpoint...")
    print("=" * 50)
    
    try:
        # First login to get session
        login_data = {
            "username": "abhinav",
            "password": "pass123"
        }
        
        login_response = requests.post(
            f"{base_url}/api/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            print("SUCCESS: Login successful!")
            
            # Now test profile endpoint
            profile_response = requests.get(
                f"{base_url}/api/user/profile",
                cookies=login_response.cookies
            )
            
            if profile_response.status_code == 200:
                data = profile_response.json()
                print("SUCCESS: Profile API working!")
                print(f"User: {data['user']['username']}")
                print(f"Email: {data['user']['email']}")
                print(f"Full Name: {data['user']['full_name']}")
                print(f"Farm Location: {data['user']['farm_location']}")
                print(f"Phone: {data['user']['phone_number']}")
                print(f"Address: {data['user']['address']}")
                return True
            else:
                print(f"ERROR: Profile API failed with status code: {profile_response.status_code}")
                print(f"Error: {profile_response.text}")
                return False
        else:
            print(f"ERROR: Login failed with status code: {login_response.status_code}")
            print(f"Error: {login_response.text}")
            return False
            
    except Exception as e:
        print(f"ERROR: Exception occurred: {str(e)}")
        return False

if __name__ == "__main__":
    test_profile_api()
