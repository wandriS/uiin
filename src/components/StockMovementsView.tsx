import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { StockMovement, MovementType } from '../types/inventory';
import { formatNumber } from '../utils/formatters';

interface StockMovementsViewProps {
  movements: StockMovement[];
  onExportCsv: () => void;
}

export const StockMovementsView: React.FC<StockMovementsViewProps> = ({
  movements,
  onExportCsv,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [operatorFilter, setOperatorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const movementTypes: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Transactions' },
    { id: 'RECEIPT', label: 'Inbound Receipts' },
    { id: 'PICK_PACK', label: 'Pick & Pack' },
    { id: 'TRANSFER', label: 'Bin Relocations' },
    { id: 'CYCLE_ADJUST', label: 'Cycle Adjustments' },
    { id: 'QUARANTINE_WRITE_OFF', label: 'Quarantine / Scrap' },
  ];

  const operators = ['ALL', ...Array.from(new Set(movements.map((m) => m.operatorName)))];

  const filteredMovements = movements.filter((m) => {
    if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
    if (operatorFilter !== 'ALL' && m.operatorName !== operatorFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.sku.toLowerCase().includes(q) ||
        m.skuName.toLowerCase().includes(q) ||
        m.referenceDoc.toLowerCase().includes(q) ||
        m.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTypeBadge = (type: MovementType) => {
    switch (type) {
      case 'RECEIPT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            RECEIPT (+)
          </span>
        );
      case 'PICK_PACK':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            PICK & PACK (-)
          </span>
        );
      case 'TRANSFER':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            TRANSFER
          </span>
        );
      case 'CYCLE_ADJUST':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            CYCLE AUDIT
          </span>
        );
      case 'QUARANTINE_WRITE_OFF':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            QUARANTINE / WRITE-OFF
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded border border-[#e2e8f0] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wide">
              Inventory Movement & Audit Trail
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
              Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Every inventory receipt, assembly pick, rack relocation, and physical count adjustment timestamped with operator credentials.
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#334155] bg-white border border-[#cbd5e1] rounded hover:bg-[#f8fafc] transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#64748b]" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded border border-[#e2e8f0] p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Type pills */}
        <div className="flex items-center gap-1 p-1 bg-[#f1f5f9] rounded border border-[#e2e8f0] overflow-x-auto w-full md:w-auto">
          {movementTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                typeFilter === t.id
                  ? 'bg-white text-[#2563eb] shadow-xs font-semibold'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search & Operator Select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ref or SKU..."
              className="w-full pl-8 pr-2 py-1 text-xs bg-[#f8fafc] border border-slate-300 rounded focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="bg-[#f8fafc] text-xs border border-slate-300 rounded px-2.5 py-1 text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
          >
            {operators.map((op) => (
              <option key={op} value={op}>
                {op === 'ALL' ? 'All Operators' : op}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[11px] font-semibold tracking-wider text-[#64748b] uppercase">
              <tr>
                <th className="py-2.5 px-3.5">Timestamp</th>
                <th className="py-2.5 px-3.5">Event Type</th>
                <th className="py-2.5 px-3.5">SKU & Item</th>
                <th className="py-2.5 px-3.5">Bin Routing</th>
                <th className="py-2.5 px-3.5 text-right">Delta Qty</th>
                <th className="py-2.5 px-3.5 text-right">Stock Level</th>
                <th className="py-2.5 px-3.5">Operator & Ref Doc</th>
                <th className="py-2.5 px-3.5">Audit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#64748b]">
                    No movements match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-[#64748b] whitespace-nowrap">
                      {m.timestamp}
                    </td>

                    <td className="py-2.5 px-3.5 whitespace-nowrap">{getTypeBadge(m.type)}</td>

                    <td className="py-2.5 px-3.5 max-w-[220px]">
                      <span className="font-mono font-bold text-[#0f172a] block">{m.sku}</span>
                      <span className="text-[11px] text-[#64748b] truncate block">{m.skuName}</span>
                    </td>

                    <td className="py-2.5 px-3.5 font-mono text-[11px] whitespace-nowrap">
                      {m.sourceBin && m.targetBin ? (
                        <div className="flex items-center gap-1 text-[#0f172a]">
                          <span>{m.sourceBin}</span>
                          <ArrowRight className="w-3 h-3 text-[#94a3b8]" />
                          <span className="font-bold text-[#2563eb]">{m.targetBin}</span>
                        </div>
                      ) : m.targetBin ? (
                        <span className="text-emerald-700 font-semibold">In: {m.targetBin}</span>
                      ) : m.sourceBin ? (
                        <span className="text-slate-600">From: {m.sourceBin}</span>
                      ) : (
                        <span className="text-[#94a3b8]">—</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3.5 text-right font-mono font-bold text-xs tabular-nums whitespace-nowrap">
                      <span
                        className={
                          m.deltaQuantity > 0
                            ? 'text-emerald-600'
                            : m.deltaQuantity < 0
                            ? 'text-rose-600'
                            : 'text-slate-600'
                        }
                      >
                        {m.deltaQuantity > 0 ? '+' : ''}
                        {m.deltaQuantity}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 text-right font-mono text-[11px] text-[#64748b] tabular-nums whitespace-nowrap">
                      {m.priorQuantity} → <strong className="text-[#0f172a]">{m.newQuantity}</strong>
                    </td>

                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span className="font-semibold text-[#0f172a] block">{m.operatorName}</span>
                      <span className="font-mono text-[10px] text-[#64748b] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                        {m.referenceDoc}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 text-[11px] text-[#64748b] max-w-[200px] truncate" title={m.reason}>
                      {m.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
