import requests
import json

print("Testing Groq EHR Summarization Endpoint")
print("=" * 60)

# Create simple test
url = "http://localhost:5000/api/summarize-ehr"

try:
    # Test with sample_ehr.pdf (already created)
    with open("sample_ehr.pdf", "rb") as f:
        files = {"file": f}
        print("\nSending request...")
        response = requests.post(url, files=files, timeout=30)
    
    print(f"Status Code: {response.status_code}\n")
    
    if response.status_code == 200:
        result = response.json()
        print("SUCCESS!")
        print("\nExtracted Summary:")
        print(json.dumps(result.get('summary', {}), indent=2))
    else:
        print(f"ERROR: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("ERROR: Server not running on localhost:5000")
except FileNotFoundError:
    print("ERROR: sample_ehr.pdf not found. Run test_ehr_endpoint.py first to create it.")
except Exception as e:
    print(f"ERROR: {e}")

print("\n" + "=" * 60)
