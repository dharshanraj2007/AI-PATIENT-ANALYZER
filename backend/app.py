"""
Medical Triage Flask API Server
================================
Serves the trained ML model for patient risk classification.
Endpoints:
  POST /api/predict        - Classify patient risk + department recommendation
  POST /api/upload-ehr     - Parse uploaded health document
  POST /api/summarize-ehr  - Summarize EHR PDF using Groq AI (Llama 3)
  GET  /api/stats          - Dataset statistics for dashboard
  GET  /api/model-info     - Model metadata and accuracy
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# PDF Module for EHR Processing
from services.pdf_module import extract_text_from_pdf, summarize_ehr_text

# --- App Setup ---
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# --- Load Model Artifacts ---
print("Loading model artifacts...")
model = joblib.load(os.path.join(MODEL_DIR, 'triage_model.pkl'))
scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))

with open(os.path.join(MODEL_DIR, 'model_meta.json'), 'r') as f:
    model_meta = json.load(f)

with open(os.path.join(MODEL_DIR, 'dataset_stats.json'), 'r') as f:
    dataset_stats = json.load(f)

FEATURE_COLS = model_meta['feature_columns']
RISK_LABELS = {0: 'Low', 1: 'Medium', 2: 'High'}
RISK_COLORS = {'Low': '#10b981', 'Medium': '#f59e0b', 'High': '#ef4444'}

print(f"Model loaded: {model_meta['model_type']}")
print(f"Accuracy: {model_meta['accuracy']*100:.2f}%")


def compute_engineered_features(data):
    """Compute the same engineered features used during training."""
    age = data.get('age', 40)
    heart_rate = data.get('heart_rate', 80)
    sbp = data.get('systolic_blood_pressure', 120)
    o2 = data.get('oxygen_saturation', 98)
    temp = data.get('body_temperature', 37.0)
    pain = data.get('pain_level', 3)
    chronic = data.get('chronic_disease_count', 0)
    er_visits = data.get('previous_er_visits', 0)
    arrival = data.get('arrival_mode', 'walk_in')

    temp_deviation = abs(temp - 37.0)
    age_hr_interaction = age * heart_rate / 100
    bp_o2_ratio = sbp / (o2 + 1)

    vitals_severity = (
        (heart_rate / 80) * 0.25 +
        (sbp / 120) * 0.2 +
        ((100 - o2) / 10) * 0.25 +
        (temp_deviation / 2) * 0.15 +
        (pain / 10) * 0.15
    )

    chronic_er_score = chronic * 0.6 + er_visits * 0.4
    age_risk = 1.5 if age > 65 else (1.3 if age < 5 else 1.0)
    combined_risk_score = vitals_severity * age_risk * (1 + chronic_er_score / 10)

    # One-hot encode arrival_mode
    arrival_ambulance = 1 if arrival == 'ambulance' else 0
    arrival_walk_in = 1 if arrival == 'walk_in' else 0
    arrival_wheelchair = 1 if arrival == 'wheelchair' else 0

    feature_values = [
        age, heart_rate, sbp, o2, temp, pain, chronic, er_visits,
        age_hr_interaction, bp_o2_ratio, temp_deviation, vitals_severity,
        chronic_er_score, age_risk, combined_risk_score,
        arrival_ambulance, arrival_walk_in, arrival_wheelchair
    ]

    return feature_values


def recommend_department(risk_level, data):
    """Rule-based department recommendation based on risk + vitals."""
    o2 = data.get('oxygen_saturation', 98)
    hr = data.get('heart_rate', 80)
    sbp = data.get('systolic_blood_pressure', 120)
    temp = data.get('body_temperature', 37.0)
    pain = data.get('pain_level', 3)
    age = data.get('age', 40)
    chronic = data.get('chronic_disease_count', 0)

    departments = []

    if risk_level == 'High':
        if o2 < 90:
            departments.append({
                'name': 'Emergency / ICU',
                'icon': 'emergency',
                'reason': f'Critical oxygen saturation ({o2}%)',
                'urgency': 'IMMEDIATE'
            })
        if hr > 120 or sbp > 160:
            departments.append({
                'name': 'Cardiology',
                'icon': 'cardiology',
                'reason': f'Elevated heart rate ({hr} bpm) / BP ({sbp} mmHg)',
                'urgency': 'URGENT'
            })
        if temp > 38.5:
            departments.append({
                'name': 'Infectious Disease',
                'icon': 'infectious',
                'reason': f'High fever ({temp}C)',
                'urgency': 'URGENT'
            })
        if not departments:
            departments.append({
                'name': 'Emergency Medicine',
                'icon': 'emergency',
                'reason': 'High overall risk score',
                'urgency': 'URGENT'
            })

    elif risk_level == 'Medium':
        if pain >= 7:
            departments.append({
                'name': 'Pain Management / Surgery',
                'icon': 'surgery',
                'reason': f'Severe pain level ({pain}/10)',
                'urgency': 'SOON'
            })
        if age > 60 and chronic >= 2:
            departments.append({
                'name': 'Internal Medicine',
                'icon': 'internal',
                'reason': f'Elderly ({age}y) with {chronic} chronic conditions',
                'urgency': 'SOON'
            })
        if hr > 100:
            departments.append({
                'name': 'Cardiology',
                'icon': 'cardiology',
                'reason': f'Tachycardia ({hr} bpm)',
                'urgency': 'MODERATE'
            })
        if temp > 38.0:
            departments.append({
                'name': 'General Medicine',
                'icon': 'general',
                'reason': f'Moderate fever ({temp}C)',
                'urgency': 'MODERATE'
            })
        if not departments:
            departments.append({
                'name': 'General Medicine',
                'icon': 'general',
                'reason': 'Moderate risk - requires monitoring',
                'urgency': 'MODERATE'
            })

    else:  # Low
        departments.append({
            'name': 'General Medicine / Outpatient',
            'icon': 'outpatient',
            'reason': 'Stable condition - routine evaluation',
            'urgency': 'NON-URGENT'
        })

    return departments


def compute_feature_contributions(data, prediction_idx):
    """Compute approximate feature contributions using feature importances."""
    importances = model_meta.get('feature_importances', {})
    raw_feature_names = [
        'age', 'heart_rate', 'systolic_blood_pressure', 'oxygen_saturation',
        'body_temperature', 'pain_level', 'chronic_disease_count',
        'previous_er_visits', 'arrival_mode'
    ]
    display_names = {
        'age': 'Age',
        'heart_rate': 'Heart Rate',
        'systolic_blood_pressure': 'Blood Pressure',
        'oxygen_saturation': 'O2 Saturation',
        'body_temperature': 'Temperature',
        'pain_level': 'Pain Level',
        'chronic_disease_count': 'Chronic Diseases',
        'previous_er_visits': 'Previous ER Visits',
        'arrival_mode': 'Arrival Mode'
    }

    # Aggregate importances from engineered features back to original
    aggregated = {}
    for feat_name, imp_val in importances.items():
        if feat_name in ['age', 'age_hr_interaction', 'age_risk']:
            aggregated['age'] = aggregated.get('age', 0) + imp_val
        elif feat_name in ['heart_rate']:
            aggregated['heart_rate'] = aggregated.get('heart_rate', 0) + imp_val
        elif feat_name in ['systolic_blood_pressure', 'bp_o2_ratio']:
            aggregated['systolic_blood_pressure'] = aggregated.get('systolic_blood_pressure', 0) + imp_val
        elif feat_name in ['oxygen_saturation']:
            aggregated['oxygen_saturation'] = aggregated.get('oxygen_saturation', 0) + imp_val
        elif feat_name in ['body_temperature', 'temp_deviation']:
            aggregated['body_temperature'] = aggregated.get('body_temperature', 0) + imp_val
        elif feat_name in ['pain_level']:
            aggregated['pain_level'] = aggregated.get('pain_level', 0) + imp_val
        elif feat_name in ['chronic_disease_count', 'chronic_er_score']:
            aggregated['chronic_disease_count'] = aggregated.get('chronic_disease_count', 0) + imp_val
        elif feat_name in ['previous_er_visits']:
            aggregated['previous_er_visits'] = aggregated.get('previous_er_visits', 0) + imp_val
        elif feat_name.startswith('arrival_'):
            aggregated['arrival_mode'] = aggregated.get('arrival_mode', 0) + imp_val
        elif feat_name in ['vitals_severity', 'combined_risk_score']:
            # Distribute composite scores across vitals
            aggregated['heart_rate'] = aggregated.get('heart_rate', 0) + imp_val * 0.25
            aggregated['systolic_blood_pressure'] = aggregated.get('systolic_blood_pressure', 0) + imp_val * 0.2
            aggregated['oxygen_saturation'] = aggregated.get('oxygen_saturation', 0) + imp_val * 0.25
            aggregated['body_temperature'] = aggregated.get('body_temperature', 0) + imp_val * 0.15
            aggregated['pain_level'] = aggregated.get('pain_level', 0) + imp_val * 0.15

    # Normalize
    total = sum(aggregated.values()) if aggregated else 1
    contributions = []
    for feat_name in raw_feature_names:
        val = aggregated.get(feat_name, 0)
        contributions.append({
            'feature': display_names.get(feat_name, feat_name),
            'importance': round(val / total * 100, 1),
            'value': data.get(feat_name, 'N/A')
        })

    contributions.sort(key=lambda x: x['importance'], reverse=True)
    return contributions


# --- API Routes ---

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict patient risk level and recommend department."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Compute features
        features = compute_engineered_features(data)
        features_array = np.array([features])
        features_scaled = scaler.transform(features_array)

        # Predict
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]

        risk_level = RISK_LABELS[prediction]
        confidence = float(np.max(probabilities))

        # Department recommendation
        departments = recommend_department(risk_level, data)

        # Feature contributions
        contributions = compute_feature_contributions(data, prediction)

        # Confidence scores per class
        confidence_scores = {
            RISK_LABELS[i]: round(float(probabilities[i]) * 100, 1)
            for i in range(len(probabilities))
        }

        return jsonify({
            'risk_level': risk_level,
            'risk_color': RISK_COLORS[risk_level],
            'confidence': round(confidence * 100, 1),
            'confidence_scores': confidence_scores,
            'departments': departments,
            'contributions': contributions,
            'patient_data': data
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/upload-ehr', methods=['POST'])
def upload_ehr():
    """Parse uploaded EHR/EMR document and extract patient data."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        filename = file.filename.lower()
        content = ''

        if filename.endswith('.txt'):
            content = file.read().decode('utf-8', errors='replace')
        elif filename.endswith('.json'):
            content = file.read().decode('utf-8', errors='replace')
            try:
                data = json.loads(content)
                # Map common field names
                mapped = {}
                field_mapping = {
                    'age': ['age', 'patient_age', 'Age'],
                    'heart_rate': ['heart_rate', 'heartrate', 'hr', 'Heart_Rate', 'pulse'],
                    'systolic_blood_pressure': ['systolic_blood_pressure', 'sbp', 'systolic', 'Blood_Pressure', 'bp'],
                    'oxygen_saturation': ['oxygen_saturation', 'o2_sat', 'spo2', 'o2'],
                    'body_temperature': ['body_temperature', 'temperature', 'temp', 'Temperature'],
                    'pain_level': ['pain_level', 'pain', 'pain_score'],
                    'chronic_disease_count': ['chronic_disease_count', 'chronic_diseases', 'pre_existing_conditions'],
                    'previous_er_visits': ['previous_er_visits', 'er_visits', 'prev_visits'],
                    'arrival_mode': ['arrival_mode', 'arrival', 'transport'],
                    'gender': ['gender', 'sex', 'Gender'],
                    'patient_id': ['patient_id', 'Patient_ID', 'id'],
                    'symptoms': ['symptoms', 'Symptoms', 'chief_complaint']
                }
                for target, sources in field_mapping.items():
                    for src in sources:
                        if src in data:
                            mapped[target] = data[src]
                            break

                return jsonify({
                    'success': True,
                    'format': 'json',
                    'extracted_data': mapped,
                    'raw_fields': list(data.keys())
                })
            except json.JSONDecodeError:
                pass

        elif filename.endswith('.pdf'):
            try:
                from PyPDF2 import PdfReader
                reader = PdfReader(file)
                content = ''
                for page in reader.pages:
                    content += page.extract_text() or ''
            except Exception:
                content = 'Could not parse PDF'

        elif filename.endswith('.csv'):
            content = file.read().decode('utf-8', errors='replace')
            try:
                import io
                csv_df = pd.read_csv(io.StringIO(content))
                if len(csv_df) > 0:
                    row = csv_df.iloc[0].to_dict()
                    return jsonify({
                        'success': True,
                        'format': 'csv',
                        'extracted_data': row,
                        'raw_fields': list(csv_df.columns),
                        'total_records': len(csv_df)
                    })
            except Exception:
                pass

        # For text-based parsing, extract numeric values
        extracted = extract_from_text(content)

        return jsonify({
            'success': True,
            'format': 'text',
            'extracted_data': extracted,
            'raw_content': content[:500]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def extract_from_text(text):
    """Extract patient data from free text."""
    import re
    extracted = {}

    patterns = {
        'age': r'(?:age|years?\s*old)\s*[:\-]?\s*(\d+)',
        'heart_rate': r'(?:heart\s*rate|hr|pulse)\s*[:\-]?\s*(\d+)',
        'systolic_blood_pressure': r'(?:systolic|sbp|blood\s*pressure|bp)\s*[:\-]?\s*(\d+)',
        'oxygen_saturation': r'(?:o2\s*sat|spo2|oxygen)\s*[:\-]?\s*(\d+\.?\d*)',
        'body_temperature': r'(?:temp|temperature)\s*[:\-]?\s*(\d+\.?\d*)',
        'pain_level': r'(?:pain|pain\s*level|pain\s*score)\s*[:\-]?\s*(\d+)',
    }

    for field, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            val = match.group(1)
            extracted[field] = float(val) if '.' in val else int(val)

    return extracted


@app.route('/api/summarize-ehr', methods=['POST'])
def summarize_ehr():
    """Summarize EHR PDF using Groq AI (Llama 3) to extract structured medical information."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        filename = file.filename.lower()

        if not filename.endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are supported'}), 400

        try:
            text = extract_text_from_pdf(file)
        except Exception as e:
            return jsonify({'error': f'PDF extraction failed: {str(e)}'}), 500

        if not text or len(text.strip()) < 10:
            return jsonify({'error': 'No text could be extracted from PDF'}), 400

        try:
            summary = summarize_ehr_text(text)
        except Exception as e:
            return jsonify({'error': f'Summarization failed: {str(e)}'}), 500

        return jsonify({
            'success': True,
            'summary': summary,
            'raw_text_length': len(text),
            'filename': file.filename
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Return dataset statistics for the dashboard."""
    return jsonify({
        **dataset_stats,
        'model_accuracy': model_meta['accuracy'],
        'model_type': model_meta['model_type'],
        'feature_importances': model_meta['feature_importances']
    })


@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """Return model metadata."""
    return jsonify(model_meta)


if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("  Medical Triage API Server")
    print("  http://localhost:5000")
    print("=" * 50)
    app.run(debug=False, host='0.0.0.0', port=5000)
