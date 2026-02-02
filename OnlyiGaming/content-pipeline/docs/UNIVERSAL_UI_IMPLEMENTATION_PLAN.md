# Universal UI Implementation Plan

## Overview

Refactor the Content Pipeline UI to use a universal component architecture based on the UI Specification v2. This will fix current state persistence bugs and make future steps trivial to implement.

---

## Phase 1: State Architecture

### 1.1 Central State Store

Replace scattered Alpine.js variables with a centralized store:

```javascript
Alpine.store('pipeline', {
  // Current run context
  currentRunId: null,
  currentProjectId: null,

  // Steps - loaded from DB on init
  steps: {
    1: { status: 'active', approvedAt: null },
    2: { status: 'locked', approvedAt: null },
    3: { status: 'locked', approvedAt: null }
  },

  // Submodules by step - loaded from DB
  submodules: {
    // step_id -> category -> submodule[]
  },

  // Active pane state
  activePane: null, // { stepId, categoryKey, submoduleIndex }
  paneState: 'idle', // idle | running | completed | error
  paneResults: null,

  // Methods
  async loadFromDB(runId) { ... },
  async saveSubmoduleState(submoduleId, state) { ... },
  async approveSubmodule(submoduleId, results) { ... },
  async approveStep(stepId) { ... }
});
```

### 1.2 State Persistence Rules

| Action | Persistence | Behavior |
|--------|-------------|----------|
| Run submodule | Write to `submodule_runs` | Create run record before execution |
| Complete submodule | Update `submodule_runs` | Store results, set status='completed' |
| Approve submodule | Update `submodule_runs` | Set status='approved', approved_at |
| Approve step | Update `pipeline_runs` | Set step_X_approved_at |
| Re-run approved | Invalidate downstream | Mark following steps as 'needs_rerun' |

### 1.3 Cascade Invalidation

When a step is modified after approval:

```javascript
async invalidateDownstream(stepId) {
  // Mark all following steps as invalid
  for (let i = stepId + 1; i <= MAX_STEPS; i++) {
    this.steps[i].status = 'needs_rerun';
    this.steps[i].approvedAt = null;

    // Update DB
    await db.from('pipeline_runs')
      .update({ [`step_${i}_status`]: 'needs_rerun' })
      .eq('id', this.currentRunId);
  }
}
```

---

## Phase 2: Universal Components

### 2.1 Step Component

Single template for all steps:

```html
<template x-for="(step, stepId) in $store.pipeline.steps">
  <div x-data="stepComponent(stepId)" class="step-container">
    <!-- Step Header -->
    <div class="step-header" :class="stepClasses">
      <span x-text="`Step ${stepId}`"></span>
      <span x-text="step.title"></span>
      <span x-show="step.status === 'completed'" class="text-green-500">✓</span>
    </div>

    <!-- Submodule Cards -->
    <template x-if="step.status !== 'locked'">
      <div class="submodule-cards">
        <!-- Cards rendered here -->
      </div>
    </template>

    <!-- Step Summary -->
    <div class="step-summary" x-show="hasCompletedSubmodules">
      <div>Total Input: <span x-text="summary.totalInput"></span></div>
      <div>Valid: <span x-text="summary.valid"></span></div>
      <div>Filtered: <span x-text="summary.filtered"></span></div>
    </div>

    <!-- Step CTAs -->
    <div class="step-ctas">
      <button @click="skipStep" :disabled="!canSkip">Skip Step</button>
      <button @click="approveStep" :disabled="!canApprove" class="btn-approve">
        Approve Step
      </button>
    </div>
  </div>
</template>
```

### 2.2 Submodule Card Component

Single template for all cards (chained or standalone):

```html
<template x-for="(card, idx) in category.cards">
  <div x-data="cardComponent(stepId, categoryKey, idx)"
       @click="openPane"
       class="submodule-card"
       :class="cardClasses">

    <!-- Card Icon & Status -->
    <span x-show="card.status === 'approved'" class="text-green-500">✓</span>
    <span x-show="card.status === 'running'" class="animate-spin">⟳</span>

    <!-- Card Title -->
    <div x-text="card.name"></div>

    <!-- Mini Summary (when approved) -->
    <div x-show="card.status === 'approved'" class="text-sm text-gray-500">
      <span x-text="`${card.validCount} valid`"></span>
      <span>·</span>
      <span x-text="`${card.filteredCount} filtered`"></span>
    </div>
  </div>
</template>
```

