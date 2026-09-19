// FactoryDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Factory as FactoryIcon,
  MapPin,
  Zap,
  Cloud,
  Gauge,
  Sliders,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Award,
  CheckCircle2
} from 'lucide-react';
import { factoriesApi, analyticsApi } from '../services/api';
import { Factory, FactoryReading } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const FactoryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [readings, setReadings] = useState<FactoryReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const f = await factoriesApi.getById(id);
        setFactory(f);
        const r = await factoriesApi.getReadings(id, 24);
        setReadings(r);
      } catch (err) {
        console.error('Failed to load factory details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-emerald-400/60">Loading facility telemetry...</div>;
  }

  if (!factory) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-white">Facility not found</p>
        <Link to="/factories" className="text-xs text-emerald-400 underline">Back to directory</Link>
      </div>
    );
  }

  const chartData = readings.map((r) => ({
    time: r.timestamp.slice(11, 16),
    energy: r.energy_kwh,
    co2: r.co2_kg,
    production: r.production_units
  }));

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-950/60">
        <div className="flex items-center gap-3">
          <Link
            to="/factories"
            className="p-2 rounded-xl bg-[#081512] hover:bg-[#0c221d] text-emerald-400 border border-emerald-950 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{factory.name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {factory.industry_type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400/60 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{factory.city}, {factory.state} • Coordinates: {factory.latitude?.toFixed(4)}, {factory.longitude?.toFixed(4)}</span>
            </div>
          </div>
        </div>

        <Link
          to={`/digital-twin?factoryId=${factory.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
        >
          <Sliders className="w-3.5 h-3.5" /> Simulate Decarbonization
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <div className="text-xs text-emerald-400/60 uppercase">Peak Capacity</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{factory.peak_capacity_mw ?? 3.5} MW</div>
          <div className="text-[10px] text-emerald-400/50 mt-1">Transformer Load Index: 64%</div>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <div className="text-xs text-emerald-400/60 uppercase">Annual Target</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{factory.annual_target_co2?.toLocaleString() ?? 1200} tCO2e</div>
          <div className="text-[10px] text-emerald-400/50 mt-1">Current YTD: 842 tCO2e</div>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <div className="text-xs text-emerald-400/60 uppercase">Baseline Factor</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">0.716 kg/kWh</div>
          <div className="text-[10px] text-emerald-400/50 mt-1">CEA Version 20.0 National Grid</div>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <div className="text-xs text-emerald-400/60 uppercase">Telemetry Health</div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-1">99.8%</div>
          <div className="text-[10px] text-emerald-400/50 mt-1">0 missing packets in 48h</div>
        </div>
      </div>

      {/* Telemetry Chart */}
      <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">24-Hour Continuous Telemetry Stream</h3>
            <p className="text-xs text-emerald-400/60">Hourly Energy Consumption (kWh) vs Estimated CO₂ (kg)</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {readings.length} Samples
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.2} vertical={false} />
              <XAxis dataKey="time" stroke="#10b981" opacity={0.6} tick={{ fill: '#6ee7b7', fontSize: 10 }} />
              <YAxis stroke="#10b981" opacity={0.6} tick={{ fill: '#6ee7b7', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040d0c',
                  borderColor: '#064e3b',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#ecfdf5'
                }}
              />
              <Area type="monotone" dataKey="energy" name="Energy (kWh)" stroke="#06b6d4" fill="url(#colorEnergy)" />
              <Area type="monotone" dataKey="co2" name="CO₂ (kg)" stroke="#10b981" fill="url(#colorCo2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
