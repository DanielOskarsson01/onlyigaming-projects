# Content Pipeline Project

## Project Overview
Building a **Universal Content Intelligence & Creation Platform** for the iGaming industry (onlyigaming.com). The system is content-type-agnostic — it processes ANY content type (news articles, company profiles, podcast pages, competitor analysis) through configurable, database-mediated workflows with a shared content library.

**Strategic Principle**: This is a general-purpose content intelligence and creation system — NOT a company profile tool. Company profiles are only the first configured use case.

## Current Status
- **Phase**: Architecture Decisions Finalized — Shared Step Context Added
- **Architecture**: Database-mediated pipeline with submodule-based execution
- **Server**: Hetzner CX22 VPS fully configured (Redis, Node.js, dependencies)
- **Key Decision**: Upload happens INSIDE each submodule (no separate upload step)
- **New Feature**: Shared step context — CSV uploaded in one submodule available to others in same step
- **Next**: Implement Step 1 (Discovery) with shared context

## Architecture Summary (2026-01-28)

See `docs/ARCHITECTURE_DECISIONS.md` for full details.

### Step Structure
| Step | Name | Purpose |
|------|------|---------|
| 0 | Project Start | Name, template, intent |
| 1 | Discovery | Upload INSIDE submodules, collect URLs |
| 2 | Validation/Dedupe | Clean URLs, handle duplicates |
| 3 | Scraping | Fetch content |
| 4+ | ... | Analysis, generation, QA, etc. |

### Shared Step Context
CSV uploaded in one submodule available to other submodules in SAME step:
- Sitemap uploads CSV with (name, website, linkedin, youtube)
- LinkedIn submodule auto-finds linkedin column
- YouTube submodule auto-finds youtube column
- Priority: local upload > shared context > prompt user

## Architecture

### Core Design: Tag-Based Content Library
All content (scraped pages, entities, generated articles, transcripts) lives in ONE universal `content_items` table, organized by tags from a 352+ tag taxonomy. Content is scraped once and reused across projects.

- **Orchestration**: BullMQ with Redis
- **Database**: Supabase PostgreSQL (tag-based content library)
- **Server**: Hetzner CX22 VPS (188.245.110.34)
- **Stack**: Node.js 20.20.0, Express.js, Redis 7.0.15

### Database Schema (Finalized)

**Content Library Tables**:
- `content_items` — Universal content storage (scraped pages, entities, articles, transcripts)
  - `content_type` discriminator: 'scraped_page', 'entity', 'generated_article', 'transcript', etc.
  - `source_url` unique index for deduplication
  - `content` JSONB (nullable — nulled after retention purge)
  - `status`: 'active', 'filtered_step3', 'filtered_step5', 'superseded', 'archived'
  - `version` column for conflict resolution (latest scrape wins)
  - `purged_at` for retention tracking
- `platform_tags` — 352+ tag taxonomy (DIR, NEWS, GEO, PROD, TYPE, SYSTEM dimensions)
  - UUID primary key, `tag_code` human-readable (e.g., 'DIR-029', 'NEWS-015')
  - Tag lifecycle: active → deprecated → retired
- `content_tags` — Junction table with UUID FK to platform_tags
  - `confidence` score, `source` (manual, auto_llm, auto_rule)

**Pipeline Tables**:
- `projects` — Batch/job definitions with `project_type` discriminator
- `pipeline_templates` — Stage definitions per project type (ordered array of operations)
- `pipeline_runs` — Execution tracking per project
- `pipeline_stages` — Step-level results per run

### Key Design Decisions
1. **Content reuse**: Scrape once, tag, reuse across projects (company profile + news article + competitor analysis can share the same scraped content)
2. **Freshness flags, not gates**: >14 days = stale_news, >3 months = stale_company — but content is NEVER blocked from reuse
3. **Conflict resolution**: `ON CONFLICT (source_url) DO UPDATE WHERE new.scraped_at > existing.scraped_at` with version increment
4. **Tiered retention**: Filtered content (steps 3 & 5) keeps metadata row but JSONB body is nulled after 7 days
5. **Configuration over specialization**: Differences between content types handled via pipeline_templates config, not code branches

