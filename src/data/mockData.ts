import {
  Product,
  Supplier,
  Warehouse,
  InventoryItem,
  PurchaseOrder,
  SalesOrder,
  Shipment,
  ReturnRecord,
  SupplyChainAnomaly,
  DataQualityRecord,
  IngestionRawFile,
  OrchestrationWorkflow,
  SupplyChainAlert,
  SystemAuditLog
} from '../types';

// Helper deterministic pseudo-random generators
let seed = 42;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

export const SLEEPSIA_CATEGORIES = [
  'Cervical Pillow',
  'Travel Pillow',
  'Kids Pillow',
  'Lumbar Pillow',
  'Bed Pillow',
  'Wedge Pillow',
  'Travel/Car Pillow',
  'Orthopedic Cushion',
  'Maternity Pillow'
];

export const SLEEPSIA_BRANDS = ['Sleepsia Ortho', 'Sleepsia Ergonomics', 'Sleepsia Cloud', 'Sleepsia Junior', 'Sleepsia RestTech'];

export const SLEEPSIA_SUPPLIERS_LIST = [
  { name: 'Sheela Foam & Polycon Polymers Ltd', city: 'Noida / Greater Noida, UP', category: 'Raw Memory Foam & Polyols', leadTime: 6 },
  { name: 'Tirupur Organic Bamboo & Jacquard Mills', city: 'Tirupur, Tamil Nadu', category: 'Breathable Bamboo Fabric Covers', leadTime: 7 },
  { name: 'Surat High-Loft Microfiber & Weaving Hub', city: 'Surat, Gujarat', category: 'Microfiber Filling & Inner Linings', leadTime: 5 },
  { name: 'Apex Medical Gel Pad Precision Labs', city: 'Peenya, Bengaluru, KA', category: 'Cooling Gel Infusion Inserts', leadTime: 8 },
  { name: 'Manesar Corrugated Box & Vacuum Packaging Ltd', city: 'Manesar, Haryana', category: 'Vacuum Roll-Pack Packaging', leadTime: 4 },
  { name: 'BASF Polyurethanes India Ltd', city: 'Navi Mumbai, Maharashtra', category: 'Low-VOC Isocyanate Formulations', leadTime: 9 },
  { name: 'Coimbatore Precision Invisible Zippers', city: 'Coimbatore, Tamil Nadu', category: 'Hardware & Ergonomic Zippers', leadTime: 5 },
  { name: 'Sonipat CNC Foam Contour Profilers', city: 'Sonipat, Haryana', category: 'CNC Cervical Contour Cutting', leadTime: 6 }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    warehouseId: 'WH-001',
    warehouseName: 'Sleepsia Delhi-NCR Central DC',
    location: 'Gurugram / Manesar, Haryana',
    region: 'North India Hub',
    capacityUnits: 150000,
    currentStockUnits: 132000,
    utilizationRate: 88.0,
    type: 'Central DC',
    inventoryAccuracyRate: 99.2,
    pickingAccuracyRate: 99.4,
    orderFulfillmentRate: 98.6,
    dockToStockHours: 2.8,
    pickPackCycleMinutes: 14,
    status: 'OPTIMAL'
  },
  {
    warehouseId: 'WH-002',
    warehouseName: 'Sleepsia Bhiwandi Mega DC',
    location: 'Bhiwandi / Mumbai, Maharashtra',
    region: 'West India Hub',
    capacityUnits: 180000,
    currentStockUnits: 168000,
    utilizationRate: 93.3,
    type: 'Regional Hub',
    inventoryAccuracyRate: 98.7,
    pickingAccuracyRate: 99.1,
    orderFulfillmentRate: 97.9,
    dockToStockHours: 3.1,
    pickPackCycleMinutes: 16,
    status: 'NEAR_CAPACITY'
  },
  {
    warehouseId: 'WH-003',
    warehouseName: 'Sleepsia Bengaluru South DC',
    location: 'Whitefield / Hoskote, Karnataka',
    region: 'South India Hub',
    capacityUnits: 120000,
    currentStockUnits: 115200,
    utilizationRate: 96.0,
    type: 'Fulfillment Center',
    inventoryAccuracyRate: 97.4,
    pickingAccuracyRate: 98.2,
    orderFulfillmentRate: 95.8,
    dockToStockHours: 4.2,
    pickPackCycleMinutes: 22,
    status: 'OVERLOADED'
  },
  {
    warehouseId: 'WH-004',
    warehouseName: 'Sleepsia Kolkata Eastern Logistics Node',
    location: 'Howrah / Dankuni, West Bengal',
    region: 'East India Hub',
    capacityUnits: 95000,
    currentStockUnits: 68400,
    utilizationRate: 72.0,
    type: 'Regional Hub',
    inventoryAccuracyRate: 99.5,
    pickingAccuracyRate: 99.6,
    orderFulfillmentRate: 99.1,
    dockToStockHours: 2.1,
    pickPackCycleMinutes: 11,
    status: 'OPTIMAL'
  },
  {
    warehouseId: 'WH-005',
    warehouseName: 'Sleepsia Hyderabad Quick-Commerce Node',
    location: 'Medchal / Shamshabad, Telangana',
    region: 'South Central Hub',
    capacityUnits: 110000,
    currentStockUnits: 92400,
    utilizationRate: 84.0,
    type: 'Cross-Dock',
    inventoryAccuracyRate: 98.9,
    pickingAccuracyRate: 99.3,
    orderFulfillmentRate: 98.4,
    dockToStockHours: 1.8,
    pickPackCycleMinutes: 9,
    status: 'OPTIMAL'
  },
  {
    warehouseId: 'WH-006',
    warehouseName: 'Sleepsia Pune Western Node',
    location: 'Chakan, Maharashtra',
    region: 'West India Secondary',
    capacityUnits: 85000,
    currentStockUnits: 62900,
    utilizationRate: 74.0,
    type: 'Fulfillment Center',
    inventoryAccuracyRate: 99.1,
    pickingAccuracyRate: 99.5,
    orderFulfillmentRate: 98.7,
    dockToStockHours: 2.3,
    pickPackCycleMinutes: 12,
    status: 'OPTIMAL'
  },
  {
    warehouseId: 'WH-007',
    warehouseName: 'Sleepsia Chennai Southern DC',
    location: 'Sriperumbudur, Tamil Nadu',
    region: 'South East Hub',
    capacityUnits: 90000,
    currentStockUnits: 43200,
    utilizationRate: 48.0,
    type: 'Fulfillment Center',
    inventoryAccuracyRate: 99.8,
    pickingAccuracyRate: 99.9,
    orderFulfillmentRate: 99.5,
    dockToStockHours: 1.6,
    pickPackCycleMinutes: 10,
    status: 'UNDERUTILIZED'
  },
  {
    warehouseId: 'WH-008',
    warehouseName: 'Sleepsia Ahmedabad Logistics Hub',
    location: 'Sanand, Gujarat',
    region: 'North West Hub',
    capacityUnits: 80000,
    currentStockUnits: 65600,
    utilizationRate: 82.0,
    type: 'Regional Hub',
    inventoryAccuracyRate: 98.8,
    pickingAccuracyRate: 99.2,
    orderFulfillmentRate: 98.0,
    dockToStockHours: 2.5,
    pickPackCycleMinutes: 13,
    status: 'OPTIMAL'
  }
];

