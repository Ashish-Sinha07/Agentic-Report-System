import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Store,
  BarChart3,
  Percent,
  Layers,
  Sparkles,
  ShieldCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';
import { getAdCostMetrics, isSlpProduct } from '../views/OrdersReturnsView';
import { generateEcommerceAuditPDF } from '../../utils/pdfReportGenerator';

interface EcommerceReportGeneratorProps {
  initialPlatform?: string;
  onNavigateToMatrix?: () => void;
}

export const EcommerceReportGenerator: React.FC<EcommerceReportGeneratorProps> = ({
  initialPlatform = 'ALL',
  onNavigateToMatrix
}) => {
  const [selectedPlatformScope, setSelectedPlatformScope] = useState<string>(initialPlatform);
  const [scopeCatalog, setScopeCatalog] = useState<'SLP_ONLY' | 'ALL'>('SLP_ONLY');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<string, boolean>>({
    'Amazon': true,
    'Blinkit': true,
    'Flipkart': true,
    'Direct Web': true,
    'Myntra': true,
    'Retail Stores': true
  });
  const [reportDate] = useState<string>(() => new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }));

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

  const orderPlatformMap = useMemo(() => {
    const map = new Map<string, string>();
    salesOrders.forEach(o => {
      map.set(o.orderId, o.platform);
    });
    return map;
  }, [salesOrders]);

  // Filtered product catalog based on selection
  const products = useMemo(() => {
    if (scopeCatalog === 'SLP_ONLY') {
      return rawProducts.filter(isSlpProduct);
    }
    return rawProducts;
  }, [rawProducts, scopeCatalog]);

  // 1. Compute Platform-Specific Performance Data & Platform-Specific Product Breakdowns
  const platformReports = useMemo(() => {
    return platformKeys.map(platKey => {
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

      // Platform Product-Specific Metrics
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

      // Platform Total Ad Spend & Profitability
      const totalAdCost = productBreakdowns.reduce((sum, p) => sum + p.adMetrics.adCost, 0);
      const totalNetAdCost = totalAdCost + refundAmount;
      const totalTACost = totalAdCost;
      const tacosPercent = netRevenue > 0 ? (totalAdCost / netRevenue) * 100 : 0;

      const totalInorganicUnits = productBreakdowns.reduce((sum, p) => sum + p.adMetrics.inorganicUnits, 0);
      const totalOrganicUnits = productBreakdowns.reduce((sum, p) => sum + p.adMetrics.organicUnits, 0);

      const totalCogs = productBreakdowns.reduce((sum, p) => sum + p.adMetrics.cogs, 0);
      const totalFulfillment = productBreakdowns.reduce((sum, p) => sum + p.adMetrics.fulfillment, 0);
      const totalNetProfit = netRevenue - totalCogs - totalAdCost - totalFulfillment;
      const profitMarginPercent = netRevenue > 0 ? (totalNetProfit / netRevenue) * 100 : 0;

      // Identify Top Margin Product & Highest Return SKU
      const sortedByMargin = [...productBreakdowns].sort((a, b) => b.adMetrics.profitMarginPercent - a.adMetrics.profitMarginPercent);
      const sortedByReturn = [...productBreakdowns].sort((a, b) => b.returnRate - a.returnRate);

      const topProduct = sortedByMargin[0];
      const worstReturnProduct = sortedByReturn[0];

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
        totalTACost,
        tacosPercent,
        totalInorganicUnits,
        totalOrganicUnits,
        totalCogs,
        totalFulfillment,
        totalNetProfit,
        profitMarginPercent,
        productBreakdowns,
        topProduct,
        worstReturnProduct
      };
    });
  }, [platformKeys, salesOrders, returns, orderPlatformMap, products, scopeCatalog]);

  // Filter platforms to display based on selectedPlatformScope
  const displayedPlatformReports = useMemo(() => {
    if (selectedPlatformScope === 'ALL') {
      return platformReports;
    }
    return platformReports.filter(p => p.platformKey === selectedPlatformScope);
  }, [platformReports, selectedPlatformScope]);

  // 2. OVERALL REPORT FOR EACH PRODUCT FROM ALL PLATFORMS (Cross-Platform Product Aggregation)
  const crossPlatformProductReports = useMemo(() => {
    return products.map(product => {
      // Find this product's performance in every platform
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

      const platformContributions: {
        platformKey: string;
        label: string;
        color: string;
        units: number;
        revenue: number;
        profit: number;
        margin: number;
        returnRate: number;
        adCost: number;
      }[] = [];

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

          if (prodData.unitsSold > 0 || prodData.grossRevenue > 0) {
            platformContributions.push({
              platformKey: pr.platformKey,
              label: pr.label,
              color: pr.color,
              units: prodData.unitsSold,
              revenue: prodData.grossRevenue,
              profit: prodData.adMetrics.netProfit,
              margin: prodData.adMetrics.profitMarginPercent,
              returnRate: prodData.returnRate,
              adCost: prodData.adMetrics.adCost
            });
          }
        }
      });

      const totalNetRevenue = Math.max(0, totalGrossRevenue - totalRefundAmount);
      const totalNetAdCost = totalAdCost + totalRefundAmount;
      const totalTACost = totalAdCost;
      const tacosPercent = totalNetRevenue > 0 ? (totalAdCost / totalNetRevenue) * 100 : 0;
      const returnRate = totalUnitsSold > 0 ? (totalReturnUnits / totalUnitsSold) * 100 : 0;
      const profitMarginPercent = totalNetRevenue > 0 ? (totalNetProfit / totalNetRevenue) * 100 : 0;

      // Stock Inventory
      const prodInventory = inventory.filter(i => i.sku === product.sku);
      const availableStock = prodInventory.reduce((s, i) => s + i.availableQty, 0);
      const avgDailyDemand = prodInventory.reduce((s, i) => s + i.averageDailyDemand, 0);
      const daysOfSupply = avgDailyDemand > 0 ? Math.round(availableStock / avgDailyDemand) : 999;
      const hasStockoutRisk = daysOfSupply < 10 || availableStock < 50;

      // Best Channel
      const bestByRevenue = [...platformContributions].sort((a, b) => b.revenue - a.revenue)[0];
      const bestByMargin = [...platformContributions].sort((a, b) => b.margin - a.margin)[0];

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
        totalTACost,
        tacosPercent,
        totalCogs,
        totalFulfillment,
        totalNetProfit,
        profitMarginPercent,
        availableStock,
        daysOfSupply,
        hasStockoutRisk,
        platformContributions,
        bestChannelRevenue: bestByRevenue?.label || 'N/A',
        bestChannelMargin: bestByMargin?.label || 'N/A'
      };
    });
  }, [products, platformReports, inventory]);

  // 3. OVERALL SUMMARY / REPORT OF ALL PRODUCTS FROM ALL PLATFORMS (Grand Executive Total)
  const grandExecutiveSummary = useMemo(() => {
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

    // Platform Rankings
    const rankedByRevenue = [...platformReports].sort((a, b) => b.grossRevenue - a.grossRevenue);
    const rankedByProfit = [...platformReports].sort((a, b) => b.totalNetProfit - a.totalNetProfit);
    const rankedByTacosEfficiency = [...platformReports].sort((a, b) => a.tacosPercent - b.tacosPercent);

    return {
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
      rankedByProfit,
      productCount: crossPlatformProductReports.length,
      platformCount: platformReports.length,
      topPlatformRevenue: rankedByRevenue[0],
      topPlatformProfit: rankedByProfit[0],
      mostEfficientAdPlatform: rankedByTacosEfficiency[0]
    };
  }, [platformReports, salesOrders, crossPlatformProductReports]);

  // Copy Markdown Report
  const handleCopyMarkdown = () => {
    let md = `# SLEEPSIA INDIA - E-COMMERCE PLATFORM & PRODUCT PERFORMANCE AUDIT REPORT\n`;
    md += `**Generated Date:** ${reportDate} | **Scope:** ${selectedPlatformScope === 'ALL' ? 'All E-Commerce Platforms' : selectedPlatformScope} | **Catalog:** ${scopeCatalog === 'SLP_ONLY' ? 'SLP Active Ad Catalog' : 'Full Catalog'}\n\n`;

    md += `## 1. EXECUTIVE ENTERPRISE P&L SUMMARY (ALL PRODUCTS & CHANNELS)\n`;
    md += `- **Gross Omni-Channel Revenue:** ₹${Math.round(grandExecutiveSummary.totalGrossRevenue).toLocaleString('en-IN')}\n`;
    md += `- **Returns & Refund Penalty:** ₹${Math.round(grandExecutiveSummary.totalRefundAmount).toLocaleString('en-IN')} (${grandExecutiveSummary.blendedReturnRate.toFixed(1)}% return rate)\n`;
    md += `- **Net Realized Revenue:** ₹${Math.round(grandExecutiveSummary.totalNetRevenue).toLocaleString('en-IN')}\n`;
    md += `- **Total Direct Ad Spend (AdCost):** ₹${Math.round(grandExecutiveSummary.totalAdSpend).toLocaleString('en-IN')}\n`;
    md += `- **Net Ad Cost (Include Returns):** ₹${Math.round(grandExecutiveSummary.grandNetAdCost).toLocaleString('en-IN')}\n`;
    md += `- **Blended Portfolio TACoS:** ${grandExecutiveSummary.blendedTacos.toFixed(1)}%\n`;
    md += `- **Total Units Sold:** ${grandExecutiveSummary.totalUnitsSold.toLocaleString('en-IN')} units (${grandExecutiveSummary.totalOrganicUnits} Organic / ${grandExecutiveSummary.totalInorganicUnits} Ads)\n`;
    md += `- **Portfolio Net Operating Profit:** ₹${Math.round(grandExecutiveSummary.grandNetProfit).toLocaleString('en-IN')} (${grandExecutiveSummary.grandProfitMargin.toFixed(1)}% Operating Margin)\n\n`;

    md += `## 2. PLATFORM-BY-PLATFORM EXECUTIVE BREAKDOWN & PRODUCT STATS\n`;
    displayedPlatformReports.forEach(pr => {
      md += `### Channel: ${pr.label}\n`;
      md += `- **Gross Sales:** ₹${Math.round(pr.grossRevenue).toLocaleString('en-IN')} | **Net Sales:** ₹${Math.round(pr.netRevenue).toLocaleString('en-IN')} | **Units Sold:** ${pr.totalUnitsSold}\n`;
      md += `- **Fulfillment OTIF:** ${pr.otifRate.toFixed(1)}% | **Return Rate:** ${pr.returnRate.toFixed(1)}% (Refunds: ₹${Math.round(pr.refundAmount).toLocaleString('en-IN')})\n`;
      md += `- **AdCost:** ₹${Math.round(pr.totalAdCost).toLocaleString('en-IN')} | **NetAdCost (Incl. Return):** ₹${Math.round(pr.totalNetAdCost).toLocaleString('en-IN')} | **TACoS:** ${pr.tacosPercent.toFixed(1)}%\n`;
      md += `- **Net Profit:** ₹${Math.round(pr.totalNetProfit).toLocaleString('en-IN')} (${pr.profitMarginPercent.toFixed(1)}% Net Margin)\n\n`;
      md += `#### Product Breakdown on ${pr.label}:\n`;
      md += `| SKU | Product | Units | Net Sales | Ad Spend | NetAdCost | TACoS % | Net Profit | Margin % |\n`;
      md += `|---|---|---|---|---|---|---|---|---|\n`;
      pr.productBreakdowns.forEach(p => {
        md += `| ${p.sku} | ${p.productName} | ${p.unitsSold} | ₹${Math.round(p.adMetrics.netRevenue)} | ₹${Math.round(p.adMetrics.adCost)} | ₹${Math.round(p.adMetrics.netAdCost)} | ${p.adMetrics.tacosPercent.toFixed(1)}% | ₹${Math.round(p.adMetrics.netProfit)} | ${p.adMetrics.profitMarginPercent.toFixed(1)}% |\n`;
      });
      md += `\n`;
    });

    md += `## 3. CROSS-PLATFORM CONSOLIDATED REPORT FOR EACH PRODUCT (ALL PLATFORMS)\n`;
    md += `| SKU | Product Name | Total Units | Organic/Ads | Net Revenue | Total AdCost | NetAdCost (Incl. Ret) | TACoS % | Net Profit | Net Margin % | Stock Status |\n`;
    md += `|---|---|---|---|---|---|---|---|---|---|---|\n`;
    crossPlatformProductReports.forEach(p => {
      md += `| ${p.sku} | ${p.productName} | ${p.totalUnitsSold}u | ${p.totalOrganicUnits}u / ${p.totalInorganicUnits}u | ₹${Math.round(p.totalNetRevenue)} | ₹${Math.round(p.totalAdCost)} | ₹${Math.round(p.totalNetAdCost)} | ${p.tacosPercent.toFixed(1)}% | ₹${Math.round(p.totalNetProfit)} | ${p.profitMarginPercent.toFixed(1)}% | ${p.hasStockoutRisk ? 'STOCKOUT RISK' : 'HEALTHY'} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedNotification('Formatted Markdown report copied to clipboard!');
    setTimeout(() => setCopiedNotification(null), 4000);
  };

  // Download Comprehensive CSV Report
  const handleDownloadCSV = () => {
    let csv = `SLEEPSIA INDIA - E-COMMERCE PLATFORM & PRODUCT PERFORMANCE REPORT\n`;
    csv += `Generated Date,${reportDate}\n`;
    csv += `Scope,${selectedPlatformScope}\n`;
    csv += `Catalog,${scopeCatalog}\n\n`;

    csv += `SECTION 1: GRAND OVERALL SUMMARY ACROSS ALL PLATFORMS & PRODUCTS\n`;
    csv += `Metric,Value\n`;
    csv += `Total Gross Revenue,${grandExecutiveSummary.totalGrossRevenue.toFixed(2)}\n`;
    csv += `Total Refund Impact,${grandExecutiveSummary.totalRefundAmount.toFixed(2)}\n`;
    csv += `Total Net Revenue,${grandExecutiveSummary.totalNetRevenue.toFixed(2)}\n`;
    csv += `Total Units Sold,${grandExecutiveSummary.totalUnitsSold}\n`;
    csv += `Total Organic Units,${grandExecutiveSummary.totalOrganicUnits}\n`;
    csv += `Total Ad-Attributed Units,${grandExecutiveSummary.totalInorganicUnits}\n`;
    csv += `Total Direct Ad Spend (AdCost),${grandExecutiveSummary.totalAdSpend.toFixed(2)}\n`;
    csv += `Grand Net Ad Cost (Include Return),${grandExecutiveSummary.grandNetAdCost.toFixed(2)}\n`;
    csv += `Blended Portfolio TACoS %,${grandExecutiveSummary.blendedTacos.toFixed(2)}%\n`;
    csv += `Total COGS (35%),${grandExecutiveSummary.totalCogs.toFixed(2)}\n`;
    csv += `Total Channel Fulfillment Fees (8%),${grandExecutiveSummary.totalFulfillment.toFixed(2)}\n`;
    csv += `Grand Net Operating Profit,${grandExecutiveSummary.grandNetProfit.toFixed(2)}\n`;
    csv += `Grand Net Margin %,${grandExecutiveSummary.grandProfitMargin.toFixed(2)}%\n\n`;

    csv += `SECTION 2: PLATFORM-BY-PLATFORM OVERALL & PRODUCT SPECIFIC PERFORMANCE\n`;
    displayedPlatformReports.forEach(pr => {
      csv += `\n--- PLATFORM: ${pr.label} ---\n`;
      csv += `Platform Gross Sales,${pr.grossRevenue.toFixed(2)},Platform Net Sales,${pr.netRevenue.toFixed(2)},Platform Orders,${pr.totalOrdersCount},Platform Units,${pr.totalUnitsSold}\n`;
      csv += `Platform OTIF %,${pr.otifRate.toFixed(2)}%,Return Rate %,${pr.returnRate.toFixed(2)}%,Refund Value,${pr.refundAmount.toFixed(2)}\n`;
      csv += `Platform AdCost,${pr.totalAdCost.toFixed(2)},Platform NetAdCost (Incl. Ret),${pr.totalNetAdCost.toFixed(2)},TACoS %,${pr.tacosPercent.toFixed(2)}%,Net Profit,${pr.totalNetProfit.toFixed(2)},Net Margin %,${pr.profitMarginPercent.toFixed(2)}%\n\n`;

      csv += `SKU,Product Name,Category,Units Sold,Gross Revenue,Refund Amount,Net Revenue,Organic Units,Ads Units,AdCost,NetAdCost (Incl. Return),TACost,TACoS %,COGS,Fulfillment,Net Profit,Net Margin %\n`;
      pr.productBreakdowns.forEach(p => {
        csv += `"${p.sku}","${p.productName}","${p.category}",${p.unitsSold},${p.grossRevenue.toFixed(2)},${p.refundAmount.toFixed(2)},${p.adMetrics.netRevenue.toFixed(2)},${p.adMetrics.organicUnits},${p.adMetrics.inorganicUnits},${p.adMetrics.adCost.toFixed(2)},${p.adMetrics.netAdCost.toFixed(2)},${p.adMetrics.taCost.toFixed(2)},${p.adMetrics.tacosPercent.toFixed(2)}%,${p.adMetrics.cogs.toFixed(2)},${p.adMetrics.fulfillment.toFixed(2)},${p.adMetrics.netProfit.toFixed(2)},${p.adMetrics.profitMarginPercent.toFixed(2)}%\n`;
      });
    });

    csv += `\n\nSECTION 3: OVERALL CONSOLIDATED REPORT FOR EACH PRODUCT FROM ALL PLATFORMS\n`;
    csv += `SKU,Product Name,Category,Total Units (All Channels),Organic Units,Ads Units,Total Gross Sales,Total Refunds,Total Net Revenue,Total Ad Spend (AdCost),Total NetAdCost (Incl. Return),Total TACost,Blended TACoS %,Total Net Profit,Overall Net Margin %,Available Network Stock,Days of Supply,Stockout Risk,Best Channel Revenue,Best Channel Margin\n`;
    crossPlatformProductReports.forEach(p => {
      csv += `"${p.sku}","${p.productName}","${p.category}",${p.totalUnitsSold},${p.totalOrganicUnits},${p.totalInorganicUnits},${p.totalGrossRevenue.toFixed(2)},${p.totalRefundAmount.toFixed(2)},${p.totalNetRevenue.toFixed(2)},${p.totalAdCost.toFixed(2)},${p.totalNetAdCost.toFixed(2)},${p.totalTACost.toFixed(2)},${p.tacosPercent.toFixed(2)}%,${p.totalNetProfit.toFixed(2)},${p.profitMarginPercent.toFixed(2)}%,${p.availableStock},${p.daysOfSupply},"${p.hasStockoutRisk ? 'YES' : 'NO'}","${p.bestChannelRevenue}","${p.bestChannelMargin}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sleepsia_OmniChannel_Platform_Product_Report_${reportDate.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setCopiedNotification('Complete multi-tier CSV report downloaded successfully!');
    setTimeout(() => setCopiedNotification(null), 4000);
  };

  // Download Comprehensive PDF Report
  const handleDownloadPDF = (scopeToDownload: string = selectedPlatformScope) => {
    try {
      generateEcommerceAuditPDF({
        platformScope: scopeToDownload,
        platformReports,
        crossPlatformProducts: crossPlatformProductReports,
        grandSummary: grandExecutiveSummary,
        reportDate
      });
      setCopiedNotification(`Generated and downloaded ${scopeToDownload === 'ALL' ? 'Omni-Channel' : scopeToDownload} PDF Audit Report!`);
      setTimeout(() => setCopiedNotification(null), 4000);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const togglePlatformExpand = (platKey: string) => {
    setExpandedPlatforms(prev => ({
      ...prev,
      [platKey]: !prev[platKey]
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header & Interactive Configuration Card */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 shadow-xl backdrop-blur-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Comprehensive E-Commerce Platform & Product Performance Audit
              </h2>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full font-mono">
                Multi-Channel Suite
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Consolidated 3-tier report: <strong>(1) Platform-specific overview and product-level stats</strong> &rarr; <strong>(2) Cross-platform consolidated performance for each SKU</strong> &rarr; <strong>(3) Holistic enterprise summary across all channels</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            <button
              id="btn-download-pdf"
              onClick={() => handleDownloadPDF(selectedPlatformScope)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/25"
              title="Generate and download high-resolution PDF report with tables and financial breakdowns"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Download master CSV with all tables and breakdowns"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Copy clean formatted markdown report for sharing"
            >
              {copiedNotification?.includes('Markdown') ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>Copy MD</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              title="Print or Save PDF via Browser Print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="pt-4 border-t border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Platform Scope:</span>
              <select
                value={selectedPlatformScope}
                onChange={e => setSelectedPlatformScope(e.target.value)}
                className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-indigo-500"
              >
                <option value="ALL">All Platforms (Amazon, Blinkit, Flipkart, D2C, Myntra, Retail)</option>
                <option value="Amazon">Amazon India</option>
                <option value="Blinkit">Blinkit Quick Commerce</option>
                <option value="Flipkart">Flipkart E-Commerce</option>
                <option value="Direct Web">Sleepsia.in (D2C)</option>
                <option value="Myntra">Myntra Fashion</option>
                <option value="Retail Stores">Retail Experience Centers</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Product Scope:</span>
              <div className="flex items-center p-0.5 bg-slate-900 rounded-xl border border-slate-700/60">
                <button
                  onClick={() => setScopeCatalog('SLP_ONLY')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    scopeCatalog === 'SLP_ONLY'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SLP Ad Catalog Only
                </button>
                <button
                  onClick={() => setScopeCatalog('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    scopeCatalog === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Inventory
                </button>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Audit Date: {reportDate} • Sleepsia India Operations</span>
          </div>
        </div>

        {copiedNotification && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{copiedNotification}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PLATFORM-SPECIFIC REPORTS WITH PRODUCT-SPECIFIC STATS          */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold font-mono">
                SECTION 1
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-400" />
                <span>Platform-Specific Operational & Product Performance Reports</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed breakdown for each e-commerce channel showing platform-level revenue, OTIF, returns, and itemized product performance.
            </p>
          </div>
        </div>

        {displayedPlatformReports.map(pr => {
          const isExpanded = expandedPlatforms[pr.platformKey] !== false;

          return (
            <div
              key={pr.platformKey}
              className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl space-y-0"
            >
              {/* Platform Header Card */}
              <div className="p-6 bg-slate-900/80 border-b border-slate-700/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: pr.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{pr.label}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                        {pr.totalOrdersCount} Orders • {pr.totalUnitsSold} Units
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fulfillment OTIF: <strong className="text-emerald-400">{pr.otifRate.toFixed(1)}%</strong> | Return Rate: <strong className="text-rose-400">{pr.returnRate.toFixed(1)}%</strong> (Refunds: {formatINR(pr.refundAmount)})
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Channel Net Profit</span>
                    <span className={`text-base font-extrabold font-mono ${pr.totalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pr.totalNetProfit >= 0 ? '+' : ''}{formatINR(pr.totalNetProfit)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      ({pr.profitMarginPercent.toFixed(1)}% Margin)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadPDF(pr.platformKey)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/20 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 border border-slate-700 transition-all text-xs flex items-center gap-1.5"
                      title={`Download ${pr.label} PDF audit report`}
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Export PDF</span>
                    </button>

                    <button
                      onClick={() => togglePlatformExpand(pr.platformKey)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-xs flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Platform High-Level KPI Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-5 bg-slate-950/30 border-b border-slate-800/60">
                <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Gross Revenue</span>
                  <p className="text-sm font-bold text-white font-mono mt-0.5">{formatINR(pr.grossRevenue)}</p>
                  <span className="text-[9px] text-slate-500 font-mono">Net: {formatINR(pr.netRevenue)}</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Direct AdCost</span>
                  <p className="text-sm font-bold text-indigo-300 font-mono mt-0.5">{formatINR(pr.totalAdCost)}</p>
                  <span className="text-[9px] text-slate-500 font-mono">TACoS: {pr.tacosPercent.toFixed(1)}%</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">NetAdCost (Incl. Ret)</span>
                  <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">{formatINR(pr.totalNetAdCost)}</p>
                  <span className="text-[9px] text-slate-500 font-mono">Refunds added to ads</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Organic vs Ads Units</span>
                  <p className="text-sm font-bold text-white font-mono mt-0.5">{pr.totalOrganicUnits}u / {pr.totalInorganicUnits}u</p>
                  <span className="text-[9px] text-emerald-400 font-mono">
                    {((pr.totalOrganicUnits / Math.max(1, pr.totalUnitsSold)) * 100).toFixed(0)}% Organic
                  </span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">COGS & Fulfillment</span>
                  <p className="text-sm font-bold text-slate-300 font-mono mt-0.5">{formatINR(pr.totalCogs + pr.totalFulfillment)}</p>
                  <span className="text-[9px] text-slate-500 font-mono">35% COGS + 8% Log</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Top Margin Product</span>
                  <p className="text-xs font-bold text-white truncate mt-0.5" title={pr.topProduct?.productName}>
                    {pr.topProduct?.sku || 'N/A'}
                  </p>
                  <span className="text-[9px] text-emerald-400 font-mono">
                    {pr.topProduct ? `${pr.topProduct.adMetrics.profitMarginPercent.toFixed(1)}% margin` : ''}
                  </span>
                </div>
              </div>

              {/* Product-Specific Stats Table for This Platform */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">SKU & Product Name</th>
                        <th className="px-4 py-3">Platform Sales Qty</th>
                        <th className="px-4 py-3">Organic vs Ads Split</th>
                        <th className="px-4 py-3">Net Sales (₹)</th>
                        <th className="px-4 py-3">Ad Spend (AdCost)</th>
                        <th className="px-4 py-3">NetAdCost (Incl. Ret)</th>
                        <th className="px-4 py-3">TACost & TACoS</th>
                        <th className="px-4 py-3">Product Profitability (₹)</th>
                        <th className="px-4 py-3 text-right">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {pr.productBreakdowns.map((p, idx) => (
                        <tr key={`${pr.platformKey}-${p.sku}-${idx}`} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white font-mono">{p.sku}</div>
                            <div className="text-[11px] text-slate-300 truncate max-w-[180px]" title={p.productName}>
                              {p.productName}
                            </div>
                          </td>

                          <td className="px-4 py-3 font-mono">
                            <div className="font-bold text-slate-200">{p.unitsSold} units</div>
                            <div className="text-[10px] text-rose-400">
                              Returns: {p.returnUnits} ({p.returnRate.toFixed(1)}%)
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 mb-1">
                              <span className="text-emerald-400">{p.adMetrics.organicUnits}u Org</span>
                              <span className="text-indigo-400">{p.adMetrics.inorganicUnits}u Ads</span>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${(p.adMetrics.organicUnits / Math.max(1, p.unitsSold)) * 100}%` }}
                              />
                              <div
                                className="h-full bg-indigo-500"
                                style={{ width: `${(p.adMetrics.inorganicUnits / Math.max(1, p.unitsSold)) * 100}%` }}
                              />
                            </div>
                          </td>

                          <td className="px-4 py-3 font-mono">
                            <div className="font-bold text-white">{formatINR(p.adMetrics.netRevenue)}</div>
                            <div className="text-[9px] text-slate-500 leading-none mt-0.5">
                              Gross: {formatINR(p.grossRevenue)}
                            </div>
                          </td>

                          <td className="px-4 py-3 font-mono text-indigo-300 font-bold">
                            {formatINR(p.adMetrics.adCost)}
                            <div className="text-[9px] text-slate-500 font-normal">
                              Rate: {p.adMetrics.adRate.toFixed(1)}%
                            </div>
                          </td>

                          <td className="px-4 py-3 font-mono text-amber-400 font-bold">
                            {formatINR(p.adMetrics.netAdCost)}
                            <div className="text-[9px] text-slate-500 font-normal">
                              Refund: {formatINR(p.refundAmount)}
                            </div>
                          </td>

                          <td className="px-4 py-3 font-mono text-rose-300 font-bold">
                            {formatINR(p.adMetrics.taCost)}
                            <div className="text-[10px] font-bold text-rose-400">
                              TACoS: {p.adMetrics.tacosPercent.toFixed(1)}%
                            </div>
                          </td>

                          <td className="px-4 py-3 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                p.adMetrics.isProfitable
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {p.adMetrics.isProfitable ? 'PROFIT' : 'LOSS'}
                              </span>
                              <span className="font-bold text-white">
                                {p.adMetrics.netProfit >= 0 ? '+' : ''}{formatINR(p.adMetrics.netProfit)}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 font-mono text-right">
                            <span className={`text-xs font-bold ${p.adMetrics.isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {p.adMetrics.profitMarginPercent.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: OVERALL REPORT FOR EACH PRODUCT FROM ALL PLATFORMS             */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                SECTION 2
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Overall Consolidated Report for Each Product Across All Platforms</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Omni-channel aggregated volume, blended organic vs ad-attributed sales, multi-platform ad costs, and total SKU profitability.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{crossPlatformProductReports.length} SKUs Audited</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Aggregating all channels (Amazon + Blinkit + Flipkart + D2C Web + Myntra + Retail)</span>
            <span className="text-emerald-400 font-semibold">TACost &le; NetAdCost guaranteed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">SKU & Product Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Total Sales (All Channels)</th>
                  <th className="px-5 py-3.5">Organic vs Ads Split</th>
                  <th className="px-5 py-3.5">Total Net Revenue (₹)</th>
                  <th className="px-5 py-3.5">Total Ad Spend (₹)</th>
                  <th className="px-5 py-3.5">NetAdCost (Incl. Ret) (₹)</th>
                  <th className="px-5 py-3.5">Blended TACoS %</th>
                  <th className="px-5 py-3.5">Cross-Platform Profit (₹)</th>
                  <th className="px-5 py-3.5">Top Margin Channel</th>
                  <th className="px-5 py-3.5 text-right">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {crossPlatformProductReports.map((p, idx) => (
                  <tr key={`cross-prod-${p.sku}-${idx}`} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white font-mono">{p.sku}</div>
                      <div className="text-[11px] text-slate-300 truncate max-w-[200px]" title={p.productName}>
                        {p.productName}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 font-medium">{p.category}</td>

                    <td className="px-5 py-3.5 font-mono">
                      <div className="font-bold text-white">{p.totalUnitsSold} units</div>
                      <div className="text-[10px] text-rose-400">
                        {p.returnRate.toFixed(1)}% Return ({p.totalReturnUnits}u)
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 mb-1">
                        <span className="text-emerald-400">{p.totalOrganicUnits}u Org</span>
                        <span className="text-indigo-400">{p.totalInorganicUnits}u Ads</span>
                      </div>
                      <div className="w-28 h-1.5 bg-slate-700 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${(p.totalOrganicUnits / Math.max(1, p.totalUnitsSold)) * 100}%` }}
                        />
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${(p.totalInorganicUnits / Math.max(1, p.totalUnitsSold)) * 100}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {((p.totalOrganicUnits / Math.max(1, p.totalUnitsSold)) * 100).toFixed(0)}% Organic share
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono">
                      <div className="font-bold text-slate-200">{formatINR(p.totalNetRevenue)}</div>
                      <div className="text-[10px] text-slate-400">Gross: {formatINR(p.totalGrossRevenue)}</div>
                      <div className="text-[9px] text-rose-400">Refunds: {formatINR(p.totalRefundAmount)}</div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-indigo-300 font-bold">
                      {formatINR(p.totalAdCost)}
                      <div className="text-[9px] text-slate-400 font-normal">
                        Across {p.platformContributions.length} Channels
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-amber-400 font-bold">
                      {formatINR(p.totalNetAdCost)}
                      <div className="text-[9px] text-slate-500 font-normal">
                        Includes refunds penalty
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono">
                      <span className="text-xs font-bold text-rose-400">{p.tacosPercent.toFixed(1)}%</span>
                      <div className="text-[9px] text-slate-500">TACost: {formatINR(p.totalTACost)}</div>
                    </td>

                    <td className="px-5 py-3.5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          p.totalNetProfit >= 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {p.totalNetProfit >= 0 ? 'PROFIT' : 'LOSS'}
                        </span>
                        <span className="font-bold text-white">
                          {p.totalNetProfit >= 0 ? '+' : ''}{formatINR(p.totalNetProfit)}
                        </span>
                      </div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${p.totalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.profitMarginPercent.toFixed(1)}% Net Margin
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-300">
                      <span className="font-semibold text-emerald-400">{p.bestChannelMargin}</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Top Vol: {p.bestChannelRevenue}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-right">
                      <div className="text-white font-bold">{p.availableStock} units</div>
                      <div className={`text-[10px] font-bold ${p.hasStockoutRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {p.hasStockoutRisk ? `Risk (${p.daysOfSupply}d)` : `Healthy (${p.daysOfSupply}d)`}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: OVERALL SUMMARY / REPORT OF ALL PRODUCTS FROM ALL PLATFORMS    */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono">
                SECTION 3
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Overall Executive P&L & Multi-Channel Enterprise Summary</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidated enterprise financial statement, channel rankings, and strategic management takeaways.
            </p>
          </div>
        </div>

        {/* Executive P&L Ledger Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* P&L Statement */}
          <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Executive Omni-Channel P&L Statement (All Channels & Products)</span>
              </h4>
              <span className="text-xs font-mono text-slate-400">Sleepsia India FY26</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">(+) Total Gross Omni-Channel Revenue</span>
                <span className="font-bold text-white">{formatINR(grandExecutiveSummary.totalGrossRevenue)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-rose-400">
                <span>(-) Total Return Refunds & Restocking Loss ({grandExecutiveSummary.blendedReturnRate.toFixed(1)}% Return Rate)</span>
                <span className="font-bold">-{formatINR(grandExecutiveSummary.totalRefundAmount)}</span>
              </div>

              <div className="flex items-center justify-between py-2.5 border-b border-slate-700/80 bg-slate-900/60 px-3 rounded-xl font-bold">
                <span className="text-slate-200">(=) Net Realized E-Commerce Revenue</span>
                <span className="text-emerald-400 text-sm">{formatINR(grandExecutiveSummary.totalNetRevenue)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-slate-400">
                <span>(-) Cost of Goods Sold (COGS ~35% average)</span>
                <span>-{formatINR(grandExecutiveSummary.totalCogs)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-indigo-300">
                <span>(-) Total Direct Advertising Spend (AdCost / TACost)</span>
                <span className="font-bold">-{formatINR(grandExecutiveSummary.totalAdSpend)}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-500/10 text-[11px] text-amber-300 border border-amber-500/20">
                <span>* Calculated Net Ad Cost (Include Returns: AdCost + Refund Amount)</span>
                <span className="font-bold">{formatINR(grandExecutiveSummary.grandNetAdCost)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-slate-400">
                <span>(-) Channel Commissions & Freight Fulfillment (~8% Logistics)</span>
                <span>-{formatINR(grandExecutiveSummary.totalFulfillment)}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-t-2 border-slate-700 bg-emerald-950/30 px-4 rounded-2xl mt-2">
                <div>
                  <span className="text-sm font-bold text-white block">(=) GRAND NET OPERATING PROFIT</span>
                  <span className="text-[10px] text-emerald-400 font-normal">
                    Blended TACoS: {grandExecutiveSummary.blendedTacos.toFixed(1)}% • Network OTIF: {grandExecutiveSummary.blendedOtifRate.toFixed(1)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-emerald-400 block font-mono">
                    +{formatINR(grandExecutiveSummary.grandNetProfit)}
                  </span>
                  <span className="text-xs font-bold text-emerald-300">
                    {grandExecutiveSummary.grandProfitMargin.toFixed(1)}% Operating Margin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Performance Leaderboard */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span>Channel Ranking Matrix</span>
                </h4>
                <span className="text-[10px] font-mono text-indigo-400">By Profit & Volume</span>
              </div>

              <div className="space-y-3 mt-4">
                {platformReports.map((pr, idx) => {
                  const share = grandExecutiveSummary.totalGrossRevenue > 0 ? (pr.grossRevenue / grandExecutiveSummary.totalGrossRevenue) * 100 : 0;
                  return (
                    <div key={`rank-${pr.platformKey}`} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 font-mono">#{idx + 1}</span>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pr.color }} />
                          <span className="text-xs font-bold text-white">{pr.label}</span>
                        </div>
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {formatINR(pr.totalNetProfit)}
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, share)}%`, backgroundColor: pr.color }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Revenue: {formatINR(pr.grossRevenue)} ({share.toFixed(1)}%)</span>
                        <span>TACoS: {pr.tacosPercent.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategic Recommendations Card */}
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl space-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Executive Strategy Takeaways</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 leading-relaxed list-disc list-inside">
                <li><strong>Amazon & Flipkart:</strong> Scale top-converting organic SKUs (e.g. SLP-1001) while capping ad spend on high-return variants.</li>
                <li><strong>Blinkit Quick-Commerce:</strong> High OTIF fulfillment, but watch cervical pillow return rates to protect NetAdCost.</li>
                <li><strong>D2C Web:</strong> Highest net margins (0% platform commissions) — increase retargeting budget.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
