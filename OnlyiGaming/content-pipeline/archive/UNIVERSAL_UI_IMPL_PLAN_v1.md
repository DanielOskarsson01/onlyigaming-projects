# Universal UI Implementation Plan (React) v2

## Overview

Universal component architecture for the Content Pipeline React UI. Steps share **reusable primitives** - not just wrapper components.

**Stack**: React 18 + TypeScript + Zustand + TanStack Query + Tailwind CSS

**Key Insight**: The value isn't a "universal panel wrapper" - it's **shared input primitives** that eliminate copy-paste across steps.

---

## Part 1: Shared Primitives

### 1.1 Input Primitives (Extract from Step1Panel)

These components handle their own state and validation. Steps compose them.

#### CsvUploadInput

```typescript
// src/components/primitives/CsvUploadInput.tsx
interface CsvUploadInputProps {
  onEntitiesLoaded: (entities: CsvEntity[], fileName: string) => void;
  onClear: () => void;
  currentFileName: string | null;
  currentEntities: CsvEntity[];
  requiredColumns?: string[];  // ['name', 'website'] for Step 1, ['url'] for Step 2
}

// Handles:
// - Drag-drop zone
// - File input
// - CSV parsing (with BOM removal, header detection)
// - Validation (required columns present)
// - Preview display (first 3 entities)
// - Clear button

// ~120 lines extracted from Step1Panel lines 72-209
```

#### UrlTextarea

```typescript
// src/components/primitives/UrlTextarea.tsx
interface UrlTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  parseMode: 'urls-only' | 'name-url-pairs';
}

// parseMode formats:
// 'urls-only': One URL per line
//   Example:
//     https://betsson.com
//     https://evolution.com
//     example.com           <- auto-prefixes https://
//
// 'name-url-pairs': Tab-separated name and URL per line
//   Example:
//     Betsson	https://betsson.com
//     Evolution Gaming	https://evolution.com
//   Falls back to comma if no tab found:
//     Betsson, https://betsson.com

// Handles:
// - Textarea input
// - URL normalization (add https:// if missing)
// - Line-by-line parsing
// - Count display
// - Format validation per parseMode

// ~50 lines extracted from Step1Panel lines 225-250
```

#### ResultsList

```typescript
// src/components/primitives/ResultsList.tsx
interface ResultsListProps {
  results: Array<{ id: string; url: string; entity_name?: string; reason?: string }>;
  isLoading: boolean;
  emptyMessage?: string;
  showEntityName?: boolean;
  showReason?: boolean;  // For validation step - why URL was filtered
  maxHeight?: string;    // Default 'max-h-64'
  onDownloadCsv?: () => void;
}

// Handles:
// - Loading spinner
// - Empty state
// - Virtual scroll using @tanstack/react-virtual (REQUIRED for 1000+ items)
// - URL links (truncated, full on hover)
// - Download CSV button
// - Entity grouping (optional)

// IMPORTANT: Must use @tanstack/react-virtual, not naive slice()
// ~120 lines, NEW component (addresses B003 pagination)
```

#### SubmoduleOptions

```typescript
// src/components/primitives/SubmoduleOptions.tsx
interface OptionConfig {
  name: string;
  label: string;
  type: 'select' | 'checkbox' | 'number' | 'text';
  options?: { value: string; label: string }[];
  defaultValue: any;
}

interface SubmoduleOptionsProps {
  config: OptionConfig[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

// Handles:
// - Dynamic form generation from config
// - Type-safe value handling
// - Consistent styling

// ~60 lines, replaces hardcoded options in each step
```

### 1.2 Primitive Extraction Plan

| Primitive | Lines in Step1Panel | New Component | Savings per Step |
|-----------|---------------------|---------------|------------------|
| CsvUploadInput | 72-209 (137 lines) | 120 lines once | ~130 lines |
| UrlTextarea | 225-250, 406-446 | 40 lines once | ~60 lines |
| ResultsList | 486-525 | 100 lines once | ~40 lines |
| SubmoduleOptions | 456-476 | 60 lines once | ~20 lines |

**Total**: 320 lines of primitives, saves ~250 lines per step.
**Step 2-10 implementation**: ~150 lines each (composition + step-specific logic)

---

## Part 2: State Architecture

### 2.1 What Goes Where

| Data Type | Location | Reason |
|-----------|----------|--------|
| Server data (runs, results, projects) | TanStack Query cache | Server-as-truth |
| UI-only state (accordion open, panel visible) | Zustand | Ephemeral |
| Form input (CSV entities, URLs) | Zustand | Persists across panel opens within step |
| Submodule execution state | Zustand during run, then Query | Transitions to server after completion |

