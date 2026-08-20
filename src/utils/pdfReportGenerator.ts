import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PlatformProductRow {
  sku: string;
  productName: string;
  category: string;
  unitPrice: number;
  unitsSold: number;
  grossRevenue: number;
  refundAmount: number;
  returnUnits: number;
  returnRate: number;
  adMetrics: {
    adCost: number;
    netAdCost: number;
    tacosPercent: number;
    organicUnits: number;
    inorganicUnits: number;
    cogs: number;
    fulfillment: number;
    netProfit: number;
    profitMarginPercent: number;
  };
}

export interface PlatformReportData {
  platformKey: string;
  label: string;
  color: string;
  totalOrdersCount: number;
  totalUnitsSold: number;
  grossRevenue: number;
  refundAmount: number;
  netRevenue: number;
  otifRate: number;
  returnCount: number;
  returnRate: number;
  totalAdCost: number;
  totalNetAdCost: number;
  tacosPercent: number;
  totalInorganicUnits: number;
  totalOrganicUnits: number;
  totalCogs: number;
  totalFulfillment: number;
  totalNetProfit: number;
  profitMarginPercent: number;
  productBreakdowns?: PlatformProductRow[];
}

export interface CrossPlatformProductRow {
  sku: string;
  productName: string;
  category: string;
  unitPrice: number;
  totalUnitsSold: number;
  totalGrossRevenue: number;
  totalRefundAmount: number;
  totalNetRevenue: number;
  totalReturnUnits: number;
  returnRate: number;
  totalOrganicUnits: number;
  totalInorganicUnits: number;
  totalAdCost: number;
  totalNetAdCost: number;
  tacosPercent: number;
  totalCogs: number;
  totalFulfillment: number;
  totalNetProfit: number;
  profitMarginPercent: number;
  availableStock: number;
  daysOfSupply: number;
  hasStockoutRisk: boolean;
  bestChannelRevenue: string;
  bestChannelMargin: string;
}

export interface GrandExecutiveSummaryData {
  totalGrossRevenue: number;
  totalRefundAmount: number;
  totalNetRevenue: number;
  totalOrdersCount: number;
  totalUnitsSold: number;
  totalReturnCount: number;
  blendedReturnRate: number;
  blendedOtifRate: number;
  totalAdSpend: number;
  grandNetAdCost: number;
  grandTACost: number;
  blendedTacos: number;
  totalOrganicUnits: number;
  totalInorganicUnits: number;
  totalCogs: number;
  totalFulfillment: number;
  grandNetProfit: number;
  grandProfitMargin: number;
  rankedByRevenue?: PlatformReportData[];
  rankedByProfit?: PlatformReportData[];
}

interface GeneratePdfOptions {
  platformScope?: string; // 'ALL' or specific platformKey like 'Amazon'
  platformReports: PlatformReportData[];
  crossPlatformProducts: CrossPlatformProductRow[];
  grandSummary: GrandExecutiveSummaryData;
  reportDate?: string;
}

function runAutoTable(doc: jsPDF, options: any) {
  if (typeof autoTable === 'function') {
    autoTable(doc, options);
  } else if (typeof (doc as any).autoTable === 'function') {
    (doc as any).autoTable(options);
  }
}

function getFinalY(doc: jsPDF, fallback: number): number {
  return (doc as any).lastAutoTable?.finalY ?? fallback;
}

