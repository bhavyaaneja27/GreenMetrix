from typing import List, Dict, Any

def assess_data_quality(readings: List[Any]) -> Dict[str, Any]:
    if not readings:
        return {
            "quality_score": 100.0,
            "status": "EMPTY",
            "total_records": 0,
            "missing_records_count": 0,
            "negative_values_count": 0,
            "zero_production_count": 0,
            "outlier_count": 0,
            "warnings": []
        }

    total = len(readings)
    missing = 0
    negatives = 0
    zero_prod = 0
    outliers = 0
    warnings = []

    energies = [getattr(r, 'energy_kwh', 0.0) for r in readings if getattr(r, 'energy_kwh', None) is not None]
    avg_energy = sum(energies) / len(energies) if energies else 1.0

    for idx, r in enumerate(readings):
        energy = getattr(r, 'energy_kwh', None)
        co2 = getattr(r, 'co2_kg', None)
        prod = getattr(r, 'production_units', None)

        if energy is None or co2 is None:
            missing += 1
        if (energy is not None and energy < 0) or (co2 is not None and co2 < 0):
            negatives += 1
            warnings.append({"severity": "HIGH", "field": "energy/co2", "message": f"Negative telemetry reading detected at record #{idx}."})
        if prod is not None and prod <= 0:
            zero_prod += 1
            warnings.append({"severity": "MEDIUM", "field": "production_units", "message": f"Zero or negative production output at record #{idx}; intensity marked UNKNOWN."})
        if energy is not None and avg_energy > 0 and energy > avg_energy * 3.5:
            outliers += 1
            warnings.append({"severity": "LOW", "field": "energy_kwh", "message": f"Unusual high load spike ({energy:.1f} kWh vs {avg_energy:.1f} kWh avg) at record #{idx}."})

    penalty = (missing * 5) + (negatives * 15) + (zero_prod * 5) + (outliers * 2)
    score = max(0.0, min(100.0, round(100.0 - (penalty / max(1, total) * 100.0), 1)))
    status = "HEALTHY" if score >= 85.0 else ("WARNING" if score >= 65.0 else "CRITICAL")

    return {
        "quality_score": score,
        "status": status,
        "total_records": total,
        "missing_records_count": missing,
        "negative_values_count": negatives,
        "zero_production_count": zero_prod,
        "outlier_count": outliers,
        "warnings": warnings[:10]
    }
