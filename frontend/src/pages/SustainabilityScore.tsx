// SustainabilityScore.tsx
import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  TrendingUp,
  Zap,
  Gauge,
  Sun,
  AlertTriangle,
  Database,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { scoreApi } from '../services/api';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const pillarData = [
  { subject: 'Energy Efficiency (30%)', score: 88, fullMark: 100 },
  { subject: 'Emission Intensity (30%)', score: 82, fullMark: 100 },
  { subject: 'Renewable Share (20%)', score: 85, fullMark: 100 },
  { subject: 'Anomaly Health (10%)', score: 79, fullMark: 100 },
  { subject: 'Data Quality (10%)', score: 96, fullMark: 100 }
];

export const SustainabilityScore: React.FC = () => {
  const overallScore = 84;
  const tier = 'Tier A';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Sustainability Index & ESG Health</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ISO 50001 & GHG Standard
            </span>
          </div>
          <p className="text-xs text-emerald-400/70 mt-1">
            Weighted composite scoring assessing industrial energy productivity, decarbonization trajectory, and data fidelity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold">
            Rank #2 in NCR Manufacturing Hub
          </span>
        </div>
      </div>

      {/* Main Score Hero Card & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-6 backdrop-blur-xl flex flex-col justify-between items-center text-center">
          <div>
            <span className="text-xs uppercase font-semibold text-emerald-400/60 tracking-wider">Overall Enterprise Score</span>
            <div className="mt-4 relative flex items-center justify-center">
              {/* Circular Gauge Ring */}
              <div className="w-40 h-40 rounded-full border-4 border-emerald-950/80 border-t-emerald-400 border-r-teal-400 border-b-cyan-500 flex flex-col items-center justify-center shadow-2xl shadow-emerald-500/10">
                <span className="text-5xl font-black font-mono text-white tracking-tight">{overallScore}</span>
                <span className="text-xs text-emerald-400/60 font-semibold uppercase mt-1">out of 100</span>
              </div>
            </div>

            <div className="mt-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {tier} (Industry Leader)
              </span>
              <p className="text-xs text-emerald-400/70 mt-3 leading-relaxed">
                Facility exceeds 80th percentile for low carbon intensity and rigorous ISO 50001 continuous improvement audits.
              </p>
            </div>
          </div>

          <div className="w-full pt-4 mt-4 border-t border-emerald-950/60 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-emerald-400/60">Peer Median</span>
              <p className="font-mono font-bold text-white">68 / 100</p>
            </div>
            <div>
              <span className="text-emerald-400/60">Next Tier Req</span>
              <p className="font-mono font-bold text-cyan-300">90+ (A+)</p>
            </div>
          </div>
        </div>

        {/* 5-Pillar Radar Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">5-Pillar Composite Breakdown</h3>
              <p className="text-xs text-emerald-400/60">Radar polygon mapping current operational maturity</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Verified ISO Standards
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={pillarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#064e3b" strokeOpacity={0.4} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6ee7b7', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#10b981" strokeOpacity={0.3} tick={{ fill: '#6ee7b7', fontSize: 9 }} />
                <Radar name="Facility Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#040d0c', borderColor: '#064e3b', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5 Pillar Details Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-white">88/100</span>
          </div>
          <h4 className="text-xs font-bold text-white">Energy Efficiency (30%)</h4>
          <p className="text-[11px] text-emerald-400/60">Calculated from peak-to-average load ratio and sub-metered losses.</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-white">82/100</span>
          </div>
          <h4 className="text-xs font-bold text-white">Intensity Metric (30%)</h4>
          <p className="text-[11px] text-cyan-400/60">0.68 kg CO₂/unit vs national benchmark of 0.716 kg/unit.</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-white">85/100</span>
          </div>
          <h4 className="text-xs font-bold text-white">Renewables (20%)</h4>
          <p className="text-[11px] text-amber-400/60">42.8% on-site solar and green power wheeling agreements.</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-mono font-bold text-white">79/100</span>
          </div>
          <h4 className="text-xs font-bold text-white">Anomaly Health (10%)</h4>
          <p className="text-[11px] text-rose-400/60">Isolation Forest alerts resolved within 4-hour SLA.</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono font-bold text-white">96/100</span>
          </div>
          <h4 className="text-xs font-bold text-white">Data Quality (10%)</h4>
          <p className="text-[11px] text-purple-400/60">Zero division-by-zero errors, complete telemetry logs.</p>
        </div>
      </div>
    </div>
  );
};
