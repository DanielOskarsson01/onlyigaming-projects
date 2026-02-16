# Content Creation Tool — Skeleton Definition

> **Version:** 2.0 — February 8, 2026
> **Replaces:** Relevant sections of Skeleton Spec v1.2 (Part 8 Level 3, Part 5 output_type rendering, Part 10 UI)
> **Purpose:** Defines what the skeleton IS and what it provides. The skeleton is the building. Submodules are the apartments.
> **Companion documents needed:** Submodule Developer Guide (Document 3 — not yet written)

---

## The Skeleton Principle

The skeleton owns the walls, doors, and plumbing. Submodules own the furniture.

**The skeleton provides:**
- Containers — step workspace, category cards, submodule panes, accordion sections. All are empty slots with defined positions.
- Mechanics — data transfer between steps, shared context within steps, format validation, execution via job queue, status state machine, approval flow, decision logging.
- CTAs and transitions — hardcoded buttons with activation logic. Their placement is fixed. Their availability follows rules.

**The skeleton does NOT provide:**
- What content appears inside any slot
- What columns a results list shows
- What input fields an upload form needs
- What options exist
- What a summary looks like
- How results are visualized

Each submodule declares all of that through its manifest and component definitions.

---

## Top-Level UI Shell

**Header bar (always visible):**

Logo (OnlyiGaming Content Tool) on the left.

Three navigation items:

1. **New Project** — Project creation form (Step 0).
2. **Projects** — List view: all projects with name, description, number of runs. Clicking a project opens a detail view showing runs, active steps, dates. From there, drill into steps and submodules. *Note: detail view and drill-down built in later phase. v1 just needs the list and a way to open the current run.*
3. **Templates** — Placeholder in v1. Nav item exists, page shows empty state. Template listing and creation is a later phase.

When inside a run, the header stays. Below it, the RunView renders the step workspace.

---

## Step 0: Project Start

Not a step template — this is a dedicated project creation form built into the skeleton.

**Fields:**
- Project Name (required)
- Template (optional — placeholder in v1)
- Parent Project (optional — link to parent if sub-project)
- Intent (optional — freeform goal text)
- Timing (optional — placeholder in v1: one-off / scheduled / continuous)

**No data upload. No entities. No CSV.** Data entry happens inside submodules in Step 1.

**Flow:**
1. User fills in project metadata
2. Clicks [Create & Start Run]
3. Skeleton creates: projects row, pipeline_runs row, 11 pipeline_stages rows
4. Step 0 is set to "active"
5. User sees project summary, clicks [APPROVE STEP]
6. Step 0 → completed, Step 1 → active, opens automatically

---

## Universal Step Template

One template for all 11 steps (Step 1 through Step 10). The skeleton does not know which step it is rendering. It renders the same structure every time.

