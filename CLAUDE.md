# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**QuotePart** — a financial equity simulator for couples and households. Helps couples compare 4 equity models (with optional domestic overlay) applied to their real income/expense data to facilitate informed financial conversations.

Tag line: _"Pas une calculette. Un outil de dialogue."_

Full product spec: `quotepart-cadrage-v03.md`

## Current State

**Phase: Post-Plan 08** — Plans 01–06 et 08 terminés. Plan 07 (E2E, CI & Landing) en draft.

Reference files:

- `docs/reference/quotepart-design-system.md` — **design system "Data Journalism"** (palette, typo, composants, accessibilite)
- `docs/reference/frontend-guide.md` — **conventions d'implementation Next.js/Tailwind** (tokens, classes, regles)
- `docs/reference/prototype.jsx` — original UI prototype (visual reference only)
- `quotepart-cadrage-v03.md` — full product specification (French)

## Implementation Plans

Plans are in `docs/plans/` — execute in order:

| Plan                        | File                                                   | Status      |
| --------------------------- | ------------------------------------------------------ | ----------- |
| 01 — Bootstrap              | `docs/plans/2026-03-17-01-bootstrap.md`                | ✅ Complete |
| 02 — Domain Core            | `docs/plans/2026-03-17-02-domain-core.md`              | ✅ Complete |
| 03 — Form / State           | `docs/plans/2026-03-17-03-form-state.md`               | ✅ Complete |
| 04 — Results                | `docs/plans/2026-03-17-04-results.md`                  | ✅ Complete |
| 05 — URL encoding / P2 flow | `docs/plans/2026-03-17-05-url-encoding-p2-flow.md`     | ✅ Complete |
| 06 — Et si...               | `docs/plans/2026-03-17-06-whatif.md`                   | ✅ Complete |
| 07 — E2E, CI & Landing      | `docs/plans/2026-03-17-07-e2e-ci-polish.md`            | 📋 Draft    |
| 08 — Correctifs formules    | `docs/plans/2026-03-18-08-formula-fixes-edge-cases.md` | ✅ Complete |

## Stack

- **Framework**: Next.js 16 (App Router), TypeScript strict mode, Node 24 (`.nvmrc`)
- **Styling**: Tailwind CSS v4
- **State**: encoded URL params (base64) + localStorage fallback — **no backend**
- **Tests**: Vitest 4 + Testing Library (unit/integration) · Playwright (e2e)
- **CI**: GitHub Actions — lint → typecheck → unit → e2e
- **Pre-commit**: Husky + lint-staged (eslint --fix + prettier on staged files, tsc --noEmit)
- **Hosting**: Vercel or Netlify
- **Analytics**: Plausible or Umami (no invasive cookies)
- **PWA**: manifest + service worker for offline support (post-MVP)

## Commands

```bash
npm run dev            # Dev server
npm run build          # Production build
npm run lint           # ESLint
npm run format         # Prettier (write)
npm run format:check   # Prettier (check only)
npm test               # Vitest (run once)
npm run test:watch     # Vitest (watch)
npm run test:coverage  # Vitest + coverage
npm run test:e2e       # Playwright
npm run test:e2e:ui    # Playwright UI mode
```

## Core Architecture Concepts

### No-backend "couple mode"

The app's multi-user flow works entirely via URL-encoded state:

- P1 fills in all tiers → data encoded in a shareable link
- P2 opens the link, sees shared charges pre-filled, enters their own personal data
- All calculation happens client-side
- P1's data is in the URL but not visually decoded before the results step (soft privacy, not cryptographic — real encryption planned for v1.1)

### 4 Equity Models + Domestic Overlay (require progressive data tiers)

- **Tier 1** (required): unlocks Model 1 (50/50) and Model 2 (income ratio)
- **Tier 2** (recommended): unlocks Model 3 (equal disposable income)
- **Tier 3** (optional): unlocks Model 4 (adjusted for part-time work)
- **Tier 4** (optional): enables domestic workload toggle on M2/M3/M4

Models with missing data are displayed but grayed out, serving as incentive to complete more tiers.

### Domestic workload (Tier 4 / toggle overlay)

8 categories from INSEE reference data, each with a slider (% assigned to P1). Valued at SMIC hourly rate (~9.57 EUR/h, customizable). In couple mode, both partners fill sliders independently — the midpoint is used for calculation, and perception gaps are surfaced explicitly.

