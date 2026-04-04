# Plan 09 — Results UX: domestic toggle, context summary, transparency

**Date** : 2026-04-04
**Scope** : Improve results screen UX after M5 → domestic overlay refactor (PR #4)
**Branch** : `fix/results-ux-domestic-toggle`

## Problem

After removing M5 as a standalone model and replacing it with a domestic toggle overlay on M2/M3/M4:

1. The toggle (PillToggle) doesn't look like an on/off control
2. The default hourly rate (SMIC) is not documented in the UI
3. Domestic values per person (hours + euros) are invisible — users can't understand adjusted results
4. Results appear decontextualized — no reminder of input data (revenues, charges)

## Solution

4 changes, ordered by dependency:

### Phase 1 — Switch component (`ui/Switch.tsx`)

New generic switch component replacing PillToggle for the domestic toggle.

**Specs:**

- Track: 36x20px, `bg-border` (off) / `bg-accent` (on), border-border when off, radius-full
- Knob: 16px white circle, translateX 2→18px, box-shadow `0 1px 3px rgba(0,0,0,0.3)`
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (project standard)
- Label: DM Sans 14px, right of track, gap-3, `text-text` (on) / `text-text-dim` (off)
- Touch: entire button (track + label) clickable, min-height 48px
- ARIA: `<button role="switch" aria-checked={checked}>`, focus-visible outline 2px accent offset 2px
- Reduced motion: no transform transition, instant background change

**Props:** `checked: boolean`, `onChange: (v: boolean) => void`, `label: string`

**Files:**

- `src/components/ui/Switch.tsx` — new
- `tests/unit/components/ui/Switch.test.tsx` — new

### Phase 2 — Domestic toggle bloc (in `ResultsShell.tsx`)

Replace PillToggle with Switch. When ON, expand to show hourly rate + domestic breakdown.

**Layout (card bg-surface border-border rounded-xl p-5 md:p-6):**

- Row 1: Switch with label "Valoriser le travail domestique"
- Row 2 (if ON): FormField for hourly rate + "SMIC net 2026" hint in `text-xs text-text-dim`
- Row 3 (if ON): label "Répartition estimée" in `DM Mono 10px uppercase tracking-[0.1em] text-text-muted`, then per-person line in `text-sm text-text-dim`: "{name} : {hours}h/sem · {value} €/mois"

**Data source:** `results.domestic` (already computed by `computeDomesticOverlays`)

**Files:**

- `src/components/results/ResultsShell.tsx` — modify

### Phase 3 — Context summary (`ResultsSummary.tsx`)

New component placed above "Comparaison des modèles" heading.

**Layout (Persona Reference Block pattern):**

- Card: `bg-surface border border-border rounded-xl` padding `20px 28px`
- Title: "Vos données" in `DM Mono 10px uppercase tracking-[0.1em] text-text-muted mb-4`
- Grid: `grid-cols-2 gap-x-6 gap-y-1` (mobile: 1 col stacked)
- Names: `DM Sans 14px font-medium text-text`
- Values: `DM Mono 13px text-text-dim`, formatted with `formatCurrency()`
- Separator: `h-px bg-border my-3` before common charges
- Common charges: centered, `text-sm text-text-dim`

**Props:** `p1Name, p2Name, p1Income, p2Income, p1PersonalCharges, p2PersonalCharges, commonCharges`

**Files:**

- `src/components/results/ResultsSummary.tsx` — new
- `tests/unit/components/results/ResultsSummary.test.tsx` — new
- `src/components/results/ResultsShell.tsx` — integrate

### Phase 4 — Domestic credit rows in `ComparisonTable`

When `domesticEnabled`, insert two rows between "Part P1/P2" and "Reste à vivre P1/P2":

- Label: "dont crédit {name}" — lowercase, explanatory
- Style: `text-xs italic text-text-dim`
- M1 column: "—" (M1 is never adjusted)
- M2/M3/M4: `-{value}` formatted with formatCurrency, preceded by minus sign
- Values from `results.domestic.p1DomesticMonthlyValue` / `p2DomesticMonthlyValue` (same credit across all models)
- Locked models: show nothing (same behavior as other rows)

**Files:**

- `src/components/results/ComparisonTable.tsx` — modify
- `tests/unit/components/results/ComparisonTable.test.tsx` — add tests

## Implementation order

1. Phase 1 (Switch) — no dependencies
2. Phase 2 (toggle bloc) — depends on Phase 1
3. Phase 3 (ResultsSummary) — independent, can parallel with Phase 2
4. Phase 4 (credit rows) — independent, can parallel

## Out of scope

- PillToggle removal — keep it, still used elsewhere potentially
- What-If integration with domestic toggle
- URL encoding of domesticEnabled
