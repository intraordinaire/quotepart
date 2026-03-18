# Plan 08 — Correctifs formules & edge cases négatifs

> **For agentic workers:** REQUIRED: Use `superpowers:subagent-driven-development` (if subagents available) or `superpowers:executing-plans` to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the M5 formula (currently wrong), add missing edge case detection for M3 and M5 (negative contributions, contribution > income), and update the UI to display transfers and non-viable badges correctly.

**Architecture:** Domain-only changes for Tasks 1-3 (pure functions + tests). Task 4 touches UI components (`ComparisonTable`, `ModelDetailPanel`) to handle new edge case states. All changes are backward-compatible — `ModelResult` interface is unchanged, edge cases surface through existing `isViable`/`warnings` fields.

**Tech Stack:** TypeScript, Vitest, React, Tailwind. No new dependencies.

**Prerequisite:** Plans 01–05 complete.

**Reference:** `docs/reference/quotepart-correctifs-calculs.md` — full formulas, examples, and expected messages.

**Out of scope (planned for a future plan):**

- M1 warning message alignment with spec text
- M2 edge cases (division by zero when income=0, charges > combined income warning)
- M4 edge cases (quotité=0 division by zero, very low quotité ratio inversion)
- These are documented in the spec but do not require formula corrections — they are enhancements.

---

## File Map

```
src/domain/
  models/
    m3-equal-rav.ts       ← MODIFY: add edge cases (negative contribution, contribution > income, negative RAV)
    m5-total-contribution.ts ← MODIFY: fix formula + add edge cases (negative contribution, contribution > income, hourly=0)
src/components/results/
  ComparisonTable.tsx      ← MODIFY: display negative contributions as transfers (arrow notation)
  ModelBadge.tsx           ← MODIFY: add "warning" variant for non-viable badge (orange)
tests/unit/domain/
  m3-equal-rav.test.ts     ← MODIFY: add edge case tests
  m5-total-contribution.test.ts ← MODIFY: rewrite for new formula + add edge case tests
tests/unit/components/results/
  EdgeCases.test.tsx       ← MODIFY: add transfer display + non-viable badge tests
```

---

## Task 1: Fix M5 formula

The current M5 adjusts M2 by `domesticImbalance / 2`. The correct formula computes a total household cost (financial + domestic), distributes at income ratio, then subtracts each person's domestic contribution.

**Files:**

- Modify: `tests/unit/domain/m5-total-contribution.test.ts`
- Modify: `src/domain/models/m5-total-contribution.ts`

### Step 1.1: Update existing tests to match corrected formula

The persona data from the spec: Thomas 3200€, Léa 2100€ (80%), charges 3000€, Thomas 30% domestic, Léa 70%.

```typescript
// In m5-total-contribution.test.ts, replace the "reduces financial contribution" test:

it("applies corrected formula: coût total foyer, prorata revenus, minus domestic value", () => {
  // Persona: P1=3200€, P2=2100€, charges=3000€, P1 does 30% domestic (all sliders at 30)
  const p1Does30: DomesticSliders = {
    groceries: 30,
    cooking: 30,
    cleaning: 30,
    admin: 30,
    childrenAppointments: 30,
    schoolSupport: 30,
    maintenance: 30,
    planning: 30,
  };
  const input: SimulationInput = { ...base, domesticSliders: { p1: p1Does30 } };
  const result = computeM5(input);

  // Expected with hourlyRate=9.52, hasChildren=true (28h/week):
  // P1 hours = 28 * 0.30 = 8.4h → 8.4 * 9.52 * 4.33 = 346.2 €/month
  // P2 hours = 28 * 0.70 = 19.6h → 19.6 * 9.52 * 4.33 = 807.7 €/month
  // Coût total = 3000 + 346.2 + 807.7 = 4153.9
  // Ratio P1 = 3200/5300 = 0.60377
  // Part P1 = 4153.9 * 0.60377 = 2508.5
  // CF P1 = 2508.5 - 346.2 = 2162.3
  // CF P2 = 3000 - 2162.3 = 837.7
  expect(result.modelResult.p1Contribution).toBeCloseTo(2162, 0);
  expect(result.modelResult.p2Contribution).toBeCloseTo(838, 0);
  expect(result.modelResult.p1Contribution + result.modelResult.p2Contribution).toBeCloseTo(
    3000,
    0
  );
});
```

