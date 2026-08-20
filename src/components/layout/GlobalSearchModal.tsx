import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Package, Users, ShoppingBag, Building2, Truck, ShieldAlert, ArrowRight } from 'lucide-react';
import { ViewMode } from '../../types';
import { supplyChainStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (viewId: ViewMode) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: { category: string; icon: any; title: string; subtitle: string; viewId: ViewMode; badge?: string }[] = [];

    // Search Products
    for (const p of supplyChainStore.products) {
      if (p.sku.toLowerCase().includes(q) || p.productName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
        results.push({
          category: 'Products & SKUs',
          icon: Package,
          title: `${p.sku} — ${p.productName}`,
          subtitle: `${p.category} | Unit Cost: ${formatINR(p.unitCost, { compact: false })} | Lead Time: ${p.leadTimeDays}d | Class: ${p.abcClass}-${p.xyzClass}`,
          viewId: 'INVENTORY_INTELLIGENCE',
          badge: p.stockHealthCategory
        });
        if (results.length > 25) break;
      }
    }

    // Search Suppliers
    for (const s of supplyChainStore.suppliers) {
      if (s.supplierId.toLowerCase().includes(q) || s.supplierName.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)) {
        results.push({
          category: 'Suppliers',
          icon: Users,
          title: `${s.supplierId} — ${s.supplierName}`,
          subtitle: `${s.country} (${s.region}) | OTD: ${s.onTimeDeliveryRate}% | Score: ${s.score}/100`,
          viewId: 'SUPPLIERS',
          badge: s.tier
        });
        if (results.length > 35) break;
      }
    }

    // Search POs
    for (const po of supplyChainStore.purchaseOrders) {
      if (po.poId.toLowerCase().includes(q) || po.sku.toLowerCase().includes(q) || po.supplierName.toLowerCase().includes(q)) {
        results.push({
          category: 'Purchase Orders',
          icon: ShoppingBag,
          title: `${po.poId} (${po.sku})`,
          subtitle: `Supplier: ${po.supplierName} | Qty: ${po.quantity} | Total: ${formatINR(po.totalAmount)} | Status: ${po.status}`,
          viewId: 'PROCUREMENT',
          badge: po.status
        });
        if (results.length > 45) break;
      }
    }

    // Search Warehouses
    for (const wh of supplyChainStore.warehouses) {
      if (wh.warehouseId.toLowerCase().includes(q) || wh.warehouseName.toLowerCase().includes(q) || wh.location.toLowerCase().includes(q)) {
        results.push({
          category: 'Warehouses',
          icon: Building2,
          title: `${wh.warehouseId} — ${wh.warehouseName}`,
          subtitle: `${wh.location} | Utilization: ${wh.utilizationRate}% | Type: ${wh.type}`,
          viewId: 'WAREHOUSES',
          badge: `${wh.utilizationRate}% Utilized`
        });
      }
    }

    // Search Shipments
    for (const shp of supplyChainStore.shipments) {
      if (shp.shipmentId.toLowerCase().includes(q) || shp.carrierName.toLowerCase().includes(q) || shp.route.toLowerCase().includes(q)) {
        results.push({
          category: 'Shipments & Logistics',
          icon: Truck,
          title: `${shp.shipmentId} (${shp.carrierName})`,
          subtitle: `Route: ${shp.route} | Status: ${shp.status} | Risk: ${shp.riskLevel}`,
          viewId: 'LOGISTICS',
          badge: shp.riskLevel
        });
        if (results.length > 55) break;
      }
    }

    // Search AI Recommendations
    for (const rec of supplyChainStore.aiRecommendations) {
      if (rec.title.toLowerCase().includes(q) || rec.problem.toLowerCase().includes(q)) {
        results.push({
          category: 'AI Decisions & Actions',
          icon: ShieldAlert,
          title: rec.title,
          subtitle: rec.problem,
          viewId: 'DECISION_WORKBENCH',
          badge: rec.priority
        });
      }
    }

    return results;
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-start justify-center pt-20 p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#0F172A] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-slate-900/60">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            id="input-global-search"
            type="text"
            autoFocus
            placeholder="Type SKU (e.g., SKU-CON-0012), PO, Supplier, Warehouse, Shipment..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white focus:outline-hidden font-medium placeholder:text-slate-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-lg font-mono">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-800/60">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-200">Global Search & Intelligence Index</p>
              <p className="text-xs text-slate-500 mt-1">Search 500+ SKUs, 100+ Tier-1 Suppliers, Purchase Orders, Warehouses & AI Insights</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                {['SKU-CON-0012', 'Kyoto Precision', 'PO-2026-10012', 'Seattle DC', 'Stockout Risk', 'Maersk Line'].map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-3 py-1.5 bg-slate-800/60 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-700/50 rounded-xl text-xs text-slate-300 transition-all font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm text-slate-300">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by category, country, or SKU identifier</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {searchResults.map((res, idx) => {
                const Icon = res.icon;
                return (
                  <button
                    key={idx}
                    id={`search-res-${idx}`}
                    onClick={() => {
                      onNavigate(res.viewId);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 transition-all group flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-indigo-600/20 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700/50">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{res.category}</span>
                          {res.badge && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                              {res.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-white truncate mt-0.5">{res.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{res.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 mt-2" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Found {searchResults.length} matching entities</span>
          <button onClick={onClose} className="hover:text-white font-medium text-slate-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
