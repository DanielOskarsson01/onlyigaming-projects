# Project Status: Universal Content Intelligence Platform

**Last Updated**: 2026-01-28
**Status**: Per-Submodule Execution & Approval Workflow Added — UI Needs Polish
**Strategic Direction**: Entity-based pipeline with per-step isolation

---

## Executive Summary

The Universal Content Intelligence Platform has completed its **infrastructure phase** and **simplified its database schema** for MVP. The platform processes entities (companies, topics) through an 11-step pipeline where each step downloads from the previous step, processes, and uploads results.

**MVP Focus**: Get the pipeline working end-to-end for company profiles. Defer advanced features.

---

## Deferred to Future Phases

The following features were discussed and **explicitly deferred** to keep MVP simple:

| Feature | Why Deferred | When to Add |
|---------|--------------|-------------|
| **Tag-based organization** | Tags are primarily for frontend (News-Section) user experience — search, browse, suggestions. Content-Pipeline just needs to CREATE content, not organize it for discovery. | Phase 2: When publishing to News-Section, tags will be applied. Tag tables (`platform_tags`, `content_tags`) live in News-Section database, not here. |
| **Cross-project content reuse** | "Scrape once, reuse everywhere" adds complexity (versioning, staleness, conflict resolution). Unproven benefit for MVP. | Phase 2: If we find ourselves re-scraping the same URLs, add a shared `scraped_content` cache table with freshness checks. |
| **Universal content_items table** | One table for all content types adds query complexity. MVP only needs company profiles. | Phase 2: Consider consolidation when adding news articles and podcasts. |

**Tag Source of Truth**: `/OnlyiGaming/tags/` — These definitions will be used by News-Section for frontend organization. Content-Pipeline outputs a `tags[]` array on generated content that News-Section will interpret.

**Strategic Principle**: This is a general-purpose content intelligence and creation system — NOT a company profile tool. Company profiles are only the first configured use case.

**Business Needs**:
1. **News site**: Needs new content + continuous updates (HIGH PRIORITY)
2. **Podcast/media pages**: Need to be built with content (HIGH PRIORITY)
3. **Company profiles**: Improve existing 1,400 profiles (one use case among many)
4. **Registration self-service**: Frontend tool for new companies to create profiles

---

## MVP Database Schema (6 Tables)

### Design Principles

1. **Entity-level granularity**: Each company/topic tracked separately through each step
2. **Step isolation**: Each step downloads from previous, processes, uploads to next
3. **Entity snapshots**: Runs freeze entity state to prevent mid-run corruption
4. **Bulk data separation**: Large content in dedicated tables, not JSONB blobs
5. **Observability built-in**: Duration, retry count, worker tracking on every stage

### Core Tables

```sql
-- 1. ENTITIES: Companies, topics, persons being processed
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,  -- 'company', 'topic', 'person'
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS: Batch job definitions
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  project_type TEXT NOT NULL,  -- 'company_profile', 'news_article', 'podcast_page'
  config JSONB DEFAULT '{}',   -- batch_size, concurrency, template overrides
  status TEXT DEFAULT 'created',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_project_status CHECK (status IN ('created', 'running', 'completed', 'failed', 'paused'))
);

-- 3. PIPELINE_RUNS: One execution of a project
CREATE TABLE pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  entities_total INTEGER DEFAULT 0,
  entities_completed INTEGER DEFAULT 0,
  entities_failed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_run_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused'))
);

-- 4. RUN_ENTITIES: Snapshot of entities for this run (prevents mid-run corruption)
CREATE TABLE run_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id),
  entity_snapshot JSONB NOT NULL,  -- frozen copy of entity at run start
  processing_order INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',  -- tracks this entity's overall progress
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(run_id, entity_id),
  CONSTRAINT valid_entity_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped'))
);

-- 5. PIPELINE_STAGES: Per-entity, per-step outputs (THE UPLOAD/DOWNLOAD TABLE)
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  run_entity_id UUID REFERENCES run_entities(id) ON DELETE CASCADE,
  stage_index INTEGER NOT NULL,  -- 0-11
  stage_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  output_data JSONB,  -- step results (keep small, use references for bulk data)
  error JSONB,

  -- Observability
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  worker_id TEXT,
  ai_tokens_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(run_id, run_entity_id, stage_index),
  CONSTRAINT valid_stage_index CHECK (stage_index BETWEEN 0 AND 11),
  CONSTRAINT valid_stage_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped'))
);

CREATE INDEX idx_stages_run_entity ON pipeline_stages(run_id, run_entity_id, stage_index);
CREATE INDEX idx_stages_status ON pipeline_stages(status) WHERE status = 'failed';

-- 6. GENERATED_CONTENT: Final outputs ready for News-Section
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_entity_id UUID REFERENCES run_entities(id),
  output_type TEXT NOT NULL,  -- 'company_profile', 'news_article', 'podcast_summary'
  title TEXT,
  data JSONB NOT NULL,  -- the actual content
  tags TEXT[],  -- tags to be interpreted by News-Section
  quality_score DECIMAL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,  -- when sent to News-Section
  CONSTRAINT valid_output_type CHECK (output_type IN ('company_profile', 'news_article', 'podcast_summary'))
);

CREATE INDEX idx_content_type ON generated_content(output_type);
CREATE INDEX idx_content_published ON generated_content(published_at) WHERE published_at IS NULL;
```

