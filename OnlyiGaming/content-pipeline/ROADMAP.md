# Content Pipeline Project Roadmap

**Last Updated**: 2026-02-02
**Project Status**: React Migration - Milestones 1 & 1.5 Complete
**Architecture**: Database-mediated pipeline with submodule-based execution and React UI frontend

---

## Architecture Summary (2026-01-28)

See `docs/ARCHITECTURE_DECISIONS.md` for full details.

### Step Structure (Revised)

| Step | Name | Key Change |
|------|------|------------|
| 0 | Project Start | Name, template, intent |
| 1 | Discovery | Upload happens INSIDE submodules (no separate upload step) |
| 2 | Validation/Dedupe | Handles deduplication (not Step 1) |
| 3 | Scraping | Fetch content |
| 4+ | ... | Analysis, generation, QA, etc. |

### Shared Step Context

CSV uploaded in one submodule is available to other submodules **within the same step**:

```
Sitemap submodule → User uploads CSV (name, website, linkedin, youtube)
                  → Data stored in step_context table
LinkedIn submodule → Finds linkedin column → Auto-populates
YouTube submodule → Finds youtube column → Auto-populates
```

**Scope boundaries:**
- ✓ Shared within same step, same run, same project
- ✗ NOT shared across steps, runs, projects, or templates

---

## Naming Convention

| Term | Definition | Location |
|------|------------|----------|
| **Step** | One of 11 pipeline stages (0-10) | UI, templates |
| **Module** | Operation code that executes a step | `modules/operations/` |
| **Phase** | Configured group of submodules within a module | `config.phases[]` |
| **Submodule** | Single-task unit within a module | `modules/submodules/{type}/` |

---

## Session Log

### Session: 2026-02-02 - React Migration: Step 0 & Step 1 Complete

**Accomplished:**
- Built complete React client in `/client` directory (36 files, 6,441 lines)
- Milestone 1 (Step 0 POC) complete - 1 day vs. 2-3 day estimate
- Milestone 1.5 (Server Sync POC) UI structure complete
- Step 0: Project Setup with New/Existing project selection (276 lines)
- Step 1: Discovery with 3 categories, 6 submodules (116 lines)
- Shared components: CategoryCardGrid, SubmodulePanel, StepSummary, StepApprovalFooter
- Zustand stores: appStore, panelStore, discoveryStore, pipelineStore
- API client prepared (142 lines), TanStack Query integration next
- Pixel-perfect visual replication of Alpine.js UI
- Full TypeScript coverage, strict mode, no `any` types

**Key Decisions:**
- Shared components first strategy - accelerates Steps 2-10
- Server-as-truth pattern - Zustand for UI state only
- Type consolidation in `src/types/step.ts`
- Visual replication approach - no design decisions during migration

**Timeline Revision:**
- Original estimate: 26-40 days
- Revised estimate: 20-30 days (ahead of schedule)

**Commit:** 0484d29 - `feat: Add React client with Step 0 and Step 1 implementation`

**Next Session:**
- Install TanStack Query
- Integrate API client with Step 1
- Build Step 2 (Validation)
- Complete Milestone 2 (Panel Behavior Polish)

**Current Phase**: React Migration - Foundation Complete, API Integration Next

---

### Session: 2026-01-28 (Session 6) - Architecture Decisions & Shared Step Context
**Accomplished:**
- Strategic discussion on Step 1 (Discovery) architecture
- Decided: Upload happens INSIDE each submodule (no separate upload step)
- Designed shared step context: CSV uploaded in one submodule available to others in same step
- Clarified scope: sharing ONLY within same step/run/project (not across)
- Critical review by brutal-critic agent, addressed concerns
- Created `docs/ARCHITECTURE_DECISIONS.md` with full decision summary
- Updated PROJECT_STATUS.md, ROADMAP.md with new architecture

