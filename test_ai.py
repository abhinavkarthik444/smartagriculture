#!/usr/bin/env python3
"""
Test script for AI Assistant endpoint
"""

import requests
import json

def test_ai_endpoint():
    """Test the AI Assistant endpoint with different queries"""
    
    base_url = "http://localhost:5000"
    
    test_queries = [
        "wheat",
        "rice", 
        "fertilizer",
        "weather",
        "pest control",
        "soil pH",
        "help with farming"
    ]
    
    print("Testing AI Assistant endpoint...")
    print("=" * 50)
    
    for query in test_queries:
        try:
            response = requests.post(
                f"{base_url}/api/ai/chat",
                json={"message": query},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"Query: '{query}'")
                print(f"Response: {data['response']}")
                print("-" * 30)
            else:
                print(f"Query: '{query}' - Error: {response.status_code}")
                print(f"Response: {response.text}")
                print("-" * 30)
                
        except Exception as e:
            print(f"Query: '{query}' - Exception: {str(e)}")
            print("-" * 30)
    
    print("Test completed!")

if __name__ == "__main__":
    test_ai_endpoint()