### 2.2 Store Definitions

#### panelStore (UI + Form State)

```typescript
interface PanelStore {
  // UI State (ephemeral)
  submodulePanelOpen: boolean;
  activeSubmoduleId: string | null;
  activeCategoryKey: string | null;
  activeStepIndex: number | null;  // NEW: which step's panel
  panelAccordion: 'input' | 'options' | 'results' | null;

  // Form State (persists within step, cleared on step change)
  csvEntities: CsvEntity[];
  csvFileName: string | null;
  inputUrls: string;
  optionValues: Record<string, any>;

  // Execution State (during run only)
  executionState: 'idle' | 'running' | 'completed' | 'error';
  executionError: string | null;

  // Actions
  openPanel(stepIndex: number, submoduleId: string, categoryKey: string): void;
  closePanel(): void;
  setPanelAccordion(accordion: PanelAccordion): void;
  setCsvData(entities: CsvEntity[], fileName: string): void;
  clearCsvData(): void;
  setInputUrls(urls: string): void;
  setOptionValue(name: string, value: any): void;
  setExecutionState(state: ExecutionState, error?: string): void;
  resetForNewStep(stepIndex: number): void;  // Clears form state when step changes
}
```

#### pipelineStore (Pipeline Context)

```typescript
interface PipelineStore {
  // Selection (drives Query keys)
  selectedProjectId: string | null;
  selectedRunId: string | null;

  // UI State
  expandedStep: number | null;

  // Actions
  setSelectedProject(id: string | null): void;
  setSelectedRun(id: string | null): void;
  toggleStep(step: number): void;
}
```

### 2.3 TanStack Query Keys

```typescript
// Query key factory
const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  runs: (projectId: string) => ['runs', { projectId }] as const,
  run: (runId: string) => ['runs', runId] as const,
  stepContext: (runId: string, stepIndex: number) =>
    ['step-context', { runId, stepIndex }] as const,
  submoduleRun: (submoduleRunId: string) =>
    ['submodule-runs', submoduleRunId] as const,
  submoduleResults: (submoduleRunId: string) =>
    ['submodule-results', submoduleRunId] as const,
};

// Invalidation rules
// After submodule approval:
queryClient.invalidateQueries({ queryKey: ['step-context', { runId, stepIndex }] });

// After step approval:
queryClient.invalidateQueries({ queryKey: ['step-context', { runId, stepIndex: stepIndex + 1 }] });
queryClient.invalidateQueries({ queryKey: ['runs', runId] });
```

---

## Part 3: API Contracts

**Note**: Endpoints match existing backend at `/content-pipeline/routes/`.

### 3.1 Execute Submodule

```typescript
// POST /api/submodules/:type/:name/execute
// Example: POST /api/submodules/discovery/sitemap/execute
// Example: POST /api/submodules/validation/path-filter/execute
interface ExecuteRequest {
  entities: CsvEntity[];           // [{ name: string, website: string }]
  project_id?: string;             // Optional - omit for preview mode
  options?: Record<string, any>;   // Submodule-specific options
}
// Note: 'type' and 'name' come from URL path, not body

interface ExecuteResponse {
  success: true;
  created_run_id: string;          // UUID
  submodule_run_id: string;        // UUID
  results: DiscoveredUrl[];        // Array of URLs found
  stats: {
    input_count: number;
    output_count: number;
    duration_ms: number;
  };
  preview_mode: boolean;           // true if no project_id
}

interface DiscoveredUrl {
  url: string;
  entity_name: string;
  entity_id: string;
  source_submodule: string;
  metadata: Record<string, any>;
}

// Errors
interface ExecuteError {
  success: false;
  error: {
    code: 'INVALID_ENTITIES' | 'SUBMODULE_NOT_FOUND' | 'EXECUTION_FAILED';
    message: string;
    details?: Record<string, any>;
  };
}
```

### 3.2 Approve Submodule Run

```typescript
// POST /api/submodules/runs/:runId/:submoduleRunId/approve
// Example: POST /api/submodules/runs/abc-123/def-456/approve
interface ApproveRequest {
  // No body needed - IDs come from URL path
}

interface ApproveResponse {
  success: true;
  approved_count: number;
  step_context_updated: boolean;   // true if results added to step context
}

// Errors
interface ApproveError {
  success: false;
  error: {
    code: 'RUN_NOT_FOUND' | 'ALREADY_APPROVED' | 'NO_RESULTS';
    message: string;
  };
}
```

### 3.3 Get Step Context (EXISTS)