### Intermediate Data Tables (for bulk content)

```sql
-- Step 2 outputs: URLs discovered per entity
CREATE TABLE discovered_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_entity_id UUID REFERENCES run_entities(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  discovery_method TEXT,  -- 'sitemap', 'navigation', 'seed_expansion', 'search'
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',  -- 'pending', 'scraped', 'filtered', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_urls_entity ON discovered_urls(run_entity_id, status);

-- Step 4 outputs: Scraped page content (too large for JSONB in pipeline_stages)
CREATE TABLE scraped_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_entity_id UUID REFERENCES run_entities(id) ON DELETE CASCADE,
  discovered_url_id UUID REFERENCES discovered_urls(id),
  url TEXT NOT NULL,
  content_type TEXT,  -- 'html', 'json', 'text'
  raw_content TEXT,  -- actual HTML/content (can be large)
  extracted_data JSONB,  -- structured extraction results
  word_count INTEGER,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pages_entity ON scraped_pages(run_entity_id);
```

### How Steps Use These Tables

```
STEP 1 (Input):
  → Parse CSV/URLs/text
  → Create entities
  → Create run_entities (snapshots)
  → Insert pipeline_stages rows (stage_index=1)

STEP 2 (Discovery):
  → SELECT FROM pipeline_stages WHERE stage_index=1 AND run_entity_id=X
  → Discover URLs
  → INSERT INTO discovered_urls (bulk data)
  → INSERT INTO pipeline_stages (stage_index=2, output_data={urls_count: 50})

STEP 3 (Validation):
  → SELECT FROM discovered_urls WHERE run_entity_id=X
  → Validate, filter bad URLs
  → UPDATE discovered_urls SET status='filtered' for bad ones
  → INSERT INTO pipeline_stages (stage_index=3, output_data={passed: 30, filtered: 20})

STEP 4 (Extraction):
  → SELECT FROM discovered_urls WHERE status='pending'
  → Scrape each URL
  → INSERT INTO scraped_pages (bulk content)
  → INSERT INTO pipeline_stages (stage_index=4)

... continues through STEP 11 ...

STEP 11 (Final):
  → Read all processed data
  → INSERT INTO generated_content (final output with tags[])
  → INSERT INTO pipeline_stages (stage_index=11, status='completed')
```

### Key Design Decisions

1. **Entity Snapshots**: `run_entities.entity_snapshot` freezes entity state at run start. Prevents corruption if entity is updated mid-run.

2. **Bulk Data Separation**: Large content (scraped HTML) goes in `scraped_pages`, not `pipeline_stages.output_data`. Keeps JSONB small and queries fast.

3. **Observability Built-in**: Every stage tracks `duration_ms`, `retry_count`, `worker_id`, `ai_tokens_used` for debugging and cost tracking.

