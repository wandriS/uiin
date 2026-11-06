import React, { useState } from 'react';
import {
  X,
  Layers,
  ArrowRightLeft,
  Barcode,
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Mail,
  Phone,
  Printer,
  History,
  Scale,
  Maximize2,
} from 'lucide-react';
import { SKUItem, StockMovement } from '../types/inventory';
import { formatCurrency, formatNumber, getStatusMeta, BarcodeSVG, QRCodeSVG } from '../utils/formatters';

interface SkuDetailDrawerProps {
  sku: SKUItem | null;
  onClose: () => void;
  onAdjustStock: (sku: SKUItem, newQty: number, reason: string) => void;
  onOpenTransferModal: (sku: SKUItem) => void;
  movements: StockMovement[];
  onTriggerReorder: (sku: SKUItem) => void;
}

export const SkuDetailDrawer: React.FC<SkuDetailDrawerProps> = ({
  sku,
  onClose,
  onAdjustStock,
  onOpenTransferModal,
  movements,
  onTriggerReorder,
}) => {
  if (!sku) return null;

  const [adjustQtyInput, setAdjustQtyInput] = useState<number>(sku.quantityOnHand);
  const [reasonCode, setReasonCode] = useState<string>('Cycle Count Reconciliation');
  const [adjustSuccess, setAdjustSuccess] = useState<boolean>(false);

  // Filter movements for this SKU
  const skuMovements = movements.filter((m) => m.sku === sku.sku);
  const statusMeta = getStatusMeta(sku.status);

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    onAdjustStock(sku, adjustQtyInput, reasonCode);
    setAdjustSuccess(true);
    setTimeout(() => setAdjustSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-[#cbd5e1] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {sku.sku}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full border ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
            </div>
            <h2 className="text-base font-bold text-[#0f172a] leading-tight">{sku.name}</h2>
            <div className="text-xs text-[#64748b] mt-1 flex items-center gap-2">
              <span>{sku.category}</span>
              <span>·</span>
              <span>{sku.warehouseName}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#64748b] hover:text-[#0f172a] hover:bg-slate-200 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Barcode & QR Code Section */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full flex flex-col items-center sm:items-start">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Logistics Barcode (Code 128)
              </span>
              <div className="bg-white p-3 rounded border border-slate-200 w-full max-w-[280px]">
                <BarcodeSVG value={sku.barcode} height={38} />
              </div>
            </div>

            <div className="flex flex-col items-center shrink-0">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Direct Bin QR
              </span>
              <QRCodeSVG value={`${sku.sku}:${sku.binLocation}`} size={76} />
            </div>
          </div>

          {/* Quick Stock Adjustment Tool */}
          <div className="bg-white rounded border border-[#cbd5e1] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#2563eb]" />
                <span>Adjust Physical Count</span>
              </h3>
              <span className="text-xs text-[#64748b]">
                Current:{' '}
                <strong className="text-[#0f172a] tabular-nums font-mono">
                  {sku.quantityOnHand} units
                </strong>
              </span>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                    New Count
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setAdjustQtyInput(Math.max(0, adjustQtyInput - 1))}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-l text-xs font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={adjustQtyInput}
                      onChange={(e) => setAdjustQtyInput(Number(e.target.value))}
                      className="w-full text-center border-y border-slate-300 py-1.5 text-xs font-bold font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setAdjustQtyInput(adjustQtyInput + 1)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-r text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                    Audit Reason
                  </label>
                  <select
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value)}
                    className="w-full bg-[#f8fafc] text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#2563eb]"
                  >
                    <option value="Cycle Count Reconciliation">Cycle Count Reconciliation</option>
                    <option value="Damaged / Scrap Write-Off">Damaged / Scrap Write-Off</option>
                    <option value="Floor Assembly Issue">Floor Assembly Issue</option>
                    <option value="Customer Return Restock">Customer Return Restock</option>
                    <option value="Supervisor Manual Override">Supervisor Manual Override</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#64748b]">
                  Delta:{' '}
                  <strong
                    className={`tabular-nums font-mono ${
                      adjustQtyInput - sku.quantityOnHand >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {adjustQtyInput - sku.quantityOnHand >= 0 ? '+' : ''}
                    {adjustQtyInput - sku.quantityOnHand} units
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  {adjustSuccess && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Updated!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded transition-colors shadow-xs"
                  >
                    Commit Adjustment
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Location & Specs Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2.5">
              Storage & Specification
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0]">
                <span className="text-[#64748b] block text-[11px]">Assigned Bin</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono font-bold text-[#0f172a]">{sku.binLocation}</span>
                  <button
                    onClick={() => onOpenTransferModal(sku)}
                    className="text-[11px] text-[#2563eb] hover:underline flex items-center gap-0.5"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    Move
                  </button>
                </div>
              </div>

              <div className="bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0]">
                <span className="text-[#64748b] block text-[11px]">Safety Min / Max</span>
                <span className="font-mono font-bold text-[#0f172a] mt-0.5 block tabular-nums">
                  {sku.minThreshold} min / {sku.maxCapacity} max
                </span>
              </div>

              <div className="bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0]">
                <span className="text-[#64748b] block text-[11px]">Unit Weight</span>
                <span className="font-bold text-[#0f172a] mt-0.5 block">{sku.weightKg} kg</span>
              </div>

              <div className="bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0]">
                <span className="text-[#64748b] block text-[11px]">Physical Dimensions</span>
                <span className="font-bold text-[#0f172a] mt-0.5 block truncate">
                  {sku.dimensions}
                </span>
              </div>

              <div className="bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0]">
                <span className="text-[#64748b] block text-[11px]">Cost Basis</span>
                <span className="font-bold text-[#0f172a] mt-0.5 block tabular-nums">
                  {formatCurrency(sku.unitCost)}
                </span>
              </div>

              <div className="bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0]">
                <span className="text-[#64748b] block text-[11px]">Extended Value</span>
                <span className="font-bold text-[#059669] mt-0.5 block tabular-nums">
                  {formatCurrency(sku.quantityOnHand * sku.unitCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier & Procurement */}
          <div className="bg-white rounded border border-[#e2e8f0] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#2563eb]" />
                <span>Primary Supplier</span>
              </h3>
              <span className="text-[11px] font-semibold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Lead Time: {sku.supplier.leadTimeDays} days
              </span>
            </div>

            <p className="text-xs font-semibold text-[#0f172a]">{sku.supplier.name}</p>
            <div className="mt-1.5 space-y-1 text-xs text-[#64748b]">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{sku.supplier.contactEmail}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{sku.supplier.phone}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between">
              <span className="text-[11px] text-[#64748b]">
                Standard Reorder Qty:{' '}
                <strong className="text-[#0f172a]">{sku.reorderQuantity} units</strong>
              </span>
              <button
                onClick={() => onTriggerReorder(sku)}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
              >
                Create PO Draft
              </button>
            </div>
          </div>

          {/* Audit History Log for SKU */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2.5 flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#64748b]" />
              <span>SKU Movement History</span>
            </h3>

            {skuMovements.length === 0 ? (
              <div className="text-xs text-[#94a3b8] italic p-3 bg-[#f8fafc] rounded border border-slate-200 text-center">
                No recent stock transfers or movements logged for this SKU.
              </div>
            ) : (
              <div className="space-y-2">
                {skuMovements.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 bg-[#f8fafc] rounded border border-[#e2e8f0] text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0f172a] uppercase text-[11px]">
                          {m.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-[#94a3b8] font-mono">{m.referenceDoc}</span>
                      </div>
                      <p className="text-[#64748b] text-[11px] mt-0.5">{m.reason}</p>
                      <span className="text-[10px] text-[#94a3b8] block mt-1">
                        By {m.operatorName} · {m.timestamp}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono font-bold text-xs tabular-nums ${
                          m.deltaQuantity >= 0 ? 'text-[#059669]' : 'text-[#e11d48]'
                        }`}
                      >
                        {m.deltaQuantity >= 0 ? '+' : ''}
                        {m.deltaQuantity}
                      </span>
                      <span className="block text-[10px] text-[#94a3b8] font-mono tabular-nums">
                        {m.newQuantity} on hand
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#334155] bg-white border border-[#cbd5e1] rounded hover:bg-[#f8fafc] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Bin Label</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
