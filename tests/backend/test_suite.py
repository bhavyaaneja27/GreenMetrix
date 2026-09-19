import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.utils.seed_data import seed_database
from app.services.intensity_service import calculate_emission_intensity
from app.services.rating_service import evaluate_rating
from app.services.co2_service import estimate_co2_from_energy
from app.services.score_service import compute_composite_sustainability_score
from app.services.data_quality_service import assess_data_quality
from app.ml.inference import run_energy_prediction, run_anomaly_inference
from app.reports.pdf_generator import generate_sustainability_pdf

# Ensure database tables and demo seed are present in test environment
Base.metadata.create_all(bind=engine)
_db = SessionLocal()
seed_database(_db)
_db.close()

client = TestClient(app)

# 1. API Health Test
def test_api_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "GreenMetriX API"

# 2. Authentication Tests
def test_demo_login():
    res = client.post("/api/auth/login", json={"email": "demo@greenmetrix.ai", "password": "greenmetrix2026"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@greenmetrix.ai"

def test_invalid_login():
    res = client.post("/api/auth/login", json={"email": "wrong@greenmetrix.ai", "password": "wrongpassword"})
    assert res.status_code == 401

def test_register_and_me():
    reg_res = client.post("/api/auth/register", json={
        "name": "Audit Officer",
        "email": "auditor_test@greenmetrix.ai",
        "password": "auditpassword2026",
        "role": "auditor"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "auditor_test@greenmetrix.ai"

# 3. Factories and Map API
def test_factories_list():
    res = client.get("/api/factories")
    assert res.status_code == 200
    factories = res.json()
    assert len(factories) >= 8

def test_factory_details():
    res = client.get("/api/factories/1")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 1
    assert "readings" in data
    assert len(data["readings"]) > 0

def test_map_endpoints():
    f_res = client.get("/api/map/factories")
    assert f_res.status_code == 200
    assert len(f_res.json()) >= 8

    sum_res = client.get("/api/map/summary")
    assert sum_res.status_code == 200
    assert sum_res.json()["current_load_co2_kg"] == 1284.6
    assert sum_res.json()["sustainability_score"] == 82

# 4. Intensity & Zero Production Handling
def test_zero_production_returns_unknown():
    intensity, status, reason = calculate_emission_intensity(co2_kg=500.0, production_units=0.0)
    assert intensity is None
    assert status == "UNKNOWN"
    assert reason == "Production output is unavailable or zero."

def test_missing_production_returns_unknown():
    intensity, status, reason = calculate_emission_intensity(co2_kg=500.0, production_units=None)
    assert intensity is None
    assert status == "UNKNOWN"
    assert reason == "Production output is unavailable or zero."

def test_negative_energy_rejected():
    with pytest.raises(ValueError):
        estimate_co2_from_energy(energy_kwh=-150.0)

def test_intensity_calculation():
    intensity, status, reason = calculate_emission_intensity(co2_kg=1000.0, production_units=500.0)
    assert intensity == 2.0
    assert status == "VALID"
    assert reason is None

# 5. Rating Engine Tests
def test_low_rating():
    rating_res = evaluate_rating(intensity=1.2, industry="General")
    assert rating_res["rating"] == "LOW"

def test_medium_rating():
    rating_res = evaluate_rating(intensity=3.5, industry="General")
    assert rating_res["rating"] == "MEDIUM"

def test_high_rating():
    rating_res = evaluate_rating(intensity=6.8, industry="General")
    assert rating_res["rating"] == "HIGH"

# 6. CO2 Estimation Test
def test_co2_estimation():
    res = estimate_co2_from_energy(energy_kwh=1000.0, emission_factor=0.7)
    assert res["co2_kg"] == 700.0
    assert res["calculation_type"] == "ESTIMATED CO2"

# 7. Machine Learning Prediction & Feature Importance
def test_ml_prediction():
    pred_res = run_energy_prediction({"production_units": 4000.0, "hour": 14})
    assert "predicted_energy_kwh" in pred_res
    assert pred_res["predicted_energy_kwh"] > 0
    assert "feature_importances" in pred_res
    assert len(pred_res["feature_importances"]) > 0

# 8. Anomaly Detection Test
def test_anomaly_detection():
    normal = run_anomaly_inference(18000.0, 12000.0, 4500.0, 2.6, 25.0)
    assert "anomaly_score" in normal
    spike = run_anomaly_inference(45000.0, 32000.0, 1000.0, 32.0, 5.0)
    assert spike["severity"] in ["HIGH", "MEDIUM"]
    assert "Potential anomaly requiring investigation." in spike["reason"]

# 9. Digital Twin Simulation Test
def test_digital_twin_simulation():
    res = client.post("/api/scenarios", json={
        "factory_id": 1,
        "energy_change_pct": -10.0,
        "production_change_pct": 0.0,
        "renewable_share_pct": 35.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["potential_reduction_co2_kg"] > 0
    assert "disclaimer" in data

# 10. AI Copilot Chat Test
def test_ai_copilot_chat():
    res = client.post("/api/assistant/chat", json={
        "message": "What if energy consumption decreases by 10%?",
        "factory_id": 1
    })
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "insights" in data
    assert "tool_calls" in data
    assert len(data["tool_calls"]) > 0

# 11. PDF Report Generation Test
def test_pdf_generation_endpoint():
    res = client.get("/api/reports/1")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000
