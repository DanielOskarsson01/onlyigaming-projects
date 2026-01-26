# Content Pipeline Project

## Project Overview
Building a **Universal Content Intelligence & Creation Platform** for the iGaming industry (onlyigaming.com). The system is content-type-agnostic — it processes ANY content type (news articles, company profiles, podcast pages, competitor analysis) through configurable, database-mediated workflows with a shared content library.

**Strategic Principle**: This is a general-purpose content intelligence and creation system — NOT a company profile tool. Company profiles are only the first configured use case.

## Current Status
- **Phase**: Infrastructure complete — Platform development ready
- **Architecture**: Tag-based universal content library with cross-project reuse
- **Server**: Hetzner CX22 VPS fully configured (Redis, Node.js, dependencies)
- **Next**: Create Supabase schema → Express API → BullMQ workers → Dashboard

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
  - **SHARED WITH NEWS-SECTION**: Same taxonomy, same tags, cross-project content reuse
- `content_tags` — Junction table with UUID FK to platform_tags
  - `confidence` score, `source` (manual, auto_llm, auto_rule)

**Pipeline Tables**:
- `projects` — Batch/job definitions with `project_type` discriminator
- `pipeline_templates` — Stage definitions per project type (ordered array of operations)
- `pipeline_runs` — Execution tracking per project
- `pipeline_stages` — Step-level results per run

**Legacy Tables** (preserve): companies, discovery_links, content_raw, content_json_draft

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

## Key Documents

### Technical Documentation (in /docs)
- `Universal_Content_Pipeline_Architecture.md` — System architecture with schema
- `bullmq_architecture_doc.md` — BullMQ implementation spec
- `updated_project_memory.md` — Project history and decisions
- `Raw_Appendix_Content_Creation_Master.md` — Detailed 13-step appendix

### Strategic Documents (in root / Downloads)
- `Strategic_Blueprint_Holistic_Content_Platform.md` — Foundational design rules
- `PROJECT_STATUS.md` — Current status and phase tracking
- `ROADMAP.md` — Development roadmap

## The 11-Step Pipeline (Generic)
1. Input & Scope Definition (entity, topic, intent, scope)
2. Discovery & Raw Collection (content-agnostic across approved sources)
3. Source Validation & Governance (trust, policy, relevance checks — FILTER STEP)
4. Content Extraction (text, media, structured data)
5. Filtering & Adaptive Crawling (dedup, language, adaptive depth — FILTER STEP)
6. Analysis, Classification & Creation (LLM generation)
7. Validation & QA (fact checks, hallucination detection)
8. Routing & Flow Control (conditional routing, retries, loops)
9. Output Bundling (HTML, JSON, metadata — output-agnostic)
10. Distribution (CMS, APIs, exports)
11. Review & Triggers (human approval, rejection, retriggers)

**Filter Steps (3 & 5)**: Content marked as `filtered_step3` or `filtered_step5` with `filter_reason`. Body purged after 7 days, metadata row persists.

## Business Needs (Priority Order)
1. **News site**: Needs new content + continuous updates (HIGH PRIORITY)
2. **Podcast/media pages**: Need to be built with content (HIGH PRIORITY)
3. **Company profiles**: Improve existing 1,400 profiles (one use case among many)
4. **Registration self-service**: Frontend tool for new companies to create profiles

## Immediate Next Actions
1. **Create Supabase schema**: content_items, platform_tags, content_tags, projects, pipeline_templates, pipeline_runs, pipeline_stages
2. **Seed platform_tags**: Load 352+ tag taxonomy into platform_tags table
3. **Build Express API**: Generic project management + content library endpoints
4. **Implement BullMQ Workers**: Dynamic operation loading based on pipeline_templates
5. **Build Dashboard**: Content type selector, project creation, real-time monitoring

## Technical Specifications

**Server**: Hetzner CX22 (2 vCPU, 4GB RAM, 40GB disk, Ubuntu 24.04.3 LTS)
- IP: 188.245.110.34
- SSH: `ssh -i ~/.ssh/hetzner_key root@188.245.110.34`
- Node.js: 20.20.0 (npm 10.8.2)
- Redis: 7.0.15 (password: Danne2025)

**Supabase**:
- URL: https://fevxvwqjhndetktujeuu.supabase.co
- New tables: content_items, platform_tags, content_tags, projects, pipeline_templates, pipeline_runs, pipeline_stages
- Legacy tables (preserve): companies, discovery_links, content_raw, content_json_draft

**Project Path**: `/opt/content-pipeline/` (new universal platform)

## READ FIRST: Global Agent Instructions