## Design Principles
1. **Content-type agnostic**: No component may hardcode assumptions about companies or fixed page structures
2. **Database-mediated**: Each step reads/writes to Supabase, no direct connections between operations
3. **Step independence**: Each step has one responsibility with explicit inputs/outputs
4. **Tag-based organization**: 352+ tags across dimensions organize all content
5. **Persist everything**: Inputs, outputs, decisions, and status stored at every step
6. **Human-in-the-loop**: Review, rejection, and overrides supported

## The 11-Step Pipeline (Steps 0–10)
0. Project Start (name, choose project/template, parent link)
1. Discovery (upload inside submodules, collect URLs)
2. Validation & Dedupe (clean URLs, deduplication — FILTER STEP)
3. Scraping (fetch content)
4. Filtering (language, relevance — FILTER STEP)
5. Analysis & Generation (classification, content creation)
6. QA (fact checks, hallucination detection)
7. Routing (conditional routing, retries, loops)
8. Bundling (HTML, JSON, metadata)
9. Distribution (CMS, APIs, exports)
10. Review (human approval, rejection)

**Key change:** Old Step 1 (Input) + Step 2 (Discovery) combined into new Step 1 (Discovery). Upload happens INSIDE each submodule.

## Naming Convention

| Term | Definition | Location |
|------|------------|----------|
| **Step** | One of 11 pipeline stages (0-10) | UI, templates |
| **Module** | Operation code that executes a step | `modules/operations/` |
| **Phase** | Configured group of submodules within a step | `config.phases[]` |
| **Submodule** | Single-task unit within a module | `modules/submodules/{type}/` |

**Example**: Step 2 (Discovery) uses the `discovery` module. The module runs phases like "cheap_parallel" containing submodules like `sitemap`, `navigation`, `seed-expansion`.

## Business Needs (Priority Order)
1. **News site**: Needs new content + continuous updates (HIGH PRIORITY)
2. **Podcast/media pages**: Need to be built with content (HIGH PRIORITY)
3. **Company profiles**: Improve existing 1,400 profiles (one use case among many)
4. **Registration self-service**: Frontend tool for new companies to create profiles

## Key Documents

### Operations (CRITICAL - Read First)
- `HETZNER_OPS.md` — **SSH troubleshooting guide. NEVER use Hetzner console. Fix locally first.**

### Technical Documentation (in /docs)
- `Universal_Content_Pipeline_Architecture.md` — System architecture with schema
- `bullmq_architecture_doc.md` — BullMQ implementation spec
- `updated_project_memory.md` — Project history and decisions
- `Raw_Appendix_Content_Creation_Master.md` — Detailed 13-step appendix

### Strategic Documents (in root / Downloads)
- `Strategic_Blueprint_Holistic_Content_Platform.md` — Foundational design rules
- `PROJECT_STATUS.md` — Current status and phase tracking
- `ROADMAP.md` — Development roadmap

## Technical Specifications

**Server**: Hetzner CX22 (2 vCPU, 4GB RAM, 40GB disk, Ubuntu 24.04.3 LTS)
- IP: 188.245.110.34
- SSH: `ssh hetzner` (uses ~/.ssh/id_ed25519)
- Node.js: 20.20.0 (npm 10.8.2)
- Redis: 7.0.15 (password: Danne2025)
- **SSH NOT WORKING?** → Read `HETZNER_OPS.md` FIRST (usually just run `ssh-add ~/.ssh/id_ed25519`)

**Supabase**:
- URL: https://fevxvwqjhndetktujeuu.supabase.co
- New tables: content_items, platform_tags, content_tags, projects, pipeline_templates, pipeline_runs, pipeline_stages, plugin_registry
- SQL definitions: `sql/plugin_registry.sql` (plugin_registry table DDL)
- Legacy tables (preserve): companies, discovery_links, content_raw, content_json_draft

**Project Path**: `/opt/content-pipeline/` (new universal platform)

