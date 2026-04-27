#!/usr/bin/env python3
"""
Comprehensive Network Diagnostic Tool
"""

import requests
import socket
import subprocess
import platform
import time

def test_network_connectivity():
    """Test all aspects of network connectivity"""
    
    print("COMPREHENSIVE NETWORK DIAGNOSTIC")
    print("=" * 60)
    
    # Test 1: Basic Network Connectivity
    print("\n1. Testing Basic Network Connectivity...")
    try:
        # Test if localhost is reachable
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('localhost', 5000))
        sock.close()
        
        if result == 0:
            print("SUCCESS: localhost:5000 is reachable")
        else:
            print(f"ERROR: Cannot connect to localhost:5000 (Error: {result})")
            
    except Exception as e:
        print(f"ERROR: Network test failed - {e}")
    
    # Test 2: HTTP Connection Test
    print("\n2. Testing HTTP Connection...")
    try:
        response = requests.get('http://localhost:5000/', timeout=10)
        print(f"SUCCESS: HTTP GET - Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("ERROR: Connection refused - Flask server may not be running")
    except requests.exceptions.Timeout:
        print("ERROR: Connection timeout")
    except Exception as e:
        print(f"ERROR: HTTP test failed - {e}")
    
    # Test 3: API Endpoint Tests
    print("\n3. Testing API Endpoints...")
    endpoints = [
        ('GET', '/'),
        ('POST', '/api/login'),
        ('GET', '/api/user/profile'),
        ('POST', '/api/logout')
    ]
    
    for method, endpoint in endpoints:
        try:
            if method == 'GET':
                response = requests.get(f'http://localhost:5000{endpoint}', timeout=5)
            else:
                response = requests.post(f'http://localhost:5000{endpoint}', 
                                       json={'username': 'abhinav', 'password': 'pass123'}, 
                                       timeout=5)
            
            print(f"SUCCESS: {method} {endpoint} - Status: {response.status_code}")
            
        except Exception as e:
            print(f"ERROR: {method} {endpoint} - {e}")
    
    # Test 4: CORS Headers Check
    print("\n4. Testing CORS Headers...")
    try:
        response = requests.options('http://localhost:5000/api/login', timeout=5)
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
        }
        
        print("CORS Headers:")
        for header, value in cors_headers.items():
            if value:
                print(f"  {header}: {value}")
            else:
                print(f"  {header}: NOT SET")
                
    except Exception as e:
        print(f"ERROR: CORS test failed - {e}")
    
    # Test 5: Browser Simulation Test
    print("\n5. Testing Browser Simulation...")
    try:
        # Simulate browser request with proper headers
        headers = {
            'Origin': 'http://localhost:5000',
            'Referer': 'http://localhost:5000/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        response = requests.post('http://localhost:5000/api/login',
                               headers=headers,
                               json={'username': 'abhinav', 'password': 'pass123'},
                               timeout=5)
        
        print(f"SUCCESS: Browser simulation - Status: {response.status_code}")
        print(f"Response: {response.text[:100]}...")
        
    except Exception as e:
        print(f"ERROR: Browser simulation failed - {e}")
    
    # Test 6: Port Check
    print("\n6. Testing Port Availability...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        
        # Check if port 5000 is listening
        result = sock.connect_ex(('localhost', 5000))
        if result == 0:
            print("SUCCESS: Port 5000 is open and listening")
        else:
            print(f"ERROR: Port 5000 is not accessible (Error: {result})")
            
        sock.close()
        
    except Exception as e:
        print(f"ERROR: Port test failed - {e}")
    
    # Test 7: System Network Info
    print("\n7. System Network Information...")
    try:
        print(f"Operating System: {platform.system()} {platform.release()}")
        print(f"Python Version: {platform.python_version()}")
        
        # Get local IP
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        print(f"Local IP: {local_ip}")
        print(f"Hostname: {hostname}")
        
    except Exception as e:
        print(f"ERROR: System info failed - {e}")
    
    print("\n" + "=" * 60)
    print("NETWORK DIAGNOSTIC COMPLETED")
    print("\nIf you see any ERROR messages above, those are the issues to fix.")
    print("If all tests show SUCCESS, the network connectivity is working.")

if __name__ == "__main__":
    test_network_connectivity()
