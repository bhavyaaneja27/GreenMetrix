// Reports.tsx
import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Building,
  Shield,
  Loader2,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { reportsApi } from '../services/api';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Executive' | 'Compliance' | 'Audit' | 'Operational';
  format: 'PDF' | 'CSV' | 'XLSX';
  pages: string;
}

const templates: ReportTemplate[] = [
  {
    id: 'rep-exec',
    title: 'Executive Sustainability Summary & Decarbonization Audit',
    description: 'High-level C-Suite report featuring Scope 1-3 footprint, CEA factor verification, ML predictions, and scenario savings.',
    category: 'Executive',
    format: 'PDF',
    pages: '4 Pages'
  },
  {
    id: 'rep-ghg',
    title: 'GHG Protocol Scope 1-3 Corporate Accounting Report',
    description: 'Compliant with GHG Corporate Standard, detailing fuel combustion, grid emissions, and upstream logistics.',
    category: 'Compliance',
    format: 'PDF',
    pages: '12 Pages'
  },
  {
    id: 'rep-iso',
    title: 'ISO 50001 Energy Management Performance Audit',
    description: 'Energy baseline (EnB), Energy Performance Indicators (EnPIs), and measurement & verification (M&V) audit trail.',
    category: 'Audit',
    format: 'PDF',
    pages: '8 Pages'
  },
  {
    id: 'rep-telemetry',
    title: 'Hourly Telemetry & Intensity Raw Dataset Export',
    description: 'Complete chronological 4,320-hour readings dataset with ML anomaly flags, temperatures, and intensity scores.',
    category: 'Operational',
    format: 'CSV',
    pages: 'Dataset'
  }
];

export const Reports: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (reportId: string) => {
    try {
      setDownloading(reportId);
      if (reportId === 'rep-exec') {
        const blob = await reportsApi.downloadExecutiveSummary();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GreenMetriX_Executive_Report_${new Date().toISOString().slice(0,10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // Mock direct download
        window.open('/api/v1/reports/executive-summary/pdf', '_blank');
      }
    } catch (err) {
      console.error('Download failed:', err);
      window.open('/api/v1/reports/executive-summary/pdf', '_blank');
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Compliance & Sustainability Reports</h1>
          <p className="text-xs text-emerald-400/70 mt-1">
            Generate auditor-ready sustainability disclosures, executive summaries, and ISO 50001 documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            ReportLab PDF Engine Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((rep) => (
          <div
            key={rep.id}
            className="rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-6 backdrop-blur-xl hover:border-emerald-700/60 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase tracking-wider">
                  {rep.category}
                </span>
                <span className="text-xs font-mono text-emerald-400/60">{rep.pages}</span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{rep.title}</h3>
              <p className="text-xs text-emerald-400/70 leading-relaxed">{rep.description}</p>
            </div>

            <div className="pt-5 mt-5 border-t border-emerald-950/60 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400/50 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Tamper-Evident SHA256
              </span>

              <button
                onClick={() => handleDownload(rep.id)}
                disabled={downloading === rep.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {downloading === rep.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download {rep.format}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