### Local Project Structure
```
Content-Pipeline/
├── public/index.html              # Dashboard (Alpine.js + Tailwind)
├── modules/
│   ├── operations/                # MODULES - one per step
│   │   ├── _template.js           # Module interface template
│   │   └── discovery.js           # Discovery module (Step 2)
│   └── submodules/                # SUBMODULES - grouped by module type
│       └── discovery/
│           ├── _template.js       # Submodule interface template
│           ├── sitemap.js         # Sitemap parsing (cheap)
│           ├── navigation.js      # Navigation links (cheap)
│           ├── seed-expansion.js  # Seed URL expansion (cheap)
│           └── search-google.js   # Google Search API (expensive)
├── services/
│   ├── db.js                      # Supabase client
│   ├── orchestrator.js            # Pipeline run lifecycle
│   ├── contentLibrary.js          # Content queries & storage
│   └── tagService.js              # Tag operations
├── workers/
│   └── stageWorker.js             # BullMQ consumer (loads modules dynamically)
├── utils/
│   └── aiProvider.js              # AI provider adapter (OpenAI + Anthropic)
├── sql/
│   ├── plugin_registry.sql        # Plugin registry table DDL
│   ├── pipeline_entities.sql      # Entity tracking per run
│   └── discovered_urls.sql        # URLs discovered per entity
├── .mcp.json                      # Supabase MCP server config
└── docs/                          # Architecture & workflow docs
```

### Module Interface
All modules in `modules/operations/` export: `name`, `version`, `type`, `configSchema` (JSON Schema), `metadata`, and `async execute(input, config, context)`. See `_template.js` for the full interface.

### Submodule Interface
All submodules in `modules/submodules/{type}/` export: `name`, `type`, `version`, `description`, `cost`, and `async execute(entities, config, context)`. Submodules are pure functions that return results without writing to the database. The parent module handles bulk storage.

### AI Provider
`utils/aiProvider.js` — unified adapter for OpenAI and Anthropic. Set `AI_PROVIDER` env var ('openai' or 'anthropic') and corresponding API key. Exposes `generate(prompt, options)` and `generateJSON(prompt, options)`.

## Immediate Next Actions
1. **Create Supabase schema**: content_items, platform_tags, content_tags, projects, pipeline_templates, pipeline_runs, pipeline_stages, plugin_registry
2. **Seed platform_tags**: Load 352+ tag taxonomy into platform_tags table
3. **Build Express API**: Generic project management + content library endpoints
4. **Implement BullMQ Workers**: Dynamic operation loading based on pipeline_templates
5. **Build Dashboard**: Content type selector, project creation, real-time monitoring

## Session Log

### Session: 2026-01-26 (Session 4) - Dashboard Bug Fixes & Approval Gate System

**Accomplished:**

1. **Step 0 UI Bug Fix**:
   - Removed `$root` prefixes that were causing Alpine.js scoping issues in nested components
   - Fixed `createAndSelectProject()` to work in demo mode (was making API calls without checking `useMockData`)

2. **Local Development Setup**:
   - Installed Redis locally for BullMQ workers
   - Created `.env` file with Supabase credentials

3. **Approval Gate System Implementation**:
   - Modified `orchestrator.js` `queueNextStage()` to pause with 'awaiting_approval' status instead of auto-continuing
   - Added `approveStage()` method to orchestrator for manual stage approval
   - Added API endpoints: `POST /api/runs/:id/stages/:stageIndex/approve` and `GET /api/runs/:id/awaiting-approval`
   - Wired up UI "Approve & Continue" button to call API in live mode
   - Added `awaiting_approval` and `approved` status styling (yellow/green badges)

4. **View Results Feature**:
   - Added "View Results" button to step headers that opens slide-in panel with real stage output data
   - Implemented `openStageResultsPanel()` function to fetch and display real pipeline stage results
   - Added `extractResultItems()` function to parse `output_data` JSONB into displayable format

