// WhatIfQuickSimulator.tsx
import React, { useState } from 'react';
import { Sliders, Sparkles, TrendingDown, DollarSign, Zap, RefreshCw } from 'lucide-react';

export const WhatIfQuickSimulator: React.FC = () => {
  const [solarShare, setSolarShare] = useState<number>(35); // 0 - 100%
  const [heatRecovery, setHeatRecovery] = useState<number>(20); // 0 - 50%
  const [offPeakShift, setOffPeakShift] = useState<number>(25); // 0 - 50%

  // Real-time calculation based on industrial heuristics
  const baseEmissions = 1248.5; // tCO2e/yr
  const baseCost = 285000; // $/yr

  const co2ReductionPct = (solarShare * 0.45) + (heatRecovery * 0.35) + (offPeakShift * 0.15);
  const calculatedSavingsCo2 = Math.round((baseEmissions * (co2ReductionPct / 100)) * 10) / 10;
  const simulatedEmissions = Math.max(0, Math.round((baseEmissions - calculatedSavingsCo2) * 10) / 10);

  const costSavings = Math.round(baseCost * (co2ReductionPct * 0.0085));
  const estimatedCapex = Math.round((solarShare * 3200) + (heatRecovery * 1800) + (offPeakShift * 400));
  const paybackYears = costSavings > 0 ? (estimatedCapex / costSavings).toFixed(1) : '0';

  const resetValues = () => {
    setSolarShare(35);
    setHeatRecovery(20);
    setOffPeakShift(25);
  };

  return (
    <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">What-If Decarbonization Simulator</h3>
            <p className="text-xs text-emerald-400/60">Live interactive operational adjustments</p>
          </div>
        </div>
        <button
          onClick={resetValues}
          className="flex items-center gap-1 text-xs text-emerald-400/70 hover:text-emerald-300 transition-colors"
          title="Reset to defaults"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Slider 1 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-emerald-300 font-medium">Solar PV Penetration</span>
            <span className="font-mono text-white font-semibold">{solarShare}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={solarShare}
            onChange={(e) => setSolarShare(Number(e.target.value))}
            className="w-full h-1.5 bg-emerald-950/80 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-emerald-400/40">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Slider 2 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-cyan-300 font-medium">Heat Recovery Efficiency</span>
            <span className="font-mono text-white font-semibold">{heatRecovery}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={heatRecovery}
            onChange={(e) => setHeatRecovery(Number(e.target.value))}
            className="w-full h-1.5 bg-emerald-950/80 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-emerald-400/40">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Slider 3 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-amber-300 font-medium">Off-Peak Load Shifting</span>
            <span className="font-mono text-white font-semibold">{offPeakShift}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={offPeakShift}
            onChange={(e) => setOffPeakShift(Number(e.target.value))}
            className="w-full h-1.5 bg-emerald-950/80 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-emerald-400/40">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>
      </div>

      {/* Dynamic Results Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#040d0c]/80 border border-emerald-900/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-400/60 uppercase">CO₂ Abatement</div>
            <div className="text-sm font-bold font-mono text-emerald-400">-{calculatedSavingsCo2} t</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-400/60 uppercase">Simulated Total</div>
            <div className="text-sm font-bold font-mono text-white">{simulatedEmissions} t</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-400/60 uppercase">Annual Savings</div>
            <div className="text-sm font-bold font-mono text-amber-400">${costSavings.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-400/60 uppercase">Payback Time</div>
            <div className="text-sm font-bold font-mono text-purple-300">{paybackYears} yrs</div>
          </div>
        </div>
      </div>
    </div>
  );
};
