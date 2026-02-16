# Skeleton Spec Delta — Agreed Changes Not Yet Implemented

> **Version:** 1.0 — February 8, 2026
> **Purpose:** Documents four design decisions agreed during architecture sessions that are NOT yet reflected in the React frontend code. These are the changes the skeleton spec prescribes on top of existing code.
> **Source sessions:** Feb 8 step-by-step flow design, pane CTA clarification, skeleton-submodule boundary spec
> **Status:** Agreed, not built. Build priority TBD.

---

## Delta 1: Data Flow Icons on Submodule Cards (➕ ➖ ＝)

### What was agreed

Every submodule declares its **relationship to the step's data pool** via a `data_flow_type` field in the manifest:

| Icon | Type | Meaning | Example |
|------|------|---------|---------|
| ➕ | `add` | Output is larger than input. Discovers, expands, generates. | Sitemap, Navigation (Step 1) |
| ➖ | `remove` | Output is smaller than input. Filters, deduplicates, cleans. | URL Pattern Filter (Step 2) |
| ＝ | `transform` | Same quantity, different shape. Converts content type. | Scraper turning URLs into page content (Step 3) |

The icon appears on the **submodule card** (inside `CategoryCardGrid`) so the user knows what each submodule does to the data *before opening it*.

This is what makes **one universal step template** possible — the skeleton doesn't need to know whether it's rendering Discovery or Validation. The ➕/➖/＝ declaration per submodule is all the differentiation needed.

### What exists in code

**`types/step.ts` → `Submodule` interface:**
No `data_flow_type` field.

```typescript
// Current
export interface Submodule {
  id: string;
  name: string;
  description: string;
  cost: 'cheap' | 'medium' | 'expensive';
  status: 'pending' | 'running' | 'completed' | 'approved';
  result_count: number;
}
```

**`CategoryCardGrid.tsx`:**
No icon rendered. Cards show name, description, cost, status, result count — but not data flow type.

**Manifest contract (skeleton spec Part 5):**
No `data_flow_type` field defined.

### What needs to change

1. **Manifest:** Add `data_flow_type` field — `"add" | "remove" | "transform"`. Required.

2. **Type:** Add to `Submodule` interface:
```typescript
export interface Submodule {
  // ...existing fields
  data_flow_type: 'add' | 'remove' | 'transform';
}
```

3. **CategoryCardGrid:** Render the icon before each submodule name inside the expanded category card. Small icon, left of the name. Example: `➕ Sitemap Parser` or `➖ URL Pattern Filter`.

4. **Database:** `submodule_runs` or the manifest registry should carry this field so the skeleton knows how to handle the submodule's output during intra-step chaining (see Delta 2).

---

## Delta 2: Intra-Step Data Chaining

### What was agreed

Within a step, submodules **chain sequentially**. When submodule A is approved, its output becomes submodule B's input. The data transforms as it moves through submodules within the step.

**Example — Step 2 (Validation):**
- URL Pattern Filter (➖) takes 728 URLs from Step 1 → removes 207 → 521 remain
- Future Manual Pattern Research (➖) receives those 521, not the original 728
- The list shrinks through each submodule

The `data_flow_type` determines how the skeleton routes data:

| Type | Chaining behavior |
|------|-------------------|
| ➕ `add` | Submodule output gets **added to** the step's running pool. Multiple add-submodules work from the same starting input and accumulate independently. |
| ➖ `remove` | Submodule output **replaces** the pool with a smaller set. Next submodule receives the reduced set. |
| ＝ `transform` | Submodule output **replaces** the pool with transformed content. Same quantity, different shape. |

### What exists in code

**`Step1Discovery.tsx`:**
All submodules read from the same source — `pipeline_stages.input_data` from Step 0. They work independently. Their results merge only at step approval via `finalizeStep`.

**`Step1Panel.tsx`:**
Input data comes from CSV upload or URL textarea. There's no mechanism to receive a previous sibling submodule's output as input.

**Backend (`POST /api/runs/:runId/steps/:stepIndex/approve`):**
Step finalization aggregates all approved submodule results into `pipeline_stages.output_data`. No intermediate chaining between submodule approvals within a step.

### What needs to change

1. **Skeleton routing logic:** When a submodule is approved within a step, the skeleton must update the step's "running pool" — an intermediate data set that subsequent submodules read from.

2. **For ➕ submodules:** Output accumulates. If Sitemap finds 623 URLs and Navigation finds 105 URLs, the running pool grows to 728. Both read from the same Step 0 input. This is close to current behavior — just needs the pool concept formalized.

3. **For ➖ and ＝ submodules:** Output replaces. URL Pattern Filter's 521 approved URLs *become* the pool. The next submodule opens with 521 as its input, not 728.

