import React from 'react';
import {
  Layers,
  ArrowRightLeft,
  Barcode,
  Plus,
  Minus,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { SKUItem } from '../types/inventory';
import { formatCurrency, formatNumber, getStatusMeta } from '../utils/formatters';

interface BinCardViewProps {
  items: SKUItem[];
  onSelectSku: (sku: SKUItem) => void;
  onQuickAdjustStock: (sku: SKUItem, delta: number) => void;
  onOpenTransferModal: (sku: SKUItem) => void;
  onOpenBarcodeModal: (sku: SKUItem) => void;
}

export const BinCardView: React.FC<BinCardViewProps> = ({
  items,
  onSelectSku,
  onQuickAdjustStock,
  onOpenTransferModal,
  onOpenBarcodeModal,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
      {items.map((item) => {
        const statusMeta = getStatusMeta(item.status);
        const capacityPct = Math.min(
          100,
          Math.round((item.quantityOnHand / item.maxCapacity) * 100)
        );

        return (
          <div
            key={item.id}
            onClick={() => onSelectSku(item)}
            className="bg-white rounded border border-[#e2e8f0] p-4 flex flex-col justify-between hover:border-[#cbd5e1] hover:shadow-md transition-all cursor-pointer group shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]"
          >
            {/* Header: Bin Location & Status */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#1e293b] bg-[#f1f5f9] border border-[#e2e8f0] px-2 py-0.5 rounded">
                  <Layers className="w-3.5 h-3.5 text-[#2563eb]" />
                  {item.binLocation}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full border ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                  {statusMeta.label}
                </span>
              </div>

              {/* SKU & Name */}
              <div className="font-mono text-xs font-bold text-[#2563eb] group-hover:text-[#1d4ed8]">
                {item.sku}
              </div>
              <h3 className="text-sm font-semibold text-[#0f172a] mt-1 line-clamp-2 leading-snug">
                {item.name}
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">{item.category}</p>
            </div>

            {/* Metrics & Storage Capacity */}
            <div className="my-3 pt-3 border-t border-[#f1f5f9]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#64748b]">Bin Occupancy:</span>
                <span className="font-bold text-[#0f172a] tabular-nums">
                  {formatNumber(item.quantityOnHand)}{' '}
                  <span className="font-normal text-[#94a3b8]">/ {item.maxCapacity} units</span>
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.quantityOnHand === 0
                      ? 'bg-rose-500'
                      : item.quantityOnHand <= item.minThreshold
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748b] mt-2">
                <span>Unit: {formatCurrency(item.unitCost)}</span>
                <span>Val: {formatCurrency(item.quantityOnHand * item.unitCost)}</span>
              </div>
            </div>

            {/* Card Actions Footer */}
            <div
              className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onQuickAdjustStock(item, -1)}
                  disabled={item.quantityOnHand <= 0}
                  className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-[#0f172a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Deduct 1 unit"
                  aria-label={`Deduct 1 unit from ${item.sku}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-xs font-bold tabular-nums text-[#0f172a]">
                  {item.quantityOnHand}
                </span>
                <button
                  onClick={() => onQuickAdjustStock(item, 1)}
                  className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-[#0f172a] transition-colors"
                  title="Add 1 unit"
                  aria-label={`Add 1 unit to ${item.sku}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenTransferModal(item)}
                  className="p-1.5 rounded text-[#475569] hover:text-[#2563eb] hover:bg-blue-50 border border-[#e2e8f0] transition-colors"
                  title="Relocate Bin"
                  aria-label={`Transfer bin for ${item.sku}`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenBarcodeModal(item)}
                  className="p-1.5 rounded text-[#475569] hover:text-[#2563eb] hover:bg-blue-50 border border-[#e2e8f0] transition-colors"
                  title="Barcode Label"
                  aria-label={`Barcode label for ${item.sku}`}
                >
                  <Barcode className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSelectSku(item)}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
