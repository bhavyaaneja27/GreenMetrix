import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Index
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="sustainability_officer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    scenarios = relationship("Scenario", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")


class Factory(Base):
    __tablename__ = "factories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    industry = Column(String(100), index=True, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    grid_zone = Column(String(50), default="ZONE-A")
    operating_hours_per_day = Column(Float, default=16.0)
    is_demo = Column(Boolean, default=True)
    contact_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    readings = relationship("FactoryReading", back_populates="factory", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="factory", cascade="all, delete-orphan")
    predictions = relationship("EnergyPrediction", back_populates="factory", cascade="all, delete-orphan")
    sustainability_scores = relationship("SustainabilityScore", back_populates="factory", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="factory", cascade="all, delete-orphan")
    quality_checks = relationship("DataQualityCheck", back_populates="factory", cascade="all, delete-orphan")


class FactoryReading(Base):
    __tablename__ = "factory_readings"

    id = Column(Integer, primary_key=True, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    energy_kwh = Column(Float, nullable=False)
    co2_kg = Column(Float, nullable=False)
    production_units = Column(Float, nullable=True)
    renewable_kwh = Column(Float, default=0.0)
    renewable_share = Column(Float, default=0.0)
    emission_intensity = Column(Float, nullable=True)
    is_demo = Column(Boolean, default=True)
    data_status = Column(String(50), default="VALID")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    factory = relationship("Factory", back_populates="readings")

    __table_args__ = (
        Index("idx_factory_time", "factory_id", "timestamp"),
    )


class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    factor_value = Column(Float, nullable=False)
    unit = Column(String(50), default="kg CO2/kWh")
    source = Column(String(200), default="Central Electricity Authority (CEA) Baseline Database")
    version = Column(String(50), default="v19.0 (2024)")
    effective_date = Column(String(50), default="2024-01-01")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class RatingThreshold(Base):
    __tablename__ = "rating_thresholds"

    id = Column(Integer, primary_key=True, index=True)
    industry = Column(String(100), unique=True, index=True, nullable=False)
    low_max = Column(Float, default=2.0)
    medium_max = Column(Float, default=5.0)
    source = Column(String(200), default="Demo thresholds - not verified industry benchmarks")
    methodology_version = Column(String(50), default="v1.0")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class EnergyPrediction(Base):
    __tablename__ = "energy_predictions"

    id = Column(Integer, primary_key=True, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    predicted_energy_kwh = Column(Float, nullable=False)
    actual_energy_kwh = Column(Float, nullable=True)
    model_name = Column(String(100), default="XGBoost Regressor")
    model_version = Column(String(50), default="v1.0.0")
    features_json = Column(Text, nullable=True)
    feature_importance_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    factory = relationship("Factory", back_populates="predictions")


class EmissionPrediction(Base):
    __tablename__ = "emission_predictions"

    id = Column(Integer, primary_key=True, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    predicted_co2_kg = Column(Float, nullable=False)
    actual_co2_kg = Column(Float, nullable=True)
    estimation_method = Column(String(100), default="Factor Derived (Energy x 0.716)")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    anomaly_score = Column(Float, nullable=False)
    severity = Column(String(20), default="MEDIUM")
    reason = Column(String(255), default="Potential anomaly requiring investigation.")
    metric_impacted = Column(String(100), default="Energy Consumption")
    investigation_status = Column(String(50), default="OPEN")
    model_version = Column(String(50), default="IsolationForest-v1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    factory = relationship("Factory", back_populates="anomalies")


class SustainabilityScore(Base):
    __tablename__ = "sustainability_scores"

    id = Column(Integer, primary_key=True, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="CASCADE"), nullable=False, index=True)
    score_date = Column(DateTime, default=datetime.datetime.utcnow)
    overall_score = Column(Float, nullable=False)
    energy_efficiency_score = Column(Float, nullable=False)
    emission_intensity_score = Column(Float, nullable=False)
    renewable_share_score = Column(Float, nullable=False)
    anomaly_score = Column(Float, nullable=False)
    data_quality_score = Column(Float, nullable=False)
    weights_json = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    factory = relationship("Factory", back_populates="sustainability_scores")


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    energy_change_pct = Column(Float, default=0.0)
    production_change_pct = Column(Float, default=0.0)
    renewable_share_pct = Column(Float, default=0.0)
    efficiency_improvement_pct = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    factory = relationship("Factory", back_populates="scenarios")
    user = relationship("User", back_populates="scenarios")
    results = relationship("ScenarioResult", back_populates="scenario", cascade="all, delete-orphan")


class ScenarioResult(Base):
    __tablename__ = "scenario_results"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    baseline_energy = Column(Float, nullable=False)
    scenario_energy = Column(Float, nullable=False)
    baseline_co2 = Column(Float, nullable=False)
    scenario_co2 = Column(Float, nullable=False)
    baseline_intensity = Column(Float, nullable=True)
    scenario_intensity = Column(Float, nullable=True)
    potential_reduction_kg = Column(Float, nullable=False)
    rating = Column(String(20), default="MEDIUM")
    calculation_date = Column(DateTime, default=datetime.datetime.utcnow)

    scenario = relationship("Scenario", back_populates="results")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), default="Sustainability Assistant Consultation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    insights_json = Column(Text, nullable=True)
    recommendations_json = Column(Text, nullable=True)
    sources_json = Column(Text, nullable=True)
    assumptions_json = Column(Text, nullable=True)
    data_quality = Column(String(100), nullable=True)
    tool_calls_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Methodology")
    source_url = Column(String(255), nullable=True)
    version = Column(String(50), default="2024")
    content = Column(Text, nullable=False)
    chunks_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    model_type = Column(String(100), default="Supervised Regression")
    metrics_json = Column(Text, nullable=True)
    features_list = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)


class DataQualityCheck(Base):
    __tablename__ = "data_quality_checks"

    id = Column(Integer, primary_key=True, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="CASCADE"), nullable=False, index=True)
    check_date = Column(DateTime, default=datetime.datetime.utcnow)
    quality_score = Column(Float, default=100.0)
    missing_records_count = Column(Integer, default=0)
    negative_values_count = Column(Integer, default=0)
    zero_production_count = Column(Integer, default=0)
    outlier_count = Column(Integer, default=0)
    status = Column(String(50), default="HEALTHY")
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    factory = relationship("Factory", back_populates="quality_checks")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
