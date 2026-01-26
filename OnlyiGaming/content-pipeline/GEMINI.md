# Content Pipeline Project

## Project Overview
Building a Universal Content Pipeline for automated company profile generation in the iGaming industry. The system transforms minimal CSV input (company names + URLs) into comprehensive, SEO-optimized profiles through an 11-step automated workflow.

## Current Status
- **Phase**: Infrastructure complete, web interface development pending
- **Working**: Steps 1-2 (CSV upload, URL discovery with 77 valid URLs across 6 test companies)
- **Next**: Express API server + web dashboard + BullMQ worker integration

## Architecture
- **Orchestration**: BullMQ with Redis (NOT n8n)
- **Database**: Supabase (UUID-based schema)
- **Server**: Hetzner CX22 VPS (188.245.110.34) - setup pending
- **Stack**: Node.js 20, Express.js, Tailwind CSS

## Key Documents (in /docs)
- `Full_Workflow_Document_With_Intro_Formatted_v2.docx` - Master 11-step workflow
- `Raw_Appendix_Content_Creation_Master.md` - Detailed appendix
- `bullmq_architecture_doc.md` - BullMQ implementation spec
- `updated_project_memory.md` - Project history and decisions
- `Universal_Content_Pipeline_Architecture.md` - System architecture

## Design Principles
1. **Database-mediated**: Each step reads/writes to Supabase, no direct connections
2. **Modular**: Each step is independent, testable, replaceable
3. **Stage-specific QA**: URL sourcing 90%, scraping 70%, generation 90%
4. **Web-controlled**: Browser interface, no terminal operations for end users

## The 11 Steps
1. CSV Upload & Validation
2. URL Discovery (sitemap, navigation, seeds)
3. Pre-scrape Validation
4. Content Collection (Cheerio/Playwright)
5. Filtering & Adaptive Capping
6. LLM Profile Generation (OpenAI/Gemini)
7. QA & Fact Checking
8. Automated Router
9. Output Packaging (MD, JSON, HTML)
10. Distribution
11. Human Review

## Current Blockers
- Hetzner server connection issues
- Web interface not connecting to backend
- BullMQ workers need implementation

## Immediate Next Actions

1. **Resolve Hetzner Server Access**: Verify SSH connection and document working method
2. **Initialize Express API Server**: Set up basic server structure at `/opt/company-pipeline/`
3. **Create Core API Endpoints**: Company upload, list, status, and pipeline control
4. **Implement BullMQ Workers**: Define queues for all 11 steps, start with URL Discovery
5. **Build Web Dashboard**: Connect HTML interface to API backend with WebSocket updates

## Technical Specifications

**Server**: Hetzner CX22 (2 vCPU, 4GB RAM, 40GB disk, Ubuntu 22.04)
- IP: 188.245.110.34
- SSH: `ssh -i ~/.ssh/hetzner_ed25519 root@188.245.110.34`

**Redis Configuration**:
- Host: 127.0.0.1
- Port: 6379
- Password: Danne2025

**Supabase**:
- URL: https://fevxvwqjhndetktujeuu.supabase.co
- Tables: companies, discovery_links, content_raw, content_json_draft, workflow_events

**Project Path**: `/opt/company-pipeline/`

## Quality Thresholds

- **URL Sourcing (Step 2)**: 90% valid URLs required
- **Content Scraping (Step 4)**: 70% success rate minimum
- **Profile Generation (Step 6)**: 90% QA pass rate required
- **Overall Pipeline**: Sub-10-minute processing time target

## Gemini-Specific Notes

**LLM Integration**: Step 6 (Profile Generation) can use Google Gemini as alternative to OpenAI
- Consider Gemini 1.5 Pro for long-context profile generation
- Leverage 1M token context window for comprehensive company data
- Use grounding with Google Search for fact-checking
- Implement function calling for structured JSON output

## Session Log

### Session: 2026-01-26 (Session 4) - Dashboard Bug Fixes & Approval Gate System

**Accomplished:**
- Fixed Step 0 UI bugs (removed $root prefixes causing Alpine.js scoping issues)
- Fixed createAndSelectProject() to work in demo mode
- Installed Redis locally, created .env with Supabase credentials
- Implemented approval gate system (stages pause for manual approval)
- Added View Results button to display real output_data from database
- Added awaiting_approval and approved status badges

**Files Modified:**
- `public/index.html` — UI fixes, View Results, Approve buttons
- `services/orchestrator.js` — Approval gate logic
- `routes/runs.js` — New approval API endpoints
- `.env` — Created with credentials

**Updated by:** Claude Opus 4.5 (session-closer)

### Session: 2025-12-14 - Project Initialization & Documentation
**Accomplished:**
- Conducted comprehensive documentation review across all files in /docs
- Analyzed bullmq_architecture_doc.md, Universal_Content_Pipeline_Architecture.md, updated_project_memory.md
- Created detailed ROADMAP.md with 5 phases, dependencies, and success metrics
- Identified critical path: Express API → BullMQ workers → Web dashboard
- Documented all 11 pipeline steps with clear priorities

**Decisions:**
- Confirmed Phase 1 priority: Express API server + BullMQ worker integration + Web dashboard
- Established Phase 2 focus: Complete Steps 2-6 (URL discovery through LLM generation)
- Set quality thresholds: 90% URL sourcing, 70% scraping, 90% generation
- Prioritized modular architecture with database-mediated step communication

**Blockers/Questions:**
- Hetzner server SSH connection needs verification (critical blocker for deployment)
- Web interface exists but lacks backend API (Phase 1.1 addresses)
- BullMQ workers need implementation (Phase 1.2 addresses)

**Next Session Priority:**
- Resolve Hetzner connection and verify server access
- Begin Express API server implementation
- Test basic BullMQ job queueing

**Updated by:** Claude Opus 4.5

### Session: 2025-12-11 - Project Orientation
**Accomplished:**
- Reviewed project documentation and current status
- Confirmed infrastructure completion with Steps 1-2 operational (77 URLs across 6 test companies)
- Identified next priorities: Express API server, web dashboard, BullMQ worker integration

**Decisions:**
- No implementation decisions made (orientation session only)

**Blockers/Questions:**
- Hetzner server connection issues remain unresolved
- Web interface backend connection needs troubleshooting
- BullMQ workers require implementation

**Updated by:** session-closer agent

---
*Last updated: 2025-12-14*
*Updated by: Claude Opus 4.5*
