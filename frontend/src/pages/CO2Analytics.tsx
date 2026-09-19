// CO2Analytics.tsx
import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Download,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const intensityTrend = [
  { month: 'Jan', intensity: 0.88, baseline: 0.716, target: 0.65 },
  { month: 'Feb', intensity: 0.84, baseline: 0.716, target: 0.65 },
  { month: 'Mar', intensity: 0.79, baseline: 0.716, target: 0.65 },
  { month: 'Apr', intensity: 0.74, baseline: 0.716, target: 0.65 },
  { month: 'May', intensity: 0.71, baseline: 0.716, target: 0.65 },
  { month: 'Jun', intensity: 0.68, baseline: 0.716, target: 0.65 }
];

export const CO2Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Carbon Accounting & Intensity</h1>
          <p className="text-xs text-emerald-400/70 mt-1">
            GHG Protocol Scopes 1-3, Central Electricity Authority (CEA) verified factors, and unit intensity benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            CEA Factor: 0.716 kg CO₂/kWh
          </span>
        </div>
      </div>

      {/* 3 Scope Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Scope 1 (Direct)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Natural Gas & Fleet
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">342.6 <span className="text-xs text-amber-400 font-normal">tCO2e</span></div>
          <p className="text-[11px] text-emerald-400 mt-2 font-medium">-18.4% reduction via boiler electrification</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Scope 2 (Indirect)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Purchased Electricity
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">685.2 <span className="text-xs text-cyan-400 font-normal">tCO2e</span></div>
          <p className="text-[11px] text-cyan-400 mt-2 font-medium">Estimated via CEA National Grid Factor</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Scope 3 (Value Chain)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Logistics & Materials
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">220.7 <span className="text-xs text-purple-400 font-normal">tCO2e</span></div>
          <p className="text-[11px] text-emerald-400 mt-2 font-medium">-6.2% optimized freight routing</p>
        </div>
      </div>

      {/* Intensity Trend Line */}
      <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Emission Intensity Trajectory (kg CO₂ / Production Unit)</h3>
            <p className="text-xs text-emerald-400/60">Actual measured intensity vs CEA Grid Baseline vs 2026 ESG Target</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Current 0.68</span>
            <span className="flex items-center gap-1 text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-400" /> CEA 0.716</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={intensityTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.2} vertical={false} />
              <XAxis dataKey="month" stroke="#10b981" opacity={0.6} tick={{ fill: '#6ee7b7', fontSize: 10 }} />
              <YAxis stroke="#10b981" opacity={0.6} tick={{ fill: '#6ee7b7', fontSize: 10 }} domain={[0.5, 1.0]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#040d0c', borderColor: '#064e3b', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="intensity" name="Intensity (kg/unit)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
              <Line type="monotone" dataKey="baseline" name="CEA Baseline" stroke="#64748b" strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="target" name="2026 Target" stroke="#38bdf8" strokeDasharray="2 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
