# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**QuotePart** — a financial equity simulator for couples and households. Helps couples compare 5 equity models applied to their real income/expense data to facilitate informed financial conversations.

Tag line: _"Pas une calculette. Un outil de dialogue."_

Full product spec: `quotepart-cadrage-v03.md`

## Current State

**Phase: URL encoding / P2 flow (Plan 05)**

Reference files:

- `docs/reference/prototype.jsx` — original UI prototype (visual reference only)
- `docs/reference/frontend-guide.md` — **frontend conventions, design tokens, accessibility rules** (consult before any UI work)
- `quotepart-cadrage-v03.md` — full product specification (French)

## Implementation Plans

Plans are in `docs/plans/` — execute in order:

| Plan                        | File                                               | Status      |
| --------------------------- | -------------------------------------------------- | ----------- |
| 01 — Bootstrap              | `docs/plans/2026-03-17-01-bootstrap.md`            | ✅ Complete |
| 02 — Domain Core            | `docs/plans/2026-03-17-02-domain-core.md`          | ✅ Complete |
| 03 — Form / State           | `docs/plans/2026-03-17-03-form-state.md`           | ✅ Complete |
| 04 — Results                | `docs/plans/2026-03-17-04-results.md`              | ✅ Complete |
| 05 — URL encoding / P2 flow | `docs/plans/2026-03-17-05-url-encoding-p2-flow.md` | 📋 Draft    |
| 06 — Et si...               | `docs/plans/2026-03-17-06-whatif.md`               | 📋 Draft    |
| 07 — E2E, CI & Landing      | `docs/plans/2026-03-17-07-e2e-ci-polish.md`        | 📋 Draft    |

## Stack

- **Framework**: Next.js (latest stable, App Router), TypeScript strict
- **Styling**: Tailwind CSS
- **State**: encoded URL params (base64) + localStorage fallback — **no backend**
- **Tests**: Vitest + Testing Library (unit/integration) · Playwright (e2e)
- **CI**: GitHub Actions
- **Hosting**: Vercel or Netlify
- **Analytics**: Plausible or Umami (no invasive cookies)
- **PWA**: manifest + service worker for offline support (post-MVP)

## Core Architecture Concepts

### No-backend "couple mode"

The app's multi-user flow works entirely via URL-encoded state:

- P1 fills in all tiers → data encoded in a shareable link
- P2 opens the link, sees shared charges pre-filled, enters their own personal data
- All calculation happens client-side
- P1's data is in the URL but not visually decoded before the results step (soft privacy, not cryptographic — real encryption planned for v1.1)

### 5 Equity Models (require progressive data tiers)

- **Tier 1** (required): unlocks Model 1 (50/50) and Model 2 (income ratio)
- **Tier 2** (recommended): unlocks Model 3 (equal disposable income)
- **Tier 3** (optional): unlocks Model 4 (adjusted for part-time work)
- **Tier 4** (optional): unlocks Model 5 (total contribution: financial + domestic)

Models with missing data are displayed but grayed out, serving as incentive to complete more tiers.

### Domestic workload (Tier 4 / Model 5)

8 categories from INSEE reference data, each with a slider (% assigned to P1). Valued at SMIC hourly rate (~9.57 EUR/h, customizable). In couple mode, both partners fill sliders independently — the midpoint is used for calculation, and perception gaps are surfaced explicitly.

### "Et si..." (What if) simulator

Free-form parameter editing from the results screen. All 4 tiers pre-filled with current values, any field editable, results recalculate in real-time. No predefined scenarios — fully open. No save mechanism; users copy the link to preserve a scenario.

## Key Design Principles

- **No account creation** — zero friction, data stays client-side
- **Progressive disclosure** — value from tier 1, more depth as users fill more
- **Neutral tone** — no model is presented as "correct", no moral judgment
- **Transparent calculations** — detail view shows full formula for each model
- **Mobile-first** — target < 3 min completion for tiers 1-2

## Edge Cases to Preserve

- If a contribution exceeds one person's income → model marked "non viable" (still displayed)
- If combined charges exceed combined income → red alert
- If no children → hide 2 domestic categories, adjust reference hours (28h → 23h/week)
- If both work full-time → Model 4 = Model 2, explicit mention
- If all domestic sliders at 50% → Model 5 = Model 2, explicit mention
- If one income = 0 → all models still calculable, Model 5 highlighted

