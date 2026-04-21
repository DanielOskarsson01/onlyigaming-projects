# Job Search Tool — Strategy

> **Version:** 2.0 — April 18, 2026
> **Purpose:** This document describes the problem, the solution, and the architecture for a tool that automates the job application process. It preserves the reasoning behind every decision so that future developers, AI assistants, and the user himself can understand not just what to build, but why.
> **Status:** Governing strategic document. ROADMAP.md handles task sequencing. CLAUDE.md handles session rules.

---

## Part 1: The Problem

### What's actually going on

Job searching is boring. It's repetitive, low-dopamine work that invites procrastination at every step. The process looks like this:

1. **Scan multiple job boards daily.** LinkedIn, Platsbanken, RemoteOK, BettingJobs, company career pages. Each has its own interface, its own search quirks, its own way of hiding relevant postings. This takes 30-60 minutes and feels like homework.

2. **Read job ads.** Walls of corporate text. Requirements, qualifications, "nice to haves," culture statements. Figuring out whether a job is actually a good fit requires careful reading and honest self-assessment. Most people skim.

3. **Decide whether to apply.** Analysis paralysis. "Is this worth the effort? Am I qualified enough? What if I spend two hours tailoring my CV and don't hear back?" The safe choice is always "I'll do it later." Later never comes.

4. **Tailor the CV.** This is where most people give up. A generic CV gets sent, or nothing gets sent at all. Proper tailoring means reading the ad carefully, identifying which of your experiences match which requirements, reordering sections, adjusting emphasis, maybe writing new bullet points. Per application: 1-3 hours.

5. **Write a cover letter.** Creative energy required. Every letter should feel personal and specific to the company. In practice, most people copy-paste the same letter with the company name swapped out. Hiring managers notice.

6. **Package and send.** Export PDFs, name files correctly, find the right email address or application portal, double-check everything. Small logistics that add up to "I'll do it tomorrow."

### The result

Not enough applications get sent. Good opportunities pass by. The ones that do get applications receive generic, untailored materials that don't stand out.

### What the tool must do

Remove friction at every point where procrastination happens. The goal: transform a multi-hour per-application process into a **10-minute review-and-approve flow**. The human stays in control of every decision, but the tool does all the mechanical work.

---

## Part 2: The Solution — A 7-Step Pipeline

The tool follows a fixed sequence. Not every job uses every step (some get rejected early), but the order never changes.

```
DISCOVER → VALIDATE → EVALUATE → REVIEW → REFINE → GENERATE → PACKAGE
  auto      human      AI         human    AI+human    AI        auto
```

### Step 0: Discover

**Problem it solves:** Scanning 6+ job boards daily is boring and easy to skip.

**What happens:** Automated scan runs daily at 07:00. Six providers search for jobs matching a configurable search profile (keywords, locations, exclude terms). Results are filtered by role relevance, deduplicated, and stored.

**User does:** Nothing. Opens the tool and sees what's new.

**Output:** A feed of discovered job postings, each with title, company, location, source, and a link.

### Step 1: Validate

**Problem it solves:** Deciding which jobs are worth pursuing.

**What happens:** User scrolls the discovery feed and marks jobs as "interested" or "dismissed." Interested jobs get promoted into the pipeline. The system scrapes the full job ad text (HTTP + Readability, with Playwright fallback for JS-rendered pages). Manual text entry available for jobs behind login walls.

**User does:** Swipe yes/no on discovered jobs. ~30 seconds per job.

**Output:** Job with full ad text, ready for analysis.

### Step 2: Evaluate

**Problem it solves:** Reading a wall of job ad text and figuring out if it's a real fit.

**What happens:** AI performs a 5-layer analysis of the job ad:

1. **Explicit requirements** — must-have vs nice-to-have, ranked by priority
2. **Preferred qualifications** — what gives you an edge
3. **Industry language & keywords** — terms to mirror in your application
4. **Operational context** — team size, reporting structure, scope, location, travel
5. **Culture signals** — values, work style, management approach

