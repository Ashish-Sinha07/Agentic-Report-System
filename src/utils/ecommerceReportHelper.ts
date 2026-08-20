import { supplyChainStore } from '../services/store';
import { getAdCostMetrics, isSlpProduct } from '../components/views/OrdersReturnsView';
import { PlatformReportData, CrossPlatformProductRow, GrandExecutiveSummaryData } from './pdfReportGenerator';

export function computeEcommerceAuditData(scopeCatalog: 'SLP_ONLY' | 'ALL' = 'SLP_ONLY') {
  const salesOrders = supplyChainStore.salesOrders;
  const returns = supplyChainStore.returns;
  const rawProducts = supplyChainStore.products;
  const inventory = supplyChainStore.inventory;

  const platformMeta: Record<string, { label: string; color: string; commissionRate: number }> = {
    'Amazon': { label: 'Amazon India', color: '#f59e0b', commissionRate: 0.15 },
    'Blinkit': { label: 'Blinkit Quick Commerce', color: '#10b981', commissionRate: 0.12 },
    'Flipkart': { label: 'Flipkart E-Commerce', color: '#3b82f6', commissionRate: 0.14 },
    'Direct Web': { label: 'Sleepsia.in (D2C)', color: '#8b5cf6', commissionRate: 0.03 },
    'Myntra': { label: 'Myntra Fashion', color: '#ec4899', commissionRate: 0.16 },
    'Retail Stores': { label: 'Retail Experience Centers', color: '#06b6d4', commissionRate: 0.05 }
  };

  const platformKeys = ['Amazon', 'Blinkit', 'Flipkart', 'Direct Web', 'Myntra', 'Retail Stores'];

  const orderPlatformMap = new Map<string, string>();
  salesOrders.forEach(o => {
    orderPlatformMap.set(o.orderId, o.platform);
  });

  const products = scopeCatalog === 'SLP_ONLY' ? rawProducts.filter(isSlpProduct) : rawProducts;

  // 1. Platform-Specific Reports
  const platformReports: PlatformReportData[] = platformKeys.map(platKey => {
    const meta = platformMeta[platKey];
    const platOrders = salesOrders.filter(o => o.platform === platKey);
    const platReturns = returns.filter(r => orderPlatformMap.get(r.orderId) === platKey);

    const totalOrdersCount = platOrders.length;
    const totalUnitsSold = platOrders.reduce((sum, o) => sum + o.quantity, 0);
    const grossRevenue = platOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const refundAmount = platReturns.reduce((sum, r) => sum + r.refundAmount, 0);
    const netRevenue = Math.max(0, grossRevenue - refundAmount);

    const onTimeOrders = platOrders.filter(o => o.deliveryOnTime).length;
    const otifRate = totalOrdersCount > 0 ? (onTimeOrders / totalOrdersCount) * 100 : 0;
    const returnCount = platReturns.length;
    const returnRate = totalUnitsSold > 0 ? (returnCount / totalUnitsSold) * 100 : 0;

    const productBreakdowns = products.map(product => {
      const prodOrders = platOrders.filter(o => o.sku === product.sku);
      const prodReturns = platReturns.filter(r => r.sku === product.sku);

      const unitsSold = prodOrders.reduce((sum, o) => sum + o.quantity, 0);
      const prodGrossRevenue = prodOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const prodRefundAmount = prodReturns.reduce((sum, r) => sum + r.refundAmount, 0);
      const prodReturnUnits = prodReturns.length;
      const prodReturnRate = unitsSold > 0 ? (prodReturnUnits / unitsSold) * 100 : 0;

      const adMetrics = getAdCostMetrics(
        platKey,
        product.sku,
        prodGrossRevenue,
        unitsSold,
        prodRefundAmount,
        product.sellingPrice || 1499
      );

      return {
        sku: product.sku,
        productName: product.productName,
        category: product.category,
        unitPrice: product.sellingPrice || 1499,
        unitsSold,
        grossRevenue: prodGrossRevenue,
        refundAmount: prodRefundAmount,
        returnUnits: prodReturnUnits,
        returnRate: prodReturnRate,
        adMetrics
      };
    }).filter(p => p.unitsSold > 0 || p.grossRevenue > 0 || scopeCatalog === 'SLP_ONLY');

    const totalAdCost = productBreakdowns.reduce((sum, p) => sum + p.adMetrics.adCost, 0);
    const totalNetAdCost = totalAdCost + refundAmount;
    const tacosPercent = netRevenue > 0 ? (totalAdCost / netRevenue) * 100 : 0;

    const totalInorganicUnits = productBreakdowns.reduce((sum, p) => sum + p.adMetrics.inorganicUnits, 0);
    const totalOrganicUnits = productBreakdowns.reduce((sum, p) => sum + p.adMetrics.organicUnits, 0);

    const totalCogs = productBreakdowns.reduce((sum, p) => sum + p.adMetrics.cogs, 0);
    const totalFulfillment = productBreakdowns.reduce((sum, p) => sum + p.adMetrics.fulfillment, 0);
    const totalNetProfit = netRevenue - totalCogs - totalAdCost - totalFulfillment;
    const profitMarginPercent = netRevenue > 0 ? (totalNetProfit / netRevenue) * 100 : 0;

    return {
      platformKey: platKey,
      label: meta.label,
      color: meta.color,
      totalOrdersCount,
      totalUnitsSold,
      grossRevenue,
      refundAmount,
      netRevenue,
      otifRate,
      returnCount,
      returnRate,
      totalAdCost,
      totalNetAdCost,
      tacosPercent,
      totalInorganicUnits,
      totalOrganicUnits,
      totalCogs,
      totalFulfillment,
      totalNetProfit,
      profitMarginPercent,
      productBreakdowns
    };
  });

  // 2. Cross-Platform Products
  const crossPlatformProducts: CrossPlatformProductRow[] = products.map(product => {
    let totalUnitsSold = 0;
    let totalGrossRevenue = 0;
    let totalRefundAmount = 0;
    let totalReturnUnits = 0;
    let totalOrganicUnits = 0;
    let totalInorganicUnits = 0;
    let totalAdCost = 0;
    let totalNetProfit = 0;
    let totalCogs = 0;
    let totalFulfillment = 0;

    const contributions: { label: string; revenue: number; margin: number }[] = [];

    platformReports.forEach(pr => {
      const prodData = pr.productBreakdowns.find(p => p.sku === product.sku);
      if (prodData) {
        totalUnitsSold += prodData.unitsSold;
        totalGrossRevenue += prodData.grossRevenue;
        totalRefundAmount += prodData.refundAmount;
        totalReturnUnits += prodData.returnUnits;
        totalOrganicUnits += prodData.adMetrics.organicUnits;
        totalInorganicUnits += prodData.adMetrics.inorganicUnits;
        totalAdCost += prodData.adMetrics.adCost;
        totalNetProfit += prodData.adMetrics.netProfit;
        totalCogs += prodData.adMetrics.cogs;
        totalFulfillment += prodData.adMetrics.fulfillment;

        if (prodData.unitsSold > 0) {
          contributions.push({
            label: pr.label,
            revenue: prodData.grossRevenue,
            margin: prodData.adMetrics.profitMarginPercent
          });
        }
      }
    });

    const totalNetRevenue = Math.max(0, totalGrossRevenue - totalRefundAmount);
    const totalNetAdCost = totalAdCost + totalRefundAmount;
    const tacosPercent = totalNetRevenue > 0 ? (totalAdCost / totalNetRevenue) * 100 : 0;
    const returnRate = totalUnitsSold > 0 ? (totalReturnUnits / totalUnitsSold) * 100 : 0;
    const profitMarginPercent = totalNetRevenue > 0 ? (totalNetProfit / totalNetRevenue) * 100 : 0;

    const prodInventory = inventory.filter(i => i.sku === product.sku);
    const availableStock = prodInventory.reduce((s, i) => s + i.availableQty, 0);
    const avgDailyDemand = prodInventory.reduce((s, i) => s + i.averageDailyDemand, 0);
    const daysOfSupply = avgDailyDemand > 0 ? Math.round(availableStock / avgDailyDemand) : 999;
    const hasStockoutRisk = daysOfSupply < 10 || availableStock < 50;

    const bestRev = [...contributions].sort((a, b) => b.revenue - a.revenue)[0];
    const bestMarg = [...contributions].sort((a, b) => b.margin - a.margin)[0];

    return {
      sku: product.sku,
      productName: product.productName,
      category: product.category,
      unitPrice: product.sellingPrice || 1499,
      totalUnitsSold,
      totalGrossRevenue,
      totalRefundAmount,
      totalNetRevenue,
      totalReturnUnits,
      returnRate,
      totalOrganicUnits,
      totalInorganicUnits,
      totalAdCost,
      totalNetAdCost,
      tacosPercent,
      totalCogs,
      totalFulfillment,
      totalNetProfit,
      profitMarginPercent,
      availableStock,
      daysOfSupply,
      hasStockoutRisk,
      bestChannelRevenue: bestRev?.label || 'N/A',
      bestChannelMargin: bestMarg?.label || 'N/A'
    };
  });

  // 3. Grand Executive Summary
  const totalGrossRevenue = platformReports.reduce((s, p) => s + p.grossRevenue, 0);
  const totalRefundAmount = platformReports.reduce((s, p) => s + p.refundAmount, 0);
  const totalNetRevenue = platformReports.reduce((s, p) => s + p.netRevenue, 0);
  const totalOrdersCount = platformReports.reduce((s, p) => s + p.totalOrdersCount, 0);
  const totalUnitsSold = platformReports.reduce((s, p) => s + p.totalUnitsSold, 0);
  const totalReturnCount = platformReports.reduce((s, p) => s + p.returnCount, 0);

  const blendedReturnRate = totalUnitsSold > 0 ? (totalReturnCount / totalUnitsSold) * 100 : 0;
  const totalOnTime = salesOrders.filter(o => o.deliveryOnTime).length;
  const blendedOtifRate = salesOrders.length > 0 ? (totalOnTime / salesOrders.length) * 100 : 0;

  const totalAdSpend = platformReports.reduce((s, p) => s + p.totalAdCost, 0);
  const grandNetAdCost = totalAdSpend + totalRefundAmount;
  const grandTACost = totalAdSpend;
  const blendedTacos = totalNetRevenue > 0 ? (totalAdSpend / totalNetRevenue) * 100 : 0;

  const totalOrganicUnits = platformReports.reduce((s, p) => s + p.totalOrganicUnits, 0);
  const totalInorganicUnits = platformReports.reduce((s, p) => s + p.totalInorganicUnits, 0);

  const totalCogs = platformReports.reduce((s, p) => s + p.totalCogs, 0);
  const totalFulfillment = platformReports.reduce((s, p) => s + p.totalFulfillment, 0);
  const grandNetProfit = totalNetRevenue - totalCogs - totalAdSpend - totalFulfillment;
  const grandProfitMargin = totalNetRevenue > 0 ? (grandNetProfit / totalNetRevenue) * 100 : 0;

  const rankedByRevenue = [...platformReports].sort((a, b) => b.grossRevenue - a.grossRevenue);
  const rankedByProfit = [...platformReports].sort((a, b) => b.totalNetProfit - a.totalNetProfit);

  const grandSummary: GrandExecutiveSummaryData = {
    totalGrossRevenue,
    totalRefundAmount,
    totalNetRevenue,
    totalOrdersCount,
    totalUnitsSold,
    totalReturnCount,
    blendedReturnRate,
    blendedOtifRate,
    totalAdSpend,
    grandNetAdCost,
    grandTACost,
    blendedTacos,
    totalOrganicUnits,
    totalInorganicUnits,
    totalCogs,
    totalFulfillment,
    grandNetProfit,
    grandProfitMargin,
    rankedByRevenue,
    rankedByProfit
  };

  return {
    platformReports,
    crossPlatformProducts,
    grandSummary
  };
}
