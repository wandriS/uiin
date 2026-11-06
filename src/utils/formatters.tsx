import React from 'react';
import { StockStatus } from '../types/inventory';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getStatusMeta(status: StockStatus) {
  switch (status) {
    case 'IN_STOCK':
      return {
        label: 'IN STOCK',
        bg: 'bg-[#ecfdf5]',
        border: 'border-[#a7f3d0]',
        text: 'text-[#047857]',
        dot: 'bg-[#10b981]',
      };
    case 'LOW_STOCK':
      return {
        label: 'LOW STOCK',
        bg: 'bg-[#fffbeb]',
        border: 'border-[#fde68a]',
        text: 'text-[#b45309]',
        dot: 'bg-[#f59e0b]',
      };
    case 'DEPLETED':
      return {
        label: 'DEPLETED',
        bg: 'bg-[#fff1f2]',
        border: 'border-[#fecdd3]',
        text: 'text-[#be123c]',
        dot: 'bg-[#f43f5e]',
      };
    case 'DRAFT':
    default:
      return {
        label: 'DRAFT',
        bg: 'bg-[#f1f5f9]',
        border: 'border-[#e2e8f0]',
        text: 'text-[#475569]',
        dot: 'bg-[#94a3b8]',
      };
  }
}

/**
 * Realistic vector Code-128 style barcode generator
 */
export const BarcodeSVG: React.FC<{ value: string; className?: string; height?: number }> = ({
  value,
  className = '',
  height = 42,
}) => {
  // Deterministic bar widths based on char codes
  const bars: { width: number; isSpace: boolean }[] = [];
  bars.push({ width: 3, isSpace: false }, { width: 1, isSpace: true }, { width: 1, isSpace: false }); // start pattern

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const w1 = (code % 3) + 1;
    const s1 = ((code >> 1) % 2) + 1;
    const w2 = ((code >> 2) % 3) + 1;
    const s2 = ((code >> 3) % 2) + 1;
    bars.push({ width: w1, isSpace: false });
    bars.push({ width: s1, isSpace: true });
    bars.push({ width: w2, isSpace: false });
    bars.push({ width: s2, isSpace: true });
  }
  bars.push({ width: 2, isSpace: false }, { width: 1, isSpace: true }, { width: 4, isSpace: false }); // stop pattern

  let currentX = 10;
  const rects: { x: number; width: number }[] = [];
  bars.forEach((bar) => {
    if (!bar.isSpace) {
      rects.push({ x: currentX, width: bar.width * 1.5 });
    }
    currentX += bar.width * 1.5;
  });

  const totalWidth = currentX + 10;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full h-auto max-h-12"
        fill="currentColor"
        shapeRendering="crispEdges"
      >
        {rects.map((r, idx) => (
          <rect key={idx} x={r.x} y="0" width={r.width} height={height} className="fill-[#0f172a]" />
        ))}
      </svg>
      <span className="font-mono text-[11px] tracking-[0.25em] text-[#475569] mt-1 tabular-nums uppercase">
        *{value}*
      </span>
    </div>
  );
};

/**
 * QR Code Vector Visualizer
 */
export const QRCodeSVG: React.FC<{ value: string; size?: number; className?: string }> = ({
  value,
  size = 76,
  className = '',
}) => {
  // 15x15 pseudo QR matrix deterministic from string
  const gridSize = 15;
  const cells: boolean[][] = [];
  
  for (let r = 0; r < gridSize; r++) {
    cells[r] = [];
    for (let c = 0; c < gridSize; c++) {
      // Corner detection patterns (3 corners)
      const inTopLeft = r < 4 && c < 4;
      const inTopRight = r < 4 && c >= gridSize - 4;
      const inBottomLeft = r >= gridSize - 4 && c < 4;

      if (inTopLeft || inTopRight || inBottomLeft) {
        // Outline of finder pattern
        const isBorder = (
          (r === 0 || r === 3) && (c <= 3) ||
          (c === 0 || c === 3) && (r <= 3) ||
          (r === 0 || r === 3) && (c >= gridSize - 4) ||
          (c === gridSize - 4 || c === gridSize - 1) && (r <= 3) ||
          (r === gridSize - 4 || r === gridSize - 1) && (c <= 3) ||
          (c === 0 || c === 3) && (r >= gridSize - 4)
        );
        const isCenter = (
          (r >= 1 && r <= 2 && c >= 1 && c <= 2) ||
          (r >= 1 && r <= 2 && c >= gridSize - 3 && c <= gridSize - 2) ||
          (r >= gridSize - 3 && r <= gridSize - 2 && c >= 1 && c <= 2)
        );
        cells[r][c] = isBorder || isCenter;
      } else {
        const hash = (value.charCodeAt((r + c) % value.length) * (r + 1) * 31 + c * 17) % 7;
        cells[r][c] = hash % 2 === 0;
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${gridSize} ${gridSize}`}
      width={size}
      height={size}
      className={`rounded bg-white p-1 border border-slate-200 ${className}`}
      shapeRendering="crispEdges"
    >
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" className="fill-[#0f172a]" /> : null
        )
      )}
    </svg>
  );
};