AI then selects the best CV variant (from 7 pre-approved versions), identifies which sections to emphasize, suggests specific edits, and asks gap questions about requirements not covered by existing CV content. Produces a fit score (0-100) with reasoning.

**User does:** Glances at the fit score and summary. Takes 30 seconds to decide if worth continuing.

**Output:** Complete analysis with variant selection, suggestions, gaps, and fit score.

### Step 3: Review

**Problem it solves:** Making the AI's suggestions actionable without requiring creative effort.

**What happens:** User sees checkboxes for each suggestion (accept/reject) and short-answer fields for each gap question. No essays. No rewriting. Just decisions.

**User does:** Check boxes, type brief answers. 3-5 minutes.

**Output:** Accepted suggestions and answered gaps.

### Step 4: Refine

**Problem it solves:** Seeing exactly how your application will look before committing.

**What happens:** AI generates an integration preview — showing exactly how accepted suggestions and gap answers modify the CV and cover letter. User can add comments and iterate ("make this more concise," "emphasize the leadership angle"). When satisfied, approves. New content points are saved to the knowledge bank for future applications.

**User does:** Review preview, optionally comment, approve. 2-5 minutes.

**Output:** Approved integration plan.

### Step 5: Generate

**Problem it solves:** Actually producing the documents.

**What happens:** AI generates four files:
- **Tailored CV** (DOCX) — selected variant with approved modifications
- **Cover letter** (DOCX) — personalized to the job, matching the CV variant
- **Suggestions document** (DOCX) — full analysis for reference
- **Raw analysis** (JSON) — for debugging

All CV text comes from pre-approved source documents only. The AI selects and arranges — it does not invent credentials. Cover letters are generated fresh but follow strict tone rules (no em dashes, no "leveraged/spearheaded," direct and confident).

**User does:** Nothing at this step. Automatic.

**Output:** Application documents ready for review.

### Step 6: Package

**Problem it solves:** File logistics.

**What happens:** Documents are organized into a folder (Company_Date/), ready to download as a bundle.

**User does:** Downloads, reviews final output, sends the application. 2 minutes.

**Output:** Complete application package.

### The math

Traditional process: 3-5 hours per tailored application.
With tool: ~15 minutes of active human time (validate + review + refine + final check).
The rest is automated.

---

## Part 3: The Strategic Decision — Run Inside the Content Pipeline

### The discovery

We already have a production-tested modular workflow engine: the OnlyiGaming Content Pipeline v2. Investigation revealed that its skeleton is **completely generic** — not hardcoded to company profiles or iGaming content. The skeleton is a platform. Company profiles are just one "application" of it.

Key findings:

- **Projects are template-driven.** No hardcoded project types. A "Job Search" template configures which submodules run at each step.
- **The entity model is generic.** Only requirement: every entity has a `name` field. A job posting entity works identically to a company entity.
- **Steps can be skipped** via template configuration. A job search template skips steps that don't apply.
- **Submodules are auto-discovered** from the filesystem. Adding a new job search module = dropping a folder with manifest.json + execute.js.
- **Routing (Step 7) supports re-work.** Failed items can be sent back to earlier steps for re-processing.
- **All infrastructure is production-tested.** E2E validated with 5 companies, 769 URLs, 516 scraped pages, 5 generated profiles.

### The mapping

| Content Pipeline Step | Job Search Equivalent | What Happens |
|---|---|---|
| Step 0: Project Start | Search Profile | Define keywords, locations, exclude terms |
| Step 1: Discovery | Job Discovery | 6 provider submodules scan job boards |
| Step 2: Pre-Scrape Validation | Job Triage | Filter, dedup, user picks interesting jobs |
| Step 3: Scraping | Ad Scraping | Scrape full job ad text |
| Step 4: Filtering & Assembly | Data Assembly | Assemble job data + CV content + knowledge bank |
| Step 5: Analysis & Generation | Evaluate + Generate | 5-layer analysis, fit score, CV + cover letter |
| Step 6: QA | Document Review | Review generated documents |
| Step 7: Routing | Re-route / Reject | Send back for re-generation or discard |
| Step 8: Bundling | Package | Application bundle (CV + CL + reference) |
| Step 9: Distribution | *(future: email/upload)* | Out of scope for now |
| Step 10: Review | *(skip)* | Not needed |

