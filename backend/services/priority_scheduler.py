"""
Priority Scheduler — Dynamic Weighted Priority Scheduling
==========================================================
Independent in-memory patient prioritization engine.

Uses a weighted scoring algorithm that factors in:
  • Clinical risk level
  • Real-time vital sign severity
  • Cumulative waiting time (priority aging)
  • Arrival mode urgency

The queue is fully dynamic — scores are recalculated on every
sort so that patients who have been waiting longer naturally
bubble up, preventing indefinite starvation of lower-acuity cases.

Usage:
    from services.priority_scheduler import (
        add_patient,
        get_sorted_queue,
        get_next_patient,
        update_waiting_times,
        remove_patient,
        get_queue_stats,
    )

No external dependencies. No database. No Flask coupling.
"""

from datetime import datetime, timezone
from copy import deepcopy

# ── Global In-Memory Queue ──────────────────────────────────
patients_queue: list[dict] = []

# ── Risk-level weight map ───────────────────────────────────
_RISK_WEIGHTS = {
    "High": 3,
    "Medium": 2,
    "Low": 1,
}


# ═══════════════════════════════════════════════════════════
# PRIORITY SCORE
# ═══════════════════════════════════════════════════════════
def calculate_priority_score(patient: dict) -> int:
    """Compute a dynamic priority score for a single patient.

    Scoring breakdown
    -----------------
    Base score        : risk_weight × 50   (High → 150, Medium → 100, Low → 50)
    Waiting bonus     : waiting_time × 2   (priority aging)
    Tachycardia       : +20  if heart_rate > 110
    Hypotension       : +20  if systolic_bp < 90
    Hypoxia           : +25  if o2_saturation < 92
    Fever             : +10  if temperature > 38 °C
    Ambulance arrival : +15
    Wheelchair arrival: +5

    Parameters
    ----------
    patient : dict
        Patient record with vitals and metadata.

    Returns
    -------
    int
        Total priority score (higher = more urgent).
    """
    risk_level = patient.get("risk_level", "Low")
    risk_weight = _RISK_WEIGHTS.get(risk_level, 1)

    # ── Base ────────────────────────────────────────────────
    score = risk_weight * 50

    # ── Waiting-time aging ──────────────────────────────────
    waiting_time = patient.get("waiting_time", 0)
    score += waiting_time * 2

    # ── Vitals severity ─────────────────────────────────────
    if patient.get("heart_rate", 0) > 110:
        score += 20

    if patient.get("systolic_bp", 120) < 90:
        score += 20

    if patient.get("o2_saturation", 100) < 92:
        score += 25

    if patient.get("temperature", 37.0) > 38:
        score += 10

    # ── Arrival mode ────────────────────────────────────────
    arrival = patient.get("arrival_mode", "")
    if arrival == "Ambulance":
        score += 15
    elif arrival == "Wheelchair":
        score += 5

    return score


# ═══════════════════════════════════════════════════════════
# ADD PATIENT
# ═══════════════════════════════════════════════════════════
def add_patient(patient: dict) -> dict:
    """Add a patient to the in-memory queue.

    • Calculates and attaches ``priority_score``.
    • Stamps ``arrival_timestamp`` (UTC ISO-8601) if absent.
    • Appends to the global ``patients_queue``.

    Parameters
    ----------
    patient : dict
        Patient record.  At minimum must contain ``patient_id``.

    Returns
    -------
    dict
        The patient record with ``priority_score`` and
        ``arrival_timestamp`` populated.
    """
    patient["priority_score"] = calculate_priority_score(patient)

    if "arrival_timestamp" not in patient:
        patient["arrival_timestamp"] = datetime.now(timezone.utc).isoformat()

    patients_queue.append(patient)
    return patient


# ═══════════════════════════════════════════════════════════
# SORTED QUEUE  (Dynamic Scheduling)
# ═══════════════════════════════════════════════════════════
def get_sorted_queue() -> list[dict]:
    """Return the queue sorted by dynamic priority.

    Sorting keys (descending):
      1. ``priority_score``  — recalculated live
      2. ``waiting_time``    — longer waits break ties

    Scores are recomputed on every call so that the ordering
    always reflects the latest waiting-time increments.

    Returns
    -------
    list[dict]
        Shallow copy of the queue in priority order.
    """
    # Recompute scores so aging is reflected immediately
    for p in patients_queue:
        p["priority_score"] = calculate_priority_score(p)

    return sorted(
        patients_queue,
        key=lambda p: (p.get("priority_score", 0), p.get("waiting_time", 0)),
        reverse=True,
    )


# ═══════════════════════════════════════════════════════════
# NEXT PATIENT
# ═══════════════════════════════════════════════════════════
def get_next_patient() -> dict | None:
    """Return the highest-priority patient without removing them.

    Returns
    -------
    dict or None
        Deep copy of the top patient, or ``None`` if queue is empty.
    """
    sorted_q = get_sorted_queue()
    if not sorted_q:
        return None
    return deepcopy(sorted_q[0])


# ═══════════════════════════════════════════════════════════
# UPDATE WAITING TIMES  (Priority Aging)
# ═══════════════════════════════════════════════════════════
def update_waiting_times(minutes_passed: int) -> None:
    """Increment every patient's waiting time by *minutes_passed*.

    This is the core aging mechanism — as time passes, lower-acuity
    patients gradually accumulate enough score to avoid starvation.

    Parameters
    ----------
    minutes_passed : int
        Number of minutes elapsed since the last update.
    """
    for patient in patients_queue:
        patient["waiting_time"] = patient.get("waiting_time", 0) + minutes_passed


# ═══════════════════════════════════════════════════════════
# REMOVE PATIENT
# ═══════════════════════════════════════════════════════════
def remove_patient(patient_id: str) -> dict | None:
    """Remove a patient from the queue after treatment.

    Parameters
    ----------
    patient_id : str
        The unique identifier of the patient to remove.

    Returns
    -------
    dict or None
        The removed patient record, or ``None`` if not found.
    """
    global patients_queue

    for i, patient in enumerate(patients_queue):
        if patient.get("patient_id") == patient_id:
            return patients_queue.pop(i)
    return None


# ═══════════════════════════════════════════════════════════
# QUEUE STATISTICS
# ═══════════════════════════════════════════════════════════
def get_queue_stats() -> dict:
    """Return aggregate statistics about the current queue.

    Returns
    -------
    dict
        Keys: ``total_patients``, ``high_risk``, ``medium_risk``,
        ``low_risk``, ``next_patient``.
    """
    high = sum(1 for p in patients_queue if p.get("risk_level") == "High")
    medium = sum(1 for p in patients_queue if p.get("risk_level") == "Medium")
    low = sum(1 for p in patients_queue if p.get("risk_level") == "Low")

    return {
        "total_patients": len(patients_queue),
        "high_risk": high,
        "medium_risk": medium,
        "low_risk": low,
        "next_patient": get_next_patient(),
    }
