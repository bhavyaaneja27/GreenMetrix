import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Factory, FactoryReading, Anomaly, Scenario, ScenarioResult
from app.reports.pdf_generator import generate_sustainability_pdf
from app.services.rating_service import evaluate_rating
from app.services.score_service import compute_composite_sustainability_score

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/{factory_id}")
def download_factory_report(factory_id: int, db: Session = Depends(get_db)):
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")

    latest = db.query(FactoryReading).filter(FactoryReading.factory_id == factory_id).order_by(FactoryReading.timestamp.desc()).first()
    readings = db.query(FactoryReading).filter(FactoryReading.factory_id == factory_id).order_by(FactoryReading.timestamp.desc()).limit(15).all()
    anomalies = db.query(Anomaly).filter(Anomaly.factory_id == factory_id).order_by(Anomaly.timestamp.desc()).all()

    intensity = latest.emission_intensity if latest else None
    rating_eval = evaluate_rating(intensity, factory.industry, db)

    base_p = latest.production_units if latest and latest.production_units else 1.0
    ee = (latest.energy_kwh / base_p) if latest else 4.0
    score_res = compute_composite_sustainability_score(
        energy_efficiency_kwh_per_unit=ee,
        emission_intensity=intensity if intensity is not None else 2.5,
        renewable_share_pct=latest.renewable_share if latest else 20.0,
        active_anomalies_count=len(anomalies),
        data_quality_pct=95.0
    )

    scen = db.query(Scenario).filter(Scenario.factory_id == factory_id).order_by(Scenario.created_at.desc()).first()
    scen_data = None
    if scen:
        scen_res = db.query(ScenarioResult).filter(ScenarioResult.scenario_id == scen.id).first()
        if scen_res:
            scen_data = {
                "baseline_energy_kwh": scen_res.baseline_energy,
                "scenario_energy_kwh": scen_res.scenario_energy,
                "baseline_co2_kg": scen_res.baseline_co2,
                "scenario_co2_kg": scen_res.scenario_co2,
                "potential_reduction_co2_kg": scen_res.potential_reduction_kg,
                "potential_reduction_pct": round((scen_res.potential_reduction_kg / max(1.0, scen_res.baseline_co2)) * 100.0, 1),
                "baseline_rating": rating_eval["rating"],
                "scenario_rating": scen_res.rating
            }

    factory_data = {
        "name": factory.name,
        "industry": factory.industry,
        "city": factory.city,
        "grid_zone": factory.grid_zone,
        "latest_energy_kwh": latest.energy_kwh if latest else 0.0,
        "latest_co2_kg": latest.co2_kg if latest else 0.0,
        "latest_production": latest.production_units if latest else 0.0,
        "latest_intensity": intensity if intensity is not None else "UNKNOWN",
        "latest_renewable_share": latest.renewable_share if latest else 0.0,
        "sustainability_rating": rating_eval["rating"]
    }

    anom_dicts = [
        {
            "timestamp": a.timestamp,
            "severity": a.severity,
            "anomaly_score": a.anomaly_score,
            "reason": a.reason
        }
        for a in anomalies
    ]

    pdf_bytes = generate_sustainability_pdf(
        factory_data=factory_data,
        readings=[],
        anomalies=anom_dicts,
        score_data=score_res,
        scenario_data=scen_data
    )

    clean_name = factory.name.replace(" ", "_").replace("-", "_")[:25]
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=GreenMetriX_{clean_name}_Report.pdf"}
    )
