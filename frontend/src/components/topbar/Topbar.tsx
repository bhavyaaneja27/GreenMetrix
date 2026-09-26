import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  ChevronDown,
  Search,
  Check,
  User as UserIcon,
  Settings,
  LogOut,
  Sliders,
  AlertTriangle,
  Info,
  CheckCheck,
  ExternalLink,
  Building
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../context/DashboardContext";
import { SearchModal } from "./SearchModal";

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
  "/energy-analytics": {
    title: "Energy Consumption Analytics",
    subtitle: "Peak demand, power factor and load shifting opportunities",
  },
  "/emissions": {
    title: "CO₂ & GHG Scope Analytics",
    subtitle: "Scope 1 direct & Scope 2 location-based grid emission tracking",
  },
  "/co2-analytics": {
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

const PROJECTS = [
  "All Projects",
  "Delhi Industrial Area",
  "NCR Manufacturing Hub",
  "Northern Grid Facilities"
];

export const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    dateRange,
    setDatePreset,
    setCustomDateRange,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    activeDropdown,
    toggleDropdown,
    closeAllDropdowns,
    selectedProject,
    setSelectedProject,
  } = useDashboard();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);

  const pageInfo = PAGE_TITLES[location.pathname] || {
    title: "GreenMetriX Platform",
    subtitle: "Measure. Predict. Decarbonize.",
  };

  // Handle click outside and Escape key to close any active dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeAllDropdowns();
        setProjectDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAllDropdowns();
        setProjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAllDropdowns]);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      setCustomDateRange(customStart, customEnd);
      closeAllDropdowns();
    }
  };

  const getUserInitials = () => {
    if (!user || !user.name) return "HG";
    const parts = user.name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
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

      {/* Header Controls Container */}
      <div ref={containerRef} className="flex items-center gap-4 relative">
        {/* Project Selector Dropdown */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => {
              closeAllDropdowns();
              setProjectDropdownOpen((prev) => !prev);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#09221b]/70 border border-emerald-500/20 text-xs text-slate-200 hover:border-emerald-500/40 transition-colors"
          >
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block leading-tight">Select Project</span>
              <span className="font-semibold text-emerald-300">{selectedProject}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-2" />
          </button>

          {projectDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#071d18] border border-emerald-500/30 rounded-2xl shadow-xl z-50 p-2 space-y-1">
              {PROJECTS.map((proj) => (
                <button
                  key={proj}
                  onClick={() => {
                    setSelectedProject(proj);
                    setProjectDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    selectedProject === proj
                      ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                      : "text-slate-300 hover:bg-[#09221b]"
                  }`}
                >
                  <span>{proj}</span>
                  {selectedProject === proj && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. DATE RANGE SELECTOR DROPDOWN */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => {
              setProjectDropdownOpen(false);
              toggleDropdown("date");
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[#09221b]/70 border text-xs text-slate-200 transition-colors ${
              activeDropdown === "date"
                ? "border-emerald-400 bg-[#09221b]"
                : "border-emerald-500/20 hover:border-emerald-500/40"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] text-slate-300 max-w-[200px] truncate">
              {dateRange.label}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
          </button>

          {activeDropdown === "date" && (
            <div className="absolute right-0 mt-2 w-72 bg-[#071d18] border border-emerald-500/30 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/15">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date Range Filter
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
              </div>

              {/* Preset Options */}
              <div className="space-y-1">
                {[
                  { key: "all", label: "Default Range (2024 - 2026)" },
                  { key: "today", label: "Today" },
                  { key: "last7", label: "Last 7 Days" },
                  { key: "last30", label: "Last 30 Days" },
                  { key: "last3m", label: "Last 3 Months" },
                  { key: "thisYear", label: "This Year (YTD)" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setDatePreset(option.key);
                      closeAllDropdowns();
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      dateRange.preset === option.key
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-slate-300 hover:bg-[#09221b] hover:text-white"
                    }`}
                  >
                    <span>{option.label}</span>
                    {dateRange.preset === option.key && (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Date Range Form */}
              <div className="pt-2 border-t border-emerald-500/15">
                <span className="text-[11px] font-bold text-slate-300 block mb-2">Custom Range</span>
                <form onSubmit={handleApplyCustomRange} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-[#04110e] border border-emerald-500/30 text-[11px] text-white focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-[#04110e] border border-emerald-500/30 text-[11px] text-white focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!customStart || !customEnd}
                    className="w-full py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all disabled:opacity-40"
                  >
                    Apply Custom Range
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* 1. SEARCH BUTTON */}
        <button
          onClick={() => {
            setProjectDropdownOpen(false);
            toggleDropdown("search");
          }}
          className={`p-2 rounded-xl bg-[#09221b]/60 border text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors ${
            activeDropdown === "search" ? "border-emerald-400 text-emerald-400 bg-[#09221b]" : "border-emerald-500/20"
          }`}
          title="Search dashboard content (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Search Modal Container */}
        <SearchModal isOpen={activeDropdown === "search"} onClose={closeAllDropdowns} />

        {/* 3. NOTIFICATION BELL WITH DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => {
              setProjectDropdownOpen(false);
              toggleDropdown("notifications");
            }}
            className={`p-2 rounded-xl bg-[#09221b]/60 border text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors relative ${
              activeDropdown === "notifications" ? "border-emerald-400 text-emerald-400 bg-[#09221b]" : "border-emerald-500/20"
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-1.5 right-1.5 shadow-[0_0_8px_#f59e0b] animate-pulse" />
            )}
          </button>

          {activeDropdown === "notifications" && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#071d18] border border-emerald-500/30 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/15">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.link) {
                          closeAllDropdowns();
                          navigate(notif.link);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        !notif.read
                          ? "bg-[#09221b]/80 border-emerald-500/40"
                          : "bg-[#04110e]/60 border-emerald-500/10 hover:border-emerald-500/25"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            notif.severity === "HIGH"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : notif.severity === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {notif.severity}
                        </span>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-0.5">{notif.title}</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. PROFILE BUTTON WITH DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => {
              setProjectDropdownOpen(false);
              toggleDropdown("profile");
            }}
            className={`w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border flex items-center justify-center font-bold text-xs text-white shadow-[0_0_10px_rgba(16,185,129,0.25)] hover:scale-105 transition-all cursor-pointer ${
              activeDropdown === "profile" ? "border-emerald-300 ring-2 ring-emerald-400/40" : "border-emerald-400/40"
            }`}
            title="User Profile & Settings"
          >
            {getUserInitials()}
          </button>

          {activeDropdown === "profile" && (
            <div className="absolute right-0 mt-2 w-64 bg-[#071d18] border border-emerald-500/30 rounded-2xl shadow-2xl z-50 p-3 space-y-3">
              {/* User Header */}
              <div className="p-3 rounded-xl bg-[#04110e]/90 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 border border-emerald-400/40 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                  {getUserInitials()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">
                    {user?.name || "Harsh Gupta"}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || "harsh@greenmetrix.ai"}
                  </p>
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {user?.role || "Sustainability Administrator"}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    closeAllDropdowns();
                    navigate("/settings");
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-[#09221b] hover:text-emerald-300 transition-colors flex items-center gap-2.5"
                >
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                  <span>My Profile & Credentials</span>
                </button>

                <button
                  onClick={() => {
                    closeAllDropdowns();
                    navigate("/settings");
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-[#09221b] hover:text-emerald-300 transition-colors flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span>Platform Settings</span>
                </button>

                <button
                  onClick={() => {
                    closeAllDropdowns();
                    navigate("/settings");
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-[#09221b] hover:text-emerald-300 transition-colors flex items-center gap-2.5"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Emission Factors & Thresholds</span>
                </button>

                <div className="pt-2 border-t border-emerald-500/15">
                  <button
                    onClick={() => {
                      closeAllDropdowns();
                      logout();
                      navigate("/login");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
