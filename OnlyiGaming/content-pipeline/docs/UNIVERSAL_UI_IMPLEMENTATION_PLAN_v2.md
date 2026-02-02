# Universal UI Implementation Plan v2

## Overview

**Server-as-truth architecture.** The UI is a thin rendering layer. All state lives in the database. Alpine.js renders what the API returns.

**Key principle:** No client-side state management. No `Alpine.store()` tracking parallel state. The server is the single source of truth.

---

## Architecture: Server-as-Truth

### Data Flow

```
┌─────────────┐     GET /api/...      ┌─────────────┐
│   Alpine    │ ──────────────────▶   │   Express   │
│   (render)  │                       │   (API)     │
│             │ ◀──────────────────   │             │
└─────────────┘     JSON response     └──────┬──────┘
       │                                     │
       │ User clicks                         │ Read/Write
       │ "Approve"                           │
       ▼                                     ▼
┌─────────────┐     POST /api/...     ┌─────────────┐
│   Alpine    │ ──────────────────▶   │  Supabase   │
│  (action)   │                       │  (truth)    │
│             │ ◀──────────────────   │             │
└─────────────┘     JSON response     └─────────────┘
       │
       │ Re-fetch
       ▼
    Render updated state
```

### What Lives Where

| Location | Responsibility |
|----------|----------------|
| **Supabase** | All state: runs, entities, submodule results, approvals |
| **Express API** | Business logic, validation, state transitions |
| **Alpine.js** | Fetch → Render → Handle user actions → Fetch again |

### What Alpine Does NOT Do

- ❌ Track approval state in memory
- ❌ Cascade invalidation logic
- ❌ Sync state between components
- ❌ Persist anything to localStorage

---

## Existing Backend Endpoints (Already Built)

### Submodule Execution
```
POST /api/submodules/:type/:name/execute
→ Creates submodule_run record
→ Creates submodule_result_approvals records (one per result)
→ Returns { submodule_run_id, results, ... }
```

### Results with Approval Status (Gap 2 - COMPLETE)
```
GET /api/submodules/runs/:runId/:submoduleRunId/results
→ Returns results merged with approval status
→ { results: [{approval_id, url, status: 'pending'|'approved'|'rejected', ...}], summary: {pending, approved, rejected} }
```

### Single Result Approval (Gap 2 - COMPLETE)
```
PATCH /api/submodules/runs/:runId/:submoduleRunId/results/:approvalId
→ Body: { action: 'approve'|'reject', reason?: string }
→ Updates submodule_result_approvals record
→ Returns { success, status, submodule_summary }
```

### Batch Approval (Gap 2 - COMPLETE)
```
POST /api/submodules/runs/:runId/:submoduleRunId/batch-approval
→ Body: { approvals: [{result_id, action, reason?}], trigger_chain?: boolean }
→ Updates multiple approval records
→ Returns { success, summary, submodule_status }
```

### List Submodule Runs
```
GET /api/submodules/runs/:runId
→ Returns all submodule runs for a pipeline run
→ [{ id, submodule_name, status, result_count, approved_count, ... }]
```

---

## UI Components (Server-Driven)

### Pattern: Fetch-Render-Action

Every component follows this pattern:

```javascript
// Component initialization
async init() {
  this.loading = true;
  this.data = await fetch(`/api/...`).then(r => r.json());
  this.loading = false;
}

// User action
async handleAction() {
  await fetch(`/api/...`, { method: 'POST', body: JSON.stringify({...}) });
  await this.init(); // Re-fetch to get updated state
}
```

### Results Table Component

