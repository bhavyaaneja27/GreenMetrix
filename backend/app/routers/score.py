from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Factory, FactoryReading, Anomaly
from app.schemas.schemas import SustainabilityScoreResponse, ScoreWeightConfig
from app.services.score_service import compute_composite_sustainability_score

router = APIRouter(prefix="/api/sustainability-score", tags=["Sustainability Score"])

@router.get("/{factory_id}", response_model=SustainabilityScoreResponse)
def get_sustainability_score(factory_id: int, db: Session = Depends(get_db)):
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")

    latest = db.query(FactoryReading).filter(FactoryReading.factory_id == factory_id).order_by(FactoryReading.timestamp.desc()).first()
    active_anom_count = db.query(Anomaly).filter(Anomaly.factory_id == factory_id, Anomaly.investigation_status == "OPEN").count()

    base_e = latest.energy_kwh if latest else 20000.0
    base_p = latest.production_units if latest and latest.production_units else 4000.0
    intensity = latest.emission_intensity if latest else None
    ren_share = latest.renewable_share if latest else 20.0
    ee = round(base_e / (base_p if base_p > 0 else 1.0), 2)

    score_res = compute_composite_sustainability_score(
        energy_efficiency_kwh_per_unit=ee,
        emission_intensity=intensity if intensity is not None else 2.5,
        renewable_share_pct=ren_share,
        active_anomalies_count=active_anom_count,
        data_quality_pct=95.0 if base_p > 0 else 70.0
    )

    return SustainabilityScoreResponse(
        factory_id=factory.id,
        factory_name=factory.name,
        overall_score=score_res["overall_score"],
        energy_efficiency_score=score_res["energy_efficiency_score"],
        emission_intensity_score=score_res["emission_intensity_score"],
        renewable_share_score=score_res["renewable_share_score"],
        anomaly_score=score_res["anomaly_score"],
        data_quality_score=score_res["data_quality_score"],
        weights=ScoreWeightConfig(**score_res["weights"]),
        score_grade=score_res["grade"],
        explanation=score_res["explanation"],
        calculation_methodology=score_res["disclaimer"]
    )
