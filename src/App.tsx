import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_SKUS,
  INITIAL_MOVEMENTS,
  INITIAL_INBOUND_SHIPMENTS,
  INITIAL_BINS,
} from './data/mockInventory';
import { SKUItem, StockMovement, InboundShipment, BinSlot } from './types/inventory';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { InventoryTable } from './components/InventoryTable';
import { BinCardView } from './components/BinCardView';
import { SkuDetailDrawer } from './components/SkuDetailDrawer';
import { WarehouseFloorMap } from './components/WarehouseFloorMap';
import { InboundDockView } from './components/InboundDockView';
import { StockMovementsView } from './components/StockMovementsView';
import { ReorderView } from './components/ReorderView';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { TransferBinModal } from './components/TransferBinModal';
import { BarcodeLabelModal } from './components/BarcodeLabelModal';
import { NewSkuModal } from './components/NewSkuModal';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function App() {
  const [skus, setSkus] = useState<SKUItem[]>(INITIAL_SKUS);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);
  const [shipments, setShipments] = useState<InboundShipment[]>(INITIAL_INBOUND_SHIPMENTS);
  const [bins, setBins] = useState<BinSlot[]>(INITIAL_BINS);

  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<NavTab>('inventory');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedFacility, setSelectedFacility] = useState<string>('wh-alpha');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Selection & Modals state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeSkuDrawer, setActiveSkuDrawer] = useState<SKUItem | null>(null);
  const [transferModalSku, setTransferModalSku] = useState<SKUItem | null>(null);
  const [barcodeModalSku, setBarcodeModalSku] = useState<SKUItem | null>(null);
  const [newSkuModalOpen, setNewSkuModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentTab('scanner');
        showToast('Handheld Barcode Scanner Terminal Activated');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered SKUs
  const filteredSkus = useMemo(() => {
    return skus.filter((item) => {
      // Facility filter
      if (selectedFacility && item.warehouseId !== selectedFacility) {
        // Allow demonstration by defaulting if other facility is empty
        const facilityHasItems = skus.some((s) => s.warehouseId === selectedFacility);
        if (facilityHasItems && item.warehouseId !== selectedFacility) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.sku.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.barcode.toLowerCase().includes(q) ||
          item.binLocation.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [skus, selectedFacility, statusFilter, categoryFilter, searchQuery]);

  // Aggregate Metrics
  const totalSkus = skus.length;
  const totalUnits = skus.reduce((sum, s) => sum + s.quantityOnHand, 0);
  const totalValuation = skus.reduce((sum, s) => sum + s.quantityOnHand * s.unitCost, 0);
  const lowStockCount = skus.filter((s) => s.status === 'LOW_STOCK').length;
  const depletedCount = skus.filter((s) => s.status === 'DEPLETED').length;
  const pendingInboundCount = shipments.filter((s) => s.status !== 'STORED').length;

  // Stock Adjustment Handler
  const handleAdjustStock = (sku: SKUItem, deltaOrAbsolute: number, reason?: string) => {
    const isDelta = reason === undefined;
    const newQty = isDelta
      ? Math.max(0, sku.quantityOnHand + deltaOrAbsolute)
      : Math.max(0, deltaOrAbsolute);
    const delta = newQty - sku.quantityOnHand;

    if (delta === 0) return;

    let newStatus = sku.status;
    if (newQty === 0) newStatus = 'DEPLETED';
    else if (newQty <= sku.minThreshold) newStatus = 'LOW_STOCK';
    else newStatus = 'IN_STOCK';

    // Update SKU
    setSkus((prev) =>
      prev.map((s) => (s.id === sku.id ? { ...s, quantityOnHand: newQty, status: newStatus } : s))
    );

    // Update active drawer if open
    if (activeSkuDrawer?.id === sku.id) {
      setActiveSkuDrawer({ ...activeSkuDrawer, quantityOnHand: newQty, status: newStatus });
    }

    // Update Bin occupancy
    setBins((prev) =>
      prev.map((b) =>
        b.code === sku.binLocation
          ? { ...b, currentUnits: Math.max(0, b.currentUnits + delta) }
          : b
      )
    );

    // Append Movement
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sku: sku.sku,
      skuName: sku.name,
      type: delta > 0 ? (reason ? 'CYCLE_ADJUST' : 'RECEIPT') : 'PICK_PACK',
      operatorName: 'Marcus Vance',
      deltaQuantity: delta,
      priorQuantity: sku.quantityOnHand,
      newQuantity: newQty,
      referenceDoc: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      reason: reason || (delta > 0 ? 'Floor restock quick adjustment' : 'Floor assembly kit pick'),
      sourceBin: delta < 0 ? sku.binLocation : undefined,
      targetBin: delta > 0 ? sku.binLocation : undefined,
    };
    setMovements((prev) => [newMovement, ...prev]);

    showToast(`Updated ${sku.sku}: ${delta > 0 ? '+' : ''}${delta} units (${newQty} on hand)`);
  };

  // Bin Transfer Handler
  const handleConfirmTransfer = (
    sku: SKUItem,
    targetBinCode: string,
    qty: number,
    reason: string
  ) => {
    const oldBinCode = sku.binLocation;

    setSkus((prev) =>
      prev.map((s) => (s.id === sku.id ? { ...s, binLocation: targetBinCode } : s))
    );

    // Update active drawer if open
    if (activeSkuDrawer?.id === sku.id) {
      setActiveSkuDrawer({ ...activeSkuDrawer, binLocation: targetBinCode });
    }

    // Update Bins
    setBins((prev) =>
      prev.map((b) => {
        if (b.code === oldBinCode) {
          return {
            ...b,
            currentUnits: Math.max(0, b.currentUnits - qty),
            assignedSKUs: b.assignedSKUs.filter((s) => s !== sku.sku),
          };
        }
        if (b.code === targetBinCode) {
          return {
            ...b,
            currentUnits: b.currentUnits + qty,
            assignedSKUs: [...new Set([...b.assignedSKUs, sku.sku])],
          };
        }
        return b;
      })
    );

    // Append Movement
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sku: sku.sku,
      skuName: sku.name,
      type: 'TRANSFER',
      operatorName: 'Marcus Vance',
      deltaQuantity: 0,
      priorQuantity: sku.quantityOnHand,
      newQuantity: sku.quantityOnHand,
      referenceDoc: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      reason: reason || 'Warehouse floor bin reallocation',
      sourceBin: oldBinCode,
      targetBin: targetBinCode,
    };
    setMovements((prev) => [newMovement, ...prev]);

    showToast(`Relocated ${sku.sku} from ${oldBinCode} → ${targetBinCode}`);
  };

  // Add New SKU Handler
  const handleAddNewSku = (newSku: SKUItem) => {
    setSkus((prev) => [newSku, ...prev]);

    // Update bin
    setBins((prev) =>
      prev.map((b) =>
        b.code === newSku.binLocation
          ? {
              ...b,
              currentUnits: b.currentUnits + newSku.quantityOnHand,
              assignedSKUs: [...new Set([...b.assignedSKUs, newSku.sku])],
            }
          : b
      )
    );

    // Add movement
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sku: newSku.sku,
      skuName: newSku.name,
      type: 'RECEIPT',
      operatorName: 'Marcus Vance',
      deltaQuantity: newSku.quantityOnHand,
      priorQuantity: 0,
      newQuantity: newSku.quantityOnHand,
      referenceDoc: `INTAKE-${Math.floor(1000 + Math.random() * 9000)}`,
      reason: 'Initial catalog intake and floor stocking',
      targetBin: newSku.binLocation,
    };
    setMovements((prev) => [newMovement, ...prev]);

    showToast(`Registered SKU ${newSku.sku} assigned to ${newSku.binLocation}`);
  };

  // Inbound Receiving Handler
  const handleReceiveShipmentItems = (
    shipmentId: string,
    receivedItems: { sku: string; qty: number; targetBin: string }[]
  ) => {
    // Update shipment status
    setShipments((prev) =>
      prev.map((shp) =>
        shp.id === shipmentId
          ? {
              ...shp,
              status: 'STORED',
              arrivalDate: new Date().toISOString().split('T')[0],
              items: shp.items.map((i) => {
                const rec = receivedItems.find((r) => r.sku === i.sku);
                return rec ? { ...i, receivedQty: rec.qty, inspected: true } : i;
              }),
            }
          : shp
      )
    );

    // Credit inventory for each item
    receivedItems.forEach((rec) => {
      const match = skus.find((s) => s.sku === rec.sku);
      if (match) {
        const newQty = match.quantityOnHand + rec.qty;
        let newStatus = match.status;
        if (newQty === 0) newStatus = 'DEPLETED';
        else if (newQty <= match.minThreshold) newStatus = 'LOW_STOCK';
        else newStatus = 'IN_STOCK';

        setSkus((prev) =>
          prev.map((s) =>
            s.sku === rec.sku
              ? {
                  ...s,
                  quantityOnHand: newQty,
                  binLocation: rec.targetBin,
                  status: newStatus,
                  lastRestocked: new Date().toISOString().split('T')[0],
                }
              : s
          )
        );

        // Add movement log
        const mov: StockMovement = {
          id: `mov-${Date.now()}-${rec.sku}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          sku: rec.sku,
          skuName: match.name,
          type: 'RECEIPT',
          operatorName: 'Marcus Vance',
          deltaQuantity: rec.qty,
          priorQuantity: match.quantityOnHand,
          newQuantity: newQty,
          referenceDoc: `PO-${shipmentId}`,
          reason: 'Dock inspection verified. Put-away completed.',
          targetBin: rec.targetBin,
        };
        setMovements((prev) => [mov, ...prev]);
      }
    });

    showToast(`Shipment ${shipmentId} stored! Credited ${receivedItems.length} SKUs to inventory.`);
  };

  // Create Purchase Order Handler
  const handleCreatePurchaseOrder = (selectedItems: { sku: SKUItem; orderQty: number }[]) => {
    const poNum = `PO-${Math.floor(10000 + Math.random() * 90000)}`;

    const newShipment: InboundShipment = {
      id: `shp-${Date.now()}`,
      poNumber: poNum,
      supplierName: selectedItems[0]?.sku.supplier.name || 'Industrial Components Group',
      eta: 'In 3-5 business days',
      status: 'SCHEDULED',
      dockBay: 'Bay 02 (Clean Inbound)',
      palletsCount: Math.max(1, Math.ceil(selectedItems.length / 2)),
      carrier: 'Apex Logistics Freight Express',
      items: selectedItems.map((item) => ({
        sku: item.sku.sku,
        name: item.sku.name,
        expectedQty: item.orderQty,
        receivedQty: 0,
        targetBin: item.sku.binLocation,
        inspected: false,
      })),
    };

    setShipments((prev) => [newShipment, ...prev]);
    showToast(`Generated Purchase Order ${poNum} for ${selectedItems.length} SKUs.`);
  };

  // Table Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredSkus.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSkus.map((s) => s.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkTransfer = () => {
    if (selectedIds.length === 0) return;
    const target = 'BIN B-09';
    setSkus((prev) =>
      prev.map((s) => (selectedIds.includes(s.id) ? { ...s, binLocation: target } : s))
    );
    showToast(`Bulk relocated ${selectedIds.length} SKUs to ${target}`);
    setSelectedIds([]);
  };

  const handleBulkQuarantine = () => {
    if (selectedIds.length === 0) return;
    setSkus((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id)
          ? {
              ...s,
              quarantinedCount: (s.quarantinedCount || 0) + 1,
              notes: 'FLAGGED FOR QC INSPECTION',
            }
          : s
      )
    );
    showToast(`Flagged ${selectedIds.length} SKUs for quarantine inspection`);
    setSelectedIds([]);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'SKU',
      'Item Name',
      'Category',
      'Bin Location',
      'Quantity On Hand',
      'Min Threshold',
      'Max Capacity',
      'Unit Cost ($)',
      'Extended Value ($)',
      'Status',
      'Barcode',
      'Supplier',
      'Last Restocked',
    ];

    const rows = (selectedIds.length > 0
      ? skus.filter((s) => selectedIds.includes(s.id))
      : filteredSkus
    ).map((s) => [
      s.sku,
      `"${s.name.replace(/"/g, '""')}"`,
      s.category,
      s.binLocation,
      s.quantityOnHand,
      s.minThreshold,
      s.maxCapacity,
      s.unitCost,
      (s.quantityOnHand * s.unitCost).toFixed(2),
      s.status,
      s.barcode,
      `"${s.supplier.name}"`,
      s.lastRestocked,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported inventory snapshot as CSV');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b1c30] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0f172a] text-white px-4 py-2.5 rounded shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Persistent Lateral Navigation Rail */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        lowStockCount={lowStockCount}
        inboundCount={pendingInboundCount}
        selectedFacility={selectedFacility}
        onSelectFacility={setSelectedFacility}
      />

      {/* Main Administrative Viewport */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          sidebarCollapsed ? 'pl-[72px]' : 'pl-[260px]'
        }`}
      >
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewSkuModal={() => setNewSkuModalOpen(true)}
          onOpenScanner={() => setCurrentTab('scanner')}
          onRefreshData={() => {
            showToast('Refreshed live warehouse inventory metrics');
          }}
          selectedFacility={selectedFacility}
        />

        {/* Content Viewport Body */}
        <main className="p-6 flex-1 space-y-5 max-w-[1600px] w-full mx-auto">
          {/* Always Visible Metric Cards Ribbon & Demand Forecasting */}
          <MetricCards
            totalSkus={totalSkus}
            totalUnits={totalUnits}
            totalValuation={totalValuation}
            lowStockCount={lowStockCount}
            depletedCount={depletedCount}
            skus={skus}
            movements={movements}
            onSelectSku={(sku) => setActiveSkuDrawer(sku)}
            onFilterByStatus={(st) => {
              setCurrentTab('inventory');
              setStatusFilter(st);
            }}
          />

          {/* Conditional View by Tab */}
          {currentTab === 'inventory' && (
            <div className="space-y-4">
              {viewMode === 'table' ? (
                <InventoryTable
                  items={filteredSkus}
                  selectedIds={selectedIds}
                  onToggleSelectAll={handleToggleSelectAll}
                  onToggleSelectRow={handleToggleSelectRow}
                  onSelectSku={(sku) => setActiveSkuDrawer(sku)}
                  onQuickAdjustStock={(sku, delta) => handleAdjustStock(sku, delta)}
                  onOpenTransferModal={(sku) => setTransferModalSku(sku)}
                  onOpenBarcodeModal={(sku) => setBarcodeModalSku(sku)}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  categoryFilter={categoryFilter}
                  onCategoryFilterChange={setCategoryFilter}
                  viewMode={viewMode}
                  onToggleViewMode={setViewMode}
                  onBulkTransfer={handleBulkTransfer}
                  onBulkQuarantine={handleBulkQuarantine}
                  onExportCsv={handleExportCsv}
                />
              ) : (
                <div className="space-y-4">
                  {/* Category & Status Filter Bar for Cards */}
                  <div className="bg-white rounded border border-[#e2e8f0] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 p-1 bg-[#f1f5f9] rounded border border-[#e2e8f0]">
                      {['ALL', 'IN_STOCK', 'LOW_STOCK', 'DEPLETED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1 text-xs font-semibold rounded ${
                            statusFilter === st ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setViewMode('table')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                    >
                      Switch to Data Table
                    </button>
                  </div>

                  <BinCardView
                    items={filteredSkus}
                    onSelectSku={(sku) => setActiveSkuDrawer(sku)}
                    onQuickAdjustStock={(sku, delta) => handleAdjustStock(sku, delta)}
                    onOpenTransferModal={(sku) => setTransferModalSku(sku)}
                    onOpenBarcodeModal={(sku) => setBarcodeModalSku(sku)}
                  />
                </div>
              )}
            </div>
          )}

          {currentTab === 'receiving' && (
            <InboundDockView
              shipments={shipments}
              onReceiveShipmentItems={handleReceiveShipmentItems}
              skus={skus}
            />
          )}

          {currentTab === 'floormap' && (
            <WarehouseFloorMap
              bins={bins}
              skus={skus}
              onSelectSku={(sku) => setActiveSkuDrawer(sku)}
              onOpenTransferModal={(sku) => setTransferModalSku(sku)}
            />
          )}

          {currentTab === 'movements' && (
            <StockMovementsView movements={movements} onExportCsv={handleExportCsv} />
          )}

          {currentTab === 'replenish' && (
            <ReorderView skus={skus} onCreatePurchaseOrder={handleCreatePurchaseOrder} />
          )}

          {currentTab === 'scanner' && (
            <BarcodeScannerModal
              skus={skus}
              onAdjustStock={(sku, delta) => handleAdjustStock(sku, delta)}
              onOpenTransferModal={(sku) => setTransferModalSku(sku)}
              onSelectSku={(sku) => setActiveSkuDrawer(sku)}
            />
          )}
        </main>
      </div>

      {/* SKU Detail Slide-Over Drawer */}
      <SkuDetailDrawer
        sku={activeSkuDrawer}
        onClose={() => setActiveSkuDrawer(null)}
        onAdjustStock={(sku, newQty, reason) => handleAdjustStock(sku, newQty, reason)}
        onOpenTransferModal={(sku) => setTransferModalSku(sku)}
        movements={movements}
        onTriggerReorder={(sku) => {
          setActiveSkuDrawer(null);
          setCurrentTab('replenish');
        }}
      />

      {/* Transfer Bin Modal */}
      <TransferBinModal
        sku={transferModalSku}
        bins={bins}
        onClose={() => setTransferModalSku(null)}
        onConfirmTransfer={handleConfirmTransfer}
      />

      {/* Barcode & Shelf Label Print Modal */}
      <BarcodeLabelModal sku={barcodeModalSku} onClose={() => setBarcodeModalSku(null)} />

      {/* New SKU Intake Modal */}
      <NewSkuModal
        isOpen={newSkuModalOpen}
        onClose={() => setNewSkuModalOpen(false)}
        onAddSku={handleAddNewSku}
        bins={bins}
        warehouseId={selectedFacility}
      />
    </div>
  );
}