When Tier 4 is completed, a "Valoriser le travail domestique" toggle appears in results. Uses an **inflate-subtract pattern**: inflates common charges by domestic values, runs model normally, subtracts domestic credit — financial contributions always sum to `commonCharges`. `domesticEnabled` is a UI-only preference (not encoded in share URLs), auto-enabled on Tier 4 completion.

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
- If all domestic sliders at 50% → domestic overlay has no effect on M2
- If one income = 0 → all models still calculable

## RGPD

No server-side storage → no GDPR processing obligation. No third-party cookies. Mention "Vos données restent sur votre appareil" prominently.

## Directory structure

```
src/
  app/
    page.tsx              — Homepage → /simulate
    globals.css           — Tailwind token definitions (seule source de hex)
    layout.tsx            — Root layout
    simulate/
      layout.tsx          — Wraps SimulationProvider
      page.tsx            — Shell: header + tab nav + TierNav + tier content
      p2/                 — Sous-route P2 (shared mode)
  components/
    form/
      ModeChoice.tsx      — Mode selector (full / shared)
      TierNav.tsx         — Sidebar progress + tier navigation
      Tier1Incomes.tsx    — Names, incomes, common charges
      Tier2PersonalCharges.tsx
      Tier3WorkTime.tsx   — Work quota, part-time handling
      Tier4Domestic.tsx   — 8 domestic sliders
      LockedField.tsx     — P2 placeholder in shared mode
      P2Banner.tsx        — Banner for P2 shared mode
      ShareLinkPanel.tsx  — Share link generation panel
    landing/
      Hero.tsx, HowItWorks.tsx, ModelsOverview.tsx, PreviewTable.tsx
      CTABlock.tsx, SocialProof.tsx, Footer.tsx, InseeModal.tsx
    results/
      ResultsShell.tsx    — Results container (requires tier 1 + P1/P2)
      ComparisonTable.tsx — Side-by-side model comparison
      EquityGauges.tsx    — Visual equity gauges
      ModelDetailPanel.tsx — Detail view with formula
      LockedModelOverlay.tsx — Grayed-out locked models
      PerceptionConfrontation.tsx — Domestic perception gaps
      TemporalProjection.tsx
    whatif/
      WhatIfShell.tsx     — What-if container
      WhatIfPanel.tsx     — Parameter editing panel
      WhatIfSummary.tsx   — Summary of changes
      DeltaRow.tsx        — Delta display row
      SnapshotPanel.tsx   — Scenario snapshot
    ui/
      FormField.tsx       — Labeled input with suffix (numeric prop for monetary)
      SelectField.tsx     — Labeled select
      SliderField.tsx     — Range slider with P1/P2 labels
      PillToggle.tsx      — Pill-style toggle button
  context/
    SimulationContext.tsx — SimulationState, reducer, getUnlockedModels, isDomesticAvailable, SimulationProvider
    WhatIfContext.tsx     — What-if state management
    useSimulation.ts      — Hook with provider guard
  domain/                 — Pure functions (equity models)
    types.ts              — Shared TypeScript interfaces
    constants.ts          — DOMESTIC_HOURS, DEFAULT_HOURLY_RATE, WEEKS_PER_MONTH, DEFAULT_SLIDERS
    domestic.ts           — DOMESTIC_CATEGORIES, mergeDomesticSliders, computeDomesticValue
    calculate.ts          — calculate() — runs all 4 models + domestic overlays
    domestic-overlay.ts   — inflate-subtract domestic overlay for M2/M3/M4
    validators.ts         — Input validation
    models/
      m1-5050.ts, m2-income-ratio.ts, m3-equal-rav.ts, m4-adjusted-time.ts
  lib/
    names.ts              — randomPlaceholderPair, displayName
    format.ts             — formatCurrency (Intl fr-FR + nbsp €)
    modelUtils.ts         — MODEL_CONFIGS, MODEL_LABELS, MODEL_ORDER, getModelResult, getActiveResult, getDomesticResult, isRedundantModel, isNonViableModel
    modelContent.ts       — Model descriptions and explanations
    inputDefaults.ts      — toFullInput(partial → SimulationInput with defaults)
    urlState.ts           — URL state encoding/decoding (base64)
    shareLink.ts          — Share link generation
    persistState.ts       — localStorage persistence
tests/
  unit/                   — Vitest (mirrors src/)
  e2e/                    — Playwright
    form-flow.spec.ts     — Form navigation and tier completion
    results.spec.ts       — Results display and model calculations
    landing.spec.ts       — Landing page
    sharing.spec.ts       — Share link flow
    smoke.spec.ts         — Basic smoke tests
docs/
  plans/                  — Implementation plans
  reference/              — Design system, frontend guide, prototype
```