**Key Decisions:**
- Step 0: Project Start
- Step 1: Discovery (upload inside submodules)
- Step 2: Validation/Dedupe (handles deduplication)
- Shared step context with priority: local upload > shared context > prompt user
- Entity schema: freeform in Step 1, contextual validation in Step 2+
- Duplicate detection: multiple identifiers (name, website, linkedin, etc.)

**Files Created:**
- `docs/ARCHITECTURE_DECISIONS.md` - Full architecture decision document

**Current Phase**: Architecture finalized, ready for implementation

### Session: 2026-01-28 (Session 5) - Per-Submodule Execution & Approval Workflow
**Accomplished:**
- New `/api/submodules` endpoints for individual submodule execution
- `submodule_runs` table for tracking executions with results
- Frontend UI in Pipeline Monitor → Run Details → Entity → Stage
- Fixed URL-to-entity association bug (was broadcasting to all entities)
- Added run_id validation and idempotency checks
- CTO review identified remaining issues (race condition, pagination)

**Known Issues (Not Fixed):**
- Race condition on concurrent approvals (needs optimistic locking)
- Frontend context stale when viewing existing runs
- No pagination for large result sets

**Files Created:**
- `routes/submodules.js` - Submodule execution API
- `sql/add_submodule_runs.sql` - Database migration
- `docs/SESSION_2026-01-28_Submodule_Approval.md` - Full session doc

**Current Phase**: Phase 1.6 (Web Dashboard) — Per-submodule execution added, UI needs polish

### Session: 2026-01-26 (Session 4) - Dashboard Bug Fixes & Approval Gate System
**Accomplished:**
- Fixed Step 0 UI bugs (removed $root prefixes, fixed demo mode API calls)
- Installed Redis locally, created .env with Supabase credentials
- Implemented approval gate system (stages pause for manual approval)
- Added View Results button to display real output_data from database
- Added awaiting_approval and approved status badges

**Current Phase**: Phase 1.6 (Web Dashboard) — Approval gates and results viewing added

### Session: 2026-01-25 (Evening) - Dashboard UI Complete
**Accomplished:**
- Implemented card-based UI for ALL 12 pipeline steps (0-11)
- Created slide-in results panel from left side with smooth animation
- Connected all submodule rows to results panel (click to view details)
- Added context-aware mock data generator for different submodule types
- Complete UI scaffold ready for API integration

**Current Phase**: Phase 1.6 (Web Dashboard) — UI COMPLETE, pending API integration

### Session: 2026-01-25 - Module/Submodule Architecture Implementation
**Accomplished:**
- Implemented config-driven discovery module with cascading phases
- Created 4 discovery submodules: sitemap, navigation, seed-expansion, search-google
- Renamed `methods/` to `submodules/` for consistent terminology
- Updated dashboard UI with Phase Editor for configuring submodule cascades
- Created SQL schema for pipeline_entities and discovered_urls tables
- Updated all documentation with naming convention

**Current Phase**: Phase 1.5 (BullMQ Workers) — IN PROGRESS

### Session: 2026-01-24 - Documentation Alignment Complete
**Accomplished:**
- All 8 project documents updated to reflect universal tag-based content library architecture
- Schema finalized and documented: content_items (universal), platform_tags (~299 tags from `/OnlyiGaming/tags/`), content_tags (UUID FK), projects, pipeline_templates, pipeline_runs, pipeline_stages
- Technical documentation aligned: architecture specs, worker interface, conflict resolution strategy, retention policy
- Workflow document finalized: Full_Workflow_Document_With_Intro_Formatted_v3.md
- Progress checkpoint marked: Schema finalized, documentation complete, ready for implementation

**Current Phase**: Phase 1.2 (Create Supabase Tables) — READY TO START

---

## Strategic Direction

**The Goal**: Build a universal content intelligence platform where all content lives in ONE table (content_items), organized by a ~299 tag taxonomy (7 dimensions), and is reusable across projects (news, company profiles, podcasts, competitor analysis).

