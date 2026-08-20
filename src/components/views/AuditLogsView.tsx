import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  User,
  Cpu,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';

export const AuditLogsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const auditLogs = supplyChainStore.auditLogs;

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory = categoryFilter === 'ALL' || log.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">System Audit Trail & Governance Logs</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped operational trace of all AI inferences, human decision authorizations, and ingestion events
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            id="input-audit-search"
            type="text"
            placeholder="Search audit trail by actor, action, or details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-hidden text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            id="select-audit-category"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">All Event Categories</option>
            <option value="AI_RECOMMENDATION">AI Decisions</option>
            <option value="SCENARIO_SIMULATION">Scenario Simulations</option>
            <option value="DATA_INGESTION">Data Ingestion</option>
            <option value="PIPELINE_ORCHESTRATION">Pipeline Runs</option>
            <option value="SYSTEM_ALERT">System Alerts</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Audit Trail Ledger</h3>
          <span className="text-xs text-slate-500 font-medium">{filteredLogs.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor / Principal</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details & Audit Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {log.actor.includes('AI') ? (
                        <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                      {log.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600 text-[11px] max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
