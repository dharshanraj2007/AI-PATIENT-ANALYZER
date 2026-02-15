"""
MedTriage Flask API Server
===========================
Serves the frontend and provides prediction + stats endpoints.
Works with the GradientBoosting + RandomForest ensemble model.
Uses Groq AI (Llama 3) for real-time EHR summarization.
"""
import os
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── Load .env BEFORE anything else ───────────────────────────────────────────
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

import json
import tempfile
import re
import joblib
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# ── Paths ────────────────────────────────────────────────────────────────────
sys.path.insert(0, BASE_DIR)
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "FRONTEND")
MODEL_DIR = os.path.join(BASE_DIR, "models")

# ── Groq AI Summarizer ───────────────────────────────────────────────────────
from services.pdf_module import extract_text_from_pdf, GROQ_AVAILABLE
if GROQ_AVAILABLE:
    from services.pdf_module import summarize_ehr_text
    print("[OK] Groq AI summarizer loaded")
else:
    summarize_ehr_text = None
    print("[WARN] Groq not available - using rule-based EHR extraction")

# ── Load model artifacts once ────────────────────────────────────────────────
model = joblib.load(os.path.join(MODEL_DIR, "triage_model.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))

with open(os.path.join(MODEL_DIR, "model_meta.json")) as f:
    model_meta = json.load(f)

with open(os.path.join(MODEL_DIR, "dataset_stats.json")) as f:
    dataset_stats = json.load(f)

FEATURE_COLS = model_meta["feature_columns"]
RISK_LABELS = {int(k): v for k, v in model_meta["risk_labels"].items()}
RISK_COLORS = {"Low": "#10b981", "Medium": "#f59e0b", "High": "#ef4444"}


# ── Department Mapping ───────────────────────────────────────────────────────
def get_departments(risk_level, data):
    """Return department recommendations based on risk + vitals."""
    departments = []

    if risk_level == "High":
        departments.append({
            "name": "Emergency Department",
            "reason": "High-risk vitals require immediate medical attention",
            "urgency": "IMMEDIATE",
            "icon": "emergency"
        })
    if data.get("heart_rate", 0) > 100 or data.get("systolic_blood_pressure", 0) > 160:
        departments.append({
            "name": "Cardiology",
            "reason": "Elevated heart rate or blood pressure detected",
            "urgency": "URGENT" if risk_level == "High" else "SOON",
            "icon": "cardiology"
        })
    if data.get("body_temperature", 37) > 38.0:
        departments.append({
            "name": "Infectious Disease",
            "reason": "Elevated body temperature indicates possible infection",
            "urgency": "URGENT" if risk_level == "High" else "SOON",
            "icon": "infectious"
        })
    if data.get("oxygen_saturation", 100) < 92:
        departments.append({
            "name": "Pulmonology",
            "reason": "Low oxygen saturation needs respiratory evaluation",
            "urgency": "IMMEDIATE",
            "icon": "emergency"
        })
    if risk_level == "Medium":
        departments.append({
            "name": "Internal Medicine",
            "reason": "Moderate risk -- needs further evaluation",
            "urgency": "SOON",
            "icon": "internal"
        })
    if risk_level == "Low":
        departments.append({
            "name": "General Practice",
            "reason": "Low-risk -- routine evaluation recommended",
            "urgency": "NON-URGENT",
            "icon": "general"
        })

    if not departments:
        departments.append({
            "name": "General Practice",
            "reason": "Standard medical assessment",
            "urgency": "NON-URGENT",
            "icon": "general"
        })

    return departments


# ── Feature Engineering (must match training) ────────────────────────────────
def build_features(data):
    """Build the 18-feature vector matching the training pipeline."""
    age = float(data["age"])
    hr = float(data["heart_rate"])
    sbp = float(data["systolic_blood_pressure"])
    o2 = float(data["oxygen_saturation"])
    temp = float(data["body_temperature"])
    pain = float(data["pain_level"])
    chronic = float(data["chronic_disease_count"])
    er_visits = float(data["previous_er_visits"])
    arrival = data["arrival_mode"]

    # Engineered features (must match train_model.py exactly)
    age_hr_interaction = age * hr / 100
    bp_o2_ratio = sbp / (o2 + 1)
    temp_deviation = abs(temp - 37.0)
    vitals_severity = (
        (hr / 80) * 0.25 +
        (sbp / 120) * 0.2 +
        ((100 - o2) / 10) * 0.25 +
        (temp_deviation / 2) * 0.15 +
        (pain / 10) * 0.15
    )
    chronic_er_score = chronic * 0.6 + er_visits * 0.4
    age_risk = 1.5 if age > 65 else (1.3 if age < 5 else 1.0)
    combined_risk_score = vitals_severity * age_risk * (1 + chronic_er_score / 10)

    # Arrival mode one-hot (same order as training)
    arrival_ambulance = 1 if arrival == "ambulance" else 0
    arrival_walk_in = 1 if arrival == "walk_in" else 0
    arrival_wheelchair = 1 if arrival == "wheelchair" else 0

    features = [
        age, hr, sbp, o2, temp, pain, chronic, er_visits,
        age_hr_interaction, bp_o2_ratio, temp_deviation, vitals_severity,
        chronic_er_score, age_risk, combined_risk_score,
        arrival_ambulance, arrival_walk_in, arrival_wheelchair
    ]
    return np.array(features).reshape(1, -1)


# ── Queue Blueprint ──────────────────────────────────────────────────────────
from routes.queue_routes import queue_bp, queue_manager

# ── Flask App ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)
app.register_blueprint(queue_bp)


@app.route("/")
def serve_index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(FRONTEND_DIR, filename)


@app.route("/api/stats")
def stats():
    """Return dataset statistics + model info for the dashboard."""
    return jsonify({
        "total_records": dataset_stats.get("total_records", 0),
        "risk_distribution": dataset_stats.get("risk_distribution", {}),
        "triage_distribution": dataset_stats.get("triage_distribution", {}),
        "age_stats": dataset_stats.get("age_stats", {}),
        "heart_rate_stats": dataset_stats.get("heart_rate_stats", {}),
        "bp_stats": dataset_stats.get("bp_stats", {}),
        "o2_stats": dataset_stats.get("o2_stats", {}),
        "temp_stats": dataset_stats.get("temp_stats", {}),
        "pain_level_stats": dataset_stats.get("pain_level_stats", {}),
        "arrival_mode_distribution": dataset_stats.get("arrival_mode_distribution", {}),
        "model_accuracy": model_meta["accuracy"],
        "feature_importances": model_meta["feature_importances"],
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    """Predict triage risk level from patient vitals."""
    try:
        data = request.get_json()

        # Build feature vector
        X = build_features(data)
        X_scaled = scaler.transform(X)

        # Predict
        prediction = int(model.predict(X_scaled)[0])
        probabilities = model.predict_proba(X_scaled)[0]

        risk_level = RISK_LABELS[prediction]
        confidence = round(float(np.max(probabilities)) * 100, 1)

        # Confidence scores for all classes
        confidence_scores = {}
        for idx, prob in enumerate(probabilities):
            label = RISK_LABELS[idx]
            confidence_scores[label] = round(float(prob) * 100, 1)

        # Feature contributions (top 6 by importance)
        importances = model_meta.get("feature_importances", {})
        display_names = {
            "pain_level": "Pain Level",
            "vitals_severity": "Vitals Score",
            "combined_risk_score": "Risk Score",
            "body_temperature": "Temperature",
            "age_hr_interaction": "Age x HR",
            "heart_rate": "Heart Rate",
            "systolic_blood_pressure": "Blood Pressure",
            "oxygen_saturation": "O2 Saturation",
            "age": "Age",
            "chronic_disease_count": "Chronic Diseases",
            "previous_er_visits": "ER Visits",
            "bp_o2_ratio": "BP/O2 Ratio",
            "temp_deviation": "Temp Deviation",
            "chronic_er_score": "Chronic Score",
            "age_risk": "Age Risk",
            "arrival_ambulance": "Ambulance Arrival",
            "arrival_walk_in": "Walk-in Arrival",
            "arrival_wheelchair": "Wheelchair Arrival",
        }

        contributions = []
        for feat, imp in sorted(importances.items(), key=lambda x: -x[1])[:6]:
            name = display_names.get(feat, feat)
            # Get the actual value
            if feat in data:
                value = str(data[feat])
            elif feat in FEATURE_COLS:
                idx = FEATURE_COLS.index(feat)
                value = f"{X[0][idx]:.2f}"
            else:
                value = "N/A"
            contributions.append({
                "feature": name,
                "importance": round(float(imp) * 100, 1),
                "value": value
            })

        # Departments
        departments = get_departments(risk_level, data)

        response = {
            "risk_level": risk_level,
            "risk_color": RISK_COLORS[risk_level],
            "confidence": confidence,
            "confidence_scores": confidence_scores,
            "departments": departments,
            "contributions": contributions,
        }

        # ── Optional: add patient to queue after prediction ──────
        if data.get("add_to_queue") is True and departments:
            try:
                primary_dept = departments[0]["name"]
                queue_manager.add_patient(primary_dept, {
                    "patient_id": data.get("patient_id"),
                    "risk_level": risk_level,
                    **{k: data[k] for k in (
                        "age", "heart_rate", "systolic_blood_pressure",
                        "oxygen_saturation", "body_temperature",
                        "pain_level", "chronic_disease_count",
                    ) if k in data},
                })
            except Exception:
                pass  # queue insertion is best-effort; never break prediction

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/summarize-ehr", methods=["POST"])
def summarize_ehr():
    """Extract text from uploaded EHR PDF and summarize with Groq AI."""
    try:
        pdf_file = request.files.get("file")
        if not pdf_file:
            return jsonify({"success": False, "error": "No file uploaded"}), 400

        # Save to temp and extract text with pdfplumber
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            pdf_file.save(tmp.name)
            text = extract_text_from_pdf(tmp.name)
        os.unlink(tmp.name)

        if not text:
            return jsonify({"success": False, "error": "Could not extract text from PDF"})

        # ── Try Groq AI summarization (real-time LLM) ────────────
        if summarize_ehr_text:
            try:
                summary = summarize_ehr_text(text)
                return jsonify({"success": True, "summary": summary, "method": "groq-ai"})
            except Exception as groq_err:
                print(f"[WARN] Groq API failed: {groq_err}, falling back to rule-based")

        # ── Fallback: rule-based regex extraction ────────────────
        text_lower = text.lower()

        # Age
        age_match = re.search(r"(\d{1,3})\s*[-]?\s*years?\s*old", text_lower)
        age = age_match.group(1) + " years" if age_match else None

        # Gender
        gender = None
        if "female" in text_lower:
            gender = "Female"
        elif "male" in text_lower:
            gender = "Male"

        # Name
        name_match = re.search(r"(?:patient|name)\s*[:]\s*([a-zA-Z\s]+)", text, re.IGNORECASE)
        name = name_match.group(1).strip() if name_match else None

        # Vitals
        hr_match = re.search(r"(?:heart\s*rate|hr|pulse)\s*[:=]?\s*(\d{2,3})", text_lower)
        bp_match = re.search(r"(?:blood\s*pressure|bp)\s*[:=]?\s*(\d{2,3})[/]?(\d{2,3})?", text_lower)
        temp_match = re.search(r"(?:temperature|temp)\s*[:=]?\s*(\d{2,3}\.?\d*)", text_lower)
        o2_match = re.search(r"(?:oxygen|o2|spo2|saturation)\s*[:=]?\s*(\d{2,3})", text_lower)
        rr_match = re.search(r"(?:respiratory\s*rate|rr)\s*[:=]?\s*(\d{1,3})", text_lower)

        # Diagnosis
        diag_match = re.search(r"(?:diagnosis|impression|assessment)\s*[:]\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
        diagnosis = diag_match.group(1).strip() if diag_match else None

        # Complaint
        complaint_match = re.search(r"(?:chief\s*complaint|presenting|complains?\s*of)\s*[:]\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
        chief_complaint = complaint_match.group(1).strip() if complaint_match else None

        # Medications
        med_match = re.search(r"(?:medications?|meds|prescriptions?)\s*[:]\s*(.+?)(?:\n\n|\n[A-Z]|$)", text, re.IGNORECASE | re.DOTALL)
        medications = [m.strip() for m in med_match.group(1).split(",") if m.strip()] if med_match else []

        # Allergies
        allergy_match = re.search(r"(?:allergies|allergy)\s*[:]\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
        allergies = [a.strip() for a in allergy_match.group(1).split(",") if a.strip()] if allergy_match else []

        summary = {
            "patient_demographics": {
                "name": name,
                "age": age,
                "gender": gender,
                "date_of_birth": None,
            },
            "chief_complaint": chief_complaint,
            "diagnosis": diagnosis,
            "vital_signs": {
                "heart_rate": f"{hr_match.group(1)} bpm" if hr_match else None,
                "blood_pressure": f"{bp_match.group(1)}/{bp_match.group(2)} mmHg" if bp_match and bp_match.group(2) else (f"{bp_match.group(1)} mmHg" if bp_match else None),
                "temperature": f"{temp_match.group(1)} C" if temp_match else None,
                "oxygen_saturation": f"{o2_match.group(1)}%" if o2_match else None,
                "respiratory_rate": f"{rr_match.group(1)}/min" if rr_match else None,
            },
            "medications": medications,
            "allergies": allergies,
            "additional_notes": None,
        }

        return jsonify({"success": True, "summary": summary})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    print("=" * 50)
    print("  MedTriage API Server")
    print("  http://127.0.0.1:5000")
    print("=" * 50)
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False)
