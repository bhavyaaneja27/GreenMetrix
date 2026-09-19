import json
import datetime
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest

def train_anomaly_detector():
    print("Training unsupervised Isolation Forest anomaly detector...")
    np.random.seed(42)

    # Generate synthetic training distribution representing normal industrial operations
    n_samples = 3000
    energies = np.random.normal(18000, 3500, n_samples)
    productions = np.random.normal(4500, 800, n_samples)
    renewables = np.random.uniform(10, 45, n_samples)
    co2s = energies * 0.716 * (1.0 - (renewables / 100.0 * 0.85)) + np.random.normal(0, 150, n_samples)
    intensities = co2s / productions

    X = np.column_stack([energies, co2s, productions, intensities, renewables])

    # Isolation Forest with 3.5% expected contamination
    model = IsolationForest(n_estimators=100, contamination=0.035, random_state=42)
    model.fit(X)

    # Save models
    models_dir = Path(__file__).resolve().parents[1] / "models"
    backend_models_dir = Path(__file__).resolve().parents[2] / "backend" / "app" / "ml" / "saved_models"
    models_dir.mkdir(parents=True, exist_ok=True)
    backend_models_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, models_dir / "anomaly_model.joblib")
    joblib.dump(model, backend_models_dir / "anomaly_model.joblib")

    meta = {
        "model_name": "Isolation Forest Anomaly Detector",
        "model_version": "v1.0.0",
        "features": ["energy_kwh", "co2_kg", "production_units", "emission_intensity", "renewable_share"],
        "contamination": 0.035,
        "trained_at": datetime.datetime.utcnow().isoformat(),
        "disclaimer": "Identifies potential anomalies requiring investigation. Does not diagnose machine failures without physical telemetry."
    }
    (models_dir / "anomaly_metadata.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    (backend_models_dir / "anomaly_metadata.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print("Isolation Forest trained and saved successfully.")

if __name__ == "__main__":
    train_anomaly_detector()
