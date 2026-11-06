import React, { useState } from 'react';
import { X, Plus, Sparkles, CheckCircle2, Layers } from 'lucide-react';
import { SKUItem, BinSlot } from '../types/inventory';

interface NewSkuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSku: (newSku: SKUItem) => void;
  bins: BinSlot[];
  warehouseId: string;
}

export const NewSkuModal: React.FC<NewSkuModalProps> = ({
  isOpen,
  onClose,
  onAddSku,
  bins,
  warehouseId,
}) => {
  if (!isOpen) return null;

  const [skuCode, setSkuCode] = useState<string>('APX-ROB-5501');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Industrial Robotics');
  const [binLocation, setBinLocation] = useState<string>(bins[0]?.code || 'BIN A-03');
  const [quantityOnHand, setQuantityOnHand] = useState<number>(20);
  const [minThreshold, setMinThreshold] = useState<number>(10);
  const [maxCapacity, setMaxCapacity] = useState<number>(100);
  const [unitCost, setUnitCost] = useState<number>(250.00);
  const [sellingPrice, setSellingPrice] = useState<number>(420.00);
  const [supplierName, setSupplierName] = useState<string>('Kanto Precision Robotics Ltd');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [weightKg, setWeightKg] = useState<number>(1.5);
  const [dimensions, setDimensions] = useState<string>('150 x 100 x 80 mm');

  const handleGenerateSku = () => {
    const prefixes: Record<string, string> = {
      'Industrial Robotics': 'APX-ROB',
      'Hydraulics & Pneumatics': 'APX-HYD',
      'Precision Optics': 'APX-OPT',
      'Motors & Drives': 'APX-MTR',
      'Sensors & Control': 'APX-SEN',
      'Fasteners & Hardware': 'APX-FST',
      'Raw Materials': 'APX-RAW',
    };
    const p = prefixes[category] || 'APX-GEN';
    const num = Math.floor(1000 + Math.random() * 9000);
    setSkuCode(`${p}-${num}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !skuCode.trim()) return;

    const barcodeNum = 'APX' + Math.floor(1000000000 + Math.random() * 9000000000);

    const newItem: SKUItem = {
      id: `sku-${Date.now()}`,
      sku: skuCode.trim().toUpperCase(),
      name: name.trim(),
      category,
      binLocation,
      zone: binLocation.includes('BIN A')
        ? 'Zone A (High Velocity)'
        : binLocation.includes('BIN B')
        ? 'Zone B (Bulk Fluidics)'
        : binLocation.includes('BIN C')
        ? 'Zone C (Cleanroom & Optics)'
        : 'Zone D (Hardware & Fasteners)',
      warehouseId,
      warehouseName:
        warehouseId === 'wh-beta'
          ? 'Facility Beta · Chicago Hub'
          : warehouseId === 'wh-gamma'
          ? 'Facility Gamma · Rotterdam Europort'
          : 'Warehouse Alpha · Seattle Central',
      quantityOnHand,
      minThreshold,
      maxCapacity,
      reorderQuantity: Math.max(10, minThreshold * 2),
      unitCost,
      sellingPrice,
      status: quantityOnHand === 0 ? 'DEPLETED' : quantityOnHand <= minThreshold ? 'LOW_STOCK' : 'IN_STOCK',
      barcode: barcodeNum,
      lastAudited: new Date().toISOString().split('T')[0],
      lastRestocked: new Date().toISOString().split('T')[0],
      supplier: {
        id: `sup-${Date.now()}`,
        name: supplierName,
        contactEmail: 'vendor.rep@supplier.com',
        leadTimeDays,
        phone: '+1 800 555 0199',
      },
      weightKg,
      dimensions,
    };

    onAddSku(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div
        className="bg-white rounded-lg border border-[#cbd5e1] max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-[#e2e8f0]">
          <div>
            <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">
              Catalog Intake
            </span>
            <h3 className="text-base font-bold text-[#0f172a] mt-0.5">
              Register New SKU & Receive Floor Stock
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* SKU Code & Generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#64748b]">
                Unique SKU Identifier *
              </label>
              <button
                type="button"
                onClick={handleGenerateSku}
                className="text-[11px] text-[#2563eb] hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                Auto Generate
              </button>
            </div>
            <input
              type="text"
              required
              value={skuCode}
              onChange={(e) => setSkuCode(e.target.value)}
              placeholder="e.g. APX-ROB-4092"
              className="w-full font-mono font-bold text-xs bg-[#f8fafc] border border-slate-300 rounded px-3 py-2 uppercase focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
              Item Name / Description *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High Torque Planetary Gearbox 24:1 Ratio"
              className="w-full text-xs bg-[#f8fafc] border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* Category & Assigned Bin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
                className="w-full text-xs bg-[#f8fafc] border border-slate-300 rounded px-2.5 py-2 focus:outline-none focus:border-[#2563eb]"
              >
                <option value="Industrial Robotics">Industrial Robotics</option>
                <option value="Hydraulics & Pneumatics">Hydraulics & Pneumatics</option>
                <option value="Precision Optics">Precision Optics</option>
                <option value="Motors & Drives">Motors & Drives</option>
                <option value="Sensors & Control">Sensors & Control</option>
                <option value="Fasteners & Hardware">Fasteners & Hardware</option>
                <option value="Raw Materials">Raw Materials</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                Destination Storage Bin
              </label>
              <select
                value={binLocation}
                onChange={(e) => setBinLocation(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-[#f8fafc] border border-slate-300 rounded px-2.5 py-2 focus:outline-none focus:border-[#2563eb]"
              >
                {bins.map((b) => (
                  <option key={b.id} value={b.code}>
                    {b.code} ({b.zone} · {b.currentUnits}/{b.maxCapacityUnits} units)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantities & Safety Thresholds */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                Initial Received Qty
              </label>
              <input
                type="number"
                min="0"
                value={quantityOnHand}
                onChange={(e) => setQuantityOnHand(Number(e.target.value))}
                className="w-full font-mono text-center text-xs bg-[#f8fafc] border border-slate-300 rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                Safety Min Threshold
              </label>
              <input
                type="number"
                min="1"
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full font-mono text-center text-xs bg-[#f8fafc] border border-slate-300 rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                Max Bin Capacity
              </label>
              <input
                type="number"
                min="5"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full font-mono text-center text-xs bg-[#f8fafc] border border-slate-300 rounded px-2 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          {/* Unit Cost & Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                Unit Cost Basis ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full font-mono text-xs bg-[#f8fafc] border border-slate-300 rounded px-3 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                MSRP / Selling Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full font-mono text-xs bg-[#f8fafc] border border-slate-300 rounded px-3 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          {/* Supplier Name & Lead Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                Primary Supplier Name
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Kanto Precision Robotics"
                className="w-full text-xs bg-[#f8fafc] border border-slate-300 rounded px-3 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                Vendor Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="w-full font-mono text-xs bg-[#f8fafc] border border-slate-300 rounded px-3 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          {/* Dimensions & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                Unit Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full text-xs bg-[#f8fafc] border border-slate-300 rounded px-3 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 150 x 100 x 80 mm"
                className="w-full text-xs bg-[#f8fafc] border border-slate-300 rounded px-3 py-1.5 focus:outline-none"
              />
            </div>
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
              <Plus className="w-4 h-4" />
              <span>Register SKU & Store In Bin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