4. **Constraints Enforced**: Status enums, stage_index range (0-11), unique constraints prevent bad data.

5. **Resume/Retry Ready**: Query failed entities with `SELECT * FROM pipeline_stages WHERE status='failed'` and retry individually.

6. **Timeout Tracking**: Per-step timeouts configured in `projects.config`:
   ```json
   {
     "timeouts": {
       "step_default_ms": 300000,
       "step_4_scrape_ms": 600000,
       "step_6_generation_ms": 900000
     }
   }
   ```

7. **Empty Results Handling**: If a step filters 100% of items (e.g., all URLs fail validation), mark entity as `skipped` with reason in `error` JSONB, proceed to next entity.

8. **Duplicate Prevention**: Step 1 submodule validates CSV for duplicate names before creating entities. Rejects upload if duplicates found.

---

## Naming Convention

| Term | Definition | Location |
|------|------------|----------|
| **Step** | One of 12 pipeline stages (0-11) | UI, templates |
| **Module** | Operation code that executes a step | `modules/operations/` |
| **Phase** | Configured group of submodules within a module | `config.phases[]` |
| **Submodule** | Single-task unit within a module | `modules/submodules/{type}/` |

---

## Current State

### What's Done

**Infrastructure (COMPLETE)**:
- Hetzner CX22 VPS provisioned (IP: 188.245.110.34)
- Ubuntu 24.04.3 LTS, Node.js 20.20.0, Redis 7.0.15
- SSH key authentication working (~/.ssh/hetzner_key)
- Core dependencies installed: express, bullmq, @supabase/supabase-js, dotenv, cors, jsdom, xml2js

**Schema Design (REDESIGNED FOR MVP)**:
- 6 core tables: entities, projects, pipeline_runs, run_entities, pipeline_stages, generated_content
- 2 intermediate tables: discovered_urls, scraped_pages (for bulk data)
- Entity-level granularity (each company tracked separately through steps)
- Entity snapshots prevent mid-run corruption
- Observability built-in (duration, retry_count, worker_id, tokens)
- Constraints enforced (status enums, stage_index 0-11, unique keys)
- Tags deferred to Phase 2 (frontend concern, not pipeline concern)

**Module/Submodule Architecture (IMPLEMENTED)**:
- Discovery module with config-driven cascade phases
- Four discovery submodules: sitemap, navigation, seed-expansion, search-google
- Dashboard UI with Phase Editor for configuring cascades
- Submodule template for creating new submodules

**Proof of Concept (Company Profile POC)**:
- Steps 1-2 tested: CSV upload, URL discovery (77 URLs across 6 companies)
- NOTE: This was infrastructure testing, not final architecture

### What's NOT Done

**Remaining Work**:
1. ~~Create 8 Supabase tables (schema above)~~ ✅ DONE
2. ~~Build Express API server~~ ✅ DONE
3. ~~Build BullMQ workers~~ ✅ DONE (entity-level processing)
4. Connect dashboard to live API
5. Implement step modules (validation, extraction, generation, etc.)
6. (Phase 2) Add tag infrastructure when publishing to News-Section

---

## Highest Priority: Create Schema & Build Platform

### Step 1: Create Supabase Schema
- Execute SQL above to create all 8 tables (6 core + 2 intermediate)
- Indexes already defined in schema (run_entity, status, etc.)

### Step 2: Express API Server
- Generic project management (POST /api/projects with any project_type)
- Content library endpoints (GET /api/content?tags=DIR-029,NEWS-015)
- Pipeline control (POST /api/projects/:id/start)
- WebSocket for real-time updates

### Step 3: BullMQ Workers
- Dynamic operation loading based on pipeline_templates
- Each operation reads from / writes to content_items
- Tags applied automatically based on operation config
- Progress tracking via WebSocket

### Step 4: Web Dashboard
- Content type selector
- Project creation (news, company, podcast)
- Content library browser (search by tags)
- Real-time pipeline monitoring

---

## Phase Breakdown

### Phase 1: MVP Platform Foundation
**Status**: API Complete, Dashboard Connection Next | **Priority**: P0

