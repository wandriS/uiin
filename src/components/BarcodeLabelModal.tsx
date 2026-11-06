import React from 'react';
import { X, Printer, Barcode, Check } from 'lucide-react';
import { SKUItem } from '../types/inventory';
import { BarcodeSVG, QRCodeSVG } from '../utils/formatters';

interface BarcodeLabelModalProps {
  sku: SKUItem | null;
  onClose: () => void;
}

export const BarcodeLabelModal: React.FC<BarcodeLabelModalProps> = ({ sku, onClose }) => {
  if (!sku) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div
        className="bg-white rounded-lg border border-[#cbd5e1] max-w-md w-full p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-[#2563eb]" />
            <h3 className="text-sm font-bold text-[#0f172a]">Warehouse Shelf Tag & Barcode</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Industrial Label Graphic */}
        <div className="p-4 bg-white border-2 border-black rounded shadow-sm text-black font-sans print:border-none">
          {/* Label Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase block">
                APEX LOGISTICS SYSTEMS
              </span>
              <span className="text-xl font-black font-mono tracking-tight">{sku.sku}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold block">Assigned Bin</span>
              <span className="text-base font-black font-mono bg-black text-white px-2 py-0.5 rounded">
                {sku.binLocation}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-3">
            <h4 className="text-xs font-bold leading-tight line-clamp-2">{sku.name}</h4>
            <span className="text-[10px] text-slate-600 block mt-0.5 font-medium">
              Category: {sku.category} · Weight: {sku.weightKg} kg
            </span>
          </div>

          {/* Barcode & QR Code */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-300">
            <div className="flex-1">
              <BarcodeSVG value={sku.barcode} height={42} />
            </div>
            <div className="shrink-0">
              <QRCodeSVG value={`${sku.sku}:${sku.binLocation}`} size={64} />
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-2 pt-1 border-t border-dashed border-slate-300">
            <span>WH: {sku.warehouseId.toUpperCase()}</span>
            <span>AUDITED: {sku.lastAudited}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-[#64748b]">
            Compatible with 4" x 2" thermal label stock.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:text-[#0f172a]"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
