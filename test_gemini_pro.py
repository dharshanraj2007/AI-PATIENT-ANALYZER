from google import genai
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

try:
    response = client.models.generate_content(
        model="gemini-pro",
        contents="Say OK"
    )
    print("SUCCESS: gemini-pro works!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"FAILED: {e}")