### Why this beats building a separate tool

1. **Infrastructure exists.** Express + React + Vite + Tailwind, BullMQ + Redis job queue, Supabase database, module loader, tools injection, progress tracking — all built, tested, deployed.
2. **UI exists.** Universal step template renders any step from a manifest. No custom UI components to build.
3. **Long-running tasks handled.** BullMQ processes scraping and LLM calls asynchronously. No browser freezing, no timeouts.
4. **Deployed.** Hetzner server with HTTPS, CI/CD via GitHub Actions.
5. **Module isolation.** Submodules can't break the skeleton. A buggy job provider crashes only that provider, not the whole tool.
6. **Routing built in.** Step 7 re-routes failed items back to earlier steps — handles the "re-generate with different settings" case.

### What this means for the standalone job-search-tool repo

It becomes a **reference codebase** — the source of logic to port into submodules. The live tool runs inside the content pipeline. The old repo is archived once migration is complete.

---

## Part 4: What Already Exists vs What We Build

### Provided by the skeleton (zero work)

- Express server + React client + Vite + Tailwind
- Module loader with manifest validation and auto-discovery
- BullMQ + Redis job queue with timeout handling and partial results
- Supabase database (projects, runs, stages, entity pools, submodule runs)
- Universal step UI (SubmodulePanel, ContentRenderer, CategoryCardGrid)
- Tools injection: `{ logger, http, browser, ai, progress }`
- Step navigation, approval flow, skip capability
- Routing/re-routing (Step 7)
- Template system for project type configuration
- HTTPS deployment on Hetzner with CI/CD

### New submodules to build

| Module | Step | What It Does | Port From | Size |
|---|---|---|---|---|
| `jobtech` | 1 | Swedish job board API (Platsbanken) | providers/jobtech.js | ~50 lines |
| `remoteok` | 1 | RemoteOK JSON API | providers/remoteok.js | ~50 lines |
| `remotive` | 1 | Remotive API | providers/remotive.js | ~50 lines |
| `linkedin-jobs` | 1 | LinkedIn guest API (no auth) | providers/linkedin.js | ~220 lines |
| `applyflow` | 1 | BettingJobs / Applyflow CMS boards | providers/applyflow.js | ~130 lines |
| `career-page` | 1 | Company career pages with CSS selectors | providers/careerPage.js | ~260 lines |
| `job-filter` | 2 | Keyword + location + exclude filtering | discovery.js filterByProfile | ~70 lines |
| `job-dedup` | 2 | Dedup by URL, externalId, fuzzy title | discovery.js dedup logic | ~60 lines |
| `job-scraper` | 3 | HTTP + Readability + Playwright fallback | scraper.js | ~350 lines |
| `job-analyzer` | 5 | 5-layer analysis + fit score + variant | analyzer.js | ~260 lines |
| `cv-generator` | 5 | Tailored CV DOCX from variants | cvGenerator.js | ~440 lines |
| `cover-letter-gen` | 5 | Tailored cover letter DOCX | coverLetterGenerator.js | ~350 lines |
| `app-bundler` | 8 | Package CV + CL + reference docs | New | ~60 lines |

**Total new code: ~13 submodules, ~2,400 lines.** Most is ported from existing working code, adapted to the module contract (manifest.json + execute.js + tools injection).

### Supporting data to migrate

