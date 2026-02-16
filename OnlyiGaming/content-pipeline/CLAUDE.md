# Content Pipeline — Agent Orientation

**Last Updated**: 2026-02-15

## What Is This Project?

A **Universal Content Intelligence & Creation Platform** for onlyigaming.com. Content-type-agnostic — processes ANY content type (news, company profiles, podcasts, competitor analysis) through configurable, database-mediated workflows.

**Strategic Principle**: This is a general-purpose content system. Company profiles are only the first use case.

## Current Status

- **Phase**: Phase 8 complete — Step-to-step plumbing done
- **Architecture**: Two-repo (skeleton + modules), database-mediated pipeline
- **What works**: Project creation → Step 1 discovery → approve → Step 2 validation → previous step data displayed → submodule summaries
- **Next**: Phase 9 — End-to-end pipeline test

## Where To Find Things

### Documentation (this folder: `Content-Pipeline/`)

| Folder | Purpose |
|--------|---------|
| `specs/` | Architecture & technical specs — **source of truth** |
| `guides/` | How-to guides (quickstart, walkthrough, workflow) |
| `sessions/` | Session logs from each working session |
| `archive/` | Superseded docs, kept for reference |
| `assets/` | Images and visual assets (future use) |
| `research/` | Submodule research (future use) |

### Key Spec Documents

| Document | What it tells you |
|----------|-------------------|
| `specs/SKELETON_SPEC_v2.md` | **THE source of truth** — architecture, components, data flow, schema (1607 lines) |
| `specs/SUBMODULE_DEVELOPMENT.md` | How to create submodules (486 lines) |
| `specs/BUILD_PLAN.md` | Phased build sequence |
| `specs/UI_REFERENCE.md` | Visual specs for every component |
| `specs/STRATEGIC_ARCHITECTURE.md` | WHY decisions were made |
| `specs/ARCHITECTURE_DECISIONS.md` | Master architecture decisions |
| `specs/BACKLOG.md` | Known issues (K001-K004) and backlog items (B001-B003) |
| `specs/CLAUDE.md` | **Claude Code build rules** — phase gating, code quality rules, architecture enforcement |

### Root Files

| File | Purpose |
|------|---------|
| `PROJECT_STATUS.md` | Current state snapshot — what's done, what's next |
| `ROADMAP.md` | Development phases and milestones |
| `AGENTS.md` | Agent configurations |
| `GEMINI.md` | Gemini agent config |

## Architecture At A Glance

### Two-Repo Split
- **Skeleton** (`content-pipeline-v2/`): Database, queue, step flow, React shell — built once, frozen
- **Modules** (`content-pipeline-modules-v2/`): Submodule folders with manifest + execute.js — active development

### The 11-Step Pipeline (Steps 0–10)

| Step | Name | Purpose |
|------|------|---------|
| 0 | Project Start | Name, template, intent |
| 1 | Discovery | Upload inside submodules, collect URLs |
| 2 | Validation & Dedupe | Clean URLs, deduplication |
| 3 | Scraping | Fetch content |
| 4 | Filtering | Language, relevance |
| 5 | Analysis & Generation | Classification, content creation |
| 6 | QA | Fact checks, hallucination detection |
| 7 | Routing | Conditional routing, retries, loops |
| 8 | Bundling | HTML, JSON, metadata |
| 9 | Distribution | CMS, APIs, exports |
| 10 | Review | Human approval, rejection |

### Naming Convention

| Term | Definition |
|------|------------|
| **Step** | One of 11 pipeline stages (0-10) |
| **Module** | Operation code that executes a step |
| **Phase** | Configured group of submodules within a step |
| **Submodule** | Single-task unit within a module |

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Server state**: TanStack Query
- **UI state**: Zustand
- **Backend**: Express.js + Node.js 20 LTS
- **Database**: Supabase PostgreSQL
- **Job queue**: Redis + BullMQ
- **Server**: Hetzner CX22 VPS (188.245.110.34)

### Database Schema

Schema is defined in `specs/SKELETON_SPEC_v2.md`. Core tables: entities, projects, pipeline_runs, run_entities, pipeline_stages, generated_content, discovered_urls, scraped_pages, step_context, submodule_runs.

**Do NOT reference content_items, platform_tags, or content_tags** — those were the old schema, replaced Jan 25 2026.

## Server Access

```bash
ssh hetzner  # uses ~/.ssh/id_ed25519
# If not working → read specs/HETZNER_OPS.md (usually: ssh-add ~/.ssh/id_ed25519)
```

- **Redis**: 127.0.0.1:6379
- **Supabase**: https://fevxvwqjhndetktujeuu.supabase.co
- **Project path on server**: `/opt/content-pipeline/`

## Business Priority

1. **News site**: New content + continuous updates (HIGH)
2. **Podcast/media pages**: Build with content (HIGH)
3. **Company profiles**: Improve existing 1,400 profiles (first use case)
4. **Registration self-service**: Frontend for new companies

## Design Principles

1. **Content-type agnostic** — no hardcoded assumptions about companies
2. **Database-mediated** — each step reads/writes to Supabase, no direct step-to-step connections
3. **Step independence** — explicit inputs/outputs per step
4. **Persist everything** — inputs, outputs, decisions, status stored
5. **Human-in-the-loop** — review, rejection, overrides supported
6. **Spec wins** — when code contradicts spec, rewrite the code