**Tag Source of Truth**: `/OnlyiGaming/tags/` — Shared atom documents that define all tags. News-Section, SEO, Directory, and Career projects all reference this same source.

**Key Innovation**: Scrape once, tag, reuse everywhere. A scraped page about a company can serve as source material for a company profile, a news article, a competitor analysis, or a personal bio — all through tag-based discovery.

**Infrastructure Layer = Content-Type-Agnostic**:
- content_items + platform_tags + content_tags (universal content library)
- pipeline_templates (configurable per project_type)
- BullMQ workers (dynamic operation loading)
- Express API (generic project management)

**Content Types = Configuration, Not Code**:
- Each content type registers a pipeline_template
- Operations loaded dynamically based on template config
- No code branches per content type

---

## Current State

**Infrastructure**: FULLY OPERATIONAL (Hetzner VPS, Redis 7.0.15, Node.js 20.20.0)
**Schema Design**: FINALIZED (content_items, platform_tags, content_tags, projects, pipeline_templates, pipeline_runs, pipeline_stages)
**Application Code**: ZERO — All work ahead is implementation
**Blockers**: NONE

---

## Phase 1: Universal Platform Foundation
**Status**: Schema finalized, implementation next | **Priority**: P0 — Critical Path

### 1.0: Server Infrastructure
**Status**: COMPLETE

- [x] Hetzner CX22 VPS provisioned (188.245.110.34)
- [x] Redis 7.0.15 installed and configured
- [x] Node.js 20.20.0 installed
- [x] Core dependencies: express, bullmq, @supabase/supabase-js, dotenv, cors

### 1.1: Schema Design
**Status**: FINALIZED

- [x] Designed content_items universal table with content_type discriminator
- [x] Designed platform_tags taxonomy (~299 tags across 7 dimensions, UUID PK)
- [x] Designed content_tags junction (UUID FK, confidence, source)
- [x] Designed pipeline tables (projects, templates, runs, stages)
- [x] Defined conflict resolution (latest scrape wins + version column)
- [x] Defined tiered retention (7-day body purge for filtered content)
- [x] Stress-tested by critic agent, applied 3 critical fixes

### 1.2: Create Supabase Tables
**Status**: Not Started | **Dependencies**: 1.1 (COMPLETE)

- [ ] Execute CREATE TABLE statements for all 7 tables
- [ ] Create partial unique index on content_items(source_url)
- [ ] Create indexes: content_type, tag_code, dimension
- [ ] Create GIN index on content JSONB for search
- [ ] Verify FK constraints and CASCADE behavior
- [ ] Test INSERT ON CONFLICT resolution logic

**Success Criteria**: All tables exist, conflict resolution works, indexes perform

### 1.3: Seed Tag Taxonomy
**Status**: Not Started | **Dependencies**: 1.2

- [ ] Load ~299 tags from `/OnlyiGaming/tags/` atom documents into platform_tags:
  - `dir-categories.md` (81 DIR tags)
  - `news-topics.md` (45 NEWS tags)
  - `geo-registry.md` (~115 GEO tags)
  - `prod-verticals.md` (10 PROD tags)
  - `type-formats.md` (16 TYPE tags)
  - `comm-status.md` (4 COMM tags)
  - `career-categories.md` (28 CAREER tags)
- [ ] Add SYSTEM dimension tags (entity:company, entity:person, content-type:*, source:*)
- [ ] Verify tag_code uniqueness and dimension categorization
- [ ] Create tag lookup utility function

**Success Criteria**: All tags loaded from shared source, queryable by dimension and tag_code

### 1.4: Express API Server
**Status**: Not Started | **Dependencies**: 1.2

