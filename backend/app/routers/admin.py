from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import RatingThreshold, EmissionFactor, AuditLog
from app.schemas.schemas import EmissionEstimateRequest, EmissionEstimateResponse
from app.services.co2_service import estimate_co2_from_energy

router = APIRouter(tags=["Admin & Configuration"])

class ThresholdIn(BaseModel):
    industry: str
    low_max: float
    medium_max: float
    source: Optional[str] = "Admin Configured Threshold"
    methodology_version: Optional[str] = "v1.1"

class EmissionFactorIn(BaseModel):
    name: str
    factor_value: float
    unit: Optional[str] = "kg CO2/kWh"
    source: Optional[str] = "Custom Certified Source"
    version: Optional[str] = "2026"
    effective_date: Optional[str] = "2026-01-01"

@router.get("/api/admin/thresholds")
def list_thresholds(db: Session = Depends(get_db)):
    return db.query(RatingThreshold).all()

@router.post("/api/admin/thresholds")
def update_threshold(t_in: ThresholdIn, db: Session = Depends(get_db)):
    thresh = db.query(RatingThreshold).filter(RatingThreshold.industry == t_in.industry).first()
    if thresh:
        thresh.low_max = t_in.low_max
        thresh.medium_max = t_in.medium_max
        thresh.source = t_in.source
        thresh.methodology_version = t_in.methodology_version
    else:
        thresh = RatingThreshold(
            industry=t_in.industry,
            low_max=t_in.low_max,
            medium_max=t_in.medium_max,
            source=t_in.source,
            methodology_version=t_in.methodology_version
        )
        db.add(thresh)
    db.commit()
    db.refresh(thresh)
    return thresh

@router.get("/api/admin/emission-factors")
def list_emission_factors(db: Session = Depends(get_db)):
    return db.query(EmissionFactor).all()

@router.post("/api/admin/emission-factors")
def create_emission_factor(ef_in: EmissionFactorIn, db: Session = Depends(get_db)):
    ef = EmissionFactor(
        name=ef_in.name,
        factor_value=ef_in.factor_value,
        unit=ef_in.unit,
        source=ef_in.source,
        version=ef_in.version,
        effective_date=ef_in.effective_date,
        is_active=True
    )
    db.add(ef)
    db.commit()
    db.refresh(ef)
    return ef

@router.get("/api/admin/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()

@router.post("/api/estimate/emissions", response_model=EmissionEstimateResponse)
def estimate_emissions_endpoint(req: EmissionEstimateRequest, db: Session = Depends(get_db)):
    res = estimate_co2_from_energy(req.energy_kwh, req.emission_factor, db)
    return EmissionEstimateResponse(
        energy_kwh=res["energy_kwh"],
        emission_factor=res["emission_factor"],
        co2_kg=res["co2_kg"],
        factor_source=res["factor_source"],
        factor_version=res["factor_version"],
        effective_date=res["effective_date"],
        calculation_type="ESTIMATED"
    )