## RGPD

No server-side storage → no GDPR processing obligation. No third-party cookies. Mention "Vos données restent sur votre appareil" prominently.

## Stack (implemented)

- **Framework**: Next.js 16 (App Router), TypeScript strict mode, Node 24 (`.nvmrc`)
- **Styling**: Tailwind CSS v4
- **Tests**: Vitest 4 + Testing Library (unit/integration) · Playwright (e2e)
- **CI**: GitHub Actions — lint → typecheck → unit → e2e
- **Pre-commit**: Husky + lint-staged (eslint --fix + prettier on staged files, tsc --noEmit)

## Directory structure

```
src/
  app/
    page.tsx              — Homepage → /simulate
    simulate/
      layout.tsx          — Wraps SimulationProvider
      page.tsx            — Shell: header + tab nav + TierNav + tier content
  components/
    form/
      ModeChoice.tsx      — Mode selector (full / shared)
      TierNav.tsx         — Sidebar progress + tier navigation
      Tier1Incomes.tsx    — Names, incomes, common charges
      Tier2PersonalCharges.tsx
      Tier3WorkTime.tsx   — Work quota, part-time handling
      Tier4Domestic.tsx   — 8 domestic sliders
      LockedField.tsx     — P2 placeholder in shared mode
    ui/
      FormField.tsx       — Labeled input with suffix
      SelectField.tsx     — Labeled select
      SliderField.tsx     — Range slider with P1/P2 labels
      PillToggle.tsx      — Pill-style toggle button
  context/
    SimulationContext.tsx — SimulationState, reducer, getUnlockedModels, SimulationProvider
    useSimulation.ts      — Hook with provider guard
  domain/                 — Pure functions (equity models)
    types.ts              — Shared TypeScript interfaces
  lib/
    names.ts              — randomPlaceholderPair, displayName
tests/
  unit/                   — Vitest (mirrors src/)
  e2e/                    — Playwright (form-flow.spec.ts)
docs/
  plans/                  — Implementation plans
  reference/              — Original prototype and spec references
```

## Development conventions

- All `src/domain/` code is TDD: test first, then implement
- No `any` in TypeScript — enforced by ESLint (`@typescript-eslint/no-explicit-any: error`)
- Coverage threshold: 80% on domain logic
- Pre-commit: lint-staged + `tsc --noEmit`
- All client components need `"use client"` directive (Next.js App Router)
- IDE diagnostics `Cannot find module '@/...'` are false positives from the TS language server — `tsc --noEmit` is the source of truth
- `FormField` accepts a `numeric` prop (boolean) for monetary inputs — activates `inputMode="numeric"` + `pattern` on mobile

## Runtime gotchas

- `calculate()` calls all 5 models unconditionnellement — M5 uses `DEFAULT_SLIDERS` fallback if `domesticSliders` is absent; models must never assume optional `SimulationInput` fields are set
- Always use optional chaining on `SimulationInput` sub-fields (`input.p1?.name`, `domesticSliders?.p1`) — fields are populated progressively as tiers are filled
- `ResultsShell` requires both `completedTiers.has(1)` AND non-null `input.p1`/`input.p2` — completing Tier 1 without filling incomes leaves them undefined
- Tier 1 validates P1 + P2 income > 0 before advancing — all e2e helpers must fill both income fields (see `completeTier1` in `tests/e2e/results.spec.ts`)

## Architecture decisions (Plan 04)

- Results screen is a **tab panel** inside `/simulate/page.tsx`, not a separate route — state lives in `SimulationContext` scoped to the layout; URL encoding comes in Plan 05
- M4 returns `M4Result` (two sub-options A/B), M5 returns `M5Result` (extends with domestic breakdown) — not plain `ModelResult`; use `getModelResult()` helper in `ComparisonTable` as reference when accessing these

## Naming conventions

- **Tests & domain code :** `P1` / `P2` — jamais de prénoms fictifs hardcodés
- **Champs nom UI :** placeholder aléatoire paritaire (liste courte, tirage à chaque session) — voir `src/lib/names.ts`
- **Fallback d'affichage :** si nom vide → `"Personne 1"` / `"Personne 2"`, jamais le placeholder
