#!/usr/bin/env python3
"""
Debug test to check Flask server and website functionality
"""

import requests
import time

def test_server():
    """Test if Flask server is responding correctly"""
    
    base_url = "http://localhost:5000"
    
    print("Testing Flask Server...")
    print("=" * 50)
    
    try:
        # Test basic connection
        response = requests.get(f"{base_url}/", timeout=10)
        print(f"✅ Server Response: {response.status_code}")
        
        # Test login endpoint
        login_data = {
            "username": "abhinav",
            "password": "pass123"
        }
        
        login_response = requests.post(
            f"{base_url}/api/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if login_response.status_code == 200:
            print("✅ Login API working")
            print("✅ Server is running correctly")
            return True
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Error: {login_response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection refused - server not running")
        return False
    except requests.exceptions.Timeout:
        print("❌ Connection timeout - server slow")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    if test_server():
        print("\n✅ Server is ready!")
        print("Open index.html in your browser to use the website.")
    else:
        print("\n❌ Server issues detected.")
        print("Make sure Flask server is running on port 5000.")
