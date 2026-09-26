import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Factory, AlertTriangle, BarChart2, Layers, Cpu, ArrowRight } from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: "Facility" | "Anomaly" | "Analytics" | "Page" | "Telemetry";
  path: string;
  keywords: string[];
}

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "fac-okhla",
    title: "Okhla Smart Auto Assembly",
    description: "Facility in Okhla Industrial Area (4,820 kWh load, Chiller valve alert)",
    category: "Facility",
    path: "/factories/6",
    keywords: ["okhla", "smart", "auto", "assembly", "delhi", "facility", "chiller"],
  },
  {
    id: "fac-faridabad",
    title: "Faridabad Heavy Engineering",
    description: "Facility in Faridabad Hub (5,910 kWh load, Induction furnace surge)",
    category: "Facility",
    path: "/factories/5",
    keywords: ["faridabad", "heavy", "engineering", "spike", "induction", "furnace", "facility"],
  },
  {
    id: "fac-bawana",
    title: "Bawana Precision Plastics",
    description: "Facility in Bawana Area (2,850 kWh load, Hydraulic pump regulator)",
    category: "Facility",
    path: "/factories/7",
    keywords: ["bawana", "precision", "plastics", "hydraulic", "pump", "facility"],
  },
  {
    id: "fac-noida",
    title: "Noida Advanced Electronics",
    description: "Facility in Noida SEZ (2,310 kWh load, Cleanroom AHU)",
    category: "Facility",
    path: "/factories/8",
    keywords: ["noida", "advanced", "electronics", "cleanroom", "ahu", "facility"],
  },
  {
    id: "page-map",
    title: "City Carbon Map // Delhi Grid",
    description: "Live industrial emissions heatmap, radar telemetries & NCR hotspots",
    category: "Page",
    path: "/map",
    keywords: ["map", "city", "carbon", "delhi", "grid", "heatmap", "radar", "ncr"],
  },
  {
    id: "anom-detection",
    title: "Isolation Forest Anomaly Detection",
    description: "Unsupervised ML energy spike detection & root cause diagnosis center",
    category: "Anomaly",
    path: "/anomalies",
    keywords: ["anomaly", "anomalies", "isolation", "forest", "spike", "outlier", "detection", "spikes"],
  },
  {
    id: "anom-chiller",
    title: "Chiller Compressor Valve Anomaly (Okhla)",
    description: "Continuous baseload surge during idle cycle (+1,420 kWh excess)",
    category: "Anomaly",
    path: "/anomalies",
    keywords: ["chiller", "compressor", "valve", "okhla", "baseload", "spike"],
  },
  {
    id: "anom-furnace",
    title: "Induction Furnace Power Surge (Faridabad)",
    description: "Coil insulation degradation leading to reactive power spike (+1,610 kWh)",
    category: "Anomaly",
    path: "/anomalies",
    keywords: ["induction", "furnace", "power", "spike", "surge", "faridabad", "reactive"],
  },
  {
    id: "page-energy",
    title: "Energy Consumption Analytics",
    description: "Peak demand analysis, power factor optimization & load shifting",
    category: "Analytics",
    path: "/energy-analytics",
    keywords: ["energy", "analytics", "consumption", "kwh", "mwh", "peak", "demand", "power", "factor"],
  },
  {
    id: "page-co2",
    title: "CO₂ & Scope 1/2 Scope Analytics",
    description: "Scope 1 direct emissions & Scope 2 location-based grid emission tracking",
    category: "Analytics",
    path: "/co2-analytics",
    keywords: ["co2", "emissions", "scope 1", "scope 2", "carbon", "ghg", "cea", "factor"],
  },
  {
    id: "page-digital-twin",
    title: "Digital Twin // What-If Simulator",
    description: "Physics-informed scenario modeling for energy efficiency & renewable share",
    category: "Page",
    path: "/digital-twin",
    keywords: ["digital", "twin", "simulation", "simulator", "scenario", "what-if", "renewable"],
  },
  {
    id: "page-copilot",
    title: "GreenMetriX AI Sustainability Copilot",
    description: "Interactive RAG assistant powered by verified environmental intelligence",
    category: "Page",
    path: "/copilot",
    keywords: ["copilot", "ai", "assistant", "sustainability", "chat", "rag", "langgraph"],
  },
  {
    id: "page-action-planner",
    title: "Decarbonization Action Planner",
    description: "Prioritized industrial decarbonization recommendations & ROI matrices",
    category: "Page",
    path: "/action-planner",
    keywords: ["action", "planner", "decarbonization", "recommendations", "impact", "effort"],
  },
  {
    id: "page-score",
    title: "Composite Sustainability Score (ESG)",
    description: "Multi-variable ESG rating framework & NCR benchmark ranking",
    category: "Page",
    path: "/score",
    keywords: ["score", "sustainability", "esg", "rating", "composite", "benchmark"],
  },
  {
    id: "page-reports",
    title: "Executive Sustainability Reports (PDF)",
    description: "Audit-ready PDF executive summary & facility report generation",
    category: "Page",
    path: "/reports",
    keywords: ["reports", "pdf", "executive", "download", "summary", "reportlab"],
  },
  {
    id: "page-settings",
    title: "Platform Settings & CEA Grid Factors",
    description: "Configure CEA emission factors (0.716 kg/kWh), thresholds & API keys",
    category: "Page",
    path: "/settings",
    keywords: ["settings", "grid", "cea", "emission", "factor", "thresholds", "api"],
  },
  {
    id: "telemetry-log",
    title: "Granular Telemetry & ML Inference Log",
    description: "Real-time production ingestion archive and prediction history table",
    category: "Telemetry",
    path: "/dashboard",
    keywords: ["telemetry", "ingestion", "log", "prediction", "history", "inference", "raw"],
  },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = normalizedQuery
    ? SEARCH_ITEMS.filter((item) => {
        return (
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.description.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery) ||
          item.keywords.some((k) => k.toLowerCase().includes(normalizedQuery))
        );
      })
    : SEARCH_ITEMS.slice(0, 6);

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Facility":
        return <Factory className="w-4 h-4 text-emerald-400" />;
      case "Anomaly":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "Analytics":
        return <BarChart2 className="w-4 h-4 text-cyan-400" />;
      case "Telemetry":
        return <Cpu className="w-4 h-4 text-purple-400" />;
      default:
        return <Layers className="w-4 h-4 text-amber-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Facility":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Anomaly":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "Analytics":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "Telemetry":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#071d18] border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-emerald-500/20 bg-[#04110e]/90">
          <Search className="w-5 h-5 text-emerald-400 flex-shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search factories (Faridabad, Okhla), anomalies, analytics, digital twin..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/40"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1.5 divide-y divide-emerald-950/40">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.path)}
                className="group p-3 rounded-xl hover:bg-[#09221b]/80 border border-transparent hover:border-emerald-500/30 cursor-pointer transition-all flex items-center justify-between gap-3 pt-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-[#04110e] border border-emerald-500/20 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs text-emerald-400 font-semibold gap-1 flex-shrink-0">
                  <span>Go</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p className="font-semibold text-slate-300 mb-1">No matching dashboard results found</p>
              <p className="text-[11px] text-slate-500">
                Try searching for <span className="text-emerald-400 font-mono">"Faridabad"</span>,{" "}
                <span className="text-emerald-400 font-mono">"anomaly"</span>, or{" "}
                <span className="text-emerald-400 font-mono">"Digital Twin"</span>.
              </p>
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="px-4 py-2.5 bg-[#04110e]/90 border-t border-emerald-500/15 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{filteredItems.length} results available</span>
          <span className="text-emerald-400/80">Press ESC or click outside to exit</span>
        </div>
      </div>
    </div>
  );
};
