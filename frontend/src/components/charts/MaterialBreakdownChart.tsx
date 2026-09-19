// MaterialBreakdownChart.tsx
import React from 'react';
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

interface MaterialData {
  month: string;
  Steel: number;
  Aluminum: number;
  Polymers: number;
  Chemicals: number;
}

const defaultData: MaterialData[] = [
  { month: 'Jan', Steel: 420, Aluminum: 280, Polymers: 310, Chemicals: 190 },
  { month: 'Feb', Steel: 390, Aluminum: 260, Polymers: 290, Chemicals: 180 },
  { month: 'Mar', Steel: 460, Aluminum: 310, Polymers: 340, Chemicals: 220 },
  { month: 'Apr', Steel: 440, Aluminum: 290, Polymers: 320, Chemicals: 210 },
  { month: 'May', Steel: 480, Aluminum: 330, Polymers: 360, Chemicals: 240 },
  { month: 'Jun', Steel: 430, Aluminum: 300, Polymers: 310, Chemicals: 200 }
];

export const MaterialBreakdownChart: React.FC<{ data?: MaterialData[] }> = ({ data = defaultData }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#081b16]/90 to-[#04110e]/95 border border-emerald-500/25 p-5 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      {/* Background ambient corner glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">Material Consumption Breakdown</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Scope 3 Upstream
            </span>
          </div>
          <p className="text-xs text-emerald-400/70 mt-0.5">Raw material throughput impact across production lines (Tonnes)</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSteel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="gradAluminum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                <stop offset="100%" stopColor="#0891b2" stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="gradPolymers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="gradChemicals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.85} />
              </linearGradient>
              <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.25} vertical={false} />
            <XAxis dataKey="month" stroke="#10b981" opacity={0.7} tick={{ fill: '#6ee7b7', fontSize: 11 }} />
            <YAxis stroke="#10b981" opacity={0.7} tick={{ fill: '#6ee7b7', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#04110e',
                borderColor: '#10b981',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#ecfdf5',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(16,185,129,0.2)'
              }}
              cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="Steel" fill="url(#gradSteel)" radius={[6, 6, 0, 0]} filter="url(#barShadow)" />
            <Bar dataKey="Aluminum" fill="url(#gradAluminum)" radius={[6, 6, 0, 0]} filter="url(#barShadow)" />
            <Bar dataKey="Polymers" fill="url(#gradPolymers)" radius={[6, 6, 0, 0]} filter="url(#barShadow)" />
            <Bar dataKey="Chemicals" fill="url(#gradChemicals)" radius={[6, 6, 0, 0]} filter="url(#barShadow)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