| Task | Status | Priority |
|------|--------|----------|
| 1.0 Server Infrastructure | COMPLETE | P0 |
| 1.1 Schema Design | COMPLETE | P0 |
| 1.2 Create Supabase Tables (8 tables) | COMPLETE | P0 |
| 1.3 Express API Server | COMPLETE | P0 |
| 1.4 BullMQ Workers (Entity-Level) | COMPLETE | P0 |
| 1.5 Web Dashboard (connect to live API) | Not Started | P0 |

### Phase 2: First Content Type (Company Profiles — proves platform)
**Status**: Not Started | **Priority**: P0

| Task | Status | Dependency |
|------|--------|------------|
| 2.1 Company Profile pipeline_template | Not Started | Phase 1 |
| 2.2 Company Profile operations | Not Started | 2.1 |
| 2.3 End-to-End test (6 companies) | Not Started | 2.2 |

### Phase 3: News Content Type (Business Need)
**Status**: Not Started | **Priority**: P1

### Phase 4: Podcast/Media Content Type (Business Need)
**Status**: Not Started | **Priority**: P1

### Phase 5: Registration Self-Service
**Status**: Not Started | **Priority**: P2

---

## Quick Reference

**Server Access**:
```bash
ssh -i ~/.ssh/hetzner_key root@188.245.110.34
```

**Redis**: 127.0.0.1:6379 (password: Danne2025)

**Supabase**: https://fevxvwqjhndetktujeuu.supabase.co

**Project Path**: `/opt/content-pipeline/` (new universal platform)

**New Tables**: entities, projects, pipeline_runs, run_entities, pipeline_stages, generated_content, discovered_urls, scraped_pages

**Legacy Tables** (preserve): companies, discovery_links, content_raw, content_json_draft

---

## Session Log

### Session: 2026-01-26 (Session 4) - Dashboard Bug Fixes & Approval Gate System

**Accomplished:**

1. **Step 0 UI Bug Fix**:
   - Removed `$root` prefixes causing Alpine.js scoping issues
   - Fixed `createAndSelectProject()` to check `useMockData` before API calls

2. **Local Development Setup**:
   - Installed Redis locally for BullMQ workers
   - Created `.env` file with Supabase credentials

3. **Approval Gate System**:
   - Modified `orchestrator.js` `queueNextStage()` to pause with 'awaiting_approval' status
   - Added `approveStage()` method to orchestrator
   - Added API endpoints: `POST /api/runs/:id/stages/:stageIndex/approve`, `GET /api/runs/:id/awaiting-approval`
   - Wired up UI "Approve & Continue" button
   - Added `awaiting_approval` and `approved` status styling

4. **View Results Feature**:
   - Added "View Results" button to step headers
   - Implemented `openStageResultsPanel()` and `extractResultItems()` functions
   - Displays real `output_data` from database in slide-in panel

**Files Modified:**
- `public/index.html` — UI fixes, View Results, Approve buttons, status badges
- `services/orchestrator.js` — Approval gate logic
- `routes/runs.js` — New approval API endpoints
- `.env` — Created with credentials

**Updated by:** Claude Opus 4.5 (session-closer)

---

### Session: 2026-01-26 (Session 3) - Step 0 Dashboard Bug Fix

**Root Cause Identified:**
- The Hetzner server (`188.245.110.34`) was running an **outdated version** of `public/index.html`
- Server had OLD Step 0 UI with local x-data (projectName, projectDescription, projectType, projectTags)
- Local codebase had NEW Step 0 UI with radio buttons (New/Existing) and `step0Mode` state variable
- The local code was never deployed to the server

**Fix Applied:**
1. Deployed updated `public/index.html` to `/opt/content-pipeline/public/` on Hetzner
2. Restarted `content-pipeline-api` PM2 process

**New Step 0 UI Features:**
- Radio button toggle: "New Project" / "Existing Project"
- New Project mode: Enter name → Create button
- Existing Project mode: Dropdown to select from existing projects
- Active project confirmation box with green styling

**Verified Working:**
- Server now has matching code with `x-show="i === 0"` and radio button UI
- PM2 shows `content-pipeline-api` online with PID 115214

