// Settings.tsx
import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  Database,
  Key,
  Bell,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../services/api';

export const Settings: React.FC = () => {
  const [ceaFactor, setCeaFactor] = useState<number>(0.716);
  const [lowThreshold, setLowThreshold] = useState<number>(1.0);
  const [highThreshold, setHighThreshold] = useState<number>(3.0);
  const [gasFactor, setGasFactor] = useState<number>(2.02);
  const [dieselFactor, setDieselFactor] = useState<number>(2.68);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Settings & Grid Factors</h1>
          <p className="text-xs text-emerald-400/70 mt-1">
            Configure emission benchmarks, rating classification thresholds, and regulatory compliance standards.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved Successfully!' : 'Save Configuration'}
        </button>
      </div>

      {/* Grid Emission Factors Card */}
      <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Grid & Fuel Emission Factors</h3>
        </div>
        <p className="text-xs text-emerald-400/60">
          Source baseline for Scope 1 direct fuel and Scope 2 purchased electricity conversions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs text-emerald-400/80 mb-1">CEA National Grid Factor (kg/kWh)</label>
            <input
              type="number"
              step="0.001"
              value={ceaFactor}
              onChange={(e) => setCeaFactor(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#040d0c] border border-emerald-950/80 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
            />
            <span className="text-[10px] text-emerald-400/50 mt-1 block">CEA CO2 Baseline Database Ver 20.0</span>
          </div>

          <div>
            <label className="block text-xs text-emerald-400/80 mb-1">Natural Gas Factor (kg/m³)</label>
            <input
              type="number"
              step="0.01"
              value={gasFactor}
              onChange={(e) => setGasFactor(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#040d0c] border border-emerald-950/80 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
            />
            <span className="text-[10px] text-emerald-400/50 mt-1 block">IPCC Guidelines for Industrial Boilers</span>
          </div>

          <div>
            <label className="block text-xs text-emerald-400/80 mb-1">Diesel Generator Factor (kg/L)</label>
            <input
              type="number"
              step="0.01"
              value={dieselFactor}
              onChange={(e) => setDieselFactor(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#040d0c] border border-emerald-950/80 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
            />
            <span className="text-[10px] text-emerald-400/50 mt-1 block">DG Set Backup Generation</span>
          </div>
        </div>
      </div>

      {/* Emission Intensity Thresholds */}
      <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Intensity Rating Thresholds (kg CO₂ / Unit)</h3>
        </div>
        <p className="text-xs text-emerald-400/60">
          Rules used to categorize facility production into LOW, MEDIUM, or HIGH emission intensity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs text-emerald-400/80 mb-1">LOW Intensity Upper Limit (kg/unit)</label>
            <input
              type="number"
              step="0.1"
              value={lowThreshold}
              onChange={(e) => setLowThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#040d0c] border border-emerald-950/80 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
            />
            <span className="text-[10px] text-emerald-400/50 mt-1 block">Readings &le; {lowThreshold} rated as LOW (Optimal)</span>
          </div>

          <div>
            <label className="block text-xs text-emerald-400/80 mb-1">MEDIUM Intensity Upper Limit (kg/unit)</label>
            <input
              type="number"
              step="0.1"
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#040d0c] border border-emerald-950/80 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
            />
            <span className="text-[10px] text-emerald-400/50 mt-1 block">Readings &gt; {highThreshold} flagged as HIGH intensity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
