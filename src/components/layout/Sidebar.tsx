import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  CheckSquare,
  Network,
  TrendingUp,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
  Building2,
  Truck,
  RotateCcw,
  DollarSign,
  ShieldAlert,
  AlertOctagon,
  Sliders,
  UploadCloud,
  CheckCircle2,
  Clock,
  GitBranch,
  Database,
  Printer,
  Bell,
  ListFilter,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { ViewMode } from '../../types';
import { supplyChainStore } from '../../services/store';

interface SidebarProps {
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavGroup {
  domain: string;
  items: {
    id: ViewMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpen,
  onClose
}) => {
  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>({
    'Core Operations': true,
    'Supply & Inventory': true,
    'Fulfillment & Logistics': true,
    'Intelligence & Risk': true,
    'Data Engineering & Ops': true,
    'Governance & Reporting': true
  });

  const pendingRecCount = supplyChainStore.aiRecommendations.filter(r => r.status === 'NEW' || r.status === 'UNDER_REVIEW').length;
  const criticalStockoutCount = supplyChainStore.inventory.filter(i => i.stockStatus === 'Stockout Risk').length;
  const unreadAlertsCount = supplyChainStore.alerts.filter(a => !a.isAcknowledged).length;

  const toggleDomain = (domain: string) => {
    setOpenDomains(prev => ({ ...prev, [domain]: !prev[domain] }));
  };

  const navGroups: NavGroup[] = [
    {
      domain: 'Core Operations',
      items: [
        { id: 'EXECUTIVE_TOWER', label: 'Executive Control Tower', icon: LayoutDashboard },
        { id: 'COPILOT', label: 'Supply Chain Copilot', icon: Sparkles, badge: 'AI', badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' },
        { id: 'DAILY_BRIEFING', label: 'AI Daily Briefing', icon: FileText },
        { id: 'DECISION_WORKBENCH', label: 'Decision Workbench', icon: CheckSquare, badge: `${pendingRecCount}`, badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
        { id: 'DIGITAL_TWIN', label: 'Digital Twin Network', icon: Network }
      ]
    },
    {
      domain: 'Supply & Inventory',
      items: [
        { id: 'DEMAND_PLANNING', label: 'Demand Planning & Forecast', icon: TrendingUp },
        { id: 'INVENTORY_INTELLIGENCE', label: 'Inventory Intelligence', icon: Package, badge: `${criticalStockoutCount} Risk`, badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' },
        { id: 'REPLENISHMENT', label: 'Replenishment & Balancing', icon: RefreshCw },
        { id: 'PROCUREMENT', label: 'Procurement & POs', icon: ShoppingBag },
        { id: 'SUPPLIERS', label: 'Supplier Scorecards & Risk', icon: Users },
        { id: 'WAREHOUSES', label: 'Warehouses & DC Hubs', icon: Building2 }
      ]
    },
    {
      domain: 'Fulfillment & Logistics',
      items: [
        { id: 'LOGISTICS', label: 'Logistics, Carriers & Routes', icon: Truck },
        { id: 'ORDERS_RETURNS', label: 'Order Fulfillment & Returns', icon: RotateCcw },
        { id: 'COSTS', label: 'Supply Chain Cost Breakdown', icon: DollarSign }
      ]
    },
    {
      domain: 'Intelligence & Risk',
      items: [
        { id: 'RISK_TOWER', label: 'Risk Control Tower', icon: ShieldAlert },
        { id: 'ANOMALIES_RCA', label: 'Anomaly Detection & RCA', icon: AlertOctagon },
        { id: 'WHAT_IF_SIMULATOR', label: 'What-If Scenario Simulator', icon: Sliders, badge: 'Sim', badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' }
      ]
    },
    {
      domain: 'Data Engineering & Ops',
      items: [
        { id: 'DATA_INGESTION', label: 'Data Ingestion Studio', icon: UploadCloud },
        { id: 'DATA_QUALITY', label: 'Data Quality & Reconciliation', icon: CheckCircle2 },
        { id: 'ORCHESTRATION', label: 'Orchestration & Workflows', icon: Clock },
        { id: 'DATA_LINEAGE', label: 'Data Lineage Visualizer', icon: GitBranch },
        { id: 'DATA_SOURCES', label: 'Connectors & External Feeds', icon: Database }
      ]
    },
    {
      domain: 'Governance & Reporting',
      items: [
        { id: 'REPORT_CENTER', label: 'Report Center & Exports', icon: Printer },
        { id: 'ALERTS', label: 'Alerts & Threshold Rules', icon: Bell, badge: `${unreadAlertsCount}`, badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' },
        { id: 'AUDIT_LOGS', label: 'Audit & Operations Center', icon: ListFilter }
      ]
    }
  ];

  const handleItemClick = (id: ViewMode) => {
    onSelectView(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-[#0B1120] text-slate-300 border-r border-slate-800/60 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <div className="w-4 h-1.5 bg-white rounded-full"></div>
            </div>
            <div>
              <span className="text-base font-semibold text-white tracking-tight block">Sleepsia AI</span>
              <span className="text-[10px] font-mono text-indigo-400 block -mt-0.5">Control Tower • India</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Scroll Area */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {navGroups.map(group => (
            <div key={group.domain} className="space-y-1">
              <button
                onClick={() => toggleDomain(group.domain)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300"
              >
                <span>{group.domain}</span>
                {openDomains[group.domain] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {openDomains[group.domain] && (
                <div className="space-y-1 pt-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`nav-item-${item.id}`}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 font-semibold shadow-xs'
                            : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isActive ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                          ) : (
                            <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sleek System Health Card */}
        <div className="p-4 border-t border-slate-800/60 shrink-0">
          <div className="bg-slate-800/40 rounded-2xl p-3.5 border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">System Health</div>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-300 font-medium">Telemetry Synced</span>
              <span className="text-emerald-400 font-bold font-mono">99.9%</span>
            </div>
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-full bg-emerald-500"></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
