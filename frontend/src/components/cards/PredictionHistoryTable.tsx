// PredictionHistoryTable.tsx
import React, { useState } from 'react';
import { Download, Filter, Search, CheckCircle2, AlertTriangle, ArrowUpDown } from 'lucide-react';

interface TelemetryRow {
  id: string;
  timestamp: string;
  factory: string;
  production: number; // units
  energy: number; // kWh
  co2: number; // kg
  intensity: number; // kg/unit
  rating: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  status: 'NORMAL' | 'ANOMALY';
}

const defaultRows: TelemetryRow[] = [
  { id: 'REC-901', timestamp: '2026-09-18 18:00', factory: 'Okhla Smart Auto Assembly', production: 1250, energy: 3820, co2: 2735.1, intensity: 2.19, rating: 'MEDIUM', status: 'NORMAL' },
  { id: 'REC-902', timestamp: '2026-09-18 17:00', factory: 'Noida Advanced Electronics', production: 2100, energy: 2450, co2: 1754.2, intensity: 0.84, rating: 'LOW', status: 'NORMAL' },
  { id: 'REC-903', timestamp: '2026-09-18 16:00', factory: 'Faridabad Heavy Engineering', production: 450, energy: 4120, co2: 2949.9, intensity: 6.56, rating: 'HIGH', status: 'ANOMALY' },
  { id: 'REC-904', timestamp: '2026-09-18 15:00', factory: 'Bawana Precision Plastics', production: 1800, energy: 2150, co2: 1539.4, intensity: 0.86, rating: 'LOW', status: 'NORMAL' },
  { id: 'REC-905', timestamp: '2026-09-18 14:00', factory: 'Gurugram Aero-Component Fab', production: 620, energy: 1980, co2: 1417.7, intensity: 2.29, rating: 'MEDIUM', status: 'NORMAL' },
  { id: 'REC-906', timestamp: '2026-09-18 13:00', factory: 'Manesar Lithium Cell Facility', production: 0, energy: 540, co2: 386.6, intensity: 0, rating: 'UNKNOWN', status: 'NORMAL' }
];

export const PredictionHistoryTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('ALL');

  const filtered = defaultRows.filter((row) => {
    const matchesSearch = row.factory.toLowerCase().includes(searchTerm.toLowerCase()) || row.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'ALL' || row.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const exportCSV = () => {
    const headers = ['Record ID,Timestamp,Factory,Production (Units),Energy (kWh),CO2 (kg),Intensity (kg/unit),Rating,Status\n'];
    const rows = filtered.map(r => `${r.id},${r.timestamp},"${r.factory}",${r.production},${r.energy},${r.co2},${r.intensity},${r.rating},${r.status}`);
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `greenmetrix_telemetry_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Live Telemetry & Prediction History</h3>
          <p className="text-xs text-emerald-400/60 mt-0.5">Streamed hourly energy ingestion and emission intensity logs</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
            <input
              type="text"
              placeholder="Search facility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#040d0c] border border-emerald-950/80 rounded-lg text-xs text-white placeholder-emerald-400/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-[#040d0c] border border-emerald-950/80 rounded-lg text-xs text-emerald-300 px-3 py-1.5 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">All Ratings</option>
            <option value="LOW">LOW Intensity</option>
            <option value="MEDIUM">MEDIUM Intensity</option>
            <option value="HIGH">HIGH Intensity</option>
            <option value="UNKNOWN">UNKNOWN (0 Prod)</option>
          </select>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-emerald-950/80 text-emerald-400/60 uppercase tracking-wider text-[11px]">
              <th className="pb-3 font-semibold">ID</th>
              <th className="pb-3 font-semibold">Timestamp</th>
              <th className="pb-3 font-semibold">Factory</th>
              <th className="pb-3 font-semibold text-right">Production</th>
              <th className="pb-3 font-semibold text-right">Energy (kWh)</th>
              <th className="pb-3 font-semibold text-right">CO₂ (kg)</th>
              <th className="pb-3 font-semibold text-right">Intensity</th>
              <th className="pb-3 font-semibold text-center">Rating</th>
              <th className="pb-3 font-semibold text-center">Anomaly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-950/40">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-emerald-500/5 transition-colors">
                <td className="py-3 font-mono text-emerald-400">{row.id}</td>
                <td className="py-3 text-gray-400">{row.timestamp}</td>
                <td className="py-3 font-medium text-white">{row.factory}</td>
                <td className="py-3 text-right font-mono text-white">
                  {row.production === 0 ? <span className="text-amber-400/80">0 (idle)</span> : row.production.toLocaleString()}
                </td>
                <td className="py-3 text-right font-mono text-emerald-300">{row.energy.toLocaleString()}</td>
                <td className="py-3 text-right font-mono text-cyan-300">{row.co2.toLocaleString()}</td>
                <td className="py-3 text-right font-mono text-white">
                  {row.production === 0 ? 'N/A' : row.intensity.toFixed(2)}
                </td>
                <td className="py-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                      row.rating === 'LOW'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : row.rating === 'MEDIUM'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : row.rating === 'HIGH'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                    }`}
                  >
                    {row.rating}
                  </span>
                </td>
                <td className="py-3 text-center">
                  {row.status === 'ANOMALY' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3" /> SPIKE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
