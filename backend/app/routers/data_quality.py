import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Factory, FactoryReading
from app.schemas.schemas import DataQualityResponse, QualityWarning
from app.services.data_quality_service import assess_data_quality

router = APIRouter(prefix="/api/data-quality", tags=["Data Quality"])

@router.get("/{factory_id}", response_model=DataQualityResponse)
def get_factory_data_quality(factory_id: int, db: Session = Depends(get_db)):
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")

    readings = db.query(FactoryReading).filter(FactoryReading.factory_id == factory_id).all()
    q = assess_data_quality(readings)

    return DataQualityResponse(
        factory_id=factory.id,
        factory_name=factory.name,
        quality_score=q["quality_score"],
        status=q["status"],
        total_records=q["total_records"],
        missing_records_count=q["missing_records_count"],
        negative_values_count=q["negative_values_count"],
        zero_production_count=q["zero_production_count"],
        outlier_count=q["outlier_count"],
        warnings=[QualityWarning(**w) for w in q["warnings"]],
        calculated_at=datetime.datetime.utcnow()
    )