export function generateSuppliers(): Supplier[] {
  const suppliers: Supplier[] = [];

  for (let i = 0; i < SLEEPSIA_SUPPLIERS_LIST.length; i++) {
    const sInfo = SLEEPSIA_SUPPLIERS_LIST[i];
    const isTroubled = i === 1 || i === 3; // Tirupur monsoon cotton delivery & Gel Lab capacity
    const otd = isTroubled ? 72 + Math.floor(seededRandom() * 12) : 92 + Math.floor(seededRandom() * 7);
    const quality = isTroubled ? 88 + Math.floor(seededRandom() * 6) : 97 + Math.floor(seededRandom() * 3);
    const fill = isTroubled ? 78 + Math.floor(seededRandom() * 10) : 96 + Math.floor(seededRandom() * 4);
    const costVar = isTroubled ? 8.5 : 1.5;
    const leadTime = sInfo.leadTime + (isTroubled ? 6 : Math.floor(seededRandom() * 2));

    const overallScore = Math.round((otd * 0.35) + (quality * 0.3) + (fill * 0.2) + ((100 - costVar * 3) * 0.15));
    const riskScore = Math.min(100, Math.max(5, 100 - overallScore + (isTroubled ? 20 : 0)));

    let tier: Supplier['tier'] = 'Strategic';
    let riskCategory: Supplier['riskCategory'] = 'LOW';
    if (overallScore >= 90) { tier = 'Strategic'; riskCategory = 'LOW'; }
    else if (overallScore >= 78) { tier = 'Preferred'; riskCategory = 'MEDIUM'; }
    else if (overallScore >= 65) { tier = 'Watch'; riskCategory = 'HIGH'; }
    else { tier = 'High Risk'; riskCategory = 'CRITICAL'; }

    const riskFactors = [];
    if (otd < 80) riskFactors.push('Transit lead-time variance during seasonal surges');
    if (leadTime > 10) riskFactors.push('Raw chemical curing & foam degassing cycle bottleneck');
    if (costVar > 5) riskFactors.push('Crude oil & polymer raw polyol price fluctuations (+8% YoY)');
    if (quality < 92) riskFactors.push('Zipper stitch tension QA tolerance drift in high volume runs');
    if (isTroubled) riskFactors.push('Monsoon cotton spinning mill moisture slowdown in Tirupur');

    suppliers.push({
      supplierId: `SUP-${String(i + 1).padStart(4, '0')}`,
      supplierName: sInfo.name,
      category: sInfo.category,
      country: 'India',
      region: sInfo.city,
      contactEmail: `procurement@${sInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 16)}.in`,
      leadTimeDays: leadTime,
      paymentTerms: i % 2 === 0 ? 'Net 45' : 'Net 30',
      rating: Number((overallScore / 20).toFixed(1)),
      riskScore,
      riskCategory,
      capacityUnitsPerMonth: 45000 + Math.floor(seededRandom() * 60000),
      score: overallScore,
      tier,
      onTimeDeliveryRate: otd,
      inFullDeliveryRate: fill,
      qualityRate: quality,
      costVarianceRate: costVar,
      fillRate: fill,
      rejectionRate: Number(((100 - quality) * 0.35).toFixed(1)),
      historicalTrends: [
        { month: 'May', otd: Math.min(100, otd - 2), quality: quality - 1, score: overallScore - 1 },
        { month: 'Jun', otd: Math.min(100, otd - 1), quality: quality, score: overallScore },
        { month: 'Jul', otd: Math.min(100, otd - 3), quality: quality - 2, score: overallScore - 2 },
        { month: 'Aug', otd: otd, quality: quality, score: overallScore }
      ],
      riskFactors
    });
  }

  // Complementary suppliers for depth (up to 40 suppliers)
  const additionalSuppliers = [
    { name: 'Bengaluru Ortho-Gel Polymers', city: 'Bengaluru, KA', category: 'Medical Cooling Gel Pads', lead: 7 },
    { name: 'Panipat Recycled Microfiber Yarns', city: 'Panipat, Haryana', category: 'Microfiber Filling', lead: 4 },
    { name: 'Faridabad Thermo-Forming Moulds', city: 'Faridabad, Haryana', category: 'Cervical Contour Moulds', lead: 8 },
    { name: 'Vapi Polyurethane Masterbatch Ltd', city: 'Vapi, Gujarat', category: 'Memory Foam Chemical Polyols', lead: 6 },
    { name: 'Ludhiana Breathable Knit Fabrics', city: 'Ludhiana, Punjab', category: 'Jacquard Bamboo Covers', lead: 5 },
    { name: 'Ahmedabad Eco-Packaging Industries', city: 'Ahmedabad, Gujarat', category: 'Biodegradable Vacuum Rollpack Bags', lead: 4 }
  ];

  for (let j = 0; j < additionalSuppliers.length; j++) {
    const extra = additionalSuppliers[j];
    const supIdNum = SLEEPSIA_SUPPLIERS_LIST.length + j + 1;
    suppliers.push({
      supplierId: `SUP-${String(supIdNum).padStart(4, '0')}`,
      supplierName: extra.name,
      category: extra.category,
      country: 'India',
      region: extra.city,
      contactEmail: `orders@${extra.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 14)}.in`,
      leadTimeDays: extra.lead,
      paymentTerms: 'Net 30',
      rating: 4.6,
      riskScore: 18,
      riskCategory: 'LOW',
      capacityUnitsPerMonth: 35000,
      score: 89,
      tier: 'Preferred',
      onTimeDeliveryRate: 94,
      inFullDeliveryRate: 96,
      qualityRate: 98,
      costVarianceRate: 1.2,
      fillRate: 96,
      rejectionRate: 0.8,
      historicalTrends: [
        { month: 'May', otd: 93, quality: 97, score: 88 },
        { month: 'Jun', otd: 94, quality: 98, score: 89 },
        { month: 'Jul', otd: 94, quality: 98, score: 89 },
        { month: 'Aug', otd: 95, quality: 98, score: 90 }
      ],
      riskFactors: []
    });
  }

  return suppliers;
}

