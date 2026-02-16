# Gap Endpoints Specification

## Overview

Two critical backend gaps need to be addressed before the Universal UI can be implemented. This document specifies the exact endpoints, schemas, and behaviors required.

---

## Gap 1: Partial Approval Endpoint

### Current Limitation

The existing `POST /api/submodules/validation/runs/:runId/:submoduleRunId/apply` endpoint is all-or-nothing:
- Approves ALL results, or
- Accepts `selected_urls` array but doesn't track rejections

### New Endpoint

```
POST /api/submodules/runs/:runId/:submoduleRunId/batch-approval
```

### Request Body

```javascript
{
  "approvals": [
    { "result_id": "uuid-1", "action": "approve" },
    { "result_id": "uuid-2", "action": "approve" },
    { "result_id": "uuid-3", "action": "reject", "reason": "Duplicate content" },
    { "result_id": "uuid-4", "action": "reject", "reason": "Off-topic URL" }
  ],
  "trigger_chain": true  // Optional: auto-populate next submodule if chained
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `approvals` | array | Yes | Array of approval decisions |
| `approvals[].result_id` | string | Yes | ID from `submodule_result_approvals` table (see Gap 2) |
| `approvals[].action` | enum | Yes | `"approve"` or `"reject"` |
| `approvals[].reason` | string | No | Rejection reason (ignored if action=approve) |
| `trigger_chain` | boolean | No | If true and submodule is chained, auto-populate next submodule's input. Default: true |

### Response

```javascript
{
  "success": true,
  "submodule_run_id": "uuid-xxx",
  "summary": {
    "total": 10,
    "approved": 7,
    "rejected": 3
  },
  "submodule_status": "approved",  // or "partial" if some pending
  "chain_triggered": true,
  "next_submodule": {
    "id": "lang-dedup",
    "input_count": 7,
    "input_source": "dedupe"
  }
}
```

### Behavior

1. **Validate** all result_ids belong to the specified submodule_run
2. **Update** `submodule_result_approvals` table for each decision
3. **Calculate** approved vs rejected counts
4. **Update** `submodule_runs` record:
   - `approved_count` = count of approved
   - `rejected_count` = count of rejected (new column)
   - `status` = 'approved' if all decided, 'partial' if some still pending
   - `approved_at` = NOW() if fully approved
5. **If chained and trigger_chain=true**:
   - Find next submodule in chain
   - Populate its input with approved results
   - Return `next_submodule` info

### Chained Transfer Question

> Does approving trigger the chained transfer automatically, or is that a separate call?

**Answer: Configurable via `trigger_chain` parameter.**

- Default `trigger_chain: true` → Auto-populates next submodule's Data Input
- Set `trigger_chain: false` → Only stores approvals, user must manually trigger transfer
- Benefit: User can review approved set before it flows downstream

**Alternative approach (if preferred):**
Separate endpoint for chain trigger:
```
POST /api/submodules/runs/:runId/:submoduleRunId/transfer-to-next
```
This would copy approved results to next submodule's expected input location.

---

## Gap 2: Per-Result Approval Tracking

### New Table Schema

```sql
-- Per-result approval tracking for submodule outputs
CREATE TABLE submodule_result_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  submodule_run_id UUID NOT NULL REFERENCES submodule_runs(id) ON DELETE CASCADE,

  -- Result identification
  result_index INTEGER NOT NULL,           -- Position in submodule_runs.results array
  result_url TEXT,                         -- Denormalized for quick display (nullable for non-URL results)
  result_entity_id UUID,                   -- Entity this result belongs to
  result_entity_name TEXT,                 -- Denormalized entity name

  -- Approval state
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,                   -- Only populated if status='rejected'

  -- Audit
  decided_at TIMESTAMPTZ,                  -- When approval/rejection was made
  decided_by TEXT,                         -- User/system that made decision (future: user_id)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(submodule_run_id, result_index)   -- One approval record per result
);

-- Index for common queries
CREATE INDEX idx_sra_submodule_run ON submodule_result_approvals(submodule_run_id);
CREATE INDEX idx_sra_status ON submodule_result_approvals(status);
CREATE INDEX idx_sra_entity ON submodule_result_approvals(result_entity_id);
```

### Relationship to submodule_runs

```
submodule_runs (1) ──────< (N) submodule_result_approvals

