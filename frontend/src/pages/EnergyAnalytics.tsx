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
import { useDashboard } from '../context/DashboardContext';

const TIMEFRAME_DATA = {
  '24h': {
    kpis: {
      totalEnergy: '61.4',
      totalEnergyUnit: 'MWh',
      totalEnergySub: '-1.8% vs previous 24h',
      peakDemand: '4.82',
      peakDemandSub: 'Occurred 13:45 today',
      loadFactor: '78.2%',
      loadFactorSub: '+3.4% efficiency gain',
      solarConsumption: '36.2%',
      solarSub: '18.4 MWh on-site',
    },
    loadProfile: [
      { time: '00:00', baseload: 85, hvac: 35, production: 120, total: 240 },
      { time: '04:00', baseload: 85, hvac: 30, production: 140, total: 255 },
      { time: '08:00', baseload: 90, hvac: 75, production: 380, total: 545 },
      { time: '12:00', baseload: 90, hvac: 95, production: 420, total: 605 },
      { time: '16:00', baseload: 90, hvac: 85, production: 390, total: 565 },
      { time: '20:00', baseload: 85, hvac: 55, production: 240, total: 380 },
    ],
    tariffSplit: [
      { day: '00:00-06:00', onPeak: 45, offPeak: 195, solar: 0 },
      { day: '06:00-12:00', onPeak: 220, offPeak: 110, solar: 85 },
      { day: '12:00-18:00', onPeak: 260, offPeak: 95, solar: 120 },
      { day: '18:00-24:00', onPeak: 180, offPeak: 140, solar: 15 },
    ],
    tariffSubtext: '24-Hour Off-Peak vs Peak load curve',
  },
  '7d': {
    kpis: {
      totalEnergy: '430.0',
      totalEnergyUnit: 'MWh',
      totalEnergySub: '-3.5% vs previous 7 days',
      peakDemand: '5.12',
      peakDemandSub: 'Occurred 14:15 Tuesday',
      loadFactor: '76.4%',
      loadFactorSub: '+2.1% efficiency gain',
      solarConsumption: '34.8%',
      solarSub: '124.6 MWh on-site',
    },
    loadProfile: [
      { time: 'Mon', baseload: 590, hvac: 420, production: 1980, total: 2990 },
      { time: 'Tue', baseload: 610, hvac: 450, production: 2120, total: 3180 },
      { time: 'Wed', baseload: 600, hvac: 440, production: 2050, total: 3090 },
      { time: 'Thu', baseload: 620, hvac: 460, production: 2180, total: 3260 },
      { time: 'Fri', baseload: 610, hvac: 430, production: 2090, total: 3130 },
      { time: 'Sat', baseload: 480, hvac: 290, production: 1120, total: 1890 },
      { time: 'Sun', baseload: 420, hvac: 220, production: 850, total: 1490 },
    ],
    tariffSplit: [
      { day: 'Mon', onPeak: 380, offPeak: 220, solar: 95 },
      { day: 'Tue', onPeak: 410, offPeak: 240, solar: 110 },
      { day: 'Wed', onPeak: 395, offPeak: 250, solar: 105 },
      { day: 'Thu', onPeak: 420, offPeak: 235, solar: 115 },
      { day: 'Fri', onPeak: 405, offPeak: 245, solar: 100 },
      { day: 'Sat', onPeak: 210, offPeak: 180, solar: 120 },
      { day: 'Sun', onPeak: 150, offPeak: 160, solar: 125 },
    ],
    tariffSubtext: 'On-Peak vs Off-Peak load distribution (7 Days)',
  },
  '30d': {
    kpis: {
      totalEnergy: '1,842.1',
      totalEnergyUnit: 'MWh',
      totalEnergySub: '-4.2% vs previous 30 days',
      peakDemand: '5.45',
      peakDemandSub: 'Occurred Sep 18 14:10',
      loadFactor: '74.8%',
      loadFactorSub: '+1.5% efficiency gain',
      solarConsumption: '32.5%',
      solarSub: '542.8 MWh on-site',
    },
    loadProfile: [
      { time: 'Week 1', baseload: 2600, hvac: 1900, production: 8800, total: 13300 },
      { time: 'Week 2', baseload: 2650, hvac: 1950, production: 9100, total: 13700 },
      { time: 'Week 3', baseload: 2580, hvac: 1850, production: 8700, total: 13130 },
      { time: 'Week 4', baseload: 2700, hvac: 2000, production: 9300, total: 14000 },
    ],
    tariffSplit: [
      { day: 'Week 1', onPeak: 1750, offPeak: 1050, solar: 480 },
      { day: 'Week 2', onPeak: 1820, offPeak: 1100, solar: 510 },
      { day: 'Week 3', onPeak: 1710, offPeak: 1020, solar: 490 },
      { day: 'Week 4', onPeak: 1890, offPeak: 1150, solar: 530 },
    ],
    tariffSubtext: 'On-Peak vs Off-Peak load distribution (30 Days)',
  },
};

export const EnergyAnalytics: React.FC = () => {
  const { dateRange } = useDashboard();
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  const currentData = TIMEFRAME_DATA[timeframe];
  const { kpis, loadProfile, tariffSplit, tariffSubtext } = currentData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Energy Consumption Analytics</h1>
          <p className="text-xs text-emerald-400/70 mt-1">
            Granular load profiling, peak tariff optimization, sub-metering, and renewable generation tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-emerald-400/80 font-semibold hidden md:inline">
            Active Filter: <span className="text-emerald-300">{dateRange.label}</span>
          </span>
          <div className="flex items-center p-1 rounded-xl bg-[#081512] border border-emerald-950 text-xs">
            {(['24h', '7d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg uppercase font-semibold transition-all ${timeframe === tf
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-gray-400 hover:text-white'
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
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {kpis.totalEnergy} <span className="text-xs text-emerald-400">{kpis.totalEnergyUnit}</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">{kpis.totalEnergySub}</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <span className="text-xs text-emerald-400/60 uppercase font-semibold">Peak Demand</span>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
            {kpis.peakDemand} <span className="text-xs text-cyan-400">MW</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{kpis.peakDemandSub}</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <span className="text-xs text-emerald-400/60 uppercase font-semibold">Load Factor</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{kpis.loadFactor}</div>
          <p className="text-[11px] text-emerald-400 mt-1">{kpis.loadFactorSub}</p>
        </div>

        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-4">
          <span className="text-xs text-emerald-400/60 uppercase font-semibold">Solar Self-Consumption</span>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{kpis.solarConsumption}</div>
          <p className="text-[11px] text-purple-400 mt-1">{kpis.solarSub}</p>
        </div>
      </div>

      {/* Sub-system load breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Sub-Metered Load Profile (kW)</h3>
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {timeframe.toUpperCase()} Window
            </span>
          </div>
          <p className="text-xs text-emerald-400/60 mb-4">Baseload vs HVAC cooling vs Active Machine Lines</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loadProfile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Daily Tariff Split & Solar Offsetting</h3>
            <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              {timeframe.toUpperCase()} Window
            </span>
          </div>
          <p className="text-xs text-emerald-400/60 mb-4">{tariffSubtext}</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tariffSplit} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