- [x] **Step 1.1a:** Update the test file:
  1. Replace the `"reduces financial contribution"` test with the formula verification test above.
  2. **Replace the `"is identical to M2 when domestic is 50/50"` test.** With the corrected formula, 50/50 sliders do NOT produce M2-equivalent results when incomes differ (the domestic cost pool gets distributed at income ratio, creating a small delta). Replace with:

```typescript
it("with 50/50 domestic and unequal incomes, differs slightly from M2", () => {
  const result = computeM5(base);
  const m2Ratio = 3200 / (3200 + 2100);
  // 50/50 domestic → equal domestic values, but total cost approach
  // distributes domestic pool at income ratio, so M5 ≠ M2
  expect(result.modelResult.p1Contribution).not.toBeCloseTo(3000 * m2Ratio, 2);
  expect(result.isSameAsM2).toBe(false);
});

it("is truly identical to M2 when hourly rate is 0", () => {
  const input: SimulationInput = { ...base, hourlyRate: 0 };
  const result = computeM5(input);
  const m2Ratio = 3200 / (3200 + 2100);
  expect(result.modelResult.p1Contribution).toBeCloseTo(3000 * m2Ratio, 5);
  expect(result.isSameAsM2).toBe(true);
});
```

3. Update the `"uses midpoint"` test expectations to reflect the new formula behavior (midpoint still brings contributions closer to M2, direction unchanged).

> **Note:** The spec's edge case ④ ("curseurs 50/50 → identique M2") is only true when `hourlyRate=0` or incomes are equal. This is a spec inaccuracy to flag in v0.4.

- [x] **Step 1.1b:** Run tests to verify they fail.

Run: `npx vitest run tests/unit/domain/m5-total-contribution.test.ts`
Expected: FAIL — contribution values don't match new formula.

### Step 1.2: Implement corrected M5 formula

Replace the formula in `src/domain/models/m5-total-contribution.ts`:

```typescript
export function computeM5(input: SimulationInput): M5Result {
  const mergedSliders = mergeDomesticSliders(
    input.domesticSliders?.p1 ?? DEFAULT_SLIDERS,
    input.domesticSliders?.p2
  );

  const domestic = computeDomesticValue(mergedSliders, input.hasChildren, input.hourlyRate);

  // Corrected formula: total household cost approach
  // Reference: docs/reference/quotepart-correctifs-calculs.md §Modèle 5
  const totalHouseholdCost =
    input.commonCharges + domestic.p1MonthlyValue + domestic.p2MonthlyValue;

  const incomeRatio = input.p1.income / (input.p1.income + input.p2.income);

  const p1FairShare = totalHouseholdCost * incomeRatio;
  const p2FairShare = totalHouseholdCost * (1 - incomeRatio);

  const p1FinancialContribution = p1FairShare - domestic.p1MonthlyValue;
  const p2FinancialContribution = p2FairShare - domestic.p2MonthlyValue;

  const p1Disposable = input.p1.income - p1FinancialContribution;
  const p2Disposable = input.p2.income - p2FinancialContribution;

  // M2 baseline for comparison
  const m2 = computeM2(input);
  const ratioIncomeBefore = m2.p1Contribution / input.commonCharges;
  const ratioAfter = input.commonCharges > 0 ? p1FinancialContribution / input.commonCharges : 0.5;

  const isSameAsM2 = Math.abs(ratioAfter - ratioIncomeBefore) < SAME_AS_M2_THRESHOLD;

  return {
    modelResult: {
      p1Contribution: p1FinancialContribution,
      p2Contribution: p2FinancialContribution,
      p1DisposableIncome: p1Disposable,
      p2DisposableIncome: p2Disposable,
      equityScore: computeEquityScore(p1Disposable, p2Disposable),
      isViable: true,
      warnings: [],
    },
    p1DomesticMonthlyValue: domestic.p1MonthlyValue,
    p2DomesticMonthlyValue: domestic.p2MonthlyValue,
    p1WeeklyDomesticHours: domestic.p1WeeklyHours,
    p2WeeklyDomesticHours: domestic.p2WeeklyHours,
    ratioBeforeDomestic: ratioIncomeBefore,
    ratioAfterDomestic: ratioAfter,
    isSameAsM2,
  };
}
```