**Generic Platform Endpoints**:
- [ ] POST /api/projects (create project with any project_type)
- [ ] GET /api/projects (list/filter by project_type, status)
- [ ] GET /api/projects/:id (details with run history)
- [ ] POST /api/projects/:id/start (trigger pipeline run)
- [ ] GET /api/content (search content_items by tags, content_type, status)
- [ ] GET /api/content/:id (single content item with tags)
- [ ] GET /api/tags (list platform_tags by dimension)
- [ ] POST /api/templates (create/update pipeline_template)
- [ ] GET /api/runs/:id/stages (pipeline run progress)
- [ ] WebSocket /ws (real-time pipeline updates)

**Infrastructure**:
- [ ] Express server with CORS, body-parser
- [ ] Supabase client initialization
- [ ] Redis connection verification
- [ ] Health check endpoint
- [ ] Error handling middleware
- [ ] Graceful shutdown

**Success Criteria**: API can manage projects, query content library, start pipelines

### 1.5: BullMQ Workers (Generic)
**Status**: IN PROGRESS | **Dependencies**: 1.4

- [x] Create generic worker that reads pipeline_template for project_type
- [x] Implement dynamic module loader
- [x] Connect BullMQ events to WebSocket broadcasts
- [x] Implement retry logic per module (configurable in template)
- [x] Progress tracking (stage-level granularity)
- [x] Error handling: mark stage failed, log error JSONB
- [x] Discovery module with config-driven phases
- [x] Four discovery submodules: sitemap, navigation, seed-expansion, search-google
- [ ] Test end-to-end with real entities
- [ ] Implement remaining step modules (validation, extraction, generation)

**Module Interface**:
```javascript
module.exports = {
  name: 'discovery',
  async execute(input, config, context) {
    // config.phases defines which submodules to run
    // Loads submodules dynamically from modules/submodules/{type}/
    // Returns: { output_data: { stats }, content_items_created: [] }
  }
};
```

**Submodule Interface**:
```javascript
module.exports = {
  name: 'sitemap',
  type: 'discovery',
  cost: 'cheap',
  async execute(entities, config, context) {
    // Pure function - returns results, no DB writes
    return [{ entity_id, url, metadata }];
  }
};
```

**Success Criteria**: Worker loads template, executes modules with phase/submodule cascade, writes results to database

### 1.6: Web Dashboard (Alpine.js - Maintained)
**Status**: COMPLETE (Alpine.js version) | **Dependencies**: 1.4

- [x] Project creation form (select project_type, configure)
- [x] Project list with status, filtering by type
- [x] Pipeline run viewer (stage progress, results)
- [x] Real-time updates via WebSocket
- [x] **Phase Editor** for configuring submodule cascades
- [x] **Card-based UI for all 12 steps** (0-11) with category cards and submodule toggles
- [x] **Slide-in results panel** from left with animation, stats, result lists
- [x] **Context-aware mock data** for all submodule types
- [x] **Approval gate system** (pause at each stage, approve to continue)
- [x] **View Results button** on step headers (shows real output_data)
- [x] **Status badges** for awaiting_approval and approved states

**Success Criteria**: ✅ Alpine.js dashboard fully functional (production)

### 1.7: React UI Migration (New)
**Status**: IN PROGRESS - Milestones 1 & 1.5 Complete | **Dependencies**: 1.6 (Alpine as reference)

**Migration Goal**: Pixel-perfect visual replication with architectural rebuild (server-as-truth pattern)

**Milestone Progress:**

| Milestone | Status | Duration | Completion |
|-----------|--------|----------|------------|
| 1: Step 0 POC | ✅ COMPLETE | 1 day | 2026-02-02 |
| 1.5: Server Sync POC | ✅ UI COMPLETE | 1 day | 2026-02-02 |
| 2: Panel Behavior | ⚠️ MOSTLY DONE | - | Panel system built |
| 3: Step 1 Complete | ⚠️ NEEDS API | - | UI done, API next |
| 4: Steps 2-10 | ⏳ NOT STARTED | 10-15 days | TBD |
| 5: Integration & QA | ⏳ NOT STARTED | 5-7 days | TBD |

