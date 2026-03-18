# Plan 05 — URL Encoding & P2 Flow

> **For agentic workers:** REQUIRED: Use `superpowers:executing-plans` to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the URL state encoding (base64) so any simulation can be shared via link, and build the P2 entry flow where P2 opens a shared link and fills in their own data without seeing P1's personal figures.

**Architecture:** `src/lib/urlState.ts` handles encode/decode of `SimulationInput` to/from URL search params. Encoding is base64 JSON — not cryptographic (v1.0 assumption, documented in spec). P2 flow is a separate route `/simulate/p2` that initializes with decoded shared data (common charges only visible, P1 personal data present in URL but not rendered).

**Tech Stack:** No new dependencies — built-in `URLSearchParams`, `btoa`/`atob`, Next.js routing.

**Prerequisite:** Plans 01 + 02 + 03 + 04 complete.

---

## File Map

```
src/
  lib/
    urlState.ts                 ← encode/decode SimulationInput ↔ URL param
    shareLink.ts                ← generate shareable links (P1 full / P2 invite)
  app/
    simulate/
      p2/
        page.tsx                ← /simulate/p2?data=... P2 entry flow
        layout.tsx
  components/
    form/
      ShareLinkPanel.tsx        ← "Copy link" panel shown after Tier 4 in shared mode
      P2Banner.tsx              ← banner shown to P2: "X vous invite à compléter..."

tests/unit/lib/
  urlState.test.ts              ← encode/decode round-trip, edge cases
  shareLink.test.ts
tests/e2e/
  sharing.spec.ts               ← full P1→link→P2 flow
```

---

## Task 1: URL state encoding

**Files:** `src/lib/urlState.ts`, `tests/unit/lib/urlState.test.ts`

