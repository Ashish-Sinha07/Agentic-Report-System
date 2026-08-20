export * from './types/index';

export type ViewMode =
  | 'EXECUTIVE_TOWER'
  | 'COPILOT'
  | 'DEMAND_PLANNING'
  | 'INVENTORY_INTELLIGENCE'
  | 'PROCUREMENT'
  | 'REPLENISHMENT'
  | 'LOGISTICS'
  | 'WAREHOUSES'
  | 'ORDERS_RETURNS'
  | 'COSTS'
  | 'SUPPLIERS'
  | 'ANOMALIES_RCA'
  | 'RISK_TOWER'
  | 'DECISION_WORKBENCH'
  | 'WHAT_IF_SIMULATOR'
  | 'DAILY_BRIEFING'
  | 'DIGITAL_TWIN'
  | 'DATA_INGESTION'
  | 'DATA_QUALITY'
  | 'ORCHESTRATION'
  | 'DATA_LINEAGE'
  | 'DATA_SOURCES'
  | 'REPORT_CENTER'
  | 'ALERTS'
  | 'AUDIT_LOGS';

export interface PipelineRun {
  runId: string;
  triggeredAt: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED';
  durationMs: number;
  steps: {
    stepNumber: number;
    name: string;
    status: 'SUCCESS' | 'RUNNING' | 'PENDING';
    durationMs: number;
    details: string;
  }[];
}
