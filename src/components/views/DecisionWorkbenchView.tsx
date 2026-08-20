import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Database,
  UserCheck
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';
import { AIRecommendation } from '../../types';
import { formatINR } from '../../utils/formatters';

export const DecisionWorkbenchView: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'NEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [actionNote, setActionNote] = useState('');

  const recommendations = supplyChainStore.aiRecommendations;

  const filtered = recommendations.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const handleApprove = (rec: AIRecommendation) => {
    supplyChainStore.approveRecommendation(rec.id, actionNote || undefined);
    setActionNote('');
  };

  const handleReject = (rec: AIRecommendation) => {
    supplyChainStore.rejectRecommendation(rec.id, actionNote || undefined);
    setActionNote('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">Decision Intelligence Workbench</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
              Human-in-the-Loop Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review, validate, and authorize AI-prescribed operational interventions with audit trail verification
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-700/50">
          {(['ALL', 'NEW', 'APPROVED', 'REJECTED'] as const).map(s => (
            <button
              key={s}
              id={`btn-filter-rec-${s.toLowerCase()}`}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s} ({recommendations.filter(r => s === 'ALL' || r.status === s).length})
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {filtered.map((rec, idx) => (
          <div
            key={rec.id ? `${rec.id}-${idx}` : `rec-${idx}`}
            className={`p-6 sm:p-8 rounded-3xl border bg-slate-800/40 shadow-xl transition-all ${
              rec.status === 'APPROVED'
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : rec.status === 'REJECTED'
                ? 'border-slate-800 bg-slate-900/40 opacity-70'
                : 'border-slate-700/40 hover:border-slate-600'
            }`}
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                  rec.priority === 'P0' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : rec.priority === 'P1' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {rec.priority} PRIORITY
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-slate-300 font-mono border border-slate-700/50">
                  {rec.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">{rec.id}</span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono font-bold text-emerald-400">
                  Impact: +{formatINR(rec.financialImpactEstimate)}
                </span>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  rec.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : rec.status === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {rec.status}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="py-4 space-y-3.5">
              <h3 className="text-base font-medium text-white">{rec.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                <strong className="text-white font-semibold">Problem:</strong> {rec.problem}
              </p>

              {/* Evidence Pills */}
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/40 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Grounding Evidence</span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {rec.evidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Prescribed Action</span>
                  <p className="text-slate-200 font-normal leading-relaxed">{rec.recommendation}</p>
                </div>

                <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Risk If Ignored</span>
                  <p className="text-slate-200 font-normal leading-relaxed">{rec.riskIfIgnored}</p>
                </div>
              </div>
            </div>

            {/* Footer Decision Controls & Metadata */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px] font-mono">
                <span>Confidence: <strong className="text-slate-300">{rec.confidenceScore}%</strong></span>
                <span>•</span>
                <span>Owner: <strong className="text-slate-300">{rec.ownerRole}</strong></span>
                <span>•</span>
                <span>Sources: {rec.sourceDatasets.join(', ')}</span>
              </div>

              {rec.status === 'NEW' || rec.status === 'UNDER_REVIEW' ? (
                <div className="flex items-center gap-2">
                  <button
                    id={`btn-approve-rec-${rec.id}`}
                    onClick={() => handleApprove(rec)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Authorize Execution</span>
                  </button>

                  <button
                    id={`btn-reject-rec-${rec.id}`}
                    onClick={() => handleReject(rec)}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 font-medium rounded-xl transition-all flex items-center gap-1.5 text-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Decided by {rec.decidedBy} at {rec.decidedAt}: &ldquo;{rec.userDecisionNote}&rdquo;</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
