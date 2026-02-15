"""
Real-Time Patient Queue Manager
================================
Manages in-memory patient queues organized by hospital department.
Patients are sorted by priority score (highest first) within each queue.
"""

import uuid
from datetime import datetime, timezone

from .priority_calculator import calculate_priority


class QueueManager:
    """Manages patient queues across hospital departments."""

    DEPARTMENTS = [
        "Emergency",
        "Cardiology",
        "Internal Medicine",
        "Pulmonology",
        "General Practice",
    ]

    PRIORITY_WEIGHTS = {"High": 3, "Medium": 2, "Low": 1}

    def __init__(self):
        self.queues = {dept: [] for dept in self.DEPARTMENTS}

    # ── Public API ───────────────────────────────────────────────

    def add_patient(self, department: str, patient_data: dict) -> dict:
        """
        Add a patient to a department queue.

        Args:
            department:   Target department name.
            patient_data: Dict with at least ``risk_level``.
                          Optional keys: ``patient_id``, ``priority_score``,
                          ``arrival_time``, plus any extra fields.

        Returns:
            The patient record that was inserted (includes generated defaults).

        Raises:
            ValueError: If *department* is not a recognised queue.
        """
        if department not in self.queues:
            raise ValueError(
                f"Unknown department '{department}'. "
                f"Valid departments: {', '.join(self.DEPARTMENTS)}"
            )

        arrival_time = datetime.now(timezone.utc).isoformat()

        patient = {
            "patient_id": patient_data.get("patient_id", str(uuid.uuid4())),
            "risk_level": patient_data.get("risk_level", "Low"),
            "priority_score": calculate_priority(patient_data),
            "arrival_time": arrival_time,
        }

        # Carry over any extra keys the caller provided
        for key, value in patient_data.items():
            if key not in patient:
                patient[key] = value

        self.queues[department].append(patient)

        # Sort by priority_score DESC, then arrival_time ASC (FIFO tie-break)
        self.queues[department].sort(
            key=lambda p: (-p["priority_score"], p["arrival_time"])
        )

        return patient

    def get_queue(self, department: str) -> list:
        """
        Return the current patient list for *department*.

        Raises:
            ValueError: If *department* is not a recognised queue.
        """
        if department not in self.queues:
            raise ValueError(
                f"Unknown department '{department}'. "
                f"Valid departments: {', '.join(self.DEPARTMENTS)}"
            )
        return self.queues[department]

    def get_all_queues(self) -> dict:
        """Return every department queue with its patient list."""
        return self.queues

    # ── Internal helpers ─────────────────────────────────────────

    @classmethod
    def _calculate_priority(cls, risk_level: str) -> int:
        """Derive a default priority score from the risk label."""
        return cls.PRIORITY_WEIGHTS.get(risk_level, 1)
