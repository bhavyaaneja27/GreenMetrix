// CityMap.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Layers,
  Zap,
  Cloud,
  Truck,
  ShieldAlert,
  Sliders,
  ChevronRight,
  TrendingDown,
  Info,
  X,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../utils/cn';

// Industrial Zones in Delhi NCR
interface IndustrialZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  emissionsToday: number; // kg CO2
  currentLoad: number; // kW
  intensity: number; // kg/unit
  rating: 'LOW' | 'MEDIUM' | 'HIGH';
  renewablePct: number;
  cleanScore: number;
  category: string;
  status: 'OPTIMAL' | 'ELEVATED' | 'ANOMALY';
  activeLines: number;
}

const delhiZones: IndustrialZone[] = [
  {
    id: 'z-okhla',
    name: 'Okhla Smart Auto Assembly',
    lat: 28.5355,
    lng: 77.2732,
    emissionsToday: 1248.5,
    currentLoad: 1842.1,
    intensity: 0.68,
    rating: 'LOW',
    renewablePct: 42.8,
    cleanScore: 84,
    category: 'Automotive & Heavy Fab',
    status: 'OPTIMAL',
    activeLines: 6
  },
  {
    id: 'z-noida',
    name: 'Noida Advanced Electronics',
    lat: 28.6279,
    lng: 77.3749,
    emissionsToday: 890.2,
    currentLoad: 1120.4,
    intensity: 0.42,
    rating: 'LOW',
    renewablePct: 68.4,
    cleanScore: 91,
    category: 'Semiconductors & PCBA',
    status: 'OPTIMAL',
    activeLines: 8
  },
  {
    id: 'z-bawana',
    name: 'Bawana Precision Polymers',
    lat: 28.7963,
    lng: 77.0392,
    emissionsToday: 1540.8,
    currentLoad: 2150.0,
    intensity: 1.84,
    rating: 'MEDIUM',
    renewablePct: 24.5,
    cleanScore: 72,
    category: 'Plastics & Injection',
    status: 'ELEVATED',
    activeLines: 5
  },
  {
    id: 'z-faridabad',
    name: 'Faridabad Heavy Forging',
    lat: 28.3846,
    lng: 77.3075,
    emissionsToday: 2450.0,
    currentLoad: 3410.8,
    intensity: 3.12,
    rating: 'HIGH',
    renewablePct: 15.2,
    cleanScore: 58,
    category: 'Metals & Metallurgy',
    status: 'ANOMALY',
    activeLines: 4
  },
  {
    id: 'z-mayapuri',
    name: 'Mayapuri Industrial Area',
    lat: 28.6366,
    lng: 77.1265,
    emissionsToday: 980.4,
    currentLoad: 1350.2,
    intensity: 1.15,
    rating: 'MEDIUM',
    renewablePct: 35.0,
    cleanScore: 78,
    category: 'Scrap & Metal Recycling',
    status: 'OPTIMAL',
    activeLines: 4
  },
  {
    id: 'z-patparganj',
    name: 'Patparganj Electronic Cluster',
    lat: 28.6288,
    lng: 77.3114,
    emissionsToday: 620.1,
    currentLoad: 890.5,
    intensity: 0.51,
    rating: 'LOW',
    renewablePct: 52.0,
    cleanScore: 88,
    category: 'Printing & Instruments',
    status: 'OPTIMAL',
    activeLines: 3
  },
  {
    id: 'z-gurugram',
    name: 'Gurugram Udyog Vihar Fab',
    lat: 28.5023,
    lng: 77.0864,
    emissionsToday: 1110.6,
    currentLoad: 1650.0,
    intensity: 0.74,
    rating: 'LOW',
    renewablePct: 48.0,
    cleanScore: 85,
    category: 'Precision Mechanics',
    status: 'OPTIMAL',
    activeLines: 7
  },
  {
    id: 'z-manesar',
    name: 'Manesar Lithium Tech Park',
    lat: 28.3588,
    lng: 76.9408,
    emissionsToday: 1320.0,
    currentLoad: 1980.4,
    intensity: 0.95,
    rating: 'MEDIUM',
    renewablePct: 38.0,
    cleanScore: 79,
    category: 'Battery Storage & EV',
    status: 'OPTIMAL',
    activeLines: 5
  }
];