| Data | Current Location | Target |
|---|---|---|
| CV section variants | server/data/materials/CV_SECTION_VARIANTS.md | Module assets in cv-generator |
| CV job variants | server/data/materials/CV_JOB_VARIANTS.md | Module assets in cv-generator |
| Competency pool | server/data/materials/COMPETENCY_MASTER_POOL.json | Module assets in cv-generator |
| Master CV | server/data/materials/MASTER_CV.md | Module assets in cv-generator |
| CV data | server/data/materials/cv_data.json | Module assets in cv-generator |
| Knowledge bank | server/data/knowledge.json | Supabase table (persists across runs) |
| Search profile | server/data/discovery.json (profile section) | Template seed_config |
| Prompt configuration | server/data/prompts.json | Template preset_map options |

---

## Part 5: The Module Contract

Every submodule is a folder with two files:

```
module-name/
  manifest.json    — Declares what the module is, what it needs, what it produces
  execute.js       — The actual logic. Pure function: input → output
```

### manifest.json

```json
{
  "id": "jobtech",
  "name": "JobTech / Platsbanken",
  "description": "Swedish public employment service job board. Searches via the JobTech API.",
  "version": "1.0.0",
  "step": 1,
  "category": "API Sources",
  "cost": "cheap",
  "data_operation_default": "add",
  "requires_columns": [],
  "item_key": "url",
  "options": [
    {
      "name": "max_results",
      "type": "number",
      "label": "Max results per keyword group",
      "default": 50,
      "min": 10,
      "max": 200
    }
  ],
  "output_schema": {
    "display_type": "table",
    "columns": {
      "title": "string",
      "company": "string",
      "location": "string",
      "url": "string",
      "source": "string"
    }
  }
}
```

### execute.js

```javascript
async function execute(input, options, tools) {
  const { logger, http, ai, progress } = tools;
  const { entities } = input;

  // Do the work...

  return {
    entity_name: entities[0].name,
    items: [
      { title: "CMO", company: "Betsson", location: "Stockholm", url: "...", source: "jobtech", status: "success" },
      // ...
    ],
    meta: { total: 47, filtered: 12, errors: 0 }
  };
}

module.exports = execute;
```

### The rules

1. **Modules must not import infrastructure.** No `require('../lib/db')`, no `require('playwright')`. Everything comes through the `tools` object.
2. **Modules must not import other modules.** The analyzer doesn't know the CV generator exists. The skeleton orchestrates.
3. **Input and output shapes are declared.** The manifest's `output_schema` tells the skeleton how to render results. The skeleton tells the module what data is available via `input`.
4. **Errors are items, not exceptions.** A failed scrape returns `{ url, status: "error", error: "Cloudflare blocked" }` — it doesn't throw.

### Tools available to modules

| Tool | Interface | What It Does |
|---|---|---|
| `logger` | `.info(msg)`, `.warn(msg)`, `.error(msg)` | Structured logging, captured in run history |
| `http` | `.get(url, opts)`, `.post(url, body, opts)` | HTTP with retry, timeout, AbortController |
| `browser` | `.fetch(url, opts)` | Playwright-backed page rendering (lazy-loaded) |
| `ai` | `.complete(prompt, opts)` | LLM completion (model from settings, 3x retry) |
| `progress` | `.update(current, total, msg)` | UI progress bar updates |

---

## Part 6: Data Flow

### How a job entity accumulates data through the pipeline

```
Step 1 (Discovery) creates:
  { name: "CMO at Betsson", url: "...", company: "Betsson", location: "Stockholm", source: "jobtech" }

Step 2 (Validation) adds nothing (filtering step — items pass or get removed)

Step 3 (Scraping) adds:
  { adText: "Full job ad text...", wordCount: 1247, scrapeMethod: "readability" }

Step 5 (Analysis) adds:
  { fitScore: 85, variant: "igaming", layers: {...}, suggestions: [...], gaps: [...], cv: {...} }

Step 5 (Generation) adds:
  { cvFile: "CV_Betsson_CMO.docx", coverLetterFile: "CL_Betsson_CMO.docx" }

Step 8 (Bundling) adds:
  { bundlePath: "output/Betsson_CMO_2026-04-18/" }
```

Each step reads the accumulated entity data, adds its own fields, and passes it forward. No step modifies another step's data.

### Search profile (input to Step 1)

