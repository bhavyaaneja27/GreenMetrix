import json
from pathlib import Path
from typing import Dict, Any, List
import joblib
import numpy as np

SAVED_MODELS_DIR = Path(__file__).resolve().parent / "saved_models"

_energy_model = None
_energy_metadata = None
_anomaly_model = None

def get_energy_model():
    global _energy_model, _energy_metadata
    if _energy_model is None:
        model_path = SAVED_MODELS_DIR / "energy_model.joblib"
        meta_path = SAVED_MODELS_DIR / "metadata.json"
        if model_path.exists():
            _energy_model = joblib.load(model_path)
        if meta_path.exists():
            _energy_metadata = json.loads(meta_path.read_text(encoding="utf-8"))
    return _energy_model, _energy_metadata

def get_anomaly_model():
    global _anomaly_model
    if _anomaly_model is None:
        model_path = SAVED_MODELS_DIR / "anomaly_model.joblib"
        if model_path.exists():
            _anomaly_model = joblib.load(model_path)
    return _anomaly_model

def run_energy_prediction(features_dict: Dict[str, Any]) -> Dict[str, Any]:
    model, metadata = get_energy_model()
    if model is None:
        # Fallback heuristic calculation if model not yet loaded
        prod = features_dict.get("production_units", 4500.0)
        heuristic_energy = round(prod * 4.2, 2)
        return {
            "predicted_energy_kwh": heuristic_energy,
            "model_name": "Heuristic Industrial Energy Estimator",
            "model_version": "v0.9.0-fallback",
            "input_features": features_dict,
            "feature_importances": [
                {"feature": "production_units", "importance": 0.85},
                {"feature": "operating_hours", "importance": 0.15}
            ],
            "confidence_note": "Fallback baseline calculation."
        }

    # Features order: hour, day_of_week, month, is_weekend, ambient_temp, production_units, renewable_share, lag_1h, lag_24h, rolling_mean_24h
    hour = features_dict.get("hour", 14)
    dow = features_dict.get("day_of_week", 2)
    month = features_dict.get("month", 9)
    is_weekend = 1 if dow >= 5 else 0
    temp = features_dict.get("ambient_temp", 30.0)
    prod = features_dict.get("production_units", 4500.0)
    ren = features_dict.get("renewable_share", 25.0)
    base_prod_proxy = prod * 3.8
    lag_1h = features_dict.get("lag_1h", base_prod_proxy)
    lag_24h = features_dict.get("lag_24h", base_prod_proxy)
    roll_mean = features_dict.get("rolling_mean_24h", base_prod_proxy)

    row = np.array([[hour, dow, month, is_weekend, temp, prod, ren, lag_1h, lag_24h, roll_mean]])
    pred = float(model.predict(row)[0])
    pred = round(max(0.0, pred), 2)

    return {
        "predicted_energy_kwh": pred,
        "model_name": metadata.get("model_name", "Gradient Boosting Regressor") if metadata else "Gradient Boosting Regressor",
        "model_version": metadata.get("model_version", "v1.0.0") if metadata else "v1.0.0",
        "input_features": features_dict,
        "feature_importances": metadata.get("feature_importances", []) if metadata else [],
        "confidence_note": metadata.get("methodology", "Chronological 70/15/15 time-series split.") if metadata else "Evaluated on test data."
    }

def run_anomaly_inference(energy_kwh: float, co2_kg: float, prod: float, intensity: float, renewable_share: float) -> Dict[str, Any]:
    model = get_anomaly_model()
    int_val = intensity if intensity is not None else 2.5
    prod_val = prod if prod is not None and prod > 0 else 1.0

    if model is None:
        is_anom = energy_kwh > 35000.0
        return {
            "is_anomaly": is_anom,
            "anomaly_score": 0.85 if is_anom else 0.15,
            "severity": "HIGH" if is_anom else "LOW",
            "reason": "Unexpected energy spike - Potential anomaly requiring investigation." if is_anom else "Nominal operation",
            "model_version": "Heuristic-Rule-v1.0"
        }

    row = np.array([[energy_kwh, co2_kg, prod_val, int_val, renewable_share]])
    score = float(model.decision_function(row)[0])  # negative is anomaly
    pred = int(model.predict(row)[0])  # -1 is anomaly, 1 is normal

    is_anom = pred == -1
    normalized_score = round(float(1.0 / (1.0 + np.exp(score * 5.0))), 3)

    if not is_anom:
        severity = "LOW"
        reason = "Telemetry within normal operating range."
    else:
        if energy_kwh > 30000.0:
            severity = "HIGH"
            reason = "Unexpected energy spike - Potential anomaly requiring investigation."
        elif int_val > 5.0:
            severity = "HIGH"
            reason = "Unusual emission intensity - Potential anomaly requiring investigation."
        elif prod_val < 500 and energy_kwh > 10000:
            severity = "MEDIUM"
            reason = "Energy-production mismatch - Potential anomaly requiring investigation."
        else:
            severity = "MEDIUM"
            reason = "Multivariate deviation detected - Potential anomaly requiring investigation."

    return {
        "is_anomaly": is_anom,
        "anomaly_score": normalized_score,
        "severity": severity,
        "reason": reason,
        "model_version": "IsolationForest-v1.0"
    }
