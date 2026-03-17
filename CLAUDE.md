# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**QuotePart** — a financial equity simulator for couples and households. Helps couples compare 5 equity models applied to their real income/expense data to facilitate informed financial conversations.

Tag line: _"Pas une calculette. Un outil de dialogue."_

Full product spec: `quotepart-cadrage-v03.md`

## Current State

**Phase: Bootstrap + Domain Core (not yet scaffolded)**

Reference files:

- `docs/reference/prototype.jsx` — original UI prototype (visual reference only)
- `quotepart-cadrage-v03.md` — full product specification (French)

## Implementation Plans

Plans are in `docs/plans/` — execute in order:

| Plan                        | File                                               | Status         |
| --------------------------- | -------------------------------------------------- | -------------- |
| 01 — Bootstrap              | `docs/plans/2026-03-17-01-bootstrap.md`            | 🔲 Not started |
| 02 — Domain Core            | `docs/plans/2026-03-17-02-domain-core.md`          | 🔲 Not started |
| 03 — Form / State           | `docs/plans/2026-03-17-03-form-state.md`           | 📋 Draft       |
| 04 — Results                | `docs/plans/2026-03-17-04-results.md`              | 📋 Draft       |
| 05 — URL encoding / P2 flow | `docs/plans/2026-03-17-05-url-encoding-p2-flow.md` | 📋 Draft       |
| 06 — Et si...               | `docs/plans/2026-03-17-06-whatif.md`               | 📋 Draft       |
| 07 — E2E, CI & Landing      | `docs/plans/2026-03-17-07-e2e-ci-polish.md`        | 📋 Draft       |

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
