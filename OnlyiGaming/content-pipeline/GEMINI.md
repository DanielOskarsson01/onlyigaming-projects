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
6. LLM Profile Generation (OpenAI)
7. QA & Fact Checking
8. Automated Router
9. Output Packaging (MD, JSON, HTML)
10. Distribution
11. Human Review

## Current Blockers
- Hetzner server connection issues
- Web interface not connecting to backend
- BullMQ workers need implementation

## Session Log

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
*Last updated: 2025-12-11*
*Updated by: session-closer agent*