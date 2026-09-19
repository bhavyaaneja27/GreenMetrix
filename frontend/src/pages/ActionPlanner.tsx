// ActionPlanner.tsx
import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingDown,
  Plus,
  ArrowUpRight,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';

interface Initiative {
  id: string;
  title: string;
  facility: string;
  category: 'Solar' | 'HVAC' | 'Process' | 'Logistics' | 'Electrification';
  co2Abatement: number; // tCO2e/yr
  capex: number; // USD
  annualSavings: number; // USD/yr
  paybackYears: number;
  timeline: string;
  progressPct: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

const defaultInitiatives: Initiative[] = [
  {
    id: 'init-1',
    title: 'Phase 1: 500 kW Rooftop Solar PV Installation',
    facility: 'Okhla Smart Auto Assembly',
    category: 'Solar',
    co2Abatement: 375.0,
    capex: 320000,
    annualSavings: 74000,
    paybackYears: 4.3,
    timeline: 'Q2 2026',
    progressPct: 80,
    status: 'IN_PROGRESS'
  },
  {
    id: 'init-2',
    title: 'Waste Heat Recuperator on Melting Kiln',
    facility: 'Faridabad Heavy Engineering',
    category: 'Process',
    co2Abatement: 210.5,
    capex: 95000,
    annualSavings: 38000,
    paybackYears: 2.5,
    timeline: 'Q3 2026',
    progressPct: 45,
    status: 'IN_PROGRESS'
  },
  {
    id: 'init-3',
    title: 'VFD Retrofits on Primary Chiller Compressors',
    facility: 'Bawana Precision Plastics',
    category: 'HVAC',
    co2Abatement: 62.0,
    capex: 28000,
    annualSavings: 14500,
    paybackYears: 1.9,
    timeline: 'Q1 2026',
    progressPct: 100,
    status: 'COMPLETED'
  },
  {
    id: 'init-4',
    title: 'Electrification of 2x Natural Gas Steam Boilers',
    facility: 'Gurugram Aero-Component Fab',
    category: 'Electrification',
    co2Abatement: 195.0,
    capex: 140000,
    annualSavings: 42000,
    paybackYears: 3.3,
    timeline: 'Q4 2026',
    progressPct: 10,
    status: 'PLANNED'
  }
];

export const ActionPlanner: React.FC = () => {
  const [initiatives, setInitiatives] = useState<Initiative[]>(defaultInitiatives);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const totalAbatement = initiatives.reduce((sum, i) => sum + i.co2Abatement, 0);
  const totalSavings = initiatives.reduce((sum, i) => sum + i.annualSavings, 0);
  const totalCapex = initiatives.reduce((sum, i) => sum + i.capex, 0);

  const filtered = initiatives.filter(i => filterCategory === 'ALL' || i.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Decarbonization Action Planner</h1>
          <p className="text-xs text-emerald-400/70 mt-1">
            Capital expenditure roadmap, marginal abatement cost curve, and milestone progress toward Net-Zero 2030.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all">
            <Plus className="w-4 h-4" /> New Initiative
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
          <span className="text-xs text-emerald-400/60 uppercase font-semibold">Total Projected Abatement</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">-{totalAbatement.toFixed(1)} <span className="text-xs">tCO2e/yr</span></div>
          <p className="text-[11px] text-emerald-300 mt-1">32.8% towards 2030 Target</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
          <span className="text-xs text-emerald-400/60 uppercase font-semibold">Annual Cost Savings</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">${totalSavings.toLocaleString()} <span className="text-xs">/yr</span></div>
          <p className="text-[11px] text-amber-300 mt-1">Electricity & Fuel Displacement</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
          <span className="text-xs text-emerald-400/60 uppercase font-semibold">Committed CAPEX</span>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">${totalCapex.toLocaleString()}</div>
          <p className="text-[11px] text-cyan-300 mt-1">Avg Payback: 3.0 Years</p>
        </div>
      </div>

      {/* Initiatives Table / List */}
      <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-950/60">
          <h3 className="text-sm font-semibold text-white">Active Roadmap Initiatives</h3>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#040d0c] border border-emerald-950/80 rounded-xl text-xs text-emerald-300 px-3 py-1.5 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">All Categories</option>
            <option value="Solar">Solar PV</option>
            <option value="Process">Process</option>
            <option value="HVAC">HVAC</option>
            <option value="Electrification">Electrification</option>
          </select>
        </div>

        <div className="space-y-4">
          {filtered.map((init) => (
            <div
              key={init.id}
              className="p-4 rounded-xl bg-[#040d0c]/70 border border-emerald-950/80 hover:border-emerald-700/60 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {init.category}
                    </span>
                    <span className="text-xs text-emerald-400/60">{init.facility}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{init.title}</h4>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      init.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : init.status === 'IN_PROGRESS'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                    }`}
                  >
                    {init.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-emerald-400/70">
                  <span>Milestone Completion</span>
                  <span className="font-mono text-white">{init.progressPct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-emerald-950/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${init.progressPct}%` }}
                  />
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-emerald-950/40">
                <div>
                  <span className="text-[10px] text-emerald-400/60">Annual Abatement</span>
                  <p className="font-mono font-bold text-emerald-400">-{init.co2Abatement} tCO2e</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400/60">Annual Savings</span>
                  <p className="font-mono font-bold text-amber-400">${init.annualSavings.toLocaleString()}/yr</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400/60">Simple Payback</span>
                  <p className="font-mono font-bold text-purple-300">{init.paybackYears} Years</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400/60">Target Timeline</span>
                  <p className="font-mono font-bold text-white">{init.timeline}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