```json
{
  "keywords": ["CMO", "CPO", "CEO", "COO", "CCO", "CDO", "CRO", "CTO",
    "VP Marketing", "VP Product", "VP Growth", "VP Operations",
    "Head of Marketing", "Head of Product", "Head of Growth",
    "Marketing Director", "Product Director", "Growth Director",
    "Director of Marketing", "Director of Product",
    "General Manager", "Managing Director",
    "Chief Marketing Officer", "Chief Product Officer",
    "iGaming", "igaming", "betting", "casino", "gambling",
    "Marknadschef", "Produktchef", "VD", "Marknadsdirektör"],
  "excludeKeywords": ["intern", "junior", "student", "trainee", "assistant", "praktikant"],
  "locations": ["Stockholm", "Sweden", "Remote", "Europe", "Nordic", "Portugal", "Spain", "UAE", "Global"],
  "locationRules": {
    "sweden": "must be Stockholm or remote",
    "allowedCountries": "any city accepted",
    "otherCountries": "must be remote"
  }
}
```

---

## Part 7: Human Interaction Design

The tool's value comes from minimizing what the user has to do. Every human gate is designed to take under 5 minutes.

### Step 1 — Job Triage
**What the user sees:** A feed of discovered jobs. Title, company, location, source.
**What the user does:** Marks as "interested" or "dismissed." Binary choice per item.
**Design goal:** Feel like scrolling a social feed, not filling out a form.

### Step 3 — Review Suggestions
**What the user sees:** Checkboxes for each AI suggestion. Short-answer fields for gap questions.
**What the user does:** Check/uncheck boxes. Type 1-2 sentence answers.
**Design goal:** No creative effort required. Just decisions.

### Step 4 — Refine Preview
**What the user sees:** Side-by-side showing exactly how the CV/cover letter will change.
**What the user does:** Optionally adds comments ("make this more concise"). Clicks approve.
**Design goal:** Confidence that the output will be right before generating documents.

### Step 6 — Final Review
**What the user sees:** Generated DOCX files.
**What the user does:** Downloads, skims, sends.
**Design goal:** Output is ready to send. Zero edits needed in the common case.

---

## Part 8: The CV System

This is the domain-specific knowledge that makes the tool work. It's not a generic document generator — it's built around one person's career and pre-approved content.

### 7 Base Variants

| Variant | When Selected |
|---|---|
| `generic` | Default. Balanced presentation across all experience. |
| `igaming` | Job is in the iGaming industry. Emphasizes domain expertise. |
| `cmo` | Marketing leadership role. Emphasizes growth, campaigns, brand. |
| `cpo` | Product leadership role. Emphasizes roadmap, UX, data-driven decisions. |
| `ceo` | General management role. Emphasizes P&L, strategy, board reporting. |
| `startup` | Early-stage company. Emphasizes building from scratch, wearing many hats. |
| `digital` | Digital transformation role. Emphasizes tech adoption, digital strategy. |

### Source Files

| File | Purpose |
|---|---|
| `CV_SECTION_VARIANTS.md` | 7 variants of: summary, highlights, other experience |
| `CV_JOB_VARIANTS.md` | 7 variants per job entry (5 jobs × 7 variants = 35 sets of bullets) |
| `COMPETENCY_MASTER_POOL.json` | ~8 competency categories with 4-6 items each |
| `MASTER_CV.md` | Complete career history — source of truth for accuracy |
| `cv_data.json` | Structured CV data (education, certifications, contact info) |

### Content Constraint

**The AI does not invent credentials.** All CV text must come from the pre-approved source files. The AI's job is to:
- Select the right variant for the job
- Reorder sections by relevance to the job ad
- Select 3 competency categories and reorder items
- Suggest modifications (new bullets, reworded summaries) — but only using factual content from the master CV
- Identify gaps where the user needs to provide additional information

### Knowledge Bank

Content points learned from previous applications accumulate over time:
- A gap answer like "I led a team of 12 in the Betclic rebrand project" becomes a reusable content point
- Future analyses can draw from these points without re-asking the question
- Rejected patterns (suggestions the user consistently rejects) are tracked to avoid repeating them