- [x] **Step 1.2a:** Replace the formula in `m5-total-contribution.ts` with the corrected version above. Keep the `DEFAULT_SLIDERS`, `M5Result`, and `SAME_AS_M2_THRESHOLD` unchanged.

- [x] **Step 1.2b:** Run tests to verify they pass.

Run: `npx vitest run tests/unit/domain/m5-total-contribution.test.ts`
Expected: PASS

- [x] **Step 1.3: Commit**

```bash
git add src/domain/models/m5-total-contribution.ts tests/unit/domain/m5-total-contribution.test.ts
git commit -m "fix(domain): correct M5 formula — total household cost approach"
```

---

## Task 2: Add M3 edge cases

M3 formula is correct but lacks detection of: negative RAV cible, negative contribution (person should receive money), and contribution exceeding income.

**Files:**

- Modify: `tests/unit/domain/m3-equal-rav.test.ts`
- Modify: `src/domain/models/m3-equal-rav.ts`

### Step 2.1: Write failing tests for M3 edge cases

```typescript
// Add to m3-equal-rav.test.ts:

it("warns when RAV cible is negative (charges > combined available)", () => {
  // Dispo P1 = 3200-80=3120, Dispo P2 = 2100-190=1910
  // Charges = 6000 → RAV cible = (3120+1910-6000)/2 = -485
  const overloaded = { ...base, commonCharges: 6000 };
  const result = computeM3(overloaded);
  expect(result.warnings.length).toBeGreaterThan(0);
  expect(result.warnings[0]).toContain("reste à vivre négatif");
  // Model still computes (informative) but warns
  expect(result.p1Contribution + result.p2Contribution).toBeCloseTo(6000, 0);
});

it("warns when a contribution is negative (person should receive money)", () => {
  // P1: 4500€, charges perso 500 → dispo 4000
  // P2: 800€, charges perso 400 → dispo 400
  // Charges = 3000 → RAV cible = (4000+400-3000)/2 = 700
  // C_P2 = 400-700 = -300 (P2 should receive 300€)
  const extreme: SimulationInput = {
    ...base,
    p1: { ...base.p1, income: 4500, personalCharges: 500 },
    p2: { ...base.p2, income: 800, personalCharges: 400 },
    commonCharges: 3000,
  };
  const result = computeM3(extreme);
  expect(result.p2Contribution).toBeLessThan(0);
  expect(result.warnings.length).toBeGreaterThan(0);
  expect(result.warnings[0]).toContain("verser");
  expect(result.isViable).toBe(true); // still viable, just a transfer
});

it("marks non-viable when contribution exceeds income", () => {
  // P1: 2000€, charges perso 100 → dispo 1900
  // P2: 500€, charges perso 50 → dispo 450
  // Charges = 3000 → RAV cible = (1900+450-3000)/2 = -325
  // C_P1 = 1900-(-325) = 2225 > income 2000
  const tooHigh: SimulationInput = {
    ...base,
    p1: { ...base.p1, income: 2000, personalCharges: 100 },
    p2: { ...base.p2, income: 500, personalCharges: 50 },
    commonCharges: 3000,
  };
  const result = computeM3(tooHigh);
  expect(result.isViable).toBe(false);
  expect(result.warnings[0]).toContain("dépasse son revenu");
});
```

