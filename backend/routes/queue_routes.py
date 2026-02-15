"""
Queue Routes — Flask Blueprint
================================
REST endpoints for real-time patient queue management.
Uses a shared QueueManager singleton so queue state persists
across requests within the same server process.
"""

from flask import Blueprint, request, jsonify
from services.queue_engine import QueueManager
from services.queue_engine.wait_time import estimate_wait_time

queue_bp = Blueprint("queue", __name__)

# ── Shared singleton ────────────────────────────────────────────
queue_manager = QueueManager()

DEFAULT_DOCTORS_PER_DEPT = 2
VALID_RISK_LEVELS = {"Low", "Medium", "High"}


# ── Blueprint-level error handler (catches any unhandled exception) ──
@queue_bp.errorhandler(Exception)
def handle_queue_error(e):
    """Catch-all so the queue module never crashes Flask."""
    return jsonify({"success": False, "error": f"Queue error: {str(e)}"}), 500


# ── GET /api/queue/config ────────────────────────────────────────
@queue_bp.route("/api/queue/config", methods=["GET"])
def queue_config():
    """Return queue configuration values used by the frontend."""
    try:
        return jsonify({
            "success": True,
            "avg_service_time": 5,          # minutes per patient
            "default_doctors_per_dept": DEFAULT_DOCTORS_PER_DEPT,
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ── GET /api/queue/stats ────────────────────────────────────────
@queue_bp.route("/api/queue/stats", methods=["GET"])
def queue_stats():
    """Return read-only aggregate statistics across all queues."""
    try:
        queues = queue_manager.get_all_queues()

        total_patients = 0
        high_risk_count = 0
        patients_per_department = {}
        wait_times = {}

        for dept, patients in queues.items():
            count = len(patients)
            total_patients += count
            patients_per_department[dept] = count
            high_risk_count += sum(
                1 for p in patients if p.get("risk_level") == "High"
            )
            wait_times[dept] = round(
                estimate_wait_time(count, DEFAULT_DOCTORS_PER_DEPT), 1
            )

        total_depts = len(queues)
        average_wait_time = round(
            sum(wait_times.values()) / total_depts, 1
        ) if total_depts else 0.0

        return jsonify({
            "success": True,
            "total_patients": total_patients,
            "patients_per_department": patients_per_department,
            "high_risk_count": high_risk_count,
            "average_wait_time": average_wait_time,
            "wait_times_by_department": wait_times,
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ── POST /api/queue/add ─────────────────────────────────────────
@queue_bp.route("/api/queue/add", methods=["POST"])
def add_to_queue():
    """
    Add a patient to a department queue.

    Expected JSON body:
        {
            "patient_id":  "...",
            "department":  "Emergency",
            "risk_level":  "High",
            "vitals_data": {
                "heart_rate": 130,
                "systolic_blood_pressure": 185,
                "oxygen_saturation": 89,
                "body_temperature": 39.5,
                "pain_level": 8,
                "chronic_disease_count": 2,
                "age": 72
            }
        }
    """
    try:
        body = request.get_json(silent=True)

        # ── Empty / missing body ─────────────────────────────
        if not body or not isinstance(body, dict):
            return jsonify({"success": False, "error": "Request body is empty or not valid JSON."}), 400

        # ── Missing department ───────────────────────────────
        department = body.get("department")
        if not department or not isinstance(department, str) or not department.strip():
            return jsonify({"success": False, "error": "Missing or empty 'department' field."}), 400
        department = department.strip()

        # ── Invalid department ───────────────────────────────
        if department not in QueueManager.DEPARTMENTS:
            return jsonify({
                "success": False,
                "error": f"Invalid department '{department}'. "
                         f"Valid departments: {', '.join(QueueManager.DEPARTMENTS)}",
            }), 400

        # ── Invalid risk level ───────────────────────────────
        risk_level = body.get("risk_level", "Low")
        if risk_level not in VALID_RISK_LEVELS:
            return jsonify({
                "success": False,
                "error": f"Invalid risk_level '{risk_level}'. "
                         f"Must be one of: {', '.join(sorted(VALID_RISK_LEVELS))}",
            }), 400

        # ── Merge top-level fields and nested vitals ─────────
        patient_data = {
            "patient_id": body.get("patient_id"),
            "risk_level": risk_level,
        }

        vitals = body.get("vitals_data") or {}
        if not isinstance(vitals, dict):
            return jsonify({"success": False, "error": "'vitals_data' must be a JSON object."}), 400
        patient_data.update(vitals)

        patient = queue_manager.add_patient(department, patient_data)

        return jsonify({
            "success": True,
            "patient": patient,
            "queue_length": len(queue_manager.get_queue(department)),
        })

    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ── GET /api/queue/all ──────────────────────────────────────────
@queue_bp.route("/api/queue/all", methods=["GET"])
def get_all_queues():
    """Return every department queue with patient lists."""
    try:
        queues = queue_manager.get_all_queues()

        summary = {
            dept: {"patients": patients, "count": len(patients)}
            for dept, patients in queues.items()
        }

        return jsonify({"success": True, "queues": summary})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ── GET /api/queue/<department> ─────────────────────────────────
@queue_bp.route("/api/queue/<department>", methods=["GET"])
def get_department_queue(department):
    """Return the patient queue for a single department."""
    try:
        if not department or not department.strip():
            return jsonify({"success": False, "error": "Department name cannot be empty."}), 400

        department = department.strip()

        if department not in QueueManager.DEPARTMENTS:
            return jsonify({
                "success": False,
                "error": f"Invalid department '{department}'. "
                         f"Valid departments: {', '.join(QueueManager.DEPARTMENTS)}",
            }), 400

        patients = queue_manager.get_queue(department)

        return jsonify({
            "success": True,
            "department": department,
            "patients": patients,
            "count": len(patients),
        })

    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
