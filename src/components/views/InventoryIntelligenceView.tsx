import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  Search,
  Filter,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Grid,
  Calculator
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';
import { LogicInspectorModal } from '../common/LogicInspectorModal';
import { formatINR } from '../../utils/formatters';

export const InventoryIntelligenceView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'ABC_XYZ' | 'AGING'>('REGISTER');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [selectedSkuContext, setSelectedSkuContext] = useState<any>(null);

  const inventory = supplyChainStore.inventory;
  const products = supplyChainStore.products;

  // Build product lookup map
  const productMap = useMemo(() => {
    const map = new Map<string, (typeof products)[0]>();
    products.forEach(p => map.set(p.sku, p));
    return map;
  }, [products]);

  const stats = useMemo(() => {
    const totalVal = inventory.reduce((sum, item) => sum + item.totalValue, 0);
    const stockoutCount = inventory.filter(i => i.stockStatus === 'Stockout Risk').length;
    const overstockVal = inventory.filter(i => i.stockStatus === 'Overstock').reduce((s, i) => s + i.totalValue, 0);
    const deadStockVal = inventory.filter(i => i.stockStatus === 'Dead Stock').reduce((s, i) => s + i.totalValue, 0);

    return {
      totalVal,
      stockoutCount,
      overstockVal,
      deadStockVal,
      totalUnits: inventory.reduce((s, i) => s + i.availableQty, 0)
    };
  }, [inventory]);

  const abcXyzMatrix = useMemo(() => {
    const matrix: Record<string, number> = {
      'AX': 0, 'AY': 0, 'AZ': 0,
      'BX': 0, 'BY': 0, 'BZ': 0,
      'CX': 0, 'CY': 0, 'CZ': 0
    };
    products.forEach(p => {
      const key = `${p.abcClass}${p.xyzClass}`;
      if (matrix[key] !== undefined) matrix[key]++;
    });
    return matrix;
  }, [products]);

  const agingBuckets = useMemo(() => {
    return {
      '0-30': inventory.filter(i => i.agingBucket === '0-30').length,
      '31-60': inventory.filter(i => i.agingBucket === '31-60').length,
      '61-90': inventory.filter(i => i.agingBucket === '61-90').length,
      '91-180': inventory.filter(i => i.agingBucket === '91-180').length,
      '180+': inventory.filter(i => i.agingBucket === '180+').length
    };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const prod = productMap.get(item.sku);
      const matchesSearch =
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.warehouseName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesStatus = statusFilter === 'ALL' || item.stockStatus === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [inventory, productMap, searchQuery, selectedCategory, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Inventory Value</span>
          <p className="text-2xl font-light text-white mt-1">{formatINR(stats.totalVal)}</p>
          <span className="text-xs text-slate-400 mt-2">{stats.totalUnits.toLocaleString()} units on hand</span>
        </div>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Stockout Risk' ? 'ALL' : 'Stockout Risk')}
          className={`bg-slate-800/40 border rounded-3xl p-5 text-left flex flex-col justify-between transition-all ${
            statusFilter === 'Stockout Risk'
              ? 'border-rose-500/80 bg-rose-500/10 shadow-lg shadow-rose-500/10'
              : 'border-slate-700/40 hover:border-rose-500/40'
          }`}
        >
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Stockout Exposure</span>
          <p className="text-2xl font-light text-rose-400 mt-1">{stats.stockoutCount} SKUs</p>
          <span className="text-xs text-rose-400/80 mt-2 font-medium">Immediate reorder required</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Overstock' ? 'ALL' : 'Overstock')}
          className={`bg-slate-800/40 border rounded-3xl p-5 text-left flex flex-col justify-between transition-all ${
            statusFilter === 'Overstock'
              ? 'border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/10'
              : 'border-slate-700/40 hover:border-amber-500/40'
          }`}
        >
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Excess Working Capital</span>
          <p className="text-2xl font-light text-amber-400 mt-1">{formatINR(stats.overstockVal)}</p>
          <span className="text-xs text-amber-400/80 mt-2 font-medium">Overstocked buffer</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Dead Stock' ? 'ALL' : 'Dead Stock')}
          className={`bg-slate-800/40 border rounded-3xl p-5 text-left flex flex-col justify-between transition-all ${
            statusFilter === 'Dead Stock'
              ? 'border-rose-500/80 bg-rose-500/10 shadow-lg shadow-rose-500/10'
              : 'border-slate-700/40 hover:border-rose-500/40'
          }`}
        >
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Dead / Obsolescent Stock</span>
          <p className="text-2xl font-light text-rose-400 mt-1">{formatINR(stats.deadStockVal)}</p>
          <span className="text-xs text-rose-400/80 mt-2 font-medium">&gt;180 days non-moving</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-800/40 p-3 rounded-3xl border border-slate-700/40 gap-3 backdrop-blur-xs">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-2xl">
          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'REGISTER'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Master SKU Register (500 Items)</span>
          </button>
          <button
            onClick={() => setActiveTab('ABC_XYZ')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'ABC_XYZ'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>ABC-XYZ Segmentation Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('AGING')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'AGING'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Inventory Aging Buckets</span>
          </button>
        </div>

        {activeTab === 'REGISTER' && (
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              id="btn-inspect-ss-rop-math"
              onClick={() => {
                setSelectedSkuContext(null);
                setIsInspectorOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span>Safety Stock & ROP Proofs</span>
            </button>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs p-2 bg-slate-900 border border-slate-700/60 rounded-xl text-slate-200 font-medium focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="Stockout Risk">Stockout Risk</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Healthy">Healthy</option>
              <option value="Overstock">Overstock</option>
              <option value="Dead Stock">Dead Stock</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === 'REGISTER' && (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 max-w-md bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/60">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by SKU, product name, warehouse..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-hidden text-white placeholder:text-slate-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono ml-4">{filteredInventory.length} SKUs Listed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">SKU & Item</th>
                  <th className="px-5 py-3.5">Facility</th>
                  <th className="px-5 py-3.5">Classification</th>
                  <th className="px-5 py-3.5">Available / Safety</th>
                  <th className="px-5 py-3.5">Value</th>
                  <th className="px-5 py-3.5">Days of Supply</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Logic / Math</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInventory.slice(0, 50).map((item, idx) => {
                  const prod = productMap.get(item.sku);
                  return (
                    <tr key={item.inventoryId ? `${item.inventoryId}-${item.warehouseId || ''}-${idx}` : `${item.sku}-${item.warehouseId || ''}-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-bold text-white font-mono">{item.sku}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[220px]">{item.productName}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{item.warehouseName}</td>
                      <td className="px-5 py-3 font-mono font-bold text-indigo-400">
                        {prod ? `${prod.abcClass}-${prod.xyzClass}` : 'A-X'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-bold text-white font-mono">{item.availableQty} units</div>
                        <div className="text-[10px] text-slate-500 font-mono">Safety: {item.safetyStock}</div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-white font-mono">{formatINR(item.totalValue)}</td>
                      <td className="px-5 py-3 font-medium text-slate-300 font-mono">{item.daysOfSupply} Days</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.stockStatus === 'Stockout Risk'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : item.stockStatus === 'Low Stock'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : item.stockStatus === 'Overstock'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : item.stockStatus === 'Dead Stock'
                            ? 'bg-rose-500/30 text-rose-400 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {item.stockStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedSkuContext({
                              sku: item.sku,
                              productName: item.productName,
                              avgDailyDemand: item.averageDailyDemand,
                              leadTimeDays: prod?.leadTimeDays || 10,
                              unitCost: item.unitCost
                            });
                            setIsInspectorOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-400 hover:text-white bg-slate-900/80 hover:bg-indigo-600 rounded-lg border border-slate-700/60 transition-all font-mono inline-flex items-center gap-1"
                          title="Inspect APICS Safety Stock & ROP formula derivation for this SKU"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>Inspect SS</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ABC_XYZ' && (
        <div className="p-6 sm:p-8 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-medium text-white">ABC-XYZ Inventory Classification Matrix (500 SKUs)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ABC: Revenue Volume contribution (A: 80% revenue, B: 15%, C: 5%) | XYZ: Demand Predictability (X: Steady, Y: Seasonal, Z: Erratic)
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            {['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ'].map(seg => (
              <div key={seg} className="p-5 rounded-2xl border border-slate-700/50 bg-slate-800/60 space-y-1">
                <span className="text-xs font-bold font-mono text-indigo-400">{seg}</span>
                <p className="text-2xl font-light text-white">{abcXyzMatrix[seg] || 0} <span className="text-xs font-normal text-slate-500">SKUs</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'AGING' && (
        <div className="p-6 sm:p-8 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-medium text-white">Inventory Aging Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of stock across aging intervals</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-xs">
            {Object.entries(agingBuckets).map(([bucket, count]) => (
              <div key={bucket} className="p-5 rounded-2xl border border-slate-700/50 bg-slate-800/60 space-y-1">
                <span className="text-xs font-bold text-slate-400 font-mono">{bucket} Days</span>
                <p className="text-2xl font-light text-white">{count} <span className="text-xs font-normal text-slate-500">SKUs</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operations Research & Math Inspector Modal */}
      <LogicInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        initialTopic="SAFETY_STOCK_ROP"
        initialContext={selectedSkuContext || undefined}
      />
    </div>
  );
};