**Updated by:** Claude Opus 4.5

---

### Session: 2026-01-26 (Session 2) - SQL Migration & Dashboard Debugging

**Accomplished:**
1. **SQL Migration Completed** — User ran the templates table migration in Supabase

**Known Issues Identified:**
- **Step 0 Dashboard UI Issue** — Project creation flow not working as expected:
  - User reports clicking "+ New Project" doesn't show input fields
  - The code appears correct but there may be browser caching or Alpine.js initialization issues
  - Original Step 0 fields (description, project type, tags) were replaced with new project selection UI

**Files Modified This Session:**
- `sql/simplify_schema.sql` — Templates table DDL (user ran this)
- `services/templateService.js` — Created
- `routes/templates.js` — Created
- `routes/projects.js` — Updated for template support
- `public/index.html` — Step 0 UI refactored (may need debugging)

**Issues Fixed in Session 3:**
- ✅ Debug Step 0 accordion — FIXED: Server had outdated code, deployed new version
- ✅ Check Alpine.js binding or browser cache issues — FIXED: Was a deployment issue, not code issue

**Updated by:** Claude Opus 4.5

---

### Session: 2026-01-26 (Session 1) - Simplified Project/Template Architecture & Dashboard UI Refactoring

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

**Architecture Changes:**

| Aspect | Before | After |
|--------|--------|-------|
| Project creation | Popup modal | Inline in Step 0 accordion |
| Template support | None | Projects can reference templates |
| Stage configuration | Fixed in project config | Can be overridden from templates |
| View management | Project list always visible | Project list hides when accordion shows |

**Pending Items (User Action Required):**
1. Run SQL migration in Supabase SQL Editor to create `templates` table
2. Hard refresh browser (Ctrl+F5 / Cmd+Shift+R) to see UI changes

**Next Session:**
- Test end-to-end with templates
- Add template selector to UI
- Implement template-based project creation workflow

**Updated by:** Claude Opus 4.5

---

### Session: 2026-01-25 (Late Night) - Express API Server & Entity-Level Workers Complete

**Accomplished:**
- Completed Task 1.3 (Express API Server) and Task 1.4 (BullMQ Workers)
- Migrated from old schema (content_items, platform_tags, pipeline_templates) to new entity-level schema
- Implemented entity-level job processing (1 job per entity per step, not batch-level)

**Files Deleted (obsolete code referencing old schema):**
- `routes/content.js` — queried content_items
- `routes/tags.js` — queried platform_tags
- `routes/templates.js` — queried pipeline_templates
- `services/contentLibrary.js` — all methods obsolete
- `services/tagService.js` — all methods obsolete

**Files Created:**
- `services/entityService.js` — Entity CRUD operations
- `routes/entities.js` — Entity API endpoints (GET/POST/PATCH/DELETE)
- `routes/generated-content.js` — Content query endpoints with tag filtering

**Files Rewritten/Modified:**
- `services/orchestrator.js` — Complete rewrite for entity-level processing:
  - `startRun(projectId, entityIds)` — Creates run + run_entities with snapshots + pipeline_stages
  - `queueNextStage(runId, runEntityId, ...)` — Entity-aware stage chaining
  - `pauseRun()`, `resumeRun()`, `retryFailed()` — Run control methods
  - `failEntity()`, `updateRunProgress()` — Entity-level status tracking
- `workers/stageWorker.js` — Entity-level job processing:
  - Receives `runEntityId` and `entitySnapshot` in job data
  - Populates observability columns: `duration_ms`, `retry_count`, `worker_id`, `ai_tokens_used`
  - Calls `orchestrator.failEntity()` on failure (not `failRun()`)
- `routes/runs.js` — Extended with entity endpoints:
  - `GET /api/runs/:id/entities` — List run_entities with progress
  - `GET /api/runs/:id/entities/:entityId` — Single entity with all stages
  - `GET /api/runs/:id/stages` — All stages grouped by entity
  - `PATCH /api/runs/:id` — Pause/resume (`{ action: 'pause'|'resume' }`)
  - `POST /api/runs/:id/retry` — Retry failed entities
  - `GET /api/runs/:id/discovered-urls` — View discovered URLs
  - `GET /api/runs/:id/scraped-pages` — View scraped pages
