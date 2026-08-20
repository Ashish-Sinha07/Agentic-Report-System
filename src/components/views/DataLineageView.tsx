import React from 'react';
import {
  GitBranch,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const DataLineageView: React.FC = () => {
  const lineageStages = [
    {
      title: '1. Upstream Raw Feeds',
      icon: Database,
      color: 'border-blue-200 bg-blue-50 text-blue-700',
      items: ['SAP S/4HANA (PO/Invoices)', 'Manhattan WMS (Inventory)', 'FourKites TMS (Shipment GPS)', 'Shopify/Amazon (Orders)']
    },
    {
      title: '2. Raw Data Lake',
      icon: Layers,
      color: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      items: ['Immutable Parquet Storage', 'SHA-256 Checksumming', 'Schema Tagging', 'Raw Audit Traceability']
    },
    {
      title: '3. Standardization & Cleansing',
      icon: ShieldCheck,
      color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      items: ['ISO-8601 Date Parsing', 'Currency Normalization (USD)', 'Duplicate Deduplication', 'Missing Field Imputation']
    },
    {
      title: '4. Reconciliation & Metrics',
      icon: Cpu,
      color: 'border-purple-200 bg-purple-50 text-purple-700',
      items: ['PO vs GRN Reconciliation', 'Order vs Shipped Matching', 'Physical vs WMS System Audit', 'Statistical Z-Score Math']
    },
    {
      title: '5. AI & Decision Synthesis',
      icon: Sparkles,
      color: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      items: ['Multi-Model Demand Forecast', 'Dynamic Reorder Buffer Sizing', 'Gemini Copilot Grounding', 'Executive Daily Briefing']
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">End-to-End Data Lineage & Provenance Graph</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              Full Audit Trail
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trace the exact origin, transformation pipeline, and mathematical derivation of every metric and AI decision
          </p>
        </div>
      </div>

      {/* Lineage Pipeline Visual */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {lineageStages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div key={stage.title} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${stage.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">{stage.title}</h3>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {stage.items.map((item, i) => (
                  <div key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
