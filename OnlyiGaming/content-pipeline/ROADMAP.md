# Content Pipeline Project Roadmap

**Last Updated**: 2026-01-25
**Project Status**: Infrastructure Complete — Module/Submodule Architecture Implemented — Ready for Integration Testing
**Architecture**: Tag-based universal content library with config-driven module/submodule cascade

---

## Naming Convention

| Term | Definition | Location |
|------|------------|----------|
| **Step** | One of 12 pipeline stages (0-11) | UI, templates |
| **Module** | Operation code that executes a step | `modules/operations/` |
| **Phase** | Configured group of submodules within a module | `config.phases[]` |
| **Submodule** | Single-task unit within a module | `modules/submodules/{type}/` |

---

## Session Log

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

### 1.6: Web Dashboard
**Status**: IN PROGRESS — Approval Gates & Results Viewing Added | **Dependencies**: 1.4

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
- [ ] Content library browser (search by tags, content_type)
- [ ] Start/stop/retry controls
- [ ] Connect to live API (replace mock data)

**Success Criteria**: Can create any project type, configure phases/submodules, browse content library, monitor pipelines

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