- `routes/projects.js` — Updated start logic:
  - `POST /api/projects/:id/start` now requires `{ entityIds: [...] }` in body
  - `PATCH /api/projects/:id` — Update project config/name/status
- `modules/operations/discovery.js` — Updated for single-entity processing:
  - Uses `context.runEntityId` and `context.entitySnapshot`
  - Writes to `discovered_urls` with `run_entity_id` (not `entity_id`)
- `server.js` — Route rewiring (removed old, added new)

**Architecture Changes:**

| Aspect | Old | New |
|--------|-----|-----|
| Job granularity | 1 job per step (batch) | 1 job per entity per step |
| Stage config | `pipeline_templates` table | `projects.config.stages` |
| discovered_urls FK | `entity_id` | `run_entity_id` |
| Entity state | Not tracked | `run_entities.entity_snapshot` |
| Observability | None | duration_ms, retry_count, worker_id, ai_tokens_used |
| Failure handling | Fail entire run | Fail single entity, continue others |

**API Endpoints Summary:**

| Resource | Endpoints |
|----------|-----------|
| Entities | `GET/POST /api/entities`, `GET/PATCH/DELETE /api/entities/:id`, `POST /api/entities/bulk` |
| Projects | `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id`, `POST /api/projects/:id/start` |
| Runs | `GET /api/runs`, `GET/PATCH /api/runs/:id`, `POST /api/runs/:id/retry` |
| Run Entities | `GET /api/runs/:id/entities`, `GET /api/runs/:id/entities/:entityId` |
| Run Stages | `GET /api/runs/:id/stages`, `GET /api/runs/:id/discovered-urls`, `GET /api/runs/:id/scraped-pages` |
| Content | `GET /api/content`, `GET/PATCH /api/content/:id`, `POST/DELETE /api/content/:id/publish` |

**Next Session:**
- Deploy to Hetzner server
- Connect dashboard to live API
- Test end-to-end with real entities

---

### Session: 2026-01-25 (Night) - Schema Redesign & Database Migration

**Accomplished:**
- Held strategic discussion on database design (universal tags vs. simplified entity-based)
- Ran brutal-critic review on proposed schema — identified 12 issues
- Made key architectural decisions:
  - Deferred tag-based organization to Phase 2 (frontend concern)
  - Deferred cross-project content reuse to Phase 2 (unproven benefit)
  - Added entity snapshots (`run_entities`) to prevent mid-run corruption
  - Added bulk data tables (`discovered_urls`, `scraped_pages`) to keep JSONB small
  - Added observability columns (`duration_ms`, `retry_count`, `worker_id`, `ai_tokens_used`)
  - Added constraints (status enums, stage_index 0-11, unique keys)
- Documented all deferred decisions in "Deferred to Future Phases" section
- Created SQL migration scripts:
  - `sql/create_tables.sql` — fresh schema
  - `sql/clean_slate.sql` — drop old + create new
  - `sql/migrate_to_new_schema.sql` — rename old, create new
- Executed clean slate migration in Supabase
- Verified 8 tables created successfully

**Schema Changes (Old → New):**

| Old Design | New Design |
|------------|------------|
| `content_items` (universal) | Removed — deferred to Phase 2 |
| `platform_tags`, `content_tags` | Removed — tags as `TEXT[]` field on output |
| `pipeline_stages` (batch-level) | `pipeline_stages` (entity-level with observability) |
| No entity snapshots | `run_entities` with `entity_snapshot` JSONB |
| Bulk data in JSONB | `discovered_urls`, `scraped_pages` tables |

**Tables Created (8 total):**
1. `entities` — companies, topics, persons
2. `projects` — batch job definitions
3. `pipeline_runs` — execution tracking
4. `run_entities` — entity snapshots per run
5. `pipeline_stages` — per-entity, per-step outputs
6. `generated_content` — final outputs with `tags[]`
7. `discovered_urls` — Step 2 bulk output
8. `scraped_pages` — Step 4 bulk content

