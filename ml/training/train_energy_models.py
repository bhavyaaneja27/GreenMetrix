import json
import datetime
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import xgboost as xgb

import sys
sys.path.append(str(Path(__file__).resolve().parents[2]))
from ml.data.dataset_loader import generate_industrial_time_series, chronological_split

FEATURES = [
    "hour", "day_of_week", "month", "is_weekend",
    "ambient_temp", "production_units", "renewable_share",
    "lag_1h", "lag_24h", "rolling_mean_24h"
]
TARGET = "energy_kwh"

def evaluate_predictions(y_true, y_pred):
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    return {"MAE": round(mae, 2), "RMSE": round(rmse, 2), "R2": round(r2, 4)}

def train_and_select_best():
    print("Generating industrial dataset with chronological time-series...")
    df = generate_industrial_time_series(n_days=180)
    train_df, val_df, test_df = chronological_split(df)

    X_train, y_train = train_df[FEATURES], train_df[TARGET]
    X_val, y_val = val_df[FEATURES], val_df[TARGET]
    X_test, y_test = test_df[FEATURES], test_df[TARGET]

    print(f"Dataset split: Train={len(train_df)}, Val={len(val_df)}, Test={len(test_df)}")

    # 1. Persistence Baseline (lag_1h)
    y_val_persist = val_df["lag_1h"]
    metrics_persist = evaluate_predictions(y_val, y_val_persist)
    print(f"1. Persistence Baseline: {metrics_persist}")

    # 2. Random Forest
    rf = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    metrics_rf = evaluate_predictions(y_val, rf.predict(X_val))
    print(f"2. Random Forest Regressor: {metrics_rf}")

    # 3. Gradient Boosting
    gbm = GradientBoostingRegressor(n_estimators=120, max_depth=5, learning_rate=0.08, random_state=42)
    gbm.fit(X_train, y_train)
    metrics_gbm = evaluate_predictions(y_val, gbm.predict(X_val))
    print(f"3. Gradient Boosting Regressor: {metrics_gbm}")

    # 4. XGBoost Regressor
    xgb_model = xgb.XGBRegressor(n_estimators=150, max_depth=6, learning_rate=0.07, random_state=42, n_jobs=-1)
    xgb_model.fit(X_train, y_train)
    metrics_xgb = evaluate_predictions(y_val, xgb_model.predict(X_val))
    print(f"4. XGBoost Regressor: {metrics_xgb}")

    # Model selection based on Validation RMSE
    candidates = {
        "Random Forest": (rf, metrics_rf),
        "Gradient Boosting": (gbm, metrics_gbm),
        "XGBoost": (xgb_model, metrics_xgb)
    }

    best_name = min(candidates.keys(), key=lambda k: candidates[k][1]["RMSE"])
    best_model, best_val_metrics = candidates[best_name]
    print(f"\nSelected Best Model on Validation Set: {best_name} (RMSE: {best_val_metrics['RMSE']})")

    # Final evaluation ONCE on unseen Test Set
    test_metrics = evaluate_predictions(y_test, best_model.predict(X_test))
    print(f"Final Test Evaluation: {test_metrics}")

    # Extract Feature Importances
    importances = best_model.feature_importances_
    feature_imp = [
        {"feature": feat, "importance": round(float(imp), 4)}
        for feat, imp in sorted(zip(FEATURES, importances), key=lambda x: x[1], reverse=True)
    ]
    print("\nFeature Importances:")
    for item in feature_imp:
        print(f" - {item['feature']}: {item['importance']}")

    # Save to disk
    models_dir = Path(__file__).resolve().parents[1] / "models"
    backend_models_dir = Path(__file__).resolve().parents[2] / "backend" / "app" / "ml" / "saved_models"
    models_dir.mkdir(parents=True, exist_ok=True)
    backend_models_dir.mkdir(parents=True, exist_ok=True)

    model_path = models_dir / "energy_model.joblib"
    backend_path = backend_models_dir / "energy_model.joblib"
    joblib.dump(best_model, model_path)
    joblib.dump(best_model, backend_path)

    metadata = {
        "model_name": f"{best_name} Regressor",
        "model_version": "v1.0.0",
        "dataset_version": "Synthetic Industrial Dynamics v1.0 (UCI Steel Benchmark Derived)",
        "training_date": datetime.datetime.utcnow().isoformat(),
        "features": FEATURES,
        "validation_metrics": best_val_metrics,
        "test_metrics": test_metrics,
        "feature_importances": feature_imp,
        "methodology": "Chronological 70/15/15 time-series split (Strictly no target/future leakage)"
    }

    (models_dir / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    (backend_models_dir / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"\nModel saved successfully to:\n - {model_path}\n - {backend_path}")

if __name__ == "__main__":
    train_and_select_best()
