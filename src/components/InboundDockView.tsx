import React, { useState } from 'react';
import {
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Barcode,
  Layers,
  Printer,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { InboundShipment, InboundItem, SKUItem } from '../types/inventory';
import { BarcodeSVG } from '../utils/formatters';

interface InboundDockViewProps {
  shipments: InboundShipment[];
  onReceiveShipmentItems: (shipmentId: string, receivedItems: { sku: string; qty: number; targetBin: string }[]) => void;
  skus: SKUItem[];
}

export const InboundDockView: React.FC<InboundDockViewProps> = ({
  shipments,
  onReceiveShipmentItems,
  skus,
}) => {
  const [activeShipmentId, setActiveShipmentId] = useState<string>(shipments[0]?.id || '');
  const [receivingModalOpen, setReceivingModalOpen] = useState<boolean>(false);

  const activeShipment = shipments.find((s) => s.id === activeShipmentId) || shipments[0];

  // State for receiving flow
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const [selectedBins, setSelectedBins] = useState<Record<string, string>>({});
  const [inspectNotes, setInspectNotes] = useState<string>('Visual packaging intact. Zero pallet damage.');

  const handleOpenReceive = (shipment: InboundShipment) => {
    setActiveShipmentId(shipment.id);
    const initialQtys: Record<string, number> = {};
    const initialBins: Record<string, string> = {};
    shipment.items.forEach((item) => {
      initialQtys[item.sku] = item.expectedQty;
      initialBins[item.sku] = item.targetBin;
    });
    setReceivedQuantities(initialQtys);
    setSelectedBins(initialBins);
    setReceivingModalOpen(true);
  };

  const handleConfirmReceive = () => {
    if (!activeShipment) return;
    const itemsToReceive = activeShipment.items.map((item) => ({
      sku: item.sku,
      qty: receivedQuantities[item.sku] ?? item.expectedQty,
      targetBin: selectedBins[item.sku] ?? item.targetBin,
    }));

    onReceiveShipmentItems(activeShipment.id, itemsToReceive);
    setReceivingModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded border border-[#e2e8f0] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wide">
              Inbound Dock Bay Management & Receiving
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
              Docks 1-4 Operational
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Real-time delivery manifests, carrier check-ins, quality inspection gates, and instant bin put-away allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenReceive(activeShipment)}
            disabled={activeShipment?.status === 'STORED'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed rounded shadow-xs transition-colors"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Process Active Manifest ({activeShipment?.poNumber})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Shipments List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Manifests List */}
        <div className="bg-white rounded border border-[#e2e8f0] p-4 shadow-xs flex flex-col">
          <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3">
            Active Inbound Shipments ({shipments.length})
          </h3>

          <div className="space-y-2.5 flex-1">
            {shipments.map((shp) => {
              const isSelected = shp.id === activeShipmentId;

              let statusBadge = (
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  {shp.status.replace('_', ' ')}
                </span>
              );
              if (shp.status === 'STORED') {
                statusBadge = (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    RECEIVED & STORED
                  </span>
                );
              } else if (shp.status === 'SCHEDULED') {
                statusBadge = (
                  <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    EN ROUTE
                  </span>
                );
              }

              return (
                <div
                  key={shp.id}
                  onClick={() => setActiveShipmentId(shp.id)}
                  className={`p-3 rounded border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#eff6ff] border-[#2563eb] shadow-xs'
                      : 'bg-white border-[#e2e8f0] hover:bg-[#f8fafc]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono font-bold text-xs text-[#0f172a]">
                      {shp.poNumber}
                    </span>
                    {statusBadge}
                  </div>

                  <p className="font-semibold text-[#0f172a] truncate">{shp.supplierName}</p>

                  <div className="flex items-center justify-between text-[11px] text-[#64748b] mt-2 pt-2 border-t border-[#f1f5f9]">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-[#94a3b8]" />
                      {shp.dockBay}
                    </span>
                    <span className="font-mono">{shp.palletsCount} Pallets</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Manifest Items & Receiving Station */}
        {activeShipment && (
          <div className="lg:col-span-2 bg-white rounded border border-[#e2e8f0] p-5 shadow-xs flex flex-col justify-between">
            <div>
              {/* Manifest Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e2e8f0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                      {activeShipment.poNumber}
                    </span>
                    <span className="text-xs font-semibold text-[#0f172a]">
                      Carrier: {activeShipment.carrier}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0f172a] mt-1.5">
                    {activeShipment.supplierName}
                  </h3>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[#64748b] block">Scheduled Arrival:</span>
                  <span className="font-bold text-[#0f172a] flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
                    {activeShipment.eta}
                  </span>
                  <span className="font-mono text-[11px] text-[#64748b] mt-0.5 block">
                    Assigned: {activeShipment.dockBay}
                  </span>
                </div>
              </div>

              {/* Items Manifest Table */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                    Bill of Lading Items ({activeShipment.items.length})
                  </h4>
                  <span className="text-[11px] text-[#64748b]">
                    Total Expected Units:{' '}
                    <strong className="text-[#0f172a]">
                      {activeShipment.items.reduce((acc, i) => acc + i.expectedQty, 0)} units
                    </strong>
                  </span>
                </div>

                <div className="border border-[#e2e8f0] rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#f8fafc] text-[#64748b] uppercase text-[10px] font-semibold border-b border-[#e2e8f0]">
                      <tr>
                        <th className="py-2 px-3">SKU Code</th>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-center">Expected</th>
                        <th className="py-2 px-3 text-center">Received</th>
                        <th className="py-2 px-3">Target Bin</th>
                        <th className="py-2 px-3 text-center">QC Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {activeShipment.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#f8fafc]">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#2563eb]">
                            {item.sku}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#0f172a] max-w-xs truncate">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-[#0f172a] tabular-nums">
                            {item.expectedQty}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-[#059669] tabular-nums">
                            {activeShipment.status === 'STORED' ? item.expectedQty : item.receivedQty}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {item.targetBin}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {activeShipment.status === 'STORED' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Passed
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Pending Dock Inspection
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#64748b]">
                <Barcode className="w-4 h-4 text-[#94a3b8]" />
                <span>Scan pallet tags to verify item counts and put-away locations.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-medium text-[#334155] bg-white border border-[#cbd5e1] rounded hover:bg-[#f8fafc] flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dock Manifest</span>
                </button>

                {activeShipment.status !== 'STORED' ? (
                  <button
                    onClick={() => handleOpenReceive(activeShipment)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Receive & Store In Stock</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed & Transferred to Bins
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Receiving Put-Away Modal Wizard */}
      {receivingModalOpen && activeShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-lg border border-[#cbd5e1] max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#e2e8f0]">
              <div>
                <span className="text-xs font-bold text-[#2563eb] font-mono">
                  {activeShipment.poNumber} · RECEIVING WIZARD
                </span>
                <h3 className="text-base font-bold text-[#0f172a] mt-0.5">
                  Confirm Inbound Counts & Target Bin Assignment
                </h3>
              </div>
              <button
                onClick={() => setReceivingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#64748b]">
              Verify physically counted quantities and target bin slot destinations before crediting inventory.
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {activeShipment.items.map((item) => (
                <div
                  key={item.sku}
                  className="p-3 bg-[#f8fafc] rounded border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-[#2563eb]">{item.sku}</div>
                    <div className="font-semibold text-[#0f172a] mt-0.5">{item.name}</div>
                    <div className="text-[11px] text-[#64748b] mt-0.5">
                      Expected Manifest Qty: <strong>{item.expectedQty} units</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#64748b] uppercase">
                        Received Qty
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={receivedQuantities[item.sku] ?? item.expectedQty}
                        onChange={(e) =>
                          setReceivedQuantities({
                            ...receivedQuantities,
                            [item.sku]: Number(e.target.value),
                          })
                        }
                        className="w-20 px-2 py-1 font-mono font-bold text-center border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#64748b] uppercase">
                        Destination Bin
                      </label>
                      <input
                        type="text"
                        value={selectedBins[item.sku] ?? item.targetBin}
                        onChange={(e) =>
                          setSelectedBins({
                            ...selectedBins,
                            [item.sku]: e.target.value,
                          })
                        }
                        className="w-24 px-2 py-1 font-mono font-bold text-center border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1">
                Quality & Inspection Notes
              </label>
              <textarea
                value={inspectNotes}
                onChange={(e) => setInspectNotes(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
              <button
                onClick={() => setReceivingModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReceive}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Commit to Inventory & Complete PO</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
