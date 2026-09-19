// Factories.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Factory as FactoryIcon,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  MapPin,
  Zap,
  Cloud,
  Award,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { factoriesApi } from '../services/api';
import { Factory } from '../types';

export const Factories: React.FC = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');

  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const data = await factoriesApi.getAll();
        setFactories(data);
      } catch (err) {
        console.error('Failed to fetch factories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFactories();
  }, []);

  const filtered = factories.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === 'ALL' || f.industry_type === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Industrial Facilities</h1>
          <p className="text-xs text-emerald-400/70 mt-1">
            Manufacturing plants, assembly hubs, and operational telemetry nodes across Delhi NCR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/factories/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Facility
          </Link>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
          <input
            type="text"
            placeholder="Search by facility name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#081512] border border-emerald-950/80 rounded-xl text-xs text-white placeholder-emerald-400/40 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-[#081512] border border-emerald-950/80 rounded-xl text-xs text-emerald-300 px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">All Industries</option>
            <option value="Automotive">Automotive</option>
            <option value="Electronics">Electronics</option>
            <option value="Heavy Engineering">Heavy Engineering</option>
            <option value="Plastics">Plastics</option>
            <option value="Aerospace">Aerospace</option>
            <option value="Energy Storage">Energy Storage</option>
          </select>
        </div>
      </div>

      {/* Factory Grid Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-emerald-400/60">Loading facilities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((factory) => (
            <div
              key={factory.id}
              className="group rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <FactoryIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {factory.industry_type}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {factory.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400/60 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{factory.city}, {factory.state}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-emerald-950/60 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-400/60">Annual Target</span>
                    <p className="font-mono font-semibold text-white mt-0.5">{factory.annual_target_co2?.toLocaleString() ?? 1200} t</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400/60">Peak Capacity</span>
                    <p className="font-mono font-semibold text-cyan-300 mt-0.5">{factory.peak_capacity_mw ?? 3.5} MW</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-emerald-950/60 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400/70 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active Sync
                </span>
                <Link
                  to={`/factories/${factory.id}`}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
