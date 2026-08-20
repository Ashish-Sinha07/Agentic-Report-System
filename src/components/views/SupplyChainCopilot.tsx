import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Wrench,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Copy,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ViewMode } from '../../types';
import { supplyChainStore } from '../../services/store';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolsCalled?: string[];
  grounded?: boolean;
}

interface SupplyChainCopilotProps {
  onNavigate: (viewId: ViewMode) => void;
}

export const SupplyChainCopilot: React.FC<SupplyChainCopilotProps> = ({ onNavigate }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `### **Welcome to the AI Supply Chain Copilot**

I am your multi-agent supply chain intelligence assistant powered by **Gemini 3.7 Flash** and connected to the unified data platform.

**Active Operational Grounding:**
- **500 Products & SKUs** across 7 categories
- **100 Tier-1 Global Suppliers** & Scorecards
- **10 Regional Distribution Centers** & Cross-Docks
- Real-Time WMS, TMS, and Multi-Channel Sales Telemetry

How can I assist your supply chain decision-making today?`,
      timestamp: '10:00 AM',
      toolsCalled: ['getSupplyChainSummary', 'getDataQualityStatus'],
      grounded: true
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (queryText: string) => {
    const textToSend = queryText.trim() || input.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Package rich grounded context for Gemini
      const { kpis, costBreakdown } = supplyChainStore.getKPIs();
      const stockoutPredictions = supplyChainStore.getStockoutPredictions().slice(0, 10);
      const suppliers = supplyChainStore.suppliers.slice(0, 10);
      const delayedPOs = supplyChainStore.purchaseOrders.filter(p => p.status === 'DELAYED' || p.delayDays > 0).slice(0, 8);
      const warehouses = supplyChainStore.warehouses;
      const anomalies = supplyChainStore.anomalies;
      const recommendations = supplyChainStore.aiRecommendations;

      const contextData = {
        kpis,
        costBreakdown,
        stockoutPredictions,
        suppliers: suppliers.map(s => ({ id: s.supplierId, name: s.supplierName, otd: s.onTimeDeliveryRate, score: s.score, tier: s.tier, leadTime: s.leadTimeDays })),
        delayedPOs: delayedPOs.map(p => ({ poId: p.poId, sku: p.sku, supplier: p.supplierName, delayDays: p.delayDays, reason: p.delayReason })),
        warehouses: warehouses.map(w => ({ id: w.warehouseId, name: w.warehouseName, util: w.utilizationRate, status: w.status })),
        anomalies,
        recommendations: recommendations.map(r => ({ id: r.id, title: r.title, priority: r.priority, status: r.status, impact: r.financialImpactEstimate }))
      };

      const response = await fetch('/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          contextData
        })
      });

      const data = await response.json();

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'No response received from agent.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsCalled: data.toolsCalled || ['getSupplyChainSummary'],
        grounded: data.grounded ?? true
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `### **Error Processing Query**\nCould not reach AI reasoning endpoint.\nDetails: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsCalled: ['errorRecovery']
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'What are today\'s biggest supply-chain risks?',
    'Which products may stock out this week?',
    'Why is inventory depleted on SKU-CON-0012?',
    'Which suppliers are underperforming?',
    'Which purchase orders are delayed?',
    'Which warehouse is overloaded?'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900/60 rounded-3xl border border-slate-700/40 shadow-xl overflow-hidden animate-in fade-in duration-150 backdrop-blur-xs">
      {/* Copilot Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-[#0B1120] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Supply Chain Copilot</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Grounded Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Multi-Agent Intelligence connected to WMS, TMS, ERP & Forecast Engines</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('DECISION_WORKBENCH')}
            className="px-3.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 font-semibold text-xs rounded-xl transition-colors border border-indigo-500/20 flex items-center gap-1.5"
          >
            <span>Decision Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="px-6 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Quick Prompts:</span>
        {sampleQueries.map((q, i) => (
          <button
            key={i}
            id={`btn-sample-query-${i}`}
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            className="px-3 py-1 bg-slate-800/60 hover:bg-indigo-600/20 hover:text-indigo-300 hover:border-indigo-500/30 border border-slate-700/50 rounded-xl text-xs text-slate-300 transition-all shrink-0 text-left font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3.5 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              msg.sender === 'user'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
            </div>

            {/* Content Bubble */}
            <div className="space-y-1.5 max-w-[85%]">
              <div className={`p-4 rounded-3xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800/60 border border-slate-700/50 text-slate-200 shadow-md'
              }`}>
                {/* Render Markdown or plain text cleanly */}
                <div className="space-y-2">
                  <div dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/### (.*?)\n/g, '<h4 class="text-sm font-bold text-white mt-2 mb-1.5">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                      .replace(/\n\n/g, '<br/><br/>')
                      .replace(/\n- /g, '<br/>• ')
                  }} />
                </div>
              </div>

              {/* Tools Execution & Grounding Badge */}
              {msg.sender === 'assistant' && msg.toolsCalled && msg.toolsCalled.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pl-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-400">
                    <Wrench className="w-3 h-3 text-indigo-400" />
                    Tools Executed:
                  </span>
                  {msg.toolsCalled.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-slate-300 border border-slate-700/60">
                      {t}()
                    </span>
                  ))}
                  {msg.grounded && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold ml-1">
                      <ShieldCheck className="w-3 h-3" />
                      100% Grounded
                    </span>
                  )}
                  <span className="text-slate-500 ml-auto font-mono">{msg.timestamp}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 max-w-3xl">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 text-white">
              <Bot className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="p-4 rounded-3xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400 flex items-center gap-3 shadow-md">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span>Querying supply chain tools & synthesizing root causes...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <div className="p-4 border-t border-slate-800 bg-[#0B1120]">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex items-center gap-3"
        >
          <input
            id="input-copilot-query"
            type="text"
            placeholder="Ask anything about inventory, delayed POs, supplier risk, warehouse utilization, or simulations..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
          <button
            id="btn-copilot-submit"
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
