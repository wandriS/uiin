import React, { useState } from 'react';
import {
  Layers,
  Thermometer,
  Shield,
  Truck,
  Box,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRightLeft,
  Search,
} from 'lucide-react';
import { BinSlot, SKUItem } from '../types/inventory';
import { formatNumber, getStatusMeta } from '../utils/formatters';

interface WarehouseFloorMapProps {
  bins: BinSlot[];
  skus: SKUItem[];
  onSelectSku: (sku: SKUItem) => void;
  onOpenTransferModal: (sku: SKUItem) => void;
}

export const WarehouseFloorMap: React.FC<WarehouseFloorMapProps> = ({
  bins,
  skus,
  onSelectSku,
  onOpenTransferModal,
}) => {
  const [selectedBinId, setSelectedBinId] = useState<string>('b-a03'); // Default to BIN A-14
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');

  const selectedBin = bins.find((b) => b.id === selectedBinId) || bins[0];

  // SKUs in selected bin
  const binSkus = skus.filter((s) => s.binLocation === selectedBin?.code);

  const aisles = [
    { id: 'Aisle A', name: 'Aisle A · High-Velocity Pick & Pack', zone: 'Zone A' },
    { id: 'Aisle B', name: 'Aisle B · Fluidics & Valves', zone: 'Zone B' },
    { id: 'Aisle C', name: 'Aisle C · Controlled Cleanroom & Optics', zone: 'Zone C' },
    { id: 'Aisle D', name: 'Aisle D · Hardware & Fasteners', zone: 'Zone D' },
    { id: 'Aisle E', name: 'Aisle E · Heavy Raw Materials', zone: 'Zone E' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Legend */}
      <div className="bg-white rounded border border-[#e2e8f0] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wide">
              Warehouse Alpha Spatial Floor Grid
            </h2>
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
              Live Bin Telemetry
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Click any physical rack slot to inspect stored SKU contents, capacity utilization, and thermal conditions.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-[#64748b] flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Optimal (&gt;40%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span>Low Stock (&lt;20%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500" />
            <span>Depleted / Empty</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500" />
            <span>Cold Storage</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Floor Map Layout (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white rounded border border-[#e2e8f0] p-4 shadow-xs flex flex-col justify-between">
          {/* Dock Area at top */}
          <div className="mb-4 pb-3 border-b border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#2563eb]" />
                <span>Inbound Receiving Dock Bays (North Wall)</span>
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">Bays Active · 2 Inbound</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'Bay 01', status: 'Available', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                { name: 'Bay 02 (Clean)', status: 'At Dock (PO-90241)', color: 'border-blue-300 bg-blue-50 text-blue-700' },
                { name: 'Bay 03 (Cold)', status: 'Scheduled 09:00', color: 'border-slate-200 bg-slate-50 text-slate-600' },
                { name: 'Bay 04 (Heavy)', status: 'ETA 14:00', color: 'border-amber-200 bg-amber-50 text-amber-700' },
              ].map((bay, idx) => (
                <div key={idx} className={`p-2 rounded border text-xs text-center font-medium ${bay.color}`}>
                  <div className="font-bold">{bay.name}</div>
                  <div className="text-[10px] truncate mt-0.5">{bay.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Aisles */}
          <div className="space-y-4">
            {aisles.map((aisle) => {
              const aisleBins = bins.filter((b) => b.aisle === aisle.id);

              return (
                <div key={aisle.id} className="p-3 bg-[#f8fafc] rounded border border-[#e2e8f0]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0f172a]">{aisle.name}</span>
                    <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-wide">
                      {aisle.zone}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {aisleBins.map((bin) => {
                      const isSelected = selectedBinId === bin.id;
                      const occupancyPct = Math.round((bin.currentUnits / bin.maxCapacityUnits) * 100);

                      let statusBg = 'bg-emerald-500';
                      if (bin.currentUnits === 0) statusBg = 'bg-rose-500';
                      else if (occupancyPct < 25) statusBg = 'bg-amber-500';

                      return (
                        <button
                          key={bin.id}
                          onClick={() => setSelectedBinId(bin.id)}
                          className={`p-2 rounded text-left transition-all border relative flex flex-col justify-between ${
                            isSelected
                              ? 'bg-white border-[#2563eb] shadow-md ring-2 ring-[#93c5fd]'
                              : 'bg-white border-[#cbd5e1] hover:border-[#94a3b8]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-xs font-bold text-[#0f172a]">
                              {bin.code}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${statusBg}`} />
                          </div>

                          <div className="text-[10px] text-[#64748b] tabular-nums font-mono">
                            {bin.currentUnits} / {bin.maxCapacityUnits} u
                          </div>

                          {/* Mini Progress */}
                          <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full ${statusBg}`}
                              style={{ width: `${Math.min(100, occupancyPct)}%` }}
                            />
                          </div>

                          {bin.temperatureType === 'COLD' && (
                            <div className="mt-1 flex items-center gap-0.5 text-[9px] text-blue-600 font-semibold">
                              <Thermometer className="w-2.5 h-2.5" /> -18°C
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Staging / Outbound Buffer at bottom */}
          <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#0f172a]">Outbound Marshalling Area:</span>
              <span>Lanes 1-8 Clear · Ready for Dispatch</span>
            </div>
            <span className="font-mono text-[11px] text-[#2563eb]">Capacity: 84% Available</span>
          </div>
        </div>

        {/* Selected Bin Inspector Panel (1 col) */}
        <div className="bg-white rounded border border-[#e2e8f0] p-4 shadow-xs flex flex-col">
          <div className="pb-3 border-b border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                {selectedBin.code}
              </span>
              <span className="text-xs font-semibold text-[#64748b]">{selectedBin.zone}</span>
            </div>
            <h3 className="text-sm font-bold text-[#0f172a] mt-2">
              Physical Rack Slot Detail
            </h3>
            <p className="text-xs text-[#64748b]">
              {selectedBin.aisle} · Level {selectedBin.level}
            </p>
          </div>

          {/* Bin Stats */}
          <div className="py-4 space-y-3 border-b border-[#e2e8f0] text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#64748b]">Occupancy:</span>
              <span className="font-bold text-[#0f172a] tabular-nums font-mono">
                {selectedBin.currentUnits} of {selectedBin.maxCapacityUnits} units (
                {Math.round((selectedBin.currentUnits / selectedBin.maxCapacityUnits) * 100)}%)
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  selectedBin.currentUnits === 0
                    ? 'bg-rose-500'
                    : selectedBin.currentUnits < selectedBin.maxCapacityUnits * 0.25
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((selectedBin.currentUnits / selectedBin.maxCapacityUnits) * 100)
                  )}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748b]">Environment / Class:</span>
              <span className="font-semibold text-[#0f172a] flex items-center gap-1">
                {selectedBin.temperatureType === 'COLD' ? (
                  <>
                    <Thermometer className="w-3.5 h-3.5 text-blue-500" /> Cold Storage (-18°C)
                  </>
                ) : selectedBin.temperatureType === 'HIGH_SECURITY' ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-purple-500" /> High Security Cleanroom
                  </>
                ) : (
                  'Standard Ambient'
                )}
              </span>
            </div>
          </div>

          {/* Assigned SKUs in this bin */}
          <div className="flex-1 py-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2.5">
              Assigned Items in {selectedBin.code}
            </h4>

            {binSkus.length === 0 ? (
              <div className="p-4 rounded border border-dashed border-slate-200 text-center text-xs text-[#94a3b8] italic">
                This bin is currently empty. Ready for inbound allocation.
              </div>
            ) : (
              <div className="space-y-2.5">
                {binSkus.map((sku) => {
                  const statusMeta = getStatusMeta(sku.status);
                  return (
                    <div
                      key={sku.id}
                      onClick={() => onSelectSku(sku)}
                      className="p-3 bg-[#f8fafc] rounded border border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-white transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-xs font-bold text-[#2563eb]">
                          {sku.sku}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#0f172a] line-clamp-1 group-hover:text-[#2563eb]">
                        {sku.name}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#64748b] mt-1.5">
                        <span className="tabular-nums font-mono">
                          Count: <strong>{sku.quantityOnHand}</strong> units
                        </span>
                        <span className="font-mono text-[#059669]">
                          ${(sku.quantityOnHand * sku.unitCost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bin action */}
          <div className="pt-3 border-t border-[#e2e8f0]">
            {binSkus.length > 0 && (
              <button
                onClick={() => onOpenTransferModal(binSkus[0])}
                className="w-full py-2 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Relocate / Transfer SKU</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
