import React from 'react';
import {
  Boxes,
  Truck,
  Grid3X3,
  ArrowRightLeft,
  ShoppingBag,
  Barcode,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  ShieldCheck,
} from 'lucide-react';

export type NavTab = 'inventory' | 'receiving' | 'floormap' | 'movements' | 'replenish' | 'scanner';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  lowStockCount: number;
  inboundCount: number;
  selectedFacility: string;
  onSelectFacility: (fac: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  lowStockCount,
  inboundCount,
  selectedFacility,
  onSelectFacility,
}) => {
  const navItems = [
    {
      id: 'inventory' as NavTab,
      label: 'Inventory & SKUs',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'receiving' as NavTab,
      label: 'Inbound & Receiving',
      icon: Truck,
      badge: inboundCount > 0 ? inboundCount : null,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'floormap' as NavTab,
      label: 'Warehouse Floor Map',
      icon: Grid3X3,
      badge: null,
    },
    {
      id: 'movements' as NavTab,
      label: 'Stock Movements',
      icon: ArrowRightLeft,
      badge: null,
    },
    {
      id: 'replenish' as NavTab,
      label: 'Reorder & Replenish',
      icon: ShoppingBag,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'scanner' as NavTab,
      label: 'Handheld Barcode Tool',
      icon: Barcode,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 font-mono text-[10px]',
    },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0f172a] border-r border-[#1e293b] text-[#94a3b8] transition-all duration-200 select-none ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded bg-[#2563eb] text-white flex items-center justify-center font-black tracking-tight shrink-0 shadow-md">
            <Boxes className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-white font-bold tracking-tight text-sm uppercase leading-tight truncate">
                APEX WAREHOUSE
              </span>
              <span className="text-[11px] text-[#64748b] font-medium tracking-wide">
                Logistics & Inventory
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded text-[#64748b] hover:text-white hover:bg-[#1e293b] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Facility Selector */}
      {!collapsed ? (
        <div className="px-4 py-3 border-b border-[#1e293b]/70 bg-[#0b1222]/50">
          <div className="text-[10px] font-semibold tracking-wider text-[#64748b] uppercase mb-1.5 flex items-center gap-1.5">
            <Warehouse className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>Active Facility</span>
          </div>
          <select
            value={selectedFacility}
            onChange={(e) => onSelectFacility(e.target.value)}
            className="w-full text-xs font-medium bg-[#1e293b] text-slate-200 border border-[#334155] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#3b82f6] cursor-pointer"
          >
            <option value="wh-alpha">Alpha · Seattle Central</option>
            <option value="wh-beta">Beta · Chicago Hub</option>
            <option value="wh-gamma">Gamma · Rotterdam Europort</option>
          </select>
        </div>
      ) : (
        <div className="py-2.5 flex justify-center border-b border-[#1e293b]/70">
          <div
            title={`Active Facility: ${selectedFacility}`}
            className="w-8 h-8 rounded bg-[#1e293b] flex items-center justify-center text-blue-400"
          >
            <Warehouse className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
            Floor Operations
          </div>
        )}
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors text-left relative group ${
                isActive
                  ? 'bg-[#1e293b] text-white font-semibold'
                  : 'text-[#94a3b8] hover:bg-[#1e293b]/70 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {/* Active left border indicator from design spec: #3b82f6 */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#3b82f6] rounded-r" />
              )}

              <IconComponent
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#3b82f6]' : 'text-[#64748b] group-hover:text-slate-300'
                }`}
              />

              {!collapsed && (
                <span className="flex-1 truncate tracking-tight">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full shrink-0 tabular-nums ${
                    item.badgeColor || 'bg-[#334155] text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {collapsed && item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Operator Session Info */}
      <div className="p-3 border-t border-[#1e293b] bg-[#0b1222]/80">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-white text-xs border border-slate-600 shrink-0">
              MV
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                Marcus Vance
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </span>
              <span className="text-[11px] text-[#64748b] truncate">
                Shift Supervisor · Lane A
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Marcus Vance · Shift Supervisor">
            <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
              MV
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