// User-provided Sleepsia Catalog Data
export const SLEEPSIA_SEED_DATA = [
  {
    sku: 'SLP-1001',
    productName: 'Contour Memory Foam Cervical Pillow',
    productType: 'Cervical Pillow',
    material: 'Memory Foam',
    intendedUse: 'Adult sleep support',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1499,
    productCostInr: 520,
    targetMarginPct: 0.22,
    weightKg: 1.1,
    leadTimeDays: 6,
    moq: 150,
    reorderPoint: 450,
    safetyStock: 180,
    abcClass: 'A' as const,
    xyzClass: 'X' as const,
    supplierId: 'SUP-0001'
  },
  {
    sku: 'SLP-1002',
    productName: 'Travel Neck Memory Foam Pillow',
    productType: 'Travel Pillow',
    material: 'Memory Foam',
    intendedUse: 'Travel neck support',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/products/travel-pillow',
    sellingPriceInr: 899,
    productCostInr: 310,
    targetMarginPct: 0.18,
    weightKg: 0.4,
    leadTimeDays: 5,
    moq: 200,
    reorderPoint: 500,
    safetyStock: 200,
    abcClass: 'B' as const,
    xyzClass: 'X' as const,
    supplierId: 'SUP-0001'
  },
  {
    sku: 'SLP-1003',
    productName: 'Alpha Kids Memory Foam Pillow',
    productType: 'Kids Pillow',
    material: 'Memory Foam',
    intendedUse: "Children's sleep support",
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/products/kids-alpha-pillow',
    sellingPriceInr: 999,
    productCostInr: 360,
    targetMarginPct: 0.20,
    weightKg: 0.6,
    leadTimeDays: 8,
    moq: 100,
    reorderPoint: 250,
    safetyStock: 100,
    abcClass: 'B' as const,
    xyzClass: 'Y' as const,
    supplierId: 'SUP-0008'
  },
  {
    sku: 'SLP-1004',
    productName: 'Lumbar Support Cushion',
    productType: 'Lumbar Pillow',
    material: 'Memory Foam',
    intendedUse: 'Seated lumbar support',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1199,
    productCostInr: 420,
    targetMarginPct: 0.22,
    weightKg: 0.8,
    leadTimeDays: 6,
    moq: 150,
    reorderPoint: 380,
    safetyStock: 150,
    abcClass: 'A' as const,
    xyzClass: 'X' as const,
    supplierId: 'SUP-0001'
  },
  {
    sku: 'SLP-1005',
    productName: 'Cooling Gel Memory Foam Pillow',
    productType: 'Bed Pillow',
    material: 'Memory Foam + Gel',
    intendedUse: 'Adult sleep support',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1799,
    productCostInr: 680,
    targetMarginPct: 0.24,
    weightKg: 1.4,
    leadTimeDays: 10,
    moq: 120,
    reorderPoint: 320,
    safetyStock: 130,
    abcClass: 'A' as const,
    xyzClass: 'Y' as const,
    supplierId: 'SUP-0004'
  },
  {
    sku: 'SLP-1006',
    productName: 'Wedge Support Pillow',
    productType: 'Wedge Pillow',
    material: 'Foam',
    intendedUse: 'Positioning support',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1299,
    productCostInr: 460,
    targetMarginPct: 0.20,
    weightKg: 1.6,
    leadTimeDays: 8,
    moq: 80,
    reorderPoint: 220,
    safetyStock: 90,
    abcClass: 'B' as const,
    xyzClass: 'Z' as const,
    supplierId: 'SUP-0008'
  },
  {
    sku: 'SLP-1007',
    productName: 'Car Neck Rest Pillow',
    productType: 'Travel/Car Pillow',
    material: 'Memory Foam',
    intendedUse: 'Car neck support',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1099,
    productCostInr: 390,
    targetMarginPct: 0.20,
    weightKg: 0.5,
    leadTimeDays: 6,
    moq: 180,
    reorderPoint: 400,
    safetyStock: 160,
    abcClass: 'B' as const,
    xyzClass: 'X' as const,
    supplierId: 'SUP-0001'
  },
  {
    sku: 'SLP-1008',
    productName: 'Microfiber Sleep Pillow',
    productType: 'Bed Pillow',
    material: 'Microfiber',
    intendedUse: 'General sleep comfort',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 799,
    productCostInr: 270,
    targetMarginPct: 0.18,
    weightKg: 0.9,
    leadTimeDays: 5,
    moq: 300,
    reorderPoint: 650,
    safetyStock: 250,
    abcClass: 'A' as const,
    xyzClass: 'X' as const,
    supplierId: 'SUP-0003'
  },
  // Additional Sleepsia catalog extensions
  {
    sku: 'SLP-1009',
    productName: 'Bamboo Fiber Memory Foam Pillow',
    productType: 'Bed Pillow',
    material: 'Memory Foam + Bamboo Cover',
    intendedUse: 'Anti-allergen cooling sleep',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1599,
    productCostInr: 540,
    targetMarginPct: 0.22,
    weightKg: 1.2,
    leadTimeDays: 7,
    moq: 140,
    reorderPoint: 350,
    safetyStock: 140,
    abcClass: 'A' as const,
    xyzClass: 'X' as const,
    supplierId: 'SUP-0002'
  },
  {
    sku: 'SLP-1010',
    productName: 'Orthopedic Knee & Leg Alignment Pillow',
    productType: 'Orthopedic Pillow',
    material: 'High-Density Memory Foam',
    intendedUse: 'Sciatica & hip alignment support',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1299,
    productCostInr: 450,
    targetMarginPct: 0.20,
    weightKg: 0.7,
    leadTimeDays: 6,
    moq: 120,
    reorderPoint: 280,
    safetyStock: 110,
    abcClass: 'B' as const,
    xyzClass: 'Y' as const,
    supplierId: 'SUP-0008'
  },
  {
    sku: 'SLP-1011',
    productName: 'Full Body Maternity U-Shape Pillow',
    productType: 'Maternity Pillow',
    material: 'Virgin Microfiber Fill',
    intendedUse: 'Pregnancy & maternity comfort',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 2499,
    productCostInr: 890,
    targetMarginPct: 0.25,
    weightKg: 2.5,
    leadTimeDays: 9,
    moq: 60,
    reorderPoint: 180,
    safetyStock: 70,
    abcClass: 'A' as const,
    xyzClass: 'Y' as const,
    supplierId: 'SUP-0003'
  },
  {
    sku: 'SLP-1012',
    productName: 'Butterfly Ergonomic Neck Relief Pillow',
    productType: 'Cervical Pillow',
    material: 'Contoured Memory Foam',
    intendedUse: 'Chronic neck & shoulder pain relief',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1899,
    productCostInr: 670,
    targetMarginPct: 0.24,
    weightKg: 1.2,
    leadTimeDays: 8,
    moq: 100,
    reorderPoint: 290,
    safetyStock: 120,
    abcClass: 'A' as const,
    xyzClass: 'X' as const,
    supplierId: 'SUP-0008'
  },
  {
    sku: 'SLP-1013',
    productName: 'Shredded Memory Foam Adjustable Loft Pillow',
    productType: 'Bed Pillow',
    material: 'Shredded Viscoelastic Foam',
    intendedUse: 'Customizable loft height sleep',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1699,
    productCostInr: 590,
    targetMarginPct: 0.22,
    weightKg: 1.5,
    leadTimeDays: 7,
    moq: 130,
    reorderPoint: 310,
    safetyStock: 125,
    abcClass: 'A' as const,
    xyzClass: 'X' as const,
    supplierId: 'SUP-0001'
  },
  {
    sku: 'SLP-1014',
    productName: 'Donut Seat Coccyx Tailbone Cushion',
    productType: 'Orthopedic Cushion',
    material: 'Molded High-Resilience Foam',
    intendedUse: 'Coccyx pressure & hemorrhoid relief',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1399,
    productCostInr: 480,
    targetMarginPct: 0.21,
    weightKg: 0.6,
    leadTimeDays: 6,
    moq: 150,
    reorderPoint: 320,
    safetyStock: 130,
    abcClass: 'B' as const,
    xyzClass: 'Y' as const,
    supplierId: 'SUP-0008'
  },
  {
    sku: 'SLP-1015',
    productName: 'Bamboo Charcoal Anti-Odor Pillow',
    productType: 'Bed Pillow',
    material: 'Charcoal Infused Memory Foam',
    intendedUse: 'Moisture absorbing & fresh sleep',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1999,
    productCostInr: 710,
    targetMarginPct: 0.24,
    weightKg: 1.3,
    leadTimeDays: 8,
    moq: 90,
    reorderPoint: 240,
    safetyStock: 95,
    abcClass: 'A' as const,
    xyzClass: 'Z' as const,
    supplierId: 'SUP-0002'
  },
  {
    sku: 'SLP-1016',
    productName: 'Dual Comfort Reversible Pillow',
    productType: 'Bed Pillow',
    material: 'Microfiber + Firm Foam Core',
    intendedUse: 'Dual soft & firm sensation',
    primaryMarket: 'India',
    active: 'Yes',
    publicProductUrl: 'https://www.sleepsia.in/',
    sellingPriceInr: 1449,
    productCostInr: 510,
    targetMarginPct: 0.20,
    weightKg: 1.1,
    leadTimeDays: 6,
    moq: 160,
    reorderPoint: 360,
    safetyStock: 140,
    abcClass: 'B' as const,
    xyzClass: 'X' as const,
    supplierId: 'SUP-0003'
  }
];

