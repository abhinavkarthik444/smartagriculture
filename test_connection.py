#!/usr/bin/env python3
"""
Test Flask server connection
"""

import requests
import json

def test_server_connection():
    """Test if Flask server is responding"""
    
    base_url = "http://localhost:5000"
    
    print("Testing Flask Server Connection...")
    print("=" * 50)
    
    try:
        # Test basic server health
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"SUCCESS: Basic connection: {response.status_code}")
        
        # Test login endpoint
        login_data = {
            "username": "abhinav",
            "password": "pass123"
        }
        
        login_response = requests.post(
            f"{base_url}/api/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if login_response.status_code == 200:
            print("SUCCESS: Login endpoint working")
            
            # Test profile endpoint with session
            profile_response = requests.get(
                f"{base_url}/api/user/profile",
                cookies=login_response.cookies,
                timeout=5
            )
            
            if profile_response.status_code == 200:
                print("SUCCESS: Profile endpoint working")
                data = profile_response.json()
                print(f"SUCCESS: User: {data['user']['username']}")
            else:
                print(f"ERROR: Profile endpoint failed: {profile_response.status_code}")
                print(f"Error: {profile_response.text}")
        else:
            print(f"ERROR: Login endpoint failed: {login_response.status_code}")
            print(f"Error: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Connection refused - server may not be running")
    except requests.exceptions.Timeout:
        print("ERROR: Connection timeout - server may be slow")
    except Exception as e:
        print(f"ERROR: {str(e)}")
    
    print("=" * 50)

if __name__ == "__main__":
    test_server_connection()
