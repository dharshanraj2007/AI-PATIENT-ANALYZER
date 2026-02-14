"""
Groq AI Summarization Module
Uses Groq API with Llama 3 for EHR text summarization.
"""

import os
import json
from groq import Groq


def initialize_groq_client():
    """
    Initialize Groq client with API key from environment.
    
    Returns:
        Groq: Initialized Groq client instance
        
    Raises:
        RuntimeError: If GROQ_API_KEY is not found in environment
    """
    api_key = os.getenv('GROQ_API_KEY')
    
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY not found in environment variables. "
            "Please add it to your .env file in the backend directory."
        )
    
    try:
        client = Groq(api_key=api_key)
        return client
    except Exception as e:
        raise RuntimeError(f"Failed to initialize Groq client: {str(e)}")


def summarize_ehr_text(text: str) -> dict:
    """
    Summarize EHR text using Groq AI to extract structured medical information.
    
    Args:
        text: Raw text extracted from EHR PDF
        
    Returns:
        dict: Structured summary containing:
            - patient_demographics: name, age, gender, DOB
            - chief_complaint: primary reason for visit
            - vital_signs: temperature, BP, heart rate, oxygen saturation
            - diagnosis: medical diagnosis/assessment
            - medications: list of prescribed medications
            - allergies: list of known allergies
            - additional_notes: other relevant information
            
    Raises:
        Exception: If Groq API call fails
    """
    client = initialize_groq_client()
    
    prompt = f"""You are a medical data extraction assistant. Analyze the following Electronic Health Record (EHR) text and extract structured information.

Extract the following information in JSON format:
1. Patient Demographics (name, age, gender, date_of_birth)
2. Chief Complaint (primary reason for visit)
3. Vital Signs (temperature, blood_pressure, heart_rate, oxygen_saturation, respiratory_rate)
4. Diagnosis (medical diagnosis or assessment)
5. Medications (list of prescribed medications with dosage if available)
6. Allergies (list of known allergies)
7. Additional Notes (any other relevant medical information)

If any field is not found in the text, use "Not specified" or an empty list as appropriate.

EHR TEXT:
{text}

Respond ONLY with valid JSON in this exact format. Do NOT add any explanation, markdown, or additional text:
{{
  "patient_demographics": {{
    "name": "...",
    "age": "...",
    "gender": "...",
    "date_of_birth": "..."
  }},
  "chief_complaint": "...",
  "vital_signs": {{
    "temperature": "...",
    "blood_pressure": "...",
    "heart_rate": "...",
    "oxygen_saturation": "...",
    "respiratory_rate": "..."
  }},
  "diagnosis": "...",
  "medications": ["...", "..."],
  "allergies": ["...", "..."],
  "additional_notes": "..."
}}"""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a medical data extraction assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        try:
            summary = json.loads(response_text)
        except json.JSONDecodeError:
            raise Exception("Groq returned invalid or malformed JSON response.")
        
        return summary
        
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    try:
        client = initialize_groq_client()
        print("=" * 60)
        print("GROQ CLIENT INITIALIZATION TEST")
        print("=" * 60)
        print("\n✓ Groq client initialized successfully")
        print(f"✓ Client type: {type(client).__name__}")
        print("\n" + "=" * 60)
    except RuntimeError as e:
        print(f"✗ Initialization failed: {e}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
