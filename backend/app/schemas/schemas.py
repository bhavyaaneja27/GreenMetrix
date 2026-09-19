import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = 'sustainability_officer'

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None

# Factory Schemas
class FactoryBase(BaseModel):
    name: str
    industry: str
    city: str
    latitude: float
    longitude: float
    grid_zone: Optional[str] = 'ZONE-A'
    operating_hours_per_day: Optional[float] = 16.0
    is_demo: bool = True
    contact_email: Optional[str] = None

class FactoryCreate(FactoryBase):
    pass

class FactoryOut(FactoryBase):
    id: int
    latest_energy_kwh: Optional[float] = None
    latest_co2_kg: Optional[float] = None
    latest_production: Optional[float] = None
    latest_intensity: Optional[float] = None
    latest_renewable_share: Optional[float] = None
    sustainability_rating: Optional[str] = 'UNKNOWN'
    rating_reason: Optional[str] = None
    has_active_anomaly: bool = False
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Reading Schemas
class FactoryReadingOut(BaseModel):
    id: int
    factory_id: int
    timestamp: datetime.datetime
    energy_kwh: float
    co2_kg: float
    production_units: Optional[float]
    renewable_kwh: float
    renewable_share: float
    emission_intensity: Optional[float]
    is_demo: bool
    data_status: str

    class Config:
        from_attributes = True

# Detail Out
class FactoryDetailOut(FactoryOut):
    readings: List[FactoryReadingOut] = []
    threshold_source: Optional[str] = None
    threshold_version: Optional[str] = None
    emission_factor_source: Optional[str] = None
    emission_factor_value: Optional[float] = None

# Prediction Schemas
class EnergyPredictRequest(BaseModel):
    factory_id: int
    production_units: Optional[float] = 10000.0
    renewable_share: Optional[float] = 25.0
    hour: Optional[int] = 14
    day_of_week: Optional[int] = 2
    month: Optional[int] = 9
    temperature: Optional[float] = 32.0

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class EnergyPredictResponse(BaseModel):
    predicted_energy_kwh: float
    model_name: str
    model_version: str
    input_features: Dict[str, Any]
    feature_importances: List[FeatureImportanceItem]
    actual_baseline: Optional[float] = None
    confidence_note: str = 'Trained on chronological industrial time-series split (no data leakage).'

# Emission Estimation
class EmissionEstimateRequest(BaseModel):
    energy_kwh: float
    emission_factor: Optional[float] = None
    factor_source: Optional[str] = None

class EmissionEstimateResponse(BaseModel):
    energy_kwh: float
    emission_factor: float
    co2_kg: float
    factor_source: str
    factor_version: str
    effective_date: str
    calculation_type: str = 'ESTIMATED'

# Anomaly Schemas
class AnomalyOut(BaseModel):
    id: int
    factory_id: int
    factory_name: Optional[str] = None
    timestamp: datetime.datetime
    anomaly_score: float
    severity: str
    reason: str
    metric_impacted: str
    investigation_status: str
    model_version: str

    class Config:
        from_attributes = True

# Scenario / Digital Twin
class ScenarioSimulateRequest(BaseModel):
    factory_id: int
    energy_change_pct: float = Field(-10.0, description='Percentage change in energy consumption')
    production_change_pct: float = Field(0.0, description='Percentage change in production volume')
    renewable_share_pct: float = Field(20.0, description='Target renewable energy percentage')
    operating_hours: Optional[float] = 16.0
    efficiency_improvement_pct: Optional[float] = 5.0
    title: Optional[str] = 'Optimized Decarbonization Strategy'

class ScenarioSimulateResponse(BaseModel):
    factory_id: int
    factory_name: str
    baseline: Dict[str, Any]
    scenario: Dict[str, Any]
    potential_reduction_co2_kg: float
    potential_reduction_pct: float
    energy_savings_kwh: float
    baseline_rating: str
    scenario_rating: str
    disclaimer: str = 'Scenario estimate - not a guaranteed real-world outcome.'

# Sustainability Score Schemas
class ScoreWeightConfig(BaseModel):
    energy_efficiency: float = 0.30
    emission_intensity: float = 0.30
    renewable_share: float = 0.20
    anomalies: float = 0.10
    data_quality: float = 0.10

class SustainabilityScoreResponse(BaseModel):
    factory_id: int
    factory_name: str
    overall_score: float
    energy_efficiency_score: float
    emission_intensity_score: float
    renewable_share_score: float
    anomaly_score: float
    data_quality_score: float
    weights: ScoreWeightConfig
    score_grade: str
    explanation: str
    calculation_methodology: str = 'GreenMetriX Composite Sustainability Score (Demo Framework)'

# Action Planner Schemas
class ActionItem(BaseModel):
    id: str
    issue: str
    evidence: str
    recommendation: str
    priority: str
    effort: str
    potential_impact: str
    assumptions: List[str]
    data_quality: str
    sources: List[str]

class ActionPlanResponse(BaseModel):
    factory_id: int
    factory_name: str
    generated_at: datetime.datetime
    actions: List[ActionItem]
    disclaimer: str = 'Potential scenario-based recommendations. Validate with on-site certified energy audit.'

# Copilot Schemas
class ChatRequest(BaseModel):
    message: str
    factory_id: Optional[int] = None
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    insights: List[str] = []
    recommendations: List[str] = []
    sources: List[str] = []
    assumptions: List[str] = []
    data_quality: str = 'Verified'
    tool_calls: List[Dict[str, Any]] = []

# Data Quality Check
class QualityWarning(BaseModel):
    severity: str
    field: str
    message: str

class DataQualityResponse(BaseModel):
    factory_id: int
    factory_name: str
    quality_score: float
    status: str
    total_records: int
    missing_records_count: int
    negative_values_count: int
    zero_production_count: int
    outlier_count: int
    warnings: List[QualityWarning]
    calculated_at: datetime.datetime
