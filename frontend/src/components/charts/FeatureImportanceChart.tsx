// FeatureImportanceChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface FeatureScore {
  feature: string;
  importance: number;
}

const defaultFeatures: FeatureScore[] = [
  { feature: 'Production Output (Units)', importance: 0.384 },
  { feature: 'Boiler Operating Temp (°C)', importance: 0.221 },
  { feature: 'Cooling Degree Hours (CDD)', importance: 0.165 },
  { feature: 'Active Machine Shift Count', importance: 0.118 },
  { feature: 'Grid Emission Factor (CEA)', importance: 0.072 },
  { feature: 'Ambient Humidity (%)', importance: 0.040 }
];

const vibrantGradients = [
  { start: '#34d399', end: '#059669' }, // Emerald
  { start: '#22d3ee', end: '#0891b2' }, // Cyan
  { start: '#60a5fa', end: '#2563eb' }, // Blue
  { start: '#c084fc', end: '#7c3aed' }, // Purple
  { start: '#fbbf24', end: '#d97706' }, // Amber
  { start: '#f472b6', end: '#db2777' }  // Pink
];

export const FeatureImportanceChart: React.FC<{ data?: FeatureScore[] }> = ({ data = defaultFeatures }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#081b16]/90 to-[#04110e]/95 border border-emerald-500/25 p-5 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">Gradient Boosting Feature Importance</h3>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              R² = 0.9891
            </span>
          </div>
          <p className="text-xs text-emerald-400/70 mt-0.5">Top drivers influencing hourly factory energy & emissions</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 35, left: 75, bottom: 0 }}
          >
            <defs>
              {vibrantGradients.map((g, idx) => (
                <linearGradient key={`grad-${idx}`} id={`featGrad-${idx}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={g.start} />
                  <stop offset="100%" stopColor={g.end} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.25} horizontal={false} />
            <XAxis
              type="number"
              stroke="#10b981"
              opacity={0.7}
              tick={{ fill: '#6ee7b7', fontSize: 10 }}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <YAxis
              type="category"
              dataKey="feature"
              stroke="#10b981"
              opacity={0.7}
              tick={{ fill: '#ecfdf5', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#04110e',
                borderColor: '#10b981',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#ecfdf5',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(16,185,129,0.2)'
              }}
              formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, 'Weight']}
            />
            <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`url(#featGrad-${index % vibrantGradients.length})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
