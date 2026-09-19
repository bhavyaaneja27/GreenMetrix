// TransportVsCo2Chart.tsx
import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from 'recharts';

interface TransportPoint {
  distance: number; // km
  co2: number; // kg CO2
  weight: number; // tonnes
  route: string;
}

const defaultTransportData: TransportPoint[] = [
  { distance: 45, co2: 82, weight: 18, route: 'Delhi to Manesar' },
  { distance: 85, co2: 174, weight: 24, route: 'Delhi to Bawal' },
  { distance: 30, co2: 48, weight: 12, route: 'Okhla to Noida 62' },
  { distance: 110, co2: 240, weight: 26, route: 'Delhi to Neemrana' },
  { distance: 65, co2: 130, weight: 20, route: 'Faridabad to Greater Noida' },
  { distance: 140, co2: 310, weight: 28, route: 'Delhi to Meerut Industrial' },
  { distance: 25, co2: 38, weight: 10, route: 'Patparganj to Sahibabad' },
  { distance: 95, co2: 198, weight: 22, route: 'Bawana to Dharuhera' }
];

export const TransportVsCo2Chart: React.FC<{ data?: TransportPoint[] }> = ({ data = defaultTransportData }) => {
  return (
    <div className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Transport Distance vs CO₂ Emissions</h3>
          <p className="text-xs text-emerald-400/60 mt-0.5">Fleet logistics freight impact (Scope 3 Category 4)</p>
        </div>
        <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          Freight Telemetry
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.2} />
            <XAxis
              type="number"
              dataKey="distance"
              name="Distance"
              unit=" km"
              stroke="#10b981"
              opacity={0.6}
              tick={{ fill: '#6ee7b7', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="co2"
              name="CO₂"
              unit=" kg"
              stroke="#10b981"
              opacity={0.6}
              tick={{ fill: '#6ee7b7', fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="weight" range={[40, 160]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload as TransportPoint;
                  return (
                    <div className="bg-[#040d0c] border border-emerald-800/80 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                      <p className="font-semibold text-white">{p.route}</p>
                      <p className="text-emerald-400">Distance: <span className="font-mono text-white">{p.distance} km</span></p>
                      <p className="text-amber-400">CO₂: <span className="font-mono text-white">{p.co2} kg CO2e</span></p>
                      <p className="text-blue-400">Cargo Payload: <span className="font-mono text-white">{p.weight} tonnes</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Routes" data={data} fill="#06b6d4" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