**Key Design Decisions Documented:**
1. Entity snapshots prevent mid-run corruption
2. Bulk data separation keeps queries fast
3. Observability built into every stage
4. Constraints enforced at database level
5. Resume/retry ready via status queries
6. Timeout tracking via `projects.config`
7. Empty results → mark entity `skipped`
8. Duplicate prevention in Step 1 submodule

**Next Session:**
- Task 1.3: Build Express API Server
- Task 1.4: Build BullMQ Workers

---

### Session: 2026-01-25 (Evening) - Dashboard UI Complete: Card-Based Steps + Slide-in Results Panel
**Accomplished:**
- Implemented card-based UI for ALL 12 pipeline steps (0-11)
- Created slide-in results panel from left side with smooth animation
- Connected all submodule rows to results panel (click to view details)
- Added context-aware mock data generator for different submodule types

**UI Components Built:**

| Step | Cards/Categories Implemented |
|------|------------------------------|
| 0 - Project Setup | Name, Description, Type, Tags |
| 1 - Input | URLs, CSV Upload, Library Import, API Fetch |
| 2 - Discovery | Sitemap, Navigation, Seed Expansion, Search Google |
| 3 - Validation | Domain Trust, URL Status, Content Type, Robots.txt |
| 4 - Extraction | Cheerio, Playwright, Text Only, Custom |
| 5 - Filtering | Dedup, Too Short, Irrelevant, Language |
| 6 - Generation | AI Models (GPT-4, Claude), Generation Types, Auto-tagging, Output Formats |
| 7 - QA | Accuracy Checks, Structure Checks, Quality Scores, SEO Checks |
| 8 - Routing | Quality-Based, Content-Based, Retry Logic, Loop Triggers |
| 9 - Bundling | Output Formats, Metadata, Audit Trail, Assets |
| 10 - Distribution | CMS, API/Database, Storage, Notifications |
| 11 - Review | Review Actions, Post-approval, Notifications, Archive |

**Slide-in Results Panel Features:**
- Animated slide-in from left (CSS transform + transition)
- Backdrop overlay with fade effect
- ESC key to close, backdrop click to close
- Header: icon, title, subtitle (category + cost)
- Status badge (success/warning/error/pending)
- Stats grid (result, duration, cost)
- Results list with status indicators
- Output log section (for verbose results)
- Footer with "View full logs" and Close button

**Key Decisions:**
1. **Card-based submodule organization**: Each step organizes submodules into logical category cards (e.g., Discovery has "Sources" with sitemap, navigation, etc.)
2. **Submodule data structure**: `{ id, name, enabled, cost, description, lastResult }`
3. **Category data structure**: `{ enabled, label, icon, submodules: [...] }`
4. **$root reference pattern**: Nested x-data components access global app state via `$root.openResultsPanel()`
5. **Event isolation**: `@click.stop` on checkboxes prevents triggering row click
6. **Group hover states**: Tailwind's `group` and `group-hover` for "View →" reveal on hover
7. **Context-aware mock data**: `getMockResultItems()` returns different results based on submodule type

**Architecture Impact Analysis:**

| Area | Impact | Details |
|------|--------|---------|
| **Database** | ✅ No changes | UI consumes existing schema. The `pipeline_stages.output_data` JSONB already stores results. Results panel reads this data via API. |
| **BullMQ Workers** | ✅ No changes | Workers write to `pipeline_stages.output_data` as designed. UI reads via `/api/runs/:id` endpoint. |
| **Hetzner Deployment** | ✅ No changes | Static files in `public/` served by Express. No new dependencies. |
| **API Requirements** | ⚠️ Needs implementation | UI expects endpoints: `GET /api/runs/:id/stages/:stageIndex/results` for detailed submodule results. Currently uses mock data. |
| **WebSocket** | ✅ Compatible | Existing WebSocket design broadcasts `stage_update` events. UI subscribes to these. |

**API Endpoint Gap Analysis:**