export function generateEcommerceAuditPDF({
  platformScope = 'ALL',
  platformReports = [],
  crossPlatformProducts = [],
  grandSummary,
  reportDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}: GeneratePdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - (margin * 2);

  // Helper for currency formatting
  const curFormat = (num: number = 0) => {
    return 'Rs. ' + Math.round(num || 0).toLocaleString('en-IN');
  };

  const safePlatformReports = Array.isArray(platformReports) ? platformReports : [];
  const safeCrossPlatformProducts = Array.isArray(crossPlatformProducts) ? crossPlatformProducts : [];

  // Target platforms
  const targetPlatforms = platformScope === 'ALL'
    ? safePlatformReports
    : safePlatformReports.filter(p => p.platformKey === platformScope);

  const isSinglePlatform = platformScope !== 'ALL' && targetPlatforms.length === 1;
  const singlePlatMeta = isSinglePlatform ? targetPlatforms[0] : null;

  // Safe rankings
  const safeRankedByRevenue = (grandSummary?.rankedByRevenue && grandSummary.rankedByRevenue.length > 0)
    ? grandSummary.rankedByRevenue
    : [...safePlatformReports].sort((a, b) => (b.grossRevenue || 0) - (a.grossRevenue || 0));

  // -------------------------------------------------------------
  // HEADER BANNER
  // -------------------------------------------------------------
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 85, 'F');

  // Top accent bar
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  if (isSinglePlatform && singlePlatMeta) {
    doc.text(`E-COMMERCE AUDIT: ${singlePlatMeta.label.toUpperCase()}`, margin, 32);
  } else {
    doc.text('OMNI-CHANNEL E-COMMERCE PLATFORM & PRODUCT AUDIT', margin, 32);
  }

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('SLEEPSIA INDIA • FINANCIAL, ADVERTISING (TACoS), QUALITY & PRODUCT TELEMETRY', margin, 46);

  // Right-aligned metadata
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Audit Date: ${reportDate}`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`Scope: ${isSinglePlatform && singlePlatMeta ? singlePlatMeta.label : 'Omni-Channel (All Channels)'}`, pageWidth - margin, 44, { align: 'right' });
  doc.text(`Status: Official Verified Ledger`, pageWidth - margin, 58, { align: 'right' });

  let currentY = 100;

  // -------------------------------------------------------------
  // SECTION 1: PLATFORM-SPECIFIC OVERALL PERFORMANCE & PRODUCT BREAKDOWNS
  // -------------------------------------------------------------
  targetPlatforms.forEach((plat, index) => {
    // Check if new page needed
    if (index > 0 || currentY > pageHeight - 160) {
      doc.addPage();
      currentY = 40;
    }

    // Platform Header Bar
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(margin, currentY, contentWidth, 26, 4, 4, 'F');
    doc.setFillColor(99, 102, 241);
    doc.rect(margin, currentY, 4, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`1.${index + 1} PLATFORM OVERVIEW & PRODUCT STATS: ${plat.label.toUpperCase()}`, margin + 12, currentY + 17);
    currentY += 34;

    // Platform KPI Summary Cards (2x4 Grid as Table)
    const kpiSummaryBody = [
      [
        { content: 'Gross Revenue\n' + curFormat(plat.grossRevenue), styles: { fontStyle: 'bold' as const, textColor: [30, 41, 59] as [number, number, number] } },
        { content: 'Returns & Refunds\n' + curFormat(plat.refundAmount) + ` (${(plat.returnRate || 0).toFixed(1)}%)`, styles: { textColor: [220, 38, 38] as [number, number, number] } },
        { content: 'Net Realized Revenue\n' + curFormat(plat.netRevenue), styles: { fontStyle: 'bold' as const, textColor: [16, 185, 129] as [number, number, number] } },
        { content: 'Fulfillment OTIF\n' + (plat.otifRate || 0).toFixed(1) + '%', styles: { textColor: [59, 130, 246] as [number, number, number] } }
      ],
      [
        { content: 'Ad Spend (AdCost)\n' + curFormat(plat.totalAdCost), styles: { textColor: [124, 58, 237] as [number, number, number] } },
        { content: 'Net Ad Cost (Ad+Ref)\n' + curFormat(plat.totalNetAdCost), styles: { textColor: [194, 65, 12] as [number, number, number] } },
        { content: 'TACoS Efficiency\n' + (plat.tacosPercent || 0).toFixed(1) + '% of Net Rev', styles: { fontStyle: 'bold' as const, textColor: [79, 70, 229] as [number, number, number] } },
        { content: 'Net Profit & Margin\n' + curFormat(plat.totalNetProfit) + ` (${(plat.profitMarginPercent || 0).toFixed(1)}%)`, styles: { fontStyle: 'bold' as const, textColor: [5, 150, 105] as [number, number, number] } }
      ]
    ];

    runAutoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: kpiSummaryBody,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 6,
        halign: 'center',
        valign: 'middle',
        lineColor: [203, 213, 225],
        lineWidth: 0.5
      }
    });

    currentY = getFinalY(doc, currentY + 70) + 12;

    // Platform Product-Specific Breakdown Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Product-Specific Performance Breakdown on ${plat.label}:`, margin, currentY);
    currentY += 6;

    const prodRows = (plat.productBreakdowns || []).map(prod => [
      prod.sku,
      prod.productName.length > 26 ? prod.productName.substring(0, 24) + '...' : prod.productName,
      (prod.unitsSold || 0).toString(),
      curFormat(prod.grossRevenue),
      `${prod.returnUnits || 0} (${(prod.returnRate || 0).toFixed(1)}%)`,
      `${prod.adMetrics?.organicUnits || 0} / ${prod.adMetrics?.inorganicUnits || 0}`,
      curFormat(prod.adMetrics?.adCost),
      curFormat(prod.adMetrics?.netAdCost),
      `${(prod.adMetrics?.tacosPercent || 0).toFixed(1)}%`,
      curFormat(prod.adMetrics?.netProfit),
      `${(prod.adMetrics?.profitMarginPercent || 0).toFixed(1)}%`
    ]);

    runAutoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [[
        'SKU',
        'Product Name',
        'Units',
        'Gross Rev',
        'Returns',
        'Org / Paid',
        'Ad Spend',
        'Net AdCost',
        'TACoS',
        'Net Profit',
        'Margin'
      ]],
      body: prodRows,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 7,
        cellPadding: 4,
        valign: 'middle',
        halign: 'right'
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'left', cellWidth: 100 },
        2: { halign: 'center', cellWidth: 32 },
        3: { halign: 'right', cellWidth: 48 },
        4: { halign: 'center', cellWidth: 44 },
        5: { halign: 'center', cellWidth: 40 },
        6: { halign: 'right', cellWidth: 42 },
        7: { halign: 'right', cellWidth: 45 },
        8: { halign: 'center', cellWidth: 35 },
        9: { halign: 'right', fontStyle: 'bold', cellWidth: 48 },
        10: { halign: 'center', fontStyle: 'bold', cellWidth: 38 }
      }
    });

    currentY = getFinalY(doc, currentY + 120) + 20;
  });

  // -------------------------------------------------------------
  // SECTION 2: CROSS-PLATFORM CONSOLIDATED PRODUCT REPORT
  // -------------------------------------------------------------
  doc.addPage();
  currentY = 40;

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, currentY, contentWidth, 26, 4, 4, 'F');
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(margin, currentY, 4, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. OVERALL REPORT FOR EACH PRODUCT ACROSS ALL PLATFORMS', margin + 12, currentY + 17);
  currentY += 34;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Consolidated cross-channel multi-platform rollup for every SKU in Sleepsia catalog:', margin, currentY);
  currentY += 8;

  const crossProdRows = safeCrossPlatformProducts.map(cp => [
    cp.sku,
    cp.productName.length > 28 ? cp.productName.substring(0, 26) + '...' : cp.productName,
    (cp.totalUnitsSold || 0).toString(),
    curFormat(cp.totalGrossRevenue),
    `${cp.totalReturnUnits || 0} (${(cp.returnRate || 0).toFixed(1)}%)`,
    `${cp.totalOrganicUnits || 0} / ${cp.totalInorganicUnits || 0}`,
    curFormat(cp.totalAdCost),
    curFormat(cp.totalNetAdCost),
    `${(cp.tacosPercent || 0).toFixed(1)}%`,
    curFormat(cp.totalNetProfit),
    `${(cp.profitMarginPercent || 0).toFixed(1)}%`,
    `${cp.availableStock || 0} (${cp.daysOfSupply || 0}d)`
  ]);

  runAutoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      'SKU',
      'Product Name',
      'All Units',
      'Total Gross',
      'All Returns',
      'Org / Paid',
      'Total AdCost',
      'Net AdCost',
      'TACoS',
      'Net Profit',
      'Margin',
      'Stock (DOS)'
    ]],
    body: crossProdRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 7,
      cellPadding: 4.5,
      valign: 'middle',
      halign: 'right'
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 46 },
      1: { halign: 'left', cellWidth: 95 },
      2: { halign: 'center', cellWidth: 34 },
      3: { halign: 'right', cellWidth: 48 },
      4: { halign: 'center', cellWidth: 44 },
      5: { halign: 'center', cellWidth: 40 },
      6: { halign: 'right', cellWidth: 42 },
      7: { halign: 'right', cellWidth: 44 },
      8: { halign: 'center', cellWidth: 34 },
      9: { halign: 'right', fontStyle: 'bold', cellWidth: 48 },
      10: { halign: 'center', fontStyle: 'bold', cellWidth: 38 },
      11: { halign: 'center', cellWidth: 49 }
    }
  });

  currentY = getFinalY(doc, currentY + 120) + 20;

  // -------------------------------------------------------------
  // SECTION 3: GRAND OVERALL SUMMARY ACROSS ALL PRODUCTS & ALL PLATFORMS
  // -------------------------------------------------------------
  if (currentY > pageHeight - 240) {
    doc.addPage();
    currentY = 40;
  }

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, currentY, contentWidth, 26, 4, 4, 'F');
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(margin, currentY, 4, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. GRAND EXECUTIVE SUMMARY & CONSOLIDATED OMNI-CHANNEL P&L', margin + 12, currentY + 17);
  currentY += 34;

  const totalGross = grandSummary?.totalGrossRevenue || 0;
  const totalRefund = grandSummary?.totalRefundAmount || 0;
  const totalNet = grandSummary?.totalNetRevenue || 0;
  const totalCogs = grandSummary?.totalCogs || 0;
  const totalAd = grandSummary?.totalAdSpend || 0;
  const totalFulfill = grandSummary?.totalFulfillment || 0;
  const totalProfit = grandSummary?.grandNetProfit || 0;
  const retRate = grandSummary?.blendedReturnRate || 0;
  const retCount = grandSummary?.totalReturnCount || 0;
  const blendedTac = grandSummary?.blendedTacos || 0;
  const profitMarg = grandSummary?.grandProfitMargin || 0;

  // Executive P&L Financial Ledger Table
  const pnlRows = [
    ['Total Gross Sales Turnover (GMV)', curFormat(totalGross), '100.0%', 'Gross invoiced customer orders across all channels'],
    ['Less: Returns & Customer Refunds', `(${curFormat(totalRefund)})`, `-${retRate.toFixed(1)}%`, `${retCount} total returned units refunded`],
    ['Net Realized Sales Turnover', curFormat(totalNet), '100.0% Net', 'Total effective revenue recognized after returns'],
    ['Less: Cost of Goods Sold (COGS)', `(${curFormat(totalCogs)})`, `-${((totalCogs / (totalNet || 1)) * 100).toFixed(1)}%`, 'Direct raw material and manufacturing landed cost'],
    ['Less: Total Marketing & Ad Spend (AdCost)', `(${curFormat(totalAd)})`, `-${blendedTac.toFixed(1)}% (TACoS)`, 'PPC, Sponsored Brand, Display & Quick Commerce Ads'],
    ['Less: Marketplace Commission & Logistics', `(${curFormat(totalFulfill)})`, `-${((totalFulfill / (totalNet || 1)) * 100).toFixed(1)}%`, 'Channel fees, warehousing, picking & last-mile delivery'],
    ['GRAND NET OPERATING PROFIT (EBITDA)', curFormat(totalProfit), `${profitMarg.toFixed(1)}% Margin`, 'Final realized net operating profit for Sleepsia India']
  ];

  runAutoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['P&L Statement Line Item', 'Amount (INR)', 'Revenue %', 'Operational Notes']],
    body: pnlRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 5,
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 160 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 85 },
      2: { halign: 'center', cellWidth: 65 },
      3: { cellWidth: 214, fontSize: 7, textColor: [71, 85, 105] }
    }
  });

  currentY = getFinalY(doc, currentY + 120) + 14;

  // Platform Contribution & Efficiency Ranking Table
  if (currentY > pageHeight - 160) {
    doc.addPage();
    currentY = 40;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Channel Efficiency & Operating Margin Contribution Ranking:', margin, currentY);
  currentY += 6;

  const rankingRows = safeRankedByRevenue.map((plat, idx) => {
    const revShare = totalGross > 0 ? ((plat.grossRevenue || 0) / totalGross) * 100 : 0;
    return [
      `#${idx + 1} ${plat.label}`,
      (plat.totalOrdersCount || 0).toString(),
      (plat.totalUnitsSold || 0).toString(),
      curFormat(plat.grossRevenue),
      `${revShare.toFixed(1)}%`,
      curFormat(plat.totalAdCost),
      `${(plat.tacosPercent || 0).toFixed(1)}%`,
      curFormat(plat.totalNetProfit),
      `${(plat.profitMarginPercent || 0).toFixed(1)}%`,
      `${(plat.otifRate || 0).toFixed(1)}%`
    ];
  });

  runAutoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      'Platform Channel',
      'Orders',
      'Units',
      'Gross Sales',
      'Sales Share',
      'AdCost',
      'TACoS',
      'Net Profit',
      'Margin %',
      'OTIF %'
    ]],
    body: rankingRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 7,
      cellPadding: 4,
      valign: 'middle',
      halign: 'right'
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 95 },
      1: { halign: 'center', cellWidth: 32 },
      2: { halign: 'center', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 55 },
      4: { halign: 'center', cellWidth: 42 },
      5: { halign: 'right', cellWidth: 48 },
      6: { halign: 'center', cellWidth: 38 },
      7: { halign: 'right', fontStyle: 'bold', cellWidth: 55 },
      8: { halign: 'center', fontStyle: 'bold', cellWidth: 42 },
      9: { halign: 'center', cellWidth: 40 }
    }
  });

  // Footer for all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 22, pageWidth - margin, pageHeight - 22);
    doc.text('Sleepsia Supply Chain Operating Platform • Confidential Audit Report', margin, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // Save the PDF
  const filename = isSinglePlatform && singlePlatMeta
    ? `Sleepsia_Audit_Report_${singlePlatMeta.platformKey.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
    : `Sleepsia_OmniChannel_Platform_Product_Audit_${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(filename);
}
