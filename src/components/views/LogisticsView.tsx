import React, { useState, useMemo } from 'react';
import {
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  Plane,
  Ship,
  Navigation
} from 'lucide-react';
import { supplyChainStore } from '../../services/store';
import { formatINR } from '../../utils/formatters';

export const LogisticsView: React.FC = () => {
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const shipments = supplyChainStore.shipments;

  const stats = useMemo(() => {
    const inTransit = shipments.filter(s => s.status === 'IN_TRANSIT');
    const delayed = shipments.filter(s => s.status === 'DELAYED' || s.delayDaysEstimate > 0);
    const delivered = shipments.filter(s => s.status === 'DELIVERED');
    const otifRate = ((delivered.length / Math.max(1, shipments.length)) * 100).toFixed(1);

    return {
      total: shipments.length,
      inTransit: inTransit.length,
      delayed: delayed.length,
      otifRate
    };
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const matchSearch =
        s.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.carrierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.route.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCarrier = carrierFilter === 'ALL' || s.carrierName.includes(carrierFilter);
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchSearch && matchCarrier && matchStatus;
    });
  }, [shipments, searchQuery, carrierFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active In-Transit Loads</span>
          <p className="text-2xl font-light text-indigo-400 mt-1">{stats.inTransit}</p>
          <span className="text-xs text-indigo-400/80 mt-2 font-medium">Ocean, Air & Road</span>
        </div>

        <button
          onClick={() => setStatusFilter(statusFilter === 'DELAYED' ? 'ALL' : 'DELAYED')}
          className={`bg-slate-800/40 border rounded-3xl p-5 text-left flex flex-col justify-between transition-all ${
            statusFilter === 'DELAYED'
              ? 'border-rose-500/80 bg-rose-500/10 shadow-lg shadow-rose-500/10'
              : 'border-slate-700/40 hover:border-rose-500/40'
          }`}
        >
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Delayed / Risk Loads</span>
          <p className="text-2xl font-light text-rose-400 mt-1">{stats.delayed}</p>
          <span className="text-xs text-rose-400/80 mt-2 font-medium">Port & Customs Bottlenecks</span>
        </button>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logistics OTIF Rate</span>
          <p className="text-2xl font-light text-emerald-400 mt-1">{stats.otifRate}%</p>
          <span className="text-xs text-emerald-400/80 mt-2 font-medium">On-Time In-Full</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Shipments</span>
          <p className="text-2xl font-light text-white mt-1">{stats.total}</p>
          <span className="text-xs text-slate-400 mt-2 font-mono">TMS Live Telemetry</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/40 shadow-xl flex flex-wrap items-center justify-between gap-3 backdrop-blur-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px] bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/60">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            id="input-shipment-search"
            type="text"
            placeholder="Search by Shipment ID (e.g. SHP-10001), Carrier, or Route..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-hidden text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            id="select-carrier-filter"
            value={carrierFilter}
            onChange={e => setCarrierFilter(e.target.value)}
            className="text-xs p-2 bg-slate-900 border border-slate-700/60 rounded-xl text-slate-200 font-medium focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">All 3PL Logistics Partners</option>
            <option value="Delhivery">Delhivery Express</option>
            <option value="BlueDart">Blue Dart Express</option>
            <option value="Safexpress">Safexpress 3PL</option>
            <option value="Gati">Gati Logistics</option>
            <option value="DHL">DHL Express</option>
            <option value="FedEx">FedEx Freight</option>
          </select>

          <select
            id="select-shipment-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs p-2 bg-slate-900 border border-slate-700/60 rounded-xl text-slate-200 font-medium focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_TRANSIT">IN_TRANSIT</option>
            <option value="DELAYED">DELAYED</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-medium text-white">Live Shipment & Carrier Tracking Telemetry</h3>
          <span className="text-xs text-slate-400 font-mono">{filteredShipments.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Shipment ID</th>
                <th className="px-5 py-3.5">Carrier & Mode</th>
                <th className="px-5 py-3.5">Origin → Destination Route</th>
                <th className="px-5 py-3.5">ETA Date</th>
                <th className="px-5 py-3.5">Delay Risk</th>
                <th className="px-5 py-3.5">Freight Cost</th>
                <th className="px-5 py-3.5">Conditions / Signals</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredShipments.slice(0, 50).map((s, idx) => (
                <tr key={s.shipmentId ? `${s.shipmentId}-${idx}` : `shp-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-white">{s.shipmentId}</td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      {s.transportMode === 'Air' ? <Plane className="w-3.5 h-3.5 text-blue-400" /> : s.transportMode === 'Ocean' ? <Ship className="w-3.5 h-3.5 text-cyan-400" /> : <Truck className="w-3.5 h-3.5 text-indigo-400" />}
                      <span>{s.carrierName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{s.transportMode} • Driver: {s.driverContact}</div>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-300">{s.route}</td>
                  <td className="px-5 py-3 text-white font-mono">{s.eta}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-bold ${s.delayProbability > 50 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {s.delayProbability}%
                      </span>
                      {s.delayDaysEstimate > 0 && (
                        <span className="text-[10px] text-rose-400 font-mono">(+{s.delayDaysEstimate}d)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-white font-mono">{formatINR(s.freightCost)}</td>
                  <td className="px-5 py-3 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 font-mono border border-slate-700/60">{s.weatherCondition}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      s.status === 'DELAYED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : s.status === 'IN_TRANSIT'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {s.status}
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
