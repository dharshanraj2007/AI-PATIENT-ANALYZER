"""
Groq AI Summarization Module
Uses Groq API with Llama 3 for EHR text summarization.
Adaptive, schema-controlled, production-ready extraction.
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
            - patient_demographics: name, age, gender, date_of_birth
            - chief_complaint: primary reason for visit
            - vital_signs: temperature, blood_pressure, heart_rate
            - allergies: known allergies
            - notes: additional relevant information
            - confidence_score: extraction confidence (0-100)
            
    Raises:
        Exception: If Groq API call fails or returns invalid JSON
    """
    client = initialize_groq_client()
    
    prompt = f"""You are a medical data extraction assistant. Your task is to extract structured information from Electronic Health Record (EHR) text.

CRITICAL INSTRUCTIONS:
1. Extract information based on MEANING, not layout or format
2. EHR formats vary significantly - be adaptive
3. Do NOT hallucinate or infer missing data
4. Do NOT include diagnosis
5. Do NOT include medications
6. Do NOT include oxygen_saturation
7. Do NOT include respiratory_rate
8. Do NOT add any extra fields beyond the schema
9. If a field is missing, use "Not specified"
10. Return ONLY valid JSON - NO markdown, NO explanations

EXTRACT ONLY THESE FIELDS:

{{
  "patient_demographics": {{
    "name": "full patient name or 'Not specified'",
    "age": "age in years or 'Not specified'",
    "gender": "male/female/other or 'Not specified'",
    "date_of_birth": "DOB or 'Not specified'"
  }},
  "chief_complaint": "primary reason for visit or 'Not specified'",
  "vital_signs": {{
    "temperature": "body temperature with unit or 'Not specified'",
    "blood_pressure": "BP reading or 'Not specified'",
    "heart_rate": "HR in bpm or 'Not specified'"
  }},
  "allergies": "known allergies or 'Not specified'",
  "notes": "any other relevant medical information or 'Not specified'"
}}

EHR TEXT:
{text}

Respond with ONLY the JSON object. No markdown code blocks. No additional text."""
    
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
        
        # Strip markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse JSON
        try:
            summary = json.loads(response_text)
        except json.JSONDecodeError:
            raise Exception("Groq returned invalid JSON format.")
        
        # Schema enforcement - remove unexpected fields
        allowed_keys = {"patient_demographics", "chief_complaint", "vital_signs", "allergies", "notes"}
        summary = {k: v for k, v in summary.items() if k in allowed_keys}
        
        # Handle additional_notes -> notes migration
        if "additional_notes" in summary:
            summary["notes"] = summary.pop("additional_notes")
        
        # Ensure patient_demographics exists and has correct fields
        if "patient_demographics" not in summary:
            summary["patient_demographics"] = {}
        
        demographics = summary["patient_demographics"]
        for field in ["name", "age", "gender", "date_of_birth"]:
            if field not in demographics:
                demographics[field] = "Not specified"
        
        # Ensure vital_signs exists and has only allowed fields
        if "vital_signs" not in summary:
            summary["vital_signs"] = {}
        
        vitals = summary["vital_signs"]
        allowed_vitals = {"temperature", "blood_pressure", "heart_rate"}
        
        # Remove disallowed vital fields
        vitals_cleaned = {k: v for k, v in vitals.items() if k in allowed_vitals}
        
        # Add missing vitals
        for field in allowed_vitals:
            if field not in vitals_cleaned:
                vitals_cleaned[field] = "Not specified"
        
        summary["vital_signs"] = vitals_cleaned
        
        # Ensure other required fields exist
        if "chief_complaint" not in summary:
            summary["chief_complaint"] = "Not specified"
        
        if "allergies" not in summary:
            summary["allergies"] = "Not specified"
        
        if "notes" not in summary:
            summary["notes"] = "Not specified"
        
        # Remove explicitly disallowed fields
        disallowed_fields = ["diagnosis", "medications", "oxygen_saturation", "respiratory_rate"]
        for field in disallowed_fields:
            summary.pop(field, None)
        
        # Calculate confidence score
        primary_fields = [
            demographics.get("name", ""),
            demographics.get("age", ""),
            demographics.get("gender", ""),
            summary.get("chief_complaint", ""),
            vitals_cleaned.get("temperature", ""),
            vitals_cleaned.get("blood_pressure", ""),
            vitals_cleaned.get("heart_rate", ""),
            summary.get("allergies", ""),
            summary.get("notes", "")
        ]
        
        filled_count = sum(1 for field in primary_fields if field and field != "Not specified")
        total_count = len(primary_fields)
        confidence_score = round((filled_count / total_count) * 100, 1)
        
        summary["confidence_score"] = confidence_score
        
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
