---
name: Apex Warehouse & Inventory
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006243'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d57'
  on-tertiary-container: '#bdffdc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system targets logistics operators, supply chain directors, and warehouse floor managers who demand operational clarity, density without clutter, and zero visual ambiguity. The interface prioritizes real-time status readability, high information throughput, and rapid keyboard or pointer navigation.

The design movement combines **Modern Enterprise Dashboard architecture** with refined administrative rigor:
- **Structural Clarity:** High-contrast persistent deep slate navigation framing a luminous, low-fatigue workspace.
- **Utilitarian Elegance:** Information hierarchy expressed via clean borders, tight typography, and explicit semantic status colors rather than decorative flourishes.
- **Confidence & Precision:** Crisp card-based modular panels, tabular data precision, and instantaneous status recognition (in stock, low warning, depleted).

## Colors

The palette establishes strict functional roles to maximize operational speed and minimize human error across inventory operations:

- **Primary (`#2563eb` / `#3b82f6`):** Enterprise cobalt blue reserved for interactive primaries, active tab indicators, bulk action triggers, and active breadcrumbs.
- **Secondary / Canvas Chrome (`#0f172a` / `#1e293b`):** Deep slate and midnight navy powering the persistent left navigation bar, terminal badges, and primary high-priority headers.
- **Tertiary / Success (`#059669` / `#10b981`):** Precision emerald signifying healthy stock, received shipments, validated counts, and completed orders.
- **Alert / Warning (`#d97706` / `#f59e0b`):** Warm amber dedicated to low-stock thresholds, reorder warnings, and pending quality checks.
- **Danger / Critical (`#e11d48` / `#f43f5e`):** Rose red indicating out-of-stock items, blocked SKUs, damaged inventory, and critical discrepancies.
- **Neutral & Canvas Surfaces:** Background canvas set to `#f8fafc` (slate-50), container card surfaces on `#ffffff`, with structured borders built from `#e2e8f0` (slate-200) and text hierarchy across `#0f172a` (primary), `#475569` (secondary), and `#94a3b8` (muted).

## Typography

The design system utilizes **Inter** across all typographic applications to ensure uniform legibility in tabular structures, numeric readouts, and alphanumeric SKU sequences:

- **Monospaced Numerics:** Numeric values within tables, metrics cards, and serial numbers must enable `font-variant-numeric: tabular-nums` to maintain aligned columns.
- **Micro-Labels & Status Badges:** Use `label-md` and `label-sm` with explicit uppercase transforms and subtle letter-spacing for state indicators (e.g., `IN STOCK`, `BIN A-14`).
- **Hierarchy Separation:** Headers emphasize structural weight (`600` and `700`) with tight letter-spacing to prevent visual spill over compact multi-column views.

## Layout & Spacing

The layout model is anchored by a persistent collapsible lateral rail (260px expanded, 72px iconified) paired with a responsive fluid 12-column administrative grid on the main viewport:

- **Desktop (>= 1200px):** 12 columns with `1.25rem` (20px) gutters and `1.5rem` (24px) outer margins. Metric KPI ribbons accommodate 4 or 5 columns inline.
- **Tablet (768px - 1199px):** 8 columns, sidebar collapses automatically into an icon rail or off-canvas overlay, KPI cards stack 2x2.
- **Mobile (< 768px):** 4 columns with `0.75rem` (12px) gutters and `1rem` margins. All tables switch to horizontal-scroll wrappers or individual item card units.
- **Internal Spacing Rhythm:** Component padding operates on strict 4px sub-intervals (8px internal for compact table cells, 16px to 20px card panel padding).

## Elevation & Depth

Depth is established through low-contrast structural borders and delicate ambient light drop shadows rather than heavy layering:

