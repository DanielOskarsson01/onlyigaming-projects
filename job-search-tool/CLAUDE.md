# Job Search Tool

## Project Overview

Personal job application factory. Removes friction from every step of the job search process — discovery, evaluation, tailoring, and document generation. AI does the heavy lifting; the human reviews at key gates.

**Strategic direction:** This tool is being migrated into the OnlyiGaming Content Pipeline v2 as a new project type. The content pipeline skeleton is a generic modular workflow engine — job search becomes a set of submodules running inside it. See STRATEGY.md for full rationale and architecture.

**Current state:** Standalone prototype (this repo). Code here serves as the reference for porting logic into content pipeline submodules. This repo will be archived once migration is complete.

## Goals

1. Every pipeline step works reliably from start to finish
2. Discovery finds relevant jobs without noise (location + keyword filtering)
3. Analysis produces actionable, accurate fit assessments
4. Generated materials (CV + cover letter) are ready to send without manual editing
5. The tool runs daily with minimal babysitting (cron scan at 07:00)

## Architecture

- **Frontend:** React 19 + Vite (port 5174), Tailwind CSS
- **Backend:** Express.js (port 3005), JSON file database (atomic writes)
- **AI:** Anthropic Claude API (Sonnet, configurable model)
- **Scraping:** HTTP fetch + Mozilla Readability, Playwright fallback for JS-rendered sites
- **Document Generation:** DOCX (pptxgenjs-style Word documents)
- **Scheduling:** node-cron (daily 07:00 discovery scan)

## The 7-Step Pipeline

```
DISCOVER -> VALIDATE -> EVALUATE -> REVIEW -> REFINE -> GENERATE -> PACKAGE
   AI        HUMAN      AI+HUMAN    HUMAN    AI+HUMAN     AI         AUTO
```

| Step | Name | Who | What Happens |
|------|------|-----|-------------|
| 0 | Discover | AI | Crawl sources (APIs + career pages), filter by profile, deduplicate |
| 1 | Validate | Human | Review titles, promote to jobs, scrape job ad text |
| 2 | Evaluate | AI | 5-layer analysis, fit score, variant selection, suggestions, gaps |
| 3 | Review | Human | Accept/reject suggestions, answer gap questions |
| 4 | Refine | AI+Human | Preview integration of changes, iterate with comments, approve |
| 5 | Generate | AI | Output tailored CV + cover letter + suggestions (DOCX) |
| 6 | Package | Auto | Download bundled application materials |

## Key Directories

| Path | Purpose |
|------|---------|
| `server/routes/` | Express API routes (8 files: jobs, scrape, analyze, generate, discovery, refine, knowledge, materials, prompts) |
| `server/services/` | Business logic (analyzer, cvGenerator, coverLetterGenerator, discovery, scraper, refiner, sourceDetector) |
| `server/services/providers/` | Discovery source adapters (jobtech, remoteok, remotive, linkedin, applyflow, careerPage) |
| `server/lib/` | Data access layer (db.js, discoveryDb.js, promptDb.js, knowledgeDb.js, materialDb.js, http.js) |
| `server/data/` | JSON databases (jobs.json, discovery.json, prompts.json, knowledge.json, materials.json) |
| `client/src/components/` | React UI components (19 files, one per pipeline step + settings/management) |
| `output/` | Generated DOCX files |

## Discovery Providers

| Provider | Type | Source |
|----------|------|--------|
| jobtech | API | Arbetsformedlingen / Platsbanken (Swedish job board) |
| remoteok | API | RemoteOK (remote jobs) |
| remotive | API | Remotive (remote jobs) |
| linkedin | Guest API | LinkedIn job search |
| applyflow | API | BettingJobs + Applyflow CMS boards |
| career_page | Web scrape | Company career pages with CSS selectors |

## Search Profile (discovery.json)

- **keywords:** 37 role-specific terms (CMO, CEO, Marketing Manager, etc.)
- **excludeKeywords:** Blocks junior/intern/assistant/trainee/student
- **locations:** Stockholm, Sweden, Remote, Europe, Nordic, Portugal, Spain, UAE, Global
- **Location rules:** Sweden = Stockholm or remote only; allowed countries = any city; others = must be remote

