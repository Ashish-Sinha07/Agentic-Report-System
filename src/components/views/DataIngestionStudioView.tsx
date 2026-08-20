import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  Check,
  Search,
  Package,
  Building2,
  Truck,
  ShoppingCart,
  ShieldCheck,
  FileJson,
  FileCode,
  X,
  Radio,
  Zap,
  Play,
  Pause,
  Activity
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supplyChainStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';
import { EntityType, InventoryItem, Supplier, Warehouse, PurchaseOrder, SalesOrder, Shipment, ReturnRecord } from '../../types';

export const DataIngestionStudioView: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'DROPZONE' | 'TEMPLATES' | 'ACTIVE_DATA' | 'JSON_BUNDLE' | 'ADD_RECORD' | 'LIVE_STREAM'>('DROPZONE');
  const [selectedEntityForTable, setSelectedEntityForTable] = useState<EntityType>('INVENTORY');
  const [searchFilter, setSearchFilter] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // New Record Form State
  const [newRecordType, setNewRecordType] = useState<EntityType>('INVENTORY');
  const [skuForm, setSkuForm] = useState({
    sku: '',
    productName: '',
    category: 'Consumer Electronics',
    warehouseId: 'WH-001',
    warehouseName: 'Seattle Central DC',
    availableQty: 100,
    safetyStock: 35,
    reorderPoint: 80,
    averageDailyDemand: 12,
    unitCost: 45,
    leadTimeDays: 10
  });

  const rawLakeFiles = supplyChainStore.rawLakeFiles;
  const dataSourceType = supplyChainStore.dataSourceType;
  const customDatasetName = supplyChainStore.customDatasetName;

  // Helper for CSV downloading
  const handleDownloadTemplate = (entityType: EntityType) => {
    const csvContent = supplyChainStore.getCSVTemplate(entityType);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `template_${entityType.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIngestionStatus({
      type: 'info',
      message: `Downloaded CSV template for ${entityType}. Fill in your data and upload above.`
    });
  };

  // Helper for Individual Excel (.xlsx) downloading
  const handleDownloadExcelTemplate = (entityType: EntityType) => {
    try {
      const rows = supplyChainStore.getTemplateRows(entityType);
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, entityType);
      XLSX.writeFile(wb, `template_${entityType.toLowerCase()}.xlsx`);
      setIngestionStatus({
        type: 'info',
        message: `Downloaded Excel (.xlsx) template for ${entityType}.`
      });
    } catch (err: any) {
      setIngestionStatus({
        type: 'error',
        message: `Failed to generate Excel template: ${err.message}`
      });
    }
  };

  // Download Master Multi-Sheet Excel (.xlsx) Template containing all supply chain entities
  const handleDownloadMasterExcelWorkbook = () => {
    try {
      const wb = XLSX.utils.book_new();
      const entities: EntityType[] = ['INVENTORY', 'SUPPLIERS', 'WAREHOUSES', 'PURCHASE_ORDERS', 'SALES_ORDERS', 'SHIPMENTS', 'RETURNS'];
      entities.forEach(ent => {
        const rows = supplyChainStore.getTemplateRows(ent);
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, ent);
      });
      XLSX.writeFile(wb, `master_supply_chain_template_all_sheets.xlsx`);
      setIngestionStatus({
        type: 'success',
        message: 'Downloaded Master Multi-Sheet Excel Template (Inventory, Suppliers, Warehouses, POs, Sales, Shipments, Returns).'
      });
    } catch (err: any) {
      setIngestionStatus({
        type: 'error',
        message: `Failed to generate Master Excel Workbook: ${err.message}`
      });
    }
  };

  // Helper for Exporting Active Data to Multi-Sheet Excel (.xlsx)
  const handleExportFullExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      if (supplyChainStore.inventory.length > 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(supplyChainStore.inventory), 'Inventory');
      }
      if (supplyChainStore.suppliers.length > 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(supplyChainStore.suppliers), 'Suppliers');
      }
      if (supplyChainStore.warehouses.length > 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(supplyChainStore.warehouses), 'Warehouses');
      }
      if (supplyChainStore.purchaseOrders.length > 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(supplyChainStore.purchaseOrders), 'PurchaseOrders');
      }
      if (supplyChainStore.salesOrders.length > 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(supplyChainStore.salesOrders), 'SalesOrders');
      }
      if (supplyChainStore.shipments.length > 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(supplyChainStore.shipments), 'Shipments');
      }
      if (supplyChainStore.returns.length > 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(supplyChainStore.returns), 'Returns');
      }

      XLSX.writeFile(wb, `supply_chain_active_dataset_${Date.now()}.xlsx`);
      setIngestionStatus({
        type: 'success',
        message: 'Successfully exported active data to multi-sheet Excel (.xlsx) workbook!'
      });
    } catch (err: any) {
      setIngestionStatus({
        type: 'error',
        message: `Failed to export Excel file: ${err.message}`
      });
    }
  };

  const handleExportFullJSON = () => {
    const fullData = {
      datasetName: customDatasetName,
      exportedAt: new Date().toISOString(),
      warehouses: supplyChainStore.warehouses,
      suppliers: supplyChainStore.suppliers,
      products: supplyChainStore.products,
      inventory: supplyChainStore.inventory,
      purchaseOrders: supplyChainStore.purchaseOrders,
      salesOrders: supplyChainStore.salesOrders,
      shipments: supplyChainStore.shipments,
      returns: supplyChainStore.returns
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(fullData, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `supply_chain_dataset_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust CSV Parser
  const parseCSV = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values: string[] = [];
      let inQuotes = false;
      let curVal = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(curVal.trim().replace(/^["']|["']$/g, ''));
          curVal = '';
        } else {
          curVal += char;
        }
      }
      values.push(curVal.trim().replace(/^["']|["']$/g, ''));

      if (values.length >= headers.length) {
        const obj: any = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] !== undefined ? values[idx] : '';
        });
        records.push(obj);
      }
    }
    return records;
  };

  // Universal File Upload Handler supporting .xlsx, .xls, .csv, .json, .txt
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    const file = files[0];
    const fileName = file.name.toLowerCase();

    // Check if it's an Excel spreadsheet (.xlsx or .xls)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const data = new Uint8Array(buffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetNames = workbook.SheetNames;

          if (sheetNames.length === 0) {
            throw new Error('The uploaded Excel workbook contains no sheets.');
          }

          if (sheetNames.length === 1) {
            // Single sheet in workbook
            const sheet = workbook.Sheets[sheetNames[0]];
            const records: any[] = XLSX.utils.sheet_to_json(sheet);
            if (records.length === 0) {
              throw new Error(`Sheet "${sheetNames[0]}" is empty.`);
            }
            supplyChainStore.ingestUploadedFile(file.name, 'Excel', `Excel Sheet: ${sheetNames[0]} (${records.length} records)`, records);
            setIngestionStatus({
              type: 'success',
              message: `Successfully parsed and ingested ${records.length} records from Excel spreadsheet (${sheetNames[0]}) in ${file.name}. Analytics updated!`
            });
          } else {
            // Multi-sheet Excel workbook
            const sheetsData = sheetNames.map(name => ({
              sheetName: name,
              records: XLSX.utils.sheet_to_json(workbook.Sheets[name]) as any[]
            })).filter(s => s.records.length > 0);

            if (sheetsData.length === 0) {
              throw new Error('All sheets in the Excel workbook are empty.');
            }

            supplyChainStore.ingestMultiSheetWorkbook(file.name, sheetsData);
            const totalCount = sheetsData.reduce((acc, s) => acc + s.records.length, 0);
            setIngestionStatus({
              type: 'success',
              message: `Successfully ingested multi-sheet Excel Workbook with ${sheetsData.length} sheets (${sheetsData.map(s => s.sheetName).join(', ')}) totaling ${totalCount} records. Full network recalculated!`
            });
          }
          setActiveTab('ACTIVE_DATA');
        } catch (err: any) {
          setIngestionStatus({
            type: 'error',
            message: `Excel Ingestion Error: ${err.message || 'Could not parse .xlsx spreadsheet'}`
          });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setIngestionStatus({ type: 'error', message: 'Failed to read the Excel file.' });
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // CSV or JSON text files
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      let format: 'CSV' | 'JSON' | 'Excel' = 'CSV';
      let records: any[] = [];

      try {
        if (fileName.endsWith('.json')) {
          format = 'JSON';
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            records = parsed;
            supplyChainStore.ingestUploadedFile(file.name, format, text, records);
          } else if (typeof parsed === 'object' && parsed !== null) {
            // Bundle object
            supplyChainStore.loadUserData(parsed, file.name);
            records = parsed.inventory || parsed.products || parsed.suppliers || [];
            supplyChainStore.ingestUploadedFile(file.name, format, text, records);
          }
        } else {
          format = 'CSV';
          records = parseCSV(text);
          supplyChainStore.ingestUploadedFile(file.name, format, text, records);
        }

        setIngestionStatus({
          type: 'success',
          message: `Successfully ingested and calculated network telemetry from ${records.length} records in ${file.name}`
        });
        setActiveTab('ACTIVE_DATA');
      } catch (err: any) {
        setIngestionStatus({
          type: 'error',
          message: `Failed to parse file: ${err.message || 'Invalid format'}`
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setIngestionStatus({ type: 'error', message: 'Failed to read file.' });
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleApplyJSONBundle = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        supplyChainStore.ingestUploadedFile('direct_pasted_array.json', 'JSON', jsonText, parsed);
      } else {
        supplyChainStore.loadUserData(parsed, 'Direct Ingested JSON Bundle');
      }
      setIngestionStatus({
        type: 'success',
        message: 'JSON bundle successfully loaded. All calculations updated from your custom data.'
      });
      setJsonText('');
      setActiveTab('ACTIVE_DATA');
    } catch (err: any) {
      setIngestionStatus({
        type: 'error',
        message: `Invalid JSON syntax: ${err.message}`
      });
    }
  };

  const handleAddNewSKU = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuForm.sku || !skuForm.productName) {
      setIngestionStatus({ type: 'error', message: 'SKU and Product Name are required.' });
      return;
    }

    const newItem: InventoryItem = {
      inventoryId: `INV-${Date.now()}`,
      sku: skuForm.sku.toUpperCase(),
      productName: skuForm.productName,
      category: skuForm.category,
      warehouseId: skuForm.warehouseId,
      warehouseName: skuForm.warehouseName,
      availableQty: Number(skuForm.availableQty),
      reservedQty: 0,
      damagedQty: 0,
      inTransitQty: 0,
      incomingPoQty: 0,
      totalQty: Number(skuForm.availableQty),
      safetyStock: Number(skuForm.safetyStock),
      reorderPoint: Number(skuForm.reorderPoint),
      daysOfSupply: skuForm.averageDailyDemand > 0 ? Number((skuForm.availableQty / skuForm.averageDailyDemand).toFixed(1)) : 99,
      averageDailyDemand: Number(skuForm.averageDailyDemand),
      forecastDemand30d: Number(skuForm.averageDailyDemand) * 30,
      unitCost: Number(skuForm.unitCost),
      totalValue: Number(skuForm.availableQty) * Number(skuForm.unitCost),
      daysToStockout: skuForm.averageDailyDemand > 0 ? Number((skuForm.availableQty / skuForm.averageDailyDemand).toFixed(1)) : 99,
      stockStatus: skuForm.availableQty < skuForm.safetyStock ? 'Stockout Risk' : 'Healthy',
      agingBucket: '0-30',
      stockoutProbability: skuForm.availableQty < skuForm.safetyStock ? 85 : 5,
      holdingCostPerUnitAnnual: Number(skuForm.unitCost) * 0.2
    };

    const existingInventory = [...supplyChainStore.inventory];
    const existingIndex = existingInventory.findIndex(i => i.sku === newItem.sku && i.warehouseId === newItem.warehouseId);
    if (existingIndex >= 0) {
      existingInventory[existingIndex] = newItem;
    } else {
      existingInventory.unshift(newItem);
    }

    supplyChainStore.loadUserData({ inventory: existingInventory }, supplyChainStore.customDatasetName);
    setIngestionStatus({
      type: 'success',
      message: `Added/Updated SKU: ${newItem.sku} (${newItem.productName}). Analytics recomputed.`
    });

    setSkuForm({
      sku: '',
      productName: '',
      category: 'Consumer Electronics',
      warehouseId: 'WH-001',
      warehouseName: 'Seattle Central DC',
      availableQty: 100,
      safetyStock: 35,
      reorderPoint: 80,
      averageDailyDemand: 12,
      unitCost: 45,
      leadTimeDays: 10
    });
    setActiveTab('ACTIVE_DATA');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner: Current Dataset State & Global Controls */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 backdrop-blur-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">Data Ingestion Studio & Dataset Manager</h2>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
              dataSourceType === 'USER_PROVIDED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : dataSourceType === 'BLANK'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}>
              {dataSourceType === 'USER_PROVIDED' ? 'CUSTOM USER DATA' : dataSourceType === 'BLANK' ? 'WORKSPACE BLANK' : 'SAMPLE BENCHMARK'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Current Dataset: <strong className="text-slate-200">{customDatasetName}</strong> • All supply chain analytics, forecasts, and recommendations are computed exclusively from this active data.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-export-excel-dataset"
            onClick={handleExportFullExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all shadow-xs"
            title="Export full active data as multi-sheet Excel (.xlsx) workbook"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel (.XLSX)</span>
          </button>

          <button
            id="btn-export-json-dataset"
            onClick={handleExportFullJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/50 rounded-xl text-xs font-semibold transition-all shadow-xs"
            title="Export full active data bundle as JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export JSON</span>
          </button>

          <button
            id="btn-load-sample-dataset"
            onClick={() => {
              supplyChainStore.loadSampleData();
              setIngestionStatus({ type: 'info', message: 'Loaded 500-SKU benchmark template dataset.' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Demo Data</span>
          </button>

          <button
            id="btn-clear-all-data"
            onClick={() => {
              if (window.confirm('Clear all active data and start with a blank workspace?')) {
                supplyChainStore.clearAllData();
                setIngestionStatus({ type: 'info', message: 'Workspace cleared. Upload your data below.' });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {ingestionStatus && (
        <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in ${
          ingestionStatus.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : ingestionStatus.type === 'error'
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {ingestionStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : ingestionStatus.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
            <span>{ingestionStatus.message}</span>
          </div>
          <button onClick={() => setIngestionStatus(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Total SKUs</span>
            <Package className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-white">{supplyChainStore.inventory.length}</p>
          <span className="text-[10px] text-slate-400">Unique inventory rows</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Suppliers</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">{supplyChainStore.suppliers.length}</p>
          <span className="text-[10px] text-slate-400">Tier-1 vendors</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Warehouses</span>
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="text-xl font-bold text-white">{supplyChainStore.warehouses.length}</p>
          <span className="text-[10px] text-slate-400">Fulfillment DCs</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Open POs</span>
            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-white">{supplyChainStore.purchaseOrders.length}</p>
          <span className="text-[10px] text-slate-400">Purchase orders</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Shipments</span>
            <Truck className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-white">{supplyChainStore.shipments.length}</p>
          <span className="text-[10px] text-slate-400">Logistics tracking</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Total Stock Value</span>
            <Database className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-white">
            ${(supplyChainStore.inventory.reduce((s, i) => s + i.totalValue, 0) / 1000).toFixed(1)}k
          </p>
          <span className="text-[10px] text-slate-400">Inventory assets</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('DROPZONE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'DROPZONE'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Files (.XLSX / .CSV / .JSON)</span>
        </button>

        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'TEMPLATES'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Download Templates (.XLSX / .CSV)</span>
        </button>

        <button
          onClick={() => setActiveTab('JSON_BUNDLE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'JSON_BUNDLE'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>Paste JSON Bundle</span>
        </button>

        <button
          onClick={() => setActiveTab('ADD_RECORD')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ADD_RECORD'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Manual Entry / Add SKU</span>
        </button>

        <button
          onClick={() => setActiveTab('LIVE_STREAM')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'LIVE_STREAM'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Data Stream Feeder</span>
          {supplyChainStore.isLiveStreaming && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ACTIVE_DATA')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ACTIVE_DATA'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Explore Ingested Records ({supplyChainStore.inventory.length})</span>
        </button>
      </div>

      {/* TAB 1: DROPZONE & SMART UPLOAD */}
      {activeTab === 'DROPZONE' && (
        <div className="space-y-6">
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }}
            className={`p-10 border-2 border-dashed rounded-3xl text-center transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/20'
                : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
            }`}
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Drag & drop Excel (.xlsx, .xls), CSV, or JSON here</p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload single or multi-sheet Excel workbooks, CSV tables, or JSON files. All downstream metrics, AI diagnostics, and predictions will recalculate dynamically from your data.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <label className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-lg shadow-indigo-500/25">
                  <span>{isProcessing ? 'Processing File...' : 'Select File (.xlsx, .xls, .csv, .json)'}</span>
                  <input
                    id="input-file-upload-studio"
                    type="file"
                    accept=".xlsx,.xls,.csv,.json,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    disabled={isProcessing}
                    onChange={e => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>

                <button
                  id="btn-quick-download-master-wb"
                  onClick={handleDownloadMasterExcelWorkbook}
                  className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Download Master Multi-Sheet .XLSX Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Entity Upload Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 space-y-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white">Inventory / SKUs</h4>
              </div>
              <p className="text-[11px] text-slate-400">Upload item stock, safety buffers, demand velocity, and unit costs.</p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => handleDownloadExcelTemplate('INVENTORY')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>.XLSX</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => handleDownloadTemplate('INVENTORY')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.CSV</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">Suppliers & Vendors</h4>
              </div>
              <p className="text-[11px] text-slate-400">Upload vendor on-time delivery rates, lead times, defect rates, and risk scores.</p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => handleDownloadExcelTemplate('SUPPLIERS')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>.XLSX</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => handleDownloadTemplate('SUPPLIERS')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.CSV</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 space-y-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">Purchase Orders</h4>
              </div>
              <p className="text-[11px] text-slate-400">Upload open/in-transit POs, delay days, quantities, and supplier ETAs.</p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => handleDownloadExcelTemplate('PURCHASE_ORDERS')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>.XLSX</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => handleDownloadTemplate('PURCHASE_ORDERS')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES FOR ALL ENTITIES */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-5">
          {/* Master Multi-Sheet Workbook Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Master Multi-Sheet Excel Workbook (.xlsx)</h3>
              </div>
              <p className="text-xs text-slate-300">
                Contains pre-structured sheets for <strong>Inventory, Suppliers, Warehouses, Purchase Orders, Sales Orders, Shipments, and Returns</strong> all in a single Excel file.
              </p>
            </div>
            <button
              id="btn-dl-master-workbook"
              onClick={handleDownloadMasterExcelWorkbook}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Master .XLSX</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
            <h3 className="text-xs font-bold text-indigo-200">Individual Entity Spreadsheets</h3>
            <p className="text-[11px] text-indigo-300/80 mt-0.5">
              Download formatted templates for specific tables in either Excel (.xlsx) or CSV format.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { type: 'INVENTORY' as EntityType, title: 'Master Inventory & SKUs', desc: 'SKU, availableQty, safetyStock, reorderPoint, averageDailyDemand, unitCost, leadTimeDays' },
              { type: 'SUPPLIERS' as EntityType, title: 'Supplier Scorecards & OTD', desc: 'supplierId, supplierName, leadTimeDays, onTimeDeliveryRate, rejectionRate, score' },
              { type: 'WAREHOUSES' as EntityType, title: 'Distribution Facilities & DCs', desc: 'warehouseId, warehouseName, location, capacityUnits, utilizationRate, docksCount' },
              { type: 'PURCHASE_ORDERS' as EntityType, title: 'Inbound Purchase Orders (POs)', desc: 'poId, sku, supplierId, orderQty, unitPrice, status, delayDays, delayReason' },
              { type: 'SALES_ORDERS' as EntityType, title: 'Customer Sales & Demand Orders', desc: 'orderId, orderDate, sku, quantity, channel, status, totalAmount, deliveryOnTime' },
              { type: 'SHIPMENTS' as EntityType, title: 'Outbound Logistics & Carriers', desc: 'shipmentId, carrierName, origin, destination, transitTimeDays, freightCost, status' },
              { type: 'RETURNS' as EntityType, title: 'Returns & Reverse Logistics', desc: 'returnId, salesOrderId, sku, reason, condition, refundAmount, returnDate' }
            ]).map(item => (
              <div key={item.type} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id={`btn-dl-xlsx-${item.type.toLowerCase()}`}
                    onClick={() => handleDownloadExcelTemplate(item.type)}
                    className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1"
                    title="Download Excel (.xlsx) template"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>.XLSX</span>
                  </button>
                  <button
                    id={`btn-dl-tpl-${item.type.toLowerCase()}`}
                    onClick={() => handleDownloadTemplate(item.type)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1"
                    title="Download CSV template"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>.CSV</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: JSON BUNDLE PASTER */}
      {activeTab === 'JSON_BUNDLE' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-white">Direct JSON Ingestion Payload</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Paste a single array of items or a full bundle with <code className="text-indigo-400 font-mono">&#123; inventory: [...], suppliers: [...], purchaseOrders: [...] &#125;</code>.
              </p>
            </div>

            <textarea
              id="textarea-json-ingest"
              rows={12}
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              placeholder={`{\n  "inventory": [\n    {\n      "sku": "SKU-CUSTOM-01",\n      "productName": "High Precision Servo Motor",\n      "category": "Robotics",\n      "warehouseId": "WH-001",\n      "warehouseName": "Seattle DC",\n      "availableQty": 120,\n      "safetyStock": 40,\n      "reorderPoint": 90,\n      "averageDailyDemand": 15,\n      "unitCost": 85.00,\n      "leadTimeDays": 12\n    }\n  ]\n}`}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end">
              <button
                id="btn-submit-json-bundle"
                onClick={handleApplyJSONBundle}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Ingest & Recompute Telemetry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MANUAL ENTRY / ADD SKU */}
      {activeTab === 'ADD_RECORD' && (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Direct Inventory SKU Entry</h3>
            <p className="text-xs text-slate-400 mt-0.5">Quickly add or update a SKU record in the active inventory state</p>
          </div>

          <form onSubmit={handleAddNewSKU} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">SKU Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SKU-TECH-001"
                  value={skuForm.sku}
                  onChange={e => setSkuForm({ ...skuForm, sku: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OLED Display Controller"
                  value={skuForm.productName}
                  onChange={e => setSkuForm({ ...skuForm, productName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={skuForm.category}
                  onChange={e => setSkuForm({ ...skuForm, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Consumer Electronics">Consumer Electronics</option>
                  <option value="Industrial Automation">Industrial Automation</option>
                  <option value="Home & Smart Appliances">Home & Smart Appliances</option>
                  <option value="Healthcare & Biotech">Healthcare & Biotech</option>
                  <option value="Automotive & EV Systems">Automotive & EV Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Facility / Warehouse</label>
                <select
                  value={skuForm.warehouseId}
                  onChange={e => {
                    const wh = supplyChainStore.warehouses.find(w => w.warehouseId === e.target.value);
                    setSkuForm({ ...skuForm, warehouseId: e.target.value, warehouseName: wh?.warehouseName || `Warehouse ${e.target.value}` });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {supplyChainStore.warehouses.map(w => (
                    <option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName} ({w.warehouseId})</option>
                  ))}
                  {supplyChainStore.warehouses.length === 0 && (
                    <option value="WH-001">Seattle Central DC (WH-001)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Available Stock (Units)</label>
                <input
                  type="number"
                  min="0"
                  value={skuForm.availableQty}
                  onChange={e => setSkuForm({ ...skuForm, availableQty: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Average Daily Demand (Units/day)</label>
                <input
                  type="number"
                  min="1"
                  value={skuForm.averageDailyDemand}
                  onChange={e => setSkuForm({ ...skuForm, averageDailyDemand: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Safety Stock (Units)</label>
                <input
                  type="number"
                  min="0"
                  value={skuForm.safetyStock}
                  onChange={e => setSkuForm({ ...skuForm, safetyStock: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Reorder Point (ROP)</label>
                <input
                  type="number"
                  min="0"
                  value={skuForm.reorderPoint}
                  onChange={e => setSkuForm({ ...skuForm, reorderPoint: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={skuForm.unitCost}
                  onChange={e => setSkuForm({ ...skuForm, unitCost: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="btn-save-new-sku"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save SKU to Control Tower</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: LIVE STREAMING TELEMETRY FEEDER */}
      {activeTab === 'LIVE_STREAM' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-white">Real-Time Data Streaming Console</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    supplyChainStore.isLiveStreaming
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {supplyChainStore.isLiveStreaming ? '🟢 LIVE STREAMING ACTIVE' : '⏸️ STREAM PAUSED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Simulates continuous live streaming telemetry. Every new event (Sales Orders, Inventory Deductions, Fulfillment Receipts) updates the entire website simultaneously in real-time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="btn-studio-toggle-live-stream"
                  onClick={() => supplyChainStore.toggleLiveStream()}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                    supplyChainStore.isLiveStreaming
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                  }`}
                >
                  {supplyChainStore.isLiveStreaming ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Live Stream</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start Real-Time Streaming</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-studio-simulate-burst"
                  onClick={() => {
                    supplyChainStore.simulateTelemetryBurst(50);
                    setIngestionStatus({
                      type: 'success',
                      message: 'Simulated live telemetry burst of 50 orders! All KPIs and views updated simultaneously.'
                    });
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Stream Burst (+50 Orders)</span>
                </button>
              </div>
            </div>

            {/* Controls & Stream Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-slate-300">Streaming Frequency</span>
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { label: 'Fast (1.5s)', ms: 1500 },
                    { label: 'Normal (3.5s)', ms: 3500 },
                    { label: 'Relaxed (6.0s)', ms: 6000 }
                  ].map(speed => (
                    <button
                      key={speed.ms}
                      onClick={() => {
                        if (supplyChainStore.isLiveStreaming) {
                          supplyChainStore.stopLiveStream();
                          supplyChainStore.toggleLiveStream(speed.ms);
                        } else {
                          supplyChainStore.liveStreamIntervalMs = speed.ms;
                        }
                      }}
                      className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all ${
                        supplyChainStore.liveStreamIntervalMs === speed.ms
                          ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                          : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-1">
                <span className="text-xs font-bold text-slate-300">Total Live Ingested Orders</span>
                <p className="text-2xl font-extrabold text-emerald-400">
                  {supplyChainStore.salesOrders.length.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400">Live sales orders in current session</p>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-1">
                <span className="text-xs font-bold text-slate-300">Latest Telemetry Event</span>
                {supplyChainStore.lastLiveStreamEvent ? (
                  <div>
                    <p className="text-xs font-bold text-white truncate">{supplyChainStore.lastLiveStreamEvent.title}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">
                      {supplyChainStore.lastLiveStreamEvent.channel} • {supplyChainStore.lastLiveStreamEvent.timestamp}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No streaming events yet in current session.</p>
                )}
              </div>
            </div>

            {/* Live Terminal Stream Log */}
            <div className="bg-black/80 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="font-bold text-slate-200">LIVE TELEMETRY INGESTION STREAM (WEBSITE SYNCHRONIZED)</span>
                </div>
                <span>STATUS: {supplyChainStore.isLiveStreaming ? 'RECEIVING PACKETS' : 'STANDBY'}</span>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                {supplyChainStore.salesOrders.slice(0, 10).map((so, idx) => (
                  <div key={so.orderId ? `${so.orderId}-${idx}` : `so-stream-${idx}`} className="flex items-center justify-between text-[11px] text-slate-300 hover:bg-slate-900/80 p-1.5 rounded-lg border border-transparent hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-2 truncate max-w-lg">
                      <span className="text-emerald-400 font-bold">[STREAM]</span>
                      <span className="text-slate-400 text-[10px]">{so.orderDate}</span>
                      <span className="font-bold text-indigo-300">{so.orderId}</span>
                      <span className="text-slate-300">
                        {so.quantity}x {so.productName} ({so.sku})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]">
                        {so.platform}
                      </span>
                      <span className="font-bold text-emerald-400">{formatINR(so.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVE DATA EXPLORER & VIEWER */}
      {activeTab === 'ACTIVE_DATA' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/40 border border-slate-700/40 p-4 rounded-2xl">
            <div className="flex items-center gap-2 overflow-x-auto">
              {(['INVENTORY', 'SUPPLIERS', 'WAREHOUSES', 'PURCHASE_ORDERS', 'SALES_ORDERS', 'SHIPMENTS', 'RETURNS'] as EntityType[]).map(ent => (
                <button
                  key={ent}
                  onClick={() => setSelectedEntityForTable(ent)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    selectedEntityForTable === ent
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {ent} (
                    {ent === 'INVENTORY' ? supplyChainStore.inventory.length
                    : ent === 'SUPPLIERS' ? supplyChainStore.suppliers.length
                    : ent === 'WAREHOUSES' ? supplyChainStore.warehouses.length
                    : ent === 'PURCHASE_ORDERS' ? supplyChainStore.purchaseOrders.length
                    : ent === 'SALES_ORDERS' ? supplyChainStore.salesOrders.length
                    : ent === 'SHIPMENTS' ? supplyChainStore.shipments.length
                    : supplyChainStore.returns.length}
                  )
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter table rows..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-96">
              {selectedEntityForTable === 'INVENTORY' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-slate-400 font-bold border-b border-slate-700 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Facility</th>
                      <th className="px-4 py-3">Stock (Units)</th>
                      <th className="px-4 py-3">Daily Demand</th>
                      <th className="px-4 py-3">Days Supply</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {supplyChainStore.inventory
                      .filter(i => !searchFilter || i.sku.toLowerCase().includes(searchFilter.toLowerCase()) || i.productName.toLowerCase().includes(searchFilter.toLowerCase()))
                      .slice(0, 50)
                      .map((item, idx) => (
                        <tr key={item.inventoryId ? `${item.inventoryId}-${idx}` : `inv-${idx}`} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-mono font-bold text-indigo-300">{item.sku}</td>
                          <td className="px-4 py-2.5 text-slate-200 font-medium">{item.productName}</td>
                          <td className="px-4 py-2.5 text-slate-400">{item.warehouseName}</td>
                          <td className="px-4 py-2.5 font-bold text-white">{item.availableQty}</td>
                          <td className="px-4 py-2.5 text-slate-300">{item.averageDailyDemand} u/d</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-300">{item.daysToStockout}d</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.stockStatus === 'Stockout Risk'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : item.stockStatus === 'Low Stock'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {item.stockStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {selectedEntityForTable === 'SUPPLIERS' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-slate-400 font-bold border-b border-slate-700 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Supplier ID</th>
                      <th className="px-4 py-3">Supplier Name</th>
                      <th className="px-4 py-3">Country</th>
                      <th className="px-4 py-3">Lead Time</th>
                      <th className="px-4 py-3">OTD Rate</th>
                      <th className="px-4 py-3">Rejection Rate</th>
                      <th className="px-4 py-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {supplyChainStore.suppliers
                      .filter(s => !searchFilter || s.supplierName.toLowerCase().includes(searchFilter.toLowerCase()))
                      .slice(0, 50)
                      .map((sup, idx) => (
                        <tr key={sup.supplierId ? `${sup.supplierId}-${idx}` : `sup-${idx}`} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-mono font-bold text-indigo-300">{sup.supplierId}</td>
                          <td className="px-4 py-2.5 text-slate-200 font-medium">{sup.supplierName}</td>
                          <td className="px-4 py-2.5 text-slate-400">{sup.country}</td>
                          <td className="px-4 py-2.5 text-slate-300">{sup.leadTimeDays}d</td>
                          <td className="px-4 py-2.5 font-bold text-emerald-400">{sup.onTimeDeliveryRate}%</td>
                          <td className="px-4 py-2.5 text-rose-400">{sup.rejectionRate}%</td>
                          <td className="px-4 py-2.5 font-bold text-white">{sup.score}/100</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {selectedEntityForTable === 'WAREHOUSES' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-slate-400 font-bold border-b border-slate-700 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Facility ID</th>
                      <th className="px-4 py-3">Facility Name</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Capacity (Units)</th>
                      <th className="px-4 py-3">Utilization</th>
                      <th className="px-4 py-3">Docks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {supplyChainStore.warehouses
                      .filter(w => !searchFilter || w.warehouseName.toLowerCase().includes(searchFilter.toLowerCase()) || w.location.toLowerCase().includes(searchFilter.toLowerCase()))
                      .slice(0, 50)
                      .map((wh, idx) => (
                        <tr key={wh.warehouseId ? `${wh.warehouseId}-${idx}` : `wh-${idx}`} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-mono font-bold text-indigo-300">{wh.warehouseId}</td>
                          <td className="px-4 py-2.5 text-slate-200 font-medium">{wh.warehouseName}</td>
                          <td className="px-4 py-2.5 text-slate-400">{wh.location}</td>
                          <td className="px-4 py-2.5 font-bold text-white">{wh.capacityUnits?.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-amber-400 font-bold">{wh.utilizationRate}%</td>
                          <td className="px-4 py-2.5 text-slate-300">{wh.type}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {selectedEntityForTable === 'PURCHASE_ORDERS' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-slate-400 font-bold border-b border-slate-700 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="px-4 py-3">PO ID</th>
                      <th className="px-4 py-3">SKU & Item</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3">Order Qty</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Delay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {supplyChainStore.purchaseOrders
                      .filter(p => !searchFilter || p.poId.toLowerCase().includes(searchFilter.toLowerCase()) || p.productName.toLowerCase().includes(searchFilter.toLowerCase()))
                      .slice(0, 50)
                      .map((po, idx) => (
                        <tr key={po.poId ? `${po.poId}-${idx}` : `po-${idx}`} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-mono font-bold text-indigo-300">{po.poId}</td>
                          <td className="px-4 py-2.5 text-slate-200 font-medium">{po.productName} ({po.sku})</td>
                          <td className="px-4 py-2.5 text-slate-400">{po.supplierName}</td>
                          <td className="px-4 py-2.5 font-bold text-white">{po.quantity}</td>
                          <td className="px-4 py-2.5 text-slate-300">{formatINR(po.totalAmount)}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              po.status === 'DELAYED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {po.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-rose-400">{po.delayDays > 0 ? `+${po.delayDays}d` : '0d'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {selectedEntityForTable === 'SALES_ORDERS' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-slate-400 font-bold border-b border-slate-700 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Platform</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {supplyChainStore.salesOrders
                      .filter(s => !searchFilter || s.orderId.toLowerCase().includes(searchFilter.toLowerCase()) || s.sku.toLowerCase().includes(searchFilter.toLowerCase()))
                      .slice(0, 50)
                      .map((so, idx) => (
                        <tr key={so.orderId ? `${so.orderId}-${idx}` : `so-${idx}`} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-mono font-bold text-indigo-300">{so.orderId}</td>
                          <td className="px-4 py-2.5 text-slate-200 font-medium">{so.sku}</td>
                          <td className="px-4 py-2.5 font-bold text-white">{so.quantity}</td>
                          <td className="px-4 py-2.5 text-slate-400">{so.platform}</td>
                          <td className="px-4 py-2.5 text-slate-300">{formatINR(so.totalAmount)}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {so.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {selectedEntityForTable === 'SHIPMENTS' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-slate-400 font-bold border-b border-slate-700 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Shipment ID</th>
                      <th className="px-4 py-3">Carrier</th>
                      <th className="px-4 py-3">Origin / Dest</th>
                      <th className="px-4 py-3">Transit Time</th>
                      <th className="px-4 py-3">Freight Cost</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {supplyChainStore.shipments
                      .filter(s => !searchFilter || s.shipmentId.toLowerCase().includes(searchFilter.toLowerCase()) || s.carrierName.toLowerCase().includes(searchFilter.toLowerCase()))
                      .slice(0, 50)
                      .map((ship, idx) => (
                        <tr key={ship.shipmentId ? `${ship.shipmentId}-${idx}` : `ship-${idx}`} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-mono font-bold text-indigo-300">{ship.shipmentId}</td>
                          <td className="px-4 py-2.5 text-slate-200 font-medium">{ship.carrierName}</td>
                          <td className="px-4 py-2.5 text-slate-400">{ship.origin} → {ship.destination}</td>
                          <td className="px-4 py-2.5 text-slate-300">{ship.transitTimeDays}d</td>
                          <td className="px-4 py-2.5 text-slate-300">{formatINR(ship.freightCost)}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {ship.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {selectedEntityForTable === 'RETURNS' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-slate-400 font-bold border-b border-slate-700 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Return ID</th>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Root Cause</th>
                      <th className="px-4 py-3">Refund</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {supplyChainStore.returns
                      .filter(r => !searchFilter || r.returnId.toLowerCase().includes(searchFilter.toLowerCase()) || r.sku.toLowerCase().includes(searchFilter.toLowerCase()))
                      .slice(0, 50)
                      .map((ret, idx) => (
                        <tr key={ret.returnId ? `${ret.returnId}-${idx}` : `ret-${idx}`} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-mono font-bold text-indigo-300">{ret.returnId}</td>
                          <td className="px-4 py-2.5 text-slate-300">{ret.orderId}</td>
                          <td className="px-4 py-2.5 text-slate-200 font-medium">{ret.sku}</td>
                          <td className="px-4 py-2.5 text-amber-400">{ret.returnReason}</td>
                          <td className="px-4 py-2.5 text-slate-400">{ret.rootCauseCategory}</td>
                          <td className="px-4 py-2.5 text-slate-300">{formatINR(ret.refundAmount)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Raw Lake Ingestion Archives Table */}
      <div className="bg-slate-900/60 rounded-3xl border border-slate-700/60 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white">Immutable Data Lake Ingestion Archives</h3>
          </div>
          <span className="text-[11px] text-slate-400">{rawLakeFiles.length} Ingestion Batches Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-slate-400 font-bold border-b border-slate-700 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Ingestion ID</th>
                <th className="px-4 py-3">File / Source</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Records Ingested</th>
                <th className="px-4 py-3">SHA-256 Checksum</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rawLakeFiles.map((rf, idx) => (
                <tr key={rf.ingestionId ? `${rf.ingestionId}-${idx}` : `rf-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-300">{rf.ingestionId}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-200">{rf.fileName}</div>
                    <div className="text-[10px] text-slate-400">{rf.sourceName} • {rf.fileSizeKb} KB</div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-indigo-400">{rf.format}</td>
                  <td className="px-4 py-3 font-bold text-white">{rf.recordCount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400 truncate max-w-[140px]">{rf.checksum}</td>
                  <td className="px-4 py-3 text-slate-400">{rf.ingestedAt}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rf.status === 'STANDARDIZED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {rf.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
