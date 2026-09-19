-- GreenMetriX PostgreSQL Production Database Schema
-- Version: 1.0.0
-- Standard: ISO 50001 & GHG Protocol Scope 1-3 Corporate Accounting

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator', -- operator, manager, admin, auditor
    organization VARCHAR(255) DEFAULT 'GreenMetriX Industrial Network',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Factories Table
CREATE TABLE IF NOT EXISTS factories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    industry_type VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Delhi NCR',
    country VARCHAR(100) DEFAULT 'India',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    grid_zone VARCHAR(50) DEFAULT 'NORTHERN_GRID_DELHI',
    operating_hours_per_day INTEGER DEFAULT 24,
    peak_capacity_mw DOUBLE PRECISION DEFAULT 3.5,
    annual_target_co2 DOUBLE PRECISION DEFAULT 1200.0,
    is_demo BOOLEAN DEFAULT TRUE,
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Factory Telemetry Readings
CREATE TABLE IF NOT EXISTS factory_readings (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    energy_kwh DOUBLE PRECISION NOT NULL,
    production_units DOUBLE PRECISION DEFAULT 0.0,
    co2_kg DOUBLE PRECISION NOT NULL,
    emission_intensity DOUBLE PRECISION,
    intensity_rating VARCHAR(20) DEFAULT 'UNKNOWN',
    rating_reason TEXT,
    renewable_kwh DOUBLE PRECISION DEFAULT 0.0,
    renewable_share DOUBLE PRECISION DEFAULT 0.0,
    ambient_temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    cooling_degree_days DOUBLE PRECISION,
    data_status VARCHAR(50) DEFAULT 'VALIDATED',
    is_demo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_factory_readings_timestamp ON factory_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_factory_readings_factory_id ON factory_readings(factory_id);

-- Emission Factors Table
CREATE TABLE IF NOT EXISTS emission_factors (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- SCOPE_1, SCOPE_2, SCOPE_3
    factor_value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50) NOT NULL,
    source VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rating Thresholds Table
CREATE TABLE IF NOT EXISTS rating_thresholds (
    id SERIAL PRIMARY KEY,
    industry_type VARCHAR(100) NOT NULL,
    low_upper_limit DOUBLE PRECISION NOT NULL,
    medium_upper_limit DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50) DEFAULT 'kg CO2/unit',
    source VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anomalies Table
CREATE TABLE IF NOT EXISTS anomalies (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    reading_id INTEGER REFERENCES factory_readings(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    anomaly_score DOUBLE PRECISION NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH
    reason TEXT NOT NULL,
    potential_root_cause TEXT,
    metric_impacted VARCHAR(100) DEFAULT 'energy_kwh',
    observed_value DOUBLE PRECISION,
    expected_value DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE
    model_version VARCHAR(100) DEFAULT 'IsolationForest-v1.2',
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Energy Predictions Table
CREATE TABLE IF NOT EXISTS energy_predictions (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    prediction_time TIMESTAMP WITH TIME ZONE NOT NULL,
    target_time TIMESTAMP WITH TIME ZONE NOT NULL,
    predicted_energy_kwh DOUBLE PRECISION NOT NULL,
    predicted_co2_kg DOUBLE PRECISION NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    confidence_lower DOUBLE PRECISION,
    confidence_upper DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sustainability Scores Table
CREATE TABLE IF NOT EXISTS sustainability_scores (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    overall_score DOUBLE PRECISION NOT NULL,
    energy_efficiency_score DOUBLE PRECISION NOT NULL,
    emission_intensity_score DOUBLE PRECISION NOT NULL,
    renewable_share_score DOUBLE PRECISION NOT NULL,
    anomaly_score DOUBLE PRECISION NOT NULL,
    data_quality_score DOUBLE PRECISION NOT NULL,
    score_grade VARCHAR(20) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scenarios (Digital Twin) Table
CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    solar_capacity_kw DOUBLE PRECISION DEFAULT 0.0,
    battery_capacity_kwh DOUBLE PRECISION DEFAULT 0.0,
    waste_heat_recovery_pct DOUBLE PRECISION DEFAULT 0.0,
    off_peak_shift_pct DOUBLE PRECISION DEFAULT 0.0,
    electrify_boiler BOOLEAN DEFAULT FALSE,
    projected_co2_reduction_kg DOUBLE PRECISION,
    projected_savings_usd DOUBLE PRECISION,
    estimated_capex_usd DOUBLE PRECISION,
    payback_years DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
