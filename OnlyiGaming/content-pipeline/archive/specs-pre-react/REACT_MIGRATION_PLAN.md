# React Migration Plan - Visual Replication with Architectural Rebuild

## Objective

Port the existing Alpine.js UI (`public/index.html`, 4280 lines) to React with **pixel-perfect visual replication** but **completely rebuilt architecture**. Same design, colors, and layout — different underlying state management and patterns.

**What "Visual Replication" means:**
- Visual: Exact same look and feel (screenshots should match)
- Architectural Rebuild: Server-as-truth pattern replaces Alpine's local state approach
- No Redesign: Zero changes to UI/UX during migration phase

---

## Pre-Requisites Checklist

Before starting Phase 1, confirm:

- [x] **Gap 1** - Batch approval endpoint deployed (`POST /api/submodules/runs/:runId/:submoduleRunId/batch-approval`) — **VERIFIED 2026-02-01** (curl returns validation error, endpoint live)
- [x] **Gap 2** - Per-result tracking table (`submodule_result_approvals`) + endpoints deployed — **VERIFIED 2026-02-01** (curl returns UUID parse error, endpoint live)
- [x] **Re-run behavior** - DECIDED: Option C (Cascade Invalidate) — Schema changes in Backlog B003

### Re-Run Behavior Decision (DECIDED: Option C)

| Option | Behavior | Implication |
|--------|----------|-------------|
| A) Wipe approvals | Re-running deletes all `submodule_result_approvals` for that submodule_run | Clean slate, loses history |
| B) Keep approvals | Re-running creates NEW submodule_run, old approvals orphaned | History preserved, potential confusion |
| **C) Cascade invalidate** | **Re-running marks downstream step approvals as "needs_review"** | **Complex but safest - SELECTED** |

**Decision:** Option C - Cascade Invalidate (Decided 2026-02-01)

**Implementation:**
- Re-running a submodule marks its `submodule_run` as `superseded`
- Creates a new `submodule_run` with `supersedes` foreign key pointing to old run
- All downstream approvals auto-transition to `needs_review` status
- UI shows "Results changed, re-review required" badge on affected items

**Why Option C:**
1. Full history preserved (auditability)
2. No orphaned approvals (data integrity)
3. Clear user feedback (UX)
4. Production-ready approach

**Schema Changes Required:**
```sql
ALTER TABLE submodule_runs ADD COLUMN supersedes UUID REFERENCES submodule_runs(id);
ALTER TABLE submodule_runs ADD COLUMN superseded_at TIMESTAMPTZ;
ALTER TABLE submodule_result_approvals ADD COLUMN needs_review BOOLEAN DEFAULT FALSE;
ALTER TABLE submodule_result_approvals ADD COLUMN review_reason TEXT;
```

---

## Architecture Principles

### Server-as-Truth Pattern

**The UI does NOT manage data state. The server is the single source of truth.**

```
User clicks "Approve"
    → POST /api/.../approve
    → Server updates database
    → React Query invalidates cache
    → UI re-fetches and re-renders
```

**What the UI does:**
- Fetch → Render → Handle user actions → Fetch again
- NO optimistic updates
- NO client-side state mirroring server data

**What the UI does NOT do:**
- ❌ Track approval state in memory
- ❌ Cascade invalidation logic
- ❌ Sync state between components
- ❌ Persist anything to localStorage

Reference: See `UNIVERSAL_UI_IMPLEMENTATION_PLAN_v2.md` for detailed architecture.

### State Ownership Rules

| State Type | Owner | Example | Why |
|------------|-------|---------|-----|
| **Server data** | TanStack Query | projects, runs, submodule results, approvals | Server is truth, Query handles caching/refetch |
| **UI state** | Zustand | activePanel, expandedStep, activeTab, selectedProject | Ephemeral, survives navigation |
| **Form state** | Local component | input values before submission | Doesn't need to persist |
| **Derived state** | Computed in component | filtered lists, counts, status badges | Calculated from server data |

**Explicit Rule:** Zustand stores contain ZERO server data. If it comes from an API, it lives in TanStack Query.

---

## Component Inventory

### 1. Layout Components

| Component | Alpine Location | Description |
|-----------|----------------|-------------|
| `AppHeader` | Lines 528-550 | Logo, version badge, Demo/Live toggle |
| `AppNav` | Lines 552-563 | Tab navigation (Projects, Monitor, Content, etc.) |
| `AppMain` | Lines 566+ | Main content wrapper |
| `Toast` | Lines 2020-2030 | Toast notification |

