// ScenarioCompareChart.tsx
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

interface ScenarioComparison {
  scope: string;
  Baseline: number;
  Current: number;
  NetZeroTarget: number;
}

const defaultScenarioData: ScenarioComparison[] = [
  { scope: 'Scope 1 (Gas & Fuel)', Baseline: 450, Current: 380, NetZeroTarget: 120 },
  { scope: 'Scope 2 (Electricity)', Baseline: 820, Current: 640, NetZeroTarget: 210 },
  { scope: 'Scope 3 (Supply/Freight)', Baseline: 310, Current: 280, NetZeroTarget: 95 }
];

export const ScenarioCompareChart: React.FC<{ data?: ScenarioComparison[] }> = ({ data = defaultScenarioData }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#081b16]/90 to-[#04110e]/95 border border-emerald-500/25 p-5 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/20 transition-all duration-500" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">Scenario Decarbonization Pathways</h3>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              -34.6% Progress
            </span>
          </div>
          <p className="text-xs text-emerald-400/70 mt-0.5">Historical Baseline vs Current Operations vs 2030 Net-Zero Target</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="scenBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="scenCurr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="scenNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.25} vertical={false} />
            <XAxis dataKey="scope" stroke="#10b981" opacity={0.7} tick={{ fill: '#6ee7b7', fontSize: 11 }} />
            <YAxis stroke="#10b981" opacity={0.7} tick={{ fill: '#6ee7b7', fontSize: 11 }} unit=" t" />
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
            <Bar dataKey="Baseline" fill="url(#scenBase)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Current" fill="url(#scenCurr)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="NetZeroTarget" fill="url(#scenNet)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
