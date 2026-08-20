import React from 'react';
import {
  Sparkles,
  Printer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';

export const DailyBriefingView: React.FC = () => {
  const briefing = supplyChainStore.getDailyBriefing();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-4 h-4 text-cyan-200" />
          </div>
          <div>
            <h2 className="text-base font-medium text-white">Daily AI Supply Chain Intelligence Briefing</h2>
            <p className="text-xs text-slate-400 font-mono">Synthesized at {briefing.generatedAt} for Executive Leadership</p>
          </div>
        </div>

        <button
          id="btn-print-briefing"
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-800/40 hover:bg-slate-700/40 border border-slate-700/40 text-slate-200 text-xs font-semibold rounded-xl shadow-xl transition-all flex items-center gap-2"
        >
          <Printer className="w-3.5 h-3.5 text-slate-400" />
          <span>Export / Print PDF</span>
        </button>
      </div>

      {/* Briefing Card Container */}
      <div className="bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0 backdrop-blur-xs">
        {/* Executive Summary */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 text-white space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            Executive Takeaway
          </div>
          <p className="text-sm leading-relaxed text-slate-200 font-normal">
            {briefing.executiveSummary}
          </p>
        </div>

        {/* Top 6 KPI Snapshot */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Operational Health Snapshot</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {briefing.topKpis.map(kpi => (
              <div key={kpi.label} className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <p className="text-base font-light text-white font-mono mt-1">{kpi.value}</p>
                <span className={`text-[10px] font-mono font-medium ${
                  kpi.status === 'good' ? 'text-emerald-400' : kpi.status === 'warning' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* What Changed in the Last 24 Hours */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. What Changed Today (Top Telemetry Shifts)</h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {briefing.whatChanged.map((shift, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-700/40">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{shift}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What is at Risk & Root Causes */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. What is at Risk & Underlying Root Causes</h3>
          <div className="space-y-3">
            {briefing.whatIsAtRisk.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.risk}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500">Evidence: </span>
                    <span className="text-slate-300">{item.evidence}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Root Cause: </span>
                    <span className="text-slate-200 font-medium">{item.rootCause}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prioritized Action Plan */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">4. Prioritized Decision Agenda</h3>
          <div className="space-y-2.5">
            {briefing.prioritizedActions.map((act, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-700/40 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                      act.priority === 'P0' ? 'bg-rose-500/20 text-rose-300' : act.priority === 'P1' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {act.priority}
                    </span>
                    <span className="font-semibold text-white">{act.action}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Expected Impact: <strong className="text-emerald-400 font-mono">{act.impact}</strong>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[10px] text-slate-500 font-mono">Owner: {act.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
