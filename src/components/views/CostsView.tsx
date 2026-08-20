import React from 'react';
import {
  DollarSign,
  TrendingDown,
  PieChart as PieIcon,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { supplyChainStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';

export const CostsView: React.FC = () => {
  const { kpis, costBreakdown } = supplyChainStore.getKPIs();
  const total = Math.max(1, costBreakdown.totalCost);

  const costComponents = [
    { name: 'Procurement Spend', value: costBreakdown.procurementCost, color: '#6366f1', pct: Number(((costBreakdown.procurementCost / total) * 100).toFixed(1)) },
    { name: 'Freight & Transportation', value: costBreakdown.transportationFreightCost, color: '#38bdf8', pct: Number(((costBreakdown.transportationFreightCost / total) * 100).toFixed(1)) },
    { name: 'Inventory Holding Cost', value: costBreakdown.inventoryHoldingCost, color: '#fbbf24', pct: Number(((costBreakdown.inventoryHoldingCost / total) * 100).toFixed(1)) },
    { name: 'Warehouse & Storage', value: costBreakdown.warehousingStorageCost, color: '#34d399', pct: Number(((costBreakdown.warehousingStorageCost / total) * 100).toFixed(1)) },
    { name: 'Stockout Penalties', value: costBreakdown.stockoutPenaltyCost, color: '#f87171', pct: Number(((costBreakdown.stockoutPenaltyCost / total) * 100).toFixed(1)) },
    { name: 'Returns & Processing', value: costBreakdown.returnsDefectsCost, color: '#a78bfa', pct: Number(((costBreakdown.returnsDefectsCost / total) * 100).toFixed(1)) }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">Total Supply Chain Cost Analysis & Cost-to-Serve (INR ₹)</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
              Full-Landed Cost Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end operational expenditure breakdown across procurement, freight, storage, capital holding, and channel fulfillment
          </p>
        </div>
      </div>

      {/* Top Cost Breakdown Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {costComponents.map(c => (
          <div key={c.name} className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{c.name.split(' ')[0]}</span>
            </div>
            <p className="text-2xl font-light text-white mt-1">{formatINR(c.value)}</p>
            <span className="text-xs text-slate-400 mt-2 font-mono">{c.pct}% of total</span>
          </div>
        ))}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown Donut */}
        <div className="p-6 sm:p-8 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-medium text-white">Supply Chain Cost Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Components contributing to Total Landed Supply Chain Cost</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costComponents}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {costComponents.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [formatINR(Number(val)), 'Cost']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost by Sales Channel */}
        <div className="p-6 sm:p-8 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-medium text-white">Cost-to-Serve by Channel</h3>
            <p className="text-xs text-slate-500 mt-0.5">Logistics, commission, and pick-and-pack expenses per retail channel</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBreakdown.costByChannel} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="channel" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} angle={-15} textAnchor="end" height={40} stroke="#475569" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [formatINR(Number(val)), 'Cost-to-Serve']}
                />
                <Bar dataKey="cost" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
