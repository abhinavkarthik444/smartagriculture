import requests
import json

def test_community_endpoints():
    base_url = "http://localhost:5000"
    
    print("Testing Community Endpoints...")
    
    # Test health check first
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return
    
    # Test community posts (should work)
    try:
        response = requests.get(f"{base_url}/api/community/posts")
        print(f"Posts API: {response.status_code}")
        if response.status_code == 200:
            print(f"Posts data: {len(response.json().get('posts', []))} posts")
        else:
            print(f"Posts error: {response.text}")
    except Exception as e:
        print(f"Posts API failed: {e}")
    
    # Test community groups (new endpoint)
    try:
        response = requests.get(f"{base_url}/api/community/groups")
        print(f"Groups API: {response.status_code}")
        if response.status_code == 200:
            print(f"Groups data: {len(response.json().get('groups', []))} groups")
        else:
            print(f"Groups error: {response.text}")
    except Exception as e:
        print(f"Groups API failed: {e}")
    
    # Test community members (new endpoint)
    try:
        response = requests.get(f"{base_url}/api/community/members")
        print(f"Members API: {response.status_code}")
        if response.status_code == 200:
            print(f"Members data: {len(response.json().get('members', []))} members")
        else:
            print(f"Members error: {response.text}")
    except Exception as e:
        print(f"Members API failed: {e}")

if __name__ == "__main__":
    test_community_endpoints()
