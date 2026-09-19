import datetime
import random
from sqlalchemy.orm import Session
from app.models.models import (
    User, Factory, FactoryReading, EmissionFactor, RatingThreshold,
    Anomaly, SustainabilityScore, Scenario, ScenarioResult
)
from app.utils.security import get_password_hash
from app.services.intensity_service import calculate_emission_intensity
from app.services.rating_service import evaluate_rating
from app.services.score_service import compute_composite_sustainability_score

DEMO_FACTORIES = [
    {
        "name": "Demo Steel Works - Delhi Industrial Area",
        "industry": "Steel",
        "city": "Delhi",
        "latitude": 28.6692,
        "longitude": 77.1235,
        "grid_zone": "ZONE-A",
        "operating_hours_per_day": 24.0,
        "base_energy": 28000.0,
        "base_production": 4800.0,
        "renewable_share": 14.5,
    },
    {
        "name": "Demo Metal Plant - Okhla Phase III",
        "industry": "Metal",
        "city": "Delhi",
        "latitude": 28.5355,
        "longitude": 77.2631,
        "grid_zone": "ZONE-B",
        "operating_hours_per_day": 20.0,
        "base_energy": 19500.0,
        "base_production": 4200.0,
        "renewable_share": 28.0,
    },
    {
        "name": "Demo Components - Mayapuri Industrial",
        "industry": "Components",
        "city": "Delhi",
        "latitude": 28.6289,
        "longitude": 77.1126,
        "grid_zone": "ZONE-B",
        "operating_hours_per_day": 16.0,
        "base_energy": 8400.0,
        "base_production": 5100.0,
        "renewable_share": 35.0,
    },
    {
        "name": "Demo Auto Parts - Anand Parbat",
        "industry": "Auto Parts",
        "city": "Delhi",
        "latitude": 28.6610,
        "longitude": 77.1680,
        "grid_zone": "ZONE-A",
        "operating_hours_per_day": 18.0,
        "base_energy": 12600.0,
        "base_production": 6500.0,
        "renewable_share": 22.0,
    },
    {
        "name": "Demo Electronics Plant - Patparganj",
        "industry": "Electronics",
        "city": "Delhi",
        "latitude": 28.6297,
        "longitude": 77.3025,
        "grid_zone": "ZONE-C",
        "operating_hours_per_day": 16.0,
        "base_energy": 5200.0,
        "base_production": 7800.0,
        "renewable_share": 52.0,
    },
    {
        "name": "Demo Textile Mills - Narela",
        "industry": "Textile",
        "city": "Delhi",
        "latitude": 28.8527,
        "longitude": 77.0934,
        "grid_zone": "ZONE-D",
        "operating_hours_per_day": 20.0,
        "base_energy": 15400.0,
        "base_production": 3200.0,
        "renewable_share": 18.0,
    },
    {
        "name": "Demo Chemical Corp - Wazirpur",
        "industry": "Chemical",
        "city": "Delhi",
        "latitude": 28.6980,
        "longitude": 77.1720,
        "grid_zone": "ZONE-A",
        "operating_hours_per_day": 24.0,
        "base_energy": 22000.0,
        "base_production": 2900.0,
        "renewable_share": 12.0,
    },
    {
        "name": "Demo Inactive Test Facility - Bawana",
        "industry": "Components",
        "city": "Delhi",
        "latitude": 28.7997,
        "longitude": 77.0421,
        "grid_zone": "ZONE-D",
        "operating_hours_per_day": 0.0,
        "base_energy": 1200.0,
        "base_production": 0.0,
        "renewable_share": 0.0,
    }
]