4. **Database option:** The running pool could live in `step_context` (already exists, currently used for CSV sharing) or as a new intermediate state in `pipeline_stages`. Decision needed on where this state lives.

5. **Panel input section:** Must be able to receive the running pool as input, not just CSV uploads or Step N-1 output. The panel should show "521 URLs from URL Pattern Filter" when opening the next submodule in a ➖ step.

6. **Step finalization:** For ➖/＝ steps, finalization is simpler — the running pool after the last approved submodule IS the step output. For ➕ steps, finalization merges the accumulated pool (current behavior with dedup).

### Open question

Should the running pool be persisted after each submodule approval (survives page refresh) or only held in memory (lost on refresh, user re-approves)? Given server-as-truth architecture, persisted is correct. Recommend extending `step_context` or adding a `step_pool` concept.

---

## Delta 3: Two-Level CTA System (Internal Accordion CTAs)

### What was agreed

The pane has **two levels of CTAs**, both provided by the skeleton:

**Level 1 — Fixed bottom row (universal, always visible):**
```
[RUN TASK]  ·  [SEE RESULTS]  ·  [APPROVE]
```
Sequential activation: input → Run Task activates → execution → See Results activates → review → Approve activates.

**Level 2 — Inside accordions (skeleton-provided CTAs within each section):**

| Accordion | Internal CTAs | Behavior |
|-----------|---------------|----------|
| Accordion 1 (Input) | **[Save]**, [Upload CSV], [Download Template] | [Save] closes accordion 1, opens accordion 2, activates Run Task in bottom row |
| Accordion 2 (Options) | **[Save]** | Saves option changes. User can then click Run Task in bottom row. |
| Accordion 3 (Results) | **[Change Settings or Upload]** | Reopens accordion 1 or 2 so user can modify and re-run |

The **[Save]** in accordion 1 is the critical transition: it confirms input data is ready, stores it (to step_context if CSV), and unlocks the Run Task button.

### What exists in code

**`SubmodulePanel.tsx`:**
Only has the fixed bottom row with three buttons. No internal Save CTAs in any accordion section.

The `hasInput` prop gates Run Task — but it's set by the Step1Panel based on whether `csvEntities` or `inputUrls` exist, not triggered by an explicit Save action.

**`Step1Panel.tsx`:**
Input section has CSV upload and URL textarea. When the user uploads a CSV, `csvEntities` is populated and `hasInput` becomes true immediately. There's no explicit Save step that transitions between accordions.

Options section has config fields. Changes take effect on next Run Task — no explicit Save needed currently.

Results section shows a ResultsList with reject handler. No "Change Settings or Upload" CTA.

### What needs to change

1. **Accordion 1 — Add [Save] CTA:**
   - Appears at the bottom of the input section content area
   - On click: validates input, writes to step_context if CSV, closes accordion 1, opens accordion 2, sets `hasInput = true` (activates Run Task)
   - Before Save: Run Task stays disabled even if input fields have content
   - This makes the input commitment explicit — the user says "this is my input" before proceeding

2. **Accordion 1 — Add [Download Template] CTA:**
   - Provides a pre-built CSV template with columns for ALL submodules in the current step
   - Template columns come from the union of `requires_columns` across all sibling submodule manifests

3. **Accordion 2 — Add [Save] CTA:**
   - Saves current option values
   - Optional: could close accordion 2 to signal readiness
   - Run Task in bottom row works with whatever options are currently set

4. **Accordion 3 — Add [Change Settings or Upload] CTA:**
   - Appears in results section after execution completes
   - On click: reopens accordion 1 (for new input) or accordion 2 (for option changes)
   - Essentially a "try again with different settings" flow without requiring explicit re-run

5. **SubmodulePanel.tsx refactor:**
   - The skeleton should inject these CTAs into accordion sections
   - Submodule content renders *above* the skeleton CTAs within each accordion
   - The content slot is what the submodule fills; the CTAs are what the skeleton adds

### Design note

The two-level CTA system creates a guided workflow: Save → Run Task → See Results → Approve. Each CTA unlocks the next. This prevents the user from running with empty input or approving before seeing results. The current code achieves partial gating via `hasInput` and `isCompleted` props, but the explicit Save transitions and internal CTAs add structure and clarity.

---

## Delta 4: Universal Step Template

### What was agreed

**One generic step template for all 11 steps.** The skeleton doesn't know or care whether it's Discovery, Validation, or Scraping. It renders the same containers, same mechanics, same CTAs. The only per-step differences come from:

1. What submodules auto-discovery finds for that step (from manifests)
2. The ➕/➖/＝ icons on each submodule card (from manifests)
3. The content inside each accordion slot (from submodule declarations)

The step template provides:
- Step header (number, name, description — from step config)
- Category card grid (from auto-discovered submodules grouped by `category`)
- Step summary (aggregated counts from approved submodules)
- Step approval footer ([Approve Step] / [Skip Step])
- Submodule panel (slides in when card clicked — universal pane template)

