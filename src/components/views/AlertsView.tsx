import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  Clock,
  Filter,
  Check
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';

export const AlertsView: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const alerts = supplyChainStore.alerts;

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const handleAcknowledge = (id: string) => {
    supplyChainStore.acknowledgeAlert(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Alert Center & Threshold Governance</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
              Automated Sentinel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time threshold notifications, proactive warning signals, and incident acknowledgment workflows
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                severityFilter === sev ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
              alert.severity === 'CRITICAL'
                ? 'border-red-200 bg-red-50/20'
                : alert.severity === 'HIGH'
                ? 'border-amber-200 bg-amber-50/20'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${
                alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : alert.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                    alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : alert.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 font-mono">{alert.entityType}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{alert.id}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{alert.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{alert.message}</p>
                <div className="text-[10px] text-slate-400 pt-1">Target Entity: {alert.entityId} • Triggered: {alert.triggeredAt}</div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {!alert.isAcknowledged ? (
                <button
                  id={`btn-ack-alert-${alert.id}`}
                  onClick={() => handleAcknowledge(alert.id)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-slate-500" />
                  <span>Acknowledge</span>
                </button>
              ) : (
                <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Acknowledged
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
