from typing import Dict, Any

def compute_composite_sustainability_score(
    energy_efficiency_kwh_per_unit: float,
    emission_intensity: float,
    renewable_share_pct: float,
    active_anomalies_count: int,
    data_quality_pct: float,
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    if weights is None:
        weights = {
            "energy_efficiency": 0.30,
            "emission_intensity": 0.30,
            "renewable_share": 0.20,
            "anomalies": 0.10,
            "data_quality": 0.10
        }

    norm_ee = max(0.0, min(100.0, 100.0 - ((energy_efficiency_kwh_per_unit - 1.5) / 4.5) * 100.0))
    if emission_intensity is not None and emission_intensity >= 0:
        norm_ei = max(0.0, min(100.0, 100.0 - ((emission_intensity - 1.0) / 5.0) * 100.0))
    else:
        norm_ei = 50.0

    norm_ren = max(0.0, min(100.0, renewable_share_pct))
    norm_anom = max(0.0, 100.0 - (active_anomalies_count * 25.0))
    norm_dq = max(0.0, min(100.0, data_quality_pct))

    overall = (
        norm_ee * weights["energy_efficiency"] +
        norm_ei * weights["emission_intensity"] +
        norm_ren * weights["renewable_share"] +
        norm_anom * weights["anomalies"] +
        norm_dq * weights["data_quality"]
    )
    overall = round(max(0.0, min(100.0, overall)), 1)

    if overall >= 80.0:
        grade = "EXCELLENT"
    elif overall >= 65.0:
        grade = "GOOD"
    elif overall >= 50.0:
        grade = "MODERATE"
    else:
        grade = "CRITICAL"

    explanation = (
        f"Composite Score {overall}/100 computed from: Energy Efficiency ({norm_ee:.1f}%), "
        f"Emission Intensity ({norm_ei:.1f}%), Renewable Energy Share ({norm_ren:.1f}%), "
        f"Anomaly Freedom ({norm_anom:.1f}%), and Data Verification Quality ({norm_dq:.1f}%)."
    )

    return {
        "overall_score": overall,
        "grade": grade,
        "energy_efficiency_score": round(norm_ee, 1),
        "emission_intensity_score": round(norm_ei, 1),
        "renewable_share_score": round(norm_ren, 1),
        "anomaly_score": round(norm_anom, 1),
        "data_quality_score": round(norm_dq, 1),
        "weights": weights,
        "explanation": explanation,
        "disclaimer": "GreenMetriX Composite Sustainability Score (Demo Framework)."
    }