### Step Workspace Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Step Navigation (top bar or sidebar)                             │
│ [0 ✓] [1 ●] [2 ○] [3 ○] [4 ○] [5 ○] [6 ○] [7 ○] [8 ○] [9 ○] [10 ○] │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Category Cards                                                   │
│                                                                  │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│ │ Category A  │  │ Category B  │  │ Category C  │              │
│ │ X modules   │  │ (empty)     │  │ (empty)     │              │
│ └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│ When category clicked, expands to show submodule cards:          │
│ ┌─ Category A ────────────────────────────────────────────┐     │
│ │ ┌──────────┐  ┌──────────┐  ┌──────────┐               │     │
│ │ │ Module 1 │  │ Module 2 │  │ Module 3 │               │     │
│ │ │ cost     │  │ cost     │  │ cost     │               │     │
│ │ │ status   │  │ status   │  │ status   │               │     │
│ │ │ [➕|➖|＝] │  │ [➕|➖|＝] │  │ [➕|➖|＝] │               │     │
│ │ └──────────┘  └──────────┘  └──────────┘               │     │
│ └─────────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Step Summary (always visible at bottom)                          │
│                                                                  │
│ Module 1: 623 items ✓    Module 2: 105 items ✓    Module 3: —   │
│                                                                  │
│ [APPROVE STEP]  [SKIP STEP]                                     │
└──────────────────────────────────────────────────────────────────┘
```

### What the Skeleton Renders

- Step navigation bar with status per step (locked, active, completed, skipped)
- Category card grid — auto-populated from manifest discovery (categories = visual grouping)
- Submodule cards inside categories — name, cost badge, status, data operation toggle
- Step summary — running totals from approved submodules
- Step-level CTAs: [APPROVE STEP], [SKIP STEP]

### What the Skeleton Does NOT Render

- Anything inside the submodule pane (that's the universal pane template)
- Result-specific UI (that's the submodule's job)
- Step-specific logic (every step uses the same template)

---

## Universal Pane Template

One template for all submodule panes. The skeleton does not know which submodule it is rendering. Same structure every time.

### Pane Layout

```
┌──────────────────────────────────────────────────────┐
│ Submodule Name                              [Close]  │
│ Description text                                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌── Top Area ─────────────────────────────────────┐  │
│ │ (open slot — submodule fills)                   │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
│ ▼ Accordion 1 — Input                                │
│ ┌─────────────────────────────────────────────────┐  │
│ │ (open slot — submodule fills)                   │  │
│ │                                                 │  │
│ │ ─────────────────────────────────────────────── │  │
│ │ [Upload CSV]  [Download Template]       [Save]  │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
│ ▶ Accordion 2 — Options                              │
│ ┌─────────────────────────────────────────────────┐  │
│ │ (open slot — submodule fills)                   │  │
│ │                                                 │  │
│ │ ─────────────────────────────────────────────── │  │
│ │                                         [Save]  │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
│ ▶ Accordion 3 — Results                              │
│ ┌─────────────────────────────────────────────────┐  │
│ │ (open slot — submodule fills)                   │  │
│ │                                                 │  │
│ │ ─────────────────────────────────────────────── │  │
│ │                     [Change Settings or Upload]  │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
├──────────────────────────────────────────────────────┤
│ Fixed CTA Row                                        │
│ [Run Task]  ·  [See Results]  ·  [Approve]           │
│ (all inactive initially, activate sequentially)      │
└──────────────────────────────────────────────────────┘
```

### Skeleton-Owned Elements

**Pane frame:**
- Header with submodule name + description (from manifest)
- Close button (ESC key, backdrop click)
- Slide-in animation from side

**Accordion structure:**
- Three accordions with expand/collapse
- Headers always visible
- Result count shown in accordion 3 header when results exist

**CTAs inside accordions (skeleton-hardcoded):**
- Accordion 1: [Upload CSV], [Download Template], [Save]
- Accordion 2: [Save]
- Accordion 3: [Change Settings or Upload]

**Fixed bottom CTA row (skeleton-hardcoded):**
- [Run Task] — inactive until accordion 1 is saved
- [See Results] — inactive until execution completes
- [Approve] — inactive until results are viewed

**CTA activation sequence:**
1. User provides input in accordion 1, clicks [Save] → accordion 1 closes, accordion 2 opens, **[Run Task] activates**
2. User optionally adjusts options, clicks [Run Task] → BullMQ job created → execution runs → **[See Results] activates**
3. User clicks [See Results] → accordion 3 opens with results → **[Approve] activates**
4. User clicks [Approve] → submodule marked approved, pane closes (or stays open), card updates with status + count

### Submodule-Owned Elements (Open Slots)

**Everything inside the accordion content areas.** The submodule declares:
- What the input area looks like (URL list, text field, entity table — depends on submodule)
- What summary to show (URL counts, entity counts, column availability)
- What options exist (fields, types, defaults, constraints)
- What results look like (table, preview, key-value, custom)
- What the top area shows (if anything)

The skeleton renders the slot. The submodule fills it.

---

## Data Operation Toggle (➕ ➖ ＝)

Each submodule card shows a data operation indicator. This is set on the **card level**, visible before the pane opens.

- **➕ Adds** — submodule output gets added to the step's working data
- **➖ Removes** — submodule output replaces the working data with a smaller set
- **＝ Separate** — submodule output is a separate line of content alongside the rest

**Default value:** Declared in the submodule's manifest. A discovery submodule defaults to ➕. A filter submodule defaults to ➖.

**User override:** The user can change the toggle on the card at any time before approving the step.

**Effect on step data:**
- When a submodule is approved, the step's working dataset updates immediately based on the card's current toggle setting
- The next submodule the user opens sees the updated dataset
- The step summary reflects the current state

---

## Step Working Data

Each step maintains a running working dataset. This is the key skeleton mechanic.

**Initial state:** Comes from the previous step's output_data (or empty for Step 1).

**Update on submodule approval:** Based on the data operation toggle:
- ➕: Merge submodule's approved output into the working data
- ➖: Replace working data with submodule's output (which is a subset)
- ＝: Store as a separate data line alongside the main working data

**Step approval:** When the user clicks [APPROVE STEP], the current working data becomes the step's output_data and passes to the next step as input_data.

---

## Shared Context (CSV Data Sharing)

When a user uploads data in any submodule within a step, that data becomes available to all other submodules in the same step, same run.

**How it works:**
1. User uploads CSV in Submodule A → skeleton parses and writes to `step_context`
2. User opens Submodule B → skeleton checks step_context → finds data → offers it: "Found X entities from uploaded data. [Use these] [Upload different]"
3. Submodule B uses the shared data without re-upload

**Priority:**
1. Submodule-specific upload (if user uploads in this submodule) → use that
2. Shared step context (if data exists from earlier upload) → offer it
3. Neither → show upload prompt

**Scope:** Same step, same run. Not shared across steps or runs.

**CSV template:** The skeleton dynamically generates a CSV template for each step. It reads all manifests for submodules in that step, collects every `requires_columns`, and builds the template from that union. Adding a new submodule with new column requirements automatically updates the template.

---

## Skeleton Mechanics (Plumbing)

These are the fixed mechanics the skeleton provides. They don't change per submodule or step.

### Data Transfer Between Steps

- Step N completed → output_data written to pipeline_stages
- Step N+1 activated → reads Step N's output_data as its input_data
- Steps never communicate directly — database mediates

### Format Validation

- CSV upload → skeleton checks: valid CSV? Headers present? Parseable?
- If invalid → error message, upload resets
- If valid → data displayed, [Save] available

### Execution via BullMQ

- [Run Task] → API creates submodule_runs row (status: pending) → BullMQ job created
- Worker picks up job → loads submodule execute.js → passes input/options/tools → captures result
- On success → writes output_data, status: completed
- On failure → writes error, status: failed
- Priority: cheap=1 (highest), medium=5, expensive=10 (BullMQ processes higher priority first)
- Concurrency: 2 jobs simultaneously
- Timeouts: 5min cheap, 15min medium, 30min expensive

### Status State Machine

**Submodule run:**
```
pending → running → completed → approved
                             → (user clicks Change Settings → re-runs → new submodule_run)
                  → failed
