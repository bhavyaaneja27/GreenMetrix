from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Factory, FactoryReading, Scenario, ScenarioResult, User
from app.schemas.schemas import ScenarioSimulateRequest, ScenarioSimulateResponse
from app.services.rating_service import evaluate_rating

router = APIRouter(prefix="/api/scenarios", tags=["Digital Twin"])

@router.post("", response_model=ScenarioSimulateResponse)
def simulate_scenario(req: ScenarioSimulateRequest, db: Session = Depends(get_db)):
    factory = db.query(Factory).filter(Factory.id == req.factory_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")

    latest = db.query(FactoryReading).filter(FactoryReading.factory_id == req.factory_id).order_by(FactoryReading.timestamp.desc()).first()
    base_energy = latest.energy_kwh if latest else 20000.0
    base_prod = latest.production_units if latest and latest.production_units else 4000.0

    ef = 0.716
    base_co2 = round(base_energy * ef, 2)
    base_intensity = round(base_co2 / base_prod, 2) if base_prod > 0 else None

    # Backend mathematical calculations (do NOT let LLM calculate these)
    scenario_energy = round(base_energy * (1.0 + (req.energy_change_pct / 100.0)), 2)
    scenario_prod = round(base_prod * (1.0 + (req.production_change_pct / 100.0)), 1)
    scenario_co2 = round(scenario_energy * ef * (1.0 - (req.renewable_share_pct / 100.0 * 0.85)), 2)
    scenario_intensity = round(scenario_co2 / scenario_prod, 2) if scenario_prod > 0 else None

    reduction_kg = round(base_co2 - scenario_co2, 2)
    reduction_pct = round((reduction_kg / base_co2) * 100.0, 1) if base_co2 > 0 else 0.0
    savings_kwh = round(base_energy - scenario_energy, 2)

    base_rating = evaluate_rating(base_intensity, factory.industry, db)["rating"]
    scen_rating = evaluate_rating(scenario_intensity, factory.industry, db)["rating"]

    # Save to database
    demo_user = db.query(User).first()
    scenario = Scenario(
        factory_id=factory.id,
        user_id=demo_user.id if demo_user else None,
        title=req.title or "What-If Decarbonization Scenario",
        description=f"Energy: {req.energy_change_pct}%, Renewables: {req.renewable_share_pct}%",
        energy_change_pct=req.energy_change_pct,
        production_change_pct=req.production_change_pct,
        renewable_share_pct=req.renewable_share_pct,
        efficiency_improvement_pct=req.efficiency_improvement_pct or 0.0
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)

    res = ScenarioResult(
        scenario_id=scenario.id,
        baseline_energy=base_energy,
        scenario_energy=scenario_energy,
        baseline_co2=base_co2,
        scenario_co2=scenario_co2,
        baseline_intensity=base_intensity,
        scenario_intensity=scenario_intensity,
        potential_reduction_kg=reduction_kg,
        rating=scen_rating
    )
    db.add(res)
    db.commit()

    return ScenarioSimulateResponse(
        factory_id=factory.id,
        factory_name=factory.name,
        baseline={
            "energy_kwh": base_energy,
            "co2_kg": base_co2,
            "production_units": base_prod,
            "emission_intensity": base_intensity,
            "renewable_share": latest.renewable_share if latest else 15.0
        },
        scenario={
            "energy_kwh": scenario_energy,
            "co2_kg": scenario_co2,
            "production_units": scenario_prod,
            "emission_intensity": scenario_intensity,
            "renewable_share": req.renewable_share_pct
        },
        potential_reduction_co2_kg=reduction_kg,
        potential_reduction_pct=reduction_pct,
        energy_savings_kwh=savings_kwh,
        baseline_rating=base_rating,
        scenario_rating=scen_rating,
        disclaimer="Scenario estimate - not a guaranteed real-world outcome."
    )

@router.get("/{factory_id}")
def get_factory_scenarios(factory_id: int, db: Session = Depends(get_db)):
    scenarios = db.query(Scenario).filter(Scenario.factory_id == factory_id).order_by(Scenario.created_at.desc()).limit(10).all()
    results = []
    for s in scenarios:
        r = db.query(ScenarioResult).filter(ScenarioResult.scenario_id == s.id).first()
        results.append({
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at.isoformat(),
            "energy_change_pct": s.energy_change_pct,
            "renewable_share_pct": s.renewable_share_pct,
            "potential_reduction_kg": r.potential_reduction_kg if r else 0.0,
            "scenario_rating": r.rating if r else "MEDIUM"
        })
    return results
