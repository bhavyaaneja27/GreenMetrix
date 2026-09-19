import React from "react";
import { useLocation } from "react-router-dom";
import { Bell, Calendar, ChevronDown, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard Overview",
    subtitle: "Real-time insights into your production's environmental impact 🌿",
  },
  "/factories": {
    title: "Factory Facilities Directory",
    subtitle: "Real-time energy load, emission intensity & compliance status",
  },
  "/map": {
    title: "City Carbon Map // Delhi Grid",
    subtitle: "Live industrial emissions heatmap, radar telemetries & hotspots",
  },
  "/energy": {
    title: "Energy Consumption Analytics",
    subtitle: "Peak demand, power factor and load shifting opportunities",
  },
  "/emissions": {
    title: "CO₂ & GHG Scope Analytics",
    subtitle: "Scope 1 direct & Scope 2 location-based grid emission tracking",
  },
  "/anomalies": {
    title: "Unsupervised Anomaly Detection",
    subtitle: "Isolation Forest real-time detection & root cause categorization",
  },
  "/digital-twin": {
    title: "Digital Twin // What-If Simulator",
    subtitle: "Scenario modeling for energy efficiency & renewable integration",
  },
  "/copilot": {
    title: "GreenMetriX AI Sustainability Copilot",
    subtitle: "Interactive LangGraph assistant powered by verified environmental RAG",
  },
  "/action-planner": {
    title: "Decarbonization Action Planner",
    subtitle: "Prioritized recommendations with verified impact & effort matrices",
  },
  "/score": {
    title: "Composite Sustainability Score",
    subtitle: "Transparent multi-variable ESG calculation framework",
  },
  "/reports": {
    title: "Executive Sustainability Reports",
    subtitle: "Audit-ready PDF generation powered by ReportLab",
  },
  "/settings": {
    title: "Platform Settings & Benchmarks",
    subtitle: "Configure industry thresholds, grid emission factors & API keys",
  },
};

export const Topbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const pageInfo = PAGE_TITLES[location.pathname] || {
    title: "GreenMetriX Platform",
    subtitle: "Measure. Predict. Decarbonize.",
  };

  return (
    <header className="h-20 bg-[#051310]/80 backdrop-blur-xl border-b border-emerald-500/15 sticky top-0 z-30 px-8 flex items-center justify-between">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          {pageInfo.title}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{pageInfo.subtitle}</p>
      </div>

      {/* Header Controls Matching Reference Image 2 */}
      <div className="flex items-center gap-4">
        {/* Project Selector Dropdown */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#09221b]/70 border border-emerald-500/20 text-xs text-slate-200 cursor-pointer hover:border-emerald-500/40 transition-colors">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block leading-tight">Select Project</span>
            <span className="font-semibold text-emerald-300">All Projects</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-2" />
        </div>

        {/* Date Range Selector Matching Reference Image 2 */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#09221b]/70 border border-emerald-500/20 text-xs text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[11px] text-slate-300">01 Jan 2024 - 31 May 2026</span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
        </div>

        {/* Search button */}
        <button className="p-2 rounded-xl bg-[#09221b]/60 border border-emerald-500/20 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors">
          <Search className="w-4 h-4" />
        </button>

        {/* Notification Bell with alert dot */}
        <div className="relative">
          <button className="p-2 rounded-xl bg-[#09221b]/60 border border-emerald-500/20 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5 shadow-[0_0_8px_#f59e0b]" />
        </div>

        {/* User Badge Matching Reference Image 2 */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/40 flex items-center justify-center font-bold text-xs text-white shadow-[0_0_10px_rgba(16,185,129,0.25)]">
          HG
        </div>
      </div>
    </header>
  );
};
