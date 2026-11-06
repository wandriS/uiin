import React, { useState } from 'react';
import { X, ArrowRightLeft, Layers, CheckCircle2 } from 'lucide-react';
import { SKUItem, BinSlot } from '../types/inventory';

interface TransferBinModalProps {
  sku: SKUItem | null;
  bins: BinSlot[];
  onClose: () => void;
  onConfirmTransfer: (sku: SKUItem, targetBinCode: string, qty: number, reason: string) => void;
}

export const TransferBinModal: React.FC<TransferBinModalProps> = ({
  sku,
  bins,
  onClose,
  onConfirmTransfer,
}) => {
  if (!sku) return null;

  const [targetBin, setTargetBin] = useState<string>(
    bins.find((b) => b.code !== sku.binLocation)?.code || 'BIN B-09'
  );
  const [transferQty, setTransferQty] = useState<number>(sku.quantityOnHand);
  const [reason, setReason] = useState<string>('Pick velocity consolidation');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBin || targetBin === sku.binLocation) return;
    onConfirmTransfer(sku, targetBin, transferQty, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div
        className="bg-white rounded-lg border border-[#cbd5e1] max-w-md w-full p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-[#e2e8f0]">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#2563eb] font-bold">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>BIN RELOCATION TRANSFER</span>
            </div>
            <h3 className="text-sm font-bold text-[#0f172a] mt-0.5">{sku.sku}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="bg-[#f8fafc] p-3 rounded border border-[#e2e8f0]">
            <span className="text-[#64748b] block text-[11px]">Item Description</span>
            <span className="font-semibold text-[#0f172a] block mt-0.5">{sku.name}</span>
            <div className="flex items-center justify-between text-[11px] text-[#64748b] mt-2 pt-2 border-t border-slate-200">
              <span>
                Current Location: <strong className="font-mono text-[#0f172a]">{sku.binLocation}</strong>
              </span>
              <span>
                Stock: <strong className="font-mono text-[#0f172a]">{sku.quantityOnHand} units</strong>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
              Destination Target Bin
            </label>
            <select
              value={targetBin}
              onChange={(e) => setTargetBin(e.target.value)}
              className="w-full bg-[#f8fafc] text-xs font-mono font-bold text-[#0f172a] border border-[#cbd5e1] rounded px-3 py-2 focus:outline-none focus:border-[#2563eb]"
            >
              {bins
                .filter((b) => b.code !== sku.binLocation)
                .map((b) => (
                  <option key={b.id} value={b.code}>
                    {b.code} ({b.zone} · {b.currentUnits}/{b.maxCapacityUnits} units)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
              Quantity to Relocate
            </label>
            <input
              type="number"
              min="1"
              max={sku.quantityOnHand || 1}
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
              className="w-full bg-[#f8fafc] text-xs font-mono font-bold text-[#0f172a] border border-[#cbd5e1] rounded px-3 py-2 focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
              Relocation Purpose / Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#f8fafc] text-xs text-[#0f172a] border border-[#cbd5e1] rounded px-3 py-2 focus:outline-none focus:border-[#2563eb]"
            >
              <option value="Pick velocity consolidation">Pick velocity consolidation</option>
              <option value="Thermal / cleanroom zone compliance">Thermal / cleanroom zone compliance</option>
              <option value="Pallet overflow rebalance">Pallet overflow rebalance</option>
              <option value="Aisle maintenance relocation">Aisle maintenance relocation</option>
              <option value="Production cell staging">Production cell staging</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 font-semibold text-[#64748b] hover:text-[#0f172a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Relocation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
