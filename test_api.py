import requests
import json

def test_api_endpoints():
    """Test the Flask API endpoints"""
    base_url = "http://localhost:5000"
    
    print("Testing API endpoints...")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        return False
    
    # Test login endpoint
    try:
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        response = requests.post(f"{base_url}/api/login", json=login_data)
        if response.status_code == 200:
            print("✅ Login endpoint working")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Login endpoint failed: {response.status_code}")
            print(f"Error: {response.json()}")
    except Exception as e:
        print(f"❌ Login test failed: {e}")
    
    # Test registration endpoint
    try:
        reg_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "test123",
            "full_name": "Test User"
        }
        response = requests.post(f"{base_url}/api/register", json=reg_data)
        if response.status_code == 201:
            print("✅ Registration endpoint working")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Registration endpoint failed: {response.status_code}")
            print(f"Error: {response.json()}")
    except Exception as e:
        print(f"❌ Registration test failed: {e}")
    
    return True

if __name__ == "__main__":
    test_api_endpoints()
