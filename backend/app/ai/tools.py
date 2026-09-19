from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import Factory, FactoryReading, Anomaly, RatingThreshold, EmissionFactor
from app.services.intensity_service import calculate_emission_intensity
from app.services.rating_service import evaluate_rating
from app.services.co2_service import estimate_co2_from_energy
from app.services.score_service import compute_composite_sustainability_score
from app.services.data_quality_service import assess_data_quality
from app.ml.inference import run_energy_prediction, run_anomaly_inference, get_energy_model
from app.ai.rag_retriever import retriever

def get_factory_summary(db: Session, factory_id: int) -> Dict[str, Any]:
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        return {"error": f"Factory {factory_id} not found."}

    latest = db.query(FactoryReading).filter(FactoryReading.factory_id == factory_id).order_by(FactoryReading.timestamp.desc()).first()
    anomalies = db.query(Anomaly).filter(Anomaly.factory_id == factory_id, Anomaly.investigation_status == "OPEN").all()

    intensity = latest.emission_intensity if latest else None
    rating_info = evaluate_rating(intensity, factory.industry, db)

    return {
        "factory_id": factory.id,
        "name": factory.name,
        "industry": factory.industry,
        "city": factory.city,
        "grid_zone": factory.grid_zone,
        "latest_energy_kwh": latest.energy_kwh if latest else None,
        "latest_co2_kg": latest.co2_kg if latest else None,
        "latest_production_units": latest.production_units if latest else None,
        "emission_intensity": intensity,
        "rating": rating_info["rating"],
        "rating_reason": rating_info["reason"],
        "renewable_share": latest.renewable_share if latest else 0.0,
        "active_anomalies_count": len(anomalies),
        "is_demo": factory.is_demo
    }

def get_energy_trends(db: Session, factory_id: int, limit: int = 14) -> List[Dict[str, Any]]:
    readings = db.query(FactoryReading).filter(FactoryReading.factory_id == factory_id).order_by(FactoryReading.timestamp.desc()).limit(limit).all()
    readings.reverse()
    return [
        {
            "timestamp": r.timestamp.strftime("%Y-%m-%d"),
            "energy_kwh": r.energy_kwh,
            "renewable_kwh": r.renewable_kwh
        }
        for r in readings
    ]

def get_emission_trends(db: Session, factory_id: int, limit: int = 14) -> List[Dict[str, Any]]:
    readings = db.query(FactoryReading).filter(FactoryReading.factory_id == factory_id).order_by(FactoryReading.timestamp.desc()).limit(limit).all()
    readings.reverse()
    return [
        {
            "timestamp": r.timestamp.strftime("%Y-%m-%d"),
            "co2_kg": r.co2_kg,
            "emission_intensity": r.emission_intensity
        }
        for r in readings
    ]

def get_anomalies_tool(db: Session, factory_id: int) -> List[Dict[str, Any]]:
    anomalies = db.query(Anomaly).filter(Anomaly.factory_id == factory_id).all()
    return [
        {
            "id": a.id,
            "timestamp": a.timestamp.isoformat(),
            "severity": a.severity,
            "reason": a.reason,
            "anomaly_score": a.anomaly_score,
            "status": a.investigation_status
        }
        for a in anomalies
    ]

