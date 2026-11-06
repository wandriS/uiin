import React, { useState } from 'react';
import {
  Barcode,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Plus,
  Minus,
  Sparkles,
  Layers,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SKUItem } from '../types/inventory';
import { formatCurrency, getStatusMeta, BarcodeSVG, QRCodeSVG } from '../utils/formatters';

interface BarcodeScannerModalProps {
  skus: SKUItem[];
  onAdjustStock: (sku: SKUItem, delta: number) => void;
  onOpenTransferModal: (sku: SKUItem) => void;
  onSelectSku: (sku: SKUItem) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  skus,
  onAdjustStock,
  onOpenTransferModal,
  onSelectSku,
}) => {
  const [inputCode, setInputCode] = useState<string>('');
  const [matchedSku, setMatchedSku] = useState<SKUItem | null>(skus[0] || null);
  const [scanLaserActive, setScanLaserActive] = useState<boolean>(false);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);
  const [scanMessage, setScanMessage] = useState<string>('Terminal Ready. Scan barcode or SKU code.');

  const playBeep = () => {
    if (!audioFeedback) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext fallback
    }
  };

  const handleScan = (codeToTest: string) => {
    setScanLaserActive(true);
    const clean = codeToTest.trim().toLowerCase();

    setTimeout(() => {
      setScanLaserActive(false);
      const match = skus.find(
        (s) =>
          s.sku.toLowerCase() === clean ||
          s.barcode.toLowerCase() === clean ||
          s.id.toLowerCase() === clean ||
          s.name.toLowerCase().includes(clean)
      );

      if (match) {
        setMatchedSku(match);
        setScanMessage(`Scan verified: ${match.sku} [${match.binLocation}]`);
        playBeep();
      } else {
        setScanMessage(`Unrecognized barcode: "${codeToTest}". Item not in local facility database.`);
      }
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      handleScan(inputCode);
    }
  };

  const statusMeta = matchedSku ? getStatusMeta(matchedSku.status) : null;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded border border-[#e2e8f0] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wide">
              Handheld Barcode & RFID Floor Scanner Terminal
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
              Terminal #TC-77 Active
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Simulates physical laser scanner input for rapid pick confirmation, bin cross-referencing, and cycle audit validation.
          </p>
        </div>

        <button
          onClick={() => setAudioFeedback(!audioFeedback)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#334155] bg-white border border-[#cbd5e1] rounded hover:bg-[#f8fafc] transition-colors"
        >
          {audioFeedback ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Laser Audio ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>Laser Audio MUTE</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Terminal Laser Emulation */}
        <div className="bg-[#0f172a] text-white rounded border border-[#1e293b] p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] text-xs">
              <span className="font-mono text-[#38bdf8] font-bold tracking-wider">
                LASER EMULATOR // OPTICON-9000
              </span>
              <span className="text-[#94a3b8] font-mono text-[11px]">MODE: CONTINUOUS-TRIGGER</span>
            </div>

            {/* Simulated Scanning Viewport */}
            <div className="my-5 relative h-44 bg-[#020617] rounded border border-[#334155] flex flex-col items-center justify-center overflow-hidden">
              {/* Laser beam */}
              <div
                className={`absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] transition-all duration-300 ${
                  scanLaserActive
                    ? 'top-1/2 opacity-100 scale-x-100'
                    : 'top-1/3 opacity-30 scale-x-75 animate-pulse'
                }`}
              />

              {/* Viewport Reticle */}
              <div className="border border-dashed border-slate-600 w-4/5 h-28 rounded flex flex-col items-center justify-center p-2 relative">
                <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-rose-500" />
                <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-rose-500" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-rose-500" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-rose-500" />

                {matchedSku ? (
                  <div className="text-center">
                    <span className="font-mono text-sm font-bold text-white tracking-widest block">
                      {matchedSku.sku}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 mt-1 block">
                      *{matchedSku.barcode}*
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">AIM AT BARCODE</span>
                )}
              </div>

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-[#94a3b8] font-mono">
                <span>BEAM: 650nm RED</span>
                <span className="text-emerald-400 font-bold">{scanMessage}</span>
              </div>
            </div>

            {/* Input for Manual Trigger */}
            <form onSubmit={handleSubmit} className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Manual SKU / Barcode Entry or Wand Gun Trigger:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="e.g. APX-ROB-4092 or APX1029384756..."
                  className="flex-1 bg-[#1e293b] text-white font-mono text-xs px-3 py-2 rounded border border-[#334155] focus:outline-none focus:border-[#38bdf8]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
                >
                  <Barcode className="w-4 h-4" />
                  <span>Scan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick barcode test buttons */}
          <div className="mt-5 pt-3 border-t border-[#1e293b]">
            <span className="text-[10px] text-[#64748b] uppercase tracking-wider block mb-2 font-bold">
              Quick Test Sample Barcodes from Floor:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skus.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setInputCode(s.sku);
                    handleScan(s.sku);
                  }}
                  className="px-2 py-1 bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded font-mono text-[11px] border border-slate-700 transition-colors"
                >
                  {s.sku}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Scanned Item Live Dossier */}
        <div className="bg-white rounded border border-[#e2e8f0] p-5 shadow-xs flex flex-col justify-between">
          {matchedSku && statusMeta ? (
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-[#e2e8f0]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                      {matchedSku.sku}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full border ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                      {statusMeta.label}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0f172a] leading-tight">
                    {matchedSku.name}
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">{matchedSku.category}</p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-[#1e293b] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded inline-flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#2563eb]" />
                    {matchedSku.binLocation}
                  </span>
                  <span className="text-[10px] text-[#94a3b8] block mt-1">
                    {matchedSku.warehouseName.split('·')[0]}
                  </span>
                </div>
              </div>

              {/* Physical Counts & Thresholds */}
              <div className="py-4 space-y-3 border-b border-[#e2e8f0]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b]">Count on Hand:</span>
                  <span className="font-mono font-bold text-base text-[#0f172a] tabular-nums">
                    {matchedSku.quantityOnHand} units{' '}
                    <span className="text-xs font-normal text-[#94a3b8]">
                      (Capacity: {matchedSku.maxCapacity})
                    </span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      matchedSku.quantityOnHand === 0
                        ? 'bg-rose-500'
                        : matchedSku.quantityOnHand <= matchedSku.minThreshold
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((matchedSku.quantityOnHand / matchedSku.maxCapacity) * 100)
                      )}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-[#f8fafc] p-2 rounded border border-[#e2e8f0]">
                    <span className="text-[11px] text-[#64748b] block">Unit Value</span>
                    <span className="font-mono font-bold text-[#0f172a]">
                      {formatCurrency(matchedSku.unitCost)}
                    </span>
                  </div>
                  <div className="bg-[#f8fafc] p-2 rounded border border-[#e2e8f0]">
                    <span className="text-[11px] text-[#64748b] block">Reorder Minimum</span>
                    <span className="font-mono font-bold text-[#0f172a]">
                      {matchedSku.minThreshold} units
                    </span>
                  </div>
                </div>
              </div>

              {/* Barcode Preview */}
              <div className="py-3">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                  Attached Barcode Symbol
                </span>
                <div className="bg-[#f8fafc] p-2.5 rounded border border-slate-200">
                  <BarcodeSVG value={matchedSku.barcode} height={32} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#94a3b8]">
              <Barcode className="w-12 h-12 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-[#0f172a]">No Item Scanned</p>
              <p className="text-xs text-[#64748b] mt-1">
                Enter a SKU or click any quick test barcode on the left.
              </p>
            </div>
          )}

          {/* Quick Actions Footer */}
          {matchedSku && (
            <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAdjustStock(matchedSku, -1)}
                  disabled={matchedSku.quantityOnHand <= 0}
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded flex items-center gap-1 disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Pick (-1)</span>
                </button>

                <button
                  onClick={() => onAdjustStock(matchedSku, 1)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Stock (+1)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenTransferModal(matchedSku)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#334155] bg-white hover:bg-slate-50 border border-slate-300 rounded flex items-center gap-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#2563eb]" />
                  <span>Relocate</span>
                </button>

                <button
                  onClick={() => onSelectSku(matchedSku)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded shadow-xs"
                >
                  Full Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