- [x] **Step 2.1a:** Add the three edge case tests above to `m3-equal-rav.test.ts`.

- [x] **Step 2.1b:** Run tests to verify they fail.

Run: `npx vitest run tests/unit/domain/m3-equal-rav.test.ts`
Expected: FAIL — no warnings generated for these cases.

### Step 2.2: Implement M3 edge case detection

After the existing contribution calculation (line 25-26), add edge case checks before returning:

```typescript
export function computeM3(input: SimulationInput): ModelResult {
  const p1Available = input.p1.income - input.p1.personalCharges;
  const p2Available = input.p2.income - input.p2.personalCharges;

  // Edge case ④: personal charges > income (already handled)
  if (p1Available <= 0 || p2Available <= 0) {
    const who = p1Available <= 0 ? input.p1.name : input.p2.name;
    return {
      p1Contribution: 0,
      p2Contribution: 0,
      p1DisposableIncome: p1Available,
      p2DisposableIncome: p2Available,
      equityScore: 0,
      isViable: false,
      warnings: [
        `Les charges personnelles de ${who} dépassent son revenu. Ce modèle ne peut pas s'appliquer tel quel.`,
      ],
    };
  }

  const p1Contribution = (input.commonCharges + p1Available - p2Available) / 2;
  const p2Contribution = input.commonCharges - p1Contribution;

  const p1Disposable = p1Available - p1Contribution;
  const p2Disposable = p2Available - p2Contribution;

  const warnings: string[] = [];
  let isViable = true;

  // Edge case ①: negative RAV (charges > combined available)
  if (p1Disposable < 0 && p2Disposable < 0) {
    warnings.push(
      `Vos charges communes dépassent vos revenus disponibles combinés. Le modèle reste à vivre égal aboutit à un reste à vivre négatif pour les deux (${Math.round(p1Disposable)}\u00A0€/mois).`
    );
  }

  // Edge case ③: contribution > income (non-viable)
  if (p1Contribution > input.p1.income) {
    isViable = false;
    warnings.push(
      `Dans ce modèle, la contribution de ${input.p1.name} (${Math.round(p1Contribution)}\u00A0€) dépasse son revenu (${Math.round(input.p1.income)}\u00A0€). Ce modèle n'est pas viable en l'état.`
    );
  }
  if (p2Contribution > input.p2.income) {
    isViable = false;
    warnings.push(
      `Dans ce modèle, la contribution de ${input.p2.name} (${Math.round(p2Contribution)}\u00A0€) dépasse son revenu (${Math.round(input.p2.income)}\u00A0€). Ce modèle n'est pas viable en l'état.`
    );
  }

  // Edge case ②: negative contribution (transfer — still viable)
  if (p1Contribution < 0) {
    warnings.push(
      `Pour égaliser le reste à vivre, ${input.p2.name} devrait couvrir la totalité des charges communes et verser ${Math.round(Math.abs(p1Contribution))}\u00A0€/mois à ${input.p1.name}. Ce transfert n'est pas une obligation\u00A0— c'est une option à discuter.`
    );
  } else if (p2Contribution < 0) {
    warnings.push(
      `Pour égaliser le reste à vivre, ${input.p1.name} devrait couvrir la totalité des charges communes et verser ${Math.round(Math.abs(p2Contribution))}\u00A0€/mois à ${input.p2.name}. Ce transfert n'est pas une obligation\u00A0— c'est une option à discuter.`
    );
  }

  return {
    p1Contribution,
    p2Contribution,
    p1DisposableIncome: p1Disposable,
    p2DisposableIncome: p2Disposable,
    equityScore: computeEquityScore(p1Disposable, p2Disposable),
    isViable,
    warnings,
  };
}
```

- [x] **Step 2.2a:** Replace `computeM3` with the version above.

- [x] **Step 2.2b:** Run tests to verify they pass.

Run: `npx vitest run tests/unit/domain/m3-equal-rav.test.ts`
Expected: PASS (all existing + new tests)

- [x] **Step 2.3: Commit**

```bash
git add src/domain/models/m3-equal-rav.ts tests/unit/domain/m3-equal-rav.test.ts
git commit -m "feat(domain): add M3 edge cases — negative RAV, transfers, contribution>income"
```

---

## Task 3: Add M5 edge cases

M5 can now produce negative contributions (transfer) and contribution > income. Also detect hourly rate = 0.

**Files:**

- Modify: `tests/unit/domain/m5-total-contribution.test.ts`
- Modify: `src/domain/models/m5-total-contribution.ts`

### Step 3.1: Write failing tests for M5 edge cases

```typescript
// Add to m5-total-contribution.test.ts:

