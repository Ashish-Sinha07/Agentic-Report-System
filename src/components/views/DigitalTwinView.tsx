import React, { useState } from 'react';
import {
  Network,
  Users,
  Building2,
  Truck,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';

export const DigitalTwinView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    name: string;
    type: 'SUPPLIER' | 'DC' | 'CHANNEL';
    metrics: Record<string, any>;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    details: string;
  }>({
    id: 'WH-005',
    name: 'Los Angeles Port Inbound Hub',
    type: 'DC',
    metrics: { 'Utilization': '97.0%', 'Dock-to-Stock': '6.2h', 'Throughput': '14,200 u/d' },
    status: 'CRITICAL',
    details: 'Operating at severe 97.0% saturation due to 3 concurrent trans-Pacific container ship arrivals.'
  });

  const suppliers = supplyChainStore.suppliers.slice(0, 4);
  const warehouses = supplyChainStore.warehouses.slice(0, 5);
  const channels = ['Amazon Vendor', 'Blinkit Q-Commerce', 'Direct Web Store', 'Enterprise Wholesale'];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">Supply Chain Digital Twin Network Flow</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
              Live Topology Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactive topological visualization from Tier-1 global suppliers through distribution hubs to customer channels
          </p>
        </div>
      </div>

      {/* Main Flow Topology Canvas */}
      <div className="p-6 sm:p-8 bg-slate-800/40 rounded-3xl shadow-xl border border-slate-700/40 text-white space-y-6 backdrop-blur-xs">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Optimal</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Bottleneck Warning</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical Disruption</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">Click node to inspect real-time telemetry</span>
        </div>

        {/* 3-Column Node Network */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Column 1: Global Tier-1 Suppliers */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>1. Tier-1 Global Suppliers</span>
            </div>
            <div className="space-y-2.5">
              {suppliers.map(s => {
                const isSelected = selectedNode?.id === s.supplierId;
                const isCrit = s.riskCategory === 'CRITICAL';
                return (
                  <button
                    key={s.supplierId}
                    onClick={() => setSelectedNode({
                      id: s.supplierId,
                      name: s.supplierName,
                      type: 'SUPPLIER',
                      metrics: { 'OTD Rate': `${s.onTimeDeliveryRate}%`, 'Lead Time': `${s.leadTimeDays}d`, 'Score': `${s.score}/100` },
                      status: isCrit ? 'CRITICAL' : s.onTimeDeliveryRate < 85 ? 'WARNING' : 'HEALTHY',
                      details: `Location: ${s.country} • Tier: ${s.tier} • Risk Category: ${s.riskCategory}`
                    })}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/60 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20'
                        : 'border-slate-700/60 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{s.supplierName}</span>
                      <span className={`w-2 h-2 rounded-full ${isCrit ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">{s.country} • OTD: {s.onTimeDeliveryRate}%</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Central Warehouses & Cross-Docks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>2. Distribution Hubs & DCs</span>
            </div>
            <div className="space-y-2.5">
              {warehouses.map(w => {
                const isSelected = selectedNode?.id === w.warehouseId;
                const isOverloaded = w.utilizationRate >= 95;
                return (
                  <button
                    key={w.warehouseId}
                    onClick={() => setSelectedNode({
                      id: w.warehouseId,
                      name: w.warehouseName,
                      type: 'DC',
                      metrics: { 'Utilization': `${w.utilizationRate}%`, 'Dock-to-Stock': `${w.dockToStockHours}h`, 'Accuracy': `${w.inventoryAccuracyRate}%` },
                      status: isOverloaded ? 'CRITICAL' : w.utilizationRate >= 85 ? 'WARNING' : 'HEALTHY',
                      details: `Facility Type: ${w.type} • Total Capacity: ${w.capacityUnits.toLocaleString()} units`
                    })}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20'
                        : 'border-slate-700/60 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{w.warehouseName}</span>
                      <span className={`w-2 h-2 rounded-full ${isOverloaded ? 'bg-rose-500 animate-pulse' : w.utilizationRate >= 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                      <span>{w.location}</span>
                      <span className={`font-bold ${isOverloaded ? 'text-rose-400' : 'text-slate-300'}`}>{w.utilizationRate}% Util</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 3: Customer Channels */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4" />
              <span>3. Customer Channels</span>
            </div>
            <div className="space-y-2.5">
              {channels.map((ch, idx) => {
                const isSelected = selectedNode?.id === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => setSelectedNode({
                      id: ch,
                      name: ch,
                      type: 'CHANNEL',
                      metrics: { 'SLA Fill Rate': idx === 1 ? '98.5%' : '99.2%', 'Avg Velocity': '1,420 u/d', 'OTIF': '94.2%' },
                      status: 'HEALTHY',
                      details: `Omni-channel sales pipeline with active EDI 850 ingestion.`
                    })}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20'
                        : 'border-slate-700/60 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{ch}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">Direct Telemetry Active</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Telemetry Inspector */}
      {selectedNode && (
        <div className="p-6 sm:p-8 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700/60">
                  {selectedNode.type}
                </span>
                <h3 className="text-base font-medium text-white">{selectedNode.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedNode.details}</p>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${
              selectedNode.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : selectedNode.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {selectedNode.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {Object.entries(selectedNode.metrics).map(([k, v]) => (
              <div key={k} className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/40 text-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{k}</span>
                <p className="text-lg font-light text-white font-mono mt-1">{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
