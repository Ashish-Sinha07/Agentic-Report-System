import React from 'react';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  Server,
  Cloud,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  const sources = [
    {
      id: 'SRC-SAP',
      name: 'SAP S/4HANA Enterprise ERP',
      type: 'ERP',
      protocol: 'OData v4 REST / RFC',
      syncInterval: 'Every 5 mins',
      lastSync: '1 min ago',
      recordsSyncToday: '284,120',
      status: 'HEALTHY',
      latency: '42ms'
    },
    {
      id: 'SRC-WMS',
      name: 'Manhattan Active WMS',
      type: 'WMS',
      protocol: 'Kafka Event Stream',
      syncInterval: 'Real-Time Streaming',
      lastSync: 'Just now',
      recordsSyncToday: '840,910',
      status: 'HEALTHY',
      latency: '18ms'
    },
    {
      id: 'SRC-TMS',
      name: 'Oracle Transportation Management (OTM)',
      type: 'TMS',
      protocol: 'EDI 214 / Webhooks',
      syncInterval: 'Every 15 mins',
      lastSync: '4 mins ago',
      recordsSyncToday: '52,400',
      status: 'HEALTHY',
      latency: '85ms'
    },
    {
      id: 'SRC-AMZ',
      name: 'Amazon Selling Partner API (SP-API)',
      type: 'E-Commerce',
      protocol: 'OAuth2 REST API',
      syncInterval: 'Every 30 mins',
      lastSync: '12 mins ago',
      recordsSyncToday: '118,500',
      status: 'HEALTHY',
      latency: '140ms'
    },
    {
      id: 'SRC-SHOPIFY',
      name: 'Shopify Plus Omni-Channel Store',
      type: 'E-Commerce',
      protocol: 'GraphQL Webhook Stream',
      syncInterval: 'Real-Time Streaming',
      lastSync: 'Just now',
      recordsSyncToday: '64,230',
      status: 'HEALTHY',
      latency: '62ms'
    },
    {
      id: 'SRC-AIS',
      name: 'MarineTraffic Vessel AIS Live Stream',
      type: 'Telemetry',
      protocol: 'WebSocket Telemetry',
      syncInterval: 'Real-Time Stream',
      lastSync: 'Just now',
      recordsSyncToday: '1,420,000',
      status: 'HEALTHY',
      latency: '95ms'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Connected Data Sources & Integration Connectors</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              6 Active Connectors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time integrations across ERP, WMS, TMS, E-Commerce channels, and external AIS vessel streams
          </p>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map(s => (
          <div key={s.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {s.type}
                </span>
                <h3 className="text-xs font-bold text-slate-900 mt-1.5">{s.name}</h3>
                <p className="text-[11px] text-slate-500">{s.protocol}</p>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                {s.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400">Sync Frequency:</span>
                <p className="font-semibold text-slate-800">{s.syncInterval}</p>
              </div>
              <div>
                <span className="text-slate-400">Latency:</span>
                <p className="font-semibold text-indigo-600">{s.latency}</p>
              </div>
              <div>
                <span className="text-slate-400">Records Today:</span>
                <p className="font-semibold text-slate-800">{s.recordsSyncToday}</p>
              </div>
              <div>
                <span className="text-slate-400">Last Poll:</span>
                <p className="font-semibold text-slate-800">{s.lastSync}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
