// EmissionTrendChart.tsx
import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface TrendPoint {
  time: string;
  measured: number;
  baseline: number;
  predicted: number;
}

const defaultTrendData: TrendPoint[] = [
  { time: '00:00', measured: 142, baseline: 180, predicted: 140 },
  { time: '03:00', measured: 120, baseline: 175, predicted: 122 },
  { time: '06:00', measured: 165, baseline: 185, predicted: 160 },
  { time: '09:00', measured: 245, baseline: 210, predicted: 238 },
  { time: '12:00', measured: 278, baseline: 230, predicted: 282 },
  { time: '15:00', measured: 290, baseline: 240, predicted: 288 },
  { time: '18:00', measured: 230, baseline: 215, predicted: 235 },
  { time: '21:00', measured: 180, baseline: 190, predicted: 178 }
];

export const EmissionTrendChart: React.FC<{ data?: TrendPoint[] }> = ({ data = defaultTrendData }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#081b16]/90 to-[#04110e]/95 border border-emerald-500/25 p-5 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">Emission Trend & ML Forecasting</h3>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Telemetry
            </span>
          </div>
          <p className="text-xs text-emerald-400/70 mt-0.5">Continuous telemetry vs CEA baseline vs Gradient Boosted forecast</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMeasuredGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="60%" stopColor="#059669" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#040d0c" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.25} vertical={false} />
            <XAxis dataKey="time" stroke="#10b981" opacity={0.7} tick={{ fill: '#6ee7b7', fontSize: 11 }} />
            <YAxis stroke="#10b981" opacity={0.7} tick={{ fill: '#6ee7b7', fontSize: 11 }} unit=" kg" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#04110e',
                borderColor: '#10b981',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#ecfdf5',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(16,185,129,0.2)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
            <Area
              type="monotone"
              dataKey="measured"
              name="Measured CO₂ (kg)"
              stroke="#34d399"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorMeasuredGlow)"
            />
            <Line
              type="monotone"
              dataKey="baseline"
              name="CEA 0.716 Baseline (kg)"
              stroke="#94a3b8"
              strokeWidth={1.8}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name="ML Forecast (kg)"
              stroke="#22d3ee"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#22d3ee', stroke: '#040d0c', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
