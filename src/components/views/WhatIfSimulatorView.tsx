import React, { useState, useMemo } from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Calculator
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';
import { runSupplyChainSimulation } from '../../analytics/simulationEngine';
import { SimulationParams } from '../../types';
import { LogicInspectorModal } from '../common/LogicInspectorModal';
import { formatINR } from '../../utils/formatters';

export const WhatIfSimulatorView: React.FC = () => {
  const { kpis } = supplyChainStore.getKPIs();
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const [params, setParams] = useState<SimulationParams>({
    demandChangePercent: 20,
    supplierLeadTimeDeltaDays: 5,
    supplierCostChangePercent: 0,
    transportationCostChangePercent: 10,
    safetyStockMultiplier: 1.0,
    warehouseCapacityChangePercent: 0
  });

  const simResult = useMemo(() => {
    return runSupplyChainSimulation(kpis, params);
  }, [kpis, params]);

  const handleReset = () => {
    setParams({
      demandChangePercent: 0,
      supplierLeadTimeDeltaDays: 0,
      supplierCostChangePercent: 0,
      transportationCostChangePercent: 0,
      safetyStockMultiplier: 1.0,
      warehouseCapacityChangePercent: 0
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white">What-If Scenario Simulation Engine</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
              Digital Twin Simulator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate parameter shocks (demand surges, supplier lead time delays, fuel inflation) to stress-test your supply network
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-inspect-sim-math"
            onClick={() => setIsInspectorOpen(true)}
            className="px-4 py-2 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inspect Math & Formulas</span>
          </button>

          <button
            id="btn-sim-reset"
            onClick={handleReset}
            className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </div>

      {/* Simulator Control Sliders Grid */}
      <div className="p-6 sm:p-8 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-6">
        <h3 className="text-base font-medium text-white">Scenario Parameter Controls</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Demand Surge Slider */}
          <div className="space-y-2.5 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Demand Shock:</span>
              <span className={`font-bold font-mono ${params.demandChangePercent > 0 ? 'text-indigo-400' : params.demandChangePercent < 0 ? 'text-blue-400' : 'text-white'}`}>
                {params.demandChangePercent > 0 ? `+${params.demandChangePercent}%` : `${params.demandChangePercent}%`}
              </span>
            </div>
            <input
              id="slider-demand"
              type="range"
              min="-50"
              max="100"
              step="5"
              value={params.demandChangePercent}
              onChange={e => setParams({ ...params, demandChangePercent: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-50% (Slump)</span>
              <span>0% (Base)</span>
              <span>+100% (Surge)</span>
            </div>
          </div>

          {/* Supplier Lead Time Slider */}
          <div className="space-y-2.5 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Supplier Lead Time Delta:</span>
              <span className={`font-bold font-mono ${params.supplierLeadTimeDeltaDays > 0 ? 'text-rose-400' : params.supplierLeadTimeDeltaDays < 0 ? 'text-emerald-400' : 'text-white'}`}>
                {params.supplierLeadTimeDeltaDays > 0 ? `+${params.supplierLeadTimeDeltaDays} Days` : `${params.supplierLeadTimeDeltaDays} Days`}
              </span>
            </div>
            <input
              id="slider-lead-time"
              type="range"
              min="-5"
              max="30"
              step="1"
              value={params.supplierLeadTimeDeltaDays}
              onChange={e => setParams({ ...params, supplierLeadTimeDeltaDays: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-5d (Expedite)</span>
              <span>0d (Base)</span>
              <span>+30d (Disruption)</span>
            </div>
          </div>

          {/* Transportation / Freight Cost */}
          <div className="space-y-2.5 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Freight & Logistics Cost:</span>
              <span className={`font-bold font-mono ${params.transportationCostChangePercent > 0 ? 'text-amber-400' : 'text-white'}`}>
                {params.transportationCostChangePercent > 0 ? `+${params.transportationCostChangePercent}%` : `${params.transportationCostChangePercent}%`}
              </span>
            </div>
            <input
              id="slider-freight-cost"
              type="range"
              min="-30"
              max="60"
              step="5"
              value={params.transportationCostChangePercent}
              onChange={e => setParams({ ...params, transportationCostChangePercent: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-30%</span>
              <span>0% (Standard)</span>
              <span>+60% (Surcharges)</span>
            </div>
          </div>

          {/* Supplier Unit Cost Inflation */}
          <div className="space-y-2.5 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Raw Material / Supplier Cost:</span>
              <span className={`font-bold font-mono ${params.supplierCostChangePercent > 0 ? 'text-amber-400' : 'text-white'}`}>
                {params.supplierCostChangePercent > 0 ? `+${params.supplierCostChangePercent}%` : `${params.supplierCostChangePercent}%`}
              </span>
            </div>
            <input
              id="slider-supplier-cost"
              type="range"
              min="-20"
              max="40"
              step="2"
              value={params.supplierCostChangePercent}
              onChange={e => setParams({ ...params, supplierCostChangePercent: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-20%</span>
              <span>0%</span>
              <span>+40% (Inflation)</span>
            </div>
          </div>

          {/* Safety Stock Multiplier */}
          <div className="space-y-2.5 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Safety Stock Multiplier:</span>
              <span className="font-bold font-mono text-indigo-400">
                {params.safetyStockMultiplier}x
              </span>
            </div>
            <input
              id="slider-safety-stock"
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={params.safetyStockMultiplier}
              onChange={e => setParams({ ...params, safetyStockMultiplier: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5x (Lean)</span>
              <span>1.0x (Current)</span>
              <span>2.5x (Buffer)</span>
            </div>
          </div>

          {/* Warehouse Capacity Delta */}
          <div className="space-y-2.5 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Warehouse Capacity Delta:</span>
              <span className={`font-bold font-mono ${params.warehouseCapacityChangePercent > 0 ? 'text-emerald-400' : params.warehouseCapacityChangePercent < 0 ? 'text-rose-400' : 'text-white'}`}>
                {params.warehouseCapacityChangePercent > 0 ? `+${params.warehouseCapacityChangePercent}%` : `${params.warehouseCapacityChangePercent}%`}
              </span>
            </div>
            <input
              id="slider-warehouse-cap"
              type="range"
              min="-40"
              max="40"
              step="5"
              value={params.warehouseCapacityChangePercent}
              onChange={e => setParams({ ...params, warehouseCapacityChangePercent: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-40% (Closure)</span>
              <span>0%</span>
              <span>+40% (Expansion)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Stockout Incidents */}
        <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stockout Exposure</span>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500">Base: </span>
              <span className="font-bold text-slate-300 font-mono">{simResult.baseline.stockoutCount}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div>
              <span className="text-xs text-slate-500">Sim: </span>
              <span className={`text-xl font-light font-mono ${simResult.simulated.stockoutCount > simResult.baseline.stockoutCount ? 'text-rose-400' : 'text-emerald-400'}`}>
                {simResult.simulated.stockoutCount} SKUs
              </span>
            </div>
          </div>
          <p className={`text-xs font-mono font-medium ${simResult.deltas.stockoutCountDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {simResult.deltas.stockoutCountDelta > 0 ? `+${simResult.deltas.stockoutCountDelta} risk SKUs` : `${simResult.deltas.stockoutCountDelta} risk SKUs`}
          </p>
        </div>

        {/* Metric 2: Service Level OTIF */}
        <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service Level (OTIF %)</span>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500">Base: </span>
              <span className="font-bold text-slate-300 font-mono">{simResult.baseline.serviceLevelOtif}%</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div>
              <span className="text-xs text-slate-500">Sim: </span>
              <span className={`text-xl font-light font-mono ${simResult.simulated.serviceLevelOtif < simResult.baseline.serviceLevelOtif ? 'text-rose-400' : 'text-emerald-400'}`}>
                {simResult.simulated.serviceLevelOtif}%
              </span>
            </div>
          </div>
          <p className={`text-xs font-mono font-medium ${simResult.deltas.serviceLevelDelta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {simResult.deltas.serviceLevelDelta > 0 ? `+${simResult.deltas.serviceLevelDelta}%` : `${simResult.deltas.serviceLevelDelta}%`}
          </p>
        </div>

        {/* Metric 3: Total Supply Chain Cost */}
        <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Landed Cost</span>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500">Base: </span>
              <span className="font-bold text-slate-300 font-mono">{formatINR(simResult.baseline.totalCost)}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div>
              <span className="text-xs text-slate-500">Sim: </span>
              <span className="text-xl font-light text-white font-mono">
                {formatINR(simResult.simulated.totalCost)}
              </span>
            </div>
          </div>
          <p className={`text-xs font-mono font-medium ${simResult.deltas.totalCostDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {simResult.deltas.totalCostDelta > 0 ? `+${formatINR(simResult.deltas.totalCostDelta)} Delta` : `-${formatINR(Math.abs(simResult.deltas.totalCostDelta))} Savings`}
          </p>
        </div>

        {/* Metric 4: Days of Supply */}
        <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Days of Inventory Supply</span>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500">Base: </span>
              <span className="font-bold text-slate-300 font-mono">{simResult.baseline.averageDaysSupply}d</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div>
              <span className="text-xs text-slate-500">Sim: </span>
              <span className="text-xl font-light text-white font-mono">
                {simResult.simulated.averageDaysSupply}d
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Buffer coverage across 500 SKUs
          </p>
        </div>
      </div>

      {/* AI Simulation Synthesis Box */}
      <div className="p-6 sm:p-8 bg-slate-800/40 rounded-3xl border border-slate-700/40 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-medium text-white">AI Stress-Test Findings & Prescribed Mitigations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 bg-slate-900/60 rounded-2xl border border-amber-500/30 space-y-2.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Identified Network Bottlenecks</span>
            <ul className="space-y-1.5 text-slate-300">
              {simResult.impactAnalysis.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-slate-900/60 rounded-2xl border border-emerald-500/30 space-y-2.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Recommended Adaptive Strategy</span>
            <ul className="space-y-1.5 text-slate-300">
              {simResult.suggestedMitigations.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Operations Research & Math Inspector Modal */}
      <LogicInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        initialTopic="SIMULATION_SHOCK_PROPAGATION"
      />
    </div>
  );
};