it("warns and shows transfer when contribution is negative (high domestic, low income)", () => {
  // Sophie & Amine scenario from spec (no young children → 23h/week)
  // Amine: 2800€, Sophie: 428€, charges: 2200€, Sophie does 85% domestic
  const sophieDoesAlmost: DomesticSliders = {
    groceries: 15,
    cooking: 15,
    cleaning: 15,
    admin: 15,
    childrenAppointments: 15,
    schoolSupport: 15,
    maintenance: 15,
    planning: 15,
  };
  const input: SimulationInput = {
    ...base,
    p1: { ...base.p1, name: "Amine", income: 2800 },
    p2: { ...base.p2, name: "Sophie", income: 428 },
    commonCharges: 2200,
    domesticSliders: { p1: sophieDoesAlmost }, // P1 (Amine) does 15%
    hasChildren: false, // spec: "pas d'enfants en bas âge → 23h/semaine"
  };
  const result = computeM5(input);
  expect(result.modelResult.p2Contribution).toBeLessThan(0);
  expect(result.modelResult.warnings.length).toBeGreaterThan(0);
  expect(result.modelResult.warnings[0]).toContain("verser");
  expect(result.modelResult.isViable).toBe(true); // transfer, not non-viable
});

it("marks non-viable when contribution exceeds income", () => {
  // Extreme: P1=2000€, P2=0€ (au foyer), charges=1800€, P2 does 95%
  const p2DoesAll: DomesticSliders = {
    groceries: 5,
    cooking: 5,
    cleaning: 5,
    admin: 5,
    childrenAppointments: 5,
    schoolSupport: 5,
    maintenance: 5,
    planning: 5,
  };
  const input: SimulationInput = {
    ...base,
    p1: { ...base.p1, income: 2000 },
    p2: { ...base.p2, income: 1 }, // near-zero to avoid division by zero
    commonCharges: 1800,
    domesticSliders: { p1: p2DoesAll },
    hasChildren: true,
  };
  const result = computeM5(input);
  // P1 contribution should exceed their income
  expect(result.modelResult.p1Contribution).toBeGreaterThan(2000);
  expect(result.modelResult.isViable).toBe(false);
  expect(result.modelResult.warnings[0]).toContain("dépasse");
});

it("warns when hourly rate is 0 (model equals M2)", () => {
  const input: SimulationInput = { ...base, hourlyRate: 0 };
  const result = computeM5(input);
  expect(result.isSameAsM2).toBe(true);
  expect(result.modelResult.warnings.some((w) => w.includes("valeur horaire"))).toBe(true);
});
```

- [x] **Step 3.1a:** Add the three edge case tests above to `m5-total-contribution.test.ts`.

- [x] **Step 3.1b:** Run tests to verify they fail.

Run: `npx vitest run tests/unit/domain/m5-total-contribution.test.ts`
Expected: FAIL

### Step 3.2: Add edge case detection to M5

In `m5-total-contribution.ts`, add warning/viability checks after computing contributions (before the return statement):

```typescript
// --- Edge case detection (after contribution computation, before return) ---

const warnings: string[] = [];
let isViable = true;