### Writing Rules

- No em dashes (—). Use commas, periods, or semicolons.
- No "leveraged," "spearheaded," "synergy," or other AI-typical corporate words.
- Direct, confident tone. Write like a senior executive, not a LinkedIn influencer.
- Cover letters: 3-4 paragraphs, specific to the job, reference concrete details from the ad.
- Each job entry in the CV uses one complete variant — no mixing bullets from different variants.

---

## Part 9: Discovery Providers

### Provider Details

| Provider | Type | How It Works | Known Issues |
|---|---|---|---|
| **JobTech** | REST API | Swedish public employment service (Platsbanken). Searches by keyword + municipality. | Full-text matching returns noise. "Marknadschef" returns 0 results (suspected municipality filter issue). |
| **RemoteOK** | JSON API | Global remote job board. First array element is metadata (skip it). | Rate limiting unclear. |
| **Remotive** | REST API | Remote-focused job board. Category-based search. | Limited categories. |
| **LinkedIn** | Guest API | No auth required. Rate-limited (3-5 sec between requests). HTML parsing. | Fragile — LinkedIn changes markup frequently. |
| **Applyflow** | CMS API | Powers BettingJobs and similar boards. Uses seeker/job bucket tokens. | Requires specific site configuration (apiUrl, siteCode, buckets). |
| **Career Page** | Web scrape | Company career pages with custom CSS selectors. AI-assisted job detection. | Cloudflare blocking. Selectors break when sites redesign. |

### Deduplication Strategy

Applied after all providers return results:
1. **Exact externalId match** — same job from same provider
2. **URL normalization match** — origin + path, strip trailing slash, ignore query params
3. **Fuzzy title + company match** — company must match exactly, title Dice coefficient > 0.85 (seniority prefixes removed)

### Filtering

Applied after deduplication:
1. **Keyword match** — title must contain at least one of the 37 role-specific terms (case-insensitive)
2. **Exclude keywords** — title must NOT contain: junior, intern, student, trainee, assistant, praktikant
3. **Location rules:**
   - Sweden/Sverige → must be Stockholm or explicitly remote
   - Allowed countries (Europe, Nordic, Portugal, Spain, UAE, Global) → any city accepted
   - Other countries → must be marked remote

---

## Part 10: Phased Implementation

### Deployment Model

One Hetzner deployment, two templates. The content pipeline skeleton stays untouched — job search is a second project type alongside company profiles. Supabase tables specific to job search are prefixed `js_` for visual separation (e.g., `js_knowledge_bank`). Both templates share the same BullMQ queue, Redis instance, and module loader.

### Phase 1: Contract Validation

**Goal:** Prove that three distinct module shapes work inside the content pipeline before committing to porting all 13 modules.

The three shapes being validated:
- **Fetcher** (tabular output): `jobtech` — calls an external API, returns rows rendered in a table
- **Analyzer** (multiple input sources): `job-analyzer` — reads entity data + CV content + knowledge bank, returns structured analysis
- **Generator** (file output): `cv-generator` — produces a DOCX file from analysis results

This phase deliberately skips scraping. The analyzer receives hardcoded ad text injected directly into the entity, bypassing Step 3 entirely. This isolates the contract validation from scraping reliability issues.

1. Create a "Job Search" template in Supabase (execution_plan, seed_config, preset_map)
2. Create `js_knowledge_bank` table in Supabase
3. Port `jobtech` as Step 1 submodule (manifest.json + execute.js)
4. Port `job-analyzer` as Step 5 submodule (reads hardcoded ad text from entity)
5. Port `cv-generator` as Step 5 submodule (produces DOCX from analysis)
6. Create a project using the Job Search template
7. Run discovery → manually inject ad text → run analysis → run generation
8. Write a contract validation report documenting: what worked, what broke, what the skeleton needs (if anything)

