// EmissionSourceDonut.tsx
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface SourceSlice {
  name: string;
  value: number;
  color: string;
}

const defaultSlices: SourceSlice[] = [
  { name: 'Grid Electricity', value: 58, color: '#10b981' },
  { name: 'Natural Gas Boilers', value: 24, color: '#06b6d4' },
  { name: 'Diesel Generators', value: 11, color: '#f59e0b' },
  { name: 'Logistics / Fleet', value: 7, color: '#8b5cf6' }
];

export const EmissionSourceDonut: React.FC<{ data?: SourceSlice[] }> = ({ data = defaultSlices }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Emissions by Source & Fuel</h3>
          <p className="text-xs text-emerald-400/60 mt-0.5">Direct vs indirect fuel contribution shares</p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          100% Accounted
        </span>
      </div>

      <div className="h-64 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#040d0c" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#040d0c',
                borderColor: '#064e3b',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#ecfdf5'
              }}
              formatter={(val: number) => [`${val}%`, 'Share']}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', bottom: 0 }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
          <span className="text-xl font-bold font-mono text-white">{total}%</span>
          <span className="text-[10px] uppercase tracking-wider text-emerald-400/60">Total GHG</span>
        </div>
      </div>
    </div>
  );
};