## CV Generation System

Uses pre-approved variant system from `CVS_DIR`:
- 7 base variants: generic, igaming, cmo, cpo, ceo, startup, digital
- `CV_SECTION_VARIANTS.md` - Pre-written section variants
- `CV_JOB_VARIANTS.md` - Pre-written job entry variants
- `COMPETENCY_MASTER_POOL.json` - Competency categories
- `cv_data.json` - Structured CV metadata
- `MASTER_CV.md` - Complete CV (source of truth)

**Constraint:** AI selects from pre-approved content only. It does not invent new content.

## Writing Rules (MANDATORY)

1. NEVER use em dashes or en dashes. Use regular hyphen-dash (-) only.
2. Avoid "leveraged", "spearheaded", "cutting-edge", "robust" and AI-typical words.
3. Write in a direct, confident, human tone. No filler phrases.

## Environment Variables

- `ANTHROPIC_API_KEY` - Claude API key
- `CVS_DIR` - Path to JobSearch/CVs folder (CV source documents)
- `PORT` - Server port (default 3005)

## Running

```bash
cd ~/Library/CloudStorage/Dropbox/Projects/job-search-tool
npm run dev    # Both server + client
npm run server # Server only
```

- Frontend: http://localhost:5174/
- API: http://localhost:3005/

## Data Model

### Job (jobs.json)
Status flow: `promoted -> scraped -> analyzed -> reviewed -> refined -> generated`

### Discovery Item (discovery.json)
Status flow: `new -> interested/dismissed` or `new -> promoted` (creates job)

## Known Issues

- JobTech API returns full-text matches (not title-only), producing noise that `filterByProfile` must clean up
- JobTech "Marknadschef" query returns 0 results despite jobs existing on Platsbanken (query/municipality filter issue)
- Some career page sources fail intermittently (Raketech, others with Cloudflare)
- JobTech timeout: intermittent "This operation was aborted" on some queries
- Each pipeline step UI needs stability review - steps may not handle edge cases well

## Migration Target

**Content Pipeline v2 (skeleton):** `~/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline-v2/`
**Content Pipeline v2 (modules):** `~/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline-modules-v2/`

Job search submodules will be added to the modules repo. No skeleton changes needed. See STRATEGY.md Part 4 for the full submodule list and Part 10 for phased implementation.

## Session Log

### Session: 2026-04-16 — Location filtering, exclude keywords, slash commands
**Accomplished:**
- Added location filtering to `filterByProfile` (Sweden=Stockholm/remote, allowed countries pass, foreign must be remote)
- Replaced unused `industries`/`seniority` profile fields with `excludeKeywords`
- Updated SearchProfileEditor UI, discoveryDb.js defaults, discovery.seed.json
- Fixed BettingJobs scraping: extract descriptions from Applyflow API, fix /jobs/ URL pattern
- Converted 10 agent files to slash commands in `~/.claude/commands/`
- Created proper CLAUDE.md and ROADMAP.md for the project

**Decisions:**
- Exclude keywords block titles containing junior/intern/etc. (safer than seniority whitelist)
- Location filtering uses profile.locations list; Sweden gets special Stockholm-only treatment
- Slash commands strip YAML frontmatter from old agent format

**Commits:** `0e67ed7` (BettingJobs fix), `9555218` (location filtering + exclude keywords)

### Session: 2026-04-07 — Discovery filter rewrite to keyword matching
**Accomplished:**
- Rewrote discovery filter to keyword-only title matching against 37 role-specific keywords
- Expanded search profile from 15 to 37 keywords
- Fixed filterByProfile application to ALL API sources (not just RemoteOK/Remotive)

**Decisions:**
- Keyword-only filter (no seniority/industry): user searches by specific role names
- 37 keywords based on actual LinkedIn applications

**Commits:** `078f778`, `7fdcc6e`, `8c6ffc1`
