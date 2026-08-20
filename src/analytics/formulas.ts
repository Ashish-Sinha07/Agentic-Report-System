/**
 * CogniChain Operations Research & Supply Chain Mathematical Engine
 * Grounded in APICS / ASCM (Association for Supply Chain Management) Standards.
 * All formulas are fully deterministic, auditable, and mathematically rigorous.
 */

/**
 * Standard Normal Cumulative Distribution Function approximation (Abramowitz and Stegun)
 * @param z Z-score
 * @returns Cumulative probability Phi(z) in [0, 1]
 */
export function standardNormalCDF(z: number): number {
  if (z < -7) return 0;
  if (z > 7) return 1;
  const p = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const t = 1 / (1 + p * Math.abs(z));
  const poly = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
  const standardNormalPDF = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
  const cdf = 1 - standardNormalPDF * poly;
  return z >= 0 ? cdf : 1 - cdf;
}

/**
 * Standard Normal Inverse (Quantile Function) to convert Service Level % (e.g. 0.95) to Z-factor
 * Uses Acklam's algorithm for high numerical precision
 */
export function normalInverseCDF(p: number): number {
  if (p <= 0) return -4.0;
  if (p >= 1) return 4.0;

  // Coefficients in rational approximations
  const a = [-3.969683028665376e+01,  2.209460984245205e+02,
             -2.759285104469687e+02,  1.383577518672690e+02,
             -3.066479806614716e+01,  2.506628277459239e+00];
  const b = [-5.447609879822406e+01,  1.615858368580409e+02,
             -1.556989798598866e+02,  6.680131188771972e+01,
             -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01,
             -2.400758277161838e+00, -2.549732539343734e+00,
              4.374664141464968e+00,  2.938163982698783e+00];
  const d = [ 7.784695709041462e-03,  3.224671290700398e-01,
              2.445134137142996e+00,  3.754408661907416e+00];

  const q = p < 0.5 ? p : 1 - p;
  let r: number;

  if (q > 0.02425) {
    const x = q - 0.5;
    const x2 = x * x;
    r = x * (((((a[0] * x2 + a[1]) * x2 + a[2]) * x2 + a[3]) * x2 + a[4]) * x2 + a[5]) /
            (((((b[0] * x2 + b[1]) * x2 + b[2]) * x2 + b[3]) * x2 + b[4]) * x2 + 1);
  } else {
    const r2 = Math.sqrt(-2 * Math.log(q));
    r = (((((c[0] * r2 + c[1]) * r2 + c[2]) * r2 + c[3]) * r2 + c[4]) * r2 + c[5]) /
        ((((d[0] * r2 + d[1]) * r2 + d[2]) * r2 + d[3]) * r2 + 1);
    if (p < 0.5) r = -r;
  }

  return Number((p < 0.5 ? -Math.abs(r) : Math.abs(r)).toFixed(3));
}

/**
 * APICS Dual-Variability Safety Stock Model:
 * SS = Z * sqrt( L * sigma_D^2 + (mu_D)^2 * sigma_L^2 )
 *
 * When both Demand and Lead Time are variable:
 * - L = average lead time (days)
 * - sigma_D = standard deviation of daily demand
 * - mu_D = average daily demand
 * - sigma_L = standard deviation of lead time (days)
 * - Z = normal distribution safety factor for desired cycle service level
 */
export interface SafetyStockCalculation {
  serviceLevel: number; // e.g. 0.95
  zFactor: number; // e.g. 1.645
  avgDailyDemand: number; // mu_D
  demandStdDev: number; // sigma_D
  avgLeadTimeDays: number; // L
  leadTimeStdDev: number; // sigma_L
  demandVarianceComponent: number; // L * sigma_D^2
  leadTimeVarianceComponent: number; // mu_D^2 * sigma_L^2
  totalCombinedStdDev: number; // sqrt(L * sigma_D^2 + mu_D^2 * sigma_L^2)
  safetyStockUnits: number; // SS
  reorderPointUnits: number; // ROP = mu_D * L + SS
  formulaString: string;
  stepByStepExplanation: string[];
}

