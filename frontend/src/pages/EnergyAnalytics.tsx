// EnergyAnalytics.tsx
import React, { useState } from 'react';
import {
  Zap,
  TrendingDown,
  Clock,
  Calendar,
  Layers,
  ArrowUpRight,
  Download,
  Filter
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const hourlyData = [
  { time: '00:00', baseload: 85, hvac: 35, production: 120, total: 240 },
  { time: '04:00', baseload: 85, hvac: 30, production: 140, total: 255 },
  { time: '08:00', baseload: 90, hvac: 75, production: 380, total: 545 },
  { time: '12:00', baseload: 90, hvac: 95, production: 420, total: 605 },
  { time: '16:00', baseload: 90, hvac: 85, production: 390, total: 565 },
  { time: '20:00', baseload: 85, hvac: 55, production: 240, total: 380 }
];

const peakShiftingData = [
  { day: 'Mon', onPeak: 380, offPeak: 220, solar: 95 },
  { day: 'Tue', onPeak: 410, offPeak: 240, solar: 110 },
  { day: 'Wed', onPeak: 395, offPeak: 250, solar: 105 },
  { day: 'Thu', onPeak: 420, offPeak: 235, solar: 115 },
  { day: 'Fri', onPeak: 405, offPeak: 245, solar: 100 },
  { day: 'Sat', onPeak: 210, offPeak: 180, solar: 120 },
  { day: 'Sun', onPeak: 150, offPeak: 160, solar: 125 }
];

export const EnergyAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Energy Consumption Analytics</h1>
          <p className="text-xs text-emerald-400/70 mt-1">
            Granular load profiling, peak tariff optimization, sub-metering, and renewable generation tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[#081512] border border-emerald-950 text-xs">
            {(['24h', '7d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg uppercase font-semibold transition-all ${
                  timeframe === tf ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <span className="text-xs text-emerald-400/60 uppercase font-semibold">Total Energy</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">1,842.1 <span className="text-xs text-emerald-400">MWh</span></div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">-4.2% vs previous cycle</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <span className="text-xs text-emerald-400/60 uppercase font-semibold">Peak Demand</span>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">4.82 <span className="text-xs text-cyan-400">MW</span></div>
          <p className="text-[11px] text-gray-400 mt-1">Occurred 13:45 Tuesday</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <span className="text-xs text-emerald-400/60 uppercase font-semibold">Load Factor</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">76.4%</div>
          <p className="text-[11px] text-emerald-400 mt-1">+2.1% efficiency gain</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <span className="text-xs text-emerald-400/60 uppercase font-semibold">Solar Self-Consumption</span>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">34.8%</div>
          <p className="text-[11px] text-purple-400 mt-1">124.6 MWh on-site</p>
        </div>
      </div>

      {/* Sub-system load breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-1">Sub-Metered Load Profile (kW)</h3>
          <p className="text-xs text-emerald-400/60 mb-4">Baseload vs HVAC cooling vs Active Machine Lines</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.2} vertical={false} />
                <XAxis dataKey="time" stroke="#10b981" opacity={0.6} tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                <YAxis stroke="#10b981" opacity={0.6} tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#040d0c', borderColor: '#064e3b', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Area type="monotone" dataKey="baseload" stackId="1" fill="#64748b" stroke="#64748b" name="Baseload" />
                <Area type="monotone" dataKey="hvac" stackId="1" fill="#06b6d4" stroke="#06b6d4" name="HVAC Cooling" />
                <Area type="monotone" dataKey="production" stackId="1" fill="#10b981" stroke="#10b981" name="Production Units" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-1">Daily Tariff Split & Solar Offsetting</h3>
          <p className="text-xs text-emerald-400/60 mb-4">On-Peak vs Off-Peak load distribution</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakShiftingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.2} vertical={false} />
                <XAxis dataKey="day" stroke="#10b981" opacity={0.6} tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                <YAxis stroke="#10b981" opacity={0.6} tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#040d0c', borderColor: '#064e3b', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Bar dataKey="onPeak" fill="#f59e0b" name="On-Peak Tariff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offPeak" fill="#06b6d4" name="Off-Peak Grid" radius={[4, 4, 0, 0]} />
                <Bar dataKey="solar" fill="#10b981" name="Rooftop Solar" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