// Custom Pulsing DivIcon for industrial emitters
const createPulsingIcon = (rating: 'LOW' | 'MEDIUM' | 'HIGH', isSelected: boolean) => {
  const colorMap = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f43f5e'
  };
  const color = colorMap[rating];

  return L.divIcon({
    className: 'custom-radar-pin',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: ${isSelected ? '36px' : '28px'}; height: ${isSelected ? '36px' : '28px'}; border-radius: 50%; background: ${color}20; border: 1px solid ${color}80; animation: radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 14px; height: 14px; border-radius: 50%; background: ${color}; box-shadow: 0 0 12px ${color}; border: 2px solid #040d0c;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export const CityMap: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<IndustrialZone | null>(delhiZones[0]);
  const [layers, setLayers] = useState({
    emissions: true,
    energy: true,
    mobility: false,
    radarSweep: true
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Aggregate stats
  const totalEmissions = delhiZones.reduce((acc, z) => acc + z.emissionsToday, 0);
  const avgCleanScore = Math.round(delhiZones.reduce((acc, z) => acc + z.cleanScore, 0) / delhiZones.length);
  const avgRenewable = Math.round((delhiZones.reduce((acc, z) => acc + z.renewablePct, 0) / delhiZones.length) * 10) / 10;

  return (
    <div className="relative h-[calc(100vh-6rem)] w-full overflow-hidden rounded-2xl border border-emerald-950/60 bg-[#040d0c] shadow-2xl">
      {/* Map Container */}
      <MapContainer
        center={[28.5800, 77.2000]}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        {/* Watermark-Free High-Definition Dark Canvas Tiles (No API key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />

        {/* Pulsing Emitter Circles on Industrial Zones */}
        {delhiZones.map((zone) => {
          const color = zone.rating === 'LOW' ? '#10b981' : zone.rating === 'MEDIUM' ? '#f59e0b' : '#f43f5e';
          return (
            <React.Fragment key={zone.id}>
              {layers.emissions && (
                <Circle
                  center={[zone.lat, zone.lng]}
                  radius={zone.emissionsToday * 1.5}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.15,
                    color: color,
                    weight: 1,
                    dashArray: '4, 4'
                  }}
                />
              )}

              <Marker
                position={[zone.lat, zone.lng]}
                icon={createPulsingIcon(zone.rating, selectedZone?.id === zone.id)}
                eventHandlers={{
                  click: () => {
                    setSelectedZone(zone);
                    setIsDrawerOpen(true);
                  }
                }}
              >
                <Popup className="dark-popup">
                  <div className="p-1 text-xs">
                    <h4 className="font-bold text-emerald-400">{zone.name}</h4>
                    <p className="text-gray-300">{zone.category}</p>
                    <div className="mt-2 space-y-1 text-[11px] font-mono">
                      <div>Load: <span className="text-white">{zone.currentLoad} kW</span></div>
                      <div>CO₂: <span className="text-white">{zone.emissionsToday} kg</span></div>
                      <div>Intensity: <span className="text-emerald-300">{zone.intensity} kg/unit</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Radar Scanner Overlay */}
      {layers.radarSweep && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {/* Concentric grid rings */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-500/15" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-500/20" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-emerald-500/25" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border border-emerald-500/30" />

          {/* Crosshairs */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-500/10 -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-500/10 -translate-y-1/2" />

          {/* Rotating Radar Sweep Cone */}
          <div
            className="absolute left-1/2 top-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(16, 185, 129, 0.25) 0deg, rgba(16, 185, 129, 0) 60deg, transparent 60deg)',
              animation: 'spin 6s linear infinite'
            }}
          />
        </div>
      )}

      {/* Header Overlay & Layer Toggles */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="text-xs font-bold text-white tracking-wide">DELHI INDUSTRIAL GRID</div>
            <div className="text-[10px] text-emerald-400/70 font-mono">28.6139° N, 77.2090° E • CEA 0.716 SYNC</div>
          </div>
        </div>

        {/* Layer Switches */}
        <div className="glass-panel p-1 rounded-xl flex items-center gap-1 text-xs">
          <button
            onClick={() => setLayers(l => ({ ...l, emissions: !l.emissions }))}
            className={cn(
              'px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all',
              layers.emissions ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' : 'text-gray-400 hover:text-white'
            )}
          >
            <Cloud className="w-3.5 h-3.5" /> Emissions
          </button>

          <button
            onClick={() => setLayers(l => ({ ...l, energy: !l.energy }))}
            className={cn(
              'px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all',
              layers.energy ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30' : 'text-gray-400 hover:text-white'
            )}
          >
            <Zap className="w-3.5 h-3.5" /> Energy
          </button>

          <button
            onClick={() => setLayers(l => ({ ...l, mobility: !l.mobility }))}
            className={cn(
              'px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all',
              layers.mobility ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'text-gray-400 hover:text-white'
            )}
          >
            <Truck className="w-3.5 h-3.5" /> Freight
          </button>

          <button
            onClick={() => setLayers(l => ({ ...l, radarSweep: !l.radarSweep }))}
            className={cn(
              'px-2.5 py-1 rounded-lg transition-all',
              layers.radarSweep ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500'
            )}
            title="Toggle Radar Sweep Line"
          >
            {layers.radarSweep ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Selected Zone Float Card (Top Right) */}
      {selectedZone && !isDrawerOpen && (
        <div className="absolute top-4 right-4 z-20 w-80 glass-panel-glow p-4 rounded-2xl text-xs space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/70">Selected Node</span>
              <h3 className="text-sm font-bold text-white mt-0.5">{selectedZone.name}</h3>
              <p className="text-[11px] text-emerald-400/60">{selectedZone.category}</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                selectedZone.rating === 'LOW'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : selectedZone.rating === 'MEDIUM'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {selectedZone.rating}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-950/60">
            <div>
              <div className="text-[10px] text-emerald-400/60">Current Load</div>
              <div className="text-base font-bold font-mono text-white">{selectedZone.currentLoad} kW</div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400/60">Est. Daily CO₂</div>
              <div className="text-base font-bold font-mono text-cyan-300">{selectedZone.emissionsToday} kg</div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400/60">Intensity</div>
              <div className="text-sm font-bold font-mono text-emerald-400">{selectedZone.intensity} kg/u</div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400/60">Clean Score</div>
              <div className="text-sm font-bold font-mono text-purple-300">{selectedZone.cleanScore} / 100</div>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-center gap-1 border border-emerald-500/30 transition-all text-xs"
          >
            Inspect Facility Telemetry <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Slide-out Factory Drawer */}
      {isDrawerOpen && selectedZone && (
        <div className="absolute top-0 right-0 bottom-0 z-30 w-96 glass-panel-glow border-l border-emerald-950/80 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedZone.name}</h3>
                  <span className="text-[10px] font-mono text-emerald-400/60">ID: {selectedZone.id}</span>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-950/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status overview */}
            <div className="p-3.5 rounded-xl bg-[#040d0c]/70 border border-emerald-950/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400/70">Operational Status</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {selectedZone.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400/70">Active Production Lines</span>
                <span className="font-mono font-semibold text-white">{selectedZone.activeLines} Lines</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400/70">Grid Factor Baseline</span>
                <span className="font-mono text-cyan-400">0.716 kg CO₂/kWh (CEA)</span>
              </div>
            </div>

            {/* Performance Gauges */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-300">Renewable Energy Penetration</span>
                  <span className="font-mono text-white">{selectedZone.renewablePct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-emerald-950/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${selectedZone.renewablePct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-purple-300">Sustainability Clean Score</span>
                  <span className="font-mono text-white">{selectedZone.cleanScore} / 100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-emerald-950/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"
                    style={{ width: `${selectedZone.cleanScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Prescriptive Insight */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" /> AI Recommended Action
              </div>
              <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                Shift line 2 induction furnace to 22:00-06:00 to reduce grid emission intensity by 14.8% and save ₹42,000 monthly in peak tariff.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-950/60 flex items-center gap-2">
            <button
              onClick={() => {
                window.location.href = `/digital-twin?zone=${selectedZone.id}`;
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 text-center transition-all"
            >
              Launch Digital Twin
            </button>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-[#081512] hover:bg-[#0c221d] text-emerald-400 border border-emerald-950 text-xs font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Telemetry Dock (Reference Image 1) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-3xl glass-panel-glow rounded-2xl px-6 py-3.5 shadow-2xl border border-emerald-500/30">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-emerald-400/60 tracking-wider">Current Load</div>
              <div className="text-base font-bold font-mono text-white">1,284.6 kg</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-emerald-400/60 tracking-wider">Sustainability</div>
              <div className="text-base font-bold font-mono text-white">{avgCleanScore} <span className="text-xs text-purple-300">/ 100</span></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-emerald-400/60 tracking-wider">Clean Energy</div>
              <div className="text-base font-bold font-mono text-white">{avgRenewable}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-emerald-400/60 tracking-wider">Active Nodes</div>
              <div className="text-base font-bold font-mono text-white">{delhiZones.length} Factories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
