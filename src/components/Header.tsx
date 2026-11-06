import React from 'react';
import { Search, Plus, Barcode, Bell, RefreshCw } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewSkuModal: () => void;
  onOpenScanner: () => void;
  onRefreshData: () => void;
  selectedFacility: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  searchQuery,
  onSearchChange,
  onOpenNewSkuModal,
  onOpenScanner,
  onRefreshData,
  selectedFacility,
}) => {
  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'inventory':
        return 'Inventory & SKU Management';
      case 'receiving':
        return 'Inbound Receiving & Dock Bays';
      case 'floormap':
        return 'Warehouse Spatial Bin Map';
      case 'movements':
        return 'Stock Movements & Audit Log';
      case 'replenish':
        return 'Reorder & Automated Replenishment';
      case 'scanner':
        return 'Handheld Barcode Terminal';
      default:
        return 'Dashboard';
    }
  };

  const getFacilityName = () => {
    switch (selectedFacility) {
      case 'wh-alpha':
        return 'Seattle Central (WH-01)';
      case 'wh-beta':
        return 'Chicago Hub (WH-02)';
      case 'wh-gamma':
        return 'Rotterdam Europort (WH-03)';
      default:
        return 'Seattle Central';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between gap-6 sticky top-0 z-30 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
      {/* Zone 1: Contextual Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#64748b] min-w-0 shrink-0">
        <span className="font-semibold text-[#0f172a] whitespace-nowrap">Apex Logistics</span>
        <span className="text-[#cbd5e1]">/</span>
        <span className="text-[#475569] hidden sm:inline whitespace-nowrap">{getFacilityName()}</span>
        <span className="text-[#cbd5e1] hidden sm:inline">/</span>
        <span className="text-[#2563eb] font-semibold whitespace-nowrap truncate">{getBreadcrumbTitle()}</span>
      </div>

      {/* Zone 2: Search Input with keyboard hint */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search SKU, item name, barcode, or bin..."
            className="w-full bg-[#f8fafc] text-[#0f172a] placeholder-[#94a3b8] text-xs pl-9 pr-14 py-2 rounded border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#2563eb] focus:ring-3 focus:ring-[#93c5fd]/50 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#64748b] bg-[#e2e8f0] border border-[#cbd5e1] rounded shadow-xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Zone 3: Toolbar Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onRefreshData}
          className="p-2 text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded border border-[#e2e8f0] transition-colors"
          title="Refresh Inventory Snapshot"
          aria-label="Refresh Snapshot"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#334155] bg-white border border-[#cbd5e1] rounded hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors whitespace-nowrap shadow-xs"
        >
          <Barcode className="w-4 h-4 text-[#2563eb]" />
          <span className="hidden sm:inline">Scan SKU</span>
        </button>

        <button
          onClick={onOpenNewSkuModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] rounded border border-[#1d4ed8] transition-colors whitespace-nowrap shadow-xs focus:ring-3 focus:ring-[#93c5fd]"
        >
          <Plus className="w-4 h-4" />
          <span>New SKU / Receive</span>
        </button>
      </div>
    </header>
  );
};