def seed_database(db: Session):
    if db.query(Factory).first():
        return

    print("Seeding GreenMetriX database with demo factories and telemetry...")

    demo_user = User(
        name="GreenMetriX Demo Admin",
        email="demo@greenmetrix.ai",
        hashed_password=get_password_hash("greenmetrix2026"),
        role="sustainability_lead",
        is_active=True
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    ef_cea = EmissionFactor(
        name="CEA India National Grid Baseline",
        factor_value=0.716,
        unit="kg CO2/kWh",
        source="Central Electricity Authority (CEA) Baseline Database v19.0",
        version="v19.0 (2024)",
        effective_date="2024-01-01",
        is_active=True
    )
    ef_solar = EmissionFactor(
        name="On-site Solar PV LCA",
        factor_value=0.041,
        unit="kg CO2/kWh",
        source="IPCC Working Group III Annex III",
        version="AR6",
        effective_date="2023-01-01",
        is_active=False
    )
    db.add_all([ef_cea, ef_solar])

    thresholds = [
        RatingThreshold(industry="Steel", low_max=2.2, medium_max=5.5, source="Demo thresholds - not verified industry benchmarks", methodology_version="v1.0"),
        RatingThreshold(industry="Metal", low_max=2.0, medium_max=4.8, source="Demo thresholds - not verified industry benchmarks", methodology_version="v1.0"),
        RatingThreshold(industry="Auto Parts", low_max=1.5, medium_max=3.5, source="Demo thresholds - not verified industry benchmarks", methodology_version="v1.0"),
        RatingThreshold(industry="Electronics", low_max=1.0, medium_max=2.5, source="Demo thresholds - not verified industry benchmarks", methodology_version="v1.0"),
        RatingThreshold(industry="Components", low_max=1.8, medium_max=4.0, source="Demo thresholds - not verified industry benchmarks", methodology_version="v1.0"),
        RatingThreshold(industry="Textile", low_max=2.5, medium_max=6.0, source="Demo thresholds - not verified industry benchmarks", methodology_version="v1.0"),
        RatingThreshold(industry="Chemical", low_max=3.0, medium_max=7.0, source="Demo thresholds - not verified industry benchmarks", methodology_version="v1.0"),
        RatingThreshold(industry="Cement", low_max=4.0, medium_max=8.5, source="Demo thresholds - not verified industry benchmarks", methodology_version="v1.0"),
    ]
    db.add_all(thresholds)
    db.commit()

    now = datetime.datetime.utcnow()
    grid_factor = 0.716

    for f_data in DEMO_FACTORIES:
        factory = Factory(
            name=f_data["name"],
            industry=f_data["industry"],
            city=f_data["city"],
            latitude=f_data["latitude"],
            longitude=f_data["longitude"],
            grid_zone=f_data["grid_zone"],
            operating_hours_per_day=f_data["operating_hours_per_day"],
            is_demo=True,
            contact_email=f"operations@{f_data['industry'].lower().replace(' ', '')}-demo.com"
        )
        db.add(factory)
        db.commit()
        db.refresh(factory)

        base_e = f_data["base_energy"]
        base_p = f_data["base_production"]
        ren_share = f_data["renewable_share"]

        for day_offset in range(30, -1, -1):
            ts = now - datetime.timedelta(days=day_offset)
            noise_e = 1.0 + random.uniform(-0.08, 0.08)
            noise_p = 1.0 + random.uniform(-0.05, 0.05) if base_p > 0 else 0.0

            if day_offset == 3 and f_data["industry"] == "Steel":
                noise_e = 1.45

            e_val = round(base_e * noise_e, 2)
            p_val = round(base_p * noise_p, 1) if base_p > 0 else 0.0
            co2_val = round(e_val * grid_factor * (1.0 - (ren_share / 100.0 * 0.85)), 2)
            ren_kwh = round(e_val * (ren_share / 100.0), 2)

            intensity, status, reason = calculate_emission_intensity(co2_val, p_val if p_val > 0 else None)

            reading = FactoryReading(
                factory_id=factory.id,
                timestamp=ts,
                energy_kwh=e_val,
                co2_kg=co2_val,
                production_units=p_val if p_val > 0 else None,
                renewable_kwh=ren_kwh,
                renewable_share=ren_share,
                emission_intensity=intensity,
                is_demo=True,
                data_status="VALID" if p_val > 0 else "ZERO_PROD"
            )
            db.add(reading)

        if f_data["industry"] in ["Steel", "Chemical", "Auto Parts"]:
            anomaly = Anomaly(
                factory_id=factory.id,
                timestamp=now - datetime.timedelta(days=3),
                anomaly_score=0.89 if f_data["industry"] == "Steel" else 0.76,
                severity="HIGH" if f_data["industry"] == "Steel" else "MEDIUM",
                reason="Unexpected energy spike - Potential anomaly requiring investigation." if f_data["industry"] == "Steel" else "Energy-production mismatch - Potential anomaly requiring investigation.",
                metric_impacted="Energy Consumption",
                investigation_status="OPEN",
                model_version="IsolationForest-v1.0"
            )
            db.add(anomaly)

        latest_p = base_p if base_p > 0 else 1.0
        ee = round(base_e / latest_p, 2)
        co2_latest = round(base_e * grid_factor * (1.0 - (ren_share / 100.0 * 0.85)), 2)
        intensity_val = round(co2_latest / latest_p, 2) if base_p > 0 else None

        score_res = compute_composite_sustainability_score(
            energy_efficiency_kwh_per_unit=ee,
            emission_intensity=intensity_val,
            renewable_share_pct=ren_share,
            active_anomalies_count=1 if f_data["industry"] in ["Steel", "Chemical"] else 0,
            data_quality_pct=96.5 if base_p > 0 else 75.0
        )

        s_score = SustainabilityScore(
            factory_id=factory.id,
            score_date=now,
            overall_score=score_res["overall_score"],
            energy_efficiency_score=score_res["energy_efficiency_score"],
            emission_intensity_score=score_res["emission_intensity_score"],
            renewable_share_score=score_res["renewable_share_score"],
            anomaly_score=score_res["anomaly_score"],
            data_quality_score=score_res["data_quality_score"],
            explanation=score_res["explanation"]
        )
        db.add(s_score)

        scenario = Scenario(
            factory_id=factory.id,
            user_id=demo_user.id,
            title="Clean Energy Transition Scenario",
            description="Simulates 10% energy efficiency improvement and +20% rooftop solar integration.",
            energy_change_pct=-10.0,
            production_change_pct=0.0,
            renewable_share_pct=min(100.0, ren_share + 20.0),
            efficiency_improvement_pct=5.0
        )
        db.add(scenario)
        db.commit()
        db.refresh(scenario)

        base_co2 = round(base_e * grid_factor, 2)
        scen_energy = round(base_e * 0.90, 2)
        scen_co2 = round(scen_energy * grid_factor * (1.0 - (min(100.0, ren_share + 20.0) / 100.0 * 0.85)), 2)
        base_int = round(base_co2 / latest_p, 2) if base_p > 0 else None
        scen_int = round(scen_co2 / latest_p, 2) if base_p > 0 else None

        scen_res = ScenarioResult(
            scenario_id=scenario.id,
            baseline_energy=base_e,
            scenario_energy=scen_energy,
            baseline_co2=base_co2,
            scenario_co2=scen_co2,
            baseline_intensity=base_int,
            scenario_intensity=scen_int,
            potential_reduction_kg=round(base_co2 - scen_co2, 2),
            rating="LOW" if scen_int and scen_int <= 2.2 else "MEDIUM"
        )
        db.add(scen_res)

    db.commit()
    print("Database seeding completed successfully!")
