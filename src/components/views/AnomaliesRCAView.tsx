import React, { useState } from 'react';
import {
  AlertOctagon,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ChevronDown
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';

export const AnomaliesRCAView: React.FC = () => {
  const anomalies = supplyChainStore.anomalies;
  const rootCauseTrees = supplyChainStore.rootCauseTrees;
  const [selectedTreeId, setSelectedTreeId] = useState(rootCauseTrees[0]?.id || 'RCA-001');

  const selectedTree = rootCauseTrees.find(t => t.id === selectedTreeId) || rootCauseTrees[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">Anomaly Detection & Root Cause Analysis (RCA)</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full font-mono">
              Statistical Z-Score Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-dimensional outlier detection and automated causal diagnostic graphs
          </p>
        </div>
      </div>

      {/* Top Anomaly Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Anomalies</span>
          <p className="text-2xl font-light text-rose-400 mt-1">{anomalies.length}</p>
          <span className="text-xs text-rose-400/80 mt-2 font-mono">|Z| &gt; 2.5 Outliers</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Critical Severity</span>
          <p className="text-2xl font-light text-rose-400 mt-1">
            {anomalies.filter(a => a.severity === 'CRITICAL').length}
          </p>
          <span className="text-xs text-slate-400 mt-2">Requires Immediate Action</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RCA Causal Trees</span>
          <p className="text-2xl font-light text-indigo-400 mt-1">{rootCauseTrees.length}</p>
          <span className="text-xs text-indigo-400/80 mt-2 font-medium">Mapped Diagnostics</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Model Confidence</span>
          <p className="text-2xl font-light text-emerald-400 mt-1 font-mono">94.8%</p>
          <span className="text-xs text-emerald-400/80 mt-2 font-medium">Grounded in Raw Feeds</span>
        </div>
      </div>

      {/* Interactive Root Cause Causal Graph Visualizer */}
      {selectedTree && (
        <div className="p-6 sm:p-8 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-medium text-white">Interactive Causal Diagnostic Tree</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">Select an incident to view end-to-end multi-agent causal breakdown</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Incident:</span>
              <select
                id="select-rca-tree"
                value={selectedTreeId}
                onChange={e => setSelectedTreeId(e.target.value)}
                className="text-xs p-2 bg-slate-900 border border-slate-700/60 rounded-xl text-slate-200 font-medium focus:outline-hidden focus:border-indigo-500"
              >
                {rootCauseTrees.map(t => (
                  <option key={t.id} value={t.id}>{t.incidentTitle}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tree Nodes Visual */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {selectedTree.nodes.map((node, i) => (
              <div
                key={node.id}
                className={`p-5 rounded-2xl border space-y-3 ${
                  node.type === 'SYMPTOM'
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : node.type === 'INTERMEDIATE_CAUSE'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : node.type === 'ROOT_CAUSE'
                    ? 'bg-indigo-500/10 border-indigo-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  node.type === 'SYMPTOM'
                    ? 'bg-rose-500/20 text-rose-300'
                    : node.type === 'INTERMEDIATE_CAUSE'
                    ? 'bg-amber-500/20 text-amber-300'
                    : node.type === 'ROOT_CAUSE'
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {i + 1}. {node.type.replace('_', ' ')}
                </span>
                <h4 className="text-xs font-bold text-white mt-1">{node.label}</h4>
                {node.metricImpact && (
                  <p className="text-[11px] text-slate-300 font-mono">{node.metricImpact}</p>
                )}
                <div className="pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Confidence:</span>
                  <span className="font-mono font-bold text-white">{node.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Detected Outliers Table */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-medium text-white">Statistical Outliers & Threshold Violations</h3>
          <span className="text-xs text-slate-400 font-mono">{anomalies.length} Exceptions Tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Metric & Entity</th>
                <th className="px-5 py-3.5">Entity Type</th>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Expected Value</th>
                <th className="px-5 py-3.5">Observed Value</th>
                <th className="px-5 py-3.5">Z-Score</th>
                <th className="px-5 py-3.5">Possible Cause & Action</th>
                <th className="px-5 py-3.5">Detected At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {anomalies.map(a => (
                <tr key={a.id} className="hover:bg-slate-800/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-bold text-white">{a.metric}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{a.entityName} ({a.entityId})</div>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-300">
                    {a.entityType}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      a.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : a.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 font-mono">{a.expectedValue}</td>
                  <td className="px-5 py-3 font-mono font-bold text-rose-400">{a.actualValue}</td>
                  <td className="px-5 py-3 font-mono font-bold text-indigo-400">
                    +{a.zScore}σ
                  </td>
                  <td className="px-5 py-3 max-w-[220px]">
                    <div className="text-[11px] text-slate-200 font-medium">{a.possibleCause}</div>
                    <div className="text-[10px] text-indigo-400 mt-0.5">{a.recommendedAction}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-mono">{a.detectedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
