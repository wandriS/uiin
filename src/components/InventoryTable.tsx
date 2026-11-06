import React, { useState } from 'react';
import {
  Copy,
  Check,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Barcode,
  Layers,
  ArrowRightLeft,
  Eye,
  Plus,
  Minus,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Trash2,
} from 'lucide-react';
import { SKUItem, StockStatus } from '../types/inventory';
import { formatCurrency, formatNumber, getStatusMeta } from '../utils/formatters';

interface InventoryTableProps {
  items: SKUItem[];
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: string) => void;
  onSelectSku: (item: SKUItem) => void;
  onQuickAdjustStock: (sku: SKUItem, delta: number) => void;
  onOpenTransferModal: (sku: SKUItem) => void;
  onOpenBarcodeModal: (sku: SKUItem) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  viewMode: 'table' | 'cards';
  onToggleViewMode: (mode: 'table' | 'cards') => void;
  onBulkTransfer: () => void;
  onBulkQuarantine: () => void;
  onExportCsv: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onSelectSku,
  onQuickAdjustStock,
  onOpenTransferModal,
  onOpenBarcodeModal,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  viewMode,
  onToggleViewMode,
  onBulkTransfer,
  onBulkQuarantine,
  onExportCsv,
}) => {
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof SKUItem>('sku');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleCopySku = (e: React.MouseEvent, skuStr: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(skuStr);
    setCopiedSku(skuStr);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  const handleSort = (field: keyof SKUItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(items.map((i) => i.category)))];

  // Sorting
  const sortedItems = [...items].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    const strA = String(valA || '').toLowerCase();
    const strB = String(valB || '').toLowerCase();
    return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="bg-white rounded border border-[#e2e8f0] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden flex flex-col">
      {/* Table Toolbar & Segmented Tabs */}
      <div className="p-3.5 border-b border-[#e2e8f0] bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Functional Segmented Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#f1f5f9] rounded border border-[#e2e8f0] overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Stock' },
            { id: 'IN_STOCK', label: 'In Stock' },
            { id: 'LOW_STOCK', label: 'Low Warning' },
            { id: 'DEPLETED', label: 'Depleted' },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusFilterChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#2563eb] shadow-xs border border-[#cbd5e1]/60'
                    : 'text-[#64748b] hover:text-[#0f172a] hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Category filter, CSV Export & View Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <span className="text-[11px] font-medium text-[#64748b] uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="bg-[#f8fafc] text-[#0f172a] border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2563eb]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* View Mode Switcher */}
          <div className="flex items-center border border-[#cbd5e1] rounded p-0.5 bg-[#f8fafc]">
            <button
              onClick={() => onToggleViewMode('table')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
              title="Data Table View"
            >
              Table
            </button>
            <button
              onClick={() => onToggleViewMode('cards')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
              title="Bin Cards View"
            >
              Bin Cards
            </button>
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#334155] bg-white border border-[#cbd5e1] rounded hover:bg-[#f8fafc] transition-colors shadow-xs"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#64748b]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[11px] font-semibold tracking-wider text-[#64748b] uppercase select-none">
              <th className="py-2.5 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-[#93c5fd] cursor-pointer"
                  aria-label="Select all rows"
                />
              </th>
              <th
                onClick={() => handleSort('sku')}
                className="py-2.5 px-3.5 cursor-pointer hover:text-[#0f172a] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>SKU / Code</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94a3b8]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-2.5 px-3.5 cursor-pointer hover:text-[#0f172a] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Item Description</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94a3b8]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('binLocation')}
                className="py-2.5 px-3.5 cursor-pointer hover:text-[#0f172a] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Location</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94a3b8]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('quantityOnHand')}
                className="py-2.5 px-3.5 cursor-pointer hover:text-[#0f172a] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Stock Level</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94a3b8]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('unitCost')}
                className="py-2.5 px-3.5 text-right cursor-pointer hover:text-[#0f172a] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Unit Cost</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94a3b8]" />
                </div>
              </th>
              <th className="py-2.5 px-3.5 text-right">Ext. Value</th>
              <th className="py-2.5 px-3.5 text-center">Status</th>
              <th className="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9] text-xs">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#64748b]">
                  <AlertCircle className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#0f172a]">No SKUs Match Criteria</p>
                  <p className="text-xs text-[#64748b] mt-1">
                    Try adjusting your search query, status tabs, or category filter.
                  </p>
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const statusMeta = getStatusMeta(item.status);
                const extendedVal = item.quantityOnHand * item.unitCost;
                const capacityPct = Math.min(
                  100,
                  Math.round((item.quantityOnHand / item.maxCapacity) * 100)
                );

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectSku(item)}
                    className={`transition-colors cursor-pointer group relative ${
                      isSelected
                        ? 'bg-[#eff6ff] hover:bg-[#e0eeff]'
                        : 'bg-white hover:bg-[#f8fafc]'
                    }`}
                  >
                    {/* Left 3px accent bar for selected rows per design spec */}
                    {isSelected && (
                      <td className="p-0">
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#2563eb]" />
                      </td>
                    )}

                    {/* Checkbox */}
                    <td
                      className="py-2.5 px-3.5 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectRow(item.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-[#93c5fd] cursor-pointer"
                        aria-label={`Select ${item.sku}`}
                      />
                    </td>

                    {/* SKU with one-click copy */}
                    <td className="py-2.5 px-3.5 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-[#0f172a] font-semibold tracking-tight">
                          {item.sku}
                        </span>
                        <button
                          onClick={(e) => handleCopySku(e, item.sku)}
                          className="p-1 rounded text-[#94a3b8] hover:text-[#2563eb] hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Copy SKU code"
                          aria-label={`Copy SKU ${item.sku}`}
                        >
                          {copiedSku === item.sku ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-[#94a3b8] font-mono block">
                        BAR: {item.barcode}
                      </span>
                    </td>

                    {/* Item Description & Category */}
                    <td className="py-2.5 px-3.5 max-w-[280px]">
                      <div className="font-medium text-[#0f172a] truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#64748b] flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-[#475569]">{item.category}</span>
                        <span className="text-[#cbd5e1]">·</span>
                        <span>{item.weightKg} kg</span>
                      </div>
                    </td>

                    {/* Location Bin Badge */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#1e293b] bg-[#f1f5f9] border border-[#e2e8f0] px-2 py-0.5 rounded">
                        <Layers className="w-3 h-3 text-[#2563eb]" />
                        {item.binLocation}
                      </span>
                      <span className="text-[10px] text-[#94a3b8] block mt-0.5 truncate max-w-[110px]">
                        {item.zone.split(' ')[0]}
                      </span>
                    </td>

                    {/* Stock Level with Gauge */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-between gap-3 text-xs mb-1">
                        <span className="font-bold tabular-nums text-[#0f172a]">
                          {formatNumber(item.quantityOnHand)}{' '}
                          <span className="font-normal text-[#94a3b8] text-[11px]">
                            / {item.maxCapacity}
                          </span>
                        </span>
                        <span className="text-[10px] text-[#64748b] tabular-nums">
                          Min: {item.minThreshold}
                        </span>
                      </div>
                      {/* Gauge Bar */}
                      <div className="w-28 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
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
                    </td>

                    {/* Unit Cost */}
                    <td className="py-2.5 px-3.5 text-right font-medium text-[#0f172a] tabular-nums whitespace-nowrap">
                      {formatCurrency(item.unitCost)}
                    </td>

                    {/* Ext. Value */}
                    <td className="py-2.5 px-3.5 text-right font-semibold text-[#0f172a] tabular-nums whitespace-nowrap">
                      {formatCurrency(extendedVal)}
                    </td>

                    {/* Status Badge per exact spec */}
                    <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full border ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td
                      className="py-2.5 px-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        {/* Quick stock +/- */}
                        <button
                          onClick={() => onQuickAdjustStock(item, 1)}
                          className="p-1 rounded text-[#475569] hover:text-[#0f172a] hover:bg-slate-100 border border-[#e2e8f0] transition-colors"
                          title="Quick +1 Unit"
                          aria-label={`Add 1 to ${item.sku}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onQuickAdjustStock(item, -1)}
                          disabled={item.quantityOnHand <= 0}
                          className="p-1 rounded text-[#475569] hover:text-[#0f172a] hover:bg-slate-100 border border-[#e2e8f0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Quick -1 Unit"
                          aria-label={`Deduct 1 from ${item.sku}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenTransferModal(item)}
                          className="p-1 rounded text-[#475569] hover:text-[#2563eb] hover:bg-blue-50 border border-[#e2e8f0] transition-colors ml-0.5"
                          title="Transfer Bin"
                          aria-label={`Transfer ${item.sku}`}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenBarcodeModal(item)}
                          className="p-1 rounded text-[#475569] hover:text-[#2563eb] hover:bg-blue-50 border border-[#e2e8f0] transition-colors"
                          title="View Barcode / QR Label"
                          aria-label={`View barcode for ${item.sku}`}
                        >
                          <Barcode className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectSku(item)}
                          className="p-1 rounded text-[#2563eb] hover:bg-blue-50 border border-blue-200 transition-colors ml-0.5 font-semibold text-xs px-2"
                          title="Inspect Details"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748b] gap-2">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-[#0f172a] tabular-nums">{sortedItems.length}</strong> of{' '}
            <strong className="text-[#0f172a] tabular-nums">{items.length}</strong> items
          </span>
          {selectedIds.length > 0 && (
            <span className="font-semibold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <span>
            Audited today: <strong className="text-[#0f172a]">100% Verified</strong>
          </span>
          <span>
            Storage Efficiency: <strong className="text-[#059669]">84.2%</strong>
          </span>
        </div>
      </div>

      {/* Floating Sticky Bulk Actions Bar (Appears when items are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-[#0f172a] text-white px-5 py-3 flex items-center justify-between border-t border-[#334155] animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-600 rounded text-white tabular-nums">
              {selectedIds.length} SKUs Selected
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              Execute batch action across selected inventory items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBulkTransfer}
              className="px-3 py-1.5 text-xs font-medium bg-[#1e293b] hover:bg-[#334155] text-white rounded border border-[#475569] flex items-center gap-1.5 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Bulk Bin Relocate</span>
            </button>

            <button
              onClick={onBulkQuarantine}
              className="px-3 py-1.5 text-xs font-medium bg-rose-950/70 hover:bg-rose-900 text-rose-200 rounded border border-rose-800 flex items-center gap-1.5 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Flag Quarantine</span>
            </button>

            <button
              onClick={onExportCsv}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 rounded border border-emerald-800 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Batch</span>
            </button>

            <button
              onClick={onToggleSelectAll}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 underline transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