```typescript
// GET /api/runs/:id/step-context?step_index=1
// Already implemented in routes/runs.js:335
interface StepContextResponse {
  success: true;
  step_index: number;
  has_data: boolean;
  entities?: CsvEntity[];          // If step has entity input
  urls?: string[];                 // If step has URL input (Step 2+)
  source: {
    type: 'upload' | 'previous_step' | 'submodule';
    submodule_id?: string;
    uploaded_at?: string;
  };
  stats: {
    total: number;
    by_entity?: Record<string, number>;
  };
}
```

### 3.4 Approve Step

```typescript
// POST /api/runs/:runId/steps/:stepIndex/approve
interface StepApproveRequest {
  // No body needed - approves all approved submodule results
}

interface StepApproveResponse {
  success: true;
  step_index: number;
  total_approved: number;
  next_step_unlocked: boolean;
}
```

---

## Part 4: Error Handling

### 4.1 Mutation Errors

```typescript
// In Step panel
const executeMutation = useExecuteSubmodule();

executeMutation.mutate(request, {
  onError: (error) => {
    setExecutionState('error', error.message);
    showToast(error.message, 'error');
    // Stay on input accordion - user can adjust and retry
  },
  onSuccess: (data) => {
    setExecutionState('completed');
    setPanelAccordion('results');
  },
});
```

### 4.2 Panel Close Without Approve

```typescript
// In SubmodulePanel
const handleClose = () => {
  if (executionState === 'completed' && !isApproved) {
    // Results exist but not approved - warn user
    const confirmed = window.confirm(
      'Results will be lost if you close without approving. Continue?'
    );
    if (!confirmed) return;
  }
  closePanel();
};
```

### 4.3 Large Result Sets (REQUIRED: @tanstack/react-virtual)

```typescript
// In ResultsList primitive - MUST use @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

function ResultsList({ results, isLoading, ... }: ResultsListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,  // Estimated row height
    overscan: 10,            // Render 10 extra items above/below viewport
  });

  return (
    <div ref={parentRef} className="h-64 overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ResultRow result={results[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// DO NOT use naive slice() - it causes jank with 10,000+ items
```

### 4.4 Network Failures

```typescript
// TanStack Query retry config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        // Global error handler
        console.error('Mutation failed:', error);
      },
    },
  },
});
```

---

## Part 5: Step 2 Full Specification

### 5.1 Overview

**Step 2: Validation** - Filter and deduplicate URLs from Step 1.

**Input**: URLs from Step 1 step_context (fetched from server)
**Output**: Validated, deduplicated URLs for Step 3

### 5.2 Categories and Submodules

```typescript
const STEP2_CATEGORIES: Categories = {
  filtering: {
    label: 'Filtering',
    icon: '🔍',
    description: 'Remove unwanted URLs',
    submodules: [
      {
        id: 'path-filter',
        name: 'Path Filter',
        description: 'Filter by URL path patterns',
        cost: 'cheap',
      },
      {
        id: 'content-type-filter',
        name: 'Content Type',
        description: 'Filter by file extension',
        cost: 'cheap',
      },
    ],
  },
  dedup: {
    label: 'Deduplication',
    icon: '🔄',
    description: 'Remove duplicate URLs',
    submodules: [
      {
        id: 'exact-dedup',
        name: 'Exact Match',
        description: 'Remove identical URLs',
        cost: 'cheap',
      },
      {
        id: 'fuzzy-dedup',
        name: 'Fuzzy Match',
        description: 'Remove near-duplicate URLs',
        cost: 'medium',
      },
    ],
  },
};
```

### 5.3 Filter Options Config

```typescript
// src/config/filterOptions.ts

// Path Filter options
export const PATH_FILTER_OPTIONS: OptionConfig[] = [
  {
    name: 'exclude_patterns',
    label: 'Exclude paths containing',
    type: 'text',
    defaultValue: '/login, /logout, /cart, /checkout, /api/, /cdn-cgi/',
    description: 'Comma-separated path patterns to exclude',
  },
  {
    name: 'include_only',
    label: 'Include only paths containing (optional)',
    type: 'text',
    defaultValue: '',
    description: 'If set, only URLs with these patterns are kept',
  },
  {
    name: 'max_depth',
    label: 'Max URL depth',
    type: 'number',
    defaultValue: 5,
    description: 'Maximum path segments (e.g., /a/b/c = 3)',
  },
];

// Content Type Filter options
export const CONTENT_TYPE_OPTIONS: OptionConfig[] = [
  {
    name: 'exclude_extensions',
    label: 'Exclude file extensions',
    type: 'text',
    defaultValue: '.pdf, .jpg, .png, .gif, .css, .js, .xml',
    description: 'Comma-separated extensions to filter out',
  },
  {
    name: 'html_only',
    label: 'HTML pages only',
    type: 'checkbox',
    defaultValue: false,
    description: 'Only keep URLs that return text/html',
  },
];

// Deduplication options
export const DEDUP_OPTIONS: OptionConfig[] = [
  {
    name: 'normalize_urls',
    label: 'Normalize URLs before comparison',
    type: 'checkbox',
    defaultValue: true,
    description: 'Remove trailing slashes, sort query params, lowercase',
  },
  {
    name: 'ignore_query_params',
    label: 'Ignore query parameters',
    type: 'checkbox',
    defaultValue: false,
    description: 'Treat ?foo=bar and ?foo=baz as same URL',
  },
  {
    name: 'ignore_fragments',
    label: 'Ignore fragments (#)',
    type: 'checkbox',
    defaultValue: true,
    description: 'Treat #section1 and #section2 as same URL',
  },
];
```