submodule_runs:
├── id (PK)
├── results (JSONB array) ──── results[i] maps to ──── submodule_result_approvals.result_index = i
├── approved_count (derived from count where status='approved')
├── rejected_count (NEW - derived from count where status='rejected')
└── status ('completed' → 'approved'/'partial'/'rejected')

submodule_result_approvals:
├── id (PK)
├── submodule_run_id (FK → submodule_runs.id)
├── result_index (position in results array)
├── status ('pending'/'approved'/'rejected')
└── rejection_reason
```

### Population Strategy

When `POST /api/submodules/:type/:name/execute` completes:

1. Save results to `submodule_runs.results` (existing behavior)
2. **NEW**: Create one `submodule_result_approvals` record per result:

```javascript
// In submodules.js after execute completes
const approvalRecords = results.map((result, index) => ({
  submodule_run_id: submoduleRunId,
  result_index: index,
  result_url: result.url || null,
  result_entity_id: result.entity_id || result.run_entity_id || null,
  result_entity_name: result.entity_name || null,
  status: 'pending'
}));

await db.from('submodule_result_approvals').insert(approvalRecords);
```

### Endpoints for Per-Result Status

#### Get Results with Approval Status

```
GET /api/submodules/runs/:runId/:submoduleRunId/results
```

**Response:**
```javascript
{
  "submodule_run_id": "uuid-xxx",
  "submodule_name": "dedupe",
  "total_results": 100,
  "results": [
    {
      "approval_id": "uuid-1",
      "result_index": 0,
      "url": "https://example.com/page1",
      "entity_name": "Company A",
      "status": "pending",
      "rejection_reason": null,
      // ... other result fields from submodule_runs.results[0]
    },
    {
      "approval_id": "uuid-2",
      "result_index": 1,
      "url": "https://example.com/page2",
      "entity_name": "Company A",
      "status": "approved",
      "rejection_reason": null
    },
    {
      "approval_id": "uuid-3",
      "result_index": 2,
      "url": "https://example.com/page3",
      "entity_name": "Company B",
      "status": "rejected",
      "rejection_reason": "Duplicate of page1"
    }
  ],
  "summary": {
    "pending": 50,
    "approved": 45,
    "rejected": 5
  }
}
```

#### Update Single Result Status

```
PATCH /api/submodules/runs/:runId/:submoduleRunId/results/:approvalId
```

**Request:**
```javascript
{
  "action": "approve"  // or "reject"
  "reason": "Optional rejection reason"
}
```

**Response:**
```javascript
{
  "success": true,
  "approval_id": "uuid-xxx",
  "status": "approved",
  "submodule_summary": {
    "pending": 49,
    "approved": 46,
    "rejected": 5
  }
}
```

---

## Existing Endpoints (For Reference)

### Polling Endpoint for Submodule Status

**Current endpoint:**
```
GET /api/submodules/runs/:runId/:submoduleRunId
```

**Response (existing):**
```javascript
{
  "id": "uuid-xxx",
  "run_id": "uuid-yyy",
  "submodule_type": "validation",
  "submodule_name": "dedupe",
  "status": "completed",  // pending | running | completed | failed | approved | rejected
  "result_count": 100,
  "results": [...],       // Full results array (can be large)
  "logs": [...],
  "error": null,
  "duration_ms": 1234,
  "approved_at": null,
  "approved_count": null,
  "created_at": "2026-01-31T..."
}
```

**Recommended enhancement:**
Add `?include_approvals=true` query param to include per-result approval status without fetching full results:

```
GET /api/submodules/runs/:runId/:submoduleRunId?include_approvals=true
```

Returns additional field:
```javascript
{
  // ... existing fields ...
  "approval_summary": {
    "pending": 50,
    "approved": 45,
    "rejected": 5
  }
}
```

### List All Submodule Runs for a Run

```
GET /api/submodules/runs/:runId
```

**Response (existing):**
```javascript
[
  {
    "id": "uuid-1",
    "submodule_name": "sitemap",
    "status": "approved",
    "result_count": 500,
    "approved_count": 480,
    "duration_ms": 5000
  },
  {
    "id": "uuid-2",
    "submodule_name": "dedupe",
    "status": "completed",
    "result_count": 480,
    "approved_count": null,
    "duration_ms": 200
  }
]
```

---

## WebSocket Status

### Current Implementation

From the audit, WebSocket IS implemented:

```javascript
// server.js lines 80-91
subscriber.subscribe('pipeline-events');
subscriber.on('message', (channel, message) => {
  broadcast(JSON.parse(message));
});
```

**Events currently published:**
- `stage_update` - Pipeline stage status changes
- `stage_progress` - Progress during stage execution
- `entity_complete` - Entity finished processing

### Gap: No Submodule Events

**Current state:** Submodule execution does NOT publish WebSocket events.

**Recommendation:** Add events for submodule operations:

```javascript
// Publish when submodule run starts
await publishEvent('submodule_start', {
  run_id: runId,
  submodule_run_id: submoduleRunId,
  submodule_name: name,
  submodule_type: type
});