export function generateProducts(suppliers: Supplier[]): Product[] {
  const products: Product[] = [];

  SLEEPSIA_SEED_DATA.forEach((seedItem, idx) => {
    const sup = suppliers.find(s => s.supplierId === seedItem.supplierId) || suppliers[idx % suppliers.length] || suppliers[0];
    
    // Inject specific distressed SKUs for high-impact supply chain demonstration
    const isCriticalDistress = seedItem.sku === 'SLP-1001' || seedItem.sku === 'SLP-1005';
    const isWatch = seedItem.sku === 'SLP-1003' || seedItem.sku === 'SLP-1011';

    let stockHealthScore = 88 + Math.floor(seededRandom() * 10);
    let stockHealthCategory: Product['stockHealthCategory'] = 'Healthy';

    if (isCriticalDistress) {
      stockHealthScore = 32 + Math.floor(seededRandom() * 10);
      stockHealthCategory = 'Critical';
    } else if (isWatch) {
      stockHealthScore = 62 + Math.floor(seededRandom() * 10);
      stockHealthCategory = 'Watch';
    }

    products.push({
      productId: `PROD-${seedItem.sku}`,
      sku: seedItem.sku,
      productName: seedItem.productName,
      category: seedItem.productType,
      brand: 'Sleepsia',
      unitCost: seedItem.productCostInr,
      sellingPrice: seedItem.sellingPriceInr,
      supplierId: sup.supplierId,
      supplierName: sup.supplierName,
      leadTimeDays: seedItem.leadTimeDays,
      minimumOrderQuantity: seedItem.moq,
      reorderPoint: seedItem.reorderPoint,
      safetyStock: seedItem.safetyStock,
      status: 'ACTIVE',
      weightKg: seedItem.weightKg,
      abcClass: seedItem.abcClass,
      xyzClass: seedItem.xyzClass,
      stockHealthScore,
      stockHealthCategory,
      material: seedItem.material,
      intendedUse: seedItem.intendedUse,
      primaryMarket: seedItem.primaryMarket,
      publicProductUrl: seedItem.publicProductUrl,
      targetMarginPct: seedItem.targetMarginPct,
      sellingPriceInr: seedItem.sellingPriceInr,
      productCostInr: seedItem.productCostInr
    });
  });

  return products;
}

