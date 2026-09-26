// types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_demo?: boolean;
}

export interface Factory {
  id: number | string;
  name: string;
  industry?: string;
  industry_type?: string;
  city: string;
  state?: string;
  latitude: number;
  longitude: number;
  grid_zone?: string;
  operating_hours_per_day?: number;
  peak_capacity_mw?: number;
  annual_target_co2?: number;
  is_demo?: boolean;
  contact_email?: string;
  latest_energy_kwh?: number;
  latest_co2_kg?: number;
  latest_production?: number;
  latest_intensity?: number;
  latest_renewable_share?: number;
  sustainability_rating?: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  rating_reason?: string;
  has_active_anomaly?: boolean;
  created_at?: string;
}

export interface FactoryReading {
  id: number | string;
  factory_id: number | string;
  timestamp: string;
  energy_kwh: number;
  co2_kg: number;
  production_units?: number;
  renewable_kwh?: number;
  renewable_share?: number;
  emission_intensity?: number;
  is_demo?: boolean;
  data_status?: string;
}

export interface FactoryDetail extends Factory {
  readings: FactoryReading[];
  threshold_source?: string;
  threshold_version?: string;
  emission_factor_source?: string;
  emission_factor_value?: number;
}

export interface Anomaly {
  id: number | string;
  factory_id: number | string;
  factory_name?: string;
  timestamp: string;
  anomaly_score: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  reason?: string;
  potential_root_cause?: string;
  metric_impacted?: string;
  investigation_status?: string;
  status?: "OPEN" | "INVESTIGATING" | "RESOLVED";
  energy_kwh?: number;
  expected_kwh?: number;
  model_version?: string;
}

export interface AnalyticsOverview {
  kpis: {
    predicted_co2_kg: number;
    predicted_co2_unit: string;
    predicted_co2_change_pct: number;
    sustainability_score: number;
    sustainability_grade: string;
    sustainability_change_pct: number;
    carbon_risk: string;
    carbon_risk_subtext: string;
    carbon_threshold_kg: number;
    potential_reduction_kg: number;
    potential_reduction_pct: number;
    production_energy_mj: number;
    production_energy_subtext: string;
    transport_impact_kg: number;
    total_factories_monitored: number;
    active_anomalies_count: number;
    total_energy_kwh: number;
    renewable_energy_pct: number;
    average_emission_intensity: number;
  };
  material_breakdown: Array<{ material: string; co2_kg: number }>;
  energy_vs_co2_scatter: Array<{ production_energy_mj: number; co2_kg: number }>;
  transport_vs_co2_scatter: Array<{ distance_km: number; co2_kg: number }>;
  yearly_trend: Array<{ year: string; co2_kg: number }>;
  feature_importances: Array<{ feature: string; importance: number }>;
  scenario_comparison: {
    current_scenario: { co2_kg: number; production_energy_mj: number };
    optimized_scenario: { co2_kg: number; reduction_pct: number; production_energy_mj: number; energy_reduction_pct: number };
  };
  co2_by_source: Array<{ source: string; percentage: number; co2_kg: number; color: string }>;
  ai_insights: {
    headline: string;
    summary: string;
    key_takeaway: string;
  };
  recommendations: Array<{
    id: string;
    title: string;
    detail: string;
    impact: string;
    impact_color: string;
  }>;
  prediction_history: Array<{
    id: number;
    date: string;
    project_name: string;
    co2_kg: number;
    score: number;
    risk: string;
    risk_color: string;
  }>;
}

export interface MapFactory {
  id: number;
  name: string;
  industry: string;
  city: string;
  latitude: number;
  longitude: number;
  grid_zone: string;
  energy_kwh: number;
  co2_kg: number;
  production_units: number;
  emission_intensity?: number;
  renewable_share: number;
  rating: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  rating_reason?: string;
  has_anomaly: boolean;
  is_demo: boolean;
}

export interface MapSummary {
  city: string;
  monitoring_status: string;
  current_load_co2_kg: number;
  sustainability_score: number;
  clean_energy_pct: number;
  monitored_factories_count: number;
  total_energy_kwh: number;
  active_anomalies_count: number;
  selected_zone_preview: {
    zone_id: string;
    name: string;
    load_co2_kg: number;
  };
}

export interface ScenarioSimulateResponse {
  factory_id: number;
  factory_name: string;
  baseline: Record<string, any>;
  scenario: Record<string, any>;
  potential_reduction_co2_kg: number;
  potential_reduction_pct: number;
  energy_savings_kwh: number;
  baseline_rating: string;
  scenario_rating: string;
  disclaimer: string;
}

export interface SustainabilityScoreResponse {
  factory_id: number;
  factory_name: string;
  overall_score: number;
  energy_efficiency_score: number;
  emission_intensity_score: number;
  renewable_share_score: number;
  anomaly_score: number;
  data_quality_score: number;
  weights: {
    energy_efficiency: number;
    emission_intensity: number;
    renewable_share: number;
    anomalies: number;
    data_quality: number;
  };
  score_grade: string;
  explanation: string;
  calculation_methodology: string;
}

export interface ActionItem {
  id: string;
  issue: string;
  evidence: string;
  recommendation: string;
  priority: string;
  effort: string;
  potential_impact: string;
  assumptions: string[];
  data_quality: string;
  sources: string[];
}

export interface ChatResponse {
  answer: string;
  insights?: string[];
  recommendations?: string[];
  sources?: string[];
  assumptions?: string[];
  data_quality?: string;
  tool_calls?: Array<Record<string, any>>;
  tools_called?: string[];
  reasoning_trace?: string[];
}

export interface DataQualityResponse {
  factory_id: number;
  factory_name: string;
  quality_score: number;
  status: string;
  total_records: number;
  missing_records_count: number;
  negative_values_count: number;
  zero_production_count: number;
  outlier_count: number;
  warnings: Array<{ severity: string; field: string; message: string }>;
  calculated_at: string;
}

export interface DateRange {
  label: string;
  startDate: string;
  endDate: string;
  preset: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  severity: "HIGH" | "MEDIUM" | "INFO";
  timestamp: string;
  read: boolean;
  link?: string;
}

