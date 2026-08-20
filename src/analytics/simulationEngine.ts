import { SimulationParams, SimulationResult, SupplyChainKPIs } from '../types';

export function runSupplyChainSimulation(
  baseKpis: SupplyChainKPIs,
  params: SimulationParams
): SimulationResult {
  const demandMult = 1 + (params.demandChangePercent / 100);
  const leadTimeDelta = params.supplierLeadTimeDeltaDays;
  const supplierCostMult = 1 + (params.supplierCostChangePercent / 100);
  const freightCostMult = 1 + (params.transportationCostChangePercent / 100);
  const safetyStockMult = params.safetyStockMultiplier;
  const capacityMult = 1 + (params.warehouseCapacityChangePercent / 100);

  // Baseline figures
  const baseInventoryVal = baseKpis.totalInventoryValue;
  const baseStockouts = baseKpis.stockoutRiskCount;
  const baseOtif = baseKpis.logisticsOtifRate;
  const baseTotalCost = baseKpis.totalSupplyChainCost;
  const baseWorkingCap = baseInventoryVal * 1.15;
  const baseDaysSupply = baseKpis.daysOfInventorySupply;

  // Simulated metrics computation
  // If demand goes up and lead time increases without safety stock, stockouts skyrocket
  let simStockouts = Math.max(
    0,
    Math.round(
      baseStockouts *
        (demandMult > 1 ? demandMult * 1.4 : demandMult * 0.7) *
        (1 + leadTimeDelta * 0.08) /
        (safetyStockMult * 0.95)
    )
  );

  // Simulated Days of Supply
  const simDaysSupply = Number(((baseDaysSupply / Math.max(0.01, demandMult)) * safetyStockMult).toFixed(1));

  // Simulated OTIF
  let simOtif = baseOtif;
  if (demandMult > 1.15) simOtif -= (demandMult - 1) * 22;
  if (leadTimeDelta > 3) simOtif -= leadTimeDelta * 1.2;
  if (freightCostMult < 0.8) simOtif -= 4.5; // cheaper slower carriers
  if (safetyStockMult > 1.2) simOtif += 3.5; // buffer helps
  simOtif = Math.min(99.8, Math.max(52.0, Number(simOtif.toFixed(1))));

  // Simulated Inventory Value
  const simInventoryVal = Math.round(
    baseInventoryVal * safetyStockMult * (supplierCostMult) * (demandMult > 1.2 ? 0.9 : 1.05)
  );

  // Simulated Costs
  const simProcureCost = (baseTotalCost * 0.55) * supplierCostMult * demandMult;
  const simFreightCost = (baseTotalCost * 0.20) * freightCostMult * (demandMult > 1 ? demandMult * 1.1 : demandMult);
  const holdingRatio = baseInventoryVal > 0 ? (simInventoryVal / baseInventoryVal) : 1;
  const simHoldingCost = (baseTotalCost * 0.15) * holdingRatio;
  const simStockoutCost = simStockouts * 4800;
  const simWarehousingCost = (baseTotalCost * 0.10) / Math.max(0.5, capacityMult);

  const rawTotalCost = Math.round(simProcureCost + simFreightCost + simHoldingCost + simStockoutCost + simWarehousingCost);
  const simTotalCost = isNaN(rawTotalCost) ? 0 : rawTotalCost;
  const simWorkingCap = Math.round(simInventoryVal * 1.18);

  const deltas = {
    inventoryValueDelta: simInventoryVal - baseInventoryVal,
    stockoutCountDelta: simStockouts - baseStockouts,
    serviceLevelDelta: Number((simOtif - baseOtif).toFixed(1)),
    totalCostDelta: simTotalCost - baseTotalCost,
    workingCapitalDelta: simWorkingCap - baseWorkingCap
  };

  const impactAnalysis: string[] = [];
  const criticalRisksIdentified: string[] = [];
  const suggestedMitigations: string[] = [];

  if (params.demandChangePercent > 15) {
    impactAnalysis.push(`Demand surge (+${params.demandChangePercent}%) accelerates stock depletion across fast-moving Class-A items.`);
    criticalRisksIdentified.push(`Projected ${simStockouts} stockout incidents across regional fulfillment centers.`);
    suggestedMitigations.push(`Increase supplier weekly replenishment quota by ${params.demandChangePercent}% and activate priority air freight.`);
  }

  if (params.supplierLeadTimeDeltaDays > 4) {
    impactAnalysis.push(`Lead-time extension of +${params.supplierLeadTimeDeltaDays} days causes supply pipeline lag and inventory buffer erosion.`);
    criticalRisksIdentified.push(`Supplier delivery pipeline vulnerable to cumulative stockout ripple effect.`);
    suggestedMitigations.push(`Engage secondary regional suppliers and adjust ERP reorder point thresholds upwards.`);
  }

  if (params.supplierCostChangePercent > 8 || params.transportationCostChangePercent > 10) {
    impactAnalysis.push(`Input cost inflation drives Total Supply Chain Cost up by $${Math.abs(deltas.totalCostDelta).toLocaleString()}.`);
    suggestedMitigations.push(`Consolidate shipment loads to full truckload (FTL) and negotiate volume tiered supplier discounts.`);
  }

  if (impactAnalysis.length === 0) {
    impactAnalysis.push('Supply chain operating within balanced tolerance parameters.');
    suggestedMitigations.push('Maintain baseline S&OP planning cadence.');
  }

  return {
    params,
    baseline: {
      inventoryValue: baseInventoryVal,
      stockoutCount: baseStockouts,
      serviceLevelOtif: baseOtif,
      totalCost: baseTotalCost,
      workingCapital: baseWorkingCap,
      averageDaysSupply: baseDaysSupply
    },
    simulated: {
      inventoryValue: simInventoryVal,
      stockoutCount: simStockouts,
      serviceLevelOtif: simOtif,
      totalCost: simTotalCost,
      workingCapital: simWorkingCap,
      averageDaysSupply: simDaysSupply
    },
    deltas,
    impactAnalysis,
    criticalRisksIdentified,
    suggestedMitigations
  };
}
