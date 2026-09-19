// DigitalTwin.tsx
import React, { useState } from 'react';
import {
  Sliders,
  Play,
  BookmarkPlus,
  TrendingDown,
  DollarSign,
  Zap,
  Leaf,
  Clock,
  Sparkles,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const DigitalTwin: React.FC = () => {
  // Input parameters
  const [selectedFacility, setSelectedFacility] = useState('Okhla Smart Auto Assembly');
  const [solarKw, setSolarKw] = useState(350);
  const [batteryKwh, setBatteryKwh] = useState(150);
  const [heatRecoveryPct, setHeatRecoveryPct] = useState(25);
  const [offPeakShiftPct, setOffPeakShiftPct] = useState(30);
  const [electrifyBoiler, setElectrifyBoiler] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Baseline values
  const baseEmissions = 1248.5; // tCO2e/yr
  const baseEnergyCost = 285000; // USD/yr

  // Physics-based simulation calculations
  const solarSavingsCo2 = (solarKw * 1400 * 0.716) / 1000; // ~350kW * 1400 kWh/kWp * 0.716 kg/kWh
  const heatRecoverySavingsCo2 = baseEmissions * (heatRecoveryPct * 0.006);
  const shiftSavingsCo2 = baseEmissions * (offPeakShiftPct * 0.003);
  const boilerSavingsCo2 = electrifyBoiler ? 180 : 0;

  const totalReductionCo2 = Math.round((solarSavingsCo2 + heatRecoverySavingsCo2 + shiftSavingsCo2 + boilerSavingsCo2) * 10) / 10;
  const simulatedEmissions = Math.max(100, Math.round((baseEmissions - totalReductionCo2) * 10) / 10);
  const reductionPct = Math.round((totalReductionCo2 / baseEmissions) * 1000) / 10;

  // Financial calculations
  const capex = (solarKw * 750) + (batteryKwh * 350) + (heatRecoveryPct * 1200) + (electrifyBoiler ? 45000 : 0);
  const annualSavingsDollars = Math.round((totalReductionCo2 * 75) + (offPeakShiftPct * 800));
  const paybackYears = annualSavingsDollars > 0 ? (capex / annualSavingsDollars).toFixed(1) : '0';

  const chartData = [
    { name: 'Scope 1 Direct', Baseline: 420, Simulated: electrifyBoiler ? 240 : 380 },
    { name: 'Scope 2 Grid', Baseline: 680, Simulated: Math.max(180, Math.round(680 - (solarSavingsCo2 * 0.7))) },
    { name: 'Scope 3 Logistics', Baseline: 148, Simulated: Math.max(100, Math.round(148 - (shiftSavingsCo2 * 0.5))) }
  ];

  const handleSaveScenario = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setSolarKw(350);
    setBatteryKwh(150);
    setHeatRecoveryPct(25);
    setOffPeakShiftPct(30);
    setElectrifyBoiler(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Digital Twin Operational Simulator</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Interactive Physics Model
            </span>
          </div>
          <p className="text-xs text-emerald-400/70 mt-1">
            Simulate capital investments, renewable microgrid dispatch, and thermal efficiency before physical deployment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#081512] hover:bg-[#0c221d] text-emerald-400 border border-emerald-950 text-xs font-medium transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleSaveScenario}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <BookmarkPlus className="w-4 h-4" />}
            {savedSuccess ? 'Saved to Roadmap!' : 'Save Scenario'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl space-y-5">
          <div>
            <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
              Target Facility
            </label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full bg-[#040d0c] border border-emerald-950/80 rounded-xl text-xs text-white p-2.5 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Okhla Smart Auto Assembly">Okhla Smart Auto Assembly</option>
              <option value="Noida Advanced Electronics">Noida Advanced Electronics</option>
              <option value="Bawana Precision Plastics">Bawana Precision Plastics</option>
              <option value="Faridabad Heavy Engineering">Faridabad Heavy Engineering</option>
            </select>
          </div>

          <div className="space-y-4 pt-2 border-t border-emerald-950/60">
            {/* Solar Control */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white font-medium">Rooftop Solar PV</span>
                <span className="font-mono text-emerald-400 font-bold">{solarKw} kWp</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={solarKw}
                onChange={(e) => setSolarKw(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-950/80 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Battery Control */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white font-medium">BESS Battery Storage</span>
                <span className="font-mono text-cyan-400 font-bold">{batteryKwh} kWh</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="25"
                value={batteryKwh}
                onChange={(e) => setBatteryKwh(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-950/80 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Heat Recovery */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white font-medium">Waste Heat Recovery</span>
                <span className="font-mono text-amber-400 font-bold">{heatRecoveryPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={heatRecoveryPct}
                onChange={(e) => setHeatRecoveryPct(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-950/80 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Off peak shift */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white font-medium">Off-Peak Load Shifting</span>
                <span className="font-mono text-purple-400 font-bold">{offPeakShiftPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={offPeakShiftPct}
                onChange={(e) => setOffPeakShiftPct(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-950/80 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Boiler Electrification Switch */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Electrify Gas Boilers</div>
                <div className="text-[10px] text-emerald-400/60">Switch from gas to high-temp heat pumps</div>
              </div>
              <input
                type="checkbox"
                checked={electrifyBoiler}
                onChange={(e) => setElectrifyBoiler(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results and Charts Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Key Impact Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
              <span className="text-[10px] text-emerald-400/60 uppercase font-semibold">CO₂ Abatement</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">-{totalReductionCo2} t</div>
              <span className="text-[11px] text-emerald-300 font-semibold">-{reductionPct}% total</span>
            </div>

            <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
              <span className="text-[10px] text-emerald-400/60 uppercase font-semibold">Simulated Emissions</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">{simulatedEmissions} t</div>
              <span className="text-[11px] text-gray-400">Baseline: {baseEmissions} t</span>
            </div>

            <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
              <span className="text-[10px] text-emerald-400/60 uppercase font-semibold">Annual OPEX Savings</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">${annualSavingsDollars.toLocaleString()}</div>
              <span className="text-[11px] text-amber-300 font-medium">Grid & Carbon tax</span>
            </div>

            <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
              <span className="text-[10px] text-emerald-400/60 uppercase font-semibold">Simple Payback</span>
              <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{paybackYears} yrs</div>
              <span className="text-[11px] text-purple-400">CAPEX: ${capex.toLocaleString()}</span>
            </div>
          </div>

          {/* Side by side chart */}
          <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white mb-1">Baseline vs Simulated Decarbonization by Scope (tCO2e)</h3>
            <p className="text-xs text-emerald-400/60 mb-4">Direct Scope 1, Scope 2 electricity, and supply chain Scope 3</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" stroke="#10b981" opacity={0.6} tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                  <YAxis stroke="#10b981" opacity={0.6} tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#040d0c', borderColor: '#064e3b', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