export function calculateRigorousSafetyStock(
  avgDailyDemand: number,
  demandStdDev: number,
  avgLeadTimeDays: number,
  leadTimeStdDev: number,
  serviceLevel: number = 0.95
): SafetyStockCalculation {
  const zFactor = normalInverseCDF(serviceLevel);
  const demandVarPart = avgLeadTimeDays * Math.pow(demandStdDev, 2);
  const leadTimeVarPart = Math.pow(avgDailyDemand, 2) * Math.pow(leadTimeStdDev, 2);
  const totalCombinedStdDev = Math.sqrt(demandVarPart + leadTimeVarPart);
  const safetyStockUnits = Math.ceil(zFactor * totalCombinedStdDev);
  const reorderPointUnits = Math.ceil((avgDailyDemand * avgLeadTimeDays) + safetyStockUnits);

  return {
    serviceLevel,
    zFactor,
    avgDailyDemand,
    demandStdDev,
    avgLeadTimeDays,
    leadTimeStdDev,
    demandVarianceComponent: Number(demandVarPart.toFixed(2)),
    leadTimeVarianceComponent: Number(leadTimeVarPart.toFixed(2)),
    totalCombinedStdDev: Number(totalCombinedStdDev.toFixed(2)),
    safetyStockUnits,
    reorderPointUnits,
    formulaString: 'SS = Z_α · √( L · σ_D² + μ_D² · σ_L² )',
    stepByStepExplanation: [
      `1. Target Cycle Service Level α = ${(serviceLevel * 100).toFixed(1)}% → Normal Z-Factor Z = ${zFactor}`,
      `2. Demand Variance during Lead Time: L · σ_D² = ${avgLeadTimeDays} · (${demandStdDev})² = ${demandVarPart.toFixed(1)}`,
      `3. Lead Time Variability Impact: μ_D² · σ_L² = (${avgDailyDemand})² · (${leadTimeStdDev})² = ${leadTimeVarPart.toFixed(1)}`,
      `4. Total Combined Risk Exposure: σ_combined = √(${demandVarPart.toFixed(1)} + ${leadTimeVarPart.toFixed(1)}) = ${totalCombinedStdDev.toFixed(2)} units`,
      `5. Safety Stock: SS = ${zFactor} · ${totalCombinedStdDev.toFixed(2)} = ${safetyStockUnits} units`,
      `6. Reorder Point: ROP = (μ_D · L) + SS = (${avgDailyDemand} · ${avgLeadTimeDays}) + ${safetyStockUnits} = ${reorderPointUnits} units`
    ]
  };
}

/**
 * Economic Order Quantity (EOQ) - Wilson Formula with Holding & Ordering Costs
 * EOQ = sqrt( (2 * D * S) / H )
 * where H = h * C (Holding rate % * Unit purchasing cost)
 */
export interface EOQCalculation {
  annualDemand: number; // D
  orderSetupCost: number; // S ($/order)
  unitCost: number; // C ($/unit)
  annualHoldingRate: number; // h (e.g. 0.20 for 20%)
  unitHoldingCostAnnual: number; // H = h * C
  optimalEoqUnits: number; // EOQ
  annualOrdersCount: number; // D / EOQ
  annualOrderingCost: number; // (D / EOQ) * S
  annualHoldingCost: number; // (EOQ / 2) * H
  totalAnnualInventoryCost: number; // Ordering + Holding
  orderCycleDays: number; // 365 / (D / EOQ)
  formulaString: string;
  stepByStepExplanation: string[];
}

export function calculateRigorousEOQ(
  annualDemand: number,
  unitCost: number,
  orderSetupCost: number = 150,
  annualHoldingRate: number = 0.22
): EOQCalculation {
  const unitHoldingCostAnnual = Math.max(0.5, unitCost * annualHoldingRate);
  const rawEoq = Math.sqrt((2 * annualDemand * orderSetupCost) / unitHoldingCostAnnual);
  const optimalEoqUnits = Math.max(10, Math.round(rawEoq));
  const annualOrdersCount = Number((annualDemand / optimalEoqUnits).toFixed(1));
  const annualOrderingCost = Math.round((annualDemand / optimalEoqUnits) * orderSetupCost);
  const annualHoldingCost = Math.round((optimalEoqUnits / 2) * unitHoldingCostAnnual);
  const totalAnnualInventoryCost = annualOrderingCost + annualHoldingCost;
  const orderCycleDays = Math.round(365 / Math.max(0.1, annualOrdersCount));

  return {
    annualDemand,
    orderSetupCost,
    unitCost,
    annualHoldingRate,
    unitHoldingCostAnnual: Number(unitHoldingCostAnnual.toFixed(2)),
    optimalEoqUnits,
    annualOrdersCount,
    annualOrderingCost,
    annualHoldingCost,
    totalAnnualInventoryCost,
    orderCycleDays,
    formulaString: 'EOQ = √( (2 · D_annual · S_order) / (h · C_unit) )',
    stepByStepExplanation: [
      `1. Annual Unit Holding Cost: H = h · C = ${(annualHoldingRate * 100).toFixed(0)}% · $${unitCost} = $${unitHoldingCostAnnual.toFixed(2)}/unit/year`,
      `2. Numerator: 2 · D · S = 2 · ${annualDemand.toLocaleString()} · $${orderSetupCost} = ${(2 * annualDemand * orderSetupCost).toLocaleString()}`,
      `3. Optimal Batch Size: EOQ = √(${(2 * annualDemand * orderSetupCost).toLocaleString()} / ${unitHoldingCostAnnual.toFixed(2)}) = ${optimalEoqUnits.toLocaleString()} units`,
      `4. Frequency: ${annualOrdersCount} replenishment cycles/year (every ~${orderCycleDays} days)`,
      `5. Total Annual Carrying + Ordering Cost: $${annualHoldingCost.toLocaleString()} + $${annualOrderingCost.toLocaleString()} = $${totalAnnualInventoryCost.toLocaleString()}`
    ]
  };
}

/**
 * Statistical Outlier & Anomaly Detection (Gaussian Z-score)
 * Z = (x - mu) / sigma
 */
