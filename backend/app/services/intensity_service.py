from typing import Optional, Tuple

INTENSITY_TOOLTIP = (
    "Emission intensity normalizes emissions by production output, "
    "allowing more meaningful comparisons between factories with different production levels."
)

def calculate_emission_intensity(co2_kg: Optional[float], production_units: Optional[float]) -> Tuple[Optional[float], str, Optional[str]]:
    if production_units is None or production_units <= 0:
        return None, "UNKNOWN", "Production output is unavailable or zero."
    if co2_kg is None or co2_kg < 0:
        return None, "UNKNOWN", "CO2 measurement is invalid or negative."
    intensity = round(co2_kg / production_units, 4)
    return intensity, "VALID", None