**Definition of done:** A written contract validation report. JobTech results render in the step UI. The analyzer produces a fit score and variant selection from hardcoded input. The CV generator produces a DOCX file. All three module shapes execute without skeleton modifications.

### Phase 2: Full Discovery

**Goal:** All 6 providers work, filtering and dedup operational, scraping live.

1. Port `remoteok` provider submodule
2. Port `remotive` provider submodule
3. Port `linkedin-jobs` provider submodule
4. Port `applyflow` provider submodule
5. Port `career-page` provider submodule
6. Port `job-filter` as Step 2 submodule (keyword + location + exclude filtering)
7. Port `job-dedup` as Step 2 submodule (URL, externalId, fuzzy title dedup)
8. Port `job-scraper` as Step 3 submodule (replaces hardcoded ad text from Phase 1)
9. Wire search profile into template seed_config
10. Set up daily cron trigger

**Definition of done:** Full scan across all 6 providers. Scraper fetches real ad text. Results match the current standalone tool's output. Dedup and filtering remove the same items.

### Phase 3: Remaining Generation and Data Migration

**Goal:** Complete the generation pipeline and migrate all supporting data.

1. Port `cover-letter-gen` as Step 5 submodule
2. Port `app-bundler` as Step 8 submodule
3. Migrate CV source files (variants, competency pool, master CV) into cv-generator module assets
4. Migrate knowledge bank data to `js_knowledge_bank` Supabase table
5. Wire prompt configuration into template preset_map options

**Definition of done:** One real job application processed from discovery through scraping, analysis, CV + cover letter generation, to downloadable application package — all inside the content pipeline.

### Phase 4: End-to-End Validation

**Goal:** Prove stability with real data.

1. Process 5 real job applications through the full pipeline
2. Fix issues found at each step
3. Compare output quality with standalone tool
4. Run daily scan for 7 consecutive days without errors

**Definition of done:** 5 complete application packages. Each contains a tailored CV and cover letter. No crashes. No manual workarounds required at any automated step.

---

## Part 11: Scope and Success Criteria

### In Scope

- All 7 pipeline steps running inside the content pipeline
- All 6 discovery providers
- Search profile system (keywords, locations, excludeKeywords)
- 5-layer analysis with fit scoring and variant selection
- CV + cover letter DOCX generation from pre-approved content
- Knowledge bank (content points persisting across applications)
- Settings (model selection, prompt editing via template options)
- Daily automated discovery scan

### Out of Scope (backlog)

- Application tracking (sent, interview, rejected, offer)
- Analytics (discovery hit rate, application success rate)
- Multi-language CV/cover letter support
- New discovery providers (Indeed, Glassdoor, WeWorkRemotely)
- Notifications (email/Slack when interesting jobs found)
- Distribution step (auto-email applications)
- Multi-user support

### Anti-Creep Rules

1. **If you're about to add a feature not listed in "In Scope," stop.** Add it to the backlog.
2. **If you're about to modify the content pipeline skeleton, stop.** Job search functionality lives in submodules only.
3. **If one module needs to import another module, stop.** That's a contract violation. Restructure the data flow.
4. **If fixing a bug requires touching more than the module + its manifest, stop.** The bug is probably in the wrong layer.

### Success Criteria

| # | Criterion | How to Test |
|---|---|---|
| 1 | 5 real job applications processed end-to-end | Count complete packages in output |
| 2 | Each step handles failures gracefully | Feed: empty ad text, API timeout, malformed URL, missing CV variant |
| 3 | Generated CV + cover letter need zero manual edits | User reviews 5 outputs, flags any needed edits |
| 4 | Daily scan runs without errors for 7 consecutive days | Check server logs |
| 5 | A new discovery provider can be added in under 30 minutes | Time test: create a dummy provider module from scratch |
| 6 | No regressions across 5 consecutive development sessions | Track: does each session build forward, or fix something that broke? |

### The Bright Line Test

Before every commit, answer: **"Does this change bring us closer to processing 5 real job applications end-to-end?"** If the answer is no, the change doesn't belong in this phase.
