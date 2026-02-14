"""
List all available Gemini models for your API key
"""
from google import genai
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: No API key found")
    exit(1)

print("Testing Gemini API models...")
print("=" * 60)

client = genai.Client(api_key=api_key)

# Test specific model names
test_models = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.0-pro",
    "gemini-1.0-pro-001",
]

working_models = []

for model_name in test_models:
    try:
        print(f"\nTesting: {model_name}...", end=" ")
        response = client.models.generate_content(
            model=model_name,
            contents="Say OK"
        )
        print("WORKS!")
        working_models.append(model_name)
    except Exception as e:
        error_str = str(e)
        if "404" in error_str:
            print("404 NOT FOUND")
        elif "403" in error_str:
            print("403 FORBIDDEN")
        else:
            print(f"ERROR: {error_str[:40]}")

print("\n" + "=" * 60)
if working_models:
    print(f"\nWORKING MODELS ({len(working_models)}):")
    for model in working_models:
        print(f"  - {model}")
else:
    print("\nNO WORKING MODELS FOUND")
    print("Your API key may not have Gemini API access enabled.")
print("=" * 60)
