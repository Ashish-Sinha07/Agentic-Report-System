import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  Layers,
  ArrowRight,
  BarChart3,
  Store,
  Package,
  TrendingUp,
  PieChart,
  Eye,
  X,
  ExternalLink,
  Zap,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { supplyChainStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';
import { Product } from '../../types';
import { EcommerceReportGenerator } from '../reports/EcommerceReportGenerator';

export const isSlpProduct = (p: { sku?: string; productName?: string; category?: string } | null | undefined): boolean => {
  if (!p) return false;
  const sku = (p.sku || '').toUpperCase();
  const name = (p.productName || '').toUpperCase();
  const cat = (p.category || '').toUpperCase();
  return (
    sku.startsWith('SLP') ||
    sku.includes('SLP-') ||
    sku.includes('SLP') ||
    name.includes('SLEEPSIA') ||
    name.includes('PILLOW') ||
    name.includes('CUSHION') ||
    name.includes('CERVICAL') ||
    name.includes('FOAM') ||
    cat.includes('PILLOW') ||
    cat.includes('CUSHION')
  );
};

export const getAdCostMetrics = (
  platform: string,
  sku: string,
  grossRevenue: number,
  unitsSold: number,
  refundAmount: number,
  unitPrice: number
) => {
  // Establish base advertising rates and inorganic/organic splits per platform
  let baseAdRate = 0.12; // default 12% ad cost
  let baseInorganicShare = 0.35; // default 35% ad-attributed sales
  
  if (platform === 'Amazon') {
    baseAdRate = 0.16;
    baseInorganicShare = 0.45;
  } else if (platform === 'Blinkit') {
    baseAdRate = 0.11;
    baseInorganicShare = 0.32;
  } else if (platform === 'Flipkart') {
    baseAdRate = 0.14;
    baseInorganicShare = 0.40;
  } else if (platform === 'Direct Web') {
    baseAdRate = 0.15;
    baseInorganicShare = 0.30;
  } else if (platform === 'Myntra') {
    baseAdRate = 0.13;
    baseInorganicShare = 0.38;
  } else if (platform === 'Retail Stores') {
    baseAdRate = 0.02;
    baseInorganicShare = 0.05;
  } else {
    // For "ALL" platforms cumulative
    baseAdRate = 0.125;
    baseInorganicShare = 0.33;
  }

  // Add deterministic SKU variance based on hash so that product performance varies organically
  const skuHash = (sku.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5) - 2; // -2% to +2%
  const finalAdRate = Math.max(0.01, baseAdRate + (skuHash / 100));
  const finalInorganicShare = Math.max(0.05, Math.min(0.95, baseInorganicShare + (skuHash / 150)));

  // 1. Direct Ad Spend / Advertising Cost
  const adCost = grossRevenue * finalAdRate;

  // 2. Net Ad Cost (Include Return)
  // This incorporates refunds which are a direct penalty on marketing spend (wasted ad dollars on returned items)
  const netAdCost = adCost + refundAmount;

  // 3. TACost (Total Advertising Cost) is the absolute direct spend.
  // Note: Since netAdCost = adCost + refundAmount, TACost is always <= NetAdCost (Include Return).
  const taCost = adCost;

  // 4. Net Revenue (Gross sales minus refund amount)
  const netRevenue = Math.max(0, grossRevenue - refundAmount);

  // TACoS (Total Advertising Cost of Sales) % relative to net revenue
  const tacosPercent = netRevenue > 0 ? (adCost / netRevenue) * 100 : 0;

  // 5. Organic vs Inorganic Unit Split
  const inorganicUnits = Math.min(unitsSold, Math.round(unitsSold * finalInorganicShare));
  const organicUnits = Math.max(0, unitsSold - inorganicUnits);
  
  const inorganicRevenue = inorganicUnits * unitPrice;
  const organicRevenue = Math.max(0, grossRevenue - inorganicRevenue);

  // 6. Cost of Goods Sold (COGS) & Fulfillment costs (shipping, packing, and platform commissions)
  const cogs = grossRevenue * 0.35; // 35% standard COGS
  const fulfillment = grossRevenue * 0.08; // 8% platform fulfillment/fees

  // 7. Net Profit Calculation
  const netProfit = netRevenue - cogs - adCost - fulfillment;
  const profitMarginPercent = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;
  const isProfitable = netProfit > 0;

  return {
    adCost,
    netAdCost,
    taCost,
    tacosPercent,
    inorganicUnits,
    organicUnits,
    inorganicRevenue,
    organicRevenue,
    cogs,
    fulfillment,
    netRevenue,
    netProfit,
    profitMarginPercent,
    isProfitable,
    adRate: finalAdRate * 100,
    inorganicRate: finalInorganicShare * 100
  };
};

export const OrdersReturnsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PLATFORMS' | 'ORDERS' | 'RETURNS' | 'REPORT'>('PLATFORMS');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedProductSku, setSelectedProductSku] = useState<string | null>(null);
  const [matrixViewMode, setMatrixViewMode] = useState<'SALES' | 'ADVERTISING'>('SALES');

  const salesOrders = supplyChainStore.salesOrders;
  const returns = supplyChainStore.returns;
  const products = supplyChainStore.products;
  const inventory = supplyChainStore.inventory;

  const totalSalesVal = salesOrders.reduce((s, o) => s + o.totalAmount, 0);
  const delayedOrders = salesOrders.filter(o => !o.deliveryOnTime).length;
  const totalReturnVal = returns.reduce((s, r) => s + r.refundAmount, 0);

  // Helper map: Sales Order ID -> Platform
  const orderPlatformMap = useMemo(() => {
    const map = new Map<string, string>();
    salesOrders.forEach(o => map.set(o.orderId, o.platform));
    return map;
  }, [salesOrders]);

  // List of all platforms
  const platformsList = ['Amazon', 'Blinkit', 'Flipkart', 'Direct Web', 'Myntra', 'Retail Stores'];

  const platformLabels: Record<string, string> = {
    'Amazon': 'Amazon India',
    'Blinkit': 'Blinkit Quick Commerce',
    'Flipkart': 'Flipkart E-Commerce',
    'Direct Web': 'Sleepsia.in (D2C)',
    'Myntra': 'Myntra Fashion',
    'Retail Stores': 'Sleepsia Experience Centers',
    'ALL': 'All Platforms & Channels'
  };

  const platformColors: Record<string, string> = {
    'Amazon': '#f59e0b',
    'Blinkit': '#10b981',
    'Flipkart': '#3b82f6',
    'Direct Web': '#6366f1',
    'Myntra': '#ec4899',
    'Retail Stores': '#8b5cf6'
  };

  // 1. OVERALL REPORT FOR EACH PLATFORM
  const platformSummaryReports = useMemo(() => {
    return platformsList.map(platformName => {
      const pOrders = salesOrders.filter(o => o.platform === platformName);
      const grossRevenue = pOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const unitsSold = pOrders.reduce((sum, o) => sum + o.quantity, 0);
      const orderCount = pOrders.length;
      const aov = orderCount > 0 ? grossRevenue / orderCount : 0;
      const otifCount = pOrders.filter(o => o.deliveryOnTime).length;
      const otifRate = orderCount > 0 ? (otifCount / orderCount) * 100 : 0;

      // Platform returns
      const pReturns = returns.filter(r => {
        const plat = orderPlatformMap.get(r.orderId) || 'Direct Web';
        return plat === platformName;
      });
      const refundAmount = pReturns.reduce((sum, r) => sum + r.refundAmount, 0);
      const returnCount = pReturns.length;
      const returnRate = unitsSold > 0 ? (returnCount / unitsSold) * 100 : 0;
      const revenueShare = totalSalesVal > 0 ? (grossRevenue / totalSalesVal) * 100 : 0;

      // Top selling SKU on this platform
      const skuQtyMap: Record<string, { qty: number; name: string }> = {};
      pOrders.forEach(o => {
        if (!skuQtyMap[o.sku]) skuQtyMap[o.sku] = { qty: 0, name: o.productName };
        skuQtyMap[o.sku].qty += o.quantity;
      });
      let topSku = 'N/A';
      let topSkuName = 'None';
      let topSkuQty = 0;
      Object.entries(skuQtyMap).forEach(([sku, info]) => {
        if (info.qty > topSkuQty) {
          topSkuQty = info.qty;
          topSku = sku;
          topSkuName = info.name;
        }
      });

      return {
        platform: platformName,
        label: platformLabels[platformName] || platformName,
        color: platformColors[platformName] || '#6366f1',
        grossRevenue,
        unitsSold,
        orderCount,
        aov,
        otifRate,
        returnCount,
        returnRate,
        refundAmount,
        revenueShare,
        topSku,
        topSkuName,
        topSkuQty
      };
    });
  }, [salesOrders, returns, orderPlatformMap, totalSalesVal]);

  // Categories list (filtered for SLP items in Advertising view mode)
  const categoriesList = useMemo(() => {
    const list = matrixViewMode === 'ADVERTISING'
      ? products.filter(isSlpProduct).map(p => p.category)
      : products.map(p => p.category);
    return ['ALL', ...Array.from(new Set(list))];
  }, [products, matrixViewMode]);

  // 2. PRODUCT-SPECIFIC STATS FOR EACH PRODUCT FOR PARTICULAR PLATFORM
  const productPlatformMatrix = useMemo(() => {
    return products
      .filter(p => {
        // When in ADVERTISING mode, strictly only show SLP-related finished goods with ad campaigns
        if (matrixViewMode === 'ADVERTISING' && !isSlpProduct(p)) {
          return false;
        }

        const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
        const matchesQuery =
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .map(product => {
        // All orders for this product across all channels
        const allProductOrders = salesOrders.filter(o => o.sku === product.sku);
        const totalUnitsAllChannels = allProductOrders.reduce((s, o) => s + o.quantity, 0);
        const totalRevenueAllChannels = allProductOrders.reduce((s, o) => s + o.totalAmount, 0);

        // Filtered orders for selected platform
        const filteredProductOrders =
          selectedPlatform === 'ALL'
            ? allProductOrders
            : allProductOrders.filter(o => o.platform === selectedPlatform);

        const platformUnitsSold = filteredProductOrders.reduce((s, o) => s + o.quantity, 0);
        const platformRevenue = filteredProductOrders.reduce((s, o) => s + o.totalAmount, 0);
        const avgRealizedPrice = platformUnitsSold > 0 ? platformRevenue / platformUnitsSold : product.sellingPrice;
        const channelContribution = totalUnitsAllChannels > 0 ? (platformUnitsSold / totalUnitsAllChannels) * 100 : 0;

        const otifOrders = filteredProductOrders.filter(o => o.deliveryOnTime).length;
        const otifRate = filteredProductOrders.length > 0 ? (otifOrders / filteredProductOrders.length) * 100 : 100;

        // Returns for this product on selected platform
        const productReturns = returns.filter(r => {
          const isSkuMatch = r.sku === product.sku;
          const plat = orderPlatformMap.get(r.orderId) || 'Direct Web';
          const isPlatMatch = selectedPlatform === 'ALL' || plat === selectedPlatform;
          return isSkuMatch && isPlatMatch;
        });

        const returnCount = productReturns.length;
        const returnRate = platformUnitsSold > 0 ? (returnCount / platformUnitsSold) * 100 : 0;
        const productRefundAmount = productReturns.reduce((sum, r) => sum + r.refundAmount, 0);

        const adMetrics = getAdCostMetrics(
          selectedPlatform,
          product.sku,
          platformRevenue,
          platformUnitsSold,
          productRefundAmount,
          product.sellingPrice || 1499
        );

        // Top Return Reason
        const reasonCounts: Record<string, number> = {};
        productReturns.forEach(r => {
          const reason = r.returnReason || r.rootCauseCategory || 'Unspecified';
          reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        });
        let topReason = 'No Returns Logged';
        let maxReasonCount = 0;
        Object.entries(reasonCounts).forEach(([r, c]) => {
          if (c > maxReasonCount) {
            maxReasonCount = c;
            topReason = r;
          }
        });

        // Inventory Stock Info across warehouses
        const productInv = inventory.filter(i => i.sku === product.sku);
        const totalAvailableStock = productInv.reduce((s, i) => s + i.availableQty, 0);
        const avgDaysSupply = productInv.length > 0 ? productInv.reduce((s, i) => s + i.daysOfSupply, 0) / productInv.length : 0;
        const hasStockoutRisk = productInv.some(i => i.stockStatus === 'Stockout Risk');

        return {
          product,
          platformUnitsSold,
          platformRevenue,
          avgRealizedPrice,
          totalUnitsAllChannels,
          totalRevenueAllChannels,
          channelContribution,
          otifRate,
          returnCount,
          returnRate,
          productRefundAmount,
          adMetrics,
          topReason,
          totalAvailableStock,
          avgDaysSupply,
          hasStockoutRisk
        };
      })
      .filter(item => {
        // If in ADVERTISING mode, ensure only items with active sales/metrics or non-zero presence are included
        if (matrixViewMode === 'ADVERTISING') {
          return item.platformUnitsSold > 0 || item.totalUnitsAllChannels > 0 || item.adMetrics.adCost > 0;
        }
        return true;
      });
  }, [products, salesOrders, returns, inventory, selectedPlatform, categoryFilter, searchQuery, orderPlatformMap, matrixViewMode]);

  // Aggregate stats for Advertising & Profitability View mode
  const adPortfolioSummary = useMemo(() => {
    if (matrixViewMode !== 'ADVERTISING') return null;

    const totalAdSpend = productPlatformMatrix.reduce((sum, item) => sum + item.adMetrics.adCost, 0);
    const totalNetAdCost = productPlatformMatrix.reduce((sum, item) => sum + item.adMetrics.netAdCost, 0);
    const totalGrossRev = productPlatformMatrix.reduce((sum, item) => sum + item.platformRevenue, 0);
    const totalNetRevenue = productPlatformMatrix.reduce((sum, item) => sum + item.adMetrics.netRevenue, 0);
    const totalRefunds = productPlatformMatrix.reduce((sum, item) => sum + item.productRefundAmount, 0);
    const totalInorganicUnits = productPlatformMatrix.reduce((sum, item) => sum + item.adMetrics.inorganicUnits, 0);
    const totalOrganicUnits = productPlatformMatrix.reduce((sum, item) => sum + item.adMetrics.organicUnits, 0);
    const totalUnits = totalInorganicUnits + totalOrganicUnits;
    const totalNetProfit = productPlatformMatrix.reduce((sum, item) => sum + item.adMetrics.netProfit, 0);
    const blendedTacos = totalNetRevenue > 0 ? (totalAdSpend / totalNetRevenue) * 100 : 0;
    const blendedMargin = totalNetRevenue > 0 ? (totalNetProfit / totalNetRevenue) * 100 : 0;

    return {
      totalAdSpend,
      totalNetAdCost,
      totalGrossRev,
      totalNetRevenue,
      totalRefunds,
      totalInorganicUnits,
      totalOrganicUnits,
      totalUnits,
      totalNetProfit,
      blendedTacos,
      blendedMargin,
      slpProductCount: productPlatformMatrix.length
    };
  }, [productPlatformMatrix, matrixViewMode]);

  // Selected Product Detail Object for Modal
  const selectedProductDetail = useMemo(() => {
    if (!selectedProductSku) return null;
    const prod = products.find(p => p.sku === selectedProductSku);
    if (!prod) return null;

    const prodOrders = salesOrders.filter(o => o.sku === prod.sku);
    const prodReturns = returns.filter(r => r.sku === prod.sku);

    const platformBreakdown = platformsList.map(plat => {
      const pOrders = prodOrders.filter(o => o.platform === plat);
      const units = pOrders.reduce((s, o) => s + o.quantity, 0);
      const revenue = pOrders.reduce((s, o) => s + o.totalAmount, 0);
      const otif = pOrders.length > 0 ? (pOrders.filter(o => o.deliveryOnTime).length / pOrders.length) * 100 : 100;

      const pRets = prodReturns.filter(r => {
        const p = orderPlatformMap.get(r.orderId) || 'Direct Web';
        return p === plat;
      });
      const retUnits = pRets.length;
      const retRate = units > 0 ? (retUnits / units) * 100 : 0;
      const refundVal = pRets.reduce((s, r) => s + r.refundAmount, 0);

      const adMetrics = getAdCostMetrics(
        plat,
        prod.sku,
        revenue,
        units,
        refundVal,
        prod.sellingPrice || 1499
      );

      return {
        platform: plat,
        label: platformLabels[plat] || plat,
        color: platformColors[plat] || '#6366f1',
        units,
        revenue,
        otif,
        retUnits,
        retRate,
        refundVal,
        adMetrics
      };
    });

    const totalUnits = prodOrders.reduce((s, o) => s + o.quantity, 0);
    const totalRevenue = prodOrders.reduce((s, o) => s + o.totalAmount, 0);
    const prodInv = inventory.filter(i => i.sku === prod.sku);
    const availableStock = prodInv.reduce((s, i) => s + i.availableQty, 0);

    return {
      prod,
      totalUnits,
      totalRevenue,
      availableStock,
      platformBreakdown
    };
  }, [selectedProductSku, products, salesOrders, returns, inventory, orderPlatformMap]);

  // Filtered orders for ORDERS tab
  const filteredOrders = salesOrders.filter(o => {
    const matchSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlatform = selectedPlatform === 'ALL' || o.platform === selectedPlatform;
    return matchSearch && matchPlatform;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">E-Commerce Platform & Product Performance Insights</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
              Omni-Channel Matrix
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Product-specific stats per sales platform, multi-channel revenue allocation, fulfillment OTIF, and return attribution
          </p>
        </div>
      </div>

      {/* Summary Top Banner KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Omni-Channel Revenue</span>
          <p className="text-2xl font-light text-white mt-1">{formatINR(totalSalesVal)}</p>
          <span className="text-xs text-indigo-400/80 mt-2 font-medium">{salesOrders.length} orders across 6 platforms</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Performing Platform</span>
          {platformSummaryReports.length > 0 && (
            <div>
              <p className="text-lg font-bold text-emerald-400 mt-1 truncate">
                {[...platformSummaryReports].sort((a, b) => b.grossRevenue - a.grossRevenue)[0]?.label}
              </p>
              <span className="text-xs text-emerald-400/80 font-mono">
                {formatINR([...platformSummaryReports].sort((a, b) => b.grossRevenue - a.grossRevenue)[0]?.grossRevenue || 0)}
              </span>
            </div>
          )}
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall OTIF Delivery</span>
          <p className="text-2xl font-light text-emerald-400 mt-1">
            {salesOrders.length > 0 ? ((salesOrders.filter(o => o.deliveryOnTime).length / salesOrders.length) * 100).toFixed(1) : '0.0'}%
          </p>
          <span className="text-xs text-amber-400/80 mt-2 font-medium">{delayedOrders} orders delayed</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Refund & Return Impact</span>
          <p className="text-2xl font-light text-rose-400 mt-1">{formatINR(totalReturnVal)}</p>
          <span className="text-xs text-rose-400/80 mt-2 font-medium">{returns.length} return incidents</span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-800/40 p-3 rounded-3xl border border-slate-700/40 gap-3 backdrop-blur-xs">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-2xl">
          <button
            onClick={() => setActiveTab('PLATFORMS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'PLATFORMS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Platform & Product Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'ORDERS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Sales Orders Register ({salesOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('RETURNS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'RETURNS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Returns & Quality Attribution ({returns.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('REPORT')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'REPORT'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                : 'text-emerald-400/90 hover:text-emerald-300 bg-emerald-950/20 border border-emerald-500/20'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Platform & Product Audit Report</span>
          </button>
        </div>

        {/* Global Platform Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Channel Filter:</span>
          <select
            value={selectedPlatform}
            onChange={e => setSelectedPlatform(e.target.value)}
            className="text-xs p-2 bg-slate-900 border border-slate-700/60 rounded-xl text-slate-200 font-medium focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">All Platforms & Channels</option>
            <option value="Amazon">Amazon India</option>
            <option value="Blinkit">Blinkit Quick Commerce</option>
            <option value="Flipkart">Flipkart E-Commerce</option>
            <option value="Direct Web">Sleepsia.in (D2C)</option>
            <option value="Myntra">Myntra Fashion</option>
            <option value="Retail Stores">Retail Experience Centers</option>
          </select>
        </div>
      </div>

      {/* TAB 1: PLATFORMS & PRODUCT MATRIX */}
      {activeTab === 'PLATFORMS' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Section 1: Overall Report for Each E-Commerce Platform */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-400" />
                  <span>Overall E-Commerce Platform Performance Report</span>
                </h3>
                <p className="text-xs text-slate-400">Consolidated financial, volume, OTIF, and refund report by sales channel</p>
              </div>

              <button
                onClick={() => setActiveTab('REPORT')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Generate Executive Audit Report</span>
              </button>
            </div>

            {/* Platform Comparison Bar Chart */}
            <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Gross Revenue Distribution by Sales Platform</span>
                <span className="text-xs text-indigo-400 font-mono">6 Active Platforms</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformSummaryReports} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="platform" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                      formatter={(value: any) => [formatINR(Number(value)), 'Gross Sales']}
                    />
                    <Bar dataKey="grossRevenue" radius={[8, 8, 0, 0]}>
                      {platformSummaryReports.map((entry) => (
                        <Cell key={entry.platform} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformSummaryReports.map(p => (
                <div
                  key={p.platform}
                  onClick={() => setSelectedPlatform(p.platform)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    selectedPlatform === p.platform
                      ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <h4 className="font-bold text-white text-sm">{p.label}</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 border border-slate-700">
                      {p.revenueShare.toFixed(1)}% Share
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/30">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Gross Sales</span>
                      <span className="text-sm font-bold text-white font-mono">{formatINR(p.grossRevenue)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Units Sold</span>
                      <span className="text-sm font-bold text-white font-mono">{p.unitsSold.toLocaleString()} units</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Avg Order Value</span>
                      <span className="text-xs font-semibold text-slate-200 font-mono">{formatINR(p.aov)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Fulfillment OTIF</span>
                      <span className={`text-xs font-bold font-mono ${p.otifRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {p.otifRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Return Rate:</span>
                      <span className={`font-mono font-bold ${p.returnRate > 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {p.returnRate.toFixed(1)}% ({p.returnCount} returns, {formatINR(p.refundAmount)})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Top SKU:</span>
                      <span className="font-mono text-indigo-300 font-medium truncate max-w-[150px]">
                        {p.topSku} ({p.topSkuQty}u)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Product-Specific Stats Matrix for Particular Platform */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Product-Specific Performance Matrix ({platformLabels[selectedPlatform]})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Detailed SKU metrics, sales volume, price realization, OTIF, and return rates for {platformLabels[selectedPlatform]}
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search SKU or product name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="text-xs bg-transparent focus:outline-hidden text-white placeholder:text-slate-500 w-36 sm:w-48"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="text-xs p-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-slate-200 font-medium focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="ALL">All Categories</option>
                  {categoriesList.filter(c => c !== 'ALL').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Mode Toggle & SLP Catalog Badge */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl">
                <button
                  onClick={() => setMatrixViewMode('SALES')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    matrixViewMode === 'SALES'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sales & Fulfillment View
                </button>
                <button
                  onClick={() => setMatrixViewMode('ADVERTISING')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    matrixViewMode === 'ADVERTISING'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ad Cost & Profitability View</span>
                </button>
              </div>

              {matrixViewMode === 'ADVERTISING' ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SLP Product Catalog Only (Active Ad Campaigns)</span>
                  </span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 leading-relaxed max-w-md">
                  <span className="text-indigo-400 font-bold font-mono mr-1">METRIC INFO:</span>
                  Omni-channel sales qty, realized selling prices, fulfillment OTIF, and return rates per channel.
                </div>
              )}
            </div>

            {/* Specialized SLP Advertising & Margins Summary Banner (shown in ADVERTISING mode) */}
            {matrixViewMode === 'ADVERTISING' && adPortfolioSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ad Spend (AdCost)</span>
                  <p className="text-lg font-bold text-indigo-300 font-mono mt-1">{formatINR(adPortfolioSummary.totalAdSpend)}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">Across {adPortfolioSummary.slpProductCount} SLP SKUs</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider">Net Ad Cost (Incl. Return)</span>
                  <p className="text-lg font-bold text-amber-400 font-mono mt-1">{formatINR(adPortfolioSummary.totalNetAdCost)}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">+{formatINR(adPortfolioSummary.totalRefunds)} return impact</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Blended TACoS %</span>
                  <p className="text-lg font-bold text-rose-300 font-mono mt-1">{adPortfolioSummary.blendedTacos.toFixed(1)}%</p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">TACost &le; NetAdCost</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Organic vs Ads Units</span>
                  <div className="text-xs font-bold text-white font-mono mt-1">
                    <span className="text-emerald-400">{adPortfolioSummary.totalOrganicUnits}u Org</span> / <span className="text-indigo-400">{adPortfolioSummary.totalInorganicUnits}u Ads</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex mt-1">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(adPortfolioSummary.totalOrganicUnits / Math.max(1, adPortfolioSummary.totalUnits)) * 100}%` }}
                    />
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${(adPortfolioSummary.totalInorganicUnits / Math.max(1, adPortfolioSummary.totalUnits)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">SLP Portfolio Net Profit</span>
                  <p className="text-lg font-bold text-emerald-400 font-mono mt-1">+{formatINR(adPortfolioSummary.totalNetProfit)}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold font-mono mt-1">{adPortfolioSummary.blendedMargin.toFixed(1)}% Net Margin</span>
                </div>
              </div>
            )}

            {/* Product Stats Table */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>
                  Showing <strong className="text-white font-bold">{productPlatformMatrix.length}</strong> {matrixViewMode === 'ADVERTISING' ? 'SLP Products' : 'Products'} for Platform: <strong className="text-indigo-300 font-bold">{platformLabels[selectedPlatform]}</strong>
                  {matrixViewMode === 'ADVERTISING' && <span className="text-emerald-400 ml-2 font-normal">(Non-SLP raw materials & unadvertised items excluded)</span>}
                </span>
                <span className="hidden sm:inline">Click "Channels" on any row for cross-platform breakdown</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                    {matrixViewMode === 'SALES' ? (
                      <tr>
                        <th className="px-5 py-3.5">SKU & Product Name</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Platform Sales Qty</th>
                        <th className="px-5 py-3.5">Platform Revenue (₹)</th>
                        <th className="px-5 py-3.5">Realized Price</th>
                        <th className="px-5 py-3.5">Platform Share %</th>
                        <th className="px-5 py-3.5">OTIF %</th>
                        <th className="px-5 py-3.5">Return Rate %</th>
                        <th className="px-5 py-3.5">Network Stock</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-5 py-3.5">SKU & Product Name</th>
                        <th className="px-5 py-3.5">Sales Attrib. (Organic vs. Ads)</th>
                        <th className="px-5 py-3.5">Net Revenue (₹)</th>
                        <th className="px-5 py-3.5">Ad Spend AdCost (₹)</th>
                        <th className="px-5 py-3.5">NetAdCost (Include Return) (₹)</th>
                        <th className="px-5 py-3.5">TACost (₹) / TACoS %</th>
                        <th className="px-5 py-3.5">Product Profitability (₹)</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {productPlatformMatrix.map((item, idx) => (
                      <tr key={`${item.product.sku}-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                        {matrixViewMode === 'SALES' ? (
                          <>
                            <td className="px-5 py-3">
                              <div className="font-bold text-white font-mono">{item.product.sku}</div>
                              <div className="text-[11px] text-slate-300 truncate max-w-[200px]">{item.product.productName}</div>
                            </td>
                            <td className="px-5 py-3 text-slate-400">{item.product.category}</td>
                            <td className="px-5 py-3 font-bold text-white font-mono">{item.platformUnitsSold} units</td>
                            <td className="px-5 py-3 font-bold text-indigo-300 font-mono">{formatINR(item.platformRevenue)}</td>
                            <td className="px-5 py-3 text-slate-300 font-mono">{formatINR(item.avgRealizedPrice)}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${Math.min(100, item.channelContribution)}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[11px] text-slate-300">{item.channelContribution.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                                item.otifRate >= 95 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {item.otifRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                                item.returnRate > 5 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}>
                                {item.returnRate.toFixed(1)}% ({item.returnCount})
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="font-mono text-slate-200">{item.totalAvailableStock} units</div>
                              <div className={`text-[10px] font-bold ${item.hasStockoutRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.hasStockoutRisk ? 'Stockout Risk' : 'Healthy Stock'}
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-3">
                              <div className="font-bold text-white font-mono">{item.product.sku}</div>
                              <div className="text-[11px] text-slate-300 truncate max-w-[160px]" title={item.product.productName}>{item.product.productName}</div>
                            </td>
                            <td className="px-5 py-3 space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                                <span className="text-emerald-400 font-mono">Org: {item.adMetrics.organicUnits}u</span>
                                <span className="text-indigo-400 font-mono">Ads: {item.adMetrics.inorganicUnits}u</span>
                              </div>
                              <div className="w-28 h-2 bg-slate-700 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${(item.adMetrics.organicUnits / Math.max(1, item.platformUnitsSold)) * 100}%` }}
                                />
                                <div
                                  className="h-full bg-indigo-500"
                                  style={{ width: `${(item.adMetrics.inorganicUnits / Math.max(1, item.platformUnitsSold)) * 100}%` }}
                                />
                              </div>
                              <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                                <span>{((item.adMetrics.organicUnits / Math.max(1, item.platformUnitsSold)) * 100).toFixed(0)}% Organic</span>
                                <span>{((item.adMetrics.inorganicUnits / Math.max(1, item.platformUnitsSold)) * 100).toFixed(0)}% Ads</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 font-mono">
                              <div className="font-bold text-slate-200">{formatINR(item.adMetrics.netRevenue)}</div>
                              <div className="text-[10px] text-slate-400 leading-none mt-1">
                                Gross: {formatINR(item.platformRevenue)}
                              </div>
                              <div className="text-[10px] text-rose-400 leading-none">
                                Returns: {formatINR(item.productRefundAmount)}
                              </div>
                            </td>
                            <td className="px-5 py-3 font-mono">
                              <div className="font-bold text-indigo-300">{formatINR(item.adMetrics.adCost)}</div>
                              <div className="text-[10px] text-slate-400">AdRate: {item.adMetrics.adRate.toFixed(1)}%</div>
                            </td>
                            <td className="px-5 py-3 font-mono">
                              <div className="font-bold text-amber-400">{formatINR(item.adMetrics.netAdCost)}</div>
                              <div className="text-[10px] text-slate-500 italic">Include Return</div>
                            </td>
                            <td className="px-5 py-3 font-mono">
                              <div className="font-bold text-rose-300">{formatINR(item.adMetrics.taCost)}</div>
                              <div className="text-[11px] font-bold text-rose-400 mt-0.5">
                                TACoS: {item.adMetrics.tacosPercent.toFixed(1)}%
                              </div>
                              <div className="text-[9px] text-slate-500">TACost &lt; NetAdCost</div>
                            </td>
                            <td className="px-5 py-3 space-y-1 font-mono">
                              <div className="flex items-center gap-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.adMetrics.isProfitable
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}>
                                  {item.adMetrics.isProfitable ? 'PROFITABLE' : 'UNPROFITABLE'}
                                </span>
                              </div>
                              <div className="text-[12px] font-extrabold text-white">
                                {item.adMetrics.netProfit >= 0 ? '+' : ''}{formatINR(item.adMetrics.netProfit)}
                              </div>
                              <div className={`text-[10px] font-semibold ${item.adMetrics.isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.adMetrics.profitMarginPercent.toFixed(1)}% Margin
                              </div>
                            </td>
                          </>
                        )}
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => setSelectedProductSku(item.product.sku)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-semibold transition-all flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Channels</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALES ORDERS REGISTER */}
      {activeTab === 'ORDERS' && (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 max-w-md bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/60">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search orders by ID, customer, SKU..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-hidden text-white placeholder:text-slate-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">{filteredOrders.length} Orders Listed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Platform</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">SKU & Item</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Delivery OTIF</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.slice(0, 50).map((order, idx) => (
                  <tr key={order.orderId ? `${order.orderId}-${idx}` : `ord-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-white">{order.orderId}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900 text-indigo-300 border border-slate-700 font-mono">
                        {order.platform}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-200">{order.customerName}</td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-white font-mono">{order.sku}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{order.productName}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-300 font-mono">{order.quantity} units</td>
                    <td className="px-5 py-3 font-semibold text-white font-mono">{formatINR(order.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.deliveryOnTime ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {order.deliveryOnTime ? 'ON TIME' : 'DELAYED'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RETURNS & QUALITY ATTRIBUTION */}
      {activeTab === 'RETURNS' && (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-medium text-white">Return Records & Root Cause Category</h3>
            <span className="text-xs text-slate-400 font-mono">{returns.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Return ID</th>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">SKU & Item</th>
                  <th className="px-5 py-3.5">Supplier</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Root Cause</th>
                  <th className="px-5 py-3.5">Refund (₹)</th>
                  <th className="px-5 py-3.5">Restockable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {returns.slice(0, 50).map((ret, idx) => (
                  <tr key={ret.returnId ? `${ret.returnId}-${idx}` : `ret-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-white">{ret.returnId}</td>
                    <td className="px-5 py-3 font-mono text-slate-400">{ret.orderId}</td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-white font-mono">{ret.sku}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{ret.productName}</div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-300">{ret.supplierName}</td>
                    <td className="px-5 py-3 font-medium text-slate-200">{ret.returnReason}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {ret.rootCauseCategory}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-rose-400 font-mono">{formatINR(ret.refundAmount)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ret.restockable ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {ret.restockable ? 'YES' : 'SCRAP'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMPREHENSIVE E-COMMERCE PLATFORM & PRODUCT PERFORMANCE REPORT */}
      {activeTab === 'REPORT' && (
        <EcommerceReportGenerator
          initialPlatform={selectedPlatform}
          onNavigateToMatrix={() => setActiveTab('PLATFORMS')}
        />
      )}

      {/* CROSS-PLATFORM PRODUCT DEEP DIVE MODAL */}
      {selectedProductDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1120] border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-bold">
                    {selectedProductDetail.prod.sku}
                  </span>
                  <span className="text-xs text-slate-400">{selectedProductDetail.prod.category}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{selectedProductDetail.prod.productName}</h3>
              </div>
              <button
                onClick={() => setSelectedProductSku(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Global Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Units Sold Across Channels</span>
                <span className="text-xl font-bold text-white font-mono mt-1 block">{selectedProductDetail.totalUnits.toLocaleString()} units</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Omni-Channel Revenue</span>
                <span className="text-xl font-bold text-indigo-300 font-mono mt-1 block">{formatINR(selectedProductDetail.totalRevenue)}</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Network Available Inventory</span>
                <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">{selectedProductDetail.availableStock.toLocaleString()} units</span>
              </div>
            </div>

            {/* Cross-Platform Comparison Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Platform-by-Platform Performance, Ad Costs & Profitability comparison</h4>
                <span className="text-[10px] text-emerald-400 font-mono">* Dynamic platform variables calculated per SKU</span>
              </div>
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3.5">Platform</th>
                        <th className="px-4 py-3.5">Sales Volume</th>
                        <th className="px-4 py-3.5">Organic vs. Ads Split</th>
                        <th className="px-4 py-3.5">Net Revenue (₹)</th>
                        <th className="px-4 py-3.5">Ad Spend / AdCost</th>
                        <th className="px-4 py-3.5">NetAdCost (Incl. Return)</th>
                        <th className="px-4 py-3.5">TACost / TACoS</th>
                        <th className="px-4 py-3.5">Profitability (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {selectedProductDetail.platformBreakdown.map((pb, idx) => {
                        const share = selectedProductDetail.totalUnits > 0 ? (pb.units / selectedProductDetail.totalUnits) * 100 : 0;
                        return (
                          <tr key={`${pb.platform}-${idx}`} className="hover:bg-slate-900/40 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-white">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pb.color }} />
                                <span>{pb.label}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-normal ml-4.5 block mt-0.5">Share: {share.toFixed(1)}%</span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-slate-300">
                              <div className="font-bold text-white">{pb.units} units</div>
                              <div className="text-[10px] text-rose-400">Ret: {pb.retRate.toFixed(1)}%</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${(pb.adMetrics.organicUnits / Math.max(1, pb.units)) * 100}%` }}
                                />
                                <div
                                  className="h-full bg-indigo-500"
                                  style={{ width: `${(pb.adMetrics.inorganicUnits / Math.max(1, pb.units)) * 100}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-400 font-mono block mt-1">
                                {pb.adMetrics.organicUnits} Org / {pb.adMetrics.inorganicUnits} Ads
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono">
                              <div className="font-bold text-slate-200">{formatINR(pb.adMetrics.netRevenue)}</div>
                              <div className="text-[9px] text-rose-400 leading-none mt-0.5">Refund: {formatINR(pb.refundVal)}</div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-indigo-300 font-bold">
                              {formatINR(pb.adMetrics.adCost)}
                              <span className="text-[10px] text-slate-500 font-normal block mt-0.5">Rate: {pb.adMetrics.adRate.toFixed(1)}%</span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-amber-400 font-bold">
                              {formatINR(pb.adMetrics.netAdCost)}
                              <span className="text-[9px] text-slate-500 font-normal block mt-0.5">Include Return</span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-rose-400 font-bold">
                              {formatINR(pb.adMetrics.taCost)}
                              <span className="text-[10px] text-rose-500 block font-normal mt-0.5">TACoS: {pb.adMetrics.tacosPercent.toFixed(1)}%</span>
                            </td>
                            <td className="px-4 py-3.5 font-mono">
                              <div className="flex items-center gap-1">
                                <span className={`px-1 rounded text-[8px] font-bold ${
                                  pb.adMetrics.isProfitable
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/20'
                                }`}>
                                  {pb.adMetrics.isProfitable ? 'PROFITABLE' : 'UNPROFITABLE'}
                                </span>
                              </div>
                              <div className="text-xs font-extrabold text-white mt-1">
                                {pb.adMetrics.netProfit >= 0 ? '+' : ''}{formatINR(pb.adMetrics.netProfit)}
                              </div>
                              <div className={`text-[10px] font-semibold ${pb.adMetrics.isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {pb.adMetrics.profitMarginPercent.toFixed(1)}% Margin
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProductSku(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

