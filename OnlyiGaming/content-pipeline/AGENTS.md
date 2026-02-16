# Content Pipeline — Agent Orientation

**Last Updated**: 2026-02-15
**Purpose**: Quick-start context for any AI agent (Claude Code, Gemini, Codex) working on this project.

---

## What This Project Is

A modular, database-mediated content pipeline for generating SEO-optimized content. Starting with iGaming company profiles, designed to expand to any content type (podcasts, events, news, consultants). The system transforms minimal input (company names + URLs) into comprehensive profiles through an 11-step automated workflow.

**Strategic principle**: This is a universal content creation tool. Company profiles are the first use case, not the only one.

## Architecture: The "Hard Wall" Strategy

Two separate repositories with strict boundaries:

| Repo | Path | Purpose | Status |
|------|------|---------|--------|
| **Skeleton** | `content-pipeline-v2/` | Infrastructure — DB, queue, step flow, React UI shell | Frozen after Phase 10 |
| **Modules** | `content-pipeline-modules-v2/` | Submodule logic — `manifest.json` + `execute.js` per submodule | Active development |

**Why the split**: AI agents kept modifying infrastructure while fixing module bugs, causing a rebuild cycle. Physical separation prevents this.

**The rule**: The skeleton renders what manifests tell it to. It never contains domain-specific knowledge. If it "knows" about URLs, duplicates, or sitemaps, that's a bug.

## Tech Stack

- **Client**: React + Vite + TanStack Query + Zustand + Tailwind CSS
- **Server**: Express.js + BullMQ + Redis
- **Database**: Supabase PostgreSQL (8 core tables + step_context + submodule_runs)
- **Hosting**: Hetzner CX22 VPS (188.245.110.34)

## Current Status

**Phase 8 of 10 complete.** Phase 9 (end-to-end pipeline test) is next.

Working: Project creation → Step 1 discovery (sitemap-parser) → approve → Step 2 validation (url-dedup) → previous step data displayed in next step.

Not built: Steps 2-10 UI (uses universal template), most submodule execute.js files, full TanStack Query wiring.

## Specs (Source of Truth)

All specs live in `Content-Pipeline/specs/` — **READ-ONLY, do not copy into code repos.**

| Document | What it tells you |
|----------|-------------------|
| `SKELETON_SPEC_v2.md` | THE spec — architecture, components, data flow, DB schema (1607 lines) |
| `BUILD_PLAN.md` | Phased build sequence with deliverables |
| `SUBMODULE_DEVELOPMENT.md` | How to create submodules — manifest format, execute() contract |
| `UI_REFERENCE.md` | Visual specs for all 6 components |
| `STRATEGIC_ARCHITECTURE.md` | WHY decisions were made |
| `BACKLOG.md` | Known issues (K001-K004) and deferred work (B001-B003) |

## File Locations

| What | Where |
|------|-------|
| Specs | `Content-Pipeline/specs/` |
| Session logs | `Content-Pipeline/sessions/` |
| Project status | `Content-Pipeline/PROJECT_STATUS.md` |
| Roadmap | `Content-Pipeline/ROADMAP.md` |
| Skeleton code | `content-pipeline-v2/` |
| Modules code | `content-pipeline-modules-v2/` |
| Archive | `Content-Pipeline/archive/` |

## Rules for All Agents

1. **Read CLAUDE.md in the repo you're working in** before writing any code
2. **Never modify infrastructure** (Supabase, Redis, BullMQ, Express routes) unless explicitly directed
3. **Never create specs/ in code repos** — specs live only in `Content-Pipeline/specs/`
4. **Spec always wins** over existing code — if code disagrees with spec, the code is wrong
5. **One phase at a time** — do not "prepare" for future phases
6. **Plan before coding** — present what you'll do and wait for approval

---
*For project-wide agent rules, see `/Projects/OnlyiGaming/AGENTS.md`*