// Edge case ⑤: hourly rate = 0
if (input.hourlyRate === 0) {
  warnings.push(
    "La valeur horaire est à 0\u00A0€ — le travail domestique n'est pas valorisé. Ce modèle donne le même résultat que le prorata des revenus."
  );
}

// Edge case ②: contribution > income (non-viable)
if (p1FinancialContribution > input.p1.income) {
  isViable = false;
  warnings.push(
    `Dans ce modèle, la contribution financière de ${input.p1.name} (${Math.round(p1FinancialContribution)}\u00A0€) dépasserait son revenu (${Math.round(input.p1.income)}\u00A0€). Le modèle n'est pas viable en l'état.`
  );
}
if (p2FinancialContribution > input.p2.income) {
  isViable = false;
  warnings.push(
    `Dans ce modèle, la contribution financière de ${input.p2.name} (${Math.round(p2FinancialContribution)}\u00A0€) dépasserait son revenu (${Math.round(input.p2.income)}\u00A0€). Le modèle n'est pas viable en l'état.`
  );
}

// Edge case ①: negative contribution (transfer — still viable)
if (p1FinancialContribution < 0) {
  warnings.push(
    `La contribution domestique de ${input.p1.name} (${Math.round(domestic.p1MonthlyValue)}\u00A0€/mois) dépasse sa part équitable. ${input.p2.name} couvrirait la totalité des charges et devrait verser ${Math.round(Math.abs(p1FinancialContribution))}\u00A0€/mois à ${input.p1.name}. Ce transfert est une traduction en euros de l'asymétrie domestique\u00A0— c'est un outil de dialogue, pas une obligation.`
  );
} else if (p2FinancialContribution < 0) {
  warnings.push(
    `La contribution domestique de ${input.p2.name} (${Math.round(domestic.p2MonthlyValue)}\u00A0€/mois) dépasse sa part équitable. ${input.p1.name} couvrirait la totalité des charges et devrait verser ${Math.round(Math.abs(p2FinancialContribution))}\u00A0€/mois à ${input.p2.name}. Ce transfert est une traduction en euros de l'asymétrie domestique\u00A0— c'est un outil de dialogue, pas une obligation.`
  );
}
```

Then use `warnings` and `isViable` in the return's `modelResult`.

- [x] **Step 3.2a:** Add the edge case detection block to `computeM5`, replacing the hardcoded `isViable: true, warnings: []` in the return.

- [x] **Step 3.2b:** Run tests to verify they pass.

Run: `npx vitest run tests/unit/domain/m5-total-contribution.test.ts`
Expected: PASS

- [x] **Step 3.3: Commit**

```bash
git add src/domain/models/m5-total-contribution.ts tests/unit/domain/m5-total-contribution.test.ts
git commit -m "feat(domain): add M5 edge cases — transfers, contribution>income, hourlyRate=0"
```

---

## Task 4: UI — transfer display & non-viable badge

Update `ComparisonTable` to show negative contributions as transfers (positive amount with arrow), and add a "warning" badge variant.

**Files:**

- Modify: `tests/unit/components/results/EdgeCases.test.tsx`
- Modify: `src/components/results/ModelBadge.tsx`
- Modify: `src/components/results/ComparisonTable.tsx`

### Step 4.1: Write failing tests for transfer display

```typescript
// Add to EdgeCases.test.tsx:

