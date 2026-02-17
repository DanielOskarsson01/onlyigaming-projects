# Project Status: Content Pipeline

**Last Updated**: 2026-02-16
**Status**: Phase 9 In Progress — Step 1+2 End-to-End Tested
**Architecture**: Two-repo (skeleton + modules), database-mediated pipeline with React UI

---

## Current State

### What Works (End-to-End Verified)
- Full Step 1 → Step 2 pipeline flow tested with real data
- Step 1 submodules: sitemap-parser, page-links (both execute.js working)
- Step 2 submodules: url-dedup, url-filter, url-relevance (all execute.js working)
- Data operation semantics refined and working:
  - ＝ (transform): Independent execution, results accumulated into pool (Step 1 pattern)
  - ➖ (remove): Chaining — each submodule filters from previous sibling's pool (Step 2 pattern)
  - ➕ (add): Chaining — each submodule enriches the pool (future use)
- Step 1 ＝ submodules discover independently, merge into pool on approval
- Step 2 ➖ submodules chain: each filters the previous sibling's approved output
- url-relevance uses `tools.ai` for LLM-based URL classification (KEEP/MAYBE/DROP)
- Clickable URLs in all result lists
- Flagged items (duplicate, excluded, dead_link, DROP) highlighted red and auto-deselected
- Textarea and CSV input shared across sibling submodules via step_context
- Reopen Step: users can go back to a completed step, re-run, and re-approve
- Query invalidation: UI updates after approvals (pool count, sibling data)
- Stuck run auto-cleanup (>10 min pending/running → auto-fail)

### What's Built (Infrastructure)
- Hetzner CX22 VPS: Ubuntu 24.04, Node.js 20.20, Redis 7.0.15
- Supabase: 8 core tables + step_context + submodule_runs + run_submodule_config
- Express API server with data-operation-aware input resolution
- BullMQ workers with tools object (logger, http, progress, ai)
- React client: Universal step template renders all steps (Step 0 has custom view)
- Zustand (UI state) + TanStack Query (server data) architecture
- Module auto-discovery from manifests

### What's NOT Built Yet
- Steps 3-10 submodules (Step 3 = scraping, Step 4 = content generation, etc.)
- Schema-driven row_highlight (status values still hardcoded in skeleton — K001)
- Pagination for large result sets (K004)

---

## Immediate Next Actions

1. **Continue Phase 9 testing** — Verify edge cases, error handling, large datasets
2. **Build Step 3+ submodules** — page-scraper, content-generator
3. **Schema-driven row_highlight** in ContentRenderer (K001 — Phase 10)
4. **Document standard status values** as module author contract in SUBMODULE_DEVELOPMENT.md

---

## Architecture Summary

### Two-Repo Split
| Repo | Path | Purpose |
|------|------|---------|
| Skeleton | `content-pipeline-v2/` | Database, queue, step flow, React shell |
| Modules | `content-pipeline-modules-v2/` | Submodule folders: manifest.json + execute.js |

### Data Operation Semantics (Refined Feb 2026)
| Icon | Name | Input Source | Approval Behavior | Use Case |
|------|------|-------------|-------------------|----------|
| ＝ | transform | Original input (independent) | Merge into pool (accumulate) | Step 1: each discovers independently |
| ➖ | remove | Working pool (chaining) | Replace pool with approved subset | Step 2: each filters from previous |
| ➕ | add | Working pool (chaining) | Merge approved into pool (grows) | Future: enrich from current pool |

### Database Schema
Defined in `specs/SKELETON_SPEC_v2.md`. Core tables:

| Table | Purpose |
|-------|---------|
| entities | Companies, topics, persons being processed |
| projects | Batch job definitions |
| pipeline_runs | Execution tracking |
| run_entities | Entity snapshots per run |
| pipeline_stages | Per-step state: input_data, working_pool, output_data |
| step_context | Shared input data within a step (CSV or textarea) |
| submodule_runs | Individual submodule execution tracking |
| run_submodule_config | Per-submodule saved options, input config, data_operation |
| decision_log | Audit trail for step approvals, skips, reopens |

### Key Design Decisions
- Upload happens INSIDE each submodule (no separate upload step)
- Shared step context: CSV or textarea in one submodule available to siblings
- Submodules are pure functions — no DB writes, skeleton handles storage
- Skeleton renders slots, modules fill them (only Options is a true module slot)
- Spec always wins over existing code
- Standard status values for flagging: `duplicate`, `excluded`, `dead_link`, `DROP`

---

## Phase Progress

| Phase | Status |
|-------|--------|
| 0: Repo Scaffold | Done |
| 1: Header, routing | Done |
| 2: Step 0, Supabase tables | Done |
| 3: Run View, step accordion | Done |
| 4: Module auto-discovery | Done |
| 5: SubmodulePanel shell | Done |
| 6: Input/Options/ContentRenderer | Done |
| 7: BullMQ execution, Results, approval | Done |
| 8: Step-to-step data flow | Done |
| 8b: Code review fixes (R001-R009, K003) | Done |
| **9: End-to-end pipeline test** | **In Progress** — Step 1+2 verified |
| 10: Polish, error states | Not started |

---

## Known Issues & Backlog

See `specs/BACKLOG.md` for full list. Key items:
- K001: Hardcoded status values in ContentRenderer (Phase 10 — schema-driven)
- K004: No pagination for large result sets (Phase 10)

---

## Quick Reference

- **Server**: `ssh hetzner` (188.245.110.34)
- **Redis**: 127.0.0.1:6379
- **Supabase**: https://fevxvwqjhndetktujeuu.supabase.co
- **Server path**: `/opt/content-pipeline/`
- **Session logs**: `sessions/` folder

*For full architecture details, read `specs/SKELETON_SPEC_v2.md`.*
*For build rules and code quality, read `content-pipeline-v2/CLAUDE.md`.*