### 5.4 useStepContext Hook Implementation

```typescript
// src/hooks/useStepContext.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

interface StepContextResponse {
  success: boolean;
  step_index: number;
  has_data: boolean;
  entities?: Array<{ name: string; website: string }>;
  urls?: Array<{ url: string; entity_name: string }>;
  stats: {
    total: number;
    by_entity?: Record<string, number>;
  };
}

export function useStepContext(runId: string | null, stepIndex: number) {
  return useQuery({
    queryKey: ['step-context', { runId, stepIndex }],
    queryFn: async () => {
      if (!runId) return null;
      const response = await fetch(
        `/api/runs/${runId}/step-context?step_index=${stepIndex}`
      );
      if (!response.ok) throw new Error('Failed to fetch step context');
      return response.json() as Promise<StepContextResponse>;
    },
    enabled: !!runId,
    staleTime: 30_000,  // Cache for 30 seconds
  });
}
```

### 5.5 Step2Panel Specification

```typescript
// src/components/panels/Step2Panel.tsx (~150 lines)

function Step2Panel() {
  // 1. Fetch step context (input from Step 1)
  const { data: stepContext } = useStepContext(runId, 1);

  // 2. Local state for options
  const { optionValues, setOptionValue } = usePanelStore();

  // 3. Mutations
  const executeMutation = useExecuteValidation();
  const approveMutation = useApproveSubmoduleRun();

  // Configure accordions
  const accordions: AccordionConfig[] = [
    {
      id: 'input',
      title: 'Input URLs',
      subtitle: stepContext?.stats.total ? `${stepContext.stats.total} URLs from Step 1` : 'Loading...',
      variant: 'teal',
      content: (
        // READ-ONLY - shows URLs from Step 1, no upload
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            URLs discovered in Step 1 ({stepContext?.stats.total || 0} total)
          </p>
          {stepContext?.stats.by_entity && (
            <div className="text-xs">
              {Object.entries(stepContext.stats.by_entity).map(([entity, count]) => (
                <div key={entity}>{entity}: {count} URLs</div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'options',
      title: 'Filter Options',
      subtitle: 'Configure validation',
      variant: 'teal',
      content: (
        <SubmoduleOptions
          config={PATH_FILTER_OPTIONS}  // Imported from config
          values={optionValues}
          onChange={setOptionValue}
        />
      ),
    },
    {
      id: 'results',
      title: 'Results',
      subtitle: results ? `${results.valid} valid, ${results.filtered} filtered` : '',
      variant: 'pink',
      showWhen: 'running',
      content: (
        <ResultsList
          results={validationResults}
          isLoading={isRunning}
          showReason={true}  // Shows why URLs were filtered
          onDownloadCsv={handleDownload}
        />
      ),
    },
  ];

  return (
    <SubmodulePanel
      stepNumber={2}
      submoduleName={getActiveSubmoduleName()}
      accordions={accordions}
      onRunTask={handleRunTask}
      onApprove={handleApprove}
      isRunning={isRunning}
      isCompleted={isCompleted}
    />
  );
}
```

### 5.6 What's Reused vs New

| Component | Reused from Step 1 | New for Step 2 |
|-----------|-------------------|----------------|
| SubmodulePanel | Yes | - |
| ResultsList | Yes (primitive) | - |
| SubmoduleOptions | Yes (primitive) | - |
| CsvUploadInput | - | Not used (input is read-only) |
| useStepContext hook | - | New query hook |
| PATH_FILTER_OPTIONS | - | New config |
| validationStore | - | New store (optional) |

### 5.7 Step 2 Implementation Estimate

