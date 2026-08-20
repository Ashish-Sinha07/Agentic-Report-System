import React from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';

export const WarehousesView: React.FC = () => {
  const warehouses = supplyChainStore.warehouses;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">Warehouses & Distribution Center Hubs</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
              {warehouses.length} {warehouses.length === 1 ? 'Facility' : 'National Facilities (India)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time storage capacity utilization, dock-to-stock turnaround, and fulfillment velocity
          </p>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {warehouses.map(w => {
          const isOverloaded = w.status === 'OVERLOADED';
          const isNearCapacity = w.status === 'NEAR_CAPACITY';
          return (
            <div
              key={w.warehouseId}
              className={`p-6 rounded-3xl border bg-slate-800/40 shadow-xl transition-all ${
                isOverloaded
                  ? 'border-rose-500/80 bg-rose-500/5'
                  : isNearCapacity
                  ? 'border-amber-500/60 bg-amber-500/5'
                  : 'border-slate-700/40 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">{w.warehouseName}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{w.location} • {w.type}</p>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                  w.status === 'OVERLOADED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : w.status === 'NEAR_CAPACITY'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {w.status}
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Capacity Utilization</span>
                  <span className={`font-mono font-bold ${isOverloaded ? 'text-rose-400' : isNearCapacity ? 'text-amber-400' : 'text-white'}`}>
                    {w.utilizationRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverloaded ? 'bg-rose-500' : isNearCapacity ? 'bg-amber-500' : w.utilizationRate < 50 ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${w.utilizationRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Used: {w.currentStockUnits.toLocaleString()} units</span>
                  <span>Cap: {w.capacityUnits.toLocaleString()} units</span>
                </div>
              </div>

              {/* Operational KPIs */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-800 text-center text-xs">
                <div className="p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-2xl">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Accuracy</span>
                  <p className="font-light text-base text-white font-mono mt-0.5">{w.inventoryAccuracyRate}%</p>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-2xl">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Dock-Stock</span>
                  <p className="font-light text-base text-white font-mono mt-0.5">{w.dockToStockHours}h</p>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-2xl">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Pick Cycle</span>
                  <p className="font-light text-base text-white font-mono mt-0.5">{w.pickPackCycleMinutes}m</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
