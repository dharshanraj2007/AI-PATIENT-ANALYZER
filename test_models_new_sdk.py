"""Test available models with new google-genai SDK"""
import os
from dotenv import load_dotenv
from google import genai

load_dotenv('backend/.env')
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("ERROR: No API key found")
    exit(1)

print(f"API Key found: {api_key[:10]}...")

try:
    client = genai.Client(api_key=api_key)
    print("\n✓ Client initialized successfully")
    
    print("\nTesting model names:")
    print("=" * 60)
    
    test_models = [
        "gemini-1.5-flash",
        "models/gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "models/gemini-1.5-flash-latest",
        "gemini-pro",
        "models/gemini-pro"
    ]
    
    for model_name in test_models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents="Hello, respond with 'OK'"
            )
            print(f"✓ {model_name} - WORKS")
            break
        except Exception as e:
            print(f"✗ {model_name} - {str(e)[:50]}")
            
except Exception as e:
    print(f"Error: {e}")
