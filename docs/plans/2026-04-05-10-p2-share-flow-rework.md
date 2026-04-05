# Plan 10 — P2 Share Flow Rework

## Problem

The P2 invite link only encodes `{commonCharges, hasChildren, hourlyRate, p1Name}` via a dedicated `P2SharedPayload`. This is insufficient:

- P1 financial data (income, charges, work time, domestic sliders) is missing from the URL, so results can't be calculated on P2's side
- The form locks the wrong fields for P2 (P2 income locked instead of P1)
- P1 name from URL isn't injected into form state
- `btoa()` doesn't handle UTF-8 characters above U+00FF

## Design Decisions

- **Single encoding format**: use `SimulationInput` for all links (full + P2 invite). Soft privacy = UI hides P1 financials, not encoding.
- **Role-based UI**: add `role: "p1" | "p2" | null` to `SimulationState` to control which fields are locked/visible.
- **Linear P1 flow**: P1 completes all tiers → "waiting for partner" screen with invite link (no results without P2 data).
- **P2 mirrors P1 tiers**: same 4-tier structure, P1 fields locked/hidden, P2 fields editable.
- **Return link**: P2 generates a full link (`/simulate?data=...`) with both people's data.

## Phases

### Phase 1 — UTF-8 safe encoding

**Files:** `src/lib/urlState.ts`

Replace `btoa(json)` / `atob(b64)` with UTF-8-safe encoding:

```ts
// encode
btoa(String.fromCodePoint(...new TextEncoder().encode(json)));
// decode
new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.codePointAt(0)!));
```

Update tests for `encodeState` / `decodeState` with non-ASCII characters.

### Phase 2 — Simplify shareLink.ts

**Files:** `src/lib/shareLink.ts`

- Remove `P2SharedPayload`, `decodeP2Payload`, `isP2SharedPayload`
- `getP2InviteLink(input)` → uses `encodeState(input)` + `/simulate/p2?data=...` route
- Keep `getFullLink` unchanged (already uses `encodeState`)

Update tests for `shareLink.ts`.

### Phase 3 — Add role to SimulationState

**Files:** `src/context/SimulationContext.tsx`

- Add `role: "p1" | "p2" | null` to `SimulationState` (initial: `null`)
- Add `SET_ROLE` action: `{ type: "SET_ROLE"; payload: "p1" | "p2" }`
- Handle in reducer
- Include `role` in HYDRATE and RESET (reset to `null`)

### Phase 4 — Rework P2 page

**Files:** `src/app/simulate/p2/page.tsx`

- Replace `decodeP2Payload` with `decodeState` from `urlState.ts`
- On mount: dispatch `SET_MODE: "shared"`, `SET_ROLE: "p2"`, `UPDATE_INPUT` with full decoded `SimulationInput`, `SET_TIER: 1`
- Remove `P2Banner` p1Name prop — get it from `state.input.p1.name`

### Phase 5 — Adapt form components for role

**Files:** `Tier1Incomes.tsx`, `Tier2PersonalCharges.tsx`, `Tier3WorkTime.tsx`, `Tier4Domestic.tsx`

#### Tier1Incomes

When `role === "p2"`:

- P1 name: readonly (value from state, not placeholder)
- P1 income: hidden (replaced with locked/hidden indicator)
- P2 name: editable
- P2 income: editable (NOT locked)
- Common charges: pre-filled, editable
- hasChildren: pre-filled, editable

When `role === "p1"` (shared mode):

- P2 name: editable
- P2 income: locked ("P2 complétera")
- Everything else: editable as today

#### Tier2PersonalCharges

When `role === "p2"`: hide P1 personal charges, show P2 field.

#### Tier3WorkTime

When `role === "p2"`: hide P1 work time fields, show P2 fields.

#### Tier4Domestic

When `role === "p2"`: pre-fill P2 sliders with P1 values from state, all editable.

### Phase 6 — Waiting screen for P1

**Files:** `src/components/results/ResultsShell.tsx` or `src/app/simulate/page.tsx`

When `role === "p1"` and mode is `"shared"`:

- Instead of results, show "En attente de votre partenaire" screen
- Display P2 invite link (via `getP2InviteLink`)
- Brief summary of completed tiers

### Phase 7 — ShareLinkPanel for P2 results

**Files:** `src/components/form/ShareLinkPanel.tsx`

Three display modes:

- `role === "p2"`: single "copy results link" button using `getFullLink`
- `role === "p1"` + shared: P2 invite link (used in waiting screen)
- `mode === "full"` (solo): full link as today

### Phase 8 — E2E and integration tests

**Files:** `tests/e2e/sharing.spec.ts`, unit tests for modified files

- Test P1 shared flow → waiting screen → invite link
- Test P2 flow: decode → fill tiers → results → return link
- Test UTF-8 names in share links
- Test solo mode unchanged