### 2.3 Universal Pane Component

Single pane template for ALL submodules:

```html
<div x-show="$store.pipeline.activePane"
     x-data="paneComponent()"
     class="pane-overlay">

  <div class="pane-container">
    <!-- Pane Header -->
    <div class="pane-header">
      <h2 x-text="submodule.name"></h2>
      <button @click="closePane">×</button>
    </div>

    <!-- Accordion 1: Data Input -->
    <div x-data="{ open: true }" class="accordion">
      <button @click="open = !open" class="accordion-header">
        <span>▼</span> Data Input
      </button>
      <div x-show="open" class="accordion-content">
        <!-- Primary Data -->
        <div class="data-summary">
          <span x-text="`${inputData.count} ${inputData.type} from ${inputData.source}`"></span>
          <button @click="viewList">View List</button>
          <button @click="uploadCSV">Upload Own CSV</button>
        </div>

        <!-- Supporting Content (module-specific) -->
        <template x-if="submodule.hasPrompt">
          <div class="supporting-content">
            <span>✓ Prompt: <span x-text="submodule.promptName"></span></span>
          </div>
        </template>
      </div>
    </div>

    <!-- Accordion 2: Advanced Options -->
    <div x-data="{ open: false }" class="accordion">
      <button @click="open = !open" class="accordion-header">
        <span>▶</span> Advanced Options
      </button>
      <div x-show="open" class="accordion-content">
        <!-- Module-specific options rendered dynamically -->
        <template x-for="option in submodule.options">
          <div class="option-row">
            <label x-text="option.label"></label>
            <input :type="option.type" x-model="config[option.name]">
          </div>
        </template>
      </div>
    </div>

    <!-- Accordion 3: Results -->
    <div x-data="{ open: false }" x-ref="resultsAccordion" class="accordion">
      <button @click="open = !open" class="accordion-header">
        <span x-text="open ? '▼' : '▶'"></span> Results
      </button>
      <div x-show="open" class="accordion-content">
        <!-- Summary -->
        <div class="results-summary">
          <div>Items In: <span x-text="results.inputCount"></span></div>
          <div>Valid: <span x-text="results.validCount"></span></div>
          <div>Filtered: <span x-text="results.filteredCount"></span></div>
          <div>Time: <span x-text="results.duration"></span></div>
        </div>

        <!-- Details Table -->
        <div class="results-table">
          <!-- Scrollable results list -->
        </div>

        <!-- Download Buttons -->
        <div class="download-buttons">
          <button @click="downloadCSV('valid')">Download Valid CSV</button>
          <button @click="downloadCSV('filtered')">Download Filtered CSV</button>
        </div>
      </div>
    </div>

    <!-- CTAs -->
    <div class="pane-ctas">
      <button @click="runTask"
              :disabled="!hasInput || paneState === 'running'"
              :class="runButtonClasses">
        <span x-show="paneState === 'running'" class="animate-spin">⟳</span>
        Run Task
      </button>

      <button @click="$refs.resultsAccordion.open = true"
              :disabled="!hasResults"
              :class="seeResultsClasses">
        See Results
      </button>

      <button @click="approve"
              :disabled="!hasResults"
              :class="approveClasses">
        Approve
      </button>
    </div>
  </div>
</div>
```

---

## Phase 3: Data Flow

### 3.1 Chained Submodule Data Transfer

```javascript
async approve() {
  const { stepId, categoryKey, submoduleIndex } = this.activePane;
  const submodule = this.getSubmodule(stepId, categoryKey, submoduleIndex);

  // 1. Save to DB
  await this.saveApproval(submodule.id, this.results);

  // 2. Update local state
  submodule.status = 'approved';
  submodule.validCount = this.results.validCount;
  submodule.filteredCount = this.results.filteredCount;

  // 3. If chained, transfer to next submodule
  const nextSubmodule = this.getNextInChain(stepId, categoryKey, submoduleIndex);
  if (nextSubmodule) {
    nextSubmodule.inputData = this.results.valid;
    nextSubmodule.inputSource = submodule.name;
  }

  // 4. Close pane
  this.closePane();
}
```