export function generateInventory(products: Product[], warehouses: Warehouse[]): InventoryItem[] {
  const inventory: InventoryItem[] = [];
  let counter = 1;

  for (const product of products) {
    for (const wh of warehouses) {
      // Create targeted stock scenarios:
      // SLP-1001 (Cervical Contour Pillow) is under critical stockout risk at Delhi-NCR & Bengaluru
      // SLP-1005 (Cooling Gel Pillow) has low stock in Bengaluru
      // SLP-1008 (Microfiber Pillow) has healthy high-velocity volume in Delhi-NCR
      // SLP-1006 (Wedge Support) is overstocked in Chennai
      const isCriticalDistress = (product.sku === 'SLP-1001' && (wh.warehouseId === 'WH-001' || wh.warehouseId === 'WH-003')) ||
                                 (product.sku === 'SLP-1005' && wh.warehouseId === 'WH-003');
      
      const isOverstocked = (product.sku === 'SLP-1006' && wh.warehouseId === 'WH-007') ||
                            (product.sku === 'SLP-1015' && wh.warehouseId === 'WH-004');

      let availableQty = 250 + Math.floor(seededRandom() * 650);
      let reservedQty = 30 + Math.floor(seededRandom() * 90);
      let damagedQty = Math.floor(seededRandom() * 4);
      let inTransitQty = 80 + Math.floor(seededRandom() * 200);
      let avgDailyDemand = 12 + Math.floor(seededRandom() * 32);

      if (isCriticalDistress) {
        availableQty = 28 + Math.floor(seededRandom() * 22); // severely low
        avgDailyDemand = 54 + Math.floor(seededRandom() * 18); // high demand spike
        inTransitQty = 0;
      } else if (isOverstocked) {
        availableQty = 1800 + Math.floor(seededRandom() * 600);
        avgDailyDemand = 6;
      }

      const totalQty = availableQty + reservedQty + inTransitQty;
      const totalValue = Number((totalQty * product.unitCost).toFixed(2));
      const daysOfSupply = Number((availableQty / Math.max(1, avgDailyDemand)).toFixed(1));
      const forecastDemand30d = avgDailyDemand * 30;

      let stockStatus: InventoryItem['stockStatus'] = 'Healthy';
      let agingBucket: InventoryItem['agingBucket'] = '0-30';
      let daysToStockout = Math.max(0, Math.floor(availableQty / Math.max(1, avgDailyDemand)));
      let stockoutProb = 5;

      if (daysToStockout <= 5) {
        stockStatus = 'Stockout Risk';
        stockoutProb = 92;
      } else if (availableQty < product.reorderPoint) {
        stockStatus = 'Low Stock';
        stockoutProb = 58;
      } else if (daysOfSupply > 120) {
        stockStatus = 'Overstock';
        agingBucket = '91-180';
        stockoutProb = 1;
      } else if (daysOfSupply > 200) {
        stockStatus = 'Dead Stock';
        agingBucket = '180+';
        stockoutProb = 0;
      }

      inventory.push({
        inventoryId: `INV-${String(counter++).padStart(6, '0')}`,
        sku: product.sku,
        productName: product.productName,
        category: product.category,
        warehouseId: wh.warehouseId,
        warehouseName: wh.warehouseName,
        availableQty,
        reservedQty,
        damagedQty,
        inTransitQty,
        totalQty,
        unitCost: product.unitCost,
        totalValue,
        safetyStock: product.safetyStock,
        reorderPoint: product.reorderPoint,
        daysOfSupply,
        stockStatus,
        agingBucket,
        averageDailyDemand: avgDailyDemand,
        forecastDemand30d,
        incomingPoQty: inTransitQty,
        daysToStockout,
        stockoutProbability: stockoutProb,
        holdingCostPerUnitAnnual: Number((product.unitCost * 0.18).toFixed(2))
      });
    }
  }
  return inventory;
}