- **Level 0 (Workspace Canvas):** `#f8fafc`, entirely flat.
- **Level 1 (Cards, Metric Containers, Data Grids):** Pure `#ffffff` surface, bounded by a 1px solid border in `#e2e8f0`, supported by a subtle dual shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Dropdowns, Popovers, Filter Bars):** `#ffffff` surface with border `#cbd5e1` and expanded shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modal Overlays, SKU Scanning Drawers):** `#ffffff` surface with shadow `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`. Backdrops use `rgba(15, 23, 42, 0.6)` with 2px backdrop blur.
- **Sidebar & Chrome:** `#0f172a` base surface with a right dividing border in `#1e293b`.

## Shapes

The design system employs **Soft (`1`)** geometry, reflecting professional precision and high data packing:

- Standard controls, inputs, buttons, and badges utilize `0.25rem` (4px) to `0.375rem` (6px) corner radii.
- Cards, modal dialogs, and large tabular containers leverage `0.5rem` (8px).
- Badges and count indicator pills leverage full rounded shapes (`9999px`) to immediately visually differentiate tags from interactive buttons and field inputs.

## Components

### Buttons
- **Primary:** Solid `#2563eb` background, white text, 1px border `#1d4ed8`. Hover: `#1d4ed8`. Active: `#1e40af`. Focus: 3px ring `#93c5fd` with 1px offset.
- **Secondary / Default:** `#ffffff` background, `#334155` text, 1px solid `#cbd5e1`. Hover: `#f8fafc` and `#0f172a` text.
- **Destructive:** Solid `#e11d48` or soft tint `#fff1f2` with `#be123c` text and `#fecdd3` border for low-stock deallocations or quarantine actions.
- **Sizing:** Compact height (32px for table row tools, 38px for main toolbar actions) with horizontal padding of 12px and 16px respectively.

### Badges & Status Indicators
- Structured with a soft tint background, 1px solid border, and saturated text for instant recognition:
  - **In Stock:** `#ecfdf5` background, `#a7f3d0` border, `#047857` text.
  - **Low Stock / Reorder:** `#fffbeb` background, `#fde68a` border, `#b45309` text.
  - **Depleted / Urgent:** `#fff1f2` background, `#fecdd3` border, `#be123c` text.
  - **Draft / Inactive:** `#f1f5f9` background, `#e2e8f0` border, `#475569` text.

### Metric / KPI Cards
- White surface, 1px solid `#e2e8f0` border, 16px internal padding.
- Structure includes: upper muted label (`label-md`), large primary numeric value (`headline-lg` with tabular numbers), trailing 14-day micro trend delta indicator pill (+12.4% in emerald or -3.1% in rose), and a subtle category icon recessed in an ambient neutral background square.

### Data Tables
- Header row: `#f8fafc` background, uppercase `label-md` text in `#64748b`, 1px bottom border `#cbd5e1`.
- Row cells: `#ffffff` surface, 11px vertical padding, 14px horizontal padding, 1px bottom border `#f1f5f9`.
- Row hover: `#f8fafc` transition. Selected rows: `#eff6ff` with a left 3px `#2563eb` accent bar.
- SKU column: Monospaced Inter font variant with quick-copy clipboard triggers on hover.

### Inputs & Filters
- Background: `#ffffff`, 1px border `#cbd5e1`, 8px 12px padding, font size `13px`. Focus border: `#2563eb` with 3px `#bfdbfe` ring.
- Inline search bars incorporate a magnifying glass icon prefixed at 12px indent and keyboard shortcut hint (`⌘K` or `Ctrl+K`) anchored on the right.

### Tabs & Navigation Architecture
- **Horizontal Tabs:** Clean underlined or boxed segmentation. Active tab features 2px solid `#2563eb` bottom indicator with `#2563eb` bold text; inactive tabs use `#64748b` with hover transition to `#0f172a`.
- **Sidebar Rails:** `#0f172a` canvas, `#94a3b8` text and icons. Hover state: `#1e293b` fill with `#ffffff` text. Active state: `#1e293b` with a left `#3b82f6` border highlight and pure `#ffffff` text.