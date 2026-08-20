import React, { useState } from 'react';
import {
  RefreshCw,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Package,
  Building2,
  Truck,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';
import { LogicInspectorModal } from '../common/LogicInspectorModal';
import { formatINR } from '../../utils/formatters';

export const ReplenishmentView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'REORDER' | 'TRANSFER'>('REORDER');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState<any>(null);

  const replenishmentRecs = supplyChainStore.getReplenishmentRecommendations();
  const transferRecs = supplyChainStore.getTransferRecommendations();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">Automated Replenishment & Stock Balancing Engine</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
              EOQ & Multi-Echelon Algorithm
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic purchase reorders and inter-DC rebalancing recommendations derived from lead times and forecast velocity
          </p>
        </div>

        <button
          id="btn-inspect-eoq-math"
          onClick={() => {
            setSelectedContext(null);
            setIsInspectorOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition-all shadow-xs shrink-0"
        >
          <Calculator className="w-4 h-4 text-indigo-400" />
          <span>Inspect EOQ Batch Math</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-3xl border border-slate-700/40 backdrop-blur-xs">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-2xl">
          <button
            onClick={() => setActiveTab('REORDER')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'REORDER'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Supplier Purchase Reorders ({replenishmentRecs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('TRANSFER')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'TRANSFER'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Inter-Warehouse Rebalancing ({transferRecs.length})</span>
          </button>
        </div>
      </div>

      {/* Reorder Recommendations */}
      {activeTab === 'REORDER' && (
        <div className="space-y-3.5">
          {replenishmentRecs.map((rec, idx) => (
            <div key={rec.id ? `${rec.id}-${idx}` : `replen-${idx}`} className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                    rec.priority === 'P0' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {rec.priority}
                  </span>
                  <h3 className="text-sm font-bold text-white">{rec.productName}</h3>
                  <span className="text-xs font-mono text-slate-400 font-bold">({rec.sku})</span>
                </div>

                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">{rec.warehouseName}</span> • Target Supplier: <span className="font-semibold text-slate-200">{rec.supplierName}</span> (Lead Time: {rec.leadTimeDays}d)
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
                  <span>Current Stock: <strong className="text-white">{rec.currentStock} units</strong></span>
                  <span>Safety Buffer: <strong className="text-white">{rec.safetyStock} units</strong></span>
                  <span>Reorder Point: <strong className="text-white">{rec.reorderPoint} units</strong></span>
                  <span>EOQ Optimal: <strong className="text-indigo-400">{rec.economicOrderQuantity} units</strong></span>
                  <span>Predicted Stockout: <strong className="text-rose-400">{rec.stockoutDate}</strong></span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-sans">
                  <strong>Rationale:</strong> {rec.urgencyReason}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Suggested Order</span>
                  <p className="text-lg font-light text-indigo-400 font-mono">{rec.recommendedOrderQty} units</p>
                  <span className="text-xs font-medium text-slate-400 font-mono">{formatINR(rec.totalCost)} est.</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedContext({
                      sku: rec.sku,
                      productName: rec.productName,
                      avgDailyDemand: Math.round(rec.economicOrderQuantity / 20),
                      leadTimeDays: rec.leadTimeDays,
                      unitCost: rec.unitCost
                    });
                    setIsInspectorOpen(true);
                  }}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all font-mono"
                  title="Inspect Wilson EOQ and safety stock batching proofs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                </button>

                <button
                  id={`btn-generate-po-${rec.id}`}
                  onClick={() => supplyChainStore.addAuditLog('HUMAN_APPROVAL', supplyChainStore.currentRole, `Generated Purchase Order for ${rec.recommendedOrderQty} units of ${rec.sku}`)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Generate PO
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transfer Recommendations */}
      {activeTab === 'TRANSFER' && (
        <div className="space-y-3.5">
          {transferRecs.map((rec, idx) => (
            <div key={rec.id ? `${rec.id}-${idx}` : `trans-${idx}`} className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                    rec.urgency === 'P0' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {rec.urgency}
                  </span>
                  <h3 className="text-sm font-bold text-white">{rec.productName}</h3>
                  <span className="text-xs font-mono text-slate-400 font-bold">({rec.sku})</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{rec.sourceWarehouseName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{rec.targetWarehouseName}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
                  <span>Source Stock: <strong className="text-white">{rec.sourceCurrentStock} units</strong></span>
                  <span>Target Stock: <strong className="text-white">{rec.targetCurrentStock} units</strong></span>
                  <span>Prevented Stockout: <strong className="text-emerald-400">{rec.stockoutPreventedDays} days</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transfer Qty</span>
                  <p className="text-lg font-light text-indigo-400 font-mono">{rec.recommendedTransferQty} units</p>
                  <span className="text-xs font-medium text-slate-400 font-mono">Freight: {formatINR(rec.estimatedFreightCost)}</span>
                </div>

                <button
                  id={`btn-auth-transfer-${rec.id}`}
                  onClick={() => supplyChainStore.addAuditLog('HUMAN_APPROVAL', supplyChainStore.currentRole, `Authorized Inter-DC Transfer of ${rec.recommendedTransferQty} units of ${rec.sku} from ${rec.sourceWarehouseName} to ${rec.targetWarehouseName}`)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Authorize Transfer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Operations Research & Math Inspector Modal */}
      <LogicInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        initialTopic="EOQ_OPTIMIZATION"
        initialContext={selectedContext || undefined}
      />
    </div>
  );
};
