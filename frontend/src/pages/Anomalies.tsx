// Anomalies.tsx
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  AlertCircle
} from 'lucide-react';
import { anomaliesApi } from '../services/api';
import { Anomaly } from '../types';

const defaultAnomalies: Anomaly[] = [
  {
    id: 'anom-01',
    factory_id: 'fac-okhla',
    factory_name: 'Okhla Smart Auto Assembly',
    timestamp: '2026-09-18 16:45',
    energy_kwh: 4820,
    expected_kwh: 3400,
    anomaly_score: -0.68,
    severity: 'HIGH',
    status: 'OPEN',
    potential_root_cause: 'Chiller compressor valve jammed open causing continuous baseload surge during idle cycle.'
  },
  {
    id: 'anom-02',
    factory_id: 'fac-faridabad',
    factory_name: 'Faridabad Heavy Engineering',
    timestamp: '2026-09-18 14:10',
    energy_kwh: 5910,
    expected_kwh: 4300,
    anomaly_score: -0.74,
    severity: 'HIGH',
    status: 'INVESTIGATING',
    potential_root_cause: 'Induction furnace coil insulation degradation leading to reactive power spike.'
  },
  {
    id: 'anom-03',
    factory_id: 'fac-bawana',
    factory_name: 'Bawana Precision Plastics',
    timestamp: '2026-09-18 11:20',
    energy_kwh: 2850,
    expected_kwh: 2200,
    anomaly_score: -0.42,
    severity: 'MEDIUM',
    status: 'OPEN',
    potential_root_cause: 'Hydraulic pump pressure regulator drifting above setpoint.'
  },
  {
    id: 'anom-04',
    factory_id: 'fac-noida',
    factory_name: 'Noida Advanced Electronics',
    timestamp: '2026-09-17 09:15',
    energy_kwh: 2310,
    expected_kwh: 1800,
    anomaly_score: -0.35,
    severity: 'LOW',
    status: 'RESOLVED',
    potential_root_cause: 'Cleanroom AHU blower fan belt tension recalibrated.'
  }
];

export const Anomalies: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(defaultAnomalies);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const handleResolve = (id: string | number) => {
    setAnomalies(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a)
    );
  };

  const filtered = anomalies.filter(a => filterSeverity === 'ALL' || a.severity === filterSeverity);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Anomaly Detection Center</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Isolation Forest Active
            </span>
          </div>
          <p className="text-xs text-emerald-400/70 mt-1">
            Real-time unsupervised machine learning detection of energy spikes, equipment failure signatures, and leakage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-[#081512] border border-emerald-950/80 rounded-xl text-xs text-emerald-300 px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Grid of Anomalies */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl hover:border-emerald-700/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    item.severity === 'HIGH'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : item.severity === 'MEDIUM'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {item.severity} SPIKE
                </span>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    item.status === 'RESOLVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : item.status === 'INVESTIGATING'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {item.status}
                </span>

                <span className="text-xs font-medium text-emerald-400/60 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.timestamp}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{item.factory_name}</h3>
              <p className="text-xs text-emerald-400/80 leading-relaxed max-w-2xl">
                <span className="font-semibold text-emerald-300">Root Cause Diagnosis:</span> {item.potential_root_cause}
              </p>

              <div className="flex items-center gap-4 text-xs font-mono pt-1">
                <span className="text-rose-400 font-semibold">Observed: {item.energy_kwh} kWh</span>
                <span className="text-gray-400">Expected: {item.expected_kwh} kWh</span>
                <span className="text-amber-400 font-semibold">Delta: +{item.energy_kwh - item.expected_kwh} kWh (+{Math.round(((item.energy_kwh - item.expected_kwh)/item.expected_kwh)*100)}%)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              {item.status !== 'RESOLVED' ? (
                <button
                  onClick={() => handleResolve(item.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" /> Mitigated
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
