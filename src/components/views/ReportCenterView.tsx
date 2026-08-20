import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Store,
  BarChart3,
  FileCheck,
  Eye
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';
import { EcommerceReportGenerator } from '../reports/EcommerceReportGenerator';
import { generateEcommerceAuditPDF } from '../../utils/pdfReportGenerator';
import { computeEcommerceAuditData } from '../../utils/ecommerceReportHelper';

export const ReportCenterView: React.FC = () => {
  const [activeReportTab, setActiveReportTab] = useState<'LIVE_AUDIT' | 'EXPORT_CARDS'>('LIVE_AUDIT');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Generated and downloaded ${filename}`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportKPIs = () => {
    const { kpis, costBreakdown } = supplyChainStore.getKPIs();
    const data = JSON.stringify({ kpis, costBreakdown, timestamp: new Date().toISOString() }, null, 2);
    downloadFile('executive_supply_chain_kpis.json', data, 'application/json');
  };

  const handleExportInventoryCSV = () => {
    const inventory = supplyChainStore.inventory;
    const headers = ['sku,productName,category,warehouseId,availableQty,safetyStock,reorderPoint,unitCost,stockStatus,daysOfSupply'];
    const rows = inventory.map(i =>
      `"${i.sku}","${i.productName}","${i.category}","${i.warehouseId}",${i.availableQty},${i.safetyStock},${i.reorderPoint},${i.unitCost},"${i.stockStatus}",${i.daysOfSupply}`
    );
    const csv = [...headers, ...rows].join('\n');
    downloadFile('inventory_stock_telemetry.csv', csv, 'text/csv');
  };

  const handleExportSuppliersCSV = () => {
    const suppliers = supplyChainStore.suppliers;
    const headers = ['supplierId,supplierName,tier,country,category,score,onTimeDeliveryRate,leadTimeDays,riskCategory'];
    const rows = suppliers.map(s =>
      `"${s.supplierId}","${s.supplierName}","${s.tier}","${s.country}","${s.category}",${s.score},${s.onTimeDeliveryRate},${s.leadTimeDays},"${s.riskCategory}"`
    );
    const csv = [...headers, ...rows].join('\n');
    downloadFile('supplier_scorecards_2026.csv', csv, 'text/csv');
  };

  const handleExportPOsCSV = () => {
    const pos = supplyChainStore.purchaseOrders;
    const headers = ['poId,sku,supplierName,quantity,unitCost,totalAmount,status,delayDays,delayReason'];
    const rows = pos.map(p =>
      `"${p.poId}","${p.sku}","${p.supplierName}",${p.quantity},${p.unitCost},${p.totalAmount},"${p.status}",${p.delayDays},"${p.delayReason || ''}"`
    );
    const csv = [...headers, ...rows].join('\n');
    downloadFile('purchase_orders_register.csv', csv, 'text/csv');
  };

  const handleExportEcommerceReportCSV = () => {
    const salesOrders = supplyChainStore.salesOrders;
    const returns = supplyChainStore.returns;

    const headers = ['orderId,platform,sku,productName,customerName,quantity,unitPrice,totalAmount,deliveryOnTime,status,returnStatus,refundAmount'];
    const rows = salesOrders.map(o => {
      const ret = returns.find(r => r.orderId === o.orderId);
      const plat = o.platform;
      const unitPrice = o.quantity > 0 ? (o.totalAmount / o.quantity).toFixed(2) : '0';
      return `"${o.orderId}","${plat}","${o.sku}","${o.productName}","${o.customerName}",${o.quantity},${unitPrice},${o.totalAmount},${o.deliveryOnTime},"${o.status}","${ret ? 'RETURNED' : 'COMPLETED'}",${ret ? ret.refundAmount : 0}`;
    });

    const csv = [...headers, ...rows].join('\n');
    downloadFile('ecommerce_platform_product_omnichannel_audit.csv', csv, 'text/csv');
  };

  const handleExportEcommercePDF = (platformScope: string = 'ALL') => {
    try {
      const { platformReports, crossPlatformProducts, grandSummary } = computeEcommerceAuditData('SLP_ONLY');
      generateEcommerceAuditPDF({
        platformScope,
        platformReports,
        crossPlatformProducts,
        grandSummary,
        reportDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      });
      setDownloadSuccess(`Generated and downloaded ${platformScope === 'ALL' ? 'Omni-Channel' : platformScope} PDF Audit Report!`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      console.error('Failed to export PDF', e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header with View Toggle */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">Supply Chain Report & Analytics Center</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
              Omni-Channel Reporting Suite
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export platform-specific reports, itemized product telemetry, cross-channel rollups, and enterprise P&L in PDF, CSV, and JSON.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/60 shrink-0">
          <button
            onClick={() => setActiveReportTab('LIVE_AUDIT')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeReportTab === 'LIVE_AUDIT'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Multi-Channel Audit</span>
          </button>

          <button
            onClick={() => setActiveReportTab('EXPORT_CARDS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeReportTab === 'EXPORT_CARDS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Download Center</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* TAB 1: LIVE INTERACTIVE AUDIT SUITE WITH ON-DEMAND PDF EXPORT */}
      {activeReportTab === 'LIVE_AUDIT' && (
        <div className="space-y-6 animate-in fade-in">
          <EcommerceReportGenerator initialPlatform="ALL" />
        </div>
      )}

      {/* TAB 2: EXPORT CARDS & DIRECT 1-CLICK DOWNLOADS */}
      {activeReportTab === 'EXPORT_CARDS' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Hero Card: Omni-Channel E-Commerce Platform & Product Audit */}
          <div className="p-6 bg-linear-to-br from-slate-900/90 via-slate-800/60 to-emerald-950/20 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Omni-Channel E-Commerce Platform & Product Audit (Full Suite)</h3>
                  <p className="text-xs text-slate-300">
                    Includes: (1) Platform-specific metrics & product breakdowns, (2) Cross-platform SKU rollup across all channels, (3) Grand overall executive P&L statement.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                PDF & CSV READY
              </span>
            </div>

            {/* Quick Channel Specific PDF Downloads */}
            <div className="pt-3 border-t border-slate-700/50">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">1-Click Platform Specific PDF Reports:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { key: 'Amazon', label: 'Amazon India', color: 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10' },
                  { key: 'Blinkit', label: 'Blinkit Quick', color: 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10' },
                  { key: 'Flipkart', label: 'Flipkart', color: 'border-blue-500/30 text-blue-300 hover:bg-blue-500/10' },
                  { key: 'Direct Web', label: 'Sleepsia D2C', color: 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10' },
                  { key: 'Myntra', label: 'Myntra', color: 'border-pink-500/30 text-pink-300 hover:bg-pink-500/10' },
                  { key: 'Retail Stores', label: 'Retail Stores', color: 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => handleExportEcommercePDF(item.key)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 border ${item.color} transition-all flex items-center justify-center gap-1.5`}
                  >
                    <Download className="w-3 h-3 opacity-70" />
                    <span>{item.label} (.PDF)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Master Export Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                id="btn-export-full-pdf"
                onClick={() => handleExportEcommercePDF('ALL')}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Master Omni-Channel Audit (.PDF)</span>
              </button>

              <button
                id="btn-export-full-csv"
                onClick={handleExportEcommerceReportCSV}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Download Audit Ledger (.CSV)</span>
              </button>

              <button
                onClick={() => setActiveReportTab('LIVE_AUDIT')}
                className="py-3 px-4 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Open Live Interactive Audit View</span>
              </button>
            </div>
          </div>

          {/* Standard Supply Chain Register Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Report 1: Executive KPIs */}
            <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Executive KPI & Cost Breakdown</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">JSON</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Full summary of OTIF %, inventory turns, total landed cost (₹), and working capital metrics across Sleepsia nodes.
              </p>
              <button
                id="btn-export-kpis"
                onClick={handleExportKPIs}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download KPI Model (.JSON)</span>
              </button>
            </div>

            {/* Report 2: Inventory CSV */}
            <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">500 SKU Inventory & Risk Register</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">CSV</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Complete inventory ledger with safety stocks, reorder points, days of supply, and stockout statuses.
              </p>
              <button
                id="btn-export-inventory-csv"
                onClick={handleExportInventoryCSV}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Inventory Data (.CSV)</span>
              </button>
            </div>

            {/* Report 3: Supplier Scorecards CSV */}
            <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Tier-1 & 2 Supplier Scorecards</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">CSV</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                100+ supplier performance records with composite ratings (0-100), OTD rates, lead times, and risk tiers.
              </p>
              <button
                id="btn-export-suppliers-csv"
                onClick={handleExportSuppliersCSV}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Supplier Scorecards (.CSV)</span>
              </button>
            </div>

            {/* Report 4: Purchase Orders CSV */}
            <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Purchase Orders & Delays Register</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">CSV</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Complete PO pipeline with delivery timestamps, unit prices, delays, and root causes.
              </p>
              <button
                id="btn-export-pos-csv"
                onClick={handleExportPOsCSV}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PO Register (.CSV)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