// Publish when submodule run completes
await publishEvent('submodule_complete', {
  run_id: runId,
  submodule_run_id: submoduleRunId,
  status: 'completed',
  result_count: results.length
});

// Publish when approval decision made
await publishEvent('submodule_approval', {
  run_id: runId,
  submodule_run_id: submoduleRunId,
  approved_count: N,
  rejected_count: M,
  status: newStatus
});
```

### Polling vs WebSocket

| Use Case | Recommended Approach |
|----------|---------------------|
| Initial page load | Poll `GET /api/submodules/runs/:runId` |
| Real-time updates | Subscribe to WebSocket `submodule_*` events |
| Reconnection | Poll to catch up, then resume WebSocket |

**For MVP:** Polling every 2-3 seconds is acceptable. WebSocket events are nice-to-have for instant feedback.

---

## Schema Changes Summary

### New Table

```sql
CREATE TABLE submodule_result_approvals (...);  -- See Gap 2 above
```

### Altered Table

```sql
ALTER TABLE submodule_runs ADD COLUMN IF NOT EXISTS rejected_count INTEGER DEFAULT 0;
```

---

## Re-Run Behavior

When a user clicks "Run Task" on a submodule that already has approval decisions:

### UI Behavior (Soft Confirmation)

1. **Check for existing approvals** before executing
2. **If approvals exist**: Show confirmation dialog:
   > "This will reset X approved and Y rejected decisions. Continue?"
3. **If Yes**: Proceed with re-run (backend handles cleanup)
4. **If No**: Cancel, keep existing approvals

### API Change

```
POST /api/submodules/:type/:name/execute
```

**New optional parameter:**
```javascript
{
  "run_id": "uuid-xxx",
  "config": { ... },
  "force_rerun": true  // Required if existing approvals exist
}
```

**Backend behavior:**
- If `force_rerun: false` (or omitted) and approvals exist → Return error:
  ```javascript
  {
    "error": "APPROVALS_EXIST",
    "message": "Submodule has existing approval decisions",
    "existing_approvals": { "approved": 45, "rejected": 5, "pending": 50 }
  }
  ```
- If `force_rerun: true` → Delete old `submodule_result_approvals` records, then execute fresh

### Implementation Notes

```javascript
// In execute endpoint, before running:
const existingApprovals = await db
  .from('submodule_result_approvals')
  .select('status')
  .eq('submodule_run_id', existingSubmoduleRunId);

if (existingApprovals.length > 0 && !req.body.force_rerun) {
  const summary = countByStatus(existingApprovals);
  return res.status(409).json({
    error: 'APPROVALS_EXIST',
    message: 'Submodule has existing approval decisions',
    existing_approvals: summary
  });
}

// If force_rerun, clean up first
if (req.body.force_rerun) {
  await db
    .from('submodule_result_approvals')
    .delete()
    .eq('submodule_run_id', existingSubmoduleRunId);
}

// Then proceed with normal execution...
```

---

## Implementation Order

1. **Create `submodule_result_approvals` table** (SQL migration)
2. **Modify submodule execute** to populate approval records on completion
3. **Create `GET .../results` endpoint** to fetch results with approval status
4. **Create `PATCH .../results/:id` endpoint** for single result updates
5. **Create `POST .../batch-approval` endpoint** for bulk approval
6. **Add WebSocket events** (optional, can do in Phase 2)

**Estimated total: 10-14 hours**
