from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Factory, FactoryReading, Anomaly, RatingThreshold, EmissionFactor
from app.schemas.schemas import FactoryOut, FactoryDetailOut, FactoryReadingOut
from app.services.rating_service import evaluate_rating

router = APIRouter(prefix="/api/factories", tags=["Factories"])

@router.get("", response_model=List[FactoryOut])
def list_factories(
    search: Optional[str] = None,
    industry: Optional[str] = None,
    city: Optional[str] = None,
    rating: Optional[str] = None,
    has_anomaly: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Factory)
    if search:
        query = query.filter(Factory.name.ilike(f"%{search}%"))
    if industry and industry != "All":
        query = query.filter(Factory.industry == industry)
    if city and city != "All":
        query = query.filter(Factory.city == city)

    factories = query.all()
    results = []

    for f in factories:
        latest = db.query(FactoryReading).filter(FactoryReading.factory_id == f.id).order_by(FactoryReading.timestamp.desc()).first()
        active_anom = db.query(Anomaly).filter(Anomaly.factory_id == f.id, Anomaly.investigation_status == "OPEN").first()

        intensity = latest.emission_intensity if latest else None
        rating_eval = evaluate_rating(intensity, f.industry, db)

        # Filter by rating if requested
        if rating and rating != "All" and rating_eval["rating"] != rating:
            continue

        # Filter by anomaly status if requested
        if has_anomaly is not None:
            if has_anomaly and not active_anom:
                continue
            if not has_anomaly and active_anom:
                continue

        results.append(FactoryOut(
            id=f.id,
            name=f.name,
            industry=f.industry,
            city=f.city,
            latitude=f.latitude,
            longitude=f.longitude,
            grid_zone=f.grid_zone,
            operating_hours_per_day=f.operating_hours_per_day,
            is_demo=f.is_demo,
            contact_email=f.contact_email,
            created_at=f.created_at,
            latest_energy_kwh=latest.energy_kwh if latest else None,
            latest_co2_kg=latest.co2_kg if latest else None,
            latest_production=latest.production_units if latest else None,
            latest_intensity=intensity,
            latest_renewable_share=latest.renewable_share if latest else 0.0,
            sustainability_rating=rating_eval["rating"],
            rating_reason=rating_eval["reason"],
            has_active_anomaly=active_anom is not None
        ))

    return results

@router.get("/{factory_id}", response_model=FactoryDetailOut)
def get_factory(factory_id: int, db: Session = Depends(get_db)):
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")

    readings = db.query(FactoryReading).filter(FactoryReading.factory_id == factory.id).order_by(FactoryReading.timestamp.desc()).limit(30).all()
    readings.reverse()

    latest = readings[-1] if readings else None
    active_anom = db.query(Anomaly).filter(Anomaly.factory_id == factory.id, Anomaly.investigation_status == "OPEN").first()

    intensity = latest.emission_intensity if latest else None
    rating_eval = evaluate_rating(intensity, factory.industry, db)

    thresh = db.query(RatingThreshold).filter(RatingThreshold.industry == factory.industry).first()
    ef = db.query(EmissionFactor).filter(EmissionFactor.is_active == True).first()

    return FactoryDetailOut(
        id=factory.id,
        name=factory.name,
        industry=factory.industry,
        city=factory.city,
        latitude=factory.latitude,
        longitude=factory.longitude,
        grid_zone=factory.grid_zone,
        operating_hours_per_day=factory.operating_hours_per_day,
        is_demo=factory.is_demo,
        contact_email=factory.contact_email,
        created_at=factory.created_at,
        latest_energy_kwh=latest.energy_kwh if latest else None,
        latest_co2_kg=latest.co2_kg if latest else None,
        latest_production=latest.production_units if latest else None,
        latest_intensity=intensity,
        latest_renewable_share=latest.renewable_share if latest else 0.0,
        sustainability_rating=rating_eval["rating"],
        rating_reason=rating_eval["reason"],
        has_active_anomaly=active_anom is not None,
        readings=[FactoryReadingOut.model_validate(r) for r in readings],
        threshold_source=thresh.source if thresh else "Demo thresholds - not verified industry benchmarks.",
        threshold_version=thresh.methodology_version if thresh else "v1.0",
        emission_factor_source=ef.source if ef else "CEA India Baseline v19.0",
        emission_factor_value=ef.factor_value if ef else 0.716
    )