### What exists in code

**`Step1Discovery.tsx` (195 lines) — custom Step 1 component:**
- Hardcoded info banner ("Multi-Source Discovery" with pink/blue styling)
- Hardcoded "Source Types (click to configure)" label
- Custom `useMemo` merge logic for server categories + UI state
- Custom count functions (getApprovedCount, getTotalDiscoveredUrls, getCategoryUrlCount)
- Custom `handleApproveStep` with Step 1–specific `stepIndex: 1`
- Custom `handleSubmoduleClick` that calls `openSubmodulePanel` with `'discovery'` type

**`StepContainer.tsx`:**
Generic accordion wrapper — already step-agnostic. This is reusable.

**`CategoryCardGrid.tsx`, `StepSummary.tsx`, `StepApprovalFooter.tsx`:**
Already generic shared components. These are reusable.

### What needs to change

1. **Create `UniversalStepTemplate.tsx`** — a single component that any step uses:

```typescript
interface UniversalStepProps {
  stepIndex: number;
  stepName: string;
  stepDescription: string;
}
```

   The component:
   - Fetches submodule categories for `stepIndex` via `useStepCategories(stepIndex)`
   - Renders `CategoryCardGrid` (with ➕/➖/＝ icons from Delta 1)
   - Renders `StepSummary` with generic count labels
   - Renders `StepApprovalFooter` with `handleApproveStep` parameterized by `stepIndex`
   - Opens `SubmodulePanel` (universal pane template) when any card is clicked

2. **Delete (or refactor) `Step1Discovery.tsx`** — replace with:
```tsx
<UniversalStepTemplate stepIndex={1} stepName="Discovery" stepDescription="Find URLs via..." />
```

3. **Step config source:** Step names, descriptions, and ordering should come from a config object or the database — not hardcoded per component. Example:

```typescript
const STEP_CONFIG = [
  { index: 0, name: 'Project Start', description: '...' },
  { index: 1, name: 'Discovery', description: 'Find URLs via sitemap, navigation, search, and external sources' },
  { index: 2, name: 'Validation', description: 'Clean and validate URLs before scraping' },
  // ...through step 10
];
```

4. **Step 0 exception:** Step 0 (Project Start) has no submodules — it's a project setup form. It may remain a custom component or become a special case of the universal template with zero submodule categories.

5. **Panel type:** Currently `openSubmodulePanel` takes a `type` parameter (`'discovery'`). With a universal template, this becomes the step name or step index — no hardcoded types.

### What's already reusable (no changes needed)

- `StepContainer.tsx` — generic accordion wrapper ✅
- `CategoryCardGrid.tsx` — just needs ➕/➖/＝ icons added (Delta 1) ✅
- `StepSummary.tsx` — already parameterized with `itemLabel` ✅
- `StepApprovalFooter.tsx` — already generic ✅
- `SubmodulePanel.tsx` — already universal (just needs internal CTAs from Delta 3) ✅

The existing shared components were designed for reuse. The gap is that `Step1Discovery.tsx` wraps them in a custom way instead of using a generic template.

---

## Implementation Priority

| Delta | Complexity | Dependency | Suggested Order |
|-------|-----------|------------|-----------------|
| **Delta 1** (➕➖＝ icons) | Low | Manifest field + type + card render | **First** — simple, visible, enables Delta 4 |
| **Delta 3** (internal CTAs) | Medium | SubmodulePanel refactor | **Second** — improves UX flow, independent |
| **Delta 4** (universal template) | Medium | Depends on Delta 1 | **Third** — replaces per-step components |
| **Delta 2** (data chaining) | High | Backend + frontend + state design | **Fourth** — most complex, needs design decisions |

Delta 2 (chaining) can be deferred past MVP-1 if all MVP-1 submodules are ➕ type (Discovery accumulates independently). Chaining only matters when ➖ submodules exist in the same step (Step 2+).

---

## Files Affected

| File | Deltas | Change Type |
|------|--------|-------------|
| `types/step.ts` | 1 | Add `data_flow_type` to Submodule |
| `CategoryCardGrid.tsx` | 1 | Render ➕/➖/＝ icon per submodule |
| `SubmodulePanel.tsx` | 3 | Add internal accordion CTAs |
| `Step1Panel.tsx` | 3 | Adapt to Save-based input flow |
| `Step1Discovery.tsx` | 4 | Replace with UniversalStepTemplate |
| Manifest contract (spec) | 1, 2 | Add `data_flow_type` field |
| Backend step context | 2 | Running pool persistence |
| New: `UniversalStepTemplate.tsx` | 4 | Create |
| New: `stepConfig.ts` | 4 | Step definitions |