### 2. Overlay Panels (Slide-in from left)

Reference: `UNIVERSAL_UI_IMPLEMENTATION_PLAN_v2.md` - Pane behavior specification

| Component | Alpine Location | Description |
|-----------|----------------|-------------|
| `SubmodulePanel` | Lines 67-288 | Teal (#0891B2) header, 3 accordions, action footer |
| `ValidationPanel` | Lines 290-413 | Orange header, validation-specific UI |
| `ResultsPanel` | Lines 415-526 | Generic results display |

**Panel Structure (3-Accordion Pattern):**
1. **Input Data Accordion** - Teal header, entity context, URL input, CSV upload
2. **Advanced Options Accordion** - Teal header, submodule-specific config
3. **Results Accordion** - Pink (#E11D73) header, results grouped by entity, per-result approval

**Panel Footer CTAs:**
- RUN TASK - Gray when disabled, gray-200 hover when enabled
- SEE RESULTS - Gray when disabled, gray-200 hover when enabled
- APPROVE - Pink (#E11D73) when enabled, gray when disabled

### 3. Panel Sub-components

| Component | Description |
|-----------|-------------|
| `PanelHeader` | Colored header with title, subtitle, close button |
| `PanelAccordion` | Collapsible section with teal/pink header |
| `InputDataAccordion` | Entity context display, URL input, CSV upload |
| `AdvancedOptionsAccordion` | Submodule-specific config options |
| `ResultsAccordion` | Results grouped by entity, download CSV, **per-result approve/reject** |
| `PanelFooter` | Action buttons: RUN TASK, SEE RESULTS, APPROVE |

### 4. Step Components (11-Step Pipeline)

| Component | Step | Alpine Location |
|-----------|------|----------------|
| `StepContainer` | All | Lines 580-620 | Accordion wrapper with header, status badge |
| `Step0ProjectSetup` | 0 | Lines 628-713 | New/Existing project selection |
| `Step1Discovery` | 1 | Lines 716-781 | Category cards with submodules |
| `Step2Validation` | 2 | Lines 783-877 | Validation submodules |
| `Step3Extraction` | 3 | Lines 879-989 | Extraction engines config |
| `Step4Filtering` | 4 | Lines 991-1093 | Filter configuration |
| `Step5Generation` | 5 | Lines 1095-1209 | AI models, generation types |
| `Step6QA` | 6 | Lines 1211-1325 | Quality assurance checks |
| `Step7Routing` | 7 | Lines 1327-1435 | Routing & flow control |
| `Step8Bundling` | 8 | Lines 1437-1550+ | Output formats |
| `Step9Review` | 9 | TBD | Human review queue |
| `Step10Delivery` | 10 | TBD | CMS delivery |

### 5. Card Components

| Component | Description |
|-----------|-------------|
| `CategoryCard` | Expandable category with submodule list |
| `SubmoduleCard` | Clickable submodule with status, cost badge |
| `ProjectCard` | Project list item |
| `RunCard` | Pipeline run list item |

### 6. Shared UI Components

| Component | Description |
|-----------|-------------|
| `StatusBadge` | Colored pill for status display |
| `CostBadge` | cheap/medium/expensive indicator |
| `Toggle` | On/off switch |
| `Button` | Primary, secondary, approve, reject variants |
| `Modal` | Generic modal wrapper |

---

## Design Tokens (Exact Match)

```css
/* Colors */
--teal: #0891B2;        /* Panel headers, primary actions */
--pink: #E11D73;        /* Results accordion, approve button */
--brand-600: #0284c7;   /* Active step, primary brand */

/* Status Colors */
--green-500: #22c55e;   /* Approved */
--blue-500: #3b82f6;    /* Has results */
--orange-500: #f59e0b;  /* Running */
--yellow-500: #eab308;  /* Warning */
--red-500: #ef4444;     /* Error */

/* Backgrounds */
--bg-panel: #f3f4f6;    /* Panel background (gray-100) */
--bg-page: #f9fafb;     /* Page background (gray-50) */

/* Submodule Card States */
.submodule-card.approved {
  border-color: #22c55e;
  background: linear-gradient(to right, #f0fdf4 0%, white 100%);
}
.submodule-card.has-results {
  border-color: #3b82f6;
  background: linear-gradient(to right, #eff6ff 0%, white 100%);
}
.submodule-card.running {
  border-color: #f59e0b;
  animation: pulse 1.5s infinite;
}
```

---

## State Management

### Zustand Stores (UI State Only)

```typescript
// stores/appStore.ts - Global UI state
interface AppStore {
  activeTab: string;
  useMockData: boolean;
  toast: { message: string; type: string } | null;
  setActiveTab: (tab: string) => void;
  showToast: (message: string, type?: string) => void;
}

// stores/panelStore.ts - Panel visibility
interface PanelStore {
  submodulePanelOpen: boolean;
  validationPanelOpen: boolean;
  resultsPanelOpen: boolean;
  activeSubmoduleId: string | null;  // ID only, data from Query
  openSubmodulePanel: (submoduleId: string) => void;
  closeAllPanels: () => void;
}

// stores/pipelineStore.ts - Pipeline UI state (NOT data)
interface PipelineStore {
  selectedProjectId: string | null;  // ID only, data from Query
  expandedStep: number | null;
  expandedCategory: string | null;
  setSelectedProject: (id: string) => void;
  toggleStep: (step: number) => void;
}
```

### TanStack Query (Server Data)

```typescript
// All server data comes through Query hooks
useQuery(['projects'])
useQuery(['runs'])
useQuery(['run', runId])
useQuery(['submoduleRuns', runId])
useQuery(['submoduleResults', runId, submoduleRunId])  // Includes approval status
useMutation(executeSubmodule)
useMutation(approveResult)
useMutation(batchApprove)
```

### Key API Endpoints

| Endpoint | Used For |
|----------|----------|
| `GET /api/projects` | Load projects list |
| `POST /api/projects` | Create project |
| `GET /api/runs` | Load runs list |
| `GET /api/runs/:id` | Load single run with step status |
| `POST /api/projects/:id/start` | Start pipeline run |
| `POST /api/submodules/discovery/:name/execute` | Run discovery submodule |
| `POST /api/submodules/validation/:name/execute` | Run validation submodule |
| `GET /api/submodules/runs/:runId` | List submodule runs for a pipeline run |
| `GET /api/submodules/runs/:runId/:submoduleRunId/results` | Get results with approval status |
| `PATCH /api/submodules/runs/:runId/:submoduleRunId/results/:approvalId` | Per-result approval |
| `POST /api/submodules/runs/:runId/:submoduleRunId/batch-approval` | Batch approval |

### Database Tables Reference

| Table | Purpose |
|-------|---------|
| `projects` | Project definitions |
| `pipeline_runs` | Pipeline execution instances |
| `run_entities` | Entities being processed in a run |
| `submodule_runs` | Individual submodule executions |
| `submodule_result_approvals` | Per-result approval tracking (Gap 2) |
| `step_context` | Shared context between submodules within a step |

---

## Project Structure

```
content-pipeline/
├── client/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css                 # Exact Tailwind styles from Alpine
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.tsx
│   │   │   │   ├── AppNav.tsx
│   │   │   │   └── Toast.tsx
│   │   │   │
│   │   │   ├── panels/
│   │   │   │   ├── SubmodulePanel.tsx
│   │   │   │   ├── ValidationPanel.tsx
│   │   │   │   ├── ResultsPanel.tsx
│   │   │   │   ├── PanelHeader.tsx
│   │   │   │   ├── PanelAccordion.tsx
│   │   │   │   └── PanelFooter.tsx
│   │   │   │
│   │   │   ├── steps/
│   │   │   │   ├── StepContainer.tsx
│   │   │   │   ├── Step0ProjectSetup.tsx
│   │   │   │   ├── Step1Discovery.tsx
│   │   │   │   ├── Step2Validation.tsx
│   │   │   │   ├── Step3Extraction.tsx
│   │   │   │   ├── Step4Filtering.tsx
│   │   │   │   ├── Step5Generation.tsx
│   │   │   │   ├── Step6QA.tsx
│   │   │   │   ├── Step7Routing.tsx
│   │   │   │   ├── Step8Bundling.tsx
│   │   │   │   ├── Step9Review.tsx
│   │   │   │   └── Step10Delivery.tsx
│   │   │   │
│   │   │   ├── cards/
│   │   │   │   ├── CategoryCard.tsx
│   │   │   │   ├── SubmoduleCard.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   └── RunCard.tsx
│   │   │   │
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── StatusBadge.tsx
│   │   │       ├── CostBadge.tsx
│   │   │       ├── Toggle.tsx
│   │   │       └── Modal.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useProjects.ts
│   │   │   ├── useRuns.ts
│   │   │   ├── useSubmodules.ts
│   │   │   └── useWebSocket.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── appStore.ts           # Global UI state (tabs, toast, mock mode)
│   │   │   ├── panelStore.ts         # Panel open/close state
│   │   │   └── pipelineStore.ts      # Pipeline UI state (expanded step, selected IDs)
│   │   │
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── projects.ts
│   │   │   ├── runs.ts
│   │   │   └── submodules.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   └── config/
│   │       ├── steps.ts              # Step definitions (names, descriptions)
│   │       ├── submodules.ts         # Submodule definitions by category
│   │       └── mockData.ts           # Demo mode data
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
```

---

## Migration Milestones (Risk-Based)

Based on brutal critic feedback, using risk milestones instead of feature milestones.

### Milestone 1: Step 0 Proof-of-Concept (2-3 days)

**Goal:** Prove React can replicate Alpine behavior exactly.

- [ ] Set up Vite + React + TypeScript + Tailwind
- [ ] Create AppHeader with Demo/Live toggle
- [ ] Create StepContainer component
- [ ] Create Step0ProjectSetup (simplest step)
- [ ] Verify: Radio buttons, text inputs, dropdown work identically
- [ ] Verify: Project creation flow works in both Demo/Live modes

**GO/NO-GO:** If this takes >3 days, re-estimate entire project.

### Milestone 1.5: Server Sync POC (2-3 days)

**Goal:** Prove ONE submodule works end-to-end with TanStack Query before building all panels.

**Why this milestone exists:** Step 0 validates local UI patterns, but doesn't prove server integration. Without this checkpoint, we might build beautiful panels that don't sync correctly with the backend.

- [ ] Pick one simple submodule (recommend: Website Discovery)
- [ ] Wire TanStack Query for:
  - `useQuery(['submoduleRuns', runId])` - fetch status
  - `useMutation(executeSubmodule)` - trigger execution
  - `useQuery(['submoduleResults', runId, submoduleRunId])` - fetch results
- [ ] Implement basic results display (no panel yet, inline is fine)
- [ ] Execute submodule, see results appear without page refresh
- [ ] Approve one result via API, confirm Query invalidates and re-renders

**Deliverable:** One working submodule proves the entire data flow pattern.

**GO/NO-GO:** If Query cache invalidation doesn't work as expected, debug before panel work.

### Milestone 2: Panel Behavior Proven (3-4 days)

**Goal:** Prove slide-in panel with accordions works.

- [ ] Create SubmodulePanel with slide-in animation
- [ ] Create 3-accordion structure (Input, Options, Results)
- [ ] Create PanelFooter with RUN TASK, SEE RESULTS, APPROVE
- [ ] Verify: Panel opens/closes with backdrop
- [ ] Verify: Accordion expand/collapse works
- [ ] Verify: ESC key closes panel

**GO/NO-GO:** If panel behavior differs from Alpine, investigate before continuing.

### Milestone 3: Step 1 Discovery Complete (4-5 days)

**Goal:** One complex step fully migrated with all edge cases.

- [ ] Create Step1Discovery with CategoryCards
- [ ] Create SubmoduleCard with status indicators
- [ ] Wire up submodule execution API
- [ ] Wire up approval flow
- [ ] Wire up entity context sharing
- [ ] Verify: Results display grouped by entity
- [ ] Verify: Approval updates card status

**GO/NO-GO:** This is the template for Steps 2-10. Must be solid.

### Milestone 4: Remaining Steps (10-15 days)

**Goal:** Port Steps 2-10 using patterns from Step 1.

- [ ] Step2Validation with validation-specific panel
- [ ] Steps 3-8 with inline x-data configurations
- [ ] Steps 9-10 (if implemented in Alpine)
- [ ] Each step verified for visual parity

### Milestone 5: Integration & QA (5-7 days)

**Goal:** Full system works end-to-end.

- [ ] All API integrations working
- [ ] Per-result approval (Gap 2) integrated in ResultsAccordion
- [ ] WebSocket updates trigger Query invalidation
- [ ] Screenshot comparison with Alpine version
- [ ] Demo/Live mode both functional
- [ ] Bug fixes from testing

**Total Realistic Timeline: 26-40 days**

| Milestone | Duration | Cumulative |
|-----------|----------|------------|
| 1: Step 0 POC | 2-3 days | 2-3 days |
| 1.5: Server Sync POC | 2-3 days | 4-6 days |
| 2: Panel Behavior | 3-4 days | 7-10 days |
| 3: Step 1 Complete | 4-5 days | 11-15 days |
| 4: Steps 2-10 | 10-15 days | 21-30 days |
| 5: Integration & QA | 5-7 days | 26-37 days |
| Migration phases | ~3 weeks | +21 days parallel |

*Note: Migration phases (Shadow → Soft Launch → Default Switch) run parallel to continued development/bugfixing.*

---

## Success Criteria

- [ ] Visual screenshot comparison shows identical UI
- [ ] All 11 steps render correctly
- [ ] Submodule panel opens with 3 accordions
- [ ] RUN TASK executes submodule and shows results
- [ ] SEE RESULTS opens Results accordion
- [ ] APPROVE updates submodule status
- [ ] Per-result approve/reject buttons work (Gap 2)
- [ ] Batch approve/reject works (Gap 2)
- [ ] Demo/Live toggle works
- [ ] WebSocket events trigger UI updates
- [ ] No Alpine.js code remains

---

## WebSocket → TanStack Query Integration

### Current Alpine.js Approach

Alpine uses WebSocket messages to directly mutate local state:
```javascript
// Alpine pattern (what we're replacing)
socket.on('submodule-update', (data) => {
  this.discoveryCategories[catIdx].submodules[subIdx].status = data.status;
  this.discoveryCategories[catIdx].submodules[subIdx].results = data.results;
});
```

### React Pattern: WebSocket → Query Invalidation

**The React approach is fundamentally different:** WebSocket messages don't update state directly. They trigger cache invalidation, causing React Query to re-fetch.

```typescript
// hooks/useWebSocket.ts
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useWebSocket(runId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'submodule-started':
          // Invalidate submodule runs to show "running" status
          queryClient.invalidateQueries(['submoduleRuns', runId]);
          break;

        case 'submodule-completed':
          // Invalidate both runs list AND specific results
          queryClient.invalidateQueries(['submoduleRuns', runId]);
          queryClient.invalidateQueries(['submoduleResults', runId, message.submoduleRunId]);
          break;

        case 'submodule-failed':
          queryClient.invalidateQueries(['submoduleRuns', runId]);
          break;

        case 'approval-updated':
          // Invalidate results to reflect new approval status
          queryClient.invalidateQueries(['submoduleResults', runId, message.submoduleRunId]);
          break;
      }
    };

    return () => socket.close();
  }, [runId, queryClient]);
}
```

### Why This Matters

| Aspect | Alpine (Direct Mutation) | React (Invalidation) |
|--------|-------------------------|---------------------|
| State consistency | Can drift from server | Always matches server |
| Race conditions | Possible | Impossible (server is truth) |
| Offline behavior | Shows stale data | Shows loading/error state |
| Code complexity | Simple but fragile | More code but bulletproof |

---

## Error Handling Strategy

### State Diagram: Component Error States

```
┌─────────────┐
│   IDLE      │
└──────┬──────┘
       │ user action
       ▼
┌─────────────┐
│   LOADING   │ ──── TanStack Query: isLoading
└──────┬──────┘
       │
   ┌───┴───┐
   ▼       ▼
┌─────┐ ┌─────────┐
│ OK  │ │  ERROR  │ ──── TanStack Query: isError
└──┬──┘ └────┬────┘
   │         │
   ▼         ▼
┌─────────────────────┐
│   SHOW ERROR UI     │ ──── Display error.message + retry button
└─────────────────────┘
```

### Error Types and Handling

| Error Type | Detection | User Feedback | Recovery |
|------------|-----------|---------------|----------|
| Network error | Query `isError` | "Connection failed" + retry button | Auto-retry (3 attempts) |
| 4xx Client error | status 400-499 | Show validation message | User fixes input |
| 5xx Server error | status 500+ | "Server error" + retry | Manual retry |
| WebSocket disconnect | onclose event | "Connection lost" badge | Auto-reconnect |

### React Query Error Config

```typescript
// api/client.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30_000,  // 30 seconds
      onError: (error) => {
        // Global error handler - show toast
        useAppStore.getState().showToast(error.message, 'error');
      }
    },
    mutations: {
      retry: 0,  // No auto-retry for mutations
      onError: (error) => {
        useAppStore.getState().showToast(error.message, 'error');
      }
    }
  }
});
```

### Component-Level Error Boundary

```typescript
// components/ErrorBoundary.tsx
function SubmoduleErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <p className="text-red-700">Something went wrong</p>
      <p className="text-sm text-red-500">{error.message}</p>
      <button onClick={resetErrorBoundary} className="mt-2 btn btn-secondary">
        Try again
      </button>
    </div>
  );
}
```

---

## Migration & Rollback Plan

### Deployment Strategy: Parallel Running

Both Alpine.js and React UIs will be available during migration:

```
content-pipeline/
├── public/
│   └── index.html          # Alpine.js UI (current production)
├── client/
│   └── dist/
│       └── index.html      # React UI (new)
└── server.js               # Serves both based on route
```

### Route Configuration

```javascript
// server.js - during migration period
app.get('/', (req, res) => {
  res.sendFile('public/index.html');  // Alpine (default)
});

app.get('/react', (req, res) => {
  res.sendFile('client/dist/index.html');  // React (opt-in)
});

// After migration complete:
// - Swap routes so / serves React
// - Keep /legacy for Alpine fallback
```

### Rollback Triggers

| Trigger | Action |
|---------|--------|
| Critical bug in React UI | Revert route config to serve Alpine |
| Data corruption | Immediate rollback + investigate |
| Performance regression | Keep Alpine, profile React |
| User feedback | A/B test with opt-in toggle |

### Migration Phases

**Phase A: Shadow Mode (1 week)**
- React UI available at `/react`
- No promotion, internal testing only
- Compare behavior against Alpine

**Phase B: Soft Launch (1 week)**
- Add "Try New UI" button to Alpine header
- Collect user feedback
- Monitor error rates

**Phase C: Default Switch (1 week)**
- React becomes default at `/`
- Alpine available at `/classic`
- Monitor support tickets

**Phase D: Alpine Removal**
- Remove Alpine code after 2 weeks stable
- Delete `public/index.html`
- Update deployment scripts

---

## stepStates Migration Strategy

### Current Alpine Implementation

The `stepStates` object tracks each step's visibility and status in Alpine:

```javascript
// Alpine pattern (lines ~2300-2320 of index.html)
stepStates: {
  0: { expanded: true, status: 'active' },
  1: { expanded: false, status: 'pending' },
  // ... steps 2-10
}
```

### React Mapping

`stepStates` is **derived state** in React — it shouldn't exist as stored state:

| Alpine Property | React Equivalent | Storage |
|-----------------|-----------------|---------|
| `stepStates[n].expanded` | `expandedStep === n` | Zustand (pipelineStore) |
| `stepStates[n].status` | Computed from server data | None (derived) |

### Status Derivation Logic

```typescript
// hooks/useStepStatus.ts
function getStepStatus(step: number, run: Run, submoduleRuns: SubmoduleRun[]): StepStatus {
  const stepsSubmodules = submoduleRuns.filter(sr => sr.step === step);

  if (stepsSubmodules.length === 0) return 'pending';
  if (stepsSubmodules.some(sr => sr.status === 'running')) return 'running';
  if (stepsSubmodules.some(sr => sr.status === 'error')) return 'error';
  if (stepsSubmodules.every(sr => sr.status === 'approved')) return 'complete';
  if (stepsSubmodules.some(sr => sr.status === 'completed')) return 'has_results';

  return 'pending';
}
```

### Why No stepStates Store

1. **Server is truth**: Step status comes from submodule_runs table
2. **Derived state**: Status is computed from existing data, not stored
3. **Simpler code**: No sync logic between stored state and server state
4. **Only `expandedStep` persists**: Which accordion is open is the only UI-only state

---

## Files to Delete After Migration

- `public/index.html` (4280 lines)
- Remove Alpine.js CDN reference
- Remove inline `<script>` with app() function

---

## Related Documents

- `STATE_MIGRATION_SPREADSHEET.md` - **Critical: All 246+ state properties mapped to React destinations**
- `UNIVERSAL_UI_IMPLEMENTATION_PLAN_v2.md` - Server-as-truth architecture
- `bullmq_architecture_doc.md` - Backend worker architecture
- `sql/add_result_approvals.sql` - Gap 2 database schema

---

*Created: 2026-02-01*
*Updated: 2026-02-01 - Added state ownership rules, server-as-truth pattern, risk-based milestones*
*Updated: 2026-02-01 - Re-run behavior decided (Option C: Cascade Invalidate), state migration spreadsheet created*
*Updated: 2026-02-02 - Addressed critic feedback: renamed to "Visual Replication", added Milestone 1.5 (Server Sync POC), documented WebSocket→Query integration, error handling strategy, migration/rollback plan, stepStates migration strategy*
*Replaces: REACT_FRONTEND_SPEC.md (deleted - was incorrect approach)*
