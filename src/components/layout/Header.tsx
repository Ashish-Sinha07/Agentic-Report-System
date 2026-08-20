import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  Zap,
  UserCheck,
  Activity,
  Layers,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Menu,
  Bell,
  Calculator,
  Radio,
  Play,
  Pause
} from 'lucide-react';
import { UserRole, ViewMode } from '../../types';
import { supplyChainStore } from '../../services/store';
import { LogicInspectorModal } from '../common/LogicInspectorModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenSearch: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSearch,
  onNavigate
}) => {
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [isLogicInspectorOpen, setIsLogicInspectorOpen] = useState(false);

  const kpiData = supplyChainStore.getKPIs();
  const unreadAlerts = supplyChainStore.alerts.filter(a => !a.isAcknowledged);
  const currentRole = supplyChainStore.currentRole;

  const roles: UserRole[] = [
    'Supply Chain Executive',
    'Supply Chain Manager',
    'Procurement Manager',
    'Inventory Manager',
    'Warehouse Manager',
    'Logistics Manager',
    'Data Analyst',
    'Admin'
  ];

  const scenarios: { id: any; label: string; desc: string; badgeColor: string }[] = [
    { id: 'Normal', label: 'Normal Baseline Operations', desc: 'Standard demand & lead-time tolerances', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'Demand Surge', label: 'Demand Surge (+55%)', desc: 'Omni-channel flash promotion velocity spike', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'Supplier Disruption', label: 'Supplier Bottleneck (+14d)', desc: 'Tier-1 Asian wafer & packaging delay', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'Logistics Crisis', label: 'Port Congestion (96h Delay)', desc: 'West Coast anchorage & container backlog', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { id: 'Cost Inflation', label: 'Cost Inflation (+18%)', desc: 'Raw material & bunker fuel surcharges', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    { id: 'Combined Crisis', label: 'Black Swan Crisis Event', desc: 'Demand spike + Supplier delay + Port gridlock', badgeColor: 'bg-red-500/30 text-red-300 border-red-500/40' }
  ];

  return (
    <header className="h-20 bg-[#0B1120] border-b border-slate-800/60 sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between shrink-0 select-none">
      {/* Left: Mobile Toggle, Title, Live Status */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">Sleepsia Control Tower</h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              LIVE TELEMETRY (INR ₹)
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Sleepsia India • Multi-Echelon D2C & B2B Supply Chain Intelligence</p>
        </div>
      </div>

      {/* Middle: Sleek Global Search Trigger Button */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          id="btn-global-search-trigger"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800/80 text-slate-400 text-xs rounded-xl border border-slate-700/50 transition-all shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-500" />
            <span className="truncate">Search 500+ SKUs, POs, Suppliers, Warehouses...</span>
          </div>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-900 border border-slate-700/60 rounded-md">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Scenario Switcher, Role Switcher, Alerts, Copilot CTA */}
      <div className="flex items-center gap-3">
        {/* Live Streaming Data Stream Control */}
        <button
          id="btn-header-live-stream-toggle"
          onClick={() => supplyChainStore.toggleLiveStream()}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
            supplyChainStore.isLiveStreaming
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
          }`}
          title={supplyChainStore.isLiveStreaming ? "Live telemetry feed active: real-time data streaming simultaneously into website" : "Click to activate real-time live streaming data updates"}
        >
          <div className="relative flex items-center justify-center">
            {supplyChainStore.isLiveStreaming ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            ) : (
              <Radio className="w-3.5 h-3.5 text-slate-500" />
            )}
          </div>
          <span className="hidden xl:inline">Live Data Feed:</span>
          <span className="font-mono text-[11px] font-bold">
            {supplyChainStore.isLiveStreaming ? 'STREAMING' : 'PAUSED'}
          </span>
        </button>

        {/* Dataset Status & Ingestion Shortcut */}
        <button
          id="btn-header-dataset-status"
          onClick={() => onNavigate('DATA_INGESTION')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/70 text-slate-200 text-xs font-semibold transition-all shadow-xs"
          title="Manage active dataset & ingest custom CSV / JSON data"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline text-slate-400">Dataset:</span>
          <span className={`text-[11px] font-mono font-medium ${
            supplyChainStore.dataSourceType === 'USER_PROVIDED'
              ? 'text-emerald-400'
              : supplyChainStore.dataSourceType === 'BLANK'
              ? 'text-amber-400'
              : 'text-indigo-300'
          }`}>
            {supplyChainStore.dataSourceType === 'USER_PROVIDED'
              ? `Custom (${supplyChainStore.inventory.length} SKUs)`
              : supplyChainStore.dataSourceType === 'BLANK'
              ? 'Blank'
              : 'Demo (500 SKUs)'}
          </span>
        </button>

        {/* Scenario Switcher */}
        <div className="relative">
          <button
            id="btn-scenario-switcher"
            onClick={() => { setShowScenarioMenu(!showScenarioMenu); setShowRoleMenu(false); setShowNotificationMenu(false); }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/70 text-slate-200 text-xs font-semibold transition-all shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span className="hidden sm:inline text-slate-400">Scenario:</span>
            <span className="truncate max-w-[120px] text-amber-300 font-medium">{supplyChainStore.currentScenario}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showScenarioMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 border border-slate-700/60 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white">Supply Chain Scenario Simulation</p>
                <p className="text-[10px] text-slate-400">Inject operational disruptions to recalculate network state</p>
              </div>
              <div className="space-y-1 mt-1">
                {scenarios.map(scn => (
                  <button
                    key={scn.id}
                    id={`btn-scenario-${scn.id.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => {
                      supplyChainStore.applyScenario(scn.id);
                      setShowScenarioMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-start justify-between ${
                      supplyChainStore.currentScenario === scn.id
                        ? 'bg-indigo-600/20 text-white border border-indigo-500/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-200">{scn.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{scn.desc}</p>
                    </div>
                    {supplyChainStore.currentScenario === scn.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 ml-2 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <button
            id="btn-role-switcher"
            onClick={() => { setShowRoleMenu(!showRoleMenu); setShowScenarioMenu(false); setShowNotificationMenu(false); }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/70 text-slate-200 text-xs font-medium transition-all shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline text-slate-400">Persona:</span>
            <span className="truncate max-w-[110px] text-slate-200">{currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-slate-700/60 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white">Switch Operational Persona</p>
                <p className="text-[10px] text-slate-400">Adapts permissions and approval logs</p>
              </div>
              <div className="space-y-1 mt-1">
                {roles.map(r => (
                  <button
                    key={r}
                    id={`btn-role-${r.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => {
                      supplyChainStore.setRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                      currentRole === r ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{r}</span>
                    {currentRole === r && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications & Alerts */}
        <div className="relative">
          <button
            id="btn-alerts-menu"
            onClick={() => { setShowNotificationMenu(!showNotificationMenu); setShowRoleMenu(false); setShowScenarioMenu(false); }}
            className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors border border-slate-700/40 bg-slate-800/30"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-96 bg-slate-900/95 border border-slate-700/60 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">Active Alerts</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                    {unreadAlerts.length} Critical
                  </span>
                </div>
                <button
                  id="btn-view-all-alerts"
                  onClick={() => { onNavigate('ALERTS'); setShowNotificationMenu(false); }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
                {unreadAlerts.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-500">No unacknowledged alerts</p>
                ) : (
                  unreadAlerts.slice(0, 4).map(a => (
                    <div key={a.id} className="p-3 rounded-xl border border-slate-800 bg-slate-800/50 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-200">{a.title}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                          a.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {a.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{a.message}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{a.triggeredAt}</span>
                        <button
                          id={`btn-ack-alert-${a.id}`}
                          onClick={() => supplyChainStore.acknowledgeAlert(a.id)}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mathematical Logic & Formulas Inspector Button */}
        <button
          id="btn-open-math-logic-inspector"
          onClick={() => setIsLogicInspectorOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 border border-slate-700/50 rounded-xl text-xs font-semibold transition-all shadow-xs"
          title="Inspect deterministic Operations Research & APICS supply chain formulas"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono">Math & Logic</span>
        </button>

        {/* Copilot Quick Action CTA */}
        <button
          id="btn-quick-copilot-cta"
          onClick={() => onNavigate('COPILOT')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
          <span>Copilot</span>
        </button>
      </div>

      {/* Operations Research & Math Logic Inspector Modal */}
      <LogicInspectorModal
        isOpen={isLogicInspectorOpen}
        onClose={() => setIsLogicInspectorOpen(false)}
      />
    </header>
  );
};