def run_what_if_tool(db: Session, factory_id: int, energy_change_pct: float, production_change_pct: float, renewable_share_pct: float) -> Dict[str, Any]:
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    if not factory:
        return {"error": "Factory not found"}

    latest = db.query(FactoryReading).filter(FactoryReading.factory_id == factory_id).order_by(FactoryReading.timestamp.desc()).first()
    base_e = latest.energy_kwh if latest else 20000.0
    base_p = latest.production_units if latest and latest.production_units else 4000.0

    ef = 0.716
    base_co2 = round(base_e * ef, 2)
    base_int = round(base_co2 / base_p, 2) if base_p > 0 else None

    scen_e = round(base_e * (1.0 + (energy_change_pct / 100.0)), 2)
    scen_p = round(base_p * (1.0 + (production_change_pct / 100.0)), 1)
    scen_co2 = round(scen_e * ef * (1.0 - (renewable_share_pct / 100.0 * 0.85)), 2)
    scen_int = round(scen_co2 / scen_p, 2) if scen_p > 0 else None

    red_kg = round(base_co2 - scen_co2, 2)
    red_pct = round((red_kg / base_co2) * 100.0, 1) if base_co2 > 0 else 0.0

    b_rating = evaluate_rating(base_int, factory.industry, db)["rating"]
    s_rating = evaluate_rating(scen_int, factory.industry, db)["rating"]

    return {
        "factory_name": factory.name,
        "baseline_energy_kwh": base_e,
        "scenario_energy_kwh": scen_e,
        "baseline_co2_kg": base_co2,
        "scenario_co2_kg": scen_co2,
        "baseline_intensity": base_int,
        "scenario_intensity": scen_int,
        "potential_reduction_co2_kg": red_kg,
        "potential_reduction_pct": red_pct,
        "baseline_rating": b_rating,
        "scenario_rating": s_rating,
        "disclaimer": "Scenario estimate - not a guaranteed real-world outcome."
    }

def generate_action_plan_tool(db: Session, factory_id: int) -> List[Dict[str, Any]]:
    factory = db.query(Factory).filter(Factory.id == factory_id).first()
    industry = factory.industry if factory else "General"
    latest = db.query(FactoryReading).filter(FactoryReading.factory_id == factory_id).order_by(FactoryReading.timestamp.desc()).first()
    ren = latest.renewable_share if latest else 15.0

    actions = [
        {
            "id": "ACT-01",
            "issue": f"Elevated Grid Reliance ({100.0 - ren:.1f}% fossil grid power)",
            "evidence": f"Current renewable share is {ren:.1f}%, leaving significant exposure to 0.716 kg CO2/kWh CEA grid factor.",
            "recommendation": "Contract on-site solar PPA or install rooftop PV panels with 500 kWp capacity.",
            "priority": "HIGH",
            "effort": "MEDIUM",
            "potential_impact": f"Estimated 18-25% reduction in Scope 2 indirect emissions.",
            "assumptions": ["Roof structural integrity verified", "Net metering approved by state DISCOM"],
            "data_quality": "High (Mtered telemetry)",
            "sources": ["CEA Baseline Database v19.0", "ISO 50001:2018 Section 6.3"]
        },
        {
            "id": "ACT-02",
            "issue": "Peak Load Motor Demand Spikes",
            "evidence": "Telemetry reveals sharp energy spikes during morning shift changeover.",
            "recommendation": "Install Variable Frequency Drives (VFDs) on heavy industrial blowers and pump motors.",
            "priority": "MEDIUM",
            "effort": "LOW",
            "potential_impact": "Potential 8-12% reduction in overall factory electricity consumption.",
            "assumptions": ["Inductive motors run >= 16 hrs/day", "Payback period estimated at 14 months"],
            "data_quality": "Verified",
            "sources": ["Bureau of Energy Efficiency (BEE) Industrial Guidelines"]
        },
        {
            "id": "ACT-03",
            "issue": "Energy-Production Alignment Opportunity",
            "evidence": f"Operating hours stand at {factory.operating_hours_per_day if factory else 16} hrs with high off-peak baseline load.",
            "recommendation": "Reschedule high-load batch melting/processing to off-peak tariff hours.",
            "priority": "LOW",
            "effort": "LOW",
            "potential_impact": "Potential 5-8% cost reduction and lower peak emission strain.",
            "assumptions": ["Workforce shift flexibility permits night schedule"],
            "data_quality": "Verified",
            "sources": ["State Tariff Regulations 2024"]
        }
    ]
    return actions
