// api.ts
import {
  Factory,
  FactoryDetail,
  FactoryReading,
  Anomaly,
  AnalyticsOverview,
  MapFactory,
  MapSummary,
  ScenarioSimulateResponse,
  SustainabilityScoreResponse,
  ChatResponse,
  DataQualityResponse
} from "../types";

const customApiUrl = (import.meta as any).env?.VITE_API_URL;
const API_BASE = customApiUrl 
  ? (customApiUrl.endsWith('/api') ? customApiUrl : `${customApiUrl}/api`)
  : "/api";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("gm_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Invalid email or password");
    }
    return res.json();
  },

  async register(data: { name: string; email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(err.detail || "Registration failed");
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  },

  // Factories
  async getFactories(params?: Record<string, string>): Promise<Factory[]> {
    const q = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/factories?${q}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load factories");
    return res.json();
  },

  async getFactory(id: number | string): Promise<FactoryDetail> {
    const res = await fetch(`${API_BASE}/factories/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load factory details");
    return res.json();
  },

  // Map
  async getMapFactories(): Promise<MapFactory[]> {
    const res = await fetch(`${API_BASE}/map/factories`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load map factories");
    return res.json();
  },

  async getMapSummary(): Promise<MapSummary> {
    const res = await fetch(`${API_BASE}/map/summary`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load map summary");
    return res.json();
  },

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const res = await fetch(`${API_BASE}/analytics/overview`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load analytics overview");
    return res.json();
  },

  // Anomalies
  async getAnomalies(factoryId?: number | string): Promise<Anomaly[]> {
    const url = factoryId ? `${API_BASE}/anomalies/${factoryId}` : `${API_BASE}/anomalies`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load anomalies");
    return res.json();
  },

  // ML Prediction
  async predictEnergy(data: { factory_id: number; production_units?: number; renewable_share?: number; hour?: number }) {
    const res = await fetch(`${API_BASE}/predict/energy`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Prediction failed");
    return res.json();
  },

  // AI Copilot
  async chatWithCopilot(data: { message: string; factory_id?: number }): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("AI Assistant failed");
    return res.json();
  },

  // Digital Twin
  async simulateScenario(data: {
    factory_id: number;
    energy_change_pct: number;
    production_change_pct: number;
    renewable_share_pct: number;
    title?: string;
  }): Promise<ScenarioSimulateResponse> {
    const res = await fetch(`${API_BASE}/scenarios`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Simulation failed");
    return res.json();
  },

  // Score
  async getSustainabilityScore(factoryId: number | string): Promise<SustainabilityScoreResponse> {
    const res = await fetch(`${API_BASE}/sustainability-score/${factoryId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load score");
    return res.json();
  },

  // Download PDF
  async downloadReport(factoryId: number | string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/reports/${factoryId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to download report");
    return res.blob();
  },

  async downloadExecutiveSummary(): Promise<Blob> {
    const res = await fetch(`${API_BASE}/reports/executive-summary/pdf`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to download executive summary");
    return res.blob();
  }
};

// Modular export objects for convenience
export const factoriesApi = {
  getAll: (params?: Record<string, string>) => api.getFactories(params),
  getById: (id: string | number) => api.getFactory(id),
  getReadings: async (id: string | number, limit = 24): Promise<FactoryReading[]> => {
    const res = await fetch(`${API_BASE}/factories/${id}/readings?limit=${limit}`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  }
};

export const analyticsApi = {
  getOverview: () => api.getAnalyticsOverview()
};

export const anomaliesApi = {
  getAll: (factoryId?: string | number) => api.getAnomalies(factoryId)
};

export const copilotApi = {
  ask: (message: string, factoryId?: number) => api.chatWithCopilot({ message, factory_id: factoryId })
};

export const scoreApi = {
  getScore: (factoryId: string | number) => api.getSustainabilityScore(factoryId)
};

export const reportsApi = {
  downloadExecutiveSummary: () => api.downloadExecutiveSummary(),
  downloadFactoryReport: (id: string | number) => api.downloadReport(id)
};

export const adminApi = {
  getFactors: async () => {
    const res = await fetch(`${API_BASE}/admin/factors`, { headers: getHeaders() });
    return res.json();
  },
  updateFactor: async (key: string, value: number) => {
    const res = await fetch(`${API_BASE}/admin/factors/${key}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ value })
    });
    return res.json();
  }
};
