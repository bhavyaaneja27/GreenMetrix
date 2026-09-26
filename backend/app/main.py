import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.utils.seed_data import seed_database

# Routers
from app.routers import (
    auth, factories, map as map_router, analytics, ml,
    anomalies, copilot, digital_twin, score, reports,
    data_quality, admin
)
from app.routers.copilot import copilot_router  # new /api/copilot endpoint

app = FastAPI(
    title="GreenMetriX API",
    description="AI-Powered Sustainability Intelligence for Smart Manufacturing",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)
    # Seed initial demo data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

# Mount routers
app.include_router(auth.router)
app.include_router(factories.router)
app.include_router(map_router.router)
app.include_router(analytics.router)
app.include_router(ml.router)
app.include_router(anomalies.router)
app.include_router(copilot.router)        # /api/assistant/chat (backward compat)
app.include_router(copilot_router)         # /api/copilot (new canonical endpoint)
app.include_router(digital_twin.router)
app.include_router(score.router)
app.include_router(reports.router)
app.include_router(data_quality.router)
app.include_router(admin.router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GreenMetriX API",
        "tagline": "Measure. Predict. Decarbonize.",
        "version": "1.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "database": "connected"
    }

@app.get("/")
def root():
    return {
        "project": "GreenMetriX",
        "tagline": "Measure. Predict. Decarbonize.",
        "description": "AI-powered sustainability intelligence for smart manufacturing.",
        "docs_url": "/docs"
    }