**Completed Tasks:**
- [x] Vite + React + TypeScript + Tailwind setup (36 files, 6,441 lines)
- [x] Step 0: Project Setup component (276 lines)
- [x] Step 1: Discovery component (116 lines)
- [x] Shared components: CategoryCardGrid, SubmodulePanel, StepSummary, StepApprovalFooter
- [x] Zustand stores: appStore, panelStore, discoveryStore, pipelineStore
- [x] API client structure prepared (142 lines)
- [x] Full TypeScript type system
- [x] Visual parity with Alpine.js confirmed

**In Progress:**
- [ ] TanStack Query integration
- [ ] API client connection (Step 1 Discovery)
- [ ] Loading/error states
- [ ] WebSocket → Query invalidation

**Not Started:**
- [ ] Step 2: Validation
- [ ] Steps 3-10
- [ ] Demo/Live mode toggle
- [ ] Content library browser
- [ ] Full end-to-end testing

**Timeline:** 20-30 days remaining (revised from 26-40 days)

**Success Criteria**:
- Visual screenshot comparison shows identical UI
- All 11 steps functional
- Server-as-truth pattern working
- No Alpine.js code remains
- Production-ready React app

---

## Phase 2: Company Profile Content Type (Proves Platform)
**Status**: Not Started | **Priority**: P0 | **Dependencies**: Phase 1 complete

### 2.1: Company Profile Pipeline Template
- [ ] Create pipeline_template for project_type = 'company_profile'
- [ ] Define stages: discovery → validation → scraping → filtering → generation → QA → routing → packaging
- [ ] Configure operations per stage with parameters
- [ ] Set quality thresholds (90% URL, 70% scrape, 90% QA)

### 2.2: Company Profile Operations
- [ ] `url-discovery`: sitemap, navigation, seed expansion → writes URLs to content_items (type: 'scraped_page', status: 'pending')
- [ ] `url-validation`: HTTP check, content-type check → marks invalid as filtered_step3
- [ ] `content-scrape`: Cheerio/Playwright → writes content JSONB to content_items
- [ ] `content-filter`: dedup, too_short, irrelevant → marks as filtered_step5
- [ ] `profile-generate`: LLM generation from content_items → writes generated_article
- [ ] `profile-qa`: fact check, structure validation → pass/fail score
- [ ] `profile-package`: MD, JSON, HTML output bundling

**All operations tag content automatically** (entity:company:{name}, DIR-*, PROD-*, etc.)

### 2.3: End-to-End Test
- [ ] Upload 6 test companies
- [ ] Run full pipeline
- [ ] Verify content_items populated with tags
- [ ] Verify content reuse: same scraped page serves multiple projects
- [ ] Reproduce 77 URLs from POC

---

## Phase 3: News Content Type (Business Need)
**Status**: Not Started | **Priority**: P1 | **Dependencies**: Phase 2 complete

### 3.1: News Pipeline Template
- [ ] Create pipeline_template for project_type = 'news_article'
- [ ] Stages: topic-discovery → source-validation → content-extract → article-generate → article-qa → article-package

### 3.2: News Operations
- [ ] `topic-discovery`: RSS feeds, Google News, industry sources
- [ ] `source-validation`: domain authority, credibility check
- [ ] `content-extract`: key facts, quotes, data points → content_items
- [ ] `article-generate`: LLM article from extracted content
- [ ] `article-qa`: fact-check, SEO compliance, readability
- [ ] `article-package`: HTML, meta tags, featured image

**Content Reuse**: News operations can discover and use existing content_items (already scraped company pages, previous articles on same topic)

### 3.3: Batch Test
- [ ] Generate 10 news articles across different categories
- [ ] Verify cross-project content reuse (news using company scraped data)

---

## Phase 4: Podcast/Media Content Type (Business Need)
**Status**: Not Started | **Priority**: P1 | **Dependencies**: Phase 3 complete

### 4.1: Podcast Pipeline Template
- [ ] Stages: metadata-extract → transcript-generate → summary-generate → page-generate → page-qa → page-package