The UI is built to consume these endpoints (currently mocked):

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `GET /api/runs/:id` | Designed | Run overview with stage list |
| `GET /api/runs/:id/stages/:idx` | Designed | Stage details with output_data |
| `GET /api/runs/:id/stages/:idx/submodules/:name` | **NEW NEEDED** | Individual submodule results for slide-in panel |

**Recommendation:** Add a `submodule_results` JSONB column to `pipeline_stages` OR structure `output_data` to include per-submodule breakdown:

```javascript
// Current: output_data structure (works with existing schema)
{
  total: 77,
  stats: { by_submodule: { sitemap: 42, navigation: 35 } },
  submodule_results: {
    sitemap: { items: [...], duration: '1.2s', errors: [] },
    navigation: { items: [...], duration: '0.8s', errors: [] }
  }
}
```

This is a **documentation/API design clarification**, not a schema change.

### Session: 2026-01-25 - Module/Submodule Architecture Implementation
**Accomplished:**
- Implemented config-driven discovery module with cascading phases
- Created 4 discovery submodules: sitemap, navigation, seed-expansion, search-google
- Renamed `methods/` directory to `submodules/` for consistent terminology
- Updated dashboard UI with Phase Editor for configuring submodule cascades
- Created SQL schema for pipeline_entities and discovered_urls tables
- Updated all documentation to use Step/Module/Phase/Submodule naming convention
- Updated: CLAUDE.md, bullmq_architecture_doc.md, Universal_Content_Pipeline_Architecture.md, PROJECT_STATUS.md

**Key Decisions:**
- **Step** = 12 pipeline stages (0-11) in UI/templates
- **Module** = operation code per step in `modules/operations/`
- **Phase** = configured group of submodules (e.g., "cheap_parallel", "search_fallback")
- **Submodule** = single-task pure function in `modules/submodules/{type}/`

**Architecture Pattern:**
- BullMQ orchestrates between steps (queues modules)
- Modules execute phases based on config
- Phases run submodules (parallel or sequential)
- Single database write at end of each module
- Submodules are pure functions — no DB writes

### Session: 2026-01-24 - Documentation Alignment: All 8 Project Docs Updated
**Accomplished:**
- Updated all 8 project documents to reflect universal tag-based content library architecture
- Finalized schema confirmed across CLAUDE.md, PROJECT_STATUS.md, ROADMAP.md
- Technical docs updated: Universal_Content_Pipeline_Architecture.md (v3.0), bullmq_architecture_doc.md, updated_project_memory.md
- Created Full_Workflow_Document_With_Intro_Formatted_v3.md (replaces v2 .docx)
- Preserved original Full_Workflow_Document v2.docx for historical reference
- Progress checkpoint: Schema finalized, documentation complete, ready for implementation

**Status**: All documentation aligned, no architecture conflicts or ambiguities. All designs stress-tested and approved. Ready to proceed to Phase 1.2.

**Next Steps**:
1. Create 8 Supabase tables (schema in this doc)
2. Build Express API server
3. Build generic BullMQ workers
4. Connect web dashboard to live API
5. Implement company_profile operations
6. (Phase 2) Add tag infrastructure for News-Section publishing

### Session: 2026-01-23 - Schema Finalization & Documentation Update
**Accomplished:**
- Finalized universal content library schema (content_items + tags)
- Applied critic fixes: content_type discriminator, UUID FK, conflict resolution
- Added tiered retention (7-day body purge for filtered content)
- Updated all project documentation to reflect new architecture
- Documented filter steps (3 & 5) and their retention behavior

**Decisions:**
- One universal table, not per-type tables
- Tags as organizing principle (~299 taxonomy in `/OnlyiGaming/tags/` with UUID FK)
- Freshness = flags, not gates
- Latest scrape wins + version column for conflicts
- Configuration-driven pipelines via pipeline_templates

### Session: 2026-01-23 - Strategic Correction & Infrastructure
**Accomplished:**
- Identified company-specific vs. universal platform misalignment
- Resolved SSH access, installed Redis, Node.js, dependencies
- Corrected roadmap and status documents

---

*Document Owner: Claude Opus 4.5*
*Last Major Update: 2026-01-26 — SQL migration complete, Dashboard Step 0 UI needs debugging*