```

**Step:**
```
pending → active → completed (approved)
                → skipped
```

**Run:**
```
running → completed (all steps done)
       → paused
       → failed
```

### Approval Flow

- Submodule approval: user clicks [Approve] → submodule_run status → "approved" → card updates → step working data updates based on ➕➖＝
- Step approval: user clicks [APPROVE STEP] → working data written to output_data → next step activates
- Step skip: [SKIP STEP] → previous step's output passes through unchanged

### Decision Logging

Every approval, rejection, re-run, and skip is logged automatically by the skeleton. Built into the approval routes, not submodules. Submodules don't know about decision logging.

### Module Auto-Discovery

At startup, skeleton scans MODULES_PATH, reads every manifest.json, validates, registers. No manual registration needed. Adding a submodule = create folder + manifest + execute.js.

---

## What Changed from Skeleton Spec v1.2

| Topic | v1.2 | v2.0 |
|-------|------|------|
| **Output rendering** | Skeleton owns rendering logic via output_type switch | Skeleton provides empty slot, submodule declares what fills it |
| **Accordion contents** | Skeleton defines what each accordion shows | Skeleton provides the slot and CTAs, submodule fills the content |
| **Step template** | Implied different per step | One universal template for all steps |
| **Pane template** | Implied different per submodule type | One universal template for all submodules |
| **Per-item approval in Discovery** | Items individually approved/rejected | Whole submodule output approved. Per-item filtering is later steps' job |
| **Dedup at step aggregation** | Skeleton deduplicates by item_key at step approval | No dedup at aggregation. Dedup is a submodule's job if needed |
| **Data operation** | Submodules within a step are independent, merge at step approval | Data operation (➕➖＝) on card level, step working data updates per approval |
| **CSV upload location** | Ambiguous (Step 0 or Step 1) | Confirmed: inside submodules in Step 1, not Step 0 |
| **CSV template** | Static file | Dynamic, regenerated from all manifests in the step |

### Fields removed from manifest

- **output_type** — No longer a rendering switch. The submodule declares its own rendering. If a simpler signaling field is still useful for the Developer Guide, it stays as documentation, not as a skeleton rendering instruction.

### Fields added to manifest

- **data_operation_default** — "add", "remove", or "separate". Default toggle value shown on the card. User can override.

### Documents needed

- **Submodule Developer Guide** — The tenant manual. What slots exist, what to declare, what plumbing is available, what's off-limits. This is Document 3.

---

## Infrastructure (Unchanged)

All infrastructure from Skeleton Spec v1.2 remains valid:

- Hetzner CX22 VPS (2 vCPU, 4GB RAM, Ubuntu 24.04)
- Supabase PostgreSQL
- Redis + BullMQ on Hetzner
- Node.js 20 LTS, Express.js, PM2
- React 18 + TypeScript + Vite + Tailwind
- TanStack Query (server state) + Zustand (UI state)
- Two-repo split (skeleton + modules)

See Skeleton Spec v1.2 Parts 1–4, 11 for full infrastructure detail.