```html
<div x-data="resultsTable()" x-init="init()">
  <!-- Loading state -->
  <div x-show="loading">Loading...</div>

  <!-- Summary bar -->
  <div x-show="!loading" class="summary-bar">
    <span>Pending: <span x-text="data.summary?.pending || 0"></span></span>
    <span>Approved: <span x-text="data.summary?.approved || 0"></span></span>
    <span>Rejected: <span x-text="data.summary?.rejected || 0"></span></span>
  </div>

  <!-- Results list -->
  <template x-for="result in data.results || []" :key="result.approval_id">
    <div class="result-row" :class="{'bg-green-50': result.status === 'approved', 'bg-red-50': result.status === 'rejected'}">
      <span x-text="result.url" class="truncate"></span>
      <span x-text="result.entity_name"></span>
      <span x-text="result.status"></span>

      <!-- Action buttons (only for pending) -->
      <template x-if="result.status === 'pending'">
        <div class="actions">
          <button @click="approve(result.approval_id)" class="btn-approve">✓</button>
          <button @click="reject(result.approval_id)" class="btn-reject">✗</button>
        </div>
      </template>
    </div>
  </template>

  <!-- Bulk actions -->
  <div class="bulk-actions">
    <button @click="approveAll()">Approve All Pending</button>
    <button @click="rejectAll()">Reject All Pending</button>
  </div>
</div>

<script>
function resultsTable() {
  return {
    runId: null,        // Set from URL or parent
    submoduleRunId: null,
    loading: true,
    data: { results: [], summary: {} },

    async init() {
      this.loading = true;
      const url = `/api/submodules/runs/${this.runId}/${this.submoduleRunId}/results`;
      this.data = await fetch(url).then(r => r.json());
      this.loading = false;
    },

    async approve(approvalId) {
      await fetch(`/api/submodules/runs/${this.runId}/${this.submoduleRunId}/results/${approvalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      await this.init(); // Re-fetch
    },

    async reject(approvalId) {
      const reason = prompt('Rejection reason (optional):');
      await fetch(`/api/submodules/runs/${this.runId}/${this.submoduleRunId}/results/${approvalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason })
      });
      await this.init(); // Re-fetch
    },

    async approveAll() {
      const pending = this.data.results.filter(r => r.status === 'pending');
      const approvals = pending.map(r => ({ result_id: r.approval_id, action: 'approve' }));

      await fetch(`/api/submodules/runs/${this.runId}/${this.submoduleRunId}/batch-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvals })
      });
      await this.init(); // Re-fetch
    },

    async rejectAll() {
      const pending = this.data.results.filter(r => r.status === 'pending');
      const approvals = pending.map(r => ({ result_id: r.approval_id, action: 'reject' }));

      await fetch(`/api/submodules/runs/${this.runId}/${this.submoduleRunId}/batch-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvals })
      });
      await this.init(); // Re-fetch
    }
  };
}
</script>
```

### Submodule Card Component

```html
<div x-data="submoduleCard()" x-init="init()" class="card">
  <div class="card-header">
    <span x-text="submodule.name"></span>
    <span x-show="data.status === 'approved'" class="badge-green">✓</span>
    <span x-show="data.status === 'running'" class="badge-blue animate-pulse">Running...</span>
  </div>

  <div class="card-body">
    <span x-text="`${data.result_count || 0} results`"></span>
    <span x-show="data.approved_count" x-text="`(${data.approved_count} approved)`"></span>
  </div>

  <button @click="openPane()">View Details</button>
</div>

<script>
function submoduleCard() {
  return {
    runId: null,
    submoduleRunId: null,
    submodule: {},  // Static definition (name, type, etc.)
    data: {},       // Dynamic state from server

    async init() {
      if (this.submoduleRunId) {
        const url = `/api/submodules/runs/${this.runId}/${this.submoduleRunId}`;
        this.data = await fetch(url).then(r => r.json());
      }
    },

    openPane() {
      // Emit event or set global pane state
      window.dispatchEvent(new CustomEvent('open-pane', {
        detail: { runId: this.runId, submoduleRunId: this.submoduleRunId }
      }));
    }
  };
}
</script>
```

---

## Implementation Phases

### Phase 1: Results Table with Per-Result Approval (Priority)

**Goal:** Add approve/reject buttons to each result row in the existing UI.

**Changes:**
1. Modify pane to fetch from `GET .../results` instead of using in-memory data
2. Add approve/reject buttons per row
3. Add bulk approve/reject buttons
4. Show summary (pending/approved/rejected counts)

**Files:**
- `public/index.html` - Update results rendering in pane

**Estimated:** 2-3 hours

### Phase 2: Submodule Status Polling

**Goal:** Cards show live status from server.

**Changes:**
1. Cards fetch their state from `GET /api/submodules/runs/:runId`
2. Periodic polling (every 5s) or WebSocket for live updates
3. Card badges update automatically when status changes

**Files:**
- `public/index.html` - Update card rendering

**Estimated:** 2-3 hours

### Phase 3: Step Status from Server

**Goal:** Step containers fetch their state from server.

**Changes:**
1. New endpoint: `GET /api/runs/:runId/status` returns step completion status
2. Steps render locked/active/complete based on server response
3. "Approve Step" calls server, re-fetches to update UI

**Files:**
- `routes/runs.js` - Add status endpoint
- `public/index.html` - Update step rendering

**Estimated:** 3-4 hours

---

## What We're NOT Building

Based on brutal critic feedback, these are explicitly out of scope:

1. ❌ `Alpine.store()` for global state
2. ❌ Client-side cascade invalidation
3. ❌ Local storage persistence
4. ❌ Optimistic UI updates (wait for server response)
5. ❌ Complex component communication (use events sparingly)

---

## WebSocket Enhancement (Optional)

The backend already publishes events:
- `submodule_start`
- `submodule_complete`
- `submodule_approval`

The UI can subscribe for instant updates instead of polling:

```javascript
const ws = new WebSocket(`ws://${location.host}`);
ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);

  if (type === 'submodule_complete' && data.run_id === currentRunId) {
    // Trigger re-fetch of affected components
    document.querySelectorAll(`[data-submodule-run="${data.submodule_run_id}"]`)
      .forEach(el => el.dispatchEvent(new Event('refresh')));
  }
};
```

**Status:** Nice-to-have. Polling works fine for MVP.

---

## Migration from Current UI

The current UI has some client-side state. Migration steps:

1. **Identify client state** - Find all `x-data` that stores results/approvals
2. **Add API calls** - Replace in-memory data with fetch calls
3. **Remove stale code** - Delete client-side state management
4. **Test** - Verify refresh doesn't lose state

---

## Success Criteria

- [ ] Refresh page → state persists (from server)
- [ ] Approve result → card updates after re-fetch
- [ ] Multiple browser tabs → all see same state
- [ ] No "undefined" or "null reference" errors
- [ ] Results table shows per-result approve/reject buttons
- [ ] Summary shows pending/approved/rejected counts

---

## Comparison: Old Plan vs New Plan

| Aspect | Old Plan | New Plan (v2) |
|--------|----------|---------------|
| State location | `Alpine.store()` + Supabase | Supabase only |
| State sync | Manual cascade logic | Re-fetch from server |
| Complexity | High (client mirrors server) | Low (server is truth) |
| Offline support | Partial (cached state) | None (always online) |
| Code size | Large (state management) | Small (fetch + render) |
| Bug surface | Large (sync issues) | Small (server bugs only) |

---

*Document created: 2026-02-01*
*Replaces: UNIVERSAL_UI_IMPLEMENTATION_PLAN.md (v1)*
*Based on: Brutal critic feedback, Gap 2 backend completion*
