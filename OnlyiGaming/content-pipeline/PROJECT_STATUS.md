# Project Status: Content Pipeline

**Last Updated**: 2026-02-15
**Status**: Phase 8 Complete — Ready for End-to-End Testing
**Architecture**: Two-repo (skeleton + modules), database-mediated pipeline with React UI

---

## Current State

### What Works
- Project creation → Step 1 discovery (sitemap-parser) → approve → Step 2 validation (url-dedup)
- Previous step data displayed in next step's Input accordion via ContentRenderer
- Submodule `summary.description` pattern — submodules author their own human-readable summaries
- Both repos committed: skeleton `8a081e8`, modules `9f55c76`

### What's Built (Infrastructure)
- Hetzner CX22 VPS: Ubuntu 24.04, Node.js 20.20, Redis 7.0.15
- Supabase: 8 core tables + step_context + submodule_runs
- Express API server with entity-level endpoints
- BullMQ workers with entity-level job processing
- React client: Step 0 + Step 1 + shared components (CategoryCardGrid, SubmodulePanel, StepSummary, StepApprovalFooter)
- Zustand (UI state) + TanStack Query (server data) architecture
- Module auto-discovery from manifests

### What's NOT Built
- Steps 2-10 UI (use universal step template — same component renders all)
- Most submodule execute.js files (rss-feeds, url-filter are manifest-only placeholders)
- TanStack Query integration (hooks exist, not fully wired)
- End-to-end multi-step flow test

---

## Immediate Next Actions

1. **Phase 9: End-to-End Pipeline Test** — Run full Step 1 → Step 2 → verify data chain works
2. **Test working pool ➕➖＝ mechanics** with multiple submodules in same step
3. **Schema-driven row_highlight** in ContentRenderer (resolve hardcoded `isDuplicate` check — Phase 10 TODO)
4. **Build more submodules** — rss-feeds (execute.js), url-filter (execute.js)

---

## Architecture Summary

### Two-Repo Split
| Repo | Path | Purpose |
|------|------|---------|
| Skeleton | `content-pipeline-v2/` | Database, queue, step flow, React shell |
| Modules | `content-pipeline-modules-v2/` | Submodule folders: manifest.json + execute.js |

### Database Schema
Defined in `specs/SKELETON_SPEC_v2.md`. Core tables:

| Table | Purpose |
|-------|---------|
| entities | Companies, topics, persons being processed |
| projects | Batch job definitions |
| pipeline_runs | Execution tracking |
| run_entities | Entity snapshots per run |
| pipeline_stages | Per-entity, per-step outputs |
| generated_content | Final outputs ready for publishing |
| discovered_urls | Step 2 bulk output |
| scraped_pages | Step 4 bulk content |
| step_context | Shared data within a step |
| submodule_runs | Individual submodule execution tracking |

### Key Design Decisions
- Upload happens INSIDE each submodule (no separate upload step)
- Shared step context: CSV in one submodule available to others in same step/run/project
- Entity snapshots prevent mid-run corruption
- Submodules are pure functions — no DB writes, parent module handles storage
- Skeleton renders slots, modules fill them (only Options accordion is a true module slot)
- Spec always wins over existing code

---

## Phase Progress

| Phase | Status |
|-------|--------|
| 0: Repo Scaffold | ✅ Complete |
| 1: Header, routing | ✅ Complete |
| 2: Step 0, Supabase tables | ✅ Complete |
| 3: Run View, step accordion | ✅ Complete |
| 4: Module auto-discovery | ✅ Complete |
| 5: SubmodulePanel shell | ✅ Complete |
| 6: Input/Options/ContentRenderer | ✅ Complete |
| 7: BullMQ execution, Results, approval | ✅ Complete |
| 8: Step-to-step data flow | ✅ Complete |
| **9: End-to-end pipeline test** | **⏳ Next** |
| 10: Polish, error states | ⏳ Not started |

---

## Known Issues & Backlog

See `specs/BACKLOG.md` — single source of truth for known issues (K001-K004) and backlog items (B001-B003).

---

## Quick Reference

- **Server**: `ssh hetzner` (188.245.110.34)
- **Redis**: 127.0.0.1:6379
- **Supabase**: https://fevxvwqjhndetktujeuu.supabase.co
- **Server path**: `/opt/content-pipeline/`
- **Session logs**: `sessions/` folder

*For full architecture details, read `specs/SKELETON_SPEC_v2.md`.*
*For build rules and code quality, read `specs/CLAUDE.md`.*
