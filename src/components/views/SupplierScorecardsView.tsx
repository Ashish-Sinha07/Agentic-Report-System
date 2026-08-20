import React, { useState, useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  Search,
  Filter,
  ShieldCheck,
  TrendingDown,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';

export const SupplierScorecardsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const suppliers = supplyChainStore.suppliers;

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchSearch =
        s.supplierId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTier = tierFilter === 'ALL' || s.tier === tierFilter;
      const matchRisk = riskFilter === 'ALL' || s.riskCategory === riskFilter;

      return matchSearch && matchTier && matchRisk;
    });
  }, [suppliers, searchQuery, tierFilter, riskFilter]);

  const riskCounts = useMemo(() => {
    return {
      critical: suppliers.filter(s => s.riskCategory === 'CRITICAL').length,
      high: suppliers.filter(s => s.riskCategory === 'HIGH').length,
      medium: suppliers.filter(s => s.riskCategory === 'MEDIUM').length,
      low: suppliers.filter(s => s.riskCategory === 'LOW').length,
      avgOtd: suppliers.length > 0 ? (suppliers.reduce((s, sup) => s + sup.onTimeDeliveryRate, 0) / suppliers.length).toFixed(1) : '0.0'
    };
  }, [suppliers]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Suppliers</span>
          <p className="text-2xl font-light text-white mt-1">{suppliers.length}</p>
          <span className="text-xs text-slate-400 mt-2">Tier-1 & Tier-2 Global Base</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Supplier OTD</span>
          <p className="text-2xl font-light text-indigo-400 mt-1">{riskCounts.avgOtd}%</p>
          <span className="text-xs text-indigo-400/80 mt-2 font-medium">Target: 95% On-Time</span>
        </div>

        <button
          onClick={() => setRiskFilter(riskFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`bg-slate-800/40 border rounded-3xl p-5 text-left flex flex-col justify-between transition-all ${
            riskFilter === 'CRITICAL'
              ? 'border-rose-500/80 bg-rose-500/10 shadow-lg shadow-rose-500/10'
              : 'border-slate-700/40 hover:border-rose-500/40'
          }`}
        >
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Critical Risk Suppliers</span>
          <p className="text-2xl font-light text-rose-400 mt-1">{riskCounts.critical}</p>
          <span className="text-xs text-rose-400/80 mt-2 font-medium">Cleanroom & Disruption Watch</span>
        </button>

        <button
          onClick={() => setRiskFilter(riskFilter === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`bg-slate-800/40 border rounded-3xl p-5 text-left flex flex-col justify-between transition-all ${
            riskFilter === 'HIGH'
              ? 'border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/10'
              : 'border-slate-700/40 hover:border-amber-500/40'
          }`}
        >
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">High Risk Suppliers</span>
          <p className="text-2xl font-light text-amber-400 mt-1">{riskCounts.high}</p>
          <span className="text-xs text-amber-400/80 mt-2 font-medium">Dual-sourcing triggers</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/40 shadow-xl flex flex-wrap items-center justify-between gap-3 backdrop-blur-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px] bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/60">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            id="input-supplier-search"
            type="text"
            placeholder="Search by supplier name, ID, country, or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-hidden text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            id="select-supplier-tier"
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="text-xs p-2 bg-slate-900 border border-slate-700/60 rounded-xl text-slate-200 font-medium focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">All Tiers</option>
            <option value="Tier-1">Tier-1 Strategic</option>
            <option value="Tier-2">Tier-2 Direct</option>
            <option value="Tier-3">Tier-3 Component</option>
          </select>

          <select
            id="select-supplier-risk"
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="text-xs p-2 bg-slate-900 border border-slate-700/60 rounded-xl text-slate-200 font-medium focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">CRITICAL Risk</option>
            <option value="HIGH">HIGH Risk</option>
            <option value="MEDIUM">MEDIUM Risk</option>
            <option value="LOW">LOW Risk</option>
          </select>
        </div>
      </div>

      {/* Supplier Scorecards Grid / Table */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-medium text-white">Supplier Performance Scorecards (0-100)</h3>
          <span className="text-xs text-slate-400 font-mono">{filteredSuppliers.length} Suppliers Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Supplier & Location</th>
                <th className="px-5 py-3.5">Tier</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Composite Score</th>
                <th className="px-5 py-3.5">OTD %</th>
                <th className="px-5 py-3.5">Lead Time</th>
                <th className="px-5 py-3.5">Quality Rate</th>
                <th className="px-5 py-3.5">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSuppliers.slice(0, 50).map((s, idx) => (
                <tr key={s.supplierId ? `${s.supplierId}-${idx}` : `sup-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-bold text-white">{s.supplierName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.supplierId} • {s.country} ({s.region})</div>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-300">{s.tier}</td>
                  <td className="px-5 py-3 text-slate-400">{s.category}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-light text-lg text-white font-mono">{s.score}</span>
                      <span className="text-[10px] text-slate-500 font-mono">/100</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono">
                    <span className={`font-semibold ${s.onTimeDeliveryRate < 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {s.onTimeDeliveryRate}%
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-300 font-mono">{s.leadTimeDays} Days</td>
                  <td className="px-5 py-3 font-semibold text-slate-200 font-mono">{s.qualityPassRate}%</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      s.riskCategory === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : s.riskCategory === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : s.riskCategory === 'MEDIUM'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {s.riskCategory} ({s.riskScore})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