## Development conventions

- All `src/domain/` code is TDD: test first, then implement
- No `any` in TypeScript — enforced by ESLint (`@typescript-eslint/no-explicit-any: error`)
- Coverage threshold: 80% on domain logic
- All client components need `"use client"` directive (Next.js App Router)
- IDE diagnostics `Cannot find module '@/...'` are false positives from the TS language server — `tsc --noEmit` is the source of truth
- **Zero hardcoded colors**: all colors must use Tailwind tokens defined in `globals.css` (`text-text-dim`, `bg-accent`, `border-border`, etc.) — never `text-[#888]`, `bg-neutral-900`, `bg-zinc-500`, or any hex/generic Tailwind color class. The only place hex values appear is in `globals.css` token definitions.
- `formatCurrency()` in `src/lib/format.ts` uses `\u00A0` (non-breaking space) before €. Tests comparing formatted amounts must use `\u00A0€`, not `" €"`

## Ne pas faire

- **Ne pas reconstruire `SimulationInput` inline** — toujours utiliser `toFullInput()` de `src/lib/inputDefaults.ts`
- **Ne pas hardcoder de couleurs** — pas de `text-[#xxx]`, `bg-neutral-*`, `bg-zinc-*` ; utiliser exclusivement les tokens Tailwind de `globals.css`
- **Ne pas hardcoder de prénoms** dans les tests ou le domain — utiliser `P1`/`P2` ; en UI, les placeholders viennent de `src/lib/names.ts`
- **Ne pas créer de route séparée pour les résultats** — c'est un tab panel dans `/simulate/page.tsx`
- **Ne pas assumer que les champs optionnels de `SimulationInput` sont définis** — toujours optional chaining (`input.p1?.name`, `domesticSliders?.p1`)
- **Ne pas comparer `formatCurrency()` avec un espace normal** — utiliser `\u00A0€` (non-breaking space)
- **Ne pas mocker les modèles dans les tests domain** — tester avec des vrais inputs, les fonctions sont pures
- **Ne pas utiliser `any`** — ESLint le bloque, préférer des types explicites ou `unknown`

## Runtime gotchas

- `calculate()` runs all 4 models + `computeDomesticOverlays()` unconditionnellement — domestic overlay uses `DEFAULT_SLIDERS` fallback if `domesticSliders` is absent; models must never assume optional `SimulationInput` fields are set
- Use `toFullInput()` from `src/lib/inputDefaults.ts` to normalize `Partial<SimulationInput>` → `SimulationInput` — never reconstruct inline
- Always use optional chaining on `SimulationInput` sub-fields (`input.p1?.name`, `domesticSliders?.p1`) — fields are populated progressively as tiers are filled
- `ResultsShell` requires both `completedTiers.has(1)` AND non-null `input.p1`/`input.p2` — completing Tier 1 without filling incomes leaves them undefined
- Tier 1 validates P1 + P2 income > 0 before advancing — all e2e helpers must fill both income fields (see `completeTier1` in `tests/e2e/results.spec.ts`)

## Architecture decisions (Plan 04)

- Results screen is a **tab panel** inside `/simulate/page.tsx`, not a separate route — state lives in `SimulationContext` scoped to the layout; URL encoding comes in Plan 05
- M4 returns `M4Result` (two sub-options A/B) — not plain `ModelResult`
- Domestic overlay returns `DomesticOverlays` (adjusted M2/M3/M4 results) — use `getActiveResult()` to transparently get base or domestic-adjusted result
- `domesticEnabled` is a UI-only display preference, not encoded in share URLs — auto-enabled on Tier 4 completion

## Naming conventions

- **Tests & domain code :** `P1` / `P2` — jamais de prénoms fictifs hardcodés
- **Champs nom UI :** placeholder aléatoire paritaire (liste courte, tirage à chaque session) — voir `src/lib/names.ts`
- **Fallback d'affichage :** si nom vide → `"Personne 1"` / `"Personne 2"`, jamais le placeholder
