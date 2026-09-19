from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Anomaly, Factory
from app.schemas.schemas import AnomalyOut

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])

@router.get("", response_model=List[AnomalyOut])
def get_all_anomalies(db: Session = Depends(get_db)):
    anomalies = db.query(Anomaly).order_by(Anomaly.timestamp.desc()).all()
    results = []
    for a in anomalies:
        factory = db.query(Factory).filter(Factory.id == a.factory_id).first()
        results.append(AnomalyOut(
            id=a.id,
            factory_id=a.factory_id,
            factory_name=factory.name if factory else "Unknown",
            timestamp=a.timestamp,
            anomaly_score=a.anomaly_score,
            severity=a.severity,
            reason=a.reason,
            metric_impacted=a.metric_impacted,
            investigation_status=a.investigation_status,
            model_version=a.model_version
        ))
    return results

@router.get("/{factory_id}", response_model=List[AnomalyOut])
def get_factory_anomalies(factory_id: int, db: Session = Depends(get_db)):
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")

    anomalies = db.query(Anomaly).filter(Anomaly.factory_id == factory_id).order_by(Anomaly.timestamp.desc()).all()
    return [
        AnomalyOut(
            id=a.id,
            factory_id=a.factory_id,
            factory_name=factory.name,
            timestamp=a.timestamp,
            anomaly_score=a.anomaly_score,
            severity=a.severity,
            reason=a.reason,
            metric_impacted=a.metric_impacted,
            investigation_status=a.investigation_status,
            model_version=a.model_version
        )
        for a in anomalies
    ]
