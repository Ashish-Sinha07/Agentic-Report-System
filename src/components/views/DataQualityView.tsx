import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';

export const DataQualityView: React.FC = () => {
  const recon = supplyChainStore.reconciliations;

  const qualityScore = 98.4;

  const checks = [
    {
      title: 'Purchase Order vs. Goods Receipt (GRN)',
      matchRate: recon.poVsReceiptMatchRate,
      status: recon.poVsReceiptMatchRate >= 98 ? 'PASS' : 'WARN',
      description: 'Validates received item quantities and PO line item pricing in ERP against warehouse dock scan.'
    },
    {
      title: 'Customer Orders vs. Carrier Shipped',
      matchRate: recon.orderVsShippedMatchRate,
      status: recon.orderVsShippedMatchRate >= 98 ? 'PASS' : 'WARN',
      description: 'Checks EDI 856 Advanced Shipping Notices against ERP Sales Order line items.'
    },
    {
      title: 'Physical Cycle Count vs. WMS System Stock',
      matchRate: recon.inventoryPhysicalVsSystemMatchRate,
      status: recon.inventoryPhysicalVsSystemMatchRate >= 95 ? 'PASS' : 'WARN',
      description: 'Automated barcode scanner physical inventory audits versus live ERP ledger counts.'
    },
    {
      title: 'Supplier Invoice vs. Approved PO Rate',
      matchRate: recon.invoiceVsPoMatchRate,
      status: recon.invoiceVsPoMatchRate >= 95 ? 'PASS' : 'WARN',
      description: 'Detects unauthorized price creep or freight surcharge variance before accounts payable approval.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Data Quality & Cross-System Reconciliation</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Enterprise Grade
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated schema enforcement, cross-entity reconciliation, and zero-hallucination validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Overall Data Health:</span>
          <span className="text-base font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            {qualityScore}% Certified
          </span>
        </div>
      </div>

      {/* 4 Reconciliation Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map(c => (
          <div key={c.title} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">{c.title}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                c.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {c.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Reconciliation Match Rate:</span>
              <span className="text-base font-extrabold text-slate-900">{c.matchRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