### 3.2 Step-to-Step Data Transfer

```javascript
async approveStep(stepId) {
  // 1. Gather all approved results from this step
  const stepResults = this.gatherStepResults(stepId);

  // 2. Save step approval to DB
  await db.from('pipeline_runs')
    .update({
      [`step_${stepId}_status`]: 'approved',
      [`step_${stepId}_approved_at`]: new Date().toISOString(),
      [`step_${stepId}_results`]: stepResults
    })
    .eq('id', this.currentRunId);

  // 3. Unlock next step
  const nextStepId = stepId + 1;
  if (this.steps[nextStepId]) {
    this.steps[nextStepId].status = 'active';
    this.steps[nextStepId].inputData = stepResults;
  }

  // 4. Update local state
  this.steps[stepId].status = 'completed';
}
```

### 3.3 Skip Step Behavior

```javascript
async skipStep(stepId) {
  // Get data from last approved step
  let inputData = null;
  for (let i = stepId - 1; i >= 1; i--) {
    if (this.steps[i].status === 'completed') {
      inputData = this.steps[i].results;
      break;
    }
  }

  // Mark step as skipped
  this.steps[stepId].status = 'skipped';

  // Unlock next step with inherited data
  const nextStepId = stepId + 1;
  if (this.steps[nextStepId]) {
    this.steps[nextStepId].status = 'active';
    this.steps[nextStepId].inputData = inputData;
  }
}
```

---

## Phase 4: Implementation Order

### Week 1: Foundation

| Task | Description | Files |
|------|-------------|-------|
| 4.1 | Create Alpine store | `public/js/store.js` |
| 4.2 | Create DB sync methods | `routes/pipeline-state.js` |
| 4.3 | Add state columns to DB | `sql/add_pipeline_state.sql` |

### Week 2: Components

| Task | Description | Files |
|------|-------------|-------|
| 4.4 | Create Step component | `public/components/step.html` |
| 4.5 | Create Card component | `public/components/card.html` |
| 4.6 | Create Pane component | `public/components/pane.html` |

### Week 3: Integration

| Task | Description | Files |
|------|-------------|-------|
| 4.7 | Migrate Step 1 to new components | `public/index.html` |
| 4.8 | Migrate Step 2 to new components | `public/index.html` |
| 4.9 | Test data flow end-to-end | Manual testing |

### Week 4: Polish

| Task | Description | Files |
|------|-------------|-------|
| 4.10 | Add error handling | All components |
| 4.11 | Add loading states | All components |
| 4.12 | Remove old code | `public/index.html` |

---

## Phase 5: Database Schema Additions

```sql
-- Add pipeline state tracking
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS step_1_status TEXT DEFAULT 'active';
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS step_1_approved_at TIMESTAMPTZ;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS step_1_results JSONB;

ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS step_2_status TEXT DEFAULT 'locked';
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS step_2_approved_at TIMESTAMPTZ;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS step_2_results JSONB;

ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS step_3_status TEXT DEFAULT 'locked';
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS step_3_approved_at TIMESTAMPTZ;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS step_3_results JSONB;

-- Add submodule state tracking
ALTER TABLE submodule_runs ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE submodule_runs ADD COLUMN IF NOT EXISTS input_source TEXT;
ALTER TABLE submodule_runs ADD COLUMN IF NOT EXISTS input_count INTEGER;
ALTER TABLE submodule_runs ADD COLUMN IF NOT EXISTS valid_count INTEGER;
ALTER TABLE submodule_runs ADD COLUMN IF NOT EXISTS filtered_count INTEGER;
```

---

## Backlog (Future Enhancements)

| Item | Description |
|------|-------------|
| B001 | Progress indicator for long tasks (>30s) |
| B002 | Cancel running task |
| B003 | Pagination for large result sets (50k+ URLs) |
| B004 | Search/filter within results |
| B005 | Loading states while fetching data |
| B006 | Keyboard shortcuts |

---

## Success Criteria

- [ ] All state persists across page refresh
- [ ] Approving a submodule updates card immediately
- [ ] Re-running an approved step invalidates downstream
- [ ] Data flows automatically between chained submodules
- [ ] Same component code works for Step 1, 2, and future steps
- [ ] No more "null reference" bugs
