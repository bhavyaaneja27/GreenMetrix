from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import EmissionFactor

DEFAULT_GRID_FACTOR = 0.716
DEFAULT_SOURCE = "Central Electricity Authority (CEA) Baseline Database"
DEFAULT_VERSION = "v19.0 (2024)"
DEFAULT_DATE = "2024-01-01"

def estimate_co2_from_energy(energy_kwh: float, emission_factor: Optional[float] = None, db: Optional[Session] = None) -> Dict[str, Any]:
    if energy_kwh < 0:
        raise ValueError("Energy consumption cannot be negative.")

    factor = emission_factor
    source = DEFAULT_SOURCE
    version = DEFAULT_VERSION
    date = DEFAULT_DATE

    if factor is None:
        if db:
            active_ef = db.query(EmissionFactor).filter(EmissionFactor.is_active == True).first()
            if active_ef:
                factor = active_ef.factor_value
                source = active_ef.source
                version = active_ef.version
                date = active_ef.effective_date
        if factor is None:
            factor = DEFAULT_GRID_FACTOR

    co2_kg = round(energy_kwh * factor, 2)
    return {
        "energy_kwh": energy_kwh,
        "emission_factor": factor,
        "co2_kg": co2_kg,
        "factor_source": source,
        "factor_version": version,
        "effective_date": date,
        "calculation_type": "ESTIMATED CO2"
    }
