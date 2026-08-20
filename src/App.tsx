import React, { useState, useEffect } from 'react';
import { ViewMode } from './types';
import { supplyChainStore } from './services/store';

// Layout Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

// View Components
import { ExecutiveControlTower } from './components/views/ExecutiveControlTower';
import { SupplyChainCopilot } from './components/views/SupplyChainCopilot';
import { DemandPlanningView } from './components/views/DemandPlanningView';
import { InventoryIntelligenceView } from './components/views/InventoryIntelligenceView';
import { ProcurementView } from './components/views/ProcurementView';
import { ReplenishmentView } from './components/views/ReplenishmentView';
import { LogisticsView } from './components/views/LogisticsView';
import { WarehousesView } from './components/views/WarehousesView';
import { OrdersReturnsView } from './components/views/OrdersReturnsView';
import { CostsView } from './components/views/CostsView';
import { SupplierScorecardsView } from './components/views/SupplierScorecardsView';
import { AnomaliesRCAView } from './components/views/AnomaliesRCAView';
import { RiskControlTowerView } from './components/views/RiskControlTowerView';
import { DecisionWorkbenchView } from './components/views/DecisionWorkbenchView';
import { WhatIfSimulatorView } from './components/views/WhatIfSimulatorView';
import { DailyBriefingView } from './components/views/DailyBriefingView';
import { DigitalTwinView } from './components/views/DigitalTwinView';
import { DataIngestionStudioView } from './components/views/DataIngestionStudioView';
import { DataQualityView } from './components/views/DataQualityView';
import { OrchestrationView } from './components/views/OrchestrationView';
import { DataLineageView } from './components/views/DataLineageView';
import { DataSourcesView } from './components/views/DataSourcesView';
import { ReportCenterView } from './components/views/ReportCenterView';
import { AlertsView } from './components/views/AlertsView';
import { AuditLogsView } from './components/views/AuditLogsView';

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('EXECUTIVE_TOWER');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe to supplyChainStore changes
  useEffect(() => {
    return supplyChainStore.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'EXECUTIVE_TOWER':
        return <ExecutiveControlTower onNavigate={setActiveView} />;
      case 'COPILOT':
        return <SupplyChainCopilot />;
      case 'DEMAND_PLANNING':
        return <DemandPlanningView />;
      case 'INVENTORY_INTELLIGENCE':
        return <InventoryIntelligenceView />;
      case 'PROCUREMENT':
        return <ProcurementView />;
      case 'REPLENISHMENT':
        return <ReplenishmentView />;
      case 'LOGISTICS':
        return <LogisticsView />;
      case 'WAREHOUSES':
        return <WarehousesView />;
      case 'ORDERS_RETURNS':
        return <OrdersReturnsView />;
      case 'COSTS':
        return <CostsView />;
      case 'SUPPLIERS':
        return <SupplierScorecardsView />;
      case 'ANOMALIES_RCA':
        return <AnomaliesRCAView />;
      case 'RISK_TOWER':
        return <RiskControlTowerView />;
      case 'DECISION_WORKBENCH':
        return <DecisionWorkbenchView />;
      case 'WHAT_IF_SIMULATOR':
        return <WhatIfSimulatorView />;
      case 'DAILY_BRIEFING':
        return <DailyBriefingView />;
      case 'DIGITAL_TWIN':
        return <DigitalTwinView />;
      case 'DATA_INGESTION':
        return <DataIngestionStudioView />;
      case 'DATA_QUALITY':
        return <DataQualityView />;
      case 'ORCHESTRATION':
        return <OrchestrationView />;
      case 'DATA_LINEAGE':
        return <DataLineageView />;
      case 'DATA_SOURCES':
        return <DataSourcesView />;
      case 'REPORT_CENTER':
        return <ReportCenterView />;
      case 'ALERTS':
        return <AlertsView />;
      case 'AUDIT_LOGS':
        return <AuditLogsView />;
      default:
        return <ExecutiveControlTower onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0B1120] font-sans text-slate-300 overflow-hidden antialiased selection:bg-indigo-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0F172A]">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigate={setActiveView}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#0F172A]">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setActiveView}
      />
    </div>
  );
}
