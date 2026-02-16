# Content Pipeline — Backlog

**Single source of truth for known issues and deferred work.**

---

## Known Issues

| ID | Issue | Status | Target |
|----|-------|--------|--------|
| K001 | ContentRenderer `isDuplicate` hardcoded check | Deferred | Phase 10 (schema-driven row_highlight) |
| K002 | rss-feeds, url-filter have no execute.js | Placeholder only | Phase 9+ |
| K003 | No transaction/locking on step approval route (runs.js:146-185). 3 sequential DB writes without atomicity. Extends to concurrent case. | ✅ Fixed (Phase 8b) | Phase 8b |
| K004 | No pagination for large result sets | Known | Phase 10 |

## Code Review Findings (Gemini, Feb 15 2026)

### CRITICAL — Fix in Phase 8b (pre-Phase 9 gate)

| ID | Issue | File | Status |
|----|-------|------|--------|
| R001 | `handleNext` race: save fires, run starts without awaiting. Worker may read stale options. | SubmodulePanel.tsx:400-405 | ✅ Fixed (Phase 8b) |
| R002 | Orphaned pending row: if BullMQ enqueue fails, `submodule_runs` row stays `pending` forever, blocking future runs. | submoduleRuns.js:193-209 | ✅ Fixed (Phase 8b) |

### MEDIUM — Fix in Phase 8b or early Phase 10

| ID | Issue | File | Status |
|----|-------|------|--------|
| R003 | No global ErrorBoundary. Component render error = white screen crash. | main.tsx | ✅ Fixed (Phase 8b) |
| R004 | Imprecise query invalidation: `['latestSubmoduleRuns']` invalidated broadly instead of scoped to `[runId, stepIndex]`. | useSubmoduleRuns.ts:64 | ✅ Fixed (Phase 8b) |
| R005 | Previous Run Summary bar missing. Spec requires it (SKELETON_SPEC line 280), data fetched but never rendered. | SubmodulePanel.tsx | Deferred to Phase 10 |

### LOW — Phase 10 cleanup

| ID | Issue | File | Status |
|----|-------|------|--------|
| R006 | 9 console.log debug statements in production code. | submoduleRuns.js | Deferred |
| R007 | panelStore not reset on navigation. Stale panel state when switching runs. | panelStore.ts | Deferred |
| R008 | Synchronous CSV parsing (`csv-parse/sync`) blocks event loop on large files. | stepContext.js:14 | ✅ Fixed (Phase 8b) |
| R009 | Shared import path `../../../shared/stepConfig.js` outside src/ — works but fragile. | stepConfig.ts:1 | ✅ Fixed (Phase 8b) |

## Backlog

| ID | Task | Added |
|----|------|-------|
| B001 | URL cleanup after scraping (purge old discovered_urls) | 2026-01-30 |
| B002 | Project-level filter customization (custom exclude/include patterns) | 2026-01-30 |
| B003 | Re-run cascade invalidate (supersedes/needs_review columns) | 2026-02-01 |

## Phase 9 Pre-Test Findings

| ID | Issue | Severity | Detail |
|----|-------|----------|--------|
| P9-001 | tools.http has no HEAD method | Medium | Skeleton only exposes .get() and .post(). url-filter needs HEAD for status-code checks. Either add tools.http.head() to skeleton or use GET with short timeout. Will surface when check_status_codes=true. |
| P9-002 | rss-feeds full-parse vs cost:cheap tension | Low | Manifest says cost:cheap (5min timeout). Full XML parse of every discovered feed could be slow on sites with many feeds. Monitor during test — if timeouts occur, either simplify logic or bump cost to medium. |
| P9-003 | Step 1→2 data handoff untested | Unknown | Skeleton's mechanism for passing Step 1 output as Step 2 input has never been tested with real submodules. First real run will surface format mismatches, missing fields, or entity-grouping issues. |

---

*Updated: 2026-02-15 — Phase 9 pre-test findings logged. Phase 8b COMPLETE. All 7 items fixed: R001-R004, K003, R008, R009. Remaining for Phase 10: R005-R007, K001, K004.*
