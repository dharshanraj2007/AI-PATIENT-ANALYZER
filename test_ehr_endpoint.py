"""
Test script for EHR PDF Summarization Endpoint
Creates a sample EHR PDF and tests the /api/summarize-ehr endpoint
"""

import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

# Create a sample EHR PDF
def create_sample_ehr_pdf(filename="sample_ehr.pdf"):
    """Create a sample EHR document for testing"""
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Add EHR content
    y_position = height - 50
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y_position, "ELECTRONIC HEALTH RECORD")
    y_position -= 40
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Patient Demographics:")
    y_position -= 20
    
    c.setFont("Helvetica", 10)
    c.drawString(70, y_position, "Name: John Michael Doe")
    y_position -= 15
    c.drawString(70, y_position, "Age: 45 years")
    y_position -= 15
    c.drawString(70, y_position, "Gender: Male")
    y_position -= 15
    c.drawString(70, y_position, "Date of Birth: March 15, 1979")
    y_position -= 30
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Chief Complaint:")
    y_position -= 20
    c.setFont("Helvetica", 10)
    c.drawString(70, y_position, "Chest pain and shortness of breath for 2 hours")
    y_position -= 30
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Vital Signs:")
    y_position -= 20
    c.setFont("Helvetica", 10)
    c.drawString(70, y_position, "Temperature: 37.2°C")
    y_position -= 15
    c.drawString(70, y_position, "Blood Pressure: 145/90 mmHg")
    y_position -= 15
    c.drawString(70, y_position, "Heart Rate: 95 bpm")
    y_position -= 15
    c.drawString(70, y_position, "Oxygen Saturation: 96%")
    y_position -= 15
    c.drawString(70, y_position, "Respiratory Rate: 18 breaths/min")
    y_position -= 30
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Diagnosis:")
    y_position -= 20
    c.setFont("Helvetica", 10)
    c.drawString(70, y_position, "Suspected angina pectoris, rule out myocardial infarction")
    y_position -= 30
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Current Medications:")
    y_position -= 20
    c.setFont("Helvetica", 10)
    c.drawString(70, y_position, "1. Aspirin 81mg daily")
    y_position -= 15
    c.drawString(70, y_position, "2. Lisinopril 10mg once daily")
    y_position -= 15
    c.drawString(70, y_position, "3. Atorvastatin 20mg at bedtime")
    y_position -= 30
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Allergies:")
    y_position -= 20
    c.setFont("Helvetica", 10)
    c.drawString(70, y_position, "Penicillin (rash)")
    y_position -= 30
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Medical History:")
    y_position -= 20
    c.setFont("Helvetica", 10)
    c.drawString(70, y_position, "Hypertension (diagnosed 2015)")
    y_position -= 15
    c.drawString(70, y_position, "Hyperlipidemia (diagnosed 2017)")
    y_position -= 15
    c.drawString(70, y_position, "Type 2 Diabetes Mellitus (diagnosed 2018)")
    
    c.save()
    print(f"✓ Created sample EHR PDF: {filename}")
    return filename


def test_summarize_endpoint(pdf_path):
    """Test the /api/summarize-ehr endpoint"""
    url = "http://localhost:5000/api/summarize-ehr"
    
    print(f"\n{'='*60}")
    print("Testing /api/summarize-ehr endpoint")
    print(f"{'='*60}\n")
    
    try:
        with open(pdf_path, "rb") as f:
            files = {"file": f}
            print(f"Sending request to {url}...")
            response = requests.post(url, files=files)
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✓ SUCCESS! EHR Summary:")
            print(f"\n{'='*60}")
            
            import json
            print(json.dumps(result, indent=2))
            
            print(f"\n{'='*60}")
            print("✓ Test completed successfully!")
        else:
            print(f"\n✗ ERROR: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Could not connect to server.")
        print("Make sure the Flask server is running on http://localhost:5000")
    except FileNotFoundError:
        print(f"\n✗ ERROR: PDF file not found: {pdf_path}")
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")


if __name__ == "__main__":
    # Create sample PDF
    pdf_file = create_sample_ehr_pdf("sample_ehr.pdf")
    
    # Test the endpoint
    test_summarize_endpoint(pdf_file)
    
    print(f"\n{'='*60}")
    print("Note: Make sure you have GEMINI_API_KEY in your .env file!")
    print(f"{'='*60}\n")
