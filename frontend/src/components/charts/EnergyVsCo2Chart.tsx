// EnergyVsCo2Chart.tsx
import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell
} from 'recharts';

interface ScatterPoint {
  energy: number; // MWh
  co2: number; // Tonnes CO2
  efficiency: number;
  name: string;
}

const defaultScatterData: ScatterPoint[] = [
  { energy: 120, co2: 85, efficiency: 92, name: 'Shift A' },
  { energy: 145, co2: 104, efficiency: 88, name: 'Shift B' },
  { energy: 180, co2: 132, efficiency: 85, name: 'Peak Hours' },
  { energy: 95, co2: 66, efficiency: 94, name: 'Night Shift' },
  { energy: 210, co2: 155, efficiency: 81, name: 'Assembly Line 1' },
  { energy: 160, co2: 115, efficiency: 89, name: 'Assembly Line 2' },
  { energy: 130, co2: 91, efficiency: 91, name: 'Stamping Unit' },
  { energy: 240, co2: 180, efficiency: 78, name: 'Foundry Kiln' },
  { energy: 110, co2: 76, efficiency: 93, name: 'Packaging' },
  { energy: 175, co2: 124, efficiency: 86, name: 'HVAC Central' },
  { energy: 200, co2: 146, efficiency: 83, name: 'Paint Shop' },
  { energy: 85, co2: 58, efficiency: 96, name: 'Weekend Base' }
];

export const EnergyVsCo2Chart: React.FC<{ data?: ScatterPoint[] }> = ({ data = defaultScatterData }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#081b16]/90 to-[#04110e]/95 border border-emerald-500/25 p-5 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      {/* Background ambient cyan glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">Energy Consumption vs CO₂ Emissions</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              r = 0.94
            </span>
          </div>
          <p className="text-xs text-emerald-400/70 mt-0.5">Correlation coefficient • Emission intensity gradient across lines</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.25} />
            <XAxis
              type="number"
              dataKey="energy"
              name="Energy"
              unit=" MWh"
              stroke="#10b981"
              opacity={0.7}
              tick={{ fill: '#6ee7b7', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="co2"
              name="CO₂"
              unit=" t"
              stroke="#10b981"
              opacity={0.7}
              tick={{ fill: '#6ee7b7', fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="efficiency" range={[70, 220]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#10b981' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload as ScatterPoint;
                  return (
                    <div className="bg-[#04110e] border border-emerald-500/60 p-3 rounded-xl shadow-2xl text-xs space-y-1 backdrop-blur-xl">
                      <p className="font-bold text-white border-b border-emerald-950 pb-1">{p.name}</p>
                      <p className="text-emerald-300 font-mono">Energy: <strong className="text-white">{p.energy} MWh</strong></p>
                      <p className="text-cyan-300 font-mono">CO₂: <strong className="text-white">{p.co2} tCO2e</strong></p>
                      <p className="text-amber-300 font-mono">Efficiency: <strong className="text-white">{p.efficiency}%</strong></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Operations" data={data}>
              {data.map((entry, index) => {
                const color = entry.efficiency >= 90 ? '#10b981' : entry.efficiency >= 85 ? '#06b6d4' : '#f59e0b';
                return <Cell key={`cell-${index}`} fill={color} stroke="#040d0c" strokeWidth={1.5} />;
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
