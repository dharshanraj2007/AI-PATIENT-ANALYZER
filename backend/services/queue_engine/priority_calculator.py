"""
Priority Calculator
====================
Computes a numeric priority score for a patient based on
risk level, pain, chronic conditions, and oxygen saturation.

Fully independent — no model or training imports required.
"""


# ── Base scores by risk level ────────────────────────────────
_RISK_BASE = {
    "High": 100,
    "Medium": 60,
    "Low": 20,
}


def calculate_deterioration_risk(patient_data: dict) -> int:
    """
    Estimate additional risk points based on vital-sign thresholds
    that indicate possible clinical deterioration.

    Scoring rules
    -------------
    +20  if oxygen_saturation < 92
    +15  if heart_rate > 120
    +15  if systolic_bp > 180 or < 90
    +10  if temperature > 39
    + 5  if age > 65

    Args:
        patient_data: Dict with optional vitals / demographics.

    Returns:
        Cumulative deterioration risk score (0 when no flags are triggered).
    """
    score = 0

    if float(patient_data.get("oxygen_saturation", 100)) < 92:
        score += 20

    if float(patient_data.get("heart_rate", 0)) > 120:
        score += 15

    systolic_bp = float(patient_data.get("systolic_blood_pressure", 120))
    if systolic_bp > 180 or systolic_bp < 90:
        score += 15

    if float(patient_data.get("body_temperature", 37)) > 39:
        score += 10

    if float(patient_data.get("age", 0)) > 65:
        score += 5

    return score


def calculate_priority(patient_data: dict) -> float:
    """
    Derive an overall priority score from patient data.

    Scoring formula
    ---------------
    base (risk_level)
      + pain_level            × 2
      + chronic_disease_count  × 3
      + (100 − oxygen_saturation)
      + deterioration_risk

    Args:
        patient_data: Dict containing at least ``risk_level``.
                      Optional keys used for bonus scoring:
                      ``pain_level``, ``chronic_disease_count``,
                      ``oxygen_saturation``, ``heart_rate``,
                      ``systolic_blood_pressure``, ``body_temperature``,
                      ``age``.

    Returns:
        Final priority score as a float (higher = more urgent).
    """
    risk_level = patient_data.get("risk_level", "Low")
    base_score = _RISK_BASE.get(risk_level, 20)

    pain_bonus = float(patient_data.get("pain_level", 0)) * 2
    chronic_bonus = float(patient_data.get("chronic_disease_count", 0)) * 3
    o2_bonus = 100 - float(patient_data.get("oxygen_saturation", 100))
    deterioration = calculate_deterioration_risk(patient_data)

    return base_score + pain_bonus + chronic_bonus + o2_bonus + deterioration
