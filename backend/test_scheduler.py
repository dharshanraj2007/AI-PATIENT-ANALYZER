"""Quick smoke test for priority_scheduler module."""
from services.priority_scheduler import (
    add_patient, get_sorted_queue, get_next_patient,
    update_waiting_times, remove_patient, get_queue_stats,
    patients_queue,
)

patients_queue.clear()

# Add 3 patients
add_patient({
    "patient_id": "PAT-101", "name": "John Doe",
    "risk_level": "High", "waiting_time": 10,
    "heart_rate": 120, "systolic_bp": 95, "o2_saturation": 90,
    "temperature": 38.5, "arrival_mode": "Ambulance", "department": "Emergency",
})
add_patient({
    "patient_id": "PAT-102", "name": "Jane Smith",
    "risk_level": "Medium", "waiting_time": 25,
    "heart_rate": 85, "systolic_bp": 130, "o2_saturation": 97,
    "temperature": 37.2, "arrival_mode": "Walk-in", "department": "Cardiology",
})
add_patient({
    "patient_id": "PAT-103", "name": "Bob Lee",
    "risk_level": "Low", "waiting_time": 40,
    "heart_rate": 72, "systolic_bp": 118, "o2_saturation": 99,
    "temperature": 36.8, "arrival_mode": "Walk-in", "department": "General Practice",
})

print("=== Initial Scores ===")
for p in get_sorted_queue():
    print("  {} ({:>6}) -> score={}, wait={}min".format(
        p["patient_id"], p["risk_level"], p["priority_score"], p["waiting_time"]))

# Age by 15 minutes
update_waiting_times(15)
print("\n=== After 15 min aging ===")
for p in get_sorted_queue():
    print("  {} ({:>6}) -> score={}, wait={}min".format(
        p["patient_id"], p["risk_level"], p["priority_score"], p["waiting_time"]))

# Next patient
nxt = get_next_patient()
print("\nNext patient: {} - {}".format(nxt["patient_id"], nxt["name"]))

# Stats
s = get_queue_stats()
print("\nQueue Stats: {} patients | High={} Med={} Low={}".format(
    s["total_patients"], s["high_risk"], s["medium_risk"], s["low_risk"]))

# Remove treated patient
removed = remove_patient("PAT-101")
print("\nRemoved: {}".format(removed["patient_id"]))
print("Queue size after removal: {}".format(len(patients_queue)))

print("\n=== Final Queue ===")
for p in get_sorted_queue():
    print("  {} ({:>6}) -> score={}, wait={}min".format(
        p["patient_id"], p["risk_level"], p["priority_score"], p["waiting_time"]))

print("\n ALL TESTS PASSED")