describe("Edge cases — Transfer display", () => {
  it("displays negative contribution as a transfer with arrow notation", () => {
    const results = makeResults({
      m3_equal_rav: makeModelResult({
        p2Contribution: -300,
        p1Contribution: 3300,
        warnings: ["Pour égaliser le reste à vivre, P1 devrait verser 300\u00A0€/mois à P2."],
      }),
    });

    render(
      <ComparisonTable
        results={results}
        unlockedModels={ALL_MODELS}
        selectedModel={null}
        onModelSelect={vi.fn()}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    // Negative contribution should show as transfer, not "-300 €"
    expect(screen.queryByText(/-300/)).toBeNull();
    // Should show positive amount with arrow direction
    expect(screen.getByText(/300\u00A0€/)).toBeInTheDocument();
    expect(screen.getByText(/→/)).toBeInTheDocument();
  });

  it("shows 'Non viable' badge with warning variant for contribution > income", () => {
    const results = makeResults({
      m5_total_contribution: makeM5Result({
        modelResult: makeModelResult({
          isViable: false,
          warnings: ["La contribution dépasse son revenu."],
        }),
      }),
    });

    render(
      <ComparisonTable
        results={results}
        unlockedModels={ALL_MODELS}
        selectedModel={null}
        onModelSelect={vi.fn()}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    expect(screen.getByText(/non viable/i)).toBeInTheDocument();
  });
});
```

- [x] **Step 4.1a:** Add the transfer display tests above to `EdgeCases.test.tsx`.

- [x] **Step 4.1b:** Run tests to verify they fail.

Run: `npx vitest run tests/unit/components/results/EdgeCases.test.tsx`
Expected: FAIL

### Step 4.2: Add "warning" variant to ModelBadge

In `src/components/results/ModelBadge.tsx`, add a `"warning"` variant:

```typescript
export interface ModelBadgeProps {
  label: string;
  variant?: "default" | "best" | "locked" | "warning";
}

// In variantClasses:
warning: "bg-amber-dim text-amber",
```

Uses existing `--color-amber` (#FBBF24) and `--color-amber-dim` tokens from `globals.css`. The accent color (#FF6B35) is already orange, so amber provides visual distinction for the "non viable" badge.

- [x] **Step 4.2a:** Add the `"warning"` variant to `ModelBadge.tsx` using the existing `bg-amber-dim text-amber` tokens.

- [x] **Step 4.2b:** Run `npx tsc --noEmit` to verify no type errors.

### Step 4.3: Update ComparisonTable to handle negative contributions

In `ComparisonTable.tsx`, update the `formatAmount` function and contribution cells:

```typescript
function formatContribution(
  amount: number,
  personName: string,
  otherName: string
): React.ReactNode {
  if (amount < 0) {
    // Negative = transfer: show as "OtherName → PersonName : X €"
    const absFormatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
      Math.abs(amount)
    );
    return (
      <span className="text-accent text-[10px]">
        {otherName} → {personName}&nbsp;: {absFormatted}&nbsp;€
      </span>
    );
  }
  return formatAmount(amount);
}
```

Then replace `formatAmount(result.p1Contribution)` with `formatContribution(result.p1Contribution, p1Name, p2Name)` in P1 row, and the inverse for P2 row.

Also update the non-viable badge to use `variant="warning"`:

```tsx
{
  result && !result.isViable && <ModelBadge label="Non viable" variant="warning" />;
}
```

- [x] **Step 4.3a:** Add `formatContribution` function and update the contribution cells and badge variant in `ComparisonTable.tsx`.

- [x] **Step 4.3b:** Run tests to verify they pass.

Run: `npx vitest run tests/unit/components/results/EdgeCases.test.tsx`
Expected: PASS

- [x] **Step 4.3c:** Run full test suite.

Run: `npx vitest run`
Expected: PASS (all tests green)

- [x] **Step 4.4: Commit**

```bash
git add src/components/results/ModelBadge.tsx src/components/results/ComparisonTable.tsx tests/unit/components/results/EdgeCases.test.tsx
git commit -m "feat(ui): display transfers with arrow notation, add warning badge for non-viable"
```

---

## Task 5: Verify full suite + typecheck

- [x] **Step 5.1:** Run typecheck.

Run: `npx tsc --noEmit`
Expected: No errors.

- [x] **Step 5.2:** Run full test suite.

Run: `npx vitest run`
Expected: All tests pass.

- [x] **Step 5.3:** Run linter.

Run: `npx eslint src/domain/models/m3-equal-rav.ts src/domain/models/m5-total-contribution.ts src/components/results/ComparisonTable.tsx src/components/results/ModelBadge.tsx`
Expected: No errors.
