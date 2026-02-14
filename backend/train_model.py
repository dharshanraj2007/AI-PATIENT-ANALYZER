"""
Medical Triage ML Model Training Pipeline
==========================================
Trains a high-accuracy model (>90%) for patient triage classification.
Maps 4-class triage (0-3) to 3-class risk (Low/Medium/High).
Uses GradientBoosting + RandomForest ensemble for maximum accuracy.
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, VotingClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import os
import json

# --- Configuration ---
DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'synthetic_medical_triage.csv')
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

# --- 1. Load & Preprocess Data ---
print("=" * 60)
print("  MEDICAL TRIAGE MODEL TRAINING PIPELINE")
print("=" * 60)

print("\n[1/5] Loading dataset...")
df = pd.read_csv(DATA_PATH)
print(f"  >> {len(df)} records loaded, {df.shape[1]} columns")
print(f"  >> Columns: {list(df.columns)}")

# --- 2. Feature Engineering ---
print("\n[2/5] Feature engineering...")

# Map 4-class triage to 3-class risk
# 0 -> Low (0), 1 -> Medium (1), 2,3 -> High (2)
df['risk_level'] = df['triage_level'].map({0: 0, 1: 1, 2: 2, 3: 2})

print("  >> Original triage distribution:")
for level, count in df['triage_level'].value_counts().sort_index().items():
    print(f"    Level {level}: {count} ({count/len(df)*100:.1f}%)")

print("\n  >> Mapped risk distribution:")
risk_names = {0: 'Low', 1: 'Medium', 2: 'High'}
for level, count in df['risk_level'].value_counts().sort_index().items():
    print(f"    {risk_names[level]} ({level}): {count} ({count/len(df)*100:.1f}%)")

# Encode arrival_mode
arrival_dummies = pd.get_dummies(df['arrival_mode'], prefix='arrival', dtype=int)
df = pd.concat([df, arrival_dummies], axis=1)

# Create interaction features to boost accuracy
df['age_hr_interaction'] = df['age'] * df['heart_rate'] / 100
df['bp_o2_ratio'] = df['systolic_blood_pressure'] / (df['oxygen_saturation'] + 1)
df['temp_deviation'] = abs(df['body_temperature'] - 37.0)
df['vitals_severity'] = (
    (df['heart_rate'] / 80) * 0.25 +
    (df['systolic_blood_pressure'] / 120) * 0.2 +
    ((100 - df['oxygen_saturation']) / 10) * 0.25 +
    (df['temp_deviation'] / 2) * 0.15 +
    (df['pain_level'] / 10) * 0.15
)
df['chronic_er_score'] = df['chronic_disease_count'] * 0.6 + df['previous_er_visits'] * 0.4
df['age_risk'] = np.where(df['age'] > 65, 1.5, np.where(df['age'] < 5, 1.3, 1.0))
df['combined_risk_score'] = df['vitals_severity'] * df['age_risk'] * (1 + df['chronic_er_score'] / 10)

# Feature columns - explicitly list arrival dummies to avoid including original string column
arrival_cols = [c for c in arrival_dummies.columns]
feature_cols = [
    'age', 'heart_rate', 'systolic_blood_pressure', 'oxygen_saturation',
    'body_temperature', 'pain_level', 'chronic_disease_count', 'previous_er_visits',
    'age_hr_interaction', 'bp_o2_ratio', 'temp_deviation', 'vitals_severity',
    'chronic_er_score', 'age_risk', 'combined_risk_score'
] + arrival_cols

print(f"  >> Total features: {len(feature_cols)}")

X = df[feature_cols].values
y = df['risk_level'].values

# --- 3. Train/Test Split ---
print("\n[3/5] Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"  >> Train: {len(X_train)} | Test: {len(X_test)}")

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# --- 4. Train Model (Ensemble for >90% accuracy) ---
print("\n[4/5] Training ensemble model...")

# GradientBoosting - strong on tabular data
gb_clf = GradientBoostingClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.9,
    min_samples_split=5,
    min_samples_leaf=3,
    random_state=42
)

# RandomForest - robust baseline
rf_clf = RandomForestClassifier(
    n_estimators=300,
    max_depth=15,
    min_samples_split=4,
    min_samples_leaf=2,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)

# Voting ensemble
ensemble = VotingClassifier(
    estimators=[('gb', gb_clf), ('rf', rf_clf)],
    voting='soft',
    weights=[2, 1]
)

print("  >> Training GradientBoosting + RandomForest ensemble...")
ensemble.fit(X_train_scaled, y_train)

# --- 5. Evaluate ---
print("\n[5/5] Evaluating model...")

y_pred = ensemble.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n{'=' * 60}")
print(f"  MODEL ACCURACY: {accuracy * 100:.2f}%")
print(f"{'=' * 60}")

print("\n  Classification Report:")
report = classification_report(y_test, y_pred, target_names=['Low', 'Medium', 'High'])
print(report)

print("  Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(f"  {cm}")

# Cross-validation
print("\n  Cross-validation (5-fold)...")
cv_scores = cross_val_score(ensemble, X_train_scaled, y_train, cv=5, scoring='accuracy')
print(f"  >> CV Accuracy: {cv_scores.mean()*100:.2f}% +/- {cv_scores.std()*100:.2f}%")

# --- 6. Get Feature Importances from GB ---
print("\n  Feature Importances (GradientBoosting):")
gb_model = ensemble.named_estimators_['gb']
importances = gb_model.feature_importances_
importance_dict = {}
for fname, imp in sorted(zip(feature_cols, importances), key=lambda x: -x[1]):
    importance_dict[fname] = float(imp)
    print(f"    {fname:30s} : {imp:.4f}")

# --- 7. Save Model Artifacts ---
print("\n  Saving model artifacts...")

joblib.dump(ensemble, os.path.join(MODEL_DIR, 'triage_model.pkl'))
joblib.dump(scaler, os.path.join(MODEL_DIR, 'scaler.pkl'))

model_meta = {
    'feature_columns': feature_cols,
    'risk_labels': {0: 'Low', 1: 'Medium', 2: 'High'},
    'accuracy': float(accuracy),
    'cv_accuracy_mean': float(cv_scores.mean()),
    'cv_accuracy_std': float(cv_scores.std()),
    'feature_importances': importance_dict,
    'training_samples': len(X_train),
    'test_samples': len(X_test),
    'model_type': 'VotingClassifier(GradientBoosting + RandomForest)'
}

with open(os.path.join(MODEL_DIR, 'model_meta.json'), 'w') as f:
    json.dump(model_meta, f, indent=2)

print(f"  >> Model saved to {os.path.join(MODEL_DIR, 'triage_model.pkl')}")
print(f"  >> Scaler saved to {os.path.join(MODEL_DIR, 'scaler.pkl')}")
print(f"  >> Metadata saved to {os.path.join(MODEL_DIR, 'model_meta.json')}")

# --- 8. Dataset Statistics for Dashboard ---
print("\n  Computing dataset statistics for dashboard...")

stats = {
    'total_records': int(len(df)),
    'risk_distribution': {
        risk_names[k]: int(v) for k, v in df['risk_level'].value_counts().sort_index().items()
    },
    'triage_distribution': {
        str(k): int(v) for k, v in df['triage_level'].value_counts().sort_index().items()
    },
    'age_stats': {
        'mean': float(df['age'].mean()),
        'min': float(df['age'].min()),
        'max': float(df['age'].max()),
        'std': float(df['age'].std())
    },
    'heart_rate_stats': {
        'mean': float(df['heart_rate'].mean()),
        'min': float(df['heart_rate'].min()),
        'max': float(df['heart_rate'].max())
    },
    'bp_stats': {
        'mean': float(df['systolic_blood_pressure'].mean()),
        'min': float(df['systolic_blood_pressure'].min()),
        'max': float(df['systolic_blood_pressure'].max())
    },
    'o2_stats': {
        'mean': float(df['oxygen_saturation'].mean()),
        'min': float(df['oxygen_saturation'].min()),
        'max': float(df['oxygen_saturation'].max())
    },
    'temp_stats': {
        'mean': float(df['body_temperature'].mean()),
        'min': float(df['body_temperature'].min()),
        'max': float(df['body_temperature'].max())
    },
    'arrival_mode_distribution': {
        str(k): int(v) for k, v in df['arrival_mode'].value_counts().items()
    },
    'pain_level_stats': {
        'mean': float(df['pain_level'].mean()),
        'min': float(df['pain_level'].min()),
        'max': float(df['pain_level'].max())
    }
}

with open(os.path.join(MODEL_DIR, 'dataset_stats.json'), 'w') as f:
    json.dump(stats, f, indent=2)

print(f"  >> Dataset stats saved to {os.path.join(MODEL_DIR, 'dataset_stats.json')}")

print(f"\n{'=' * 60}")
if accuracy >= 0.90:
    print(f"  [SUCCESS] Model accuracy {accuracy*100:.2f}% exceeds 90% target!")
else:
    print(f"  [WARNING] Model accuracy {accuracy*100:.2f}% - may need further tuning")
print(f"{'=' * 60}")