### 4.2: Podcast Operations
- [ ] `metadata-extract`: RSS, Spotify, Apple Podcasts
- [ ] `transcript-generate`: Whisper API
- [ ] `summary-generate`: episode summary, key takeaways
- [ ] `page-generate`: landing page with episode list
- [ ] `page-qa`: completeness, link validation
- [ ] `page-package`: HTML, assets, meta tags

---

## Phase 5: Registration Self-Service
**Status**: Not Started | **Priority**: P2 | **Dependencies**: Phase 2 complete

- [ ] Public registration form
- [ ] Triggers company_profile pipeline
- [ ] Moderation queue (auto-generate, admin approval)
- [ ] Rate limiting, CAPTCHA, abuse prevention

---

## Phase 6: Advanced Features
**Status**: Not Started | **Priority**: P3

- [ ] Visual pipeline designer (drag-and-drop stages)
- [ ] Multi-project parallel processing
- [ ] Cost tracking per operation
- [ ] Advanced monitoring and alerting
- [ ] Additional content types (events, consultants, reviews)
- [ ] Multi-language support

---

## Dependencies Map

```
Phase 1 (Platform Foundation)
├── 1.2 Create Supabase Tables (depends on 1.1 COMPLETE)
├── 1.3 Seed Tag Taxonomy (depends on 1.2)
├── 1.4 Express API Server (depends on 1.2)
├── 1.5 BullMQ Workers (depends on 1.4)
└── 1.6 Web Dashboard (depends on 1.4)

Phase 2 (Company Profiles — proves platform)
├── 2.1 Pipeline Template (depends on Phase 1)
├── 2.2 Operations (depends on 2.1)
└── 2.3 E2E Test (depends on 2.2)

Phase 3 (News — business need)
└── Depends on Phase 2 proving the platform works

Phase 4 (Podcasts — business need)
└── Depends on Phase 3

Phase 5 (Self-Service — medium priority)
└── Depends on Phase 2
```

---

## Backlog (Future Tasks)

Items logged for future implementation, not currently prioritized.

| ID | Task | Context | Added |
|----|------|---------|-------|
| B001 | URL cleanup after scraping | discovered_urls have limited value after Step 3 (Scraping). Add cleanup endpoint or scheduled job to purge old URLs (e.g., DELETE WHERE completed_at < NOW() - 30 days) | 2026-01-30 |
| B002 | Project-level filter customization | Allow fine-tuning path-filter patterns per project. Store custom exclude/include patterns in project settings. UI for adding patterns + "Test URL" feature to see why a URL would be filtered. | 2026-01-30 |
| B003 | Re-run Cascade Invalidate (Option C) | Schema changes for submodule re-run behavior. ALTER TABLE submodule_runs ADD supersedes, superseded_at; ALTER TABLE submodule_result_approvals ADD needs_review, review_reason. See `docs/REACT_MIGRATION_PLAN.md` for full details. | 2026-02-01 |

---

## Success Metrics

### Platform Foundation (Phase 1)
- [ ] All 7 tables exist in Supabase with proper indexes
- [ ] ~299 tags seeded from `/OnlyiGaming/tags/` into platform_tags
- [ ] API can create projects of any type
- [ ] Worker loads templates dynamically
- [ ] Content library queryable by tags
- [ ] Dashboard functional

### Company Profile MVP (Phase 2)
- [ ] Complete profile generated via platform
- [ ] Content stored in content_items with tags
- [ ] 70%+ scraping success, 90%+ QA pass
- [ ] Content reusable by other projects

### Multi-Content-Type (Phase 3-4)
- [ ] News articles generated using shared content library
- [ ] Podcast pages generated
- [ ] Cross-project content reuse verified
- [ ] 3 content types running simultaneously

---

*Document Owner: Claude Opus 4.5*
*Last Major Update: 2026-01-25 — Module/Submodule architecture implemented, Phase Editor added to dashboard*
