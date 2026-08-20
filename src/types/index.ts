export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';
export type RecommendationStatus = 'NEW' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';

export type UserRole =
  | 'Supply Chain Executive'
  | 'Supply Chain Manager'
  | 'Procurement Manager'
  | 'Inventory Manager'
  | 'Warehouse Manager'
  | 'Logistics Manager'
  | 'Data Analyst'
  | 'Admin';

export interface Product {
  productId: string;
  sku: string;
  productName: string;
  category: string;
  brand: string;
  unitCost: number;
  sellingPrice: number;
  supplierId: string;
  supplierName: string;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  reorderPoint: number;
  safetyStock: number;
  status: 'ACTIVE' | 'DISCONTINUED' | 'PHASE_OUT';
  weightKg: number;
  abcClass: 'A' | 'B' | 'C';
  xyzClass: 'X' | 'Y' | 'Z';
  stockHealthScore: number;
  stockHealthCategory: 'Healthy' | 'Watch' | 'At Risk' | 'Critical';
  // Sleepsia specific product attributes
  material?: string;
  intendedUse?: string;
  primaryMarket?: string;
  publicProductUrl?: string;
  targetMarginPct?: number;
  sellingPriceInr?: number;
  productCostInr?: number;
}

export interface Supplier {
  supplierId: string;
  supplierName: string;
  category: string;
  country: string;
  region: string;
  contactEmail: string;
  leadTimeDays: number;
  paymentTerms: string;
  rating: number; // 0-5
  riskScore: number; // 0-100
  riskCategory: RiskLevel;
  capacityUnitsPerMonth: number;
  score: number; // 0-100 overall
  tier: 'Strategic' | 'Preferred' | 'Watch' | 'High Risk';
  onTimeDeliveryRate: number; // %
  inFullDeliveryRate: number; // %
  qualityRate: number; // %
  costVarianceRate: number; // %
  fillRate: number; // %
  rejectionRate: number; // %
  historicalTrends: { month: string; otd: number; quality: number; score: number }[];
  riskFactors: string[];
}

export interface Warehouse {
  warehouseId: string;
  warehouseName: string;
  location: string;
  region: string;
  capacityUnits: number;
  currentStockUnits: number;
  utilizationRate: number; // %
  type: 'Central DC' | 'Regional Hub' | 'Fulfillment Center' | 'Cross-Dock';
  inventoryAccuracyRate: number; // %
  pickingAccuracyRate: number; // %
  orderFulfillmentRate: number; // %
  dockToStockHours: number;
  pickPackCycleMinutes: number;
  status: 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOADED' | 'UNDERUTILIZED';
}

export interface InventoryItem {
  inventoryId: string;
  sku: string;
  productName: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  availableQty: number;
  reservedQty: number;
  damagedQty: number;
  inTransitQty: number;
  totalQty: number;
  unitCost: number;
  totalValue: number;
  safetyStock: number;
  reorderPoint: number;
  daysOfSupply: number;
  stockStatus: 'Healthy' | 'Low Stock' | 'Stockout Risk' | 'Overstock' | 'Dead Stock';
  agingBucket: '0-30' | '31-60' | '61-90' | '91-180' | '180+';
  averageDailyDemand: number;
  forecastDemand30d: number;
  incomingPoQty: number;
  daysToStockout: number;
  stockoutProbability: number;
  holdingCostPerUnitAnnual: number;
}

export interface PurchaseOrder {
  poId: string;
  supplierId: string;
  supplierName: string;
  sku: string;
  productName: string;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalAmount: number;
  orderDate: string;
  expectedDate: string;
  receivedDate?: string;
  status: 'DRAFT' | 'ISSUED' | 'CONFIRMED' | 'IN_TRANSIT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'DELAYED' | 'CANCELLED';
  destinationWarehouseId: string;
  delayDays: number;
  delayReason?: string;
  priority: PriorityLevel;
}

export interface SalesOrder {
  orderId: string;
  customerId: string;
  customerName: string;
  platform: 'Amazon' | 'Blinkit' | 'Flipkart' | 'Myntra' | 'Direct Web' | 'Retail Stores';
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderDate: string;
  promisedDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  status: 'PENDING' | 'ALLOCATED' | 'PICKING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'BACKORDERED' | 'CANCELLED' | 'RETURNED';
  fulfillmentWarehouseId: string;
  deliveryOnTime: boolean;
  orderCycleTimeHours: number;
}

export interface Shipment {
  shipmentId: string;
  orderId: string;
  carrierId: string;
  carrierName: string;
  origin: string;
  destination: string;
  shippedDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: 'DISPATCHED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DELAYED' | 'EXCEPTION';
  freightCost: number;
  transitTimeDays: number;
  delayProbability: number; // %
  delayDaysEstimate: number;
  riskLevel: RiskLevel;
  weatherCondition: 'Clear' | 'Rain' | 'Severe Storm' | 'Port Congestion' | 'Heavy Monsoon Inundation' | 'Highway Congestion' | string;
  route: string;
}

