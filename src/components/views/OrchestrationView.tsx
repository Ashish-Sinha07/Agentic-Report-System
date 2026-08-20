import React, { useState } from 'react';
import {
  Layers,
  Play,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Database,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';
import { PipelineRun } from '../../types';

export const OrchestrationView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  const pipelineRuns = supplyChainStore.pipelineRuns;
  const currentRun = pipelineRuns[0];

  const handleTriggerPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < 11) {
        setActiveStepIndex(step);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setActiveStepIndex(-1);
        supplyChainStore.triggerFullPipelineRun();
      }
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Automated Pipeline Orchestration</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              11-Stage End-to-End Runner
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic data engineering, statistical modeling, forecasting, and AI synthesis execution graph
          </p>
        </div>

        <button
          id="btn-trigger-orchestrator"
          onClick={handleTriggerPipeline}
          disabled={isRunning}
          className={`px-4 py-2 text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-2 ${
            isRunning
              ? 'bg-indigo-400 text-white cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Executing Stage {activeStepIndex + 1}/11...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Trigger Pipeline Now</span>
            </>
          )}
        </button>
      </div>

      {/* 11 Pipeline Steps Visual Graph */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Pipeline Execution Stages</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {currentRun?.steps.map((step, idx) => {
            const isCurrentlyActive = isRunning && activeStepIndex === idx;
            const isCompleted = !isRunning || (isRunning && activeStepIndex > idx);

            return (
              <div
                key={step.stepNumber}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrentlyActive
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200'
                    : isCompleted
                    ? 'border-slate-200 bg-slate-50/70'
                    : 'border-slate-200 bg-white opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold text-indigo-600 font-mono">
                    STAGE {step.stepNumber}
                  </span>
                  {isCurrentlyActive ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900">{step.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{step.details}</p>

                <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Duration: {step.durationMs}ms</span>
                  <span className="font-semibold text-emerald-700">SUCCESS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