- [ ] **Step 1: Write failing tests**

  ```typescript
  import { describe, it, expect } from "vitest";
  import { encodeState, decodeState } from "@/lib/urlState";

  describe("urlState", () => {
    it("round-trips a full SimulationInput", () => {
      const input = {
        /* full SimulationInput */
      };
      expect(decodeState(encodeState(input))).toEqual(input);
    });

    it("produces a URL-safe string (no +, /, = not encoded)", () => {
      const encoded = encodeState({
        /* minimal input */
      });
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/); // URL-safe base64
    });

    it("returns null for malformed input", () => {
      expect(decodeState("not-valid-base64!!!")).toBeNull();
    });

    it("returns null when decoded JSON has wrong shape", () => {
      const bad = btoa(JSON.stringify({ foo: "bar" }));
      expect(decodeState(bad)).toBeNull();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement urlState.ts**

  ```typescript
  // Use URL-safe base64 (replace +→- /→_ strip =)
  // encodeState: JSON.stringify → btoa → url-safe
  // decodeState: url-safe → atob → JSON.parse → validate shape → SimulationInput | null
  ```

- [ ] **Step 4: Run tests**
- [ ] **Step 5: Commit** `feat(lib): URL state encoding with round-trip guarantee`

---

## Task 2: Share link generation

**Files:** `src/lib/shareLink.ts`, `tests/unit/lib/shareLink.test.ts`

- [ ] **Step 1: Write failing tests**

  ```typescript
  // Test: P1 full link encodes entire SimulationInput
  // Test: P2 invite link encodes ONLY common charges + hasChildren (not P1 personal data)
  //       → P1 income, personalCharges, sliders are NOT in the P2 link
  // Test: generated links are valid URLs
  ```

  > Security note: P1 personal data IS technically in the URL if P1 shares their own full link.
  > The P2 _invite_ link only contains shared data. Document this assumption clearly.

- [ ] **Step 2: Implement**
- [ ] **Step 3: Run tests**
- [ ] **Step 4: Commit** `feat(lib): share link generation (full + P2 invite variants)`

---

## Task 3: ShareLinkPanel component

**Files:** `src/components/form/ShareLinkPanel.tsx`

- [ ] **Step 1: Write failing tests**

  ```typescript
  // Test: shows full simulation link
  // Test: "Copier" button copies to clipboard (mock navigator.clipboard)
  // Test: shows confirmation message after copy
  // Test: shows P2 invite link when mode is "shared"
  // Test: P2 invite link differs from full link (shorter, no personal P1 data)
  ```

- [ ] **Step 2: Implement**
- [ ] **Step 3: Run tests**
- [ ] **Step 4: Commit** `feat(form): ShareLinkPanel with clipboard copy`

---

## Task 4: P2 entry flow

**Files:** `src/app/simulate/p2/page.tsx`, `src/components/form/P2Banner.tsx`

- [ ] **Step 1: Write failing tests**

  ```typescript
  // Test: page reads ?data= param and initializes shared fields (charges)
  // Test: P1 name is shown in welcome banner ("X vous invite à compléter...")
  // Test: P1 income is NOT displayed (present in URL but not rendered)
  // Test: P2 fills their own Tier 1 (income, personal charges)
  // Test: P2 fills their own domestic sliders (Tier 4)
  // Test: after P2 completes, results page shows combined data
  // Test: if ?data= is missing or invalid → redirect to /simulate with error toast
  ```

- [ ] **Step 2: Implement** — new SimulationContext initialized from URL data
- [ ] **Step 3: Run tests**
- [ ] **Step 4: E2E test** `tests/e2e/sharing.spec.ts`

  ```typescript
  // Full flow:
  // 1. P1 fills tiers 1-4 in shared mode
  // 2. Copy P2 invite link
  // 3. Navigate to that link (same browser, new tab is fine)
  // 4. Verify P2 sees common charges pre-filled
  // 5. P2 fills their data
  // 6. Results show combined simulation with perception confrontation
  ```

- [ ] **Step 5: Commit** `feat(p2): P2 entry flow via shared link`

---

## Task 5: Persist simulation to localStorage

**Files:** `src/lib/persistState.ts`, updates to `SimulationContext.tsx`

- [ ] **Step 1: Write failing tests**

  ```typescript
  // Test: state is saved to localStorage on each change
  // Test: state is restored from localStorage on page reload
  // Test: localStorage is cleared when user starts a new simulation
  // Test: corrupted localStorage falls back gracefully (no crash)
  ```

- [ ] **Step 2: Implement** — auto-save to `localStorage['quotepart-simulation']`
- [ ] **Step 3: Run tests**
- [ ] **Step 4: Commit** `feat(lib): localStorage persistence with graceful fallback`

---

## Definition of Done

- [x] Full simulation link round-trips correctly (encode → decode → same values)
- [x] P2 invite link does not expose P1 income or personal charges in the rendered UI
- [x] P2 flow completes and produces results with both partners' data
- [x] Copy to clipboard works
- [x] localStorage persistence survives page reload
- [x] E2E sharing flow passing

---

## Plan Status

| Date       | Status      | Notes                                                                          |
| ---------- | ----------- | ------------------------------------------------------------------------------ |
| 2026-03-17 | 📋 Draft    | Security assumption documented: soft privacy, not cryptographic (v1.1 concern) |
| 2026-03-17 | ✅ Complete | 205 unit tests, 5 E2E tests, PR #1                                             |

---

## Divergences from Spec / Plan

| Decision                                             | Plan says                                              | Actual                                                                   | Reason                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| P2 page uses Suspense wrapper                        | Not specified                                          | `useSearchParams()` requires `<Suspense>` boundary in Next.js App Router | Next.js build error without it                                                                     |
| playwright.config.ts uses env vars for BASE_URL/PORT | Not specified                                          | Added `process.env.BASE_URL` and `process.env.PORT` support              | Needed to run e2e tests against worktree dev server (port 3001) while main dev server runs on 3000 |
| P2 page result view                                  | "after P2 completes, results page shows combined data" | ResultsShell shown inline when tier1 is complete                         | Architecture decision: results remain a tab panel (Plan 04 decision), not a separate route         |
