"""
Wait-Time Estimator
====================
Provides a simple estimate of how long a patient will wait
before being seen, based on current queue length and available doctors.

Fully independent — no Flask or model imports.
"""

AVERAGE_CONSULTATION_TIME = 10  # minutes


def estimate_wait_time(queue_length: int, doctors_available: int) -> float:
    """
    Estimate the wait time for the next patient in a queue.

    Formula
    -------
    wait_time = (queue_length × 10) / doctors_available

    Args:
        queue_length:      Number of patients currently ahead in the queue.
        doctors_available: Number of doctors serving this queue (must be ≥ 1).

    Returns:
        Estimated wait time in minutes.

    Raises:
        ValueError: If *doctors_available* is less than 1.
    """
    if doctors_available < 1:
        raise ValueError("At least one doctor must be available.")

    return (queue_length * AVERAGE_CONSULTATION_TIME) / doctors_available
