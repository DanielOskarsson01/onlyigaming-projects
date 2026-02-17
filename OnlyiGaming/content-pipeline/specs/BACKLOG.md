# Content Pipeline — Backlog

**Single source of truth for known issues and deferred work.**

---

## Known Issues

| ID | Issue | Status | Target |
|----|-------|--------|--------|
| K001 | ContentRenderer hardcoded status values (`duplicate`, `excluded`, `dead_link`, `DROP`) for flagging/pre-deselection. Should be schema-driven. | Deferred | Phase 10 (schema-driven row_highlight) |
| K002 | rss-feeds has no execute.js | Placeholder only | Phase 9+ |
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
| B004 | Option presets / saved profiles — skeleton-wide feature. Save named combinations of submodule options (e.g., "company_profile" keep/drop criteria), load them from a dropdown in the pane. Needs: DB table for presets, UI for save/load/delete, changes to options system. Benefits every submodule, critical for LLM-based modules with complex option sets. | 2026-02-17 |
| B005 | Failure notification system — notify user when entities fail during pipeline execution (dead URLs, HTTP errors, etc.). Support channels: email, Telegram, Slack webhook. Skeleton-level feature, not per-submodule. | 2026-02-17 |

## Phase 9 Test Findings

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| P9-001 | tools.http has no HEAD method | Medium | Open — url-filter uses GET with timeout as workaround |
| P9-002 | rss-feeds full-parse vs cost:cheap tension | Low | Open — untested (rss-feeds has no execute.js yet) |
| P9-003 | Step 1→2 data handoff | Resolved | ✅ Fixed — data-operation-aware input resolution, entity re-grouping from flat pool |
| P9-004 | ＝/➖/➕ data operation semantics undefined | Resolved | ✅ Fixed — ＝=independent/accumulate, ➖=chain/filter, ➕=chain/enrich |
| P9-005 | Sibling submodule chaining (Step 2) | Resolved | ✅ Fixed — ➖ submodules receive working pool, not original step input |
| P9-006 | Flagged items not pre-deselected | Resolved | ✅ Fixed — duplicate/excluded/dead_link/DROP auto-deselected on completion |
| P9-007 | URLs not clickable in result lists | Resolved | ✅ Fixed — ContentRenderer renders url columns as `<a>` links |
| P9-008 | Textarea input not shared across siblings | Resolved | ✅ Fixed — textarea save also upserts to step_context |
| P9-009 | UI not updating after approval (pool count, sibling data) | Resolved | ✅ Fixed — run query invalidated after submodule approval |
| P9-010 | Cannot re-approve a completed step | Resolved | ✅ Fixed — Reopen Step feature added |
| P9-011 | tools.ai missing from worker | Resolved | ✅ Fixed — stageWorker.js exposes tools.ai.complete() for LLM submodules |

---

*Updated: 2026-02-16 — Phase 9 testing in progress. Step 1+2 flow verified. 9 findings resolved (P9-003 through P9-011). Remaining: P9-001, P9-002. Phase 10: R005-R007, K001, K004.*