export function generatePurchaseOrders(products: Product[], suppliers: Supplier[], warehouses: Warehouse[]): PurchaseOrder[] {
  const pos: PurchaseOrder[] = [];
  const poStatuses: PurchaseOrder['status'][] = ['CONFIRMED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'DELAYED', 'ISSUED'];

  for (let i = 1; i <= 350; i++) {
    const product = products[(i - 1) % products.length];
    const supplier = suppliers.find(s => s.supplierId === product.supplierId) || suppliers[0];
    const wh = warehouses[(i - 1) % warehouses.length];
    const qty = product.minimumOrderQuantity * (1 + (i % 4));
    const unitCost = product.unitCost;
    const totalAmount = Number((qty * unitCost).toFixed(2));

    const isCriticalDelayed = i === 12 || i === 28 || i === 74 || i === 115;
    const status: PurchaseOrder['status'] = isCriticalDelayed ? 'DELAYED' : poStatuses[i % poStatuses.length];
    const delayDays = isCriticalDelayed ? 4 + (i % 6) : status === 'RECEIVED' ? 0 : (i % 7 === 0 ? 2 : 0);
    const delayReason = isCriticalDelayed
      ? 'Viscoelastic memory foam chemical batch polyol curing & QA density hold'
      : delayDays > 0 ? 'NH-48 highway freight congestion in transit' : undefined;

    pos.push({
      poId: `PO-2026-${String(10000 + i)}`,
      supplierId: supplier.supplierId,
      supplierName: supplier.supplierName,
      sku: product.sku,
      productName: product.productName,
      quantity: qty,
      receivedQuantity: status === 'RECEIVED' ? qty : status === 'PARTIALLY_RECEIVED' ? Math.round(qty * 0.55) : 0,
      unitCost,
      totalAmount,
      orderDate: '2026-08-04',
      expectedDate: isCriticalDelayed ? '2026-08-15' : '2026-08-25',
      receivedDate: status === 'RECEIVED' ? '2026-08-18' : undefined,
      status,
      destinationWarehouseId: wh.warehouseId,
      delayDays,
      delayReason,
      priority: isCriticalDelayed ? 'P0' : i % 4 === 0 ? 'P1' : 'P2'
    });
  }
  return pos;
}

export function generateSalesOrders(products: Product[], warehouses: Warehouse[]): SalesOrder[] {
  const orders: SalesOrder[] = [];
  const platforms: SalesOrder['platform'][] = ['Direct Web', 'Amazon', 'Flipkart', 'Blinkit', 'Myntra', 'Retail Stores'];
  const orderStatuses: SalesOrder['status'][] = ['DELIVERED', 'SHIPPED', 'PACKED', 'PICKING', 'BACKORDERED', 'PENDING'];

  const customerCities = [
    'New Delhi, Delhi', 'Bengaluru, Karnataka', 'Mumbai, Maharashtra', 'Hyderabad, Telangana',
    'Pune, Maharashtra', 'Chennai, Tamil Nadu', 'Gurugram, Haryana', 'Kolkata, West Bengal',
    'Ahmedabad, Gujarat', 'Jaipur, Rajasthan', 'Chandigarh, Punjab', 'Kochi, Kerala'
  ];

  for (let i = 1; i <= 800; i++) {
    const product = products[(i - 1) % products.length];
    const wh = warehouses[(i - 1) % warehouses.length];
    const platform = platforms[i % platforms.length];
    const city = customerCities[i % customerCities.length];
    const qty = 1 + (i % 3);
    const totalAmount = Number((qty * product.sellingPrice).toFixed(2));
    const isBackordered = (i === 17 || i === 64 || i === 128) && product.sku === 'SLP-1001';
    const status: SalesOrder['status'] = isBackordered ? 'BACKORDERED' : orderStatuses[i % orderStatuses.length];

    orders.push({
      orderId: `SLP-ORD-${String(500000 + i)}`,
      customerId: `CUST-${String(1000 + (i % 300))}`,
      customerName: `Customer ${(i % 300) + 1} (${city.split(',')[0]})`,
      platform,
      sku: product.sku,
      productName: product.productName,
      quantity: qty,
      unitPrice: product.sellingPrice,
      totalAmount,
      orderDate: '2026-08-16',
      promisedDate: platform === 'Blinkit' ? '2026-08-16' : '2026-08-20',
      shippedDate: status === 'DELIVERED' || status === 'SHIPPED' ? '2026-08-17' : undefined,
      deliveredDate: status === 'DELIVERED' ? '2026-08-18' : undefined,
      status,
      fulfillmentWarehouseId: wh.warehouseId,
      deliveryOnTime: !isBackordered && i % 18 !== 0,
      orderCycleTimeHours: platform === 'Blinkit' ? 2 : 18 + (i % 24)
    });
  }
  return orders;
}

export function generateShipments(orders: SalesOrder[]): Shipment[] {
  const carriers = [
    { id: 'CAR-01', name: 'Delhivery Express Logistics', onTimeRate: 96.8 },
    { id: 'CAR-02', name: 'Blue Dart Express Surface & Air', onTimeRate: 97.4 },
    { id: 'CAR-03', name: 'XpressBees E-Commerce Logistics', onTimeRate: 94.2 },
    { id: 'CAR-04', name: 'Shadowfax Quick Logistics', onTimeRate: 95.1 },
    { id: 'CAR-05', name: 'Ekart Logistics Intermodal', onTimeRate: 96.1 }
  ];

  const shipments: Shipment[] = [];
  const routes = [
    'Delhi NCR Central DC → Jaipur Hub (Surface Express)',
    'Bhiwandi West DC → Pune Logistics Center (Interstate Truckload)',
    'Delhi NCR Central DC → Bengaluru South DC (Air Cargo Intermodal)',
    'Bengaluru South DC → Hyderabad Central Hub (Direct Transit)',
    'Bhiwandi West DC → Ahmedabad Node (Express Surface)'
  ];

  for (let i = 1; i <= 350; i++) {
    const order = orders[(i - 1) % orders.length];
    const carrier = carriers[i % carriers.length];
    const route = routes[i % routes.length];
    const isDelayed = i === 9 || i === 31 || i === 77;

    shipments.push({
      shipmentId: `SHP-IND-${String(88000 + i)}`,
      orderId: order.orderId,
      carrierId: carrier.id,
      carrierName: carrier.name,
      origin: 'Sleepsia Central Hub',
      destination: 'Customer City Hub',
      shippedDate: '2026-08-16',
      expectedDeliveryDate: isDelayed ? '2026-08-18' : '2026-08-20',
      actualDeliveryDate: isDelayed ? undefined : '2026-08-19',
      status: isDelayed ? 'DELAYED' : i % 3 === 0 ? 'DELIVERED' : 'IN_TRANSIT',
      freightCost: Number((95 + (i * 12.4) % 350).toFixed(2)),
      transitTimeDays: 2 + (i % 3),
      delayProbability: isDelayed ? 86 : 8,
      delayDaysEstimate: isDelayed ? 2 : 0,
      riskLevel: isDelayed ? 'CRITICAL' : i % 5 === 0 ? 'MEDIUM' : 'LOW',
      weatherCondition: isDelayed ? 'Heavy Monsoon Inundation' : 'Clear',
      route
    });
  }
  return shipments;
}

export function generateReturns(products: Product[]): ReturnRecord[] {
  const returns: ReturnRecord[] = [];
  const reasons: ReturnRecord['returnReason'][] = [
    'Defective Product',
    'Damaged in Transit',
    'Wrong Item Shipped',
    'Late Delivery',
    'Customer Changed Mind'
  ];

  for (let i = 1; i <= 100; i++) {
    const product = products[(i - 1) % products.length];
    const reason = reasons[i % reasons.length];
    let rootCause: ReturnRecord['rootCauseCategory'] = 'Customer Buyer Remorse';
    if (reason === 'Defective Product') rootCause = 'Supplier Quality';
    else if (reason === 'Damaged in Transit') rootCause = 'Carrier Handling';
    else if (reason === 'Wrong Item Shipped') rootCause = 'Warehouse Packing';

    returns.push({
      returnId: `RET-SLP-${String(9000 + i)}`,
      orderId: `SLP-ORD-${String(500000 + (i * 3))}`,
      sku: product.sku,
      productName: product.productName,
      supplierName: product.supplierName,
      quantity: 1,
      returnReason: reason,
      returnDate: '2026-08-18',
      refundAmount: Number(product.sellingPrice.toFixed(2)),
      restockable: reason === 'Customer Changed Mind' || reason === 'Wrong Item Shipped',
      rootCauseCategory: rootCause
    });
  }
  return returns;
}

export const INITIAL_DATA_QUALITY_LOGS: DataQualityRecord[] = [
  {
    id: 'DQ-2026-001',
    datasetName: 'Sleepsia Raw ERP PO Inbound Feed',
    sourceSystem: 'Shopify / Unicommerce ERP',
    totalRecordsIngested: 1850,
    validRecords: 1842,
    invalidRecords: 8,
    duplicateRecords: 2,
    reconciliationMismatches: 1,
    schemaComplianceRate: 99.6,
    status: 'HEALTHY',
    ingestedAt: '2026-08-19 08:30:00',
    errorSamples: [
      { row: 142, field: 'expectedDate', error: 'Date is prior to order issuance', rawValue: '2025-12-01' },
      { row: 480, field: 'quantity', error: 'Zero quantity on PO item line', rawValue: '0' }
    ]
  },
  {
    id: 'DQ-2026-002',
    datasetName: 'Sleepsia WMS Physical Inventory Feed',
    sourceSystem: 'Unicommerce WMS / Vinculum',
    totalRecordsIngested: 4500,
    validRecords: 4440,
    invalidRecords: 60,
    duplicateRecords: 12,
    reconciliationMismatches: 8,
    schemaComplianceRate: 98.9,
    status: 'WARNING',
    ingestedAt: '2026-08-19 09:15:00',
    errorSamples: [
      { row: 312, field: 'warehouseId', error: 'Unregistered quick-commerce dark store code WH-BLNK-99', rawValue: 'WH-BLNK-99' },
      { row: 810, field: 'availableQty', error: 'Physical count variance exceeds 3% tolerance', rawValue: 'System: 320, Physical: 295' }
    ]
  },
  {
    id: 'DQ-2026-003',
    datasetName: 'Logistics Courier Telemetry Feed',
    sourceSystem: 'Delhivery & Blue Dart API EDI',
    totalRecordsIngested: 2800,
    validRecords: 2785,
    invalidRecords: 15,
    duplicateRecords: 4,
    reconciliationMismatches: 0,
    schemaComplianceRate: 99.5,
    status: 'HEALTHY',
    ingestedAt: '2026-08-19 09:45:00',
    errorSamples: [
      { row: 44, field: 'deliveryDate', error: 'Delivered timestamp precedes dispatched timestamp', rawValue: 'Dispatched: 2026-08-17, Delivered: 2026-08-16' }
    ]
  }
];

export const INITIAL_RAW_LAKE_FILES: IngestionRawFile[] = [
  {
    ingestionId: 'RAW-ING-8801',
    sourceName: 'Sleepsia Official Catalog & Pricing',
    fileName: 'sleepsia_product_catalog_2026.csv',
    fileSizeKb: 840,
    format: 'CSV',
    checksum: 'sha256-slp1001e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b785',
    schemaVersion: 'v2.4.0',
    ingestedAt: '2026-08-19 08:30:12',
    recordCount: 16,
    status: 'STANDARDIZED',
    rawPayloadSnippet: '{"sku":"SLP-1001","productName":"Contour Memory Foam Cervical Pillow","productType":"Cervical Pillow","material":"Memory Foam","sellingPrice_INR":1499,"productCost_INR":520}'
  },
  {
    ingestionId: 'RAW-ING-8802',
    sourceName: 'Sleepsia Multi-DC WMS Live Telemetry',
    fileName: 'sleepsia_wms_stock_20260819.json',
    fileSizeKb: 2100,
    format: 'JSON',
    checksum: 'sha256-ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    schemaVersion: 'v3.1.0',
    ingestedAt: '2026-08-19 09:15:04',
    recordCount: 128,
    status: 'STANDARDIZED',
    rawPayloadSnippet: '{"warehouseId":"WH-001","sku":"SLP-1001","availableQty":28,"reserved":12,"damaged":0}'
  },
  {
    ingestionId: 'RAW-ING-8803',
    sourceName: 'Amazon India & D2C Sales Velocity Feed',
    fileName: 'sleepsia_omnichannel_sales_20260819.xlsx',
    fileSizeKb: 920,
    format: 'Excel',
    checksum: 'sha256-8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    schemaVersion: 'v1.8.0',
    ingestedAt: '2026-08-19 10:00:22',
    recordCount: 800,
    status: 'STANDARDIZED',
    rawPayloadSnippet: '{"channel":"Sleepsia D2C Shopify","sku":"SLP-1001","unitsSold":142,"grossSales_INR":212858}'
  }
];

export const INITIAL_WORKFLOWS: OrchestrationWorkflow[] = [
  {
    workflowId: 'WF-PIPELINE-01',
    name: 'Sleepsia Hourly Multi-DC Ingestion & Inventory Sync',
    schedule: 'Hourly',
    status: 'SUCCESS',
    lastExecution: '2026-08-19 10:00:00',
    nextExecution: '2026-08-19 11:00:00',
    executionDurationMs: 3820,
    retryCount: 0,
    steps: [
      { stepName: 'Connect Shopify, Amazon India & Blinkit Feeds', status: 'SUCCESS', durationMs: 380 },
      { stepName: 'Extract Live Warehouse & Dark Store Stock Counts', status: 'SUCCESS', durationMs: 820 },
      { stepName: 'Execute Schema & Duplicate Validation', status: 'SUCCESS', durationMs: 540 },
      { stepName: 'Transform into Unified Sleepsia Data Model', status: 'SUCCESS', durationMs: 760 },
      { stepName: 'Recalculate Central Metric & KPI Engine', status: 'SUCCESS', durationMs: 640 },
      { stepName: 'Execute Statistical Demand Anomaly Detection', status: 'SUCCESS', durationMs: 410 },
      { stepName: 'Trigger Sleepsia AI Copilot & Risk Assessment', status: 'SUCCESS', durationMs: 270 }
    ]
  },
  {
    workflowId: 'WF-PIPELINE-02',
    name: 'Daily Executive Briefing & Replenishment Optimization',
    schedule: 'Daily',
    status: 'SUCCESS',
    lastExecution: '2026-08-19 06:00:00',
    nextExecution: '2026-08-20 06:00:00',
    executionDurationMs: 7450,
    retryCount: 0,
    steps: [
      { stepName: 'Aggregate Multi-Channel Sales History', status: 'SUCCESS', durationMs: 1100 },
      { stepName: 'Execute Exponential Smoothing & Demand Forecasting', status: 'SUCCESS', durationMs: 2100 },
      { stepName: 'Run Stockout Prediction & ABC-XYZ Segmentation', status: 'SUCCESS', durationMs: 1600 },
      { stepName: 'Generate Decision Workbench Recommendations', status: 'SUCCESS', durationMs: 1300 },
      { stepName: 'Compile Daily AI Executive Briefing PDF & Distribute', status: 'SUCCESS', durationMs: 1350 }
    ]
  }
];

export const INITIAL_ALERTS: SupplyChainAlert[] = [
  {
    id: 'ALT-1001',
    title: 'Critical Stockout Risk: Contour Cervical Pillow in Delhi DC',
    ruleName: 'Stockout Probability > 85%',
    severity: 'CRITICAL',
    entityType: 'SKU',
    entityId: 'SLP-1001',
    message: 'Contour Memory Foam Cervical Pillow (SLP-1001) stock at Delhi-NCR Central DC is down to 28 units with only 3.8 days of supply due to an Amazon Prime promotion surge (+48%). PO-2026-10012 delayed.',
    threshold: '< 7 Days Supply',
    currentValue: '3.8 Days Supply (28 units left)',
    triggeredAt: '2026-08-19 08:45:00',
    channel: 'Dashboard',
    isAcknowledged: false
  },
  {
    id: 'ALT-1002',
    title: 'Supplier Delayed: Bamboo Fabric Pillow Cover Mill',
    ruleName: 'Supplier OTD < 75%',
    severity: 'HIGH',
    entityType: 'Supplier',
    entityId: 'SUP-0002',
    message: 'Tirupur Organic Bamboo & Jacquard Mills delivery rate dropped to 74.5% due to monsoon spinning slowdown. Lead time expanded from 7 to 13 days.',
    threshold: '< 80% On-Time Delivery',
    currentValue: '74.5% OTD (Lead Time: 13d)',
    triggeredAt: '2026-08-19 09:12:00',
    channel: 'Email',
    isAcknowledged: false
  },
  {
    id: 'ALT-1003',
    title: 'Warehouse Capacity Saturation: Bengaluru South DC',
    ruleName: 'Warehouse Utilization > 95%',
    severity: 'HIGH',
    entityType: 'Warehouse',
    entityId: 'WH-003',
    message: 'Sleepsia Bengaluru South DC utilization has reached 96.0%. High concentration of bulk rollpack mattress & wedge pillows causing dock congestion.',
    threshold: '> 90% Utilization',
    currentValue: '96.0% Capacity Utilized',
    triggeredAt: '2026-08-19 09:30:00',
    channel: 'Teams',
    isAcknowledged: false
  },
  {
    id: 'ALT-1004',
    title: 'Highway Logistics Delay: Delhi → Bengaluru Route',
    ruleName: 'Transit Delay Probability > 80%',
    severity: 'MEDIUM',
    entityType: 'Shipment',
    entityId: 'SHP-IND-88009',
    message: 'Delhivery interstate container truck delayed due to heavy monsoon rain in central corridor. 2 days added to ETA.',
    threshold: '> 2 Days Delay',
    currentValue: '2.0 Days Estimated Delay',
    triggeredAt: '2026-08-19 07:15:00',
    channel: 'Dashboard',
    isAcknowledged: true,
    acknowledgedBy: 'Logistics Manager'
  }
];

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'AUD-9901',
    timestamp: '2026-08-19 10:02:15',
    category: 'INGESTION',
    actor: 'System Orchestrator (WF-PIPELINE-01)',
    action: 'Ingested 16 Sleepsia Master Catalog SKUs & Live Telemetry',
    details: 'Standardized into central lake with ₹ INR pricing & target margin rules.',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-9902',
    timestamp: '2026-08-19 09:45:00',
    category: 'AI_AGENT',
    actor: 'Gemini Sleepsia Supply Chain Analyst Agent',
    action: 'Generated Root Cause Multi-Tree for SLP-1001',
    details: 'Attributed 72% stockout probability to Amazon surge (+48%) and Sheela Foam raw polyol batch inspection hold.',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-9903',
    timestamp: '2026-08-19 09:20:10',
    category: 'HUMAN_APPROVAL',
    actor: 'ashishsinha741@gmail.com (Supply Chain Executive)',
    action: 'Approved Inter-Warehouse Transfer REC-TR-102',
    details: 'Authorized dispatch of 150 units of SLP-1001 from Bhiwandi West DC to Delhi-NCR Central DC via Blue Dart Surface Express.',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-9904',
    timestamp: '2026-08-19 08:30:00',
    category: 'VALIDATION',
    actor: 'Data Quality Engine',
    action: 'Sleepsia Production Inventory Reconciliation Completed',
    details: 'PO vs Received quantity reconciled for 350 lines with 99.7% match rate.',
    status: 'SUCCESS'
  }
];
