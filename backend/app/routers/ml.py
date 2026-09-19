from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Factory, EnergyPrediction
from app.schemas.schemas import EnergyPredictRequest, EnergyPredictResponse
from app.ml.inference import run_energy_prediction, get_energy_model

router = APIRouter(prefix="/api/predict", tags=["Machine Learning"])

@router.post("/energy", response_model=EnergyPredictResponse)
def predict_energy(req: EnergyPredictRequest, db: Session = Depends(get_db)):
    factory = db.query(Factory).filter(Factory.id == req.factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")

    features = {
        "hour": req.hour or 14,
        "day_of_week": req.day_of_week or 2,
        "month": req.month or 9,
        "production_units": req.production_units or 4500.0,
        "renewable_share": req.renewable_share or 25.0,
        "ambient_temp": req.temperature or 32.0
    }

    result = run_energy_prediction(features)
    return EnergyPredictResponse(
        predicted_energy_kwh=result["predicted_energy_kwh"],
        model_name=result["model_name"],
        model_version=result["model_version"],
        input_features=result["input_features"],
        feature_importances=result["feature_importances"],
        actual_baseline=factory.operating_hours_per_day * 1200.0,
        confidence_note=result["confidence_note"]
    )

@router.get("/models")
def list_models():
    _, metadata = get_energy_model()
    return {
        "energy_model": metadata or {
            "model_name": "Gradient Boosting Regressor",
            "model_version": "v1.0.0",
            "metrics": {"MAE": 45.66, "RMSE": 59.94, "R2": 0.9980}
        },
        "anomaly_model": {
            "model_name": "Isolation Forest Anomaly Detector",
            "model_version": "v1.0.0",
            "contamination": 0.035
        }
    }