export function calculateZScore(
  value: number,
  sample: number[]
): { zScore: number; mean: number; stdDev: number; isOutlier: boolean; severity: 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } {
  if (sample.length === 0) return { zScore: 0, mean: value, stdDev: 1, isOutlier: false, severity: 'NORMAL' };
  const mean = sample.reduce((sum, v) => sum + v, 0) / sample.length;
  const variance = sample.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / Math.max(1, sample.length - 1);
  const stdDev = Math.sqrt(variance) || 1;
  const zScore = Number(((value - mean) / stdDev).toFixed(2));
  const absZ = Math.abs(zScore);

  let severity: 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'NORMAL';
  if (absZ >= 3.0) severity = 'CRITICAL';
  else if (absZ >= 2.33) severity = 'HIGH';
  else if (absZ >= 1.64) severity = 'MEDIUM';

  return {
    zScore,
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    isOutlier: absZ >= 2.0,
    severity
  };
}

/**
 * Exact Stockout Probability Calculation using Standard Normal CDF
 * P(Stockout) = 1 - Phi( (Stock - mu_D * L) / sigma_lead_time_demand )
 */
export function calculateStockoutProbability(
  currentAvailableStock: number,
  avgDailyDemand: number,
  leadTimeDays: number,
  demandStdDev: number,
  leadTimeStdDev: number
): { probabilityPercent: number; bufferDeltaUnits: number; zCoverage: number } {
  const expectedDemandDuringLeadTime = avgDailyDemand * leadTimeDays;
  const combinedVariance = (leadTimeDays * Math.pow(demandStdDev, 2)) + (Math.pow(avgDailyDemand, 2) * Math.pow(leadTimeStdDev, 2));
  const combinedStdDev = Math.sqrt(combinedVariance) || 1;

  const zCoverage = (currentAvailableStock - expectedDemandDuringLeadTime) / combinedStdDev;
  const nonStockoutProb = standardNormalCDF(zCoverage);
  const stockoutProb = Math.max(0, Math.min(100, (1 - nonStockoutProb) * 100));

  return {
    probabilityPercent: Number(stockoutProb.toFixed(1)),
    bufferDeltaUnits: currentAvailableStock - expectedDemandDuringLeadTime,
    zCoverage: Number(zCoverage.toFixed(2))
  };
}

/**
 * Comprehensive Total Landed Cost (TLC) Model
 */
export interface LandedCostBreakdownModel {
  purchaseCost: number;
  inboundFreight: number;
  customsDutiesTariffs: number;
  inventoryCarryingCost: number;
  warehousingAndHandling: number;
  qualityRiskAllowance: number;
  totalLandedCost: number;
  costPerUnit: number;
  breakdownPercentages: {
    purchase: number;
    freight: number;
    customs: number;
    carrying: number;
    warehousing: number;
    risk: number;
  };
}

export function calculateLandedCost(
  units: number,
  unitPurchasePrice: number,
  freightPerUnit: number,
  tariffRatePercent: number = 4.5,
  annualHoldingRatePercent: number = 20,
  leadTimeDays: number = 14,
  handlingFeePerUnit: number = 2.2,
  defectAllowancePercent: number = 1.2
): LandedCostBreakdownModel {
  const purchaseCost = units * unitPurchasePrice;
  const inboundFreight = units * freightPerUnit;
  const customsDutiesTariffs = purchaseCost * (tariffRatePercent / 100);
  const inventoryCarryingCost = purchaseCost * (annualHoldingRatePercent / 100) * (leadTimeDays / 365);
  const warehousingAndHandling = units * handlingFeePerUnit;
  const qualityRiskAllowance = purchaseCost * (defectAllowancePercent / 100);

  const totalLandedCost = purchaseCost + inboundFreight + customsDutiesTariffs + inventoryCarryingCost + warehousingAndHandling + qualityRiskAllowance;
  const costPerUnit = Number((totalLandedCost / Math.max(1, units)).toFixed(2));

  return {
    purchaseCost: Math.round(purchaseCost),
    inboundFreight: Math.round(inboundFreight),
    customsDutiesTariffs: Math.round(customsDutiesTariffs),
    inventoryCarryingCost: Math.round(inventoryCarryingCost),
    warehousingAndHandling: Math.round(warehousingAndHandling),
    qualityRiskAllowance: Math.round(qualityRiskAllowance),
    totalLandedCost: Math.round(totalLandedCost),
    costPerUnit,
    breakdownPercentages: {
      purchase: Number(((purchaseCost / Math.max(1, totalLandedCost)) * 100).toFixed(1)),
      freight: Number(((inboundFreight / Math.max(1, totalLandedCost)) * 100).toFixed(1)),
      customs: Number(((customsDutiesTariffs / Math.max(1, totalLandedCost)) * 100).toFixed(1)),
      carrying: Number(((inventoryCarryingCost / Math.max(1, totalLandedCost)) * 100).toFixed(1)),
      warehousing: Number(((warehousingAndHandling / Math.max(1, totalLandedCost)) * 100).toFixed(1)),
      risk: Number(((qualityRiskAllowance / Math.max(1, totalLandedCost)) * 100).toFixed(1))
    }
  };
}
