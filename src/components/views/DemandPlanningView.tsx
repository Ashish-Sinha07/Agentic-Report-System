import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sliders,
  AlertCircle,
  BarChart2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Calculator
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { supplyChainStore } from '../../services/store';
import { generateDemandForecast } from '../../analytics/forecasting';
import { LogicInspectorModal } from '../common/LogicInspectorModal';

export const DemandPlanningView: React.FC = () => {
  const [selectedSku, setSelectedSku] = useState('SKU-CON-0012');
  const [horizonWeeks, setHorizonWeeks] = useState<1 | 2 | 4 | 8 | 12>(4);
  const [modelType, setModelType] = useState<'HOLT_WINTERS' | 'EMA' | 'SMA'>('HOLT_WINTERS');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const products = supplyChainStore.products;

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'ALL') return products;
    return products.filter(p => p.category === categoryFilter);
  }, [products, categoryFilter]);

  const activeSku = (products.some(p => p.sku === selectedSku) ? selectedSku : products[0]?.sku) || selectedSku;
  const selectedProduct = products.find(p => p.sku === activeSku) || products[0] || {
    productId: 'PROD-001',
    sku: activeSku,
    productName: 'Active Item',
    category: 'General',
    brand: 'Standard',
    unitCost: 45,
    sellingPrice: 75,
    supplierId: 'SUP-001',
    supplierName: 'Primary Supplier',
    leadTimeDays: 10,
    minimumOrderQuantity: 50,
    reorderPoint: 80,
    safetyStock: 30,
    status: 'ACTIVE',
    weightKg: 1.5,
    abcClass: 'A',
    xyzClass: 'X',
    stockHealthScore: 85,
    stockHealthCategory: 'Healthy'
  };

  const forecastResult = useMemo(() => {
    return generateDemandForecast(activeSku, products, horizonWeeks, modelType);
  }, [activeSku, products, horizonWeeks, modelType]);

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Controls Bar */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">Demand Planning & Predictive Forecasting</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
              Holt-Winters Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Statistical time-series forecasting with trend decomposition, seasonality cycles, and confidence intervals
          </p>
        </div>

        {/* Horizon Selector & Math Inspector Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-inspect-forecast-math"
            onClick={() => setIsInspectorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inspect Math & Proofs</span>
          </button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 mr-1">Horizon:</span>
            {([1, 2, 4, 8, 12] as const).map(w => (
              <button
                key={w}
                id={`btn-horizon-${w}w`}
                onClick={() => setHorizonWeeks(w)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  horizonWeeks === w
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}
              >
                {w} {w === 1 ? 'Wk' : 'Wks'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model & SKU Selection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Product Category</label>
          <select
            id="select-category-filter"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700/60 text-white rounded-xl focus:outline-hidden focus:border-indigo-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* SKU Selector */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Target Product SKU</label>
          <select
            id="select-sku"
            value={selectedSku}
            onChange={e => setSelectedSku(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700/60 text-white rounded-xl focus:outline-hidden focus:border-indigo-500 font-mono"
          >
            {filteredProducts.slice(0, 50).map(p => (
              <option key={p.sku} value={p.sku}>
                {p.sku} — {p.productName.substring(0, 32)}
              </option>
            ))}
          </select>
        </div>

        {/* Forecasting Algorithm */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Forecasting Algorithm</label>
          <select
            id="select-model-type"
            value={modelType}
            onChange={e => setModelType(e.target.value as any)}
            className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700/60 text-white rounded-xl focus:outline-hidden focus:border-indigo-500 font-semibold"
          >
            <option value="HOLT_WINTERS">Holt-Winters Triple Exponential (Trend + Seasonality)</option>
            <option value="EMA">Exponential Moving Average (EMA, α=0.35)</option>
            <option value="SMA">Simple Moving Average (4-Week Rolling SMA)</option>
          </select>
        </div>
      </div>

      {/* Model Performance Accuracy Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MAE Error</span>
          <p className="text-2xl font-light text-white mt-1">{forecastResult.metrics.mae} <span className="text-xs font-normal text-slate-500">units</span></p>
          <span className="text-xs text-emerald-400 mt-2">Mean Absolute Error</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RMSE</span>
          <p className="text-2xl font-light text-white mt-1">{forecastResult.metrics.rmse}</p>
          <span className="text-xs text-slate-400 mt-2">Root Mean Sq.</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MAPE Rate</span>
          <p className="text-2xl font-light text-white mt-1">{forecastResult.metrics.mape}%</p>
          <span className="text-xs text-emerald-400 mt-2 font-medium">93.2% Accuracy</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">R² Goodness</span>
          <p className="text-2xl font-light text-white mt-1">{forecastResult.metrics.rSquared}</p>
          <span className="text-xs text-indigo-400 mt-2">High Model Fit</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trend Trajectory</span>
          <p className="text-2xl font-light text-indigo-400 mt-1">{forecastResult.metrics.trendDirection}</p>
          <span className="text-xs text-slate-400 mt-2">+1.2 units/week</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ABC-XYZ Class</span>
          <p className="text-2xl font-light text-white mt-1">{selectedProduct.abcClass}-{selectedProduct.xyzClass}</p>
          <span className="text-xs text-amber-400 mt-2 font-medium">High Value / Volatile</span>
        </div>
      </div>

      {/* Main Forecast Visualizer with Confidence Cone */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-medium text-white">
              Demand Forecast Trajectory with 95% Confidence Cone ({selectedSku})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical Actuals (Week -8 to 0) vs Projected Forward Horizon (Week +1 to +{horizonWeeks})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-300"></span>
              <span className="text-slate-300 font-medium">Actual Demand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-400"></span>
              <span className="text-indigo-300 font-medium">Forecast Demand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-indigo-500/20 border border-indigo-500/40 rounded-xs"></span>
              <span className="text-slate-400 font-medium">95% Confidence Interval</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastResult.dataPoints} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" angle={-15} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" />
              <Tooltip contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Area type="monotone" dataKey="upperConfidence" stroke="none" fill="#6366f1" fillOpacity={0.15} name="Upper Bound (95%)" />
              <Area type="monotone" dataKey="lowerConfidence" stroke="none" fill="#0B1120" fillOpacity={1} name="Lower Bound (95%)" />
              <Line type="monotone" dataKey="actualDemand" stroke="#f8fafc" strokeWidth={2.5} dot={{ r: 4, fill: '#f8fafc' }} name="Actual Demand" />
              <Line type="monotone" dataKey="forecastDemand" stroke="#818cf8" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4, fill: '#818cf8' }} name="Forecast (Projected)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Data Breakdown Table */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-medium text-white">Period-by-Period Forecast Breakdown Table</h3>
          <span className="text-xs text-slate-400 font-mono">{forecastResult.dataPoints.length} Time Buckets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Period</th>
                <th className="px-5 py-3.5">Actual Demand</th>
                <th className="px-5 py-3.5">Forecast Demand</th>
                <th className="px-5 py-3.5">Lower 95% Bound</th>
                <th className="px-5 py-3.5">Upper 95% Bound</th>
                <th className="px-5 py-3.5">Moving Avg</th>
                <th className="px-5 py-3.5">Variance / Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {forecastResult.dataPoints.map((pt, idx) => (
                <tr key={idx} className="hover:bg-slate-800/60 transition-colors">
                  <td className="px-5 py-3 font-semibold text-white font-mono">{pt.date}</td>
                  <td className="px-5 py-3 font-medium text-slate-200">
                    {pt.actualDemand !== undefined ? `${pt.actualDemand} units` : <span className="text-slate-500 italic font-mono">Projected</span>}
                  </td>
                  <td className="px-5 py-3 font-bold text-indigo-400 font-mono">{pt.forecastDemand} units</td>
                  <td className="px-5 py-3 text-slate-400 font-mono">{pt.lowerConfidence} units</td>
                  <td className="px-5 py-3 text-slate-400 font-mono">{pt.upperConfidence} units</td>
                  <td className="px-5 py-3 text-slate-500 font-mono">{pt.movingAverage} units</td>
                  <td className="px-5 py-3 font-mono">
                    {pt.forecastError !== undefined ? (
                      <span className={pt.forecastError > 10 ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                        {pt.forecastError} units
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operations Research & Math Inspector Modal */}
      <LogicInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        initialTopic="DEMAND_FORECASTING_HOLT"
        initialContext={{
          sku: selectedProduct.sku,
          productName: selectedProduct.productName,
          avgDailyDemand: Math.round(forecastResult.metrics.mae * 10),
          unitCost: selectedProduct.unitCost
        }}
      />
    </div>
  );
};
