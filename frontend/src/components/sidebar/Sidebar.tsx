import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Factory,
  MapPin,
  Zap,
  Flame,
  AlertTriangle,
  Cpu,
  Bot,
  ListTodo,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  Leaf,
  Sparkles,
  ChevronRight,
  Globe
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

interface NavGroup {
  section: string;
  items: {
    label: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
    badgeVariant?: "emerald" | "amber" | "cyan" | "rose" | "purple";
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    section: "CORE OPERATIONS",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Facilities Hub", path: "/factories", icon: Factory, badge: "8 Nodes" },
      { label: "City Carbon Map", path: "/map", icon: MapPin, badge: "Radar", badgeVariant: "emerald" },
    ]
  },
  {
    section: "INTELLIGENCE & PREDICTION",
    items: [
      { label: "Energy Analytics", path: "/energy-analytics", icon: Zap },
      { label: "CO₂ & Intensity", path: "/co2-analytics", icon: Flame },
      { label: "Anomaly Detection", path: "/anomalies", icon: AlertTriangle, badge: "3 Spike", badgeVariant: "rose" },
      { label: "Digital Twin", path: "/digital-twin", icon: Cpu, badge: "Physics", badgeVariant: "cyan" },
      { label: "AI Copilot", path: "/copilot", icon: Bot, badge: "Agent", badgeVariant: "purple" },
    ]
  },
  {
    section: "ESG & GOVERNANCE",
    items: [
      { label: "Action Roadmap", path: "/action-planner", icon: ListTodo },
      { label: "Sustainability Score", path: "/score", icon: ShieldCheck, badge: "Tier A", badgeVariant: "emerald" },
      { label: "Reports & Audits", path: "/reports", icon: FileText },
      { label: "Settings & Factors", path: "/settings", icon: Settings },
    ]
  }
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-gradient-to-b from-[#061814]/98 via-[#04110e]/98 to-[#020a08]/98 backdrop-blur-2xl border-r border-emerald-500/20 flex flex-col h-screen fixed left-0 top-0 z-40 select-none shadow-[4px_0_30px_rgba(0,0,0,0.6)]">
      {/* Brand Header */}
      <div className="p-4 border-b border-emerald-500/15 flex items-center justify-between bg-[#040e0c]/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-300/30">
              <Leaf className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#040e0c] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">GreenMetriX</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">v2.4</span>
            </div>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400/80 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SaaS Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.section} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-400/50 uppercase">
              {group.section}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/25 via-emerald-500/10 to-transparent text-emerald-300 border-l-4 border-emerald-400 font-semibold shadow-[inset_0_0_15px_rgba(16,185,129,0.15)] pl-2.5"
                        : "text-slate-400 hover:text-slate-200 hover:bg-emerald-950/40 border-l-4 border-transparent hover:translate-x-1"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        isActive ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-950/60"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <span className="flex-1 truncate">{item.label}</span>

                      {item.badge && (
                        <span
                          className={cn(
                            "text-[9px] font-mono px-1.5 py-0.5 rounded-full border",
                            item.badgeVariant === "rose"
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              : item.badgeVariant === "cyan"
                              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                              : item.badgeVariant === "purple"
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* 3D Glowing Earth Globe with Sprout Widget (Matching Reference Image 2) */}
      <div className="p-3 mx-3 mb-3 rounded-2xl bg-gradient-to-b from-[#0a2820]/90 to-[#041410]/95 border border-emerald-500/30 relative overflow-hidden group shadow-[0_0_25px_rgba(16,185,129,0.18)]">
        {/* Holographic glowing sheen overlay */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />

        <div className="flex items-center gap-3 relative z-10">
          {/* Animated 3D Glowing Earth Graphic with Sprout */}
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
            {/* Pulsing orbital rings */}
            <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-1 rounded-full border border-teal-300/20 animate-[spin_12s_linear_infinite_reverse]" />

            {/* Glowing Earth sphere */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-[#064e3b] to-[#021812] border border-emerald-300/60 shadow-[0_0_18px_rgba(16,185,129,0.6)] flex items-center justify-center relative overflow-hidden">
              {/* Internal atmospheric highlights */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/15 rounded-t-full" />
              
              {/* Vibrant Sprout emerging */}
              <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Leaf className="w-5 h-5 text-emerald-300 fill-emerald-400/40 drop-shadow-[0_0_8px_#10b981]" />
                <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1.5 -right-1 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-extrabold text-white leading-tight group-hover:text-emerald-300 transition-colors">
              Building a Sustainable Future with AI
            </h4>
            <p className="text-[9px] text-emerald-400/90 font-semibold mt-0.5 flex items-center gap-1">
              <span>Green Today, Better Tomorrow</span>
              <Leaf className="w-2.5 h-2.5 text-emerald-400 inline animate-bounce" />
            </p>
          </div>
        </div>
      </div>

      {/* User Profile & Logout Bottom Bar */}
      <div className="p-3 border-t border-emerald-500/20 flex items-center justify-between bg-[#030c0a]/90">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 border border-emerald-300/40 flex items-center justify-center font-bold text-xs text-slate-950 shadow-md shadow-emerald-500/20">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "GM"}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#030c0a]" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.name || "Sustainability Lead"}
            </p>
            <p className="text-[10px] text-emerald-400/70 truncate font-mono">
              {user?.email || "admin@greenmetrix.ai"}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out of GreenMetriX"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
