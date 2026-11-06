import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Layers,
  DollarSign,
  AlertTriangle,
  Flame,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { SKUItem, StockMovement } from '../types/inventory';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface MetricCardsProps {
  totalSkus: number;
  totalUnits: number;
  totalValuation: number;
  lowStockCount: number;
  depletedCount: number;
  onFilterByStatus?: (status: string) => void;
  skus?: SKUItem[];
  movements?: StockMovement[];
  onSelectSku?: (sku: SKUItem) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalSkus,
  totalUnits,
  totalValuation,
  lowStockCount,
  depletedCount,
  onFilterByStatus,
  skus = [],
  movements = [],
  onSelectSku,
}) => {
  const [showForecast, setShowForecast] = useState<boolean>(true);
  const [timeHorizon, setTimeHorizon] = useState<14 | 30 | 60>(30);
  const [forecastView, setForecastView] = useState<'atRisk' | 'aggregate' | 'single'>('atRisk');
  const [selectedSkuId, setSelectedSkuId] = useState<string>('');

  const cards = [
    {
      id: 'active_skus',
      label: 'TOTAL ACTIVE SKUS',
      value: formatNumber(totalSkus),
      delta: '+4.2%',
      isPositive: true,
      timeframe: 'vs 14-day cycle',
      icon: Boxes,
      iconBg: 'bg-[#eff4ff] text-[#2563eb]',
      onClick: () => onFilterByStatus?.('ALL'),
    },
    {
      id: 'total_units',
      label: 'INVENTORY UNITS ON HAND',
      value: formatNumber(totalUnits),
      delta: '+12.4%',
      isPositive: true,
      timeframe: 'vs last audit',
      icon: Layers,
      iconBg: 'bg-[#eff6ff] text-[#0284c7]',
      onClick: () => onFilterByStatus?.('IN_STOCK'),
    },
    {
      id: 'inventory_valuation',
      label: 'TOTAL WAREHOUSE VALUATION',
      value: formatCurrency(totalValuation),
      delta: '+6.8%',
      isPositive: true,
      timeframe: 'extended cost basis',
      icon: DollarSign,
      iconBg: 'bg-[#ecfdf5] text-[#059669]',
    },
    {
      id: 'low_stock',
      label: 'LOW STOCK THRESHOLD',
      value: formatNumber(lowStockCount),
      delta: lowStockCount > 0 ? `${lowStockCount} SKUs` : 'Nominal',
      isPositive: lowStockCount === 0,
      timeframe: 'reorder required',
      icon: AlertTriangle,
      iconBg: 'bg-[#fffbeb] text-[#d97706]',
      onClick: () => onFilterByStatus?.('LOW_STOCK'),
    },
    {
      id: 'depleted',
      label: 'CRITICAL / DEPLETED',
      value: formatNumber(depletedCount),
      delta: depletedCount > 0 ? 'Urgent PO' : 'All Stocked',
      isPositive: depletedCount === 0,
      timeframe: 'zero quantity',
      icon: Flame,
      iconBg: 'bg-[#fff1f2] text-[#e11d48]',
      onClick: () => onFilterByStatus?.('DEPLETED'),
    },
  ];

  // Derive burn rates and depletion projections from SKUs and movements
  const skuDepletionStats = useMemo(() => {
    if (!skus || skus.length === 0) return [];

    return skus.map((sku) => {
      // Calculate realistic daily burn rate based on pick movements or category baseline
      const skuPicks = movements.filter(
        (m) => m.sku === sku.sku && (m.type === 'PICK_PACK' || m.deltaQuantity < 0)
      );
      const totalPicked = skuPicks.reduce((acc, m) => acc + Math.abs(m.deltaQuantity), 0);
      
      // Daily burn rate fallback based on minThreshold velocity
      const computedBurn = totalPicked > 0
        ? Math.max(0.4, Number((totalPicked / 4).toFixed(1)))
        : Number(Math.max(0.3, sku.minThreshold * 0.12).toFixed(1));

      const daysUntilBreach = sku.quantityOnHand <= sku.minThreshold
        ? 0
        : Math.max(0, Math.floor((sku.quantityOnHand - sku.minThreshold) / computedBurn));

      const daysUntilStockout = sku.quantityOnHand === 0
        ? 0
        : Number((sku.quantityOnHand / computedBurn).toFixed(1));

      return {
        ...sku,
        dailyBurnRate: computedBurn,
        daysUntilBreach,
        daysUntilStockout: Number(daysUntilStockout),
      };
    }).sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
  }, [skus, movements]);

  // Top at-risk SKUs (lowest days until stockout, but exclude 0 if already depleted unless all are 0)
  const atRiskSkus = useMemo(() => {
    const active = skuDepletionStats.filter((s) => s.quantityOnHand > 0);
    return active.slice(0, 4);
  }, [skuDepletionStats]);

  // Color mapping for multi-SKU lines
  const skuColors = [
    { stroke: '#e11d48', fill: '#ffe4e6', name: 'Critical' },     // Rose Red
    { stroke: '#d97706', fill: '#fef3c7', name: 'Warning' },      // Amber
    { stroke: '#2563eb', fill: '#dbeafe', name: 'Active' },       // Blue
    { stroke: '#7c3aed', fill: '#ede9fe', name: 'Secondary' },    // Purple
  ];

  // Generate projection time series data points
  const forecastData = useMemo(() => {
    const steps = timeHorizon === 14 ? 7 : timeHorizon === 30 ? 7 : 9;
    const intervalDays = Math.ceil(timeHorizon / (steps - 1));
    const dataPoints = [];

    const today = new Date('2026-11-06T09:00:00');

    for (let i = 0; i < steps; i++) {
      const dayOffset = i * intervalDays;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + dayOffset);

      const dayLabel = i === 0
        ? 'Today'
        : `+${dayOffset}d (${targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;

      const row: Record<string, any> = {
        day: dayOffset,
        dayLabel,
        rawDate: targetDate,
      };

      // Aggregate total projected units across warehouse
      let aggTotal = 0;
      let aggMinThreshold = 0;

      skuDepletionStats.forEach((sku) => {
        const projected = Math.max(0, Math.round(sku.quantityOnHand - sku.dailyBurnRate * dayOffset));
        aggTotal += projected;
        aggMinThreshold += sku.minThreshold;
      });

      row.totalProjected = aggTotal;
      row.totalThreshold = aggMinThreshold;

      // Project each of the top 4 at-risk SKUs
      atRiskSkus.forEach((sku, idx) => {
        const key = `sku_${idx}`;
        const projected = Math.max(0, Number((sku.quantityOnHand - sku.dailyBurnRate * dayOffset).toFixed(1)));
        row[key] = projected;
        row[`${key}_threshold`] = sku.minThreshold;
      });

      // If single SKU selected
      if (selectedSkuId) {
        const targetSku = skuDepletionStats.find((s) => s.id === selectedSkuId);
        if (targetSku) {
          row.singleProjected = Math.max(0, Number((targetSku.quantityOnHand - targetSku.dailyBurnRate * dayOffset).toFixed(1)));
          row.singleThreshold = targetSku.minThreshold;
        }
      }

      dataPoints.push(row);
    }

    return dataPoints;
  }, [timeHorizon, skuDepletionStats, atRiskSkus, selectedSkuId]);

  // Aggregate depletion velocity stats
  const totalBurnRate = useMemo(() => {
    return skuDepletionStats.reduce((sum, s) => sum + s.dailyBurnRate, 0).toFixed(1);
  }, [skuDepletionStats]);

  const nearestDepletionSku = atRiskSkus[0];

  return (
    <div className="space-y-4">
      {/* 5-Column Metric Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.onClick}
              className={`bg-white rounded border border-[#e2e8f0] p-4 flex flex-col justify-between transition-all shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-md hover:border-[#cbd5e1] ${
                card.onClick ? 'cursor-pointer group' : ''
              }`}
            >
              {/* Top row: Label + Icon */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-[#64748b] tracking-wider uppercase leading-none">
                  {card.label}
                </span>
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${card.iconBg}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              {/* Middle: Big Value */}
              <div className="my-1">
                <span className="text-xl lg:text-[22px] font-bold text-[#0f172a] tabular-nums tracking-tight leading-none block">
                  {card.value}
                </span>
              </div>

              {/* Bottom: 14-day micro trend delta indicator pill */}
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#f1f5f9] text-[11px]">
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-semibold tabular-nums text-[10px] ${
                    card.isPositive
                      ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                      : 'bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]'
                  }`}
                >
                  {card.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {card.delta}
                </span>
                <span className="text-[#94a3b8] truncate">{card.timeframe}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demand Forecasting & Depletion Timeline Panel */}
      <div className="bg-white rounded border border-[#e2e8f0] p-4 sm:p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#e2e8f0]">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-50 text-[#2563eb] border border-blue-200 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0f172a] tracking-tight uppercase">
                  Demand Forecasting & SKU Depletion Timelines
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  <Sparkles className="w-2.5 h-2.5" /> Predictive Model
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Projections modeled from floor picking velocity, historical lead times, and active safety stock buffers.
              </p>
            </div>
          </div>

          {/* Controls: Mode Switcher, Time Horizon & Collapse Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded border border-[#e2e8f0] text-xs">
              <button
                onClick={() => setForecastView('atRisk')}
                className={`px-2.5 py-1 font-medium rounded transition-all ${
                  forecastView === 'atRisk'
                    ? 'bg-white text-[#2563eb] shadow-xs font-semibold'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Top At-Risk SKUs
              </button>
              <button
                onClick={() => setForecastView('aggregate')}
                className={`px-2.5 py-1 font-medium rounded transition-all ${
                  forecastView === 'aggregate'
                    ? 'bg-white text-[#2563eb] shadow-xs font-semibold'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Aggregate Burn
              </button>
            </div>

            {/* Time Horizon */}
            <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded border border-[#e2e8f0] text-xs">
              {([14, 30, 60] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setTimeHorizon(h)}
                  className={`px-2.5 py-1 font-mono text-[11px] font-semibold rounded transition-all ${
                    timeHorizon === h
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  {h}d
                </button>
              ))}
            </div>

            {/* Collapse / Expand Toggle */}
            <button
              onClick={() => setShowForecast(!showForecast)}
              className="p-1.5 rounded text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-colors"
              title={showForecast ? 'Collapse Forecast' : 'Expand Forecast'}
              aria-label={showForecast ? 'Collapse Forecast' : 'Expand Forecast'}
            >
              {showForecast ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {showForecast && (
          <div className="pt-4 space-y-4 animate-in fade-in duration-200">
            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3 rounded border border-[#e2e8f0] text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  Warehouse Burn Velocity
                </span>
                <span className="text-sm font-bold text-[#0f172a] tabular-nums font-mono mt-0.5 block">
                  ~{totalBurnRate} units / day
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  Next Stockout Threat
                </span>
                {nearestDepletionSku ? (
                  <span className="text-sm font-bold text-rose-600 tabular-nums font-mono mt-0.5 block truncate">
                    {nearestDepletionSku.sku} ({nearestDepletionSku.daysUntilStockout}d)
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">All Healthy</span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  SKUs Below Safety Floor
                </span>
                <span className="text-sm font-bold text-[#d97706] tabular-nums font-mono mt-0.5 block">
                  {skuDepletionStats.filter((s) => s.quantityOnHand <= s.minThreshold).length} items
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  Procurement Buffer Target
                </span>
                <span className="text-sm font-bold text-[#059669] tabular-nums font-mono mt-0.5 block">
                  14 days coverage
                </span>
              </div>
            </div>

            {/* Main Recharts Container */}
            <div className="h-64 sm:h-72 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                {forecastView === 'aggregate' ? (
                  <ComposedChart
                    data={forecastData}
                    margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="aggGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="dayLabel"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      domain={[0, 'auto']}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0f172a] text-white p-3 rounded shadow-xl border border-slate-700 text-xs font-sans">
                            <span className="font-bold text-slate-300 block border-b border-slate-700 pb-1 mb-1.5">
                              {data.dayLabel} · Projected Inventory
                            </span>
                            <div className="flex items-center justify-between gap-4 py-0.5">
                              <span className="text-slate-400">Total Units Remaining:</span>
                              <span className="font-bold font-mono text-emerald-400 tabular-nums">
                                {data.totalProjected} units
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-0.5 text-[11px]">
                              <span className="text-slate-400">Warehouse Safety Min:</span>
                              <span className="font-mono text-amber-400 tabular-nums">
                                {data.totalThreshold} units
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalProjected"
                      name="Total Projected Units"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#aggGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="totalThreshold"
                      name="Aggregate Safety Floor"
                      stroke="#d97706"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </ComposedChart>
                ) : (
                  <LineChart
                    data={forecastData}
                    margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="dayLabel"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      domain={[0, 'auto']}
                    />
                    <ReferenceLine
                      y={0}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      label={{
                        value: 'Depleted Stockout Floor (0 Units)',
                        fill: '#ef4444',
                        fontSize: 10,
                        position: 'insideBottomRight',
                      }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0f172a] text-white p-3 rounded shadow-xl border border-slate-700 text-xs font-sans min-w-[200px]">
                            <span className="font-bold text-slate-300 block border-b border-slate-700 pb-1 mb-2 font-mono">
                              {data.dayLabel} Depletion Status
                            </span>
                            <div className="space-y-1.5">
                              {atRiskSkus.map((sku, idx) => {
                                const val = data[`sku_${idx}`];
                                const isZero = val === 0;
                                return (
                                  <div
                                    key={sku.id}
                                    className="flex items-center justify-between gap-3 text-[11px]"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: skuColors[idx].stroke }}
                                      />
                                      <span className="font-mono text-slate-200">{sku.sku}:</span>
                                    </div>
                                    <span
                                      className={`font-mono font-bold tabular-nums ${
                                        isZero ? 'text-rose-400 font-black' : 'text-slate-100'
                                      }`}
                                    >
                                      {val} u {isZero ? '(DEPLETED)' : ''}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }}
                    />
                    {atRiskSkus.map((sku, idx) => (
                      <Line
                        key={sku.id}
                        type="monotone"
                        dataKey={`sku_${idx}`}
                        name={sku.sku}
                        stroke={skuColors[idx].stroke}
                        strokeWidth={2.2}
                        dot={{ r: 3, fill: skuColors[idx].stroke }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* At-Risk SKU Depletion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {atRiskSkus.map((sku, idx) => {
                const isCritical = sku.daysUntilStockout <= 7;
                return (
                  <div
                    key={sku.id}
                    onClick={() => onSelectSku?.(sku)}
                    className="p-3 bg-white rounded border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: skuColors[idx].stroke }}
                        />
                        <span className="font-mono text-xs font-bold text-[#0f172a] group-hover:text-[#2563eb]">
                          {sku.sku}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-[#fff1f2] text-[#be123c] border-[#fecdd3]'
                            : 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'
                        }`}
                      >
                        {isCritical ? 'CRITICAL' : 'REORDER'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#64748b] truncate leading-tight mt-0.5" title={sku.name}>
                      {sku.name}
                    </p>

                    <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-[#f1f5f9]">
                      <span className="text-[#64748b]">
                        Stock: <strong className="text-[#0f172a] font-mono">{sku.quantityOnHand}u</strong>
                      </span>
                      <span
                        className={`font-semibold font-mono ${
                          isCritical ? 'text-rose-600' : 'text-amber-700'
                        }`}
                      >
                        Stockout: ~{sku.daysUntilStockout}d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
