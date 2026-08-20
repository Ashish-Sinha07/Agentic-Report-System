import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Truck,
  Building2,
  Package,
  DollarSign,
  TrendingUp,
  Activity,
  ChevronRight
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';

export const RiskControlTowerView: React.FC = () => {
  const { kpis } = supplyChainStore.getKPIs();
  const suppliers = supplyChainStore.suppliers;
  const criticalSuppliers = suppliers.filter(s => s.riskCategory === 'CRITICAL' || s.riskCategory === 'HIGH');
  const inventory = supplyChainStore.inventory;
  const stockoutRisks = inventory.filter(i => i.stockStatus === 'Stockout Risk');

  const riskPillars = [
    {
      title: 'Supplier Disruption Risk',
      score: 78,
      level: 'HIGH',
      icon: Users,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: `${criticalSuppliers.length} Tier-1 & Tier-2 suppliers exceeding lead-time or defect tolerances.`
    },
    {
      title: 'Stockout & Service Level Risk',
      score: 84,
      level: 'CRITICAL',
      icon: Package,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      description: `${stockoutRisks.length} SKUs projected to stock out within 5-7 days across regional fulfillment centers.`
    },
    {
      title: 'Logistics & Carrier Bottleneck',
      score: 72,
      level: 'HIGH',
      icon: Truck,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Trans-Pacific ocean container anchorage delays extending transit cycles by +4.5 days.'
    },
    {
      title: 'Facility Capacity Saturation',
      score: 68,
      level: 'MEDIUM',
      icon: Building2,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      description: 'Port of Los Angeles Inbound Hub operating at 97% storage capacity utilization.'
    },
    {
      title: 'Demand Volatility & Forecast Error',
      score: 65,
      level: 'MEDIUM',
      icon: TrendingUp,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      description: 'Omni-channel flash sales creating non-stationary Poisson spikes on Class-A SKUs.'
    },
    {
      title: 'Input Cost & Freight Inflation',
      score: 62,
      level: 'MEDIUM',
      icon: DollarSign,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      description: 'Bunker fuel surcharges and raw silicon spot index increased by +12.4% this quarter.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">Supply Chain Risk Control Tower</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full font-mono">
              Multi-Pillar Risk Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous systemic vulnerability scanning across suppliers, inventory, transport lanes, and facility capacity
          </p>
        </div>
      </div>

      {/* 6-Pillar Risk Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riskPillars.map(p => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-2xl border ${p.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">{p.title}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  p.level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : p.level === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {p.level} ({p.score})
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className={`h-full rounded-full ${
                    p.score >= 80 ? 'bg-rose-500' : p.score >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${p.score}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