**Files Modified:**
- `public/index.html` — UI fixes and new features (View Results, Approve buttons, status badges)
- `services/orchestrator.js` — Approval gate logic (`approveStage()`, modified `queueNextStage()`)
- `routes/runs.js` — New API endpoints for approval workflow
- `.env` — Created with Supabase credentials

**Architecture Changes:**

| Aspect | Before | After |
|--------|--------|-------|
| Stage progression | Auto-continues to next | Pauses for approval |
| Stage statuses | pending, running, completed, failed | + awaiting_approval, approved |
| Results viewing | Mock data only | Real `output_data` from database |

**Alignment**: This session directly supports Phase 1.5 (BullMQ Workers) and Phase 1.6 (Web Dashboard) by making the pipeline more controllable and observable.

**Updated by:** Claude Opus 4.5 (session-closer)

---

### Session: 2026-01-26 - Simplified Project/Template Architecture & Dashboard UI Refactoring

**Accomplished:**

1. **Simplified Project/Template Architecture**:
   - Created `templates` table schema (SQL in `sql/simplify_schema.sql`)
   - Created `templateService.js` for template CRUD operations
   - Created `routes/templates.js` for template API endpoints
   - Updated `routes/projects.js` to support template references and input_data
   - Updated `orchestrator.js` to accept stagesOverride parameter

2. **Dashboard UI Refactoring**:
   - Removed popup modal for project creation
   - Moved project creation into Step 0 of the accordion:
     - Radio buttons: "New Project" or "Existing Project"
     - New Project: text input + Create button
     - Existing Project: dropdown of existing projects
   - Added `showPipelineAccordion` state variable for proper view toggling
   - Added `createAndSelectProject()` and `selectProjectById()` methods
   - Fixed visibility conditions so project list hides when accordion shows

**Files Created:**
- `sql/simplify_schema.sql` — Templates table DDL
- `services/templateService.js` — Template CRUD operations
- `routes/templates.js` — Template API endpoints

**Files Modified:**
- `routes/projects.js` — Added template_id and input_data support
- `services/orchestrator.js` — Added stagesOverride parameter
- `server.js` — Registered templates route
- `public/index.html` — Major UI refactoring for project creation flow

**Pending Items (User Action Required):**
1. Run SQL migration in Supabase SQL Editor to create `templates` table
2. Hard refresh browser to see UI changes

**Updated by:** Claude Opus 4.5

---

### Session: 2026-01-25 (Evening) - DASHBOARD UI COMPLETE: Card-Based Steps + Slide-in Results Panel
**Accomplished:**
- Implemented card-based UI for ALL 12 pipeline steps (0-11)
- Created slide-in results panel from left side with smooth CSS animation
- Connected all submodule rows to results panel (click to view details)
- Added context-aware mock data generator for different submodule types
- Updated bullmq_architecture_doc.md with `output_data` contract for UI

**UI Components Built:**

| Step | Categories/Cards Implemented |
|------|------------------------------|
| 0 - Project Setup | Name, Description, Type, Tags |
| 1 - Input | URLs, CSV Upload, Library Import, API Fetch |
| 2 - Discovery | Sitemap, Navigation, Seed Expansion, Search Google |
| 3 - Validation | Domain Trust, URL Status, Content Type, Robots.txt |
| 4 - Extraction | Cheerio, Playwright, Text Only, Custom |
| 5 - Filtering | Dedup, Too Short, Irrelevant, Language |
| 6 - Generation | AI Models, Generation Types, Auto-tagging, Output Formats |
| 7 - QA | Accuracy, Structure, Quality Scores, SEO |
| 8 - Routing | Quality-Based, Content-Based, Retry Logic, Loop Triggers |
| 9 - Bundling | Output Formats, Metadata, Audit Trail, Assets |
| 10 - Distribution | CMS, API/Database, Storage, Notifications |
| 11 - Review | Review Actions, Post-approval, Notifications, Archive |

**Slide-in Panel Features:**
- Animated slide-in from left (CSS transform + transition)
- Backdrop overlay with fade effect, ESC key to close
- Header with icon, title, subtitle (category + cost)
- Status badge (success/warning/error/pending)
- Stats grid (result, duration, cost)
- Results list with status indicators
- Output log section, footer with "View full logs" and Close button