export interface ReturnRecord {
  returnId: string;
  orderId: string;
  sku: string;
  productName: string;
  supplierName: string;
  quantity: number;
  returnReason: 'Damaged in Transit' | 'Defective Product' | 'Wrong Item Shipped' | 'Customer Changed Mind' | 'Late Delivery';
  returnDate: string;
  refundAmount: number;
  restockable: boolean;
  rootCauseCategory: 'Supplier Quality' | 'Warehouse Packing' | 'Carrier Handling' | 'Customer Buyer Remorse';
}

export interface SupplyChainCostBreakdown {
  totalCost: number;
  procurementCost: number;
  transportationFreightCost: number;
  warehousingStorageCost: number;
  inventoryHoldingCost: number;
  handlingOperationsCost: number;
  returnsDefectsCost: number;
  stockoutPenaltyCost: number;
  costByChannel: { channel: string; cost: number; percentage: number }[];
  costByWarehouse: { warehouse: string; cost: number }[];
  monthlyTrend: { month: string; procurement: number; freight: number; warehousing: number; holding: number; total: number }[];
}

export interface SupplyChainKPIs {
  healthScore: number;
  healthCategory: 'Excellent' | 'Healthy' | 'Watch' | 'At Risk' | 'Critical';
  totalInventoryValue: number;
  totalAvailableStock: number;
  totalReservedStock: number;
  totalInTransitStock: number;
  daysOfInventorySupply: number;
  inventoryTurnoverRate: number;
  stockoutRiskCount: number;
  excessInventoryValue: number;
  deadStockValue: number;
  purchaseSpendTotal: number;
  openPoCount: number;
  delayedPoCount: number;
  supplierOtifAverage: number;
  supplierDefectRateAverage: number;
  warehouseAverageUtilization: number;
  orderFulfillmentRate: number;
  logisticsOtifRate: number;
  averageTransitTimeDays: number;
  perfectOrderRate: number;
  backorderRate: number;
  totalSupplyChainCost: number;
  forecastAccuracyRate: number;
  dataQualityScore: number;
}

export interface DemandForecastPoint {
  date: string;
  sku: string;
  productName: string;
  category: string;
  actualDemand?: number;
  forecastDemand: number;
  lowerConfidence: number;
  upperConfidence: number;
  movingAverage: number;
  exponentialSmoothing: number;
  forecastError?: number;
}

export interface StockoutPrediction {
  sku: string;
  productName: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  averageDailyDemand: number;
  forecastDemandDaily: number;
  leadTimeDays: number;
  safetyStock: number;
  incomingPoQty: number;
  predictedDaysRemaining: number;
  predictedStockoutDate: string;
  stockoutProbability: number;
  riskSeverity: RiskLevel;
  estimatedRevenueLoss: number;
  recommendedAction: string;
}

export interface ReplenishmentRecommendation {
  id: string;
  sku: string;
  productName: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  safetyStock: number;
  reorderPoint: number;
  economicOrderQuantity: number;
  recommendedOrderQty: number;
  supplierId: string;
  supplierName: string;
  leadTimeDays: number;
  supplierMoq: number;
  unitCost: number;
  totalCost: number;
  stockoutDate: string;
  priority: PriorityLevel;
  urgencyReason: string;
}

export interface InterWarehouseTransferRecommendation {
  id: string;
  sku: string;
  productName: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  sourceCurrentStock: number;
  sourceDemandRate: number;
  targetWarehouseId: string;
  targetWarehouseName: string;
  targetCurrentStock: number;
  targetDemandRate: number;
  recommendedTransferQty: number;
  estimatedFreightCost: number;
  stockoutPreventedDays: number;
  netBenefitValue: number;
  urgency: PriorityLevel;
}

export interface SupplyChainAnomaly {
  id: string;
  entityType: 'SKU' | 'Supplier' | 'Warehouse' | 'Shipment' | 'Route' | 'Cost';
  entityId: string;
  entityName: string;
  metric: string;
  actualValue: number;
  expectedValue: number;
  deviationPercentage: number;
  zScore: number;
  severity: RiskLevel;
  detectedAt: string;
  possibleCause: string;
  recommendedAction: string;
}

export interface RootCauseNode {
  id: string;
  label: string;
  type: 'SYMPTOM' | 'INTERMEDIATE_CAUSE' | 'ROOT_CAUSE' | 'ACTION';
  metricImpact?: string;
  confidence: number;
  evidence: string[];
}

export interface RootCauseTree {
  id: string;
  incidentTitle: string;
  severity: RiskLevel;
  entity: string;
  summary: string;
  nodes: RootCauseNode[];
  edges: { from: string; to: string; label?: string }[];
  primaryRootCause: string;
  correctiveAction: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  category: 'REORDER' | 'EXPEDITE_PO' | 'TRANSFER_STOCK' | 'CHANGE_SUPPLIER' | 'ADJUST_SAFETY_STOCK' | 'CARRIER_CHANGE' | 'WAREHOUSE_REBALANCING';
  priority: PriorityLevel;
  severity: RiskLevel;
  problem: string;
  evidence: string[];
  rootCause: string;
  recommendation: string;
  expectedImpact: string;
  riskIfIgnored: string;
  financialImpactEstimate: number; // $ value
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number; // 0-100
  sourceDatasets: string[];
  ownerRole: UserRole;
  status: RecommendationStatus;
  userDecisionNote?: string;
  decidedAt?: string;
  decidedBy?: string;
  createdAt: string;
}

