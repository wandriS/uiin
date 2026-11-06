import React, { useState } from 'react';
import {
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Truck,
  Calendar,
  FileText,
  Printer,
  Check,
} from 'lucide-react';
import { SKUItem } from '../types/inventory';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface ReorderViewProps {
  skus: SKUItem[];
  onCreatePurchaseOrder: (selectedSkus: { sku: SKUItem; orderQty: number }[]) => void;
}

export const ReorderView: React.FC<ReorderViewProps> = ({
  skus,
  onCreatePurchaseOrder,
}) => {
  // Find low stock and depleted items
  const lowOrDepleted = skus.filter(
    (s) => s.status === 'LOW_STOCK' || s.status === 'DEPLETED' || s.quantityOnHand <= s.minThreshold
  );

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    lowOrDepleted.forEach((s) => {
      map[s.id] = s.reorderQuantity || Math.max(10, s.minThreshold * 2);
    });
    return map;
  });

  const [selectedIds, setSelectedIds] = useState<string[]>(lowOrDepleted.map((s) => s.id));
  const [poSubmitted, setPoSubmitted] = useState<boolean>(false);
  const [createdPoNumber, setCreatedPoNumber] = useState<string>('');

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === lowOrDepleted.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(lowOrDepleted.map((s) => s.id));
    }
  };

  const handleQuantityChange = (id: string, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, val),
    }));
  };

  const totalPoCost = lowOrDepleted
    .filter((s) => selectedIds.includes(s.id))
    .reduce((sum, s) => sum + (quantities[s.id] || s.reorderQuantity) * s.unitCost, 0);

  const handleGeneratePo = () => {
    const items = lowOrDepleted
      .filter((s) => selectedIds.includes(s.id))
      .map((s) => ({
        sku: s,
        orderQty: quantities[s.id] || s.reorderQuantity,
      }));

    if (items.length === 0) return;

    const poNumber = `PO-${Math.floor(10000 + Math.random() * 90000)}`;
    setCreatedPoNumber(poNumber);
    onCreatePurchaseOrder(items);
    setPoSubmitted(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded border border-[#e2e8f0] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wide">
              Automated Reorder & Replenishment Console
            </h2>
            <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded border border-amber-200">
              {lowOrDepleted.length} SKUs Below Safety Threshold
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Economic Order Quantity (EOQ) calculations, vendor lead-time adjustments, and 1-click purchase order transmission.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-[#64748b] block">PO Requisition Total:</span>
            <span className="text-base font-bold text-[#059669] tabular-nums font-mono">
              {formatCurrency(totalPoCost)}
            </span>
          </div>

          <button
            onClick={handleGeneratePo}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed rounded shadow-xs transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Generate Reorder PO ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {poSubmitted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-sm block">Purchase Order {createdPoNumber} Generated!</span>
              <span>
                Reorder manifests have been dispatched to vendors. Inbound tracking scheduled.
              </span>
            </div>
          </div>
          <button
            onClick={() => setPoSubmitted(false)}
            className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[11px] font-semibold tracking-wider text-[#64748b] uppercase select-none">
              <tr>
                <th className="py-2.5 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      lowOrDepleted.length > 0 && selectedIds.length === lowOrDepleted.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-[#93c5fd] cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3.5">SKU Code</th>
                <th className="py-2.5 px-3.5">Item Description</th>
                <th className="py-2.5 px-3.5 text-center">Current Count</th>
                <th className="py-2.5 px-3.5 text-center">Safety Min</th>
                <th className="py-2.5 px-3.5 text-center">Suggested PO Qty</th>
                <th className="py-2.5 px-3.5 text-right">Unit Cost</th>
                <th className="py-2.5 px-3.5 text-right">Extended Total</th>
                <th className="py-2.5 px-3.5">Vendor & Lead Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {lowOrDepleted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748b]">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#0f172a]">
                      All Inventory Stock Levels Optimal
                    </p>
                    <p className="text-xs text-[#64748b] mt-1">
                      No SKUs currently breached their minimum safety stock threshold.
                    </p>
                  </td>
                </tr>
              ) : (
                lowOrDepleted.map((sku) => {
                  const isSelected = selectedIds.includes(sku.id);
                  const orderQty = quantities[sku.id] || sku.reorderQuantity;
                  const extTotal = orderQty * sku.unitCost;

                  return (
                    <tr
                      key={sku.id}
                      className={`hover:bg-[#f8fafc] transition-colors ${
                        isSelected ? 'bg-[#eff6ff]/60' : 'bg-white'
                      }`}
                    >
                      <td className="py-2.5 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(sku.id)}
                          className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-[#93c5fd] cursor-pointer"
                        />
                      </td>

                      <td className="py-2.5 px-3.5 font-mono font-bold text-xs text-[#2563eb]">
                        {sku.sku}
                      </td>

                      <td className="py-2.5 px-3.5 max-w-xs">
                        <div className="font-semibold text-[#0f172a] truncate">{sku.name}</div>
                        <div className="text-[11px] text-[#64748b]">{sku.category}</div>
                      </td>

                      <td className="py-2.5 px-3.5 text-center">
                        <span
                          className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded-full text-xs ${
                            sku.quantityOnHand === 0
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {sku.quantityOnHand} units
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-center font-mono text-xs tabular-nums text-[#64748b]">
                        {sku.minThreshold}
                      </td>

                      <td className="py-2.5 px-3.5 text-center">
                        <input
                          type="number"
                          min="1"
                          value={orderQty}
                          onChange={(e) => handleQuantityChange(sku.id, Number(e.target.value))}
                          className="w-20 text-center font-mono font-bold text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-[#2563eb]"
                        />
                      </td>

                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-[#0f172a]">
                        {formatCurrency(sku.unitCost)}
                      </td>

                      <td className="py-2.5 px-3.5 text-right font-mono font-bold tabular-nums text-[#059669]">
                        {formatCurrency(extTotal)}
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="font-semibold text-[#0f172a] block truncate max-w-[180px]">
                          {sku.supplier.name}
                        </span>
                        <span className="text-[10px] text-[#047857] font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                          {sku.supplier.leadTimeDays} days lead time
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