**Key Technical Decisions:**
1. Card-based submodule organization: Each step has category cards containing submodules
2. Submodule data structure: `{ id, name, enabled, cost, description, lastResult }`
3. Category data structure: `{ enabled, label, icon, submodules: [...] }`
4. Alpine.js `$root` reference for nested components to access global state
5. `@click.stop` on checkboxes prevents triggering row click
6. Tailwind `group`/`group-hover` for "View" reveal on hover
7. `getMockResultItems()` returns context-aware results based on submodule type

**Architecture Impact:**
| Area | Impact |
|------|--------|
| Database | No changes needed |
| BullMQ Workers | No changes (added output_data structure to docs) |
| Hetzner | No changes |
| API | Needs implementation (currently uses mock data) |

**Status**: Phase 1.6 (Web Dashboard) UI COMPLETE. Ready for API integration when Phase 1.2-1.4 completed.

**Updated by:** Claude Opus 4.5

### Session: 2026-01-25 - Module/Submodule Architecture Implementation
**Accomplished:**
- Implemented config-driven discovery module with cascading phases
- Created 4 discovery submodules: sitemap, navigation, seed-expansion, search-google
- Renamed `methods/` to `submodules/` for consistent terminology
- Updated dashboard UI with Phase Editor for configuring submodule cascades
- Created SQL schema for pipeline_entities and discovered_urls tables
- Updated all documentation with naming convention

**Updated by:** Claude Opus 4.5

### Session: 2026-01-24 - DOCUMENTATION ALIGNMENT: All Project Docs Updated to Universal Architecture
**Accomplished:**
- Updated all 8 project documents to reflect universal tag-based content library architecture
- Finalized schema confirmed and documented across CLAUDE.md, PROJECT_STATUS.md, ROADMAP.md
- Updated technical docs: Universal_Content_Pipeline_Architecture.md (v3.0), bullmq_architecture_doc.md, updated_project_memory.md
- Created comprehensive workflow document: Full_Workflow_Document_With_Intro_Formatted_v3.md
- Preserved historical v2 .docx for reference
- Progress checkpoint marked: Schema finalized, documentation complete, ready for implementation

**Status**: All documentation aligned, no conflicts, no ambiguities. Platform architecture confirmed with critic agent. Ready to move to Phase 1.2 (Create Supabase Tables).

**Next Phase**: Create 7 Supabase tables → Seed 352+ tags → Build Express API → Build BullMQ workers → Build dashboard

**Updated by:** Claude Opus 4.5

### Session: 2026-01-23 - STRATEGIC PIVOT: Tag-Based Universal Content Library
**Accomplished:**
- Identified critical misalignment: company-specific implementation vs. universal platform vision
- Designed tag-based content library with cross-project reuse
- Stress-tested schema with brutal-critic agent (scored 4/10, fixed to production-ready)
- Applied 3 critical fixes: content_type discriminator, UUID FK for tags, conflict resolution
- Added tiered retention policy for filtered content (7-day body purge)
- Documented finalized schema across all project documents

**Decisions:**
- ONE universal content_items table (not per-type tables)
- Tags as organizing principle (352+ taxonomy)
- Freshness = flags, not gates (content always reusable)
- Filtered content body purged after 7 days (metadata stays)
- Configuration-driven pipeline via pipeline_templates

**Updated by:** Claude Opus 4.5

### Session: 2026-01-23 - MAJOR MILESTONE: Server Infrastructure Complete
**Accomplished:**
- Resolved SSH access blocker, established working connection
- Installed Redis 7.0.15, Node.js 20.20.0, core dependencies
- Created project directory, verified full environment

**Updated by:** Claude Sonnet 4.5

### Session: 2025-12-14 - Project Initialization & Documentation
**Accomplished:**
- Documentation review, architecture analysis
- Created initial ROADMAP.md
- Identified critical path

**Updated by:** Claude Opus 4.5

---
*Last updated: 2026-01-26*
*Updated by: Claude Opus 4.5*