**🌐 [Global Agent Instructions](file:///Users/danieloskarsson/Dropbox/Projects/GLOBAL_AGENT_INSTRUCTIONS.md)** - Apply to ALL projects

This project inherits global standards for:
- Model selection & escalation (3-Round Rule, visual analysis, user requests)
- Communication standards (honesty, no time estimates, respect user knowledge)
- Quality standards (security, avoid over-engineering)
- Tool usage best practices
- Documentation requirements

---

## CRITICAL: Model Selection Policy (Project-Specific Context)

**Applies to Content Pipeline - supplements global policy**

### Automatic Escalation to Opus 4.5
Escalate to Opus 4.5 immediately if ANY of these occur:
- ✋ **3-Round Rule**: Same issue discussed 3+ times without resolution
- ✋ **Visual Analysis**: Screenshot comparison, character recognition, terminal output verification
- ✋ **Complex Debugging**: Non-obvious issues, multi-session problems
- ✋ **User Frustration**: "This isn't working", "We tried this already", "How many times..."
- ✋ **User Request**: User asks for Opus - comply immediately, no pushback

**Lesson Learned (2026-01-23)**: Sonnet 4.5 made repeated visual recognition errors for 5 hours during SSH debugging. Opus 4.5 solved it in 5 minutes. **User time >> model cost difference.**

See [MODEL_SELECTION_POLICY.md](file:///Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/Content-Pipeline/MODEL_SELECTION_POLICY.md) and [LESSONS_LEARNED.md](file:///Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/Content-Pipeline/LESSONS_LEARNED.md) for details.

---

## Agent-Specific Notes

**Multi-Agent Architecture Considerations**:

This pipeline is designed for agent-based development and operation:

1. **Modular Agent Roles**: Each pipeline operation can be implemented as a specialized agent
   - Discovery Agent: URL sourcing and sitemap parsing → writes to content_items with tags
   - Scraping Agent: Content extraction → writes to content_items with content JSONB
   - Generation Agent: LLM-based content creation → writes generated_article to content_items
   - QA Agent: Validation and fact-checking → updates quality_score
   - Routing Agent: Decision-making for pass/fail workflows

2. **Agent Communication**: Database-mediated via Supabase content library
   - Each agent reads from content_items by querying tags
   - Each agent writes output to content_items with appropriate tags
   - No direct agent-to-agent communication required
   - BullMQ orchestrates agent invocation sequence based on pipeline_templates

3. **Agent Independence**:
   - Agents can be developed, tested, and deployed independently
   - Agent failures are isolated and retryable
   - Agent implementations can be swapped (e.g., different scraping strategies)
   - Generic worker dynamically loads agent operation modules

4. **Coordination Layer**: BullMQ acts as multi-agent coordinator
   - One queue (pipeline-stages) for all operations
   - Pipeline templates define what to run per project_type
   - Worker processes execute agent logic via dynamic operation loading
   - Redis provides shared state

5. **Development Strategy**:
   - Build one operation at a time (start with url-discovery)
   - Test operation in isolation with content library fixtures
   - Integrate operation into pipeline_template
   - Monitor operation performance via pipeline_stages results
   - Iterate on operation logic based on content_items output quality

6. **Content Reuse Across Projects**:
   - Agents from different projects (news, company profiles, podcasts) can query the same content_items via shared tags
   - A scraping agent for company profiles writes content that a news article agent can reuse
   - Tag-based queries enable cross-project content discovery without coupling

## Session Log

### Session: 2026-01-26 (Session 4) - Dashboard Bug Fixes & Approval Gate System

**Accomplished:**
- Fixed Step 0 UI bugs (removed $root prefixes causing Alpine.js scoping issues)
- Fixed createAndSelectProject() to work in demo mode
- Installed Redis locally, created .env with Supabase credentials
- Implemented approval gate system (stages pause for manual approval)
- Added View Results button to display real output_data from database
- Added awaiting_approval and approved status badges

**Architecture Impact:**
- Stage progression now pauses for approval instead of auto-continuing
- New stage statuses: `awaiting_approval`, `approved`
- Results panel can now display real `output_data` JSONB from database

**Files Modified:**
- `public/index.html` — UI fixes, View Results, Approve buttons
- `services/orchestrator.js` — Approval gate logic
- `routes/runs.js` — New approval API endpoints
- `.env` — Created with credentials

**Updated by:** Claude Opus 4.5 (session-closer)

### Session: 2026-01-24 - DOCUMENTATION ALIGNMENT: All Project Docs Updated to Universal Architecture
**Accomplished:**
- Updated all 8 project documents to reflect universal tag-based content library architecture
- Finalized schema confirmed and documented across CLAUDE.md, PROJECT_STATUS.md, ROADMAP.md, AGENTS.md
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
*Last updated: 2026-01-24*
*Updated by: Claude Opus 4.5*
