# Content Pipeline — Gemini Context

**Last Updated**: 2026-02-15
**Purpose**: Gemini-specific orientation for code reviews, spec reviews, and architectural analysis on this project.

---

## Your Role

Gemini is used for **reading comprehension and pattern recognition** tasks on this project — primarily code reviews and spec consistency checks. Your long context window is the advantage: you can ingest all specs + all source files in one pass and spot inconsistencies that smaller contexts miss.

You are NOT typically used for code execution or implementation. That's Claude Code or Codex.

## Architecture Summary

Two-repo split. Skeleton (infrastructure, frozen) + Modules (domain logic, active development).

- **Client**: React + Vite + TanStack Query + Zustand
- **Server**: Express + BullMQ + Supabase
- **Pattern**: Manifest-driven — submodules declare UI needs via `manifest.json`, skeleton renders generically

**The Hard Wall**: The skeleton must NEVER contain domain-specific knowledge. If it "knows" about URLs, duplicates, sitemaps, etc., that's a boundary violation.

## Specs to Read

All in `Content-Pipeline/specs/`:

| Priority | Document | Lines | What it tells you |
|----------|----------|-------|-------------------|
| 1 | `SKELETON_SPEC_v2.md` | ~1100 | THE contract — architecture, components, data flow, DB schema |
| 2 | `SUBMODULE_DEVELOPMENT.md` | ~500 | Boundary definition — what modules can/can't do |
| 3 | `BUILD_PLAN.md` | ~990 | What was built and in what order (Phases 0-10) |
| 4 | `BACKLOG.md` | ~30 | Known issues — don't re-report these |
| 5 | `UI_REFERENCE.md` | ~200 | Visual specs for all components |
| 6 | `STRATEGIC_ARCHITECTURE.md` | ~200 | WHY decisions were made |

## Current Status

Phase 8 of 10 complete. Phases 0-8 built by Claude Code.

**Working**: Project creation, Step 1 discovery, Step 2 validation, step-to-step data flow, manifest auto-discovery, `summary.description` pattern.

**Known issues (in BACKLOG.md)**: isDuplicate hardcoded in ContentRenderer, placeholder submodules without execute.js, race condition on concurrent approvals, no pagination.

## Code Repos

| Repo | Path |
|------|------|
| Skeleton | `content-pipeline-v2/` (client/, server/, shared/, sql/) |
| Modules | `content-pipeline-modules-v2/` (modules/step-N-name/submodule-name/) |

## Review Focus Areas (when doing code reviews)

1. **Skeleton/submodule boundary violations** — domain-specific logic in skeleton code
2. **Server routes** — approval flow, input resolution, pool merging, data integrity
3. **State management** — Zustand (UI) vs TanStack Query (server) vs useState (form) separation
4. **Race conditions** — save-then-run, bidirectional syncs, query invalidation timing
5. **Type safety** — `any` casts, missing type guards, `Record<string, unknown>` abuse
6. **Error handling** — unhandled promise rejections, missing error boundaries
7. **Dead code** — accumulated across 9 build phases

## Output Format (for reviews)

For each finding: severity (CRITICAL / MEDIUM / LOW), file + line, description, and suggested fix. Group by category. Don't report items already in BACKLOG.md.

---
*Last updated: 2026-02-15*
