// Dashboard.tsx
import React, { useState } from 'react';
import {
  Cloud,
  Zap,
  Gauge,
  Sun,
  AlertTriangle,
  Award,
  Download,
  RefreshCw,
  Sliders,
  Sparkles,
  BarChart3,
  Layers,
  Activity,
  TableProperties
} from 'lucide-react';
import { MetricCard } from '../components/cards/MetricCard';
import { MaterialBreakdownChart } from '../components/charts/MaterialBreakdownChart';
import { EnergyVsCo2Chart } from '../components/charts/EnergyVsCo2Chart';
import { TransportVsCo2Chart } from '../components/charts/TransportVsCo2Chart';
import { EmissionTrendChart } from '../components/charts/EmissionTrendChart';
import { FeatureImportanceChart } from '../components/charts/FeatureImportanceChart';
import { ScenarioCompareChart } from '../components/charts/ScenarioCompareChart';
import { EmissionSourceDonut } from '../components/charts/EmissionSourceDonut';
import { WhatIfQuickSimulator } from '../components/cards/WhatIfQuickSimulator';
import { AiRecommendationsCard } from '../components/cards/AiRecommendationsCard';
import { PredictionHistoryTable } from '../components/cards/PredictionHistoryTable';
import { reportsApi } from '../services/api';

type DashboardView = 'all' | 'analytics' | 'simulation' | 'telemetry';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardView>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const blob = await reportsApi.downloadExecutiveSummary();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GreenMetriX_Executive_Report_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('PDF export error:', err);
      window.open('/api/v1/reports/executive-summary/pdf', '_blank');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Top Banner & Action Dock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">Sustainability Intelligence</h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-emerald-400/80 mt-1 font-medium">
            Real-time industrial carbon accounting, CEA factor grid synchronization, and ML decarbonization tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-[#061814] border border-emerald-500/20 text-xs shadow-inner">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Modules
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'simulation'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulation & AI
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'telemetry'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Telemetry Log
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#081b16] hover:bg-[#0c2720] text-emerald-300 border border-emerald-500/25 text-xs font-semibold transition-all shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> {lastRefreshed}
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Generating PDF...' : 'Export Executive PDF'}
          </button>
        </div>
      </div>

      {/* 6 Metric KPI Cards - Always Visible for Executive Visibility */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400/60 uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-Time Environmental KPIs</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total CO₂e Emissions"
            value="1,248.5"
            unit="tCO2e"
            change={-12.4}
            changePeriod="vs last month"
            trend="down"
            icon={Cloud}
            variant="emerald"
            badge="Scope 1-3"
          />

          <MetricCard
            title="Total Energy Usage"
            value="1,842.1"
            unit="MWh"
            change={3.2}
            changePeriod="vs target"
            trend="up"
            icon={Zap}
            variant="cyan"
            badge="Peak 4.8 MW"
          />

          <MetricCard
            title="Avg Emission Intensity"
            value="0.68"
            unit="kg/unit"
            change={-8.1}
            changePeriod="vs benchmark"
            trend="down"
            icon={Gauge}
            variant="blue"
            badge="LOW (Optimal)"
          />

          <MetricCard
            title="Renewable Share"
            value="42.8%"
            subtitle="Target: 50.0% by Q4"
            icon={Sun}
            variant="amber"
            badge="+6.5% YTD"
          />

          <MetricCard
            title="Active Anomalies"
            value="3"
            subtitle="1 Critical, 2 Warnings"
            icon={AlertTriangle}
            variant="red"
            badge="Isolation Forest"
          />

          <MetricCard
            title="Sustainability Score"
            value="84"
            unit="/100"
            subtitle="Tier A Performance"
            icon={Award}
            variant="purple"
            badge="#2 in NCR Hub"
          />
        </div>
      </div>

      {/* SECTION 1: WHAT-IF SIMULATION & PRESCRIPTIVE RECOMMENDATIONS */}
      {(activeTab === 'all' || activeTab === 'simulation') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400/60 uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Decarbonization Simulation & AI Insights</span>
          </div>

          <WhatIfQuickSimulator />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <EmissionSourceDonut />
            </div>
            <div className="lg:col-span-2">
              <AiRecommendationsCard />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PRODUCTION TELEMETRY & EMISSION CORRELATIONS */}
      {(activeTab === 'all' || activeTab === 'analytics') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400/60 uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Material, Energy & Transport Correlation Analytics</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MaterialBreakdownChart />
            <EnergyVsCo2Chart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransportVsCo2Chart />
            <EmissionTrendChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureImportanceChart />
            <ScenarioCompareChart />
          </div>
        </div>
      )}

      {/* SECTION 3: INGESTION LOG & HISTORICAL PREDICTION ARCHIVE */}
      {(activeTab === 'all' || activeTab === 'telemetry') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400/60 uppercase tracking-wider">
            <TableProperties className="w-3.5 h-3.5 text-purple-400" />
            <span>Granular Facility Telemetry & Machine Learning Inference History</span>
          </div>

          <PredictionHistoryTable />
        </div>
      )}
    </div>
  );
};