| File | Lines | Notes |
|------|-------|-------|
| Step2Validation.tsx | 80 | Main step component |
| Step2Panel.tsx | 150 | Panel with accordions |
| useStepContext.ts | 25 | Query hook |
| filterOptions.ts | 40 | Option configs |
| **Total** | ~295 lines | |

**Compared to Step 1**: Step1Panel is 542 lines. After extracting primitives, Step2Panel is 150 lines. **65% reduction** proves the pattern works.

---

## Part 6: Implementation Milestones

### Milestone 1: Extract Primitives (Current)

- [ ] Extract `CsvUploadInput` from Step1Panel
- [ ] Extract `UrlTextarea` from Step1Panel
- [ ] Create `ResultsList` with virtual scroll
- [ ] Create `SubmoduleOptions` dynamic form
- [ ] Refactor Step1Panel to use primitives
- [ ] Verify Step 1 still works

**Success**: Step1Panel reduced from 542 to ~200 lines.

### Milestone 2: Step 2 Implementation

- [ ] Create `validationStore` (or extend discoveryStore)
- [ ] Create `useStepContext` query hook
- [ ] Create `Step2Validation.tsx` component
- [ ] Create `Step2Panel.tsx` using primitives
- [ ] Add path-filter and exact-dedup submodule handlers
- [ ] Test end-to-end: Step 1 → approve → Step 2 loads URLs

**Success**: Step 2 functional, <300 lines total.

### Milestone 3: API Contract Alignment

- [ ] Verify `/api/submodules/:type/:name/execute` matches contract
- [x] `/api/runs/:id/step-context` endpoint (EXISTS - routes/runs.js:335)
- [ ] Verify `/api/runs/:id/steps/:stepIndex/approve` matches contract
- [ ] Add TypeScript types for all API responses (`src/types/api.ts`)
- [ ] Add TanStack Query hooks for all endpoints
- [ ] Add error responses matching contract format

**Success**: All API calls typed, errors handled.

### Milestone 4: Steps 3-10 Scaffold

- [ ] Create step component template
- [ ] Create panel template
- [ ] Implement Steps 3-10 with placeholder submodules
- [ ] Wire up step-to-step data flow

**Success**: Full pipeline navigable, each step shows correct input.

### Milestone 5: Polish

- [ ] Loading states in all accordions
- [ ] Error states with retry
- [ ] Panel close confirmation
- [ ] Download CSV from results
- [ ] Keyboard shortcuts (Enter to run, Escape to close)

**Success**: Production-ready UX.

---

## Part 7: File Structure

```
client/src/
├── components/
│   ├── primitives/           # NEW - shared input components
│   │   ├── CsvUploadInput.tsx
│   │   ├── UrlTextarea.tsx
│   │   ├── ResultsList.tsx
│   │   ├── SubmoduleOptions.tsx
│   │   └── index.ts
│   ├── shared/
│   │   ├── SubmodulePanel.tsx
│   │   ├── CategoryCardGrid.tsx
│   │   ├── StepSummary.tsx
│   │   └── StepApprovalFooter.tsx
│   ├── steps/
│   │   ├── Step0ProjectSetup.tsx
│   │   ├── Step1Discovery.tsx
│   │   ├── Step2Validation.tsx    # NEW
│   │   └── StepContainer.tsx
│   └── panels/
│       ├── Step1Panel.tsx         # REFACTOR - use primitives
│       └── Step2Panel.tsx         # NEW
├── stores/
│   ├── appStore.ts
│   ├── panelStore.ts              # REFACTOR - add step awareness
│   ├── pipelineStore.ts
│   └── discoveryStore.ts
├── hooks/
│   ├── useSubmodules.ts
│   ├── useStepContext.ts          # NEW
│   └── useProjects.ts
├── api/
│   └── client.ts
└── types/
    ├── step.ts
    └── api.ts                     # NEW - API request/response types
```

---

## Success Criteria (Updated)

- [ ] **Primitives exist**: CsvUploadInput, UrlTextarea, ResultsList, SubmoduleOptions
- [ ] **Step1Panel refactored**: Uses primitives, <250 lines
- [ ] **Step2Panel implemented**: Uses primitives, <200 lines
- [ ] **API contracts typed**: All endpoints have TypeScript interfaces
- [ ] **Error handling**: Mutation errors show toast, panel close confirms
- [ ] **Virtual scroll**: ResultsList handles 10,000+ URLs without freezing
- [ ] **Step context flows**: Step 2 loads URLs from Step 1 via server

---

*Last Updated: 2026-02-03*
*Revised after brutal-critic and CTO reviews*
*CTO Conditions: All 5 addressed*
*Architecture: React + Zustand + TanStack Query*
