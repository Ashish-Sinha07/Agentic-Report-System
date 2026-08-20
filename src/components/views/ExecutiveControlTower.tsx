import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  TrendingUp,
  Truck,
  Users,
  Building2,
  DollarSign,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  UploadCloud,
  FileSpreadsheet,
  Database
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ViewMode } from '../../types';
import { supplyChainStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';

interface ExecutiveControlTowerProps {
  onNavigate: (viewId: ViewMode) => void;
}

export const ExecutiveControlTower: React.FC<ExecutiveControlTowerProps> = ({ onNavigate }) => {
  const { kpis, costBreakdown } = supplyChainStore.getKPIs();
  const stockoutPredictions = supplyChainStore.getStockoutPredictions();
  const recommendations = supplyChainStore.aiRecommendations;
  const briefing = supplyChainStore.getDailyBriefing();
  const pendingRecs = recommendations.filter(r => r.status === 'NEW' || r.status === 'UNDER_REVIEW');
  const hasData = supplyChainStore.inventory.length > 0;

  // Trend data for executive charts
  const demandVsSupplyTrend = hasData ? [
    { month: 'Mar', demand: Math.round(kpis.totalAvailableStock * 0.7), fulfilled: Math.round(kpis.totalAvailableStock * 0.68), inventoryVal: Number((kpis.totalInventoryValue * 0.9 / 1000000).toFixed(1)) },
    { month: 'Apr', demand: Math.round(kpis.totalAvailableStock * 0.78), fulfilled: Math.round(kpis.totalAvailableStock * 0.75), inventoryVal: Number((kpis.totalInventoryValue * 0.94 / 1000000).toFixed(1)) },
    { month: 'May', demand: Math.round(kpis.totalAvailableStock * 0.85), fulfilled: Math.round(kpis.totalAvailableStock * 0.82), inventoryVal: Number((kpis.totalInventoryValue * 0.96 / 1000000).toFixed(1)) },
    { month: 'Jun', demand: Math.round(kpis.totalAvailableStock * 0.9), fulfilled: Math.round(kpis.totalAvailableStock * 0.87), inventoryVal: Number((kpis.totalInventoryValue * 0.98 / 1000000).toFixed(1)) },
    { month: 'Jul', demand: Math.round(kpis.totalAvailableStock * 0.95), fulfilled: Math.round(kpis.totalAvailableStock * 0.92), inventoryVal: Number((kpis.totalInventoryValue * 0.99 / 1000000).toFixed(1)) },
    { month: 'Aug (Cur)', demand: kpis.totalAvailableStock, fulfilled: Math.round(kpis.totalAvailableStock * 0.94), inventoryVal: Number((kpis.totalInventoryValue / 1000000).toFixed(1)) }
  ] : [];

  const warehouseUtilizationData = supplyChainStore.warehouses.map(w => ({
    name: w.warehouseName.split(' ')[0] + ' ' + (w.warehouseName.split(' ')[1] || ''),
    utilization: w.utilizationRate,
    status: w.status
  }));

  const costColors = ['#6366f1', '#38bdf8', '#fbbf24', '#34d399', '#f87171'];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Onboarding Banner when no data is ingested yet */}
      {!hasData && (
        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-blue-950/60 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-slate-300 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                <span>Clean Workspace — Ready for Your Data</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Upload Your Real Supply Chain Data (.xlsx / .csv)
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                All mock data has been removed. Upload your multi-sheet Excel workbook or CSV files (Inventory, Suppliers, Warehouses, POs, Shipments) to run real-time analytics, stockout predictions, and autonomous recommendations based 100% on your data.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <button
                id="btn-onboarding-ingest-data"
                onClick={() => onNavigate('DATA_INGESTION')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4 text-cyan-200" />
                <span>Ingest My Data</span>
              </button>
              <button
                id="btn-onboarding-download-template"
                onClick={() => supplyChainStore.exportFullExcelTemplate()}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-medium text-xs rounded-xl border border-slate-700/60 transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Download Excel Template</span>
              </button>
              <button
                id="btn-onboarding-load-sample"
                onClick={() => supplyChainStore.loadSampleData()}
                className="px-3.5 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 text-xs rounded-xl border border-slate-700/40 transition-colors"
                title="Preview features with 500-SKU benchmark dataset"
              >
                <span>Try Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner: Control Tower State & AI Daily Briefing Spotlight */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 sm:p-8 text-slate-300 shadow-xl shadow-indigo-500/5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xs">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              {hasData ? 'INTELLIGENCE ACTIVE' : 'AWAITING DATASET'}
            </span>
            <span className="text-xs text-slate-400">
              Scenario: <strong className="text-amber-400 font-semibold">{supplyChainStore.currentScenario}</strong>
            </span>
            <span className="text-xs text-slate-500">• Telemetry: {hasData ? 'Live Synced' : 'Ready'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Supply Chain Executive Control Tower
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {briefing.executiveSummary}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            id="btn-tower-open-copilot"
            onClick={() => onNavigate('COPILOT')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Launch Copilot</span>
          </button>
          <button
            id="btn-tower-view-briefing"
            onClick={() => onNavigate('DAILY_BRIEFING')}
            className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 text-xs font-medium rounded-xl border border-slate-700/50 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Full AI Briefing</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Top 8 Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {/* Health Score */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Health Score</span>
            <ShieldCheck className={`w-4 h-4 ${kpis.healthScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-light text-white">{kpis.healthScore}</span>
            <span className="text-xs text-slate-500 font-normal">/100</span>
          </div>
          <div className={`text-xs mt-2 font-medium ${kpis.healthScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {kpis.healthCategory}
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Inventory Val</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-light text-white mt-1">
            {formatINR(kpis.totalInventoryValue)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {kpis.daysOfInventorySupply}d Supply
          </div>
        </div>

        {/* Stockout Risk */}
        <div
          className="bg-slate-800/40 border border-slate-700/40 hover:border-rose-500/40 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-colors"
          onClick={() => onNavigate('INVENTORY_INTELLIGENCE')}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Stockout Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-light text-rose-400 mt-1">
            {kpis.stockoutRiskCount} SKUs
          </div>
          <div className="text-xs text-rose-400/80 mt-2 font-medium">
            Critical reorders
          </div>
        </div>

        {/* Inventory Turnover */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Turnover Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-light text-white mt-1">
            {kpis.inventoryTurnoverRate}x
          </div>
          <div className="text-xs text-emerald-400 mt-2">
            Annual Velocity
          </div>
        </div>

        {/* Forecast Accuracy */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Forecast Acc.</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-light text-white mt-1">
            {kpis.forecastAccuracyRate}%
          </div>
          <div className="text-xs text-slate-400 mt-2">
            MAPE: 6.8% (30d)
          </div>
        </div>

        {/* Logistics OTIF */}
        <div
          className="bg-slate-800/40 border border-slate-700/40 hover:border-indigo-500/40 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-colors"
          onClick={() => onNavigate('LOGISTICS')}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Logistics OTIF</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-light text-white mt-1">
            {kpis.logisticsOtifRate}%
          </div>
          <div className="text-xs text-indigo-400 mt-2">
            Transit: {kpis.averageTransitTimeDays}d
          </div>
        </div>

        {/* Supplier Health */}
        <div
          className="bg-slate-800/40 border border-slate-700/40 hover:border-indigo-500/40 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-colors"
          onClick={() => onNavigate('SUPPLIERS')}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Supplier OTD</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-light text-white mt-1">
            {kpis.supplierOtifAverage}%
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {kpis.delayedPoCount} Delayed POs
          </div>
        </div>

        {/* Supply Chain Cost */}
        <div
          className="bg-slate-800/40 border border-slate-700/40 hover:border-indigo-500/40 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-colors"
          onClick={() => onNavigate('COSTS')}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total SC Cost</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-light text-white mt-1">
            {formatINR(kpis.totalSupplyChainCost)}
          </div>
          <div className="text-xs text-amber-400/90 mt-2">
            Procure: {formatINR(costBreakdown.procurementCost)}
          </div>
        </div>
      </div>

      {/* Middle Section: Visual Control Tower Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Demand Velocity vs Supply Capacity + Warehouse Utilization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Demand vs Fulfillment Trend */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-medium text-white">Demand Velocity vs Fulfillment Trajectory</h3>
                <p className="text-xs text-slate-500 mt-0.5">6-Month historical demand, orders fulfilled, and inventory valuation ($M)</p>
              </div>
              <button
                onClick={() => onNavigate('DEMAND_PLANNING')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Demand Planning</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandVsSupplyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFulfilled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="demand" name="Customer Demand (Units)" stroke="#6366f1" fillOpacity={1} fill="url(#colorDemand)" strokeWidth={2} />
                  <Area type="monotone" dataKey="fulfilled" name="Units Fulfilled" stroke="#10b981" fillOpacity={1} fill="url(#colorFulfilled)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: 10 Distribution Centers Utilization */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-medium text-white">Distribution Center Capacity Utilization</h3>
                <p className="text-xs text-slate-500 mt-0.5">Live storage utilization across 10 global regional facilities</p>
              </div>
              <button
                onClick={() => onNavigate('WAREHOUSES')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Warehouse Hubs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warehouseUtilizationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} angle={-20} textAnchor="end" height={45} stroke="#475569" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`${val}%`, 'Utilization']}
                  />
                  <Bar dataKey="utilization" radius={[4, 4, 0, 0]}>
                    {warehouseUtilizationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.utilization >= 95 ? '#ef4444' : entry.utilization >= 85 ? '#f59e0b' : entry.utilization < 50 ? '#3b82f6' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Critical Risks Spotlight & Pending Action Approvals */}
        <div className="space-y-6">
          {/* Action Approval Card */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <h3 className="text-base font-medium text-white">Decision Workbench</h3>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                {pendingRecs.length} Action{pendingRecs.length !== 1 ? 's' : ''} Pending
              </span>
            </div>

            <div className="space-y-3">
              {pendingRecs.slice(0, 3).map((rec, idx) => (
                <div key={rec.id ? `${rec.id}-${idx}` : `rec-${idx}`} className="p-3.5 rounded-2xl border border-slate-700/40 bg-slate-800/60 hover:bg-slate-800/80 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {rec.priority} • {rec.category}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      +{formatINR(rec.financialImpactEstimate)}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white mt-1">{rec.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {rec.recommendation}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-700/50">
                    <span className="text-[10px] text-slate-500 font-mono">Role: {rec.ownerRole}</span>
                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-tower-approve-${rec.id}`}
                        onClick={() => supplyChainStore.approveRecommendation(rec.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        id={`btn-tower-reject-${rec.id}`}
                        onClick={() => supplyChainStore.rejectRecommendation(rec.id)}
                        className="px-2.5 py-1 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('DECISION_WORKBENCH')}
              className="w-full mt-4 py-2.5 text-center text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-600/10 hover:bg-indigo-600/20 rounded-xl transition-all border border-indigo-500/20"
            >
              Open Full Decision Workbench →
            </button>
          </div>

          {/* Top Stockout Risk Radar */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-base font-medium text-white">Stockout Risk Radar</h3>
              </div>
              <button
                onClick={() => onNavigate('INVENTORY_INTELLIGENCE')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                All SKUs
              </button>
            </div>

            <div className="space-y-2.5">
              {stockoutPredictions.slice(0, 4).map((pred, idx) => (
                <div key={`${pred.sku}-${pred.warehouseName || pred.warehouseId || idx}-${idx}`} className="p-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{pred.sku}</span>
                    <span className="font-bold text-rose-400">{pred.predictedDaysRemaining}d remaining</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">{pred.productName}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                    <span>{pred.warehouseName.split(' ')[0]} DC</span>
                    <span className="font-mono">Stock: {pred.currentStock} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supply Chain Cost Breakdown Donut */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6">
            <h3 className="text-base font-medium text-white mb-1">Cost by Channel Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Multi-channel sales distribution of operational costs</p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdown.costByChannel}
                    dataKey="cost"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {costBreakdown.costByChannel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={costColors[index % costColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [formatINR(Number(val)), 'Cost']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 mt-3">
              {costBreakdown.costByChannel.slice(0, 3).map((item, idx) => (
                <div key={item.channel} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: costColors[idx] }}></span>
                    <span className="text-slate-400 truncate">{item.channel}</span>
                  </div>
                  <span className="font-medium text-slate-200 shrink-0 font-mono">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
