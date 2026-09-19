import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import RatingThreshold

DEFAULT_THRESHOLDS = {
    "Steel": {"low_max": 2.2, "medium_max": 5.5, "source": "Industry Demo Baseline v1.0"},
    "Metal": {"low_max": 2.0, "medium_max": 4.8, "source": "Industry Demo Baseline v1.0"},
    "Auto Parts": {"low_max": 1.5, "medium_max": 3.5, "source": "Industry Demo Baseline v1.0"},
    "Electronics": {"low_max": 1.0, "medium_max": 2.5, "source": "Industry Demo Baseline v1.0"},
    "Components": {"low_max": 1.8, "medium_max": 4.0, "source": "Industry Demo Baseline v1.0"},
    "Textile": {"low_max": 2.5, "medium_max": 6.0, "source": "Industry Demo Baseline v1.0"},
    "Chemical": {"low_max": 3.0, "medium_max": 7.0, "source": "Industry Demo Baseline v1.0"},
    "Cement": {"low_max": 4.0, "medium_max": 8.5, "source": "Industry Demo Baseline v1.0"},
}

def evaluate_rating(intensity: Optional[float], industry: str = "General", db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Evaluates sustainability rating: LOW, MEDIUM, HIGH, UNKNOWN.
    Ratings adhere strictly to configurable thresholds.
    """
    if intensity is None or intensity < 0:
        return {
            "rating": "UNKNOWN",
            "reason": "Production output is unavailable or zero.",
            "threshold_source": "Demo thresholds - not verified industry benchmarks.",
            "threshold_version": "v1.0",
            "evaluated_at": datetime.datetime.utcnow().isoformat()
        }

    low_max = 2.0
    medium_max = 5.0
    source = "Demo thresholds - not verified industry benchmarks."
    version = "v1.0"

    if db:
        thresh = db.query(RatingThreshold).filter(RatingThreshold.industry == industry, RatingThreshold.active == True).first()
        if thresh:
            low_max = thresh.low_max
            medium_max = thresh.medium_max
            source = thresh.source
            version = thresh.methodology_version
    elif industry in DEFAULT_THRESHOLDS:
        d = DEFAULT_THRESHOLDS[industry]
        low_max = d["low_max"]
        medium_max = d["medium_max"]
        source = d["source"]

    if intensity <= low_max:
        rating = "LOW"
    elif intensity <= medium_max:
        rating = "MEDIUM"
    else:
        rating = "HIGH"

    return {
        "rating": rating,
        "reason": f"Intensity {intensity:.2f} kg CO2/unit evaluated against {industry} benchmark.",
        "low_max": low_max,
        "medium_max": medium_max,
        "threshold_source": source,
        "threshold_version": version,
        "evaluated_at": datetime.datetime.utcnow().isoformat()
    }
