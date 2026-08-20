import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Search,
  Filter,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';

export const ProcurementView: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const purchaseOrders = supplyChainStore.purchaseOrders;

  const stats = useMemo(() => {
    const totalSpend = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
    const openPOs = purchaseOrders.filter(po => po.status === 'ISSUED' || po.status === 'CONFIRMED' || po.status === 'IN_TRANSIT');
    const delayedPOs = purchaseOrders.filter(po => po.status === 'DELAYED' || po.delayDays > 0);
    const avgDelay = delayedPOs.length > 0
      ? (delayedPOs.reduce((s, p) => s + p.delayDays, 0) / delayedPOs.length).toFixed(1)
      : '0';

    return {
      totalSpend,
      openCount: openPOs.length,
      delayedCount: delayedPOs.length,
      avgDelay,
      delayedVal: delayedPOs.reduce((s, p) => s + p.totalAmount, 0)
    };
  }, [purchaseOrders]);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchSearch =
        po.poId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || po.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Active Spend</span>
          <p className="text-2xl font-light text-white mt-1">{formatINR(stats.totalSpend)}</p>
          <span className="text-xs text-slate-400 mt-2">{purchaseOrders.length} Total PO Records</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Open / In-Transit POs</span>
          <p className="text-2xl font-light text-indigo-400 mt-1">{stats.openCount} POs</p>
          <span className="text-xs text-indigo-400/80 mt-2 font-medium">Active Supply Pipeline</span>
        </div>

        <button
          onClick={() => setStatusFilter(statusFilter === 'DELAYED' ? 'ALL' : 'DELAYED')}
          className={`bg-slate-800/40 border rounded-3xl p-5 text-left flex flex-col justify-between transition-all ${
            statusFilter === 'DELAYED'
              ? 'border-rose-500/80 bg-rose-500/10 shadow-lg shadow-rose-500/10'
              : 'border-slate-700/40 hover:border-rose-500/40'
          }`}
        >
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Delayed POs (Risk)</span>
          <p className="text-2xl font-light text-rose-400 mt-1">{stats.delayedCount} POs</p>
          <span className="text-xs text-rose-400/80 mt-2 font-medium">{formatINR(stats.delayedVal)} Value at Risk</span>
        </button>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Delay Impact</span>
          <p className="text-2xl font-light text-amber-400 mt-1">+{stats.avgDelay} Days</p>
          <span className="text-xs text-slate-400 mt-2">Across Delayed Supplier POs</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/40 shadow-xl flex flex-wrap items-center justify-between gap-3 backdrop-blur-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px] bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/60">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            id="input-po-search"
            type="text"
            placeholder="Search by PO ID (e.g. PO-2026-10012), SKU, or Supplier..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-hidden text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            id="select-po-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs p-2 bg-slate-900 border border-slate-700/60 rounded-xl text-slate-200 font-medium focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">All PO Statuses</option>
            <option value="DELAYED">DELAYED Only</option>
            <option value="IN_TRANSIT">IN_TRANSIT Only</option>
            <option value="APPROVED">APPROVED Only</option>
            <option value="DELIVERED">DELIVERED Only</option>
          </select>
        </div>
      </div>

      {/* Main PO Table */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-medium text-white">Purchase Orders Register</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 font-mono border border-slate-700/50">
              {filteredPOs.length} Records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">PO Number</th>
                <th className="px-5 py-3.5">SKU & Item</th>
                <th className="px-5 py-3.5">Supplier</th>
                <th className="px-5 py-3.5">Quantity</th>
                <th className="px-5 py-3.5">Unit Price / Total</th>
                <th className="px-5 py-3.5">Expected Date</th>
                <th className="px-5 py-3.5">Status / Delay</th>
                <th className="px-5 py-3.5">Delay Root Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPOs.slice(0, 50).map((po, idx) => (
                <tr key={po.poId ? `${po.poId}-${idx}` : `po-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                  <td className="px-5 py-3 font-semibold font-mono text-white">{po.poId}</td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-white font-mono">{po.sku}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{po.destinationWarehouseId}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-200">{po.supplierName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{po.supplierId}</div>
                  </td>
                  <td className="px-5 py-3 font-mono text-white">{po.quantity} units</td>
                  <td className="px-5 py-3 font-mono">
                    <div className="font-semibold text-white">{formatINR(po.totalAmount)}</div>
                    <div className="text-[10px] text-slate-400">{formatINR(po.unitCost, { compact: false })} / unit</div>
                  </td>
                  <td className="px-5 py-3 text-slate-300 font-mono">{po.expectedDeliveryDate}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      po.status === 'DELAYED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : po.status === 'IN_TRANSIT'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : po.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {po.status} {po.delayDays > 0 && `(+${po.delayDays}d)`}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[11px] max-w-[220px]">
                    {po.delayReason ? (
                      <span className="text-rose-400 font-medium">{po.delayReason}</span>
                    ) : (
                      <span className="text-slate-500">On schedule</span>
                    )}
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