export interface SimulationParams {
  demandChangePercent: number; // -50% to +100%
  supplierLeadTimeDeltaDays: number; // -10 to +30 days
  supplierCostChangePercent: number; // -30% to +50%
  transportationCostChangePercent: number; // -30% to +50%
  safetyStockMultiplier: number; // 0.5x to 2.5x
  warehouseCapacityChangePercent: number; // -50% to +50%
  scenarioPreset?: 'Normal' | 'Demand Surge' | 'Supplier Disruption' | 'Logistics Crisis' | 'Cost Inflation' | 'Combined Crisis';
}

export interface SimulationResult {
  params: SimulationParams;
  baseline: {
    inventoryValue: number;
    stockoutCount: number;
    serviceLevelOtif: number;
    totalCost: number;
    workingCapital: number;
    averageDaysSupply: number;
  };
  simulated: {
    inventoryValue: number;
    stockoutCount: number;
    serviceLevelOtif: number;
    totalCost: number;
    workingCapital: number;
    averageDaysSupply: number;
  };
  deltas: {
    inventoryValueDelta: number;
    stockoutCountDelta: number;
    serviceLevelDelta: number;
    totalCostDelta: number;
    workingCapitalDelta: number;
  };
  impactAnalysis: string[];
  criticalRisksIdentified: string[];
  suggestedMitigations: string[];
}

export interface DataQualityRecord {
  id: string;
  datasetName: string;
  sourceSystem: string;
  totalRecordsIngested: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  reconciliationMismatches: number;
  schemaComplianceRate: number; // %
  status: 'HEALTHY' | 'WARNING' | 'FAILED';
  ingestedAt: string;
  errorSamples: { row: number; field: string; error: string; rawValue: string }[];
}

export interface IngestionRawFile {
  ingestionId: string;
  sourceName: string;
  fileName: string;
  fileSizeKb: number;
  format: 'CSV' | 'Excel' | 'JSON' | 'API_CONNECTOR';
  checksum: string;
  schemaVersion: string;
  ingestedAt: string;
  recordCount: number;
  status: 'RAW_PRESERVED' | 'STANDARDIZED' | 'QUALITY_REJECTED';
  rawPayloadSnippet: string;
}

export interface OrchestrationWorkflow {
  workflowId: string;
  name: string;
  schedule: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Event-Driven' | 'On-Demand';
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'RETRYING';
  lastExecution: string;
  nextExecution: string;
  executionDurationMs: number;
  retryCount: number;
  steps: { stepName: string; status: 'SUCCESS' | 'RUNNING' | 'PENDING' | 'FAILED'; durationMs: number }[];
}

export interface SupplyChainAlert {
  id: string;
  title: string;
  ruleName: string;
  severity: RiskLevel;
  entityType: 'SKU' | 'Supplier' | 'Warehouse' | 'Shipment' | 'Cost' | 'System';
  entityId: string;
  message: string;
  threshold: string;
  currentValue: string;
  triggeredAt: string;
  channel: 'Dashboard' | 'Email' | 'Teams' | 'SMS';
  isAcknowledged: boolean;
  acknowledgedBy?: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  category: 'INGESTION' | 'VALIDATION' | 'AI_AGENT' | 'HUMAN_APPROVAL' | 'REPORT_GENERATION' | 'SIMULATION' | 'ALERT';
  actor: string;
  action: string;
  details: string;
  metadata?: Record<string, any>;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface DataLineageNode {
  id: string;
  label: string;
  category: 'SOURCE' | 'RAW_LAKE' | 'VALIDATION' | 'UNIFIED_MODEL' | 'METRIC' | 'ANALYTICS' | 'AI_AGENT' | 'DECISION' | 'REPORT';
  details: string;
  status: 'ACTIVE' | 'SYNCED' | 'WARNING';
}

export interface DataLineageEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DailyBriefingData {
  generatedAt: string;
  executiveSummary: string;
  topKpis: { label: string; value: string; change: string; status: 'good' | 'warning' | 'critical' }[];
  whatChanged: string[];
  whatIsAtRisk: { title: string; risk: RiskLevel; evidence: string; rootCause: string; recommendation: string }[];
  prioritizedActions: { priority: PriorityLevel; action: string; impact: string; owner: string }[];
}

export interface SupplyChainDataset {
  warehouses: Warehouse[];
  suppliers: Supplier[];
  products: Product[];
  inventory: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  shipments: Shipment[];
  returns: ReturnRecord[];
}

export type EntityType =
  | 'INVENTORY'
  | 'SUPPLIERS'
  | 'WAREHOUSES'
  | 'PURCHASE_ORDERS'
  | 'SALES_ORDERS'
  | 'SHIPMENTS'
  | 'RETURNS';

