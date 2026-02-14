"""
Test script to list available Gemini models
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment
load_dotenv('backend/.env')
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("ERROR: No API key found")
    exit(1)

print(f"API Key found: {api_key[:10]}...")

# Configure
genai.configure(api_key=api_key)

print("\nListing available models:")
print("=" * 60)

try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✓ {model.name}")
except Exception as e:
    print(f"Error: {e}")
