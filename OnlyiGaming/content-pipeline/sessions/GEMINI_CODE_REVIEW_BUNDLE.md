# Code Review — Content Pipeline v2 (Phases 0–8)

## Your Task

You are reviewing the ENTIRE source code of a content pipeline tool, built by Claude Code across 9 build phases (Phase 0–8). Your job has two dimensions:

### Dimension A: Spec Adherence & Strategic Alignment

Review whether the code correctly implements what the specs describe. The specs are the contract — if code diverges from spec, the code is wrong.

Check specifically:
1. **Does the skeleton actually stay hollow?** The STRATEGIC_ARCHITECTURE.md and SKELETON_SPEC define a "Hard Wall" where the skeleton must never contain domain-specific logic. Verify this boundary is respected across ALL files.
2. **Does each BUILD_PLAN phase deliver what it promised?** Cross-reference the deliverables listed in each phase against what actually exists in the code. Flag anything missing, incomplete, or built differently than specified.
3. **Does the submodule contract hold?** SUBMODULE_DEVELOPMENT.md defines manifest.json format, execute() signature, and the ownership boundary. Verify the skeleton honors this contract and doesn't reach into submodule territory.
4. **Does the UI match UI_REFERENCE.md?** Check component structure, rendering logic, and ownership boundaries against the visual spec.
5. **Is the database schema implemented as specified?** Compare sql/schema.sql against SKELETON_SPEC Part 8 (database schema).
6. **Is the overall architecture aligned with STRATEGIC_ARCHITECTURE.md?** Check that fundamental principles (database-mediated communication, step independence, manifest-driven rendering, universal content tool vision) are reflected in the actual implementation.

### Dimension B: Code Quality

Review the code for implementation-level issues:

1. **Skeleton/submodule boundary violations** — Any domain-specific logic (URLs, duplicates, sitemaps, iGaming terms) in skeleton code is a CRITICAL finding
2. **Server routes** — Approval flow correctness, input resolution, pool merging, data integrity
3. **State management** — Zustand (UI state) vs TanStack Query (server state) vs useState (form state) separation. Leaks between layers = MEDIUM
4. **Race conditions** — save-then-run sequences, bidirectional syncs, query invalidation timing
5. **Type safety** — `any` casts, missing type guards, `Record<string, unknown>` abuse
6. **Error handling** — Unhandled promise rejections, missing error boundaries, silent failures
7. **Dead code** — Unused imports, unreachable branches, stale comments from earlier phases

## Output Format

Organize your review into two sections:

### Section 1: Spec Adherence Report

For each spec document, state:
- **PASS** — Code matches spec
- **DIVERGENCE** — Code differs from spec (describe what differs and which is likely correct)
- **MISSING** — Spec describes something that doesn't exist in code yet
- **EXTRA** — Code contains something not in any spec

Be specific: quote the relevant spec section and the relevant code.

### Section 2: Code Quality Findings

For each finding:
- **Severity**: CRITICAL / MEDIUM / LOW
- **File + line**: exact location
- **Description**: what's wrong and why it matters
- **Suggested fix**: concrete code change or approach

Group findings by category (matching the 7 code quality areas above). Within each category, order by severity.

## Known Issues (DO NOT REPORT)

These are already tracked in BACKLOG.md:
- K001: ContentRenderer `isDuplicate` hardcoded (Phase 10 fix — schema-driven row_highlight)
- K002: rss-feeds, url-filter have no execute.js (placeholder only)
- K003: Race condition on concurrent approvals (needs optimistic locking)
- K004: No pagination for large result sets (Phase 10)

---


# PART 1: SPECS (Source of Truth)

---
## SPEC: STRATEGIC_ARCHITECTURE.md
```markdown
# OnlyiGaming Content Creation Tool — Strategic Architecture

> **Version:** 1.0 — February 7, 2026
> **Purpose:** This document describes the intent, principles, and end goal of the Content Creation Tool. It preserves the context and reasoning behind every architectural decision so that future developers, AI assistants, and team members understand not just what to build, but why.
> **Audience:** Anyone making decisions about this project — developers, designers, strategists, and AI coding assistants.
> **Status:** This is the governing strategic document. Companion documents handle implementation detail.

---

## Part 1: What We're Building and Why

### The Platform

OnlyiGaming is a B2B directory and content platform for the iGaming industry. It integrates eight sections — directory (80+ company categories), news, marketplace (M&A hub and project board), consultants (freelancer marketplace), media (multimedia with calendar), events (conferences with calendar), career (job board), and community (forums). Everything connects through a 4-layer tagging system with 335+ tags. A company like Evolution Gaming appears across directory listings, news articles, job postings, event coverage, consultant profiles, and community discussions — all linked by tags.

The platform runs on Strapi CMS with a Plasmic frontend migration underway. The team is Danne (strategy/product), Bojan (developer), Felipe (UX/UI), Stefan (SEO), and Joseph (design), working with freelancers rather than full-time developers.

### The Content Problem

OnlyiGaming needs content at scale. Hundreds of company profiles. News coverage. Directory descriptions. Podcast show notes. FAQ sections for 80+ categories. Each piece of content requires research, source gathering, writing, quality review, formatting, and distribution to the right systems (Strapi, Google Docs, spreadsheets).

Doing this manually doesn't scale. Doing it with disconnected scripts doesn't produce consistent quality. What's needed is a tool — operated by a human — that handles the mechanical parts (finding sources, fetching pages, assembling data, formatting output) while keeping the human in control of the creative and editorial decisions.

### The Content Creation Tool

This is not a pipeline in the factory sense — it's a tool that a human operator uses to create content intelligently. The operator decides what to make, which sources to use, what quality threshold to accept, and when to publish. The tool handles the tedious parts: crawling sitemaps, fetching pages, cleaning HTML, assembling source packages, calling LLMs, formatting output, pushing to CMS.

The tool follows an 11-step sequence. Not every content piece uses every step, but the order never changes. The steps are:

| Step | Name | What It Does |
|------|------|-------------|
| 0 | Project Start | Define what we're making — content type, entities, template selection |
| 1 | Discovery | Find candidate URLs and seed data from multiple sources |
| 2 | Pre-Scrape Validation | Filter out junk URLs before paying the cost to fetch them |
| 3 | Scraping | Fetch actual page content using the right method per source |
| 4 | Filtering & Assembly | Clean, deduplicate, and assemble source packages |
| 5 | Analysis & Generation | Analyze sources and generate output content (LLM costs here) |
| 6 | Quality Assurance | Verify generated content meets standards |
| 7 | Routing | Decide what happens to items that don't pass — rework, reroute, or discard |
| 8 | Bundling | Package approved content into delivery formats |
| 9 | Distribution | Push to external systems — Strapi, Google Docs, Sheets |
| 10 | Review | Final human gate before publication |

Company profiles are the first use case, not the only one. The architecture is designed so that the same skeleton supports any content type — present and future.

---

## Part 2: Why Modular — The Developer's Focus Belongs on Submodules

The Content Creation Tool is modular not because modularity is trendy, but because of a simple question: **when a developer sits down to work on this tool, what should they be thinking about?**

The answer: the task at hand. Making a scraper better. Tuning an LLM prompt. Adding a new discovery source. Building a video script generator. Integrating a cheaper API.

They should not be thinking about database connections, job queue configuration, React component architecture, or how steps pass data to each other. That's plumbing. It's essential, but once it works, it should disappear from the developer's world entirely. Every minute a developer spends on plumbing is a minute not spent on the actual content logic that makes the tool useful.

Modularity exists to protect that focus. The skeleton handles plumbing. The developer handles submodules. These two concerns live in separate mental spaces — and, as Part 8 will explain, in separate physical spaces.

### New tools appear constantly

The AI landscape changes month to month. New LLMs with different strengths and price points. New APIs for company data. New scraping services that solve problems current tools can't. New embedding models. New search APIs. Each of these is a potential submodule. The architecture must make it trivial to plug in a new tool, test it alongside existing ones, compare results against historical data, and promote it or discard it — without touching anything else.

### Cheaper solutions emerge

What costs $0.10 per call today might cost $0.01 next year, or a free open-source alternative might appear. The system should make it easy to swap one implementation for another at the submodule level. A cheaper LLM that produces equivalent output? Replace the submodule. A free sitemap parser that's faster? Replace the submodule. The skeleton doesn't care which submodule runs — it cares that the contract is honored.

### New tasks will appear that we haven't imagined yet

Today the tool creates company profiles and news articles. Tomorrow it might need to:

- Generate comparison pages between competing companies
- Produce video scripts from research sources
- Create social media content packages for multiple platforms
- Build landing pages from templates and research data
- Generate image briefs and creative directions for designers
- Assemble investor reports from financial data sources
- Produce podcast show notes from transcripts
- Create training materials from documentation

Each of these is a different combination of discovery, processing, generation, and distribution — but they all follow the same fundamental flow: find sources → process sources → generate output → review → distribute. The 11-step sequence is general enough to accommodate content types that don't exist yet. A video production task might skip Steps 2-3 and use Step 5 for script generation. An image brief might use Step 1 for reference discovery and Step 5 for brief generation. The steps are containers. What goes in them changes. The containers don't.

### The tool should be open to entirely new domains

The iGaming directory is the first use case, but the architecture doesn't hardcode anything iGaming-specific into the skeleton. The skeleton knows about steps, submodules, entities, approvals, and data flow. It doesn't know about company profiles, sitemaps, or Strapi. This means the same tool could theoretically handle content creation for any industry, any platform, any content type — by swapping modules.

### What modularity actually requires

For modularity to be real and not just aspirational, it requires:

1. **A stable skeleton that never changes.** If adding a new submodule requires modifying the skeleton, modularity is an illusion. The skeleton must be complete enough to handle any submodule that follows the contract, without modification.

2. **A clear contract between skeleton and modules.** Every submodule must know exactly what it receives (input, options, tools) and what it must return (results). The skeleton must know exactly how to load, execute, and display any module that honors this contract.

3. **Physical enforcement of boundaries.** If the architecture depends on rules in markdown files and code comments being followed, there will always be a risk moment. Every development session becomes a gamble — will the boundaries hold, or will they be crossed under pressure? Physical separation in two repositories makes boundary violations impossible rather than merely discouraged. Part 8 explains the specific failure pattern that proved this necessity.

---

## Part 3: The Core Insight

> "Each step is a silo. Each submodule is a silo. The magic lies only in how we connect them."

This is the architectural principle that everything else derives from. Complexity should exist only in the connections between components, not within the components themselves.

A submodule is a pure function — it receives input, processes it, returns output. It doesn't know about databases, queues, or other submodules.

A step is a container — it runs submodules, collects results, and writes approved output to the database. It doesn't know what the submodules do.

The tool is steps chained through a database — each step reads the previous step's output, runs its submodules, and writes its own output. No step knows about any other step.

This means:

- Adding a new submodule requires zero infrastructure changes — just create a file with the right format
- Adding a new step requires zero changes to existing steps — just add a container
- Fixing a submodule bug cannot break another submodule or the step that contains it
- A new LLM, scraper, or API becomes just another submodule — plug it in, test it, keep it or discard it
- Infrastructure changes cannot accidentally happen while working on module logic

---

## Part 4: Three Principles

### Principle 1: Submodules Are Pure Functions

A submodule declares what it needs and what it does. The skeleton handles everything else.

```javascript
module.exports = {
  id: 'sitemap',
  name: 'Sitemap Parser',
  category: 'website',
  step: 1,
  cost: 'cheap',
  options: [
    { name: 'max_urls', type: 'number', default: 1000 },
    { name: 'include_images', type: 'boolean', default: false }
  ],
  execute: async (input, options, tools) => results
}
```

The contract:

- **No database access.** Submodules never import Supabase, never write to tables, never read from tables. All data arrives through `input` and leaves through `results`.
- **No queue manipulation.** Submodules don't know BullMQ exists. They don't create jobs, check job status, or manage workers.
- **No imports from skeleton infrastructure.** The only bridge to the outside world is the `tools` object, which provides: `logger` (log messages), `http` (fetch URLs), `progress` (report execution progress to the UI).
- **Declarative UI.** The `options` array declares what configuration the submodule accepts. The skeleton renders the appropriate form fields (toggles, dropdowns, number inputs, text fields) without knowing what the options mean.

This means a freelancer can build a new submodule without understanding how Supabase, Redis, or BullMQ work. They write a function, declare its interface, and the skeleton handles orchestration, persistence, and UI.

This also means submodules are testable in isolation — pass input, get output, verify. No need to spin up databases, queues, or servers.

### Principle 2: Physical Separation Protects Stability

The house metaphor:

| Skeleton (Build Once, Freeze) | Furniture (Add Anytime, Swap Anytime) |
|------|------|
| Electrical wiring | Lamps, TV, appliances |
| Plumbing pipes | Toilet, sink, shower |
| Doors between rooms | What's in each room |
| Light switches | What the lights illuminate |

Translated to the Content Creation Tool:

| Skeleton | Furniture |
|------|------|
| Supabase connection + schema | What data gets written |
| Step-to-step data flow | What each step does with data |
| Approval CTA mechanism | What gets approved |
| Generic StepPanel shell | What UI each step shows |
| Module loading system | Actual module logic |
| Tools object interface | Which tools modules use |

**Two repositories:**

- **Repo 1 (Skeleton):** The house — walls, wiring, plumbing, doors. Built once, tested, then frozen. Contains: server.js, routes, services, workers, shared React components, hooks, stores, SQL schema.
- **Repo 2 (Modules):** The furniture — what goes in each room. Active development. Contains: individual submodule folders, each with a manifest and an execute function.

When a developer (human or AI) works on Repo 2, Repo 1 is physically separate. They cannot accidentally modify database connections, queue setup, or step flow while debugging a scraper. The skeleton doesn't change because a new module is being built. The skeleton doesn't change because a new LLM API is being integrated. The skeleton doesn't change because the tool is expanding from text content to video production.

**The trade-off is real.** When a feature genuinely requires changes to both infrastructure and modules (estimated 1-2 times per month), it requires coordinating across two repositories — roughly 30 minutes of extra friction per cross-boundary change. Part 8 explains why this trade-off is overwhelmingly worth it.

### Principle 3: The System Learns and Gets Smarter Over Time

Several steps in the tool make subjective decisions: Is this URL worth scraping? Is this generated content good enough? Should this failed item be rerouted or discarded? In v1, a human makes all these decisions. But the system should get smarter with use — not just cheaper, but genuinely better across four dimensions.

**1. Financial — Every run gets cheaper.**
Without learning, every run pays full price: every URL gets scraped (even ones that always produce junk), every LLM call runs at maximum effort (even for simple entities), every result gets full human review (even ones that are obviously fine). With learning, the system identifies patterns: "URLs matching this pattern from this domain are always junk — skip them." "Company profiles for this category consistently pass QA at this prompt configuration — auto-approve." Each run costs less than the last.

**2. Quality — Output improves with accumulated knowledge.**
A human reviewer doesn't just approve or reject — they notice patterns. "The profiles generated for payment providers always miss regulatory information." "News summaries from this source tend to be too promotional." When these observations are captured and fed back, the system produces better first drafts. Generation prompts get tuned per content type. Quality thresholds get calibrated per category. The 50th company profile is better than the 5th because the system has learned what "good" looks like for that category.

**3. Tool Selection — Different challenges need different tools.**
Not every entity needs the same discovery approach. A large publicly-traded company has rich sitemaps, LinkedIn presence, news coverage, and financial filings. A small startup might only have a basic website and a Crunchbase entry. The system should learn which combination of submodules works best for which type of entity. "For companies in the payment provider category with enterprise clients, Sitemap + LinkedIn + News gives the best source package." This is routing intelligence — matching the right tools to each challenge.

**4. Future-proofing — New tools and LLMs plug in naturally.**
Because the system logs every decision and its outcome, a new tool can be evaluated against historical data: "Would this new LLM have produced better results for the 200 company profiles we generated last month?" The submodule architecture means new tools are just new modules — plug them in, run them alongside existing ones, compare results, promote or discard. The system's learning history makes this comparison possible and measurable.

**How this works in practice — the calibration pattern:**

- **v1 (Ship First):** Human reviews everything. Every decision is logged with reasons — which URLs were approved/rejected, which content passed/failed QA, which items were rerouted. This logging is not optional. It's the foundation everything else builds on.
- **Next:** System analyzes logged decisions and proposes rules. "You've rejected 94% of URLs matching `/tag/*` on casino news sites. Should I auto-reject these?" Human approves or rejects the proposed rule.
- **Later:** Approved rules run in shadow mode — the system applies them but still shows results to the human for confirmation. Rules matching human decisions 95%+ of the time get promoted to automatic.
- **End-game:** Mature rules run automatically. New edge cases still surface for human review. Continuous drift detection compares automated decisions against occasional human overrides.

**Decision logging starts in v1** because without the historical data, none of the later stages are possible.

---

## Part 5: The Three-Level Skeleton

The skeleton has exactly three levels of mechanics. These three levels are what gets built once and frozen. Everything above this is module content that changes frequently.

### Level 1: Between Steps

Step N finalizes → data saved to Supabase → Step N+1 loads that data.

Steps communicate exclusively through the database. There are no direct connections between steps. No event passing. No callbacks. Step 2 doesn't know Step 1 exists — it reads whatever data is in Supabase for this run at this step.

This means:
- Steps can be reordered without code changes (they just read from different step numbers)
- Steps can be skipped entirely for content types that don't need them
- A step failure doesn't cascade — Step 3 doesn't break because Step 2 had an error, it simply has no input to work with
- Adding a new step requires zero changes to existing steps

### Level 2: Between Submodules Within a Step

Run submodule A → approve results → Run submodule B → approve results → all approved results aggregate when step finalizes.

Within a step, submodules share context — data uploaded or produced by one submodule is available to others in the same step. But each submodule runs independently and **sequentially** — the user triggers them one at a time, reviews results, approves or rejects, then moves to the next submodule. There is no concurrent execution of sibling submodules within a step.

The shared step context pattern:
- Each submodule declares what input it needs (e.g., "I need a `website` column in the entity data")
- When running, the submodule checks: (1) does my own upload have this data? (2) does the shared step context from another submodule have it? (3) if neither, prompt the user
- Priority: submodule's own upload > shared context > prompt user

When the step finalizes, all approved results from all submodules in that step are aggregated and written to Supabase as the step's output. This becomes the input for the next step.

### Level 3: Within Each Submodule (Three Accordions)

Every submodule pane has exactly three sections, rendered as accordions:

**1. Input** — The skeleton handles: load entity data from previous step output OR accept a direct upload. Check shared step context for available data from sibling submodules. Display what's available and what's missing. The submodule doesn't handle any of this — it declares what it needs, and the skeleton figures out where to get it.

**2. Options** — The skeleton handles: render whatever configuration options the module declares in its manifest. Toggles, dropdowns, number inputs, text fields, template selectors. The skeleton doesn't know what these options mean — it just renders the form. The module defines the options and their defaults.

**3. Results** — The skeleton handles: [RUN] button triggers execution → show progress → display output → [APPROVE] / [REJECT] per item. Download CTA for bulk export. Try Again CTA for re-running with different options. The skeleton displays results in a standard format and handles the approval workflow. It doesn't know what the results mean.

**The skeleton renders all three sections for every submodule.** This is why adding a new submodule requires zero skeleton changes — the skeleton already knows how to handle any submodule that follows the contract.

---

## Part 6: What Each Step Achieves

This section describes the intent of each step — what problem it solves and why it exists — not the implementation detail of which submodules it contains. Submodule inventories and specifications live in companion documents.

### Step 0: Project Start

**Intent:** Define the scope of what we're making before doing any work.

The user names the project, selects the content type (company profile, news article, directory description, video script, image brief, or any future content type), chooses which entities to process, and optionally selects a template that pre-configures options across downstream steps.

This step is mostly UI — no heavy computation. Its output is a project record and a list of entities that flow through subsequent steps.

### Step 1: Discovery

**Intent:** Cast a wide net to find every possible source of information about each entity.

Different entities have different footprints on the web. A large company might have a rich sitemap, LinkedIn presence, news coverage, Crunchbase profile, and YouTube channel. A small startup might only have a basic website. Discovery submodules each know how to find information through a different channel.

**Key architectural point:** There is no centralized upload step. Each submodule owns its own input. A Sitemap parser needs a website URL. A News search needs a company name. A LinkedIn scraper needs a LinkedIn URL. Each submodule declares what it needs and finds it through the shared step context pattern (own upload > shared context > prompt user).

### Step 2: Pre-Scrape Validation

**Intent:** Save money and time by filtering out worthless URLs before fetching them.

Discovery typically produces far more URLs than are worth scraping. Validation filters these cheaply — regex rules, robots.txt checks, URL pattern analysis — so the expensive scraping step only processes URLs likely to produce useful content.

This is one of the steps where calibration has the highest financial impact. If the system learns that URLs matching `/tag/*` from news sites are always junk, it can filter them automatically instead of wasting scraping budget.

### Step 3: Scraping

**Intent:** Fetch actual page content using the right method for each source.

Not all pages can be fetched the same way. Some need simple HTTP requests. Some need a headless browser for JavaScript rendering. Some are behind authentication or rate limiting. Some are PDFs or structured data feeds. Different submodules handle different scraping challenges.

### Step 4: Filtering & Assembly

**Intent:** Transform raw scraped content into clean, organized source packages ready for generation.

Raw HTML needs cleaning — remove navigation, ads, boilerplate. Duplicate content needs deduplication. Multiple sources for the same entity need assembly into a coherent source package. The output is the actual material the LLM will work from.

### Step 5: Analysis & Generation

**Intent:** Use the assembled sources to produce the final content.

This is where LLM costs concentrate. The system analyzes source packages, identifies key information, and generates output content according to templates and prompts configured for the content type. Quality depends heavily on input quality from previous steps and on calibrated prompts. This is where the calibration pattern has the biggest quality impact.

### Step 6: Quality Assurance

**Intent:** Verify that generated content meets standards before it moves to packaging.

QA ranges from simple automated checks (minimum length, required sections present) to sophisticated evaluation (factual accuracy, tone consistency, SEO optimization). v1 relies heavily on human review. The end-game is calibrated thresholds that auto-approve content above a learned standard.

### Step 7: Routing

**Intent:** Decide what happens to items that don't pass quality standards.

In v1, the user IS the router. They see failed items with reasons and decide: re-run with different options, send back to a previous step, or discard. There is no automated routing engine in v1. In the end-game, routing rules learned from user decisions automate common rework patterns.

### Step 8: Bundling

**Intent:** Package approved content into the formats required by downstream systems.

A company profile might need to be bundled as a Strapi-ready JSON object, a Google Doc for editorial review, and a spreadsheet row for tracking. Bundling handles format transformation without changing the content.

### Step 9: Distribution

**Intent:** Push bundled content to external systems.

Strapi API calls, Google Drive uploads, spreadsheet updates. Each distribution target has its own submodule that handles authentication, API formatting, and confirmation.

### Step 10: Review

**Intent:** Final human gate before content goes live.

Even with QA at Step 6, a final editorial review catches things automation misses. This step is lightweight in the tool (just an approval UI) but represents the human judgment that ensures nothing publishes that shouldn't.

---

## Part 7: Beyond Text — The Broader Ambition

The 11-step sequence is deliberately abstract. It describes a universal content creation flow, not a text-content-specific one.

**Video production:**
- Step 0: Define video project (explainer, product demo, interview)
- Step 1: Discover source material (company website, product pages, existing media, brand guidelines)
- Steps 2-4: Fetch and assemble reference materials
- Step 5: Generate video script, shot list, creative brief
- Step 6: QA against brand voice and factual accuracy
- Steps 8-9: Bundle as production package, distribute to video team or production tool

**Image and design briefs:**
- Step 0: Define brief project (social media graphics, infographic, banner ads)
- Step 1: Discover reference images, brand assets, competitor examples
- Step 5: Generate creative briefs with layout suggestions, copy, design direction
- Step 9: Distribute to design team or push to design tool

**Landing pages and microsites:**
- Step 0: Define page type and target audience
- Step 1: Discover competitive examples, keyword data, content requirements
- Step 5: Generate page copy, meta descriptions, structured content blocks
- Step 9: Push to CMS or static site generator

**Social media content packages:**
- Steps 1-4: Research topic, gather sources
- Step 5: Generate platform-specific posts (LinkedIn long-form, Twitter thread, Instagram caption)
- Step 8: Bundle as multi-platform content package
- Step 9: Distribute to scheduling tools

None of these require changes to the skeleton. They require new submodules in the appropriate steps. The skeleton already handles input loading, option rendering, execution, approval, aggregation, and step-to-step data flow. It does this for sitemap parsing today. It will do it for video script generation tomorrow. The mechanics are identical.

This is why the architecture prioritizes modularity above all else. The skeleton is built once and frozen not because change is bad, but because the skeleton's job is already done — it provides the universal container mechanics. All future innovation happens at the submodule level, where the developer's focus belongs.

---

## Part 8: The Risk — Why Boundaries Must Be Physical

Parts 2 through 7 describe the vision and its architecture. This part explains why the implementation requires physical enforcement through two repositories, not just good practices in a single codebase.

### Rules in files will always be a risk moment

The modularity described above works perfectly — if everyone follows the rules. Don't modify infrastructure while working on modules. Don't import database clients into submodules. Don't change the step flow to fix a module bug.

But rules in markdown files and code comments are advisory. They can be read, understood, and still broken — especially under the pressure of debugging. When a module isn't working, the fastest fix often involves touching infrastructure. In that moment, the architectural boundary exists only as a suggestion.

**If the architecture depends on rules in markdown files being followed, there will always be a risk moment.** Every development session becomes a gamble: will this be the session where the rules hold, or the session where they're broken?

### The pattern that proved this

Across multiple development sessions, the same destructive pattern repeated:

1. Developer (or AI coding assistant) starts working on module logic — fixing a scraper, improving a filter, tuning a prompt
2. While debugging, they modify infrastructure — database connections, queue configuration, step flow logic, React shell components
3. These infrastructure changes introduce regressions in previously working features
4. The next session discovers the regressions and spends its time rebuilding infrastructure instead of building forward

The module logic itself has been stable throughout. What breaks every time is the plumbing between modules. The project has extensive documentation — CLAUDE.md files with explicit rules, architecture decision records, workflow specifications. None of it prevented the pattern because AI coding assistants read documentation at the start of a session but drift from it under debugging pressure.

### Physical separation eliminates the gamble

Two repositories don't make boundary violations discouraged — they make them impossible. If the infrastructure files aren't in the working repository, they can't be accidentally modified. Not "shouldn't be" — *can't be*.

**Why not a monorepo with package boundaries?** Tools like Turborepo/Nx can enforce import restrictions through ESLint rules. But ESLint rules are checked at lint time, not at edit time. An AI coding assistant following an import chain during debugging will read, modify, and save files across package boundaries without running the linter. The protection only triggers after the damage is done. Physical repo separation means the modules workspace literally does not contain infrastructure files — there is nothing for the AI to follow, read, or modify. This is a constraint designed specifically for AI-assisted development workflows.

The trade-off is real: cross-boundary changes (~1-2 per month) require coordinating across two repositories, roughly 30 minutes of extra friction each time. This is overwhelmingly worth it compared to hours or days lost to accidental regressions — a pattern that occurred in the majority of development sessions before the split.

### What needs to be stable

The things that keep breaking are not complex. They are plumbing:

- **Database connections** — Supabase connection pooling, timeout handling, reconnection
- **Job queue setup** — Redis connection, BullMQ worker configuration, job recovery
- **Step-to-step data flow** — How Step 1's output becomes Step 2's input through Supabase
- **The React shell** — Step containers, submodule panels, approval buttons, navigation
- **The module loading pattern** — How the system discovers, loads, and executes a submodule

None of these need frequent changes. Once working, they should be frozen. Repo 1 contains the plumbing. Repo 2 contains the modules. Day-to-day development happens in Repo 2. Repo 1 is touched deliberately, rarely, and with full awareness of the consequences.

---

## Part 9: v1 vs End-Game

### v1: Manual Everything, Log Everything

The first version of any step should be the simplest possible implementation that proves the skeleton works. One discovery method, one scraper, one generator, one distribution target. The human reviews everything manually. No automation, no intelligence, no shortcuts.

But every human decision gets logged — which URLs were approved or rejected, which content passed or failed QA, which items were rerouted and why. This logging is not optional and not a "nice to have." It is the foundation that makes every later stage possible.

**The v1 goal:** One piece of content through all 11 steps, from project creation to published output. Manual review at every step. Prove the skeleton works end-to-end.

### End-Game: Intelligent, Multi-Source, Multi-Format

The end-game system looks fundamentally different from v1 — not because it was redesigned, but because it learned:

- **Discovery** expands from one source type to many — websites, search engines, social platforms, news archives, industry databases, APIs. Each is a submodule.
- **Validation** graduates from manual review to calibrated rules — learned from thousands of logged decisions, running in shadow mode before enforcement.
- **Generation** handles multiple content types with prompts calibrated per category, producing better first drafts because the system knows what "good" looks like.
- **Quality** thresholds auto-approve content above a learned standard, surfacing only edge cases for human review.
- **Routing** applies automated rework rules learned from user decisions — "when a profile fails QA for this reason, re-run with this prompt configuration."
- **Distribution** pushes to multiple targets — CMS, document systems, design tools, scheduling tools, production systems.
- **New tools and LLMs** get evaluated against historical data, A/B tested alongside existing modules, and promoted or discarded based on measured performance.

The end-game is not a separate system to be designed later. It emerges naturally from consistent decision logging in v1. Every human decision in v1 becomes training data for end-game automation.

---

## Part 10: How This Connects to the Broader Platform

The Content Creation Tool's output feeds OnlyiGaming through the tagging system.

A company profile generated by the tool gets tagged with directory categories (DIR-003 Live Dealer Providers), geography tags (MARKET-EU), product tags (PROD-live-casino), and publication type tags (TYPE-profile). Once in Strapi, this content appears across the platform wherever those tags are relevant.

The Content Creation Tool must produce output that:
- Conforms to Strapi's content type schemas
- Includes all required tags and metadata
- Is ready for the platform's tag-first architecture without manual re-tagging
- Handles relationships between entities

Distribution (Step 9) handles Strapi formatting. But content structure is determined earlier — Step 5 must know what fields Strapi expects, and Step 0 must capture which tags apply.

---

## Part 11: How Documents Fit Together

Three documents govern this project. Each has a clear scope.

| Document | What It Covers | Scope |
|----------|---------------|-------|
| **Strategic Architecture (this document)** | Intent, principles, end goal, reasoning, context. Why decisions were made. | The "why" — governs all other documents |
| **Skeleton Spec** | Two-repo split. Three-level mechanics. Manifest contract. Tools object. Schema. Infrastructure reliability. | The "what to build" — the frozen house |
| **Module Decisions** | Submodule specs. Shared step context API. Error contracts. UI states. Approval flow. | The "detailed how" for modules — the furniture |

**Hierarchy:** If documents conflict — Strategic Architecture wins on principles and intent, Skeleton Spec wins on infrastructure, Module Decisions wins on module-level detail.

**Everything else is reference material.** Historical documents may exist for context but are not authoritative. Any developer or AI assistant should follow these three documents.

---

## Part 12: The Test

The architecture is working when:

1. **A freelancer can build a new submodule** in Repo 2 without knowing how Supabase, Redis, or BullMQ work.

2. **A skeleton developer can fix infrastructure** in Repo 1 without breaking any existing submodule.

3. **Adding a new submodule requires zero skeleton changes.** Create a file in the right folder, it appears in the UI.

4. **The system produces its first published content** through all 11 steps with manual review at every step. The skeleton works end-to-end.

5. **Decision logging captures every human judgment** from day one.

6. **A new LLM or tool can be evaluated** against historical data without modifying the skeleton.

7. **A new content type can be added** (video scripts, image briefs, landing pages) by creating new submodules only — no skeleton or existing submodule changes.

8. **The rebuild cycle stops.** Development sessions build forward instead of rebuilding infrastructure.
```

---
## SPEC: SKELETON_SPEC_v2.md
```markdown
# Content Creation Tool — Skeleton Specification

> **Version:** 2.0 — February 9, 2026
> **Replaces:** SKELETON_SPEC.md (v1.2), SKELETON_DEFINITION_v2.md, SKELETON_SPEC_DELTA.md
> **Companion:** STRATEGIC_ARCHITECTURE.md (governing strategy document — unchanged)
> **Purpose:** Defines the hollow skeleton — what it provides, what it doesn't, and how it works. Every example uses generic placeholders. No submodule-specific content belongs in this document.

---

## Part 1: The Skeleton Principle

The skeleton is the building. Submodules are the apartments.

**The skeleton provides:**
- Containers — step workspace, category cards, submodule panes, accordion sections. All are empty slots with defined positions.
- Mechanics — data transfer between steps, shared context within steps, format validation, execution via job queue, status state machine, approval flow, decision logging.
- CTAs and transitions — hardcoded buttons with activation logic. Their placement is fixed. Their availability follows rules.

**The skeleton does NOT provide:**
- What content appears inside any slot
- What columns a results list shows
- What input fields an upload form needs
- What options exist
- What a summary looks like
- How results are visualized
- Any step-specific or content-type-specific logic

Each submodule declares all of that through its manifest and component definitions. The skeleton renders the slot. The submodule fills it.

**Rendering rule:** The skeleton displays submodule-provided content as-is. It never constructs, composes, or interprets domain-specific text. Summary lines, result descriptions, and status labels come from `output_data.summary.description` — written by the submodule's `execute()`. If the skeleton is assembling strings like "X items across Y entities — no duplicates", that's a bug. The skeleton may fall back to basic counts (`total_items`, `total_entities`) when `description` is absent, but never adds domain-specific context.

---

## Part 2: Two-Repo Architecture

**Repo 1 (Skeleton):** The building — walls, wiring, plumbing, doors. Built once, tested, frozen. Contains: server, routes, services, workers, shared React components, hooks, stores, SQL schema.

**Repo 2 (Modules):** The apartments — what goes in each room. Active development. Contains: individual submodule folders, each with a manifest, an execute function, and optional React components (e.g., custom Options panels).

### Why Two Repos

The split exists for **AI assistant containment**. When an AI coding assistant is debugging a submodule, it follows imports, reads related files, and "helpfully" fixes things along the way. In a monorepo — even with ESLint rules or package boundaries — the AI can still see and modify infrastructure files. Physical repo separation means the modules repo literally does not contain infrastructure code. There is nothing for the AI to accidentally break.

**Why not a monorepo with package boundaries?** ESLint import rules are checked at lint time, not at edit time. An AI assistant following an import chain during debugging will read, modify, and save files across package boundaries without running the linter. The protection only triggers after the damage is done.

**The trade-off:** Cross-boundary changes (~1–2 per month) require coordinating across two repositories — roughly 30 minutes of extra friction per change. This is overwhelmingly worth it compared to the rebuild cycles that occurred in the majority of development sessions before the split.

### What lives where

| Skeleton (Repo 1) | Modules (Repo 2) |
|---|---|
| Express API server | Individual submodule folders |
| Database connection + schema | manifest.json per submodule |
| BullMQ queue + workers | execute.js per submodule |
| React shell components | React components per submodule (options panels, custom renderers) |
| Module loader + auto-discovery | |
| Tools object factory | |
| Approval routes + decision logging | |
| Step-to-step data flow | |


---

## Part 3: UI Shell — Top-Level Structure

### Header Bar (always visible)

Logo (OnlyiGaming Content Tool) on the left. Three navigation items:

1. **New Project** — Project creation form (Step 0).
2. **Projects** — List view: all projects with name, description, number of runs. Clicking a project opens a detail view showing runs, active steps, dates. *(v1: list + open current run. Detail view built later.)*
3. **Templates** — Placeholder in v1. Nav item exists, page shows empty state.

When inside a run, the header stays. Below it, the RunView renders the step workspace.

### Run View — Vertical Accordion Layout

**CRITICAL: The layout is a vertical accordion of collapsible step cards.** This matches the existing StepContainer.tsx implementation exactly. DO NOT change this to a horizontal nav bar, wizard bar, tabs, or sidebar.

All 11 steps render as collapsible cards stacked vertically. One step is expanded at a time (the active step auto-expands). Each collapsed step card shows: step number circle (color = status), step name, description, status badge. Completed steps can be clicked to expand and review output. Pending/locked steps are grayed out and collapsed.

The expanded step card contains the **Step Workspace** — which renders the universal step template (CategoryCardGrid, StepSummary, StepApprovalFooter).

---

## Part 4: Step 0 — Project Start

Not a step template — this is a dedicated project creation form built into the skeleton.

**Fields:**
- Project Name (required)
- Template (optional — placeholder in v1)
- Parent Project (optional — link to parent if sub-project)
- Intent (optional — freeform goal text)
- Timing (optional — placeholder in v1: one-off / scheduled / continuous)

**No data upload. No entities. No CSV.** Data entry happens inside submodules in Step 1.

**Flow:**
1. User fills in project metadata
2. Clicks [Create & Start Run]
3. Skeleton creates: projects row, pipeline_runs row, 11 pipeline_stages rows
4. Step 0 → "active"
5. User sees project summary, clicks [APPROVE STEP]
6. Step 0 → completed, Step 1 → active, opens automatically

---

## Part 5: Universal Step Template

One template for all steps (Step 1 through Step 10). The skeleton does not know which step it is rendering. It renders the same structure every time.

### Step Workspace Layout

Steps are **accordions** — each step expands/collapses. Inside each step, **category cards** are shown in a grid. When a category card is clicked, it expands **inline** to reveal the submodules within that category.

```
┌─────────────────────────────────────────────────────────────────┐
│ ▼ Step 0: Project Start                              ✓ Complete │
│   (collapsed — shows summary only)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ▼ Step 1: Discovery                                    ● Active │
│                                                                 │
│   Source Types (click to configure)                             │
│                                                                 │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│   │ 🌐 Website     │  │ 📰 News        │  │ 🔗 External    │   │
│   │ 2/3 submodules │  │ 0/2 submodules │  │ 0/1 submodules │   │
│   └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                 │
│   When "Website" clicked, it expands INLINE:                    │
│   ┌─ 🌐 Website ─────────────────────────────────────────────┐ │
│   │ 2/3 submodules                                            │ │
│   │ ──────────────────────────────────────────────────────── │ │
│   │ Submodules                                                │ │
│   │ ➕ ☑ Sitemap Parser        (623 URLs)            →       │ │
│   │ ➕ ☑ Navigation Links      (105 URLs)            →       │ │
│   │ ➕ ☐ Seed Expansion                              →       │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│   Summary (per-submodule rows, NOT aggregate):                  │
│     ➕ Sitemap Parser: 623 URLs approved                        │
│     ➕ Navigation Links: 105 URLs approved                      │
│   [APPROVE STEP]  [SKIP STEP]                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ▶ Step 2: Validation                                   ○ Locked │
└─────────────────────────────────────────────────────────────────┘
```

**Category card (collapsed):** Icon + label + "X/Y submodules" — X = approved submodules, Y = total submodules in category
**Category card (expanded):** Shows submodules inline with:
- Data operation icon (➕➖＝) — toggleable, from manifest `data_operation_default`
- Checkbox (checked if approved)
- Submodule name
- Result count if completed (e.g., "623 URLs")
- Arrow icon (→) — click opens SubmodulePanel

**Clicking a submodule row:** Opens the SubmodulePanel from the left

### What the Skeleton Renders

- **StepContainer** — Accordion wrapper for each step (expand/collapse, status badge, summary)
- **CategoryCardGrid** — Grid of category cards that expand inline to show submodules
- **StepSummary** — Per-submodule rows showing each non-idle submodule's status and result count
- **StepApprovalFooter** — [APPROVE STEP], [SKIP STEP] buttons
- **SubmodulePanel** — Slides from left, contains accordion sections for Input/Options/Results

### What the Skeleton Does NOT Render

- Content inside the Options accordion (that's a submodule-provided component — see Part 6)
- What a category card's expanded content looks like beyond the submodule list
- Step-specific logic (every step uses StepContainer + CategoryCardGrid)

### Step Config Source

Step names, descriptions, and ordering come from a config object — not hardcoded per component:

```typescript
const STEP_CONFIG = [
  { index: 0, name: 'Project Start', description: 'Define project scope and metadata' },
  { index: 1, name: 'Discovery', description: 'Find candidate sources and seed data' },
  { index: 2, name: 'Validation', description: 'Filter before committing to expensive operations' },
  { index: 3, name: 'Scraping', description: 'Fetch actual content from validated sources' },
  { index: 4, name: 'Filtering & Assembly', description: 'Clean and organize into source packages' },
  { index: 5, name: 'Analysis & Generation', description: 'Produce output content from sources' },
  { index: 6, name: 'Quality Assurance', description: 'Verify output meets standards' },
  { index: 7, name: 'Routing', description: 'Decide what happens to items that fail QA' },
  { index: 8, name: 'Bundling', description: 'Package into delivery formats' },
  { index: 9, name: 'Distribution', description: 'Push to external systems' },
  { index: 10, name: 'Review', description: 'Final human gate before publication' },
];
```


---

## Part 6: Universal Pane Template

One template for all submodule panes. The skeleton does not know which submodule it is rendering. Same structure every time. This section is the complete reference for everything that happens inside the pane.

### Pane Layout

The panel slides in from the **LEFT** side when a submodule row is clicked. **Fixed width: 480px** (`w-[480px] min-w-[480px] max-w-[480px]`). Never resizes. Full height. Backdrop behind it darkens the step workspace.

**Accordion behavior:** Only ONE accordion may be expanded at a time. Opening one automatically collapses the other two.

```
┌──────────────────────────────────────────────────────┐
│ HEADER (teal)                                        │
│ Step 1 - Sitemap Parser                     [Close]  │
│ iGaming Payments Q1                                  │
├──────────────────────────────────────────────────────┤
│ DESCRIPTION                                          │
│ Parse XML sitemaps to discover URLs                  │
├──────────────────────────────────────────────────────┤
│ DATA OPERATION INDICATOR                             │
│ ➕ Adding to working pool · Currently: 0 items       │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌── Previous Run Summary (if exists) ─────────────┐  │
│ │ Last run: 623 URLs · Approved ✓ · 2h ago        │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
│ ▼ Input (blue)                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │ See "Input Accordion" section below             │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
│ ▶ Options (teal)                                     │
│ ┌─────────────────────────────────────────────────┐  │
│ │ See "Options Accordion" section below           │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
│ ▼ Results (pink) — ALWAYS VISIBLE                    │
│ ┌─────────────────────────────────────────────────┐  │
│ │ See "Results Accordion" section below           │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
├──────────────────────────────────────────────────────┤
│ FOOTER                                               │
│ [RUN TASK]     [SEE RESULTS]     [APPROVE]           │
└──────────────────────────────────────────────────────┘
```

### Pane Header

**Line 1:** "Step {N} - {submodule_name}" + [Close] button (X icon)
**Line 2:** Project name (from pipelineStore.selectedProjectId)

Both read from the manifest and project context. No submodule-specific logic.

### Description Bar

One line below the header. Shows `manifest.description`. Plain text, read-only. Gives the user context about what this submodule does before they interact with anything.

### Data Operation Indicator

Same data operation icon shown in two places — same source (`manifest.data_operation_default`), two render points:

1. **On the submodule row** (in expanded category card): compact icon only (➕/➖/＝), toggleable
2. **In the pane** (below description): icon + context label + working pool count

Pane display:

| State | Display |
|-------|---------|
| ➕ add | `➕ Adding to working pool · Currently: {N} items` |
| ➖ remove | `➖ Filtering working pool · Currently: {N} items` |
| ＝ transform | `＝ Transforming working pool · Currently: {N} items` |

The "Currently: N items" shows the step's working pool size from `pipeline_stages.working_pool`. This tells the user what will happen to their data when they approve: will it grow, shrink, or change shape?

The user can toggle the operation (➕ → ➖ → ＝ → ➕ cycle) in either location. Toggling in one updates the other immediately. The toggle saves to `run_submodule_config.data_operation` (see Part 10: Configuration Storage). It doesn't modify the manifest — just overrides the default for this run.

### Previous Run Summary

Visible only when this submodule has been run before in this step/run. Shown as a compact bar above the accordions:

```
┌─────────────────────────────────────────────────────┐
│ Last run: 623 URLs · Approved ✓ · 2 hours ago       │
│ [View results]                                       │
└─────────────────────────────────────────────────────┘
```

If the previous run was rejected: `Last run: 623 URLs · Rejected ✗ · 2 hours ago`
If the previous run failed: `Last run: Failed · "timeout after 5 min" · 2 hours ago`

[View results] opens the Results accordion with the previous run's data loaded.

Data source: latest `submodule_runs` record for this submodule + run.

---

### Input Accordion (blue)

**Purpose:** Provide the submodule with data to process.

**Layout:** The accordion has two zones stacked vertically:
1. **Upload zone** (top) — Always visible. File upload + manual entry controls.
2. **Content preview** (bottom) — Always visible. Shows the actual data that will be fed to the submodule, regardless of source.

#### Upload Zone (always visible)

```
┌─────────────────────────────────────────────────────┐
│ Paste URLs or data                                   │
│ ┌─────────────────────────────────────────────────┐ │
│ │ (textarea, multiline freeform)                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ──────────────── or ────────────────                 │
│                                                      │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐                │
│   Drop CSV or XLSX here                              │
│   or click to browse                                 │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘                │
│                                                      │
│ ↓ Download template                                  │
└─────────────────────────────────────────────────────┘
```

- **Textarea** (top) — `UrlTextarea` primitive. Freeform multiline input for pasting URLs, entity names, or any text data. Label: "Paste URLs or data".
- **"or" divider** — Visual separator between the two input methods.
- **File upload** (below divider) — `CsvUploadInput` primitive. Drag-and-drop area accepting CSV, XLSX. Shows filename + entity count after upload, with [Replace] link to swap file.
- **Download template** — Link below file upload. Generates a CSV with column headers from manifest `requires_columns`. Helps users prepare data in the expected format.

Either input method provides data. Uploading a CSV clears the textarea. Typing in the textarea clears any uploaded file. Only one source active at a time.

#### Auto-Resolution (skeleton handles automatically)

When the pane opens, the skeleton checks for existing data in priority order (first match wins):

1. **Saved input config exists?** → Load into content preview. Show source label: "Saved input". (User previously clicked SAVE INPUT — this always wins because it represents an explicit user choice.)
2. **Previous step output exists?** → Load into content preview. Show source label: "From Step {N-1}".
3. **Shared step context exists?** → Load into content preview. Show source label: "From {submodule_name} upload ({filename})".
4. **None of the above?** → Content preview shows empty state: "No input data. Upload a file or enter data above."

**Override behavior:** Saving input config (via SAVE INPUT) always overrides inherited data. To revert to inherited data, the user uploads nothing and the skeleton clears the saved config — auto-resolution then falls through to step output or shared context.

#### Content Preview (always visible)

The skeleton renders the resolved input data below the upload zone. **The skeleton does not decide how to visualize this data.** It presents the content exactly as it was rendered in the Results accordion of whatever produced it:

- Data from a previous step's output → rendered using the producing step's output format
- Data from a sibling submodule's results → rendered using that submodule's `output_schema`
- Data from a user upload → rendered as table showing all CSV columns, with `requires_columns` highlighted

The rendering format travels with the data. When a step or submodule saves output, it saves both the data and a `render_schema` (derived from the producing submodule's `output_schema`). The Input content preview reads this schema and renders accordingly — URL lists stay as URL lists, tables stay as tables, HTML packages stay as HTML previews.

**How render_schema drives the UI:** The skeleton includes a `ContentRenderer` component that reads `render_schema` and selects the appropriate display mode. The `render_schema` contains the `output_schema` fields plus a `display_type` field. The skeleton ships with renderers for each display type. If `display_type` is missing or unknown, the skeleton falls back to `"table"`.

**Exhaustive display_type list (v1):**
- `"table"` — Columnar rows. Default. Each field in the schema becomes a column header. Items with missing fields show empty cells.
- `"url_list"` — Compact list showing primary URL plus entity name. Other fields available on row expand.
- `"content_cards"` — Card layout for content pieces (articles, HTML documents). Shows title, excerpt, status. Used by content-producing steps (Step 6+).
- `"file_list"` — Filename + size + timestamp. For steps that produce file outputs.

Additional display_types can be added by adding a new renderer to `ContentRenderer`. No manifest or database changes needed.

**User-uploaded data rendering:** When data comes from a CSV upload (no producing submodule, no render_schema), `ContentRenderer` shows all CSV columns in a table. Columns matching any submodule's `requires_columns` are visually highlighted to show coverage.

```
Example: Data from Step 1 output (entity list passed to Step 2)
┌─────────────────────────────────────────────────────┐
│ Source: From Step 1 · 5 entities                     │
│ ─────────────────────────────────────────────────── │
│ Name              Website                  LinkedIn  │
│ Stripe            stripe.com               ✓         │
│ Adyen             adyen.com                ✓         │
│ ...                                                  │
└─────────────────────────────────────────────────────┘

Example: Data from Sitemap Parser submodule (URL list)
┌─────────────────────────────────────────────────────┐
│ Source: From Sitemap Parser · 623 URLs               │
│ ─────────────────────────────────────────────────── │
│ https://stripe.com/payments                          │
│ https://stripe.com/billing                           │
│ https://stripe.com/connect                           │
│ ...                                                  │
└─────────────────────────────────────────────────────┘

Example: Data from Web Scraper submodule (HTML packages)
┌─────────────────────────────────────────────────────┐
│ Source: From Web Scraper · 42 pages                  │
│ ─────────────────────────────────────────────────── │
│ 📄 stripe.com/payments    12KB   scraped 2h ago     │
│ 📄 stripe.com/billing      8KB   scraped 2h ago     │
│ 📄 stripe.com/connect     15KB   scraped 2h ago     │
│ ...                                                  │
└─────────────────────────────────────────────────────┘
```

The skeleton is a pass-through renderer here. It reads `render_schema` + data and renders. It does not reformat, restructure, or impose its own visualization.

If required columns (from current submodule's manifest) are missing in the incoming data: warning banner with list of missing columns.
If data was just uploaded by the user: preview updates immediately after server-side parsing returns.

#### [SAVE INPUT] button

- Positioned at the bottom of the Input accordion (below content preview)
- **Active only if** the user has changed something (uploaded a file, typed in textarea, or switched from auto-resolved to manual). Dirty-state tracked by the skeleton.
- **Label when clean:** "Save Input (no changes)" (disabled/gray)
- **Label when dirty:** "Save Input" (active)
- **Saves to:** `run_submodule_config.input_config` (see Part 10: Configuration Storage)
- Also triggers server-side file parsing if a file was uploaded (see Part 9: File Upload Flow)
- After save: content preview updates with the new data
- **Guided flow:** After successful save, collapses Input accordion and opens Options accordion automatically. This guides the user through the natural Input → Options → Run sequence.

#### RUN TASK activation rule

RUN TASK in the footer is enabled when content is available from **any** source:
- Content inherited from previous step → `hasInput = true` (no save needed)
- Content from shared step context (sibling submodule upload) → `hasInput = true` (no save needed)
- User uploaded/entered and saved → `hasInput = true`
- Nothing from any source and user hasn't saved → `hasInput = false`, RUN TASK disabled

The rule: if the content preview shows data, RUN TASK is active.

#### What the skeleton reads from the manifest
- `requires_columns` — What columns the upload must contain. Used for validation, template generation, and content preview column headers.
- `item_key` — Primary key field for deduplication (e.g., "url", "entity_id").

**Server-side parsing:** All file parsing happens on the server (see Part 9: File Upload Flow). The frontend sends the raw file; the API parses, validates against `requires_columns`, and stores in `step_context`.

---

### Options Accordion (teal)

**Purpose:** Let the user configure the submodule before running.

**How it works:** The Options accordion is a **slot** — the submodule provides its own frontend component that renders inside the accordion body. If the submodule provides an `options_component`, the skeleton does not render the options form; the submodule owns its own UI. If the submodule does NOT provide an `options_component`, the skeleton falls back to auto-rendering a basic form from the manifest's `options[]` array.

**Submodule provides:** A React component registered in the manifest under `options_component`. This component receives the current saved options as props and calls `onChange(newOptions)` when the user modifies anything.

**Skeleton provides:**
- The accordion container (expand/collapse, teal header)
- Dirty-state tracking (compares current state to last saved state)
- [SAVE OPTIONS] button at the bottom of the accordion
- Persistence to `run_submodule_config.options` (see Part 10: Configuration Storage)

**[SAVE OPTIONS] button:**
- Active only if the submodule component has called `onChange()` with values different from the last saved state
- **Label when clean:** "Save Options (no changes)" (disabled/gray)
- **Label when dirty:** "Save Options" (active)
- Saves to: `run_submodule_config.options` in Supabase
- After save: button returns to disabled (no unsaved changes)

**[NEXT] button:**
- Always visible below [SAVE OPTIONS] in the Options accordion
- **Active when** `hasInput` is true (Input accordion has data from any source)
- **What it does:** If options are dirty, saves them first. Then collapses Options accordion, opens Results accordion, and triggers RUN TASK automatically (equivalent to clicking RUN TASK in the footer).
- This completes the guided flow: Input → Save → Options → Next → Run.
- If user prefers manual control, they can still use the footer RUN TASK button directly.

**Default values:** On first open, the skeleton loads defaults from the manifest's `options_defaults` object and passes them to the submodule component. If a saved config exists in `run_submodule_config`, those saved values are used instead of defaults.

**Templates:** Because options are stored in `run_submodule_config`, templates can copy these values to pre-configure submodules. Creating a run from a template copies `template_submodule_config` rows → `run_submodule_config` rows (see Part 10).

**Default state:** Collapsed. Default values loaded.

**No options component?** Two cases:
- `options_component` missing but `options[]` array exists in manifest → skeleton auto-renders a basic form from the `options[]` definitions (using `SubmoduleOptions` primitive component). Save button rendered.
- Both `options_component` and `options[]` missing → accordion header shows "No options" and the body shows "This submodule has no configurable options." No save button rendered.

---

### Results Accordion (pink)

**Purpose:** Show execution output, enable item-level review, and support approval.

**Always visible.** The Results accordion is always rendered — it is never hidden. Its content changes based on state.

#### Results: Before any run

```
┌─────────────────────────────────────────────────────┐
│ No results yet. Configure input and click RUN TASK. │
└─────────────────────────────────────────────────────┘
```

Empty state message. Collapsed by default but openable.

#### Results: During execution

```
┌─────────────────────────────────────────────────────┐
│ ⟳ Processing entity 3/5... Adyen                    │
│ ████████████░░░░░░░░ 60%                            │
└─────────────────────────────────────────────────────┘
```

Opens automatically when RUN TASK is clicked. Shows progress from `submodule_runs.progress` (updated by worker via `tools.progress.update()`). Frontend polls every 2s (see Part 15: Real-Time Status Updates).

#### Results: After completion

**The Results accordion is a pass-through container.** The skeleton does not own the content inside it. All result rendering is driven by `output_render_schema` (from the submodule's manifest `output_schema`) via ContentRenderer — the same component used in the Input content preview. The skeleton renders whatever the submodule returns, exactly as described by its schema.

**What the skeleton owns inside Results:**
- The pink accordion header (expand/collapse) + item count badge
- The summary line (total count, plus approved/rejected counts when selectable)
- The action buttons below results: [Change Input], [Change Options], [Download], [Try again]

**What the skeleton does NOT own inside Results:**
- How items are displayed (table, url_list, content_cards, file_list — all driven by `display_type` in render_schema)
- Whether checkboxes appear (driven by `selectable` in render_schema)
- Column headers, row layout, filtering — all driven by render_schema fields

**The `selectable` field in output_schema:**

The submodule's manifest declares `selectable: true` in its `output_schema` when item-level approval is needed. When `selectable` is true, ContentRenderer wraps each row with a checkbox and renders [Select all] / [Deselect all] controls. When `selectable` is false or absent, results render as read-only and APPROVE means "approve all items."

Default convention (submodule authors follow this, skeleton does not enforce it):
- ➕ add submodules → `selectable: false` (approve all discovered items)
- ➖ remove submodules → `selectable: true` (user picks what to filter out)
- ＝ transform submodules → `selectable: false` (approve all transformed items)

These are conventions, not rules. A ➕ submodule CAN declare `selectable: true` if it makes sense for its use case. The skeleton reads the schema and renders accordingly.

```
Example: selectable: false (Step 1 Discovery — ➕ add)
┌─────────────────────────────────────────────────────┐
│ 623 URLs found across sitemap.xml                    │
│ ─────────────────────────────────────────────────── │
│ https://stripe.com/payments            Stripe        │
│ https://stripe.com/billing             Stripe        │
│ https://stripe.com/connect             Stripe        │
│ https://paypal.com/business            PayPal        │
│ ... (scrollable, paginated)                          │
│ ─────────────────────────────────────────────────── │
│ Showing 1-50 of 623                                  │
│ [Change Input] [Change Options] [Download] [Try again]│
└─────────────────────────────────────────────────────┘

Example: selectable: true (Step 2 Validation — ➖ remove)
┌─────────────────────────────────────────────────────┐
│ 623 URLs checked · 3 flagged for removal             │
│ ─────────────────────────────────────────────────── │
│ [Select all]  [Deselect all]                         │
│                                                      │
│ ☑ https://stripe.com/payments     Stripe       ➕   │
│ ☑ https://stripe.com/billing      Stripe       ➕   │
│ ☐ https://stripe.com/404          Stripe       ➖   │
│ ☑ https://paypal.com/business     PayPal       ➕   │
│ ... (scrollable, paginated)                          │
│ ─────────────────────────────────────────────────── │
│ Showing 1-50 of 623 · 620 approved · 3 rejected     │
│ [Change Input] [Change Options] [Download] [Try again]│
└─────────────────────────────────────────────────────┘
```

**Per-row data operation icon (when selectable: true):** Each row shows ➕ or ➖ or ＝ matching the pane's data operation setting. This is a read-only visual indicator — not a per-item toggle. It reminds the user what will happen to these items when approved.

**Summary line:** Bottom of results. When `selectable: true`: shows total, approved, rejected counts (updates live as user checks/unchecks). When `selectable: false`: shows total count only.

**Actions below results:**
- [Change Input] — Opens/scrolls to Input accordion. User can upload new data or modify entities.
- [Change Options] — Opens/scrolls to Options accordion. User can adjust configuration.
- [Download] — Export current results (format depends on data type, not CSV-specific)
- [Try again] — Clears results, resets to INPUT READY state. Does NOT delete the previous submodule_run (preserved for history). Equivalent to: Change Input + re-run.

[Change Input] and [Change Options] keep the current results visible — the user can scroll between accordions. [Try again] is more destructive: it clears the results display and expects a new run.

#### Results: Reopening a completed submodule

When the user clicks a submodule row that was already run and approved:
- Results accordion shows the previous run's data via ContentRenderer (same render_schema)
- If `selectable: true`: checkboxes reflect previous approval states
- If `selectable: false`: results shown as read-only (same as first view)
- Previous Run Summary bar shows at top
- User can click [Try again] to re-run

---

### CTA Footer

Three buttons, always visible at the bottom. Sequential activation.

| CTA | Appearance | When enabled | What it does |
|-----|-----------|--------------|--------------|
| **RUN TASK** | Pink (primary) | `hasInput && !isRunning` | Creates BullMQ job. Opens Results accordion. Starts polling. `isRunning` is per-submodule (not per-pane) — tracked via the latest `submodule_runs` status for this submodule in this step. Other submodules in the same step can run concurrently. |
| **SEE RESULTS** | Gray (secondary) | `isCompleted` | Opens/scrolls to Results accordion |
| **APPROVE** | Green | `isCompleted` | Approves the submodule run. Updates working pool (using ➕➖＝ operation). Logs decision. Shows toast. Closes panel. |

**Disabled state:** Gray background, gray text, cursor not-allowed.

**After APPROVE:**
1. If `selectable: true` → `POST /api/submodule-runs/:id/approve` with checked item keys
2. If `selectable: false` (or absent) → `POST /api/submodule-runs/:id/approve` with ALL item keys (approve everything)
3. Server updates `submodule_runs.status` → "approved", stores `approved_items`
4. Server updates `pipeline_stages.working_pool` based on data operation (➕➖＝)
5. Decision logged automatically
6. Panel closes
7. Submodule row in CategoryCardGrid updates: checkbox checked, result count shown
8. StepSummary updates with new totals

**REJECT (implicit):** There is no explicit REJECT button. The user either:
- Clicks [Try again] in Results to re-run (creates new submodule_run, previous preserved)
- Closes the panel without approving (submodule stays in "completed" state, not "approved")
- When `selectable: true`: unchecks items individually and then approves (partial approval)

**CategoryCardGrid display by status:**
- `pending` — No indicator. Row is clickable.
- `running` — Spinner icon. Row shows progress message.
- `completed` (not approved) — Result count shown (e.g., "623 URLs") but checkbox unchecked. User must open and explicitly approve.
- `approved` — Checkbox checked. Result count shows approved count (e.g., "620 URLs").
- `failed` — Error icon. Row shows error message snippet.

**Panel close during execution:** If user closes the panel while a job is running, the job continues in the background. The CategoryCardGrid row shows spinner + progress. When the job completes, a toast notification appears: "Sitemap Parser completed — 623 results". Reopening the pane shows the Results accordion with data. The active `submodule_run_id` is tracked in the Zustand `panelStore` — on reopen, the pane resumes polling if status is still "running".

**Working pool race condition:** The UI disables all other APPROVE buttons in the same step while an approval is in flight. Only one working pool update can run at a time per step. This is enforced client-side (optimistic) and server-side (row-level lock on `pipeline_stages` during pool update).

---

### Pane State Machine

```
FRESH                    No previous run, no saved config, no inherited data
├── Input:    OPEN       Upload zone + empty content preview
├── Options:  collapsed  Defaults from manifest (or template)
├── Results:  empty      "No results yet" message
├── SAVE INPUT: disabled (nothing to save)
├── RUN TASK: disabled   No hasInput
├── SEE RESULTS: disabled
└── APPROVE:  disabled
        │
        ├──▶ auto-resolution finds inherited data → skip to INPUT READY
        │
        ▼ user uploads file / types entities
INPUT DIRTY
├── Content preview: shows parsed data from upload
├── SAVE INPUT: ENABLED  (unsaved changes detected)
├── RUN TASK: disabled   (must save first)
        │
        ▼ user clicks SAVE INPUT → persists to run_submodule_config
INPUT READY              (also entered directly if inherited data exists)
├── Input:    content preview shows data with source label
├── SAVE INPUT: disabled (nothing changed since save)
├── RUN TASK: ENABLED    (hasInput = true)
├── SEE RESULTS: disabled
└── APPROVE:  disabled
        │
        ▼ user clicks RUN TASK
RUNNING
├── Input:    locked (can't change during run)
├── Options:  locked
├── Results:  progress spinner, entity counter
├── RUN TASK: disabled (isRunning)
├── SEE RESULTS: disabled
└── APPROVE:  disabled
        │
        ▼ execution completes
COMPLETED
├── Results:  populated with items, checkboxes, summary
├── Results bottom: [Change Input] [Change Options] [Download] [Try again]
├── RUN TASK: enabled (can re-run)
├── SEE RESULTS: ENABLED
└── APPROVE:  ENABLED
        │
        ├──▶ user clicks APPROVE → panel closes, working pool updated
        ├──▶ user clicks [Change Input] → opens Input accordion
        ├──▶ user clicks [Change Options] → opens Options accordion
        └──▶ user clicks [Try again] → clears results, back to INPUT READY
```

---

### Skeleton-Owned vs Submodule-Owned

**Skeleton owns (all of the above):**
- Panel frame: header, description, data operation indicator, close button, slide-in from left
- Previous Run Summary bar
- Input accordion: resolution logic, upload area, file parsing via API, [SAVE INPUT] button
- Options accordion: container, dirty-state tracking, [SAVE OPTIONS] button, persistence
- Results accordion: result table, checkboxes, bulk actions, summary, pagination, download, [Change Input], [Change Options]
- CTA footer: RUN TASK, SEE RESULTS, APPROVE with activation logic
- Configuration persistence: all saves go to `run_submodule_config` in Supabase
- Backdrop, escape key, panel close behavior
- Working pool update on approve
- Decision logging on approve

**Submodule owns (via manifest + optional component):**
- `description` — text shown in description bar
- `data_operation_default` — ➕➖＝ initial setting
- `requires_columns` — what the upload must contain
- `item_key` — primary key for deduplication in results
- `options_defaults` — default configuration values
- `options_component` — React component rendered inside Options accordion (optional)
- `output_schema` — column definitions for the results table
- `execute()` function — the actual processing logic

The submodule provides data declarations and optionally an options UI component. The skeleton renders and persists everything else.

---

## Part 7: Data Operation Icons (➕ ➖ ＝)

Each submodule card shows a data operation indicator. This is visible on the card before the pane opens, and it's what makes one universal step template possible — the skeleton doesn't need to know what kind of step it's rendering.

| Icon | Manifest value | Meaning |
|------|---------------|---------|
| ➕ | `"add"` | Output gets added to the step's working data pool |
| ➖ | `"remove"` | Output replaces the pool with a smaller set |
| ＝ | `"transform"` | Output replaces the pool with transformed content (same quantity, different shape) |

**Default value:** Declared in the submodule's manifest via `data_operation_default`. A discovery submodule defaults to `"add"`. A filter submodule defaults to `"remove"`.

**User override:** The user can change the toggle on the card at any time before approving the step.

**Effect on step data:** When a submodule is approved, the step's working dataset updates immediately based on the card's current toggle setting. See Part 6 (Data Operation Indicator) for how this appears inside the pane, and Part 8 (Level 2) for the working pool update mechanics.

---

## Part 8: Three-Level Data Flow Mechanics

### Level 1: Between Steps — Database-Mediated

Step N finalizes → data saved to Supabase → Step N+1 loads that data.

Steps communicate exclusively through the database. No direct connections, no event passing, no callbacks. Step 3 doesn't know Step 1 exists — it reads whatever data is in Supabase for this run at this step.

This means:
- Steps can be reordered without code changes
- Steps can be skipped (previous output passes through unchanged)
- A step failure doesn't cascade
- Adding a new step requires zero changes to existing steps

**Flow:**
1. User clicks [APPROVE STEP] → skeleton aggregates approved items from all submodule runs
2. Writes aggregated results to `pipeline_stages.output_data` for step N
3. Sets step N status to "completed"
4. Sets step N+1 status to "active"
5. Step N+1 reads step N's output_data as its input_data

### Level 2: Within a Step — Sequential Chaining via Working Pool

Within a step, submodules chain sequentially. The user triggers them one at a time. There is no concurrent execution of sibling submodules.

Each step maintains a **running working pool** — an intermediate dataset that updates as submodules are approved. All operations are entity-scoped — Stripe's items never mix with PayPal's items.

**For ➕ submodules:** Every approved item is added to the pool, tagged with its entity. Multiple add-submodules stack their results. Deduplication by `item_key` within each entity — later approval wins.

**For ➖ submodules:** Approved items define what remains. Items not in the approved set are removed from the pool. Removals never cross entity boundaries. The next submodule receives the reduced set, not the original.

**For ＝ submodules:** Output replaces the pool with transformed content. Same items, different shape. Count may differ from original if user rejected items during approval.

**Initial state:** Previous step's output_data (or empty for Step 1).

**Entity scoping:** The working pool is organized by entity. When a run processes 5 companies, each company's items are tracked separately. Pool operations (➕➖＝) apply per-entity — adding URLs for Stripe never affects PayPal's URLs. Step output preserves entity grouping. The `entity_name` field on each item associates it with its entity.

**Step finalization:** When [APPROVE STEP] is clicked, the current working pool becomes the step's output_data and passes to the next step. Entity grouping is preserved.

**Persistence:** The working pool is stored in the `pipeline_stages` table in the `working_pool` JSONB column as **full item objects** (not references). Updated after each submodule approval. Server-as-truth — the frontend reads it, never computes it. Deduplication uses the submodule's `item_key` field — if two submodules produce items with the same key, the later approval wins.

**Working pool update logic (server-side, in approve route):**
1. Load current `working_pool` from `pipeline_stages` for this run + step
2. Load approved items: filter `submodule_runs.output_data` to only items whose `item_key` value is in `submodule_runs.approved_items`
3. Read the data operation from `run_submodule_config.data_operation` for this submodule. If null, fall back to the manifest's `data_operation_default`.
4. Apply operation to working pool:
   - ➕ (add): merge approved items into pool (union, deduplicated by `item_key` — later approval wins)
   - ➖ (filter): replace pool with approved items (the submodule's output IS the filtered result)
   - ＝ (transform): replace pool with approved items (same items, different shape — count may differ from original if user rejected items)
5. Write updated pool back to `pipeline_stages.working_pool`
6. Return updated pool summary to frontend (count, delta from previous)

**Concurrency protection:** The approve route wraps steps 1–5 in a database transaction with `SELECT ... FOR UPDATE` on the `pipeline_stages` row. This serializes concurrent approvals for the same step. The frontend also disables other APPROVE buttons while an approval is in flight (optimistic — the server lock is the real protection).

### Level 3: Within a Submodule — The Pane

See Part 6 for the complete pane specification. The pane has three accordions (Input, Options, Results), a data operation indicator, and a CTA footer. The skeleton owns the pane frame and persistence; submodules provide React components (options panels) and data through their manifest and execute function.


---

## Part 9: Shared Step Context

When a user uploads data in any submodule within a step, that data becomes available to all other submodules in the same step, same run.

**Two storage locations — different purposes:**
- `step_context` — Holds the actual entity data (parsed CSV rows). Shared across all submodules in the step. One per step per run. When any submodule uploads, it overwrites the step's shared context. All submodules see the same entities.
- `run_submodule_config.input_config` — Holds metadata about a submodule's input source selection: `{ source: "step_context" | "previous_step" | "manual", entity_count: N }`. Written by SAVE INPUT. Does NOT contain entity data — it records which source the submodule should read from.

**How it works:**
1. User uploads CSV in Submodule A → skeleton parses and writes entities to `step_context`, writes `{ source: "step_context" }` to Submodule A's `run_submodule_config.input_config`
2. User opens Submodule B → skeleton checks step_context → finds data → offers it as a banner inside the Input accordion's upload zone: "Found X entities from uploaded data. [Use these] [Upload different]". This replaces the empty upload dropzone. Not a modal — inline in the accordion body.
3. If user clicks [Use these] → writes `{ source: "step_context" }` to Submodule B's `input_config`
4. If user uploads different data → overwrites `step_context` with new data (all submodules now see the new data)

**Priority (mirrored from Part 6 auto-resolution):**
1. Saved input config exists → read source field, load from that source
2. Previous step output exists → use that
3. Shared step context exists → offer it
4. None → show upload prompt

**Scope:** Same step, same run. Not shared across steps or runs.

**Dynamic CSV template:** The skeleton generates a CSV template for each step by reading all manifests for submodules in that step and collecting every `requires_columns` into a union. Adding a new submodule with new column requirements automatically updates the template. Column order: columns are sorted alphabetically, with `name` always first (if present). Columns are literal — `website` and `url` are treated as different columns (no semantic matching).

### File Upload Flow (Server-Side)

All file parsing happens server-side. The browser uploads the raw file; the API parses, validates, and stores it. The frontend never interprets file contents.

**Why server-side:**
- Validation against manifest `requires_columns` needs manifest data (server owns manifests)
- Size limits enforced before parsing
- Consistent parsing across browsers
- Error messages are standardized

**Flow:**
1. User drops/selects file in Input accordion upload area
2. Frontend sends: `POST /api/runs/:runId/steps/:stepIndex/context` with `multipart/form-data`
3. API receives file, detects type (CSV, XLSX, JSON by extension/mime)
4. API parses file → extracts rows → validates columns against step's union of `requires_columns`
5. API writes to `step_context` table: `{ run_id, step_index, source_submodule: "submodule-id", entities: [{ name: "Company A", website: "companya.com" }, ...] }`
6. API returns: `{ entity_count: 5, columns_found: ["name", "website", "linkedin"], columns_missing: [] }`
7. Frontend enables RUN TASK button (`hasInput = true`)

**Supported file types in v1:** CSV, XLSX. Others return `415 Unsupported Media Type`.

**Size limit:** 10MB per file, 10,000 rows. Configurable via environment variables.

---

## Part 10: Database Schema

### Core Pipeline Tables

**projects**

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| name | TEXT | |
| description | TEXT | Optional project description, shown in project list |
| timing | TEXT | Reserved for scheduling (v2). Placeholder values: "one-off", "scheduled", "continuous". Nullable, disabled in v1. |
| template_id | UUID (FK, nullable) | Reserved for template system (v2). No templates table in v1 — column exists for forward compatibility. |
| status | TEXT | "active", "archived" |
| created_at | TIMESTAMPTZ | |

**pipeline_runs** — One execution of a project through the 11-step sequence.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| status | TEXT | "running", "completed", "failed", "paused" |
| current_step | INTEGER | Which step the run is currently on (0–10) |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | Null until run completes |

**pipeline_stages** — One step's data within a run.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| run_id | UUID (FK → pipeline_runs) | |
| step_index | INTEGER | 0–10 |
| step_name | TEXT | From STEP_CONFIG |
| status | TEXT | "pending", "active", "completed", "skipped" |
| input_data | JSONB | Data received from previous step |
| input_render_schema | JSONB | How to render input_data — copied from previous step's output_render_schema |
| output_data | JSONB | Approved results from this step (becomes next step's input) |
| output_render_schema | JSONB | How to render output_data — copied from producing submodule's output_schema |
| working_pool | JSONB | Current intermediate dataset, updated after each submodule approval |
| working_pool_render_schema | JSONB | How to render working_pool — recomputed on each pool update. For tabular data: union of all contributing submodules' output_schema fields. For non-tabular steps: `display_type` from the most recent contributing submodule. |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |

**submodule_runs** — One execution of one submodule within a step.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| stage_id | UUID (FK → pipeline_stages) | |
| run_id | UUID (FK → pipeline_runs) | |
| submodule_id | TEXT | Matches manifest id |
| status | TEXT | "pending", "running", "completed", "failed", "approved", "rejected" |
| options | JSONB | Option values configured for this run |
| input_data | JSONB | What was fed to the submodule |
| output_data | JSONB | Raw results from execute() |
| output_render_schema | JSONB | How to render output_data — from this submodule's manifest output_schema |
| approved_items | JSONB | Array of `item_key` values the user approved (e.g., `["https://a.com", "https://b.com"]`). Server uses these to filter `output_data` when building the working pool. |
| progress | JSONB | `{ current, total, message }` — updated during execution by worker |
| error | TEXT | Error message if execution failed |
| logs | JSONB | Array of {level, message, timestamp} from tools.logger |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |

**step_context** — Shared data within a step (CSV sharing mechanism).

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| run_id | UUID (FK → pipeline_runs) | |
| step_index | INTEGER | |
| entities | JSONB | Parsed entity data — array of objects with columns as keys |
| filename | TEXT | Original uploaded filename (shown in auto-resolution label: "From {submodule_name} upload ({filename})") |
| source_submodule | TEXT | Which submodule uploaded the data |
| created_at | TIMESTAMPTZ | |

Unique constraint on (run_id, step_index) — intentionally one context per step per run. All submodules in the step share the same uploaded data. A new upload by any submodule overwrites the shared context (see Part 9).

**decision_log** — Every human judgment recorded.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| run_id | UUID (FK → pipeline_runs) | |
| step_index | INTEGER | |
| submodule_id | TEXT | |
| entity_id | TEXT (nullable) | Which entity this decision was about. Null for step-level decisions (step_approved, step_skipped). |
| decision | TEXT | "approved", "rejected", "re-run", "skipped", "rerouted" |
| reason | TEXT | Optional — why the user made this decision |
| context | JSONB | Snapshot of relevant data at decision time |
| decided_at | TIMESTAMPTZ | |

### Configuration Storage

**run_submodule_config** — Persisted input/options/operation choices per submodule per step per run. This is what SAVE INPUT, SAVE OPTIONS, and the ➕➖＝ toggle write to. Also what templates copy from.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| run_id | UUID (FK → pipeline_runs) | |
| step_index | INTEGER | |
| submodule_id | TEXT | Matches manifest id |
| input_config | JSONB | What input source, entity count, manual entries — written by SAVE INPUT |
| options | JSONB | `{key: value}` — written by SAVE OPTIONS. Null = use manifest defaults |
| data_operation | TEXT | "add", "remove", "transform" — null = use manifest default |
| updated_at | TIMESTAMPTZ | |

Unique constraint on `(run_id, step_index, submodule_id)` — one config row per submodule per step per run. Uses upsert on save.

**template_submodule_config** — Same shape, for templates. When creating a run from a template, rows are copied: `template_submodule_config` → `run_submodule_config`.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| template_id | UUID (FK → templates) | |
| step_index | INTEGER | |
| submodule_id | TEXT | |
| input_config | JSONB | Pre-configured input source |
| options | JSONB | Pre-configured options |
| data_operation | TEXT | Pre-configured operation override |

Unique constraint on `(template_id, step_index, submodule_id)`.

**Note:** Both `template_submodule_config` and its FK target `templates` are deferred — created when the template system is implemented (v2). Not part of the initial build.

### Content Library Tables (Deferred — Module-Level)

Content storage tables (`content_items`, `platform_tags`, `content_tags`) are not part of the skeleton schema. They belong to Step 10 (Distribution) submodules and will be defined when those submodules are built. The skeleton does not read from or write to content library tables.

### Schema Principles

- **Content reuse:** Content stored once by source_url. Multiple projects reference the same content.
- **Freshness flags, not gates:** Stale content is flagged but never blocked.
- **Conflict resolution:** On re-process, newer version wins with version increment.
- **Tiered retention:** Filtered content keeps metadata but JSONB body is nulled after 7 days.


---

## Part 11: The Manifest Contract

Every submodule has a `manifest.json` that tells the skeleton everything it needs to know. The skeleton never reads `execute.js` to understand a submodule — the manifest is the complete interface declaration.

### Manifest Shape

```json
{
  "id": "example-submodule",
  "name": "Example Submodule",
  "description": "One-line explanation of what this submodule does.",
  "version": "1.0.0",
  "step": 1,
  "category": "example-category",
  "cost": "cheap",
  "data_operation_default": "add",

  "requires_columns": ["website"],

  "options": [
    {
      "name": "max_results",
      "type": "number",
      "label": "Maximum Results",
      "description": "Limit total results returned per entity.",
      "default": 1000,
      "min": 1,
      "max": 50000
    },
    {
      "name": "include_nested",
      "type": "boolean",
      "label": "Include nested sources",
      "description": "Follow references to discover additional sources.",
      "default": true
    },
    {
      "name": "filter_mode",
      "type": "select",
      "label": "Filter mode",
      "description": "Which patterns to include.",
      "default": "all",
      "values": ["all", "pages_only", "custom_regex"]
    }
  ],

  "options_defaults": {
    "max_results": 1000,
    "include_nested": true,
    "filter_mode": "all"
  },

  "options_component": "./OptionsPanel.jsx",

  "item_key": "url",

  "output_schema": {
    "display_type": "table",
    "url": "string (required)",
    "source_category": "string",
    "depth": "number",
    "last_modified": "string (ISO date, if available)"
  }
}
```

### Field Reference

**id** — Unique identifier. Used in database records, file paths, API calls. URL-safe (lowercase, hyphens). Once set, never changes.

**name** — Human-readable display name. Shown on submodule cards.

**description** — One-line explanation. Shown in UI on hover or expand.

**version** — Semantic version. Allows skeleton to detect manifest changes.

**step** — Which step this submodule belongs to (0–10). A submodule appears in exactly one step.

**category** — Visual grouping within a step. Categories are visual only — they help users find submodules. No functional meaning.

**cost** — Cost tier: "cheap", "medium", "expensive". Used for BullMQ job priority and timeout thresholds. Not displayed on UI cards in v1.

**data_operation_default** — "add", "remove", or "transform". Default ➕➖＝ toggle value shown on card. User can override.

**requires_columns** (required) — Which columns must exist in entity data for this submodule to run. Skeleton uses this to check shared step context and determine executability. If required columns are missing, skeleton shows a message explaining what's needed. For Step 1 modules, columns are checked on entity-level fields (e.g., `["website"]` checks `entity.website`). For Step 2+ modules, columns are checked on item-level fields within `entity.items` (e.g., `["url"]` checks `entity.items[0].url`).

**options** — Array describing the submodule's configurable fields. Used for two purposes:
1. **Documentation/schema** — The skeleton can use this to validate saved config values, generate help text, and understand defaults.
2. **Fallback rendering** — If a submodule does not provide an `options_component`, the skeleton MAY use this array to render a basic auto-generated form as a fallback.

Each option has:
- `name` — Key used in options object passed to execute()
- `type` — "boolean" (toggle), "number" (number input), "text" (text input), "select" (dropdown), "textarea" (multiline)
- `label` — Display label
- `description` — Help text
- `default` — Pre-filled value
- Type-specific constraints: `min`/`max` for numbers, `values` for selects, `maxLength` for text

**options_component** — (optional) Path to a React component that renders the Options accordion body. If provided, this component takes full control of the options UI. Receives `{ options, onChange }` as props. If not provided, the skeleton can fall back to auto-rendering from the `options` array.

**options_defaults** — Object of `{key: value}` pairs. These are the starting values when no saved config exists. Typically derived from the `options[].default` values, but declared separately so the skeleton can read them without parsing the full options array.

**item_key** — Which field(s) in output items uniquely identify a result. Used for: (1) tracking across re-runs — matching new results to previously approved/rejected items, (2) deduplication when merging into the working pool. Uniqueness is scoped to the step's working pool — two submodules in the same step producing the same `item_key` value means the later approval overwrites the earlier one. Can be a single field name (string) or an array for composite keys.

**output_schema** — Describes the shape of each result item plus rendering instructions for ContentRenderer. Key fields:
- `display_type` — How to visualize: `"table"` (columnar), `"url_list"` (one URL per row), `"content_cards"` (article/document cards), `"file_list"` (filename + size + timestamp). Falls back to `"table"` if omitted. See Part 6 for the exhaustive display_type list.
- `selectable` — Boolean. When `true`, ContentRenderer adds item-level checkboxes + Select all/Deselect all controls. When `false` or absent, results render as read-only and APPROVE means "approve all items." Convention: ➖ remove submodules set `selectable: true`, ➕ add and ＝ transform submodules leave it `false`.
- Field definitions — Used for results display column headers and for `render_schema` passed downstream. Not enforced at runtime in v1.

### What the manifest does NOT include

- No database configuration (submodules don't access the database)
- No dependency declarations (submodules use only tools object + standard Node.js)

---

## Part 12: The Tools Object

When the skeleton executes a submodule, it passes three arguments: `input`, `options`, and `tools`. The tools object is the submodule's only bridge to the outside world.

### Tools Interface

```
tools.logger
  .info(message)     — Log informational message
  .warn(message)     — Log warning
  .error(message)    — Log error
  Logged to: submodule_runs.logs (JSONB array) + server console.
  UI displays logs in real-time by polling the submodule_runs record.

tools.http
  .get(url, options)  — GET request
  .post(url, body, options) — POST request
  Options: { timeout: ms (default 30000), headers: {} }
  Returns: { status, headers, body }
  Skeleton wraps to add: rate limiting, retry logic, timeout handling, logging.
  Submodules never use raw fetch() or axios.

tools.progress
  .update(current, total, message) — Report execution progress
  Example: tools.progress.update(45, 100, "Processing entity 45 of 100")
  Worker writes to submodule_runs.progress JSONB column.
  Frontend polling picks up the update every 2s and renders in Results accordion.
  Optional — long-running submodules should call it so users see activity.
```

### What tools does NOT provide

- No database access (no tools.db)
- No queue access (no tools.queue)
- No file system write access
- No access to other submodules' data
- No access to configuration outside of `options`

### Future tools (not in v1)

- `tools.ai.generate(prompt, options)` — Wrapped AI client with model selection, cost tracking, retry logic. Submodules never import an LLM SDK directly.
- `tools.cache.get(key)` / `tools.cache.set(key, value)` — Cross-run caching for submodules that benefit from it.

Added when needed, not prebuilt.

---

## Part 13: Module Auto-Discovery

No registration step. No configuration file listing submodules.

### How it works

At startup, the skeleton's moduleLoader service:

1. Reads MODULES_PATH environment variable
2. Scans for directories matching `step-{N}-{name}/{submodule-name}/`
3. Reads `manifest.json` in each submodule directory
4. Validates (required fields present, id unique, step number valid)
5. Registers in an in-memory registry

When UI requests submodules for a step, skeleton returns all registered submodules where `manifest.step === requestedStep`.

### Adding a new submodule

1. Create folder: `modules/step-{N}-{name}/new-submodule/`
2. Add `manifest.json`
3. Add `execute.js`
4. Add React components if needed (e.g., `OptionsPanel.jsx` referenced by `options_component`)
5. Restart skeleton (or hot-reload in future version)

No other changes. Skeleton discovers, UI shows it, user can run it.

### Validation

At startup, moduleLoader rejects invalid manifests and logs warnings. Invalid means: missing required fields, duplicate id, invalid step number, malformed options array. Invalid submodules don't crash the skeleton — they're skipped.


---

## Part 14: The Execute Function Contract

Every submodule's `execute.js` exports a single async function.

### Signature

```javascript
async function execute(input, options, tools) → results
```

### Input

```javascript
{
  entities: [
    { name: "Company A", website: "companya.com", additional_field: "..." },
    { name: "Company B", website: "companyb.com" }
  ],
  run_id: "uuid",
  step_index: 1,
  submodule_id: "example-submodule"
}
```

`entities` is an array of objects. Each has at minimum a `name` field. Other fields depend on uploads and shared context. The submodule should check for required fields and handle missing ones gracefully (skip entity, log warning).

**Step 2+ input enrichment:** For steps beyond Step 1, the skeleton attaches items from the previous step's output (the working pool) to each entity. The `items` array contains the accumulated, approved items grouped by `entity_name`:

```javascript
// Step 2+ entity shape — entities carry items from previous step
{
  entities: [
    {
      name: "Company A",
      website: "companya.com",
      items: [
        { url: "https://companya.com/about", last_modified: "2024-01-01" },
        { url: "https://companya.com/products", last_modified: "2024-02-15" }
      ]
    },
    {
      name: "Company B",
      website: "companyb.com",
      items: [
        { url: "https://companyb.com/page1", last_modified: "2024-03-01" }
      ]
    }
  ],
  run_id: "uuid",
  step_index: 2,
  submodule_id: "url-dedup"
}
```

The skeleton builds this by reading `pipeline_stages.working_pool` (or `output_data` for step transitions), grouping items by `entity_name`, and attaching them to the matching entity object. Original entity fields (name, website, etc.) are preserved. If an entity has no items from the previous step, `items` is an empty array.

Step 1 submodules never have `items` — they receive the raw upload entities. Step 2+ submodules should always read `entity.items` for their processing data.

### Options

Loaded from `run_submodule_config.options` (saved via SAVE OPTIONS in the pane). Falls back to `manifest.options_defaults` if no saved config exists. Keys match manifest `options[].name`:

```javascript
{ max_results: 1000, include_nested: true, filter_mode: "all" }
```

### Return Value

```javascript
{
  results: [
    {
      entity_name: "Company A",
      items: [
        { url: "https://companya.com/about", depth: 1 },
        { url: "https://companya.com/products", depth: 1 }
      ],
      meta: { total_found: 142, filtered: 12, errors: 0 }
    },
    {
      entity_name: "Company B",
      items: [...],
      meta: {...}
    }
  ],
  summary: {
    total_entities: 2,
    total_items: 284,
    errors: []
  }
}
```

**Per-entity grouping required.** Skeleton displays results grouped by entity for approve/reject per entity or per item.

**Summary required.** Skeleton uses it for status line and card badge.

### Error Handling

Partial success: return results for successful entities, include errors:

```javascript
{
  results: [
    { entity_name: "Company A", items: [...], meta: { total_found: 142 } },
    { entity_name: "Bad Domain", items: [], error: "DNS resolution failed", meta: { errors: 1 } }
  ],
  summary: { total_entities: 2, total_items: 142, errors: ["Bad Domain: DNS resolution failed"] }
}
```

Total failure: throw. Skeleton catches, marks submodule_run as "failed", displays error.

---

## Part 15: Job Queue (BullMQ)

User clicks [Run Task] → API creates job → Worker picks up → Worker executes submodule → Worker writes results to Supabase.

### Queue Design

One queue: `pipeline-stages`. Job payload is minimal — just IDs. The worker loads all data fresh from the database:

```javascript
{
  submodule_run_id: "uuid",
  submodule_id: "example-submodule",
  step_index: 1
}
```

The worker reads `input_data` and `options` from the `submodule_runs` row (populated by the execute route at creation time). This ensures the worker always uses exactly what was resolved at job creation.

### Worker Logic

The stageWorker processes jobs:

1. Read job data
2. Look up submodule by id in module registry
3. Load execute.js from submodule's directory
4. Load saved config from `run_submodule_config` → merge with manifest defaults for `options`
5. Build tools object
6. Call `execute(input, options, tools)` — options = saved config merged over defaults
7. Snapshot: copy resolved `options` to `submodule_runs.options` (audit trail)
8. On success: write results to `submodule_runs.output_data`, copy manifest `output_schema` → `submodule_runs.output_render_schema`, status → "completed"
9. On failure: write error to `submodule_runs.error`, status → "failed"

### Configuration

| Setting | Cheap | Medium | Expensive |
|---------|-------|--------|-----------|
| Timeout | 5 min | 15 min | 30 min |
| Retries | 3 | 2 | 1 |
| BullMQ priority | 1 (highest) | 5 | 10 (lowest) |

**Concurrency:** 2 jobs simultaneously. A slow expensive job doesn't block a fast cheap job.

### Why Not Direct Execution

BullMQ adds: persistence (job recovery on crash), isolation (misbehaving submodule can't crash API), visibility (job status tracking), future scaling (workers on separate machines).

### Real-Time Status Updates

The frontend needs to know when a BullMQ job completes. Two approaches:

**v1: Polling**
- After clicking RUN TASK, frontend polls `GET /api/submodule-runs/:id` every 2 seconds
- Response includes `status` field: `pending`, `running`, `completed`, `failed`
- On `completed`: stop polling, load results, enable APPROVE
- On `failed`: stop polling, show error in Results accordion
- Timeout: stop polling after 10 minutes, show "job may still be running" message

**Why polling for v1:**
- Simple — no WebSocket server, no connection management
- Stateless — survives page refresh (just resume polling)
- Supabase handles the reads efficiently (indexed by id)

**v2 option: Server-Sent Events (SSE)**
- `GET /api/runs/:runId/events` — long-lived connection
- Server pushes: `{ type: "submodule_complete", submodule_run_id, result_count }`
- Lower latency, no wasted requests
- Add when polling becomes a bottleneck

**Progress updates during execution:**
- Worker updates `submodule_runs.progress` field: `{ current: 3, total: 5, message: "Processing entity 3/5" }`
- Frontend polling picks up progress and renders it in the Results accordion spinner area
- Submodules report progress via `tools.progress.update(current, total, message)`

---

## Part 16: API Routes

Express routes the React frontend calls. Every route is a skeleton operation — no business logic.

### Projects
- `POST /api/projects` — Create project
- `GET /api/projects` — List projects
- `GET /api/projects/:id` — Get project details

### Runs
- `POST /api/projects/:id/runs` — Create new run
- `GET /api/runs/:id` — Get run status, current step
- `PATCH /api/runs/:id` — Update run (pause, resume)

### Steps
- `GET /api/runs/:runId/steps/:stepIndex` — Get step data (input, output, working pool, submodule runs)
- `POST /api/runs/:runId/steps/:stepIndex/approve` — Approve step (aggregate and advance)
- `POST /api/runs/:runId/steps/:stepIndex/skip` — Skip step (pass through and advance)

#### Step Approval — Server Logic

`POST /api/runs/:runId/steps/:stepIndex/approve` does all of this in a single transaction:

1. **Validate:** At least one submodule_run has status "approved" for this stage. If not → 400 error.
2. **Finalize pool:** Copy `pipeline_stages.working_pool` → `pipeline_stages.output_data` for this step.
3. **Mark complete:** Set `pipeline_stages.status` → "completed", set `completed_at`.
4. **Prepare next step:** Set next `pipeline_stages.status` → "active", copy this step's `output_data` → next step's `input_data`, copy `output_render_schema` → next step's `input_render_schema` (so the next step's Input accordion knows how to render the incoming data), initialize next step's `working_pool` from `input_data`.
5. **Update run:** Set `pipeline_runs.current_step` → next step index.
6. **Log decision:** Insert decision_log entry with type "step_approved", counts of approved/rejected items per submodule.
7. **Return:** `{ step_completed: stepIndex, next_step: stepIndex + 1, items_forwarded: count }`

If this is the last step (step 10), mark the run as "completed" instead of advancing.

#### Step Skip — Server Logic

`POST /api/runs/:runId/steps/:stepIndex/skip`:

1. Copy `input_data` → `output_data` unchanged (pass-through).
2. Set status → "skipped".
3. Prepare next step same as approval.
4. Log decision with type "step_skipped".

### Submodules
- `GET /api/submodules` — List all registered submodules
- `GET /api/submodules?step=1` — List submodules for a step
- `POST /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/run` — Execute submodule
- `GET /api/submodule-runs/:id` — Get run status and results
- `POST /api/submodule-runs/:id/approve` — Approve results
- `POST /api/submodule-runs/:id/reject` — Reject results

#### Execute Submodule — Server Logic

`POST /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/run`

**Request body:** `{}` (empty — server resolves input from auto-resolution priority)

**Server logic:**
1. **Check no active run:** Query `submodule_runs` for this submodule with status "pending" or "running". If found → 409 Conflict.
2. **Resolve input:** Follow auto-resolution priority (saved input_config source → previous step output → step_context). Load entity data.
3. **Load options:** Read from `run_submodule_config.options`. If null, use manifest `options_defaults`.
4. **Create submodule_runs row:** Insert with status "pending", input_data = resolved entities, options = resolved options, output_render_schema = manifest's output_schema.
5. **Create BullMQ job:** `{ submodule_run_id, submodule_id, step_index }`. The worker loads input_data and options fresh from the submodule_runs row (not from the job payload).
6. **Return:** `{ submodule_run_id: "uuid", status: "pending" }`

#### Get Submodule Run — Response Shape

`GET /api/submodule-runs/:id`

**Response:**
```json
{
  "id": "uuid",
  "submodule_id": "sitemap-parser",
  "status": "completed",
  "progress": { "current": 200, "total": 200, "message": "Done" },
  "output_data": { "results": [...], "summary": {...} },
  "output_render_schema": { "display_type": "table", "url": "string", ... },
  "approved_items": ["url1", "url2"],
  "error": null,
  "started_at": "...",
  "completed_at": "..."
}
```

Note: `output_data` can be large. Frontend should cache and only re-fetch on status change.

#### Approve Submodule Run — Server Logic

`POST /api/submodule-runs/:id/approve`

**Request body:** `{ "approved_item_keys": ["url1", "url2", ...] }`

**Server logic:**
1. **Validate:** submodule_run status must be "completed". If not → 400.
2. **Store:** Update `submodule_runs.approved_items` = request body's `approved_item_keys`.
3. **Update status:** Set status → "approved".
4. **Update working pool:** Execute working pool update logic (see Part 8). Read data_operation from saved config or manifest default. Filter output_data to approved items. Apply operation to pool.
5. **Log decision:** Insert decision_log entries for each approved/rejected item.
6. **Return:** `{ status: "approved", pool_count: N, pool_delta: +M }`

#### Get Submodules List — Response Shape

`GET /api/submodules?step=1`

**Response:**
```json
[
  {
    "id": "sitemap-parser",
    "name": "Sitemap Parser",
    "description": "...",
    "category": "crawling",
    "cost": "cheap",
    "data_operation_default": "add",
    "latest_run": {
      "id": "uuid",
      "status": "approved",
      "result_count": 623,
      "approved_count": 620
    }
  }
]
```

The `latest_run` field is populated per run context. `CategoryCardGrid` uses `latest_run.status` to show checkboxes and counts. `category` is used for grouping into cards.

### Context
- `POST /api/runs/:runId/steps/:stepIndex/context` — Upload entity data
- `GET /api/runs/:runId/steps/:stepIndex/context` — Get step context

### Submodule Configuration
- `PUT /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/config` — Upsert config (SAVE INPUT, SAVE OPTIONS, ➕➖＝ toggle). Body: `{ input_config?, options?, data_operation? }` — partial updates, only provided fields are written.
- `GET /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/config` — Get saved config (or null if no overrides)

### Decision Log
- `POST /api/decisions` — Log a decision (called automatically by approve/reject routes)
- `GET /api/runs/:runId/decisions` — Get decision history

### API Principles

- All routes return JSON
- All mutations return the updated record
- Error responses include `message` field
- Routes use `db.js` service (no direct Supabase imports)
- Routes use `queue.js` service (no direct BullMQ imports)


---

## Part 17: Approval Mechanics

### Three Levels

**Item-level** — Within results, user approves/rejects individual items. Fine-grained control.

**Submodule-level** — After reviewing items, user finalizes the submodule run. "Approved" means the user is satisfied (even if some items were rejected).

**Step-level** — After desired submodules are approved, user approves the step. Triggers aggregation and advances to next step.

### State Machines

**Submodule run:**
```
pending → running → completed → approved
                              → rejected
                  → failed
```

**Step:**
```
pending → active → completed (approved)
                 → skipped
```

**Run:**
```
running → completed (all steps done)
        → paused
        → failed
```

### Rules

- Step cannot be approved until at least one submodule is approved
- Step can be skipped at any time
- Submodule can be re-run after completion (new submodule_run, previous preserved)
- **Only the most recent approved run per submodule contributes to step aggregation.** Previous approved runs stay in history but don't affect the working pool.
- Item approvals are per submodule_run — re-run creates fresh items
- Step approval aggregates only from the latest approved submodule_run per submodule
- Run advances linearly (0 → 1 → 2 → ... → 10). No jumping ahead.
- **Re-approval:** User can reopen an approved submodule, modify item selections, and click APPROVE again. This updates `approved_items`, re-triggers the working pool update, and logs a new decision. State remains "approved" — no new submodule_run is created.

### Bulk Filter-and-Approve

The ResultsTable supports column filtering. Approve/reject actions apply to currently visible (filtered) rows, not the full dataset. This lets users handle high-volume results efficiently — filter to a pattern, approve those, filter to another pattern, reject those.

---

## Part 18: Decision Logging

Every human judgment is recorded automatically. This is infrastructure for the calibration pattern described in Strategic Architecture.

### What Gets Logged

| Action | Decision value | Context captured |
|--------|---------------|-----------------|
| Approve an item | "approved" | Entity, item data, source submodule |
| Reject an item | "rejected" | Entity, item data, optional reason |
| Re-run a submodule | "re-run" | Submodule, changed options |
| Skip a step | "skipped" | Step index |
| Approve a step | "step_approved" | Approved/rejected counts per submodule |

### Logging is Automatic

Built into the skeleton's approval routes, not submodules. When the frontend calls `POST /api/submodule-runs/:id/approve`, the route handler updates the record AND writes a decision_log entry. Submodules don't know about decision logging.

### v1 Scope

Decisions are logged but not analyzed. No rule engine, no automation. The log grows. Historical data will be there when calibration rules are built later.

---

## Part 19: UI Components

The skeleton provides these React components. All are step-agnostic and submodule-agnostic.

### Existing Components (current codebase)

| Component | Location | What it does |
|-----------|----------|-------------|
| `StepContainer` | `components/steps/` | Accordion wrapper for each step. Shows step number, title, description, status badge, result summary. Expand/collapse. |
| `CategoryCardGrid` | `components/shared/` | Grid of category cards. Click to expand inline, shows submodules list. Submodule row opens panel. |
| `SubmodulePanel` | `components/shared/` | Slides from LEFT. Header with step/submodule name. Generic accordion sections (Input/Options/Results). Fixed CTA row at bottom. |
| `StepSummary` | `components/shared/` | Per-submodule summary rows. Each row shows one non-idle submodule with its data op icon, name, and result text. NOT an aggregate line. |
| `StepApprovalFooter` | `components/shared/` | [APPROVE STEP] / [SKIP STEP] buttons with loading state. |

### Primitive Components

| Component | Location | What it does |
|-----------|----------|-------------|
| `CsvUploadInput` | `components/primitives/` | File upload for CSV files |
| `UrlTextarea` | `components/primitives/` | Textarea for pasting URLs |
| `SubmoduleOptions` | `components/primitives/` | Fallback options renderer from manifest `options[]` array (used when submodule has no `options_component`) |
| `ResultsList` | `components/primitives/` | Displays results with approve/reject |
| `ContentRenderer` | `components/primitives/` | Pass-through renderer that reads `render_schema.display_type` and selects the appropriate display mode (table, url_list, content_cards, file_list). Used in both Input content preview and Results accordion. See Part 6 for display_type definitions. |

### State Management

| Store | Purpose |
|-------|---------|
| `appStore` | Toast notifications, UI flags |
| `panelStore` | Which panel is open, which accordion expanded |
| `pipelineStore` | Step expansion state |
| `discoveryStore` | Step 1 specific UI state (to be generalized) |

**TanStack Query:** Project list, run data, step data, submodule run results (via `useStepCategories`, `useFinalizeStep`, etc.)

**Zustand:** UI-only state (panel open, accordion expanded, toast)

---

## Part 20: Infrastructure

| Component | Technology |
|-----------|-----------|
| Server | Hetzner CX22 VPS (2 vCPU, 4GB RAM, Ubuntu 24.04) |
| Database | Supabase PostgreSQL |
| Job queue | Redis + BullMQ on Hetzner |
| Runtime | Node.js 20 LTS |
| API | Express.js |
| Process manager | PM2 |
| Frontend | React 18 + TypeScript + Vite + Tailwind |
| Server state | TanStack Query |
| UI state | Zustand (if needed) or React hooks |
| Tables | TanStack Table |

### Local Development vs Production

| Concern | Local | Production (Hetzner) |
|---------|-------|---------------------|
| API server | `node server/server.js` on localhost:3001 | PM2 managed |
| Frontend | Vite dev server on localhost:5173 | Built static files served by Express |
| Redis | Local Redis (`brew install redis`) or Docker | Installed on Hetzner |
| BullMQ worker | Same process or separate terminal | PM2 as separate process |
| Database | Same Supabase instance (dev project) | Same Supabase instance (prod project) |
| Submodules path | `MODULES_PATH=../modules-repo` (local checkout) | `MODULES_PATH=/opt/modules` (deployed) |
| File uploads | Stored in `/tmp/uploads` | Stored in `/var/uploads` on Hetzner |

**Startup (local):**
```bash
# Terminal 1: Redis
redis-server

# Terminal 2: API + Worker
MODULES_PATH=../content-pipeline-modules-v2 node server/server.js

# Terminal 3: Frontend
cd client && npm run dev
```

**dev.sh script** handles port conflicts and starts all services. See `dev.sh` in repo root.

---

## Part 21: Code Architecture — Two-Repo Migration

When splitting into the two-repo structure:

**Skeleton repo gets:**
- All shared components (StepContainer, CategoryCardGrid, SubmodulePanel, StepSummary, StepApprovalFooter)
- All primitive components (CsvUploadInput, UrlTextarea, SubmoduleOptions, ResultsList)
- All stores (appStore, panelStore, pipelineStore)
- All hooks (useStepCategories, useFinalizeStep, useUrlParams)
- Server (server.js, routes/, services/, workers/)
- SQL schema

**Modules repo gets:**
- Submodule folders with manifest.json + execute.js + React components (options panels, custom renderers)
- No database access (uses tools object)
- No skeleton infrastructure code (no routes, services, workers, shared components)

**What to generalize:**
- `discoveryStore` → generic step UI state (not step-1 specific)
- `Step1Discovery.tsx`, `Step1Panel.tsx` → patterns extracted into universal components
- Hardcoded `'discovery'` type strings → use manifest step index

**Dedicated module mount point:** The skeleton reads `MODULES_PATH` environment variable to find submodule folders. During development, this points to a local modules repo checkout.

---

## Part 22: What This Document Doesn't Cover

These topics live in companion documents or are deferred:

- **Individual submodule specifications** — What each submodule does, its options, its output format (Module Decisions document)
- **Content type configurations** — How different content types differ in the pipeline
- **Template system** — How templates save and restore configurations
- **External system integration details** — API authentication, field mappings, content type schemas
- **Tag management** — How tags are loaded and maintained
- **AI provider integration** — Model selection, prompt management, cost tracking
- **Monitoring, deployment, testing** — Operational concerns
- **Strategic reasoning** — Why decisions were made (see STRATEGIC_ARCHITECTURE.md)

---

## Appendix: Documents This Spec Replaces

The following documents are superseded by this spec and should be moved to archive:

| Document | What it contained | Where it went |
|----------|------------------|--------------|
| SKELETON_SPEC.md (v1.2, Feb 7) | Original skeleton spec with submodule-specific examples baked in | Superseded. All valid content captured here without submodule leakage. |
| SKELETON_DEFINITION_v2.md (Feb 8) | Building/apartment principle, universal pane template, two-level CTA system, data operation toggles | Merged into Parts 1, 5, 6, 7. |
| SKELETON_SPEC_DELTA.md (Feb 8) | Four agreed changes: ➕➖＝ icons, intra-step chaining, internal accordion CTAs, universal step template | Merged into Parts 5, 6, 7, 8. No longer "delta" — now part of the main spec. |

The governing strategy document **STRATEGIC_ARCHITECTURE.md** is unchanged and remains the authoritative source for principles, reasoning, and intent.
```

---
## SPEC: BUILD_PLAN.md
```markdown
# Content Creation Tool — Build Plan

> **Version:** 2.0 — February 10, 2026
> **Reads from:** SKELETON_SPEC_v2.md, SUBMODULE_DEVELOPMENT.md
> **Purpose:** Phased build sequence for Claude Code. Each phase is a self-contained unit of work. Complete one phase fully before starting the next.
> **Strategy:** Clean start. Selectively copy audited files when each phase needs them.

---

## Ground Rules

### For Claude Code — READ THIS FIRST

1. **Read the spec before writing code.** Every phase references specific Parts of SKELETON_SPEC_v2.md. Read those Parts. Do not guess.
2. **Build exactly what the spec says.** Do not add features, "improve" patterns, or anticipate future needs.
3. **Cross-reference deliverables against the spec.** After building, re-read the referenced spec Parts and verify EVERY UI element, button, field, and behavior described in the spec is implemented — not just the deliverable summary lines. The deliverables are a checklist, the spec is the contract. If the spec describes it and this phase references that Part, it must be built.
4. **Do not touch previous phases.** If Phase 3 requires a change to Phase 1 code, flag it — do not silently modify.
5. **No placeholder "TODO" code.** Each phase must be functional when complete. If something isn't needed yet, don't stub it.
6. **Test each phase before moving on.** The app must compile, render, and function after every phase.

### Strategy: Clean Start + Just-in-Time Audit

The v2 repos are created EMPTY. No bulk copy. No mass delete.

**How it works:**
1. Phase 0 creates empty folder structures + copies ONLY inert config (vite, tailwind, tsconfig, package.json, etc.)
2. Each subsequent phase lists v1 files to AUDIT before building
3. For each v1 file: open it → compare against spec → decide: REUSE (copy as-is), FIX (modify then copy), or WRITE FRESH
4. Only audited, spec-compliant code enters v2

**Why this approach:**
- No leftover cruft — every file in v2 exists because it was explicitly vetted
- No premature copying — files arrive when their phase needs them
- Preserves accumulated knowledge — edge cases, debug fixes, patterns we already solved
- Claude Code never sees irrelevant v1 files that might contaminate new code

**The existing codebase is a READ-ONLY reference.** Located at:
`/Users/danieloskarsson/Library/CloudStorage/Dropbox/content-pipeline/`

**The spec always wins.** When existing code contradicts the spec, write fresh to match the spec.

### V1 Audit Protocol (used by every phase)

When a phase lists "v1 audit" files, follow this process FOR EACH FILE:

1. **Open** the v1 file and read it fully
2. **Compare** against the spec sections referenced by the current phase
3. **Decide:**
   - **REUSE** → File matches spec. Copy to v2 target path as-is.
   - **FIX** → File is mostly right but has spec deviations. Fix in a temp location, then copy to v2.
   - **WRITE FRESH** → File is too far from spec or too tangled with v1 patterns. Write new code from spec.
4. **Log** the decision for each file (print: "filename → REUSE/FIX/FRESH — reason")
5. **Never copy a v1 file without reading it first**

### Two Repos — Physical Separation

```
content-pipeline-v2/              ← Skeleton repo (clean start)
content-pipeline-modules-v2/      ← Modules repo (new)
```

Both repos live under: `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/`

The v2 repos live inside the OnlyiGaming project folder. Specs live ONLY in `Content-Pipeline/specs/` (single source of truth). The skeleton repo does NOT have its own specs/ folder — it reads from the project folder.

Source repo (READ-ONLY reference): `/Users/danieloskarsson/Library/CloudStorage/Dropbox/content-pipeline/`
Specs location: `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/Content-Pipeline/specs/`

### Tech Stack (from Spec Part 20)

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Server state:** TanStack Query
- **UI state:** Zustand
- **Tables:** TanStack Table (when needed, Phase 6+)
- **Backend:** Express.js + Node.js 20 LTS
- **Database:** Supabase PostgreSQL
- **Job queue:** Redis + BullMQ (Phase 7+)
- **Process manager:** PM2 (production only)

---

## V1 Codebase Reference Map

These tables catalog every v1 file and its expected disposition. They are NOT a Phase 0 checklist — files are audited just-in-time when each phase needs them. Each phase's "V1 Audit" section lists which files to open from this map.

Source repo (READ-ONLY): `/Users/danieloskarsson/Library/CloudStorage/Dropbox/content-pipeline/`

### Likely REUSE (expected to pass audit as-is)
| File | Why |
|------|-----|
| `client/src/stores/appStore.ts` | Toast + activeTab, clean Zustand, identical to v2 needs |
| `client/src/stores/panelStore.ts` | Panel visibility + accordion state, matches v2 spec |
| `client/src/components/layout/Toast.tsx` | Works perfectly |
| `client/src/api/client.ts` | apiFetch wrapper, queryClient setup, error handling. API shapes change but plumbing stays |
| `client/src/hooks/useUrlParams.ts` | URL-based project/run routing |
| `services/db.js` | Supabase client, 12 lines |
| `client/vite.config.ts` | Build config |
| `client/tailwind.config.js` | Tailwind config |
| `client/tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` | TypeScript config |
| `client/postcss.config.js` | PostCSS config |
| `client/package.json` | Dependencies (React 18, TanStack Query, Zustand, Tailwind, Vite) |
| `package.json` (root) | Server dependencies (Express, BullMQ, Supabase, ioredis) |
| `.env.example` | Environment template |
| `.gitignore` | Standard ignores |

### Likely FIX or FRESH (expected to need changes — audit decides)
| File | Changes needed |
|------|---------------|
| `client/src/components/layout/AppHeader.tsx` | Update nav items to: New Project, Projects, Templates |
| `client/src/components/shared/StepApprovalFooter.tsx` | Add [SKIP STEP] button per spec |
| `client/src/components/shared/StepSummary.tsx` | Minor — add working pool count display |
| `client/src/components/shared/CategoryCardGrid.tsx` | Add status-based display (idle/running/has_results/approved), spinner, data operation icon (➕➖＝) |
| `client/src/components/shared/SubmodulePanel.tsx` | Fix to spec's three fixed accordions (Input/Options/Results), spec-exact CTA button logic, data operation toggle |
| `client/src/components/steps/StepContainer.tsx` | Become universal step template — add auto-discovery trigger, working pool display, skip button |
| `client/src/hooks/useSubmodules.ts` | Keep mutation/query patterns, update API shapes to match spec Part 16 |
| `client/src/hooks/useStepContext.ts` | Keep concept, update to v2 step_context table shape |
| `client/src/stores/pipelineStore.ts` | Drop hardcoded category lists, become generic step expansion tracker |
| `client/src/types/step.ts` | Update types to match spec |
| `client/src/router.tsx` | Update routes: /new, /projects, /projects/:id/runs/:runId |
| `client/src/App.tsx` | Simplify to RouterProvider only (routing handles layout) |
| `server.js` | Remove WebSocket code, keep Express setup |
| `routes/submodules.js` | Module loading + execution patterns transferable, update API shapes per spec Part 16 |
| `routes/projects.js` | Keep CRUD, update to v2 schema |
| `workers/stageWorker.js` | Keep BullMQ pattern, update execution model to v2 |

### SKIP (never copy — v1-only, replaced by v2 architecture)
| File | Why |
|------|-----|
| `client/src/components/steps/Step1Discovery.tsx` | Replaced by universal step template |
| `client/src/components/steps/Step2Validation.tsx` | Replaced by universal step template |
| `client/src/components/panels/Step1Panel.tsx` | Replaced by universal pane template |
| `client/src/components/panels/Step2Panel.tsx` | Replaced by universal pane template |
| `client/src/stores/discoveryStore.ts` | Step-specific store, replaced by universal pattern |
| `client/src/stores/validationStore.ts` | Step-specific store, replaced by universal pattern |
| `services/orchestrator.js` | v2 has different orchestration model |
| `services/entityService.js` | v2 doesn't use entities table same way |
| `services/templateService.js` | Rebuild for v2 templates |
| `routes/entities.js` | v2 doesn't have separate entities routes |
| `routes/generated-content.js` | v2 doesn't have this |
| `routes/templates.js` | Rebuild for v2 |
| `modules/` (entire folder) | Submodules move to separate modules repo |
| `config/categories.js` | v2 uses manifest-driven categories |
| `public-legacy-dashboard/` | Legacy, not needed |
| `sql/*.sql` (all existing) | v2 has new schema |
| `tests/` | Start fresh with v2 tests |
| `CLAUDE.md` (root) | Old v1 CLAUDE.md — replaced by new one from specs/ |
| `docker-compose.yml` | Rebuild when needed |
| `Dockerfile` | Rebuild when needed |
| `.github/` | Rebuild when needed |
| `dev.sh` | Rebuild for v2 structure |
| `ecosystem.config.js` | Rebuild for v2 |
| `playwright.config.js` | Rebuild when needed |
| `middleware/errorHandler.js` | v1-only middleware |
| `utils/aiProvider.js` | v1-only, future tools.ai |
| `utils/browser.js` | v1-only |
| `routes/health.js` | Phase 0 creates inline health endpoint |

---

## Phase 0 — Repo Scaffold (Clean Start)

**Goal:** Two empty repos exist with correct folder structures. Inert config files copied. Seed modules in place. Dev server runs.

**Spec reference:** Part 20 (Tech Stack), Part 2 (Repo Structure)

**⚠️ CROSS-CHECK:** After building, re-read the referenced spec Parts. Every folder, config file, and structural decision described in the spec must be present. The deliverables are a checklist — the spec is the contract.

### Steps

**⚠️ FILE SYSTEM CLARITY: Do these steps IN ORDER. No skipping.**

1. **Create skeleton repo** with empty folder structure:
   ```
   /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline-v2/
   ├── client/
   │   └── src/
   │       ├── api/
   │       ├── components/
   │       │   ├── layout/
   │       │   ├── shared/
   │       │   ├── steps/
   │       │   ├── primitives/
   │       │   └── pages/
   │       ├── config/
   │       ├── hooks/
   │       ├── stores/
   │       └── types/
   ├── server/
   │   ├── routes/
   │   ├── services/
   │   └── workers/
   ├── sql/
   └── specs/
   ```

2. **Create modules repo** with seed modules:
   ```
   /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline-modules-v2/
   ├── CLAUDE.md
   └── modules/
       ├── step-1-discovery/
       │   └── sitemap-parser/
       │       ├── manifest.json
       │       └── execute.js
       └── step-2-validation/
           └── url-dedup/
               ├── manifest.json
               └── execute.js
   ```

3. **Copy seed modules** from specs into modules repo:
   ```bash
   cp -r /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/Content-Pipeline/specs/seed-modules/* \
         /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline-modules-v2/modules/
   ```

4. **Copy modules CLAUDE.md:**
   ```bash
   cp /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/Content-Pipeline/specs/CLAUDE_MODULES.md \
      /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline-modules-v2/CLAUDE.md
   ```

5. **Specs stay in project folder — do NOT copy into code repo:**
   Specs live ONLY in `Content-Pipeline/specs/` (single source of truth).
   The skeleton repo references them via the path in CLAUDE.md but does NOT have its own copy.
   ```
   READ-ONLY reference path:
   /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/Content-Pipeline/specs/
   ```
   ⛔ Do NOT create a specs/ folder inside content-pipeline-v2/. This caused spec divergence previously.

6. **Copy skeleton CLAUDE.md** to repo root:
   ```bash
   cp /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/Content-Pipeline/specs/CLAUDE.md \
      /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline-v2/CLAUDE.md
   ```

7. **Copy inert config files** from v1 repo (these are boilerplate with zero logic):
   ```
   FROM: /Users/danieloskarsson/Library/CloudStorage/Dropbox/content-pipeline/
   TO:   /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline-v2/

   client/vite.config.ts        → client/vite.config.ts
   client/tailwind.config.js    → client/tailwind.config.js
   client/tsconfig.json         → client/tsconfig.json
   client/tsconfig.app.json     → client/tsconfig.app.json
   client/tsconfig.node.json    → client/tsconfig.node.json
   client/postcss.config.js     → client/postcss.config.js
   client/index.html            → client/index.html
   client/src/index.css         → client/src/index.css
   .env.example                 → .env.example
   .gitignore                   → .gitignore
   ```
   ⚠️ Do NOT copy package.json files yet. They need auditing (may have unwanted dependencies).

8. **Audit and copy package.json files** — Open each, remove dependencies not in the spec's tech stack:
   - `client/package.json` — Keep: react, react-dom, @tanstack/react-query, zustand, tailwindcss, vite, typescript. Remove anything step-specific.
   - Root `package.json` — Keep: express, @supabase/supabase-js, bullmq, ioredis, dotenv, cors. Remove anything step-specific. Ensure `"type": "module"` is set (v2 uses ESM throughout — `import`/`export`, not `require()`). Add `"scripts": { "dev:server": "node server/server.js" }`.
   - Copy cleaned versions to v2.

9. **Create empty `sql/schema.sql`** — Will be populated in Phase 2.

10. **npm install** in v2 repo — both client/ and root. Verify no errors.

11. **Create minimal client/src/main.tsx** — Just enough to mount React:
    ```tsx
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import './index.css'

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <div className="p-8 text-lg">Content Pipeline v2 — Shell ready</div>
      </React.StrictMode>
    )
    ```

12. **Create minimal server/server.js** — Just enough to serve:
    ```javascript
    import express from 'express';
    const app = express();
    app.use(express.json());
    app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Server running on :${PORT}`));
    ```

13. **npm run dev** — Vite dev server starts, page loads with "Content Pipeline v2 — Shell ready".

14. **git init** + initial commit in both v2 repos.

### Do NOT do in Phase 0
- Copy any v1 React components, hooks, stores, or routes
- Copy any v1 server routes or services (except db.js if needed)
- Create any application logic
- These all happen in Phases 1-9 via the just-in-time audit process

### Deliverables
- [ ] content-pipeline-v2/ created with clean folder structure
- [ ] content-pipeline-modules-v2/ created with seed modules
- [ ] Seed modules present: sitemap-parser (Step 1) and url-dedup (Step 2) with manifest.json + execute.js
- [ ] Specs copied to v2/specs/
- [ ] CLAUDE.md at root of both repos
- [ ] Inert config files copied (vite, tailwind, tsconfig, postcss, index.html, index.css, .env.example, .gitignore)
- [ ] package.json files audited and cleaned
- [ ] `npm install` works (client + root)
- [ ] `npm run dev` starts Vite dev server — page loads
- [ ] Minimal Express server runs on :3001
- [ ] git init + initial commit in both repos

---

## Phase 1 — Shell UI

**Goal:** Header bar with navigation, routing between three pages, all showing placeholder content. Adapted from existing AppHeader + router.

**Spec reference:** Part 3 (UI Shell — Top-Level Structure)

**⚠️ CROSS-CHECK:** After building, re-read Part 3. Every UI element, nav item, route, and layout decision described in the spec must be present. The deliverables are a checklist — the spec is the contract.

### V1 Audit (open → compare against spec → REUSE / FIX / FRESH)
- `AppHeader.tsx` → compare against Part 3. Nav items need changing to [New Project, Projects, Templates].
- `router.tsx` → compare against Part 3. Routes need updating to /new, /projects, /templates.
- `App.tsx` → compare against Part 3. Existing has both router-based and tab-based rendering — should be router only.
- `Toast.tsx` → likely REUSE (standalone utility, no step-specific logic).
- `appStore.ts` → likely REUSE (toast state used by many components).
- `main.tsx` → compare against Phase 0 minimal version. May already be replaced.

### Build
1. **Header bar** — Update existing. Fixed top. Logo "OnlyiGaming Content Tool" on left. Three nav items.
2. **Routing** — Update existing router.tsx. Three routes with placeholder content. Also add `/projects/:projectId/runs/:runId` → placeholder "Run View" page (Phase 2 will redirect here after project creation, Phase 3 builds the real content).
3. **Styling** — Keep existing Tailwind setup. Dark header, light content area.

### Do NOT build
- Run View (Phase 3)
- Any data fetching
- Any Supabase connection
- Step navigation

### Deliverables
- [ ] Header renders on all pages with updated nav
- [ ] Nav items highlight active route
- [ ] All three routes work
- [ ] Templates page shows empty state
- [ ] No console errors
- [ ] Old tab-based navigation removed (appStore.activeTab can stay but isn't used for routing)

---

## Phase 2 — Step 0: Project Creation

**Goal:** User can create a project. Data persists in Supabase. After creation, user lands on the Run View (placeholder).

**Spec reference:** Part 4 (Step 0), Part 10 (Database Schema — projects, pipeline_runs, pipeline_stages tables)

**⚠️ CROSS-CHECK:** After building, re-read Parts 4 and 10. Every form field, table column, API behavior, and redirect described in the spec must be present. The deliverables are a checklist — the spec is the contract.

### V1 Audit (open → compare against spec → REUSE / FIX / FRESH)
- `Step0ProjectSetup.tsx` → compare against Part 4. Has project creation form + TanStack Query mutations. Schema fields differ in v2.
- `routes/projects.js` → compare against Part 10 + Part 16. Has CRUD routes. Schema differs.
- `api/client.ts` → compare against Part 16. Has `api.getProjects`, `api.createProject`. Types need updating.
- `services/db.js` → likely REUSE (just Supabase client init).
- `server.js` → compare against Phase 0 minimal version. Remove WebSocket/Redis pub-sub. Keep Express + CORS + JSON + static.
- `types/step.ts` → compare against Part 10 + STEP_CONFIG. Update types to match v2 schema.

### Build

1. **Database schema** — Create NEW tables in Supabase (from spec Part 10). Drop/ignore old tables.
   - `projects` (id, name, description, timing, template_id, status, created_at)
   - `pipeline_runs` (id, project_id, status, current_step, started_at, completed_at)
   - `pipeline_stages` (id, run_id, step_index, step_name, status, input_data, input_render_schema, output_data, output_render_schema, working_pool, working_pool_render_schema, started_at, completed_at)

2. **Step 0 form** — At `/new`:
   - Project Name (required)
   - Template (disabled, "Coming in v2")
   - Parent Project (optional, disabled in v1)
   - Intent (optional freeform text)
   - Timing (optional, disabled — "Not available yet". Placeholder for: one-off / scheduled / continuous)
   - [Create & Start Run] button
   - **NO Description field.** This was removed per UI_REFERENCE.md.
   - **NO Content Type field.** Old remnant — removed.

3. **Server route** — `POST /api/projects`:
   - Creates projects row
   - Creates pipeline_runs row (status: "running", current_step: 0)
   - Creates 11 pipeline_stages rows (step 0 = "active", steps 1-10 = "pending")
   - Returns project + run IDs

4. **After creation** — Redirect to `/projects/:projectId/runs/:runId`

5. **Projects list** — At `/projects`:
   - `GET /api/projects` → List all projects
   - Show name, description, status, created date
   - Click → navigate to latest run

6. **Express server** — server.js:
   - Remove WebSocket code
   - Remove Redis pub/sub subscriber
   - Keep: Express, CORS, JSON parsing, static file serving, SPA fallback
   - Port: 3001 (or keep 3000 — update Vite proxy)

### STEP_CONFIG

Define a constant for all 11 steps. This is used everywhere steps are referenced:

```typescript
const STEP_CONFIG = [
  { index: 0, name: "Project Start", description: "Define project scope and metadata" },
  { index: 1, name: "Discovery", description: "Find candidate sources and seed data" },
  { index: 2, name: "Validation", description: "Filter before committing to expensive operations" },
  { index: 3, name: "Scraping", description: "Fetch actual content from validated sources" },
  { index: 4, name: "Filtering & Assembly", description: "Clean and organize into source packages" },
  { index: 5, name: "Analysis & Generation", description: "Produce output content from sources" },
  { index: 6, name: "Quality Assurance", description: "Verify output meets standards" },
  { index: 7, name: "Routing", description: "Decide what happens to items that fail QA" },
  { index: 8, name: "Bundling", description: "Package into delivery formats" },
  { index: 9, name: "Distribution", description: "Push to external systems" },
  { index: 10, name: "Review", description: "Final human gate before publication" }
];
```

This STEP_CONFIG is copied verbatim from SKELETON_SPEC_v2.md Part 5. It is the single source of truth. Do NOT modify it.

### Do NOT build
- Step approval for Step 0 (Phase 3)
- Run View internals (Phase 3)
- Any submodule UI

### Deliverables
- [ ] Supabase tables created (projects, pipeline_runs, pipeline_stages)
- [ ] Project creation form works
- [ ] Data persists in Supabase
- [ ] Projects list shows created projects
- [ ] Click project → navigates to run view (placeholder)
- [ ] Express server running on :3001
- [ ] WebSocket code removed from server.js

---

## Phase 3 — Universal Step Template + Run View

**Goal:** When viewing a run, user sees the vertical step accordion and the active step's workspace. Expanding a step renders the universal step template with category cards (hardcoded dummy data for now).

**Spec reference:** Part 3 (Run View), Part 5 (Universal Step Template), Part 8 (Data Flow — Level 1)

**⚠️ CROSS-CHECK:** After building, re-read Parts 3, 5, and 8. Every status badge, button, layout element, and data flow rule described in the spec must be present. The deliverables are a checklist — the spec is the contract.

### V1 Audit (open → compare against spec → REUSE / FIX / FRESH)
- `StepContainer.tsx` → compare against Part 3 + Part 5. Has collapsible step pattern with status badges. Internals must become universal (category cards from manifests, not step-specific content).
- `pipelineStore.ts` → compare against Part 3. Has step expansion state. Must be generic (no hardcoded step references).
- `StepApprovalFooter.tsx` → compare against Part 5. Need [SKIP STEP] button added.
- `StepSummary.tsx` → compare against Part 5. Minor updates likely.
- `useUrlParams.ts` → likely REUSE. URL-based project/run routing needed for Run View.

### Build

1. **Vertical step accordion** — Keep existing layout exactly. Each step is a collapsible card showing:
   - Numbered circle with status color (green=completed, blue=active, gray=pending)
   - Step name + description
   - Status badge (completed/active/pending/skipped)
   - Expand/collapse arrow
   - Active step auto-expanded, completed steps clickable to expand read-only output
   - Pending steps collapsed + grayed out

2. **Run View** — At `/projects/:projectId/runs/:runId`:
   - Reads pipeline_stages from Supabase for this run
   - Renders step navigation from real status data
   - Below navigation: renders the active step's workspace

3. **Step 0 in Run View** — Step 0 shows project summary (name, description, intent). [APPROVE STEP] button. Clicking approve:
   - Sets step 0 status → "completed"
   - Sets step 1 status → "active"
   - Updates pipeline_runs.current_step → 1
   - Step navigation updates

4. **Universal Step Template** — For steps 1-10 (all identical structure):
   - Step header: step name, description, status badge
   - CategoryCardGrid area (empty for now — "No submodules available" message)
   - StepSummary bar (zero counts)
   - StepApprovalFooter: [APPROVE STEP] disabled (no approved submodules), [SKIP STEP] enabled

5. **API routes:**
   - `GET /api/runs/:id` — Run status, current step
   - `GET /api/runs/:runId/steps/:stepIndex` — Step data
   - `POST /api/runs/:runId/steps/:stepIndex/approve` — Step approval (basic version — just status update and advance, no pool aggregation yet)
   - `POST /api/runs/:runId/steps/:stepIndex/skip` — Skip step (pass-through)

6. **State management:**
   - TanStack Query for run/step data
   - `pipelineStore` (Zustand) for active step selection only

### Do NOT build
- CategoryCardGrid with real submodule data (Phase 4)
- SubmodulePanel (Phase 5)
- Working pool mechanics (Phase 7)
- File upload (Phase 6)

### Deliverables
- [ ] Run View renders with real step status data
- [ ] Step navigation shows correct status per step
- [ ] Step 0 approval advances to Step 1
- [ ] Skip step works
- [ ] Active step shows universal template
- [ ] Completed steps show read-only output (placeholder)
- [ ] Locked steps non-clickable

---

## Phase 4 — Module Auto-Discovery + Category Cards

**Goal:** Skeleton reads manifests from the modules repo and renders real category cards. No pane yet — cards are visual only.

**Spec reference:** Part 13 (Module Auto-Discovery), Part 5 (Category Cards)

**⚠️ CROSS-CHECK:** After building, re-read Parts 13 and 5. Every card element, manifest field, status indicator, and API shape described in the spec must be present. The deliverables are a checklist — the spec is the contract.

### V1 Audit (open → compare against spec → REUSE / FIX / FRESH)
- `CategoryCardGrid.tsx` → compare against Part 5. Has card grid with category expand/collapse and submodule rows. Needs v2 additions: data operation icon (➕➖＝), cost badge from manifest, status-based display.
- `useSubmodules.ts` → compare against Part 16. Has `useSubmoduleMetadata()` fetching from `/api/submodules`. API shape differs in v2.
- `routes/submodules.js` → compare against Part 13 + Part 16. Has module loading from filesystem + endpoint. Must change from loading .js files to reading manifest.json.

### Build

1. **Module loader service** — Server-side module loader:
   - Read `MODULES_PATH` env var (points to modules repo)
   - Scan `step-{N}-{name}/*/manifest.json`
   - Validate required fields
   - Store in-memory registry
   - (Existing code loads `.js` files — change to load `manifest.json`)

2. **Create 2-3 test manifests** in modules repo:
   - `step-1-discovery/sitemap-parser/manifest.json` (cost: cheap, category: crawling, data_operation: add)
   - `step-1-discovery/rss-feeds/manifest.json` (cost: cheap, category: news, data_operation: add)
   - `step-2-validation/url-filter/manifest.json` (cost: cheap, category: filtering, data_operation: remove)
   - NO execute.js yet — just manifests

3. **API route** — `GET /api/submodules`:
   - `GET /api/submodules?step=1` — Returns submodules for a step, grouped by category
   - Include manifest fields needed for cards

4. **CategoryCardGrid** —
   - Categories grouped from manifest `category` field
   - Each category card shows category name, submodule count
   - Click category → expands inline, shows submodule rows
   - Each submodule row: name, description, cost badge, data operation icon (➕➖＝)
   - Clicking submodule row → nothing yet (Phase 5 wires this to pane)

5. **Submodule status on cards** — All show "idle" for now (submodule_runs table created in Phase 7). Build the status display logic (idle, running, has_results, approved, failed) but hardcode to "idle" until Phase 7 wires real data.

### Do NOT build
- SubmodulePanel (Phase 5)
- execute.js files (Phase 9)
- File upload or input mechanics
- Working pool

### Deliverables
- [ ] Module loader reads manifest.json files at startup
- [ ] Invalid manifests logged and skipped
- [ ] GET /api/submodules returns manifest data grouped by category
- [ ] CategoryCardGrid renders from real manifest data
- [ ] Category expand/collapse works
- [ ] Submodule rows show name, description, cost, operation icon
- [ ] Status indicators work (all show "idle" since nothing has run)

---

## Phase 5 — Universal Pane Template

**Goal:** Clicking a submodule row opens the SubmodulePanel. Panel has three accordions (all empty/placeholder inside). CTA footer with three buttons. Panel closes properly.

**Spec reference:** Part 6 (Universal Pane Template — structure only, not internals)

**⚠️ CROSS-CHECK:** After building, re-read Part 6 structure sections. Every accordion, CTA button, toggle, close behavior, and panel layout described in the spec must be present. The deliverables are a checklist — the spec is the contract.

### V1 Audit (open → compare against spec → REUSE / FIX / FRESH)
- `SubmodulePanel.tsx` → compare against Part 6. Has panel with accordions, CTA footer, escape key handling, backdrop. Needs exact three accordions (Input blue, Options teal, Results pink) and CTA button logic per spec.
- `panelStore.ts` → compare against Part 6. Has panel open/close + accordion state. Likely REUSE with minor tweaks.

### Build

1. **SubmodulePanel** — Slides from LEFT side of screen:
   - Header: step name + submodule name
   - Data operation indicator (➕➖＝) with toggle
   - Three accordions: Input (blue), Options (teal), Results (pink)
   - CTA footer pinned at bottom

2. **Accordion behavior:**
   - Each accordion: colored header, expand/collapse on click
   - Only content is placeholder text for now
   - Input: "Input content will appear here"
   - Options: "Options will appear here"
   - Results: "Results will appear here"

3. **CTA Footer** — Three buttons per spec:
   - RUN TASK (pink, primary) — disabled (no input yet)
   - SEE RESULTS (gray) — disabled (no results yet)
   - APPROVE (green) — disabled (no results yet)

4. **Data operation toggle** — ➕➖＝ icons. Reads default from manifest. Click cycles through options. Saves to `run_submodule_config.data_operation`.

5. **Panel state:**
   - `panelStore` — which panel is open, which submodule
   - Click submodule row → opens panel
   - Click outside / close button → closes panel
   - Only one panel open at a time

6. **API route:**
   - `PUT /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/config` — Upsert config (data_operation for now)
   - `GET /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/config` — Get saved config

7. **Database table:**
   - `run_submodule_config` (from spec Part 10)

### Do NOT build
- Input accordion internals (Phase 6)
- Options accordion internals (Phase 6)
- Results accordion internals (Phase 7)
- RUN TASK execution (Phase 7)
- APPROVE flow (Phase 7)

### Deliverables
- [ ] Click submodule row → panel slides open
- [ ] Panel shows correct submodule name and step
- [ ] Three accordions expand/collapse
- [ ] CTA buttons render with correct disabled states
- [ ] Data operation toggle works and persists
- [ ] Close panel works (click outside, escape key, close button)
- [ ] run_submodule_config table created

---

## Phase 6 — Pane Internals: Input + Options

**Goal:** Input accordion handles file upload and content preview. Options accordion renders submodule options (auto-rendered from manifest). SAVE INPUT and SAVE OPTIONS work.

**Spec reference:** Part 6 (Input accordion, Options accordion), Part 9 (Shared Step Context, File Upload Flow)

**⚠️ CROSS-CHECK:** After building, re-read Parts 6 and 9. Every upload zone element, auto-resolution rule, options rendering path, save button, and preview behavior described in the spec must be present. The deliverables are a checklist — the spec is the contract.

### V1 Audit (open → compare against spec → REUSE / FIX / FRESH)
- `CsvUploadInput.tsx` → compare against Part 6 + Part 9. Has drag-and-drop CSV upload. Flow may differ in v2.
- `SubmoduleOptions.tsx` → compare against Part 6. Has auto-rendering of options from metadata. Must render from manifest options[] in v2.
- `ResultsList.tsx` → compare against Part 6. May be useful starting point for ContentRenderer.
- `useStepContext.ts` → compare against Part 9. Has step context fetching pattern. Schema differs in v2.

### Build

1. **Input accordion internals:**
   - Upload zone: drag-and-drop area for CSV/XLSX
   - Content preview below upload zone
   - Auto-resolution logic (spec Part 6): saved input config → previous step output → step_context → empty state
   - Source label: "From Step N", "From uploaded data", "Saved input"
   - [SAVE INPUT] button — active when input source differs from saved

2. **File upload flow** (spec Part 9):
   - `POST /api/runs/:runId/steps/:stepIndex/context` — multipart upload
   - Server parses CSV/XLSX
   - Validates columns against step's union of requires_columns
   - Stores in step_context table
   - Returns entity_count, columns_found, columns_missing

3. **step_context table** (from spec Part 10)

4. **Content preview** — ContentRenderer component:
   - Reads display_type from render_schema
   - For user uploads (no render_schema): table view showing all CSV columns, requires_columns highlighted
   - For inherited data: uses source's render_schema
   - v1 display types: table, url_list, content_cards, file_list

5. **Shared context banner** — When step_context exists and submodule has no saved input:
   - Inline banner in upload zone: "Found X entities from uploaded data. [Use these] [Upload different]"
   - [Use these] → writes { source: "step_context" } to input_config
   - [Upload different] → shows upload dropzone

6. **Options accordion internals:**
   - If manifest has options_component → load custom React component (from modules repo)
   - If manifest has options[] but no options_component → auto-render form from SubmoduleOptions primitive
   - If neither → show "No options" message
   - [SAVE OPTIONS] button — active when options differ from saved
   - Dirty-state tracking (deep comparison of current vs saved)

7. **RUN TASK activation:**
   - Enable when hasInput is true (any data resolved from auto-resolution)
   - Disable when isRunning

8. **API routes:**
   - `POST /api/runs/:runId/steps/:stepIndex/context` — File upload
   - `GET /api/runs/:runId/steps/:stepIndex/context` — Get step context

### Do NOT build
- Results accordion internals (Phase 7)
- BullMQ job execution (Phase 7)
- APPROVE flow (Phase 7)
- Actual submodule execute.js logic (Phase 9)

### Deliverables
- [ ] step_context table created in Supabase
- [ ] CSV upload works end-to-end (upload → parse → store → preview)
- [ ] Content preview renders uploaded data
- [ ] Auto-resolution picks correct source
- [ ] Shared context banner works between submodules
- [ ] Options auto-render from manifest works
- [ ] SAVE INPUT and SAVE OPTIONS persist to run_submodule_config
- [ ] RUN TASK enables when input exists
- [ ] ContentRenderer handles table display_type

---

## Phase 7 — Execution + Results + Approval

**Goal:** RUN TASK creates a BullMQ job, worker executes submodule, results appear, user approves, working pool updates.

**Spec reference:** Part 15 (Job Queue), Part 14 (Execute Function), Part 6 (Results accordion), Part 17 (Approval Mechanics), Part 8 (Working Pool)

**⚠️ CROSS-CHECK:** After building, re-read Parts 15, 14, 6, 17, and 8. Every queue config, worker behavior, results rendering rule, approval flow step, and pool update mechanic described in the spec must be present. The deliverables are a checklist — the spec is the contract.

### V1 Audit (open → compare against spec → REUSE / FIX / FRESH)
- `workers/stageWorker.js` → compare against Part 14 + Part 15. Has BullMQ worker pattern, Redis connection, job processing. Execution model differs in v2.
- `routes/submodules.js` → compare against Part 16. Has execution routes, approval routes, result fetching. API shapes differ. (Already audited in Phase 4 — re-check execution-specific parts.)
- `useSubmodules.ts` → compare against Part 16. Has `useExecuteSubmodule`, `useBatchApprove`, `useApproveSubmoduleRun`. (Already audited in Phase 4 — re-check execution hooks.)

### Build

1. **BullMQ setup:**
   - Redis connection
   - One queue: `pipeline-stages`
   - stageWorker process
   - Cost-based timeout/retry/priority (spec Part 15 table)

2. **Execute route** (spec Part 16):
   - `POST /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/run`
   - Check no active run (409 if pending/running exists)
   - Resolve input from auto-resolution
   - Load options from saved config or manifest defaults
   - Create submodule_runs row (status: pending)
   - Create BullMQ job
   - Return { submodule_run_id, status: "pending" }

3. **submodule_runs table** (from spec Part 10)

4. **Worker logic** (spec Part 15):
   - Load execute.js from MODULES_PATH
   - Build tools object (logger, http, progress)
   - Call execute(input, options, tools)
   - Write results → submodule_runs.output_data
   - Copy manifest output_schema → output_render_schema
   - Update status

5. **Results accordion:**
   - Polling: GET /api/submodule-runs/:id every 2s while running
   - Progress display during execution
   - On completion: render results using ContentRenderer (pass-through from output_data + output_render_schema)
   - The skeleton does NOT add checkboxes or selection UI — ContentRenderer reads `selectable` from render_schema
   - If `selectable: true` in render_schema → ContentRenderer renders checkboxes + Select all/Deselect all
   - If `selectable: false` or absent → results are read-only, APPROVE means approve all
   - Summary line: total count (+ approved/rejected counts when selectable)
   - Per-row data operation icon only when selectable (read-only indicator)

6. **Approval flow** (spec Part 16 + Part 17):
   - APPROVE button → POST /api/submodule-runs/:id/approve
   - Request: { approved_item_keys: [...] }
   - Server: store approved_items, update status, update working pool, log decision
   - Working pool update logic (spec Part 8): read data_operation, apply ➕➖＝ per entity
   - Concurrency protection: SELECT FOR UPDATE on pipeline_stages row
   - Panel closes, card updates

7. **Re-approval flow:**
   - Reopen approved submodule → see previous results via ContentRenderer
   - If `selectable: true`: checkboxes reflect previous approval states, user can modify and re-approve
   - If `selectable: false`: results shown read-only, user can [Try again] to re-run

8. **decision_log table** (from spec Part 10)

9. **GET submodule-runs response** (spec Part 16):
   - Full response shape with status, progress, output_data, approved_items, render_schema

10. **Panel close during execution:**
    - Job continues in background
    - CategoryCardGrid row shows spinner
    - Toast on completion/failure
    - Reopen → resume polling if still running

### Do NOT build
- Real submodule execute.js logic (Phase 9)
- Step-to-step data flow (Phase 8)

### Test with
- Create a simple test execute.js in modules repo that returns dummy data after a 3-second delay. Validates the full flow without real scraping logic.

### Deliverables
- [ ] submodule_runs table created in Supabase
- [ ] decision_log table created in Supabase
- [ ] RUN TASK → BullMQ job → worker executes → results appear
- [ ] Progress updates during execution
- [ ] Results render via ContentRenderer (pass-through from output_render_schema)
- [ ] Selectable mode works when render_schema declares selectable: true
- [ ] Non-selectable mode: APPROVE sends all item keys
- [ ] APPROVE updates working pool
- [ ] Re-approval works
- [ ] Decision log entries created
- [ ] Polling handles panel close/reopen
- [ ] Toast notifications on completion
- [ ] CategoryCardGrid reflects submodule status

---

## Phase 7b — Pane Completeness

**Goal:** Fill all gaps in the SubmodulePanel. The three accordions must be fully functional before step-to-step plumbing.

**Spec reference:** Part 6 (Universal Pane Template — Upload Zone, SAVE INPUT, SAVE OPTIONS, NEXT, Results action CTAs), UI_REFERENCE.md sections 6e/6f/6g

**⚠️ CROSS-CHECK:** After building, re-read Part 6 and UI_REFERENCE 6e/6f/6g. Every textarea, divider, button, CTA, toggle, and guided flow behavior described in the spec must be present. The deliverables are a checklist — the spec is the contract.

### Build

1. **UrlTextarea primitive** (`components/primitives/UrlTextarea`):
   - Multiline textarea with label "Paste URLs or data"
   - Parses input: one URL/entity per line
   - Returns structured data to Input accordion
   - Typing in textarea clears any uploaded CSV (mutual exclusion)

2. **Input accordion layout update** (matches mockup):
   - UrlTextarea (top)
   - "or" divider
   - CsvUploadInput (below divider) — already built
   - ↓ Download template link (generates CSV from manifest `requires_columns`)
   - Content preview via ContentRenderer — already built
   - [SAVE INPUT] button at bottom

3. **SAVE INPUT button:**
   - Active when user has changed input (CSV uploaded OR textarea has content)
   - Label: "Save Input (no changes)" when clean, "Save Input" when dirty
   - Saves to `run_submodule_config.input_config`
   - **Guided flow:** After save → collapses Input, opens Options automatically

4. **SAVE OPTIONS button:**
   - Active when options have been modified from saved/default state
   - Label: "Save Options (no changes)" when clean, "Save Options" when dirty
   - Saves to `run_submodule_config.options`

5. **NEXT button** (Options accordion, below SAVE OPTIONS):
   - Active when `hasInput` is true
   - If options are dirty, saves them first
   - Then: collapses Options, opens Results, triggers RUN TASK automatically
   - Completes guided flow: Input → Save → Options → Next → Run

6. **Results action CTAs** (inside Results accordion, below result content):
   - [Change Input] → collapses Results, opens Input accordion
   - [Change Options] → collapses Results, opens Options accordion
   - [Download] → exports current results
   - [Try again] → clears results display, resets to fresh state for re-run

7. **CategoryCardGrid ➕➖＝ toggle:**
   - Each submodule row shows data operation icon (➕➖＝), clickable, cycles through add/remove/transform
   - Syncs with the read-only indicator in the pane — toggling in either location updates both
   - Saves to `run_submodule_config.data_operation`

### Do NOT build
- Anything from Phase 8 (step-to-step data flow)
- New display_types for ContentRenderer
- Options component loading (manifest `options_component`) — deferred

### Deliverables
- [ ] UrlTextarea primitive exists and works
- [ ] Input accordion shows textarea + "or" + CSV upload + template link
- [ ] Mutual exclusion: textarea clears CSV, CSV clears textarea
- [ ] SAVE INPUT button with dirty tracking and guided flow
- [ ] SAVE OPTIONS button with dirty tracking
- [ ] NEXT button triggers save + run
- [ ] [Change Input], [Change Options], [Download], [Try again] in Results
- [ ] CategoryCardGrid rows show ➕➖＝ toggle, syncs with pane indicator
- [ ] Full guided flow: open pane → enter data → save → options → next → running

---

## Phase 8 — Step-to-Step Plumbing

**Goal:** Full pipeline flow works. Approve step → aggregates pool → writes output → activates next step → next step reads input. Data flows from Step 1 through Step 2 with real rendering.

**Spec reference:** Part 8 (Data Flow — all three levels), Part 16 (Step Approval server logic)

**⚠️ CROSS-CHECK:** After building, re-read Parts 8 and 16. Every data aggregation rule, pool merge mechanic, skip behavior, and approval validation described in the spec must be present. The deliverables are a checklist — the spec is the contract.

### Build

1. **Step approval — full version** (spec Part 16):
   - Validate at least one approved submodule_run
   - Only latest approved run per submodule contributes
   - Copy working_pool → output_data
   - Copy output_render_schema → next step's input_render_schema
   - Initialize next step's working_pool from input_data
   - Mark step completed, next step active
   - Update pipeline_runs.current_step
   - Log decision

2. **Next step input rendering:**
   - Step 2 opens → Input accordion shows "From Step 1 · X entities"
   - ContentRenderer uses input_render_schema from previous step
   - Submodules in Step 2 auto-resolve input from step output

3. **Skip step** — Pass input_data → output_data unchanged

4. **Completed step view** — Click completed step in navigation → read-only view of output_data

5. **Run completion** — After Step 10 approval, mark run as "completed"

### Deliverables
- [ ] Approve Step 1 → Step 2 activates with Step 1's output
- [ ] Step 2 submodules see Step 1 data as input
- [ ] Skip step passes data through
- [ ] Completed steps show output read-only
- [ ] Run completes after Step 10
- [ ] Full flow: create project → step 0 → step 1 (run submodule, approve) → step 2 receives data

---

## Phase 9 — First Real Submodules

**Goal:** Build 2-3 real submodules in the modules repo to validate the full architecture.

**Spec reference:** SUBMODULE_DEVELOPMENT.md (full document)

**⚠️ CROSS-CHECK:** After building, re-read SUBMODULE_DEVELOPMENT.md. Every manifest field, execute() signature, return format, and tools usage described in the guide must be correctly implemented. The deliverables are a checklist — the spec is the contract.

This is when work shifts to the modules repo. The skeleton should not change (if it does, that's a spec gap — document it).

### Build (in modules repo)

1. **Step 1 — Sitemap Parser** (add, cheap) — Already has working execute.js from seed modules. Verify it works end-to-end with real skeleton. Fix if needed, don't rewrite.

2. **Step 1 — RSS Feeds** (add, cheap) — NEW execute.js:
   - Takes entities with website field
   - Tries common feed paths
   - Returns table display_type

3. **Step 2 — URL Dedup** (remove, cheap) — Already has working execute.js from seed modules. Verify it works end-to-end. Fix if needed.

4. **Step 2 — URL Filter** (remove, cheap) — NEW execute.js:
   - Takes URLs from Step 1
   - Filters by pattern/status code
   - Returns filtered subset

### Validates
- manifest auto-discovery works with real manifests
- execute.js receives correct input/options/tools
- Results render correctly per display_type
- ➕ submodules accumulate in pool
- ➖ submodule filters pool
- Entity scoping works
- Step 1 → Step 2 data handoff works

### Deliverables
- [ ] All submodules appear in UI automatically
- [ ] Full flow: upload companies → discover URLs → filter URLs → approve both steps
- [ ] Entity scoping preserved throughout

---

## Phase 10 — Polish and Edge Cases

**Goal:** Handle all the edge cases from the spec that weren't covered in core phases.

**Spec reference:** Part 11 (Error Handling), Part 12 (Loading States), Part 6 (all remaining details), Part 5 (all remaining details)

**⚠️ CROSS-CHECK:** After building, do a FULL re-read of the entire SKELETON_SPEC_v2.md. Every behavior, edge case, and UI detail that was not built in Phases 0-9 must be built here. The deliverables are a checklist — the spec is the contract.

### Build
- Template system placeholder (table exists, UI shows empty state)
- Error states: failed jobs, network errors, validation failures
- Loading states: skeletons, spinners, disabled buttons
- Responsive layout adjustments
- Bulk filter-and-approve in results (TanStack Table column filtering)
- CSV template download per step
- Decision log viewing (read-only list of all decisions for a run)

---

## Appendix: What NOT To Build

These are explicitly out of scope for the skeleton build:

- Content Library tables (Step 10 module concern)
- AI provider integration (tools.ai — future)
- Cache system (tools.cache — future)
- SSE/WebSocket (v2 — polling is fine for v1)
- Template creation UI (v2)
- Monitoring/alerting
- CI/CD pipeline
- User authentication (single-user tool in v1)
```

---
## SPEC: SUBMODULE_DEVELOPMENT.md
```markdown
# Submodule Development Guide

> **Companion to:** SKELETON_SPEC_v2.md (the skeleton specification)
> **Updated:** February 9, 2026

This guide explains how to create new submodules for the Content Creation Tool. Submodules live in a **separate repo** from the skeleton. Adding a new submodule requires no skeleton changes — create your folder, restart the skeleton, and it appears in the UI automatically.

---

## Quick Start

1. Create a folder: `modules/step-{N}-{name}/your-submodule/`
2. Add `manifest.json` (declares everything the skeleton needs to know)
3. Add `execute.js` (your processing logic)
4. Optionally add React components (e.g., `OptionsPanel.jsx` for custom options UI)
5. Restart the skeleton
6. Your submodule appears in the UI automatically

---

## Folder Structure

```
modules/                              ← Modules repo root
├── step-1-discovery/
│   ├── sitemap-parser/
│   │   ├── manifest.json
│   │   ├── execute.js
│   │   └── OptionsPanel.jsx          ← optional custom options UI
│   └── navigation-links/
│       ├── manifest.json
│       └── execute.js
├── step-2-validation/
│   ├── url-filter/
│   │   ├── manifest.json
│   │   └── execute.js
│   └── deduplicator/
│       ├── manifest.json
│       └── execute.js
└── step-3-scraping/
    └── web-scraper/
        ├── manifest.json
        ├── execute.js
        └── OptionsPanel.jsx
```

Each submodule folder contains at minimum `manifest.json` + `execute.js`. The skeleton auto-discovers all submodule folders at startup.

---

## The Manifest

The manifest is the complete interface declaration. The skeleton never reads your `execute.js` to understand your submodule — it reads the manifest for everything.

### Full Manifest Template

```json
{
  "id": "your-submodule",
  "name": "Your Submodule",
  "description": "One-line explanation shown in the UI.",
  "version": "1.0.0",
  "step": 1,
  "category": "website",
  "cost": "cheap",
  "data_operation_default": "add",

  "requires_columns": ["website"],

  "options": [
    {
      "name": "max_results",
      "type": "number",
      "label": "Maximum Results",
      "description": "Limit total results returned per entity.",
      "default": 1000,
      "min": 1,
      "max": 50000
    },
    {
      "name": "include_nested",
      "type": "boolean",
      "label": "Include nested sources",
      "description": "Follow references to discover additional sources.",
      "default": true
    },
    {
      "name": "filter_mode",
      "type": "select",
      "label": "Filter mode",
      "description": "Which patterns to include.",
      "default": "all",
      "values": ["all", "pages_only", "custom_regex"]
    }
  ],

  "options_defaults": {
    "max_results": 1000,
    "include_nested": true,
    "filter_mode": "all"
  },

  "options_component": "./OptionsPanel.jsx",

  "item_key": "url",

  "output_schema": {
    "display_type": "table",
    "selectable": false,
    "url": "string (required)",
    "source_category": "string",
    "depth": "number",
    "last_modified": "string (ISO date, if available)"
  }
}
```

### Field Reference

| Field | Required | Purpose |
|-------|----------|---------|
| `id` | ✓ | Unique identifier. URL-safe (lowercase, hyphens). Once set, never changes. |
| `name` | ✓ | Display name shown on submodule cards. |
| `description` | ✓ | One-line explanation shown in the pane. |
| `version` | ✓ | Semantic version. Skeleton detects manifest changes via this. |
| `step` | ✓ | Which step (0–10) this submodule belongs to. One step only. |
| `category` | ✓ | Visual grouping within a step. Categories are visual only — no functional meaning. |
| `cost` | ✓ | `"cheap"`, `"medium"`, or `"expensive"`. Controls BullMQ priority and timeout. |
| `data_operation_default` | ✓ | `"add"`, `"remove"`, or `"transform"`. Default ➕➖＝ toggle. User can override per run. |
| `requires_columns` | ✓ | Which columns must exist in input data. Used for validation and CSV template generation. |
| `options` | | Array of option definitions. Used for documentation, validation, and fallback rendering. |
| `options_defaults` | | `{key: value}` pairs. Starting values when no saved config exists. |
| `options_component` | | Path to a React component for custom options UI. If omitted, skeleton auto-renders from `options[]`. |
| `item_key` | ✓ | Primary key field in output items (e.g., `"url"`). Used for deduplication and cross-run tracking. Can be a string for a single field or an array for composite keys (e.g., `["url", "entity_name"]`). |
| `output_schema` | ✓ | Describes output item shape + rendering. `display_type` values: `"table"` (columnar, default), `"url_list"` (compact URL rows), `"content_cards"` (article/document cards), `"file_list"` (filename + size + timestamp). Set `selectable: true` for item-level approval (user picks which items to keep). See "Output Schema" section below. |

---

## The Execute Function

Your `execute.js` exports a single async function. This is the only code the skeleton calls.

### Signature

```javascript
async function execute(input, options, tools) {
  // Your logic here
  return results;
}

module.exports = execute;
```

### Input

```javascript
{
  entities: [
    { name: "Company A", website: "companya.com", linkedin: "..." },
    { name: "Company B", website: "companyb.com" }
  ],
  run_id: "uuid",
  step_index: 1,
  submodule_id: "your-submodule"
}
```

`entities` is an array of objects. Every entity is guaranteed to have a `name` field (the skeleton enforces this on upload/import). Other fields depend on what was uploaded or inherited from the previous step. Check for fields listed in your `requires_columns` — the skeleton validates these exist before execution, but handle missing optional fields gracefully (skip entity, log warning).

**Entity scoping:** Your results are tied to entities. When you return results, group them by entity (see Return Format below). The skeleton uses this grouping to scope working pool operations per entity — Stripe's URLs never mix with PayPal's URLs.

### Options

```javascript
{ max_results: 1000, include_nested: true, filter_mode: "all" }
```

Loaded from saved config (if user clicked SAVE OPTIONS) or from your `options_defaults`. Keys match your `options[].name` fields. The skeleton handles loading and merging — you just use what you receive.

### Tools

The tools object is your only bridge to the outside world. You do not import libraries for HTTP, logging, or progress — the skeleton provides them.

```javascript
// Logging
tools.logger.info("Processing entity...");
tools.logger.warn("Missing optional field");
tools.logger.error("DNS resolution failed");

// HTTP (rate-limited, retried, logged by skeleton)
const response = await tools.http.get(url, options);
const response = await tools.http.post(url, body, options);
// Returns: { status, headers, body }

// Progress reporting (shown in UI during execution)
tools.progress.update(3, 5, "Processing entity 3 of 5");
```

**What tools does NOT provide:**
- No database access
- No queue access
- No file system write access
- No access to other submodules' data
- No access to configuration outside of `options`

### Return Value

```javascript
{
  results: [
    {
      entity_name: "Company A",
      items: [
        { url: "https://companya.com/about", depth: 1 },
        { url: "https://companya.com/products", depth: 1 }
      ],
      meta: { total_found: 142, filtered: 12, errors: 0 }
    },
    {
      entity_name: "Company B",
      items: [...],
      meta: {...}
    }
  ],
  summary: {
    total_entities: 2,
    total_items: 284,
    description: "284 URLs found across 2 companies",
    errors: []
  }
}
```

**Per-entity grouping required.** The skeleton displays results grouped by entity.

**Summary required.** The skeleton uses `summary` for the status line, card badge, and StepSummary rows. The `description` field is a human-readable summary written by the submodule — the skeleton displays it as-is, never constructs its own. Each submodule knows best how to describe its own results (URLs, articles, scores, etc.). If `description` is omitted, the skeleton falls back to basic counts.

### Error Handling

**Partial success** — return what worked, include errors:

```javascript
{
  results: [
    { entity_name: "Company A", items: [...], meta: { total_found: 142 } },
    { entity_name: "Bad Domain", items: [], error: "DNS resolution failed", meta: { errors: 1 } }
  ],
  summary: { total_entities: 2, total_items: 142, description: "142 items from 1 of 2 entities (1 failed)", errors: ["Bad Domain: DNS resolution failed"] }
}
```

**Total failure** — throw an error. The skeleton catches it, marks the run as "failed", and shows the error in the UI.

---

## Custom Options Component (Optional)

If your submodule needs a complex options UI (dynamic fields, conditional sections, visual pickers), you can provide a React component instead of relying on the skeleton's auto-rendered form.

### How It Works

1. Create a React component in your submodule folder (e.g., `OptionsPanel.jsx`)
2. Reference it in your manifest: `"options_component": "./OptionsPanel.jsx"`
3. The skeleton loads your component and renders it inside the Options accordion

### Component Contract

```jsx
export default function OptionsPanel({ options, onChange }) {
  // `options` = current saved values (or defaults on first load)
  // `onChange(newOptions)` = call this whenever the user changes anything
  //   The skeleton tracks dirty state and shows SAVE OPTIONS button

  return (
    <div>
      <label>
        Max Results
        <input
          type="number"
          value={options.max_results}
          onChange={(e) => onChange({ ...options, max_results: Number(e.target.value) })}
        />
      </label>
      {/* Your custom UI here */}
    </div>
  );
}
```

**Rules:**
- Receives `{ options, onChange }` as props
- Must call `onChange(fullOptionsObject)` on every change (not partial — send the complete object)
- No required props — defaults come from `options_defaults` in the manifest
- The skeleton handles: accordion container, dirty tracking, SAVE button, persistence
- Your component handles: the actual form UI

**No options_component?** If your manifest omits `options_component`, the skeleton auto-renders a basic form from your `options[]` array. Fine for simple boolean/number/select fields.

---

## Data Operation Default

Your `data_operation_default` tells the skeleton what your submodule does to the step's working data pool:

| Value | Icon | Meaning | Example |
|-------|------|---------|---------|
| `"add"` | ➕ | Output gets added to the pool | Discovery submodule finding new URLs |
| `"remove"` | ➖ | Output replaces pool with smaller set | Filter submodule removing bad URLs |
| `"transform"` | ＝ | Output replaces pool with same-count different-shape data | Scraper turning URLs into HTML packages |

The user can override this per run. You just set the sensible default.

---

## Output Schema and Render Schema

Your `output_schema` describes what each result item looks like and how it should be displayed. It includes:

- **`display_type`** — How the skeleton renders your data. v1 options:
  - `"table"` — Columnar rows (default). Each field becomes a column header.
  - `"url_list"` — Compact list showing primary URL + entity name. Other fields on row expand.
  - `"content_cards"` — Card layout for content pieces (articles, HTML documents). Shows title, excerpt, status. Used by content-producing steps.
  - `"file_list"` — Filename + size + timestamp. For steps that produce file outputs.
- **`selectable`** — Boolean. Controls whether users can pick individual items during approval.
  - `true` → The Results accordion shows checkboxes per row + Select all/Deselect all controls. APPROVE sends only checked item keys. Use for submodules where the user needs to filter results (e.g., removing bad URLs, rejecting low-quality content).
  - `false` or absent → Results are read-only. APPROVE sends all item keys (approve everything). Use for discovery/add submodules where all results are generally wanted.
  - **Convention:** ➕ add submodules → `selectable: false` (approve all). ➖ remove submodules → `selectable: true` (user picks). ＝ transform submodules → `selectable: false` (approve all). These are conventions, not rules — set whatever makes sense for your use case.
- **Field definitions** — Each field name and type. Used for results column headers.

This matters because:

1. The skeleton uses it to render columns in the Results accordion
2. When your output becomes input for the next step or submodule, the skeleton carries `output_schema` as `render_schema` so the downstream Input accordion renders your data in the same format you produced it

**The skeleton does not reformat your data.** URL lists stay as URL lists. Tables stay as tables. HTML packages stay as HTML previews. Your `output_schema` defines how your output is visualized everywhere it appears downstream.

---

## Cost Levels

| Level | Timeout | Retries | BullMQ Priority | Use When |
|-------|---------|---------|-----------------|----------|
| `cheap` | 5 min | 3 | 1 (highest) | No API calls, fast processing |
| `medium` | 15 min | 2 | 5 | Some API calls, moderate processing |
| `expensive` | 30 min | 1 | 10 (lowest) | Paid APIs, rate-limited, heavy processing |

---

## Full Example: RSS Feed Submodule

### manifest.json

```json
{
  "id": "rss-feeds",
  "name": "RSS Feeds",
  "description": "Parse RSS/Atom feeds for content URLs.",
  "version": "1.0.0",
  "step": 1,
  "category": "news",
  "cost": "cheap",
  "data_operation_default": "add",

  "requires_columns": ["website"],

  "options": [
    {
      "name": "max_items",
      "type": "number",
      "label": "Max feed items",
      "description": "Maximum feed items to process per entity.",
      "default": 50,
      "min": 1,
      "max": 500
    },
    {
      "name": "include_enclosures",
      "type": "boolean",
      "label": "Include media enclosures",
      "description": "Include media enclosure URLs in results.",
      "default": false
    }
  ],

  "options_defaults": {
    "max_items": 50,
    "include_enclosures": false
  },

  "item_key": "url",

  "output_schema": {
    "display_type": "table",
    "selectable": false,
    "url": "string (required)",
    "title": "string",
    "published_at": "string (ISO date)",
    "feed_source": "string"
  }
}
```

### execute.js

```javascript
async function execute(input, options, tools) {
  const results = [];

  for (let i = 0; i < input.entities.length; i++) {
    const entity = input.entities[i];
    tools.progress.update(i + 1, input.entities.length, `Processing ${entity.name}`);

    if (!entity.website) {
      tools.logger.warn(`${entity.name}: no website field, skipping`);
      results.push({
        entity_name: entity.name,
        items: [],
        error: "Missing website field",
        meta: { errors: 1 }
      });
      continue;
    }

    try {
      // Try common feed paths
      const feedUrls = [
        `https://${entity.website}/feed`,
        `https://${entity.website}/rss`,
        `https://${entity.website}/feed.xml`,
      ];

      const items = [];
      for (const feedUrl of feedUrls) {
        const response = await tools.http.get(feedUrl);
        if (response.status === 200) {
          // Parse feed XML, extract items
          const parsed = parseFeed(response.body, options.max_items);
          items.push(...parsed);
          tools.logger.info(`${entity.name}: found ${parsed.length} items at ${feedUrl}`);
          break;
        }
      }

      results.push({
        entity_name: entity.name,
        items: items.map(item => ({
          url: item.link,
          title: item.title,
          published_at: item.pubDate,
          feed_source: entity.website
        })),
        meta: { total_found: items.length, errors: 0 }
      });

    } catch (err) {
      tools.logger.error(`${entity.name}: ${err.message}`);
      results.push({
        entity_name: entity.name,
        items: [],
        error: err.message,
        meta: { errors: 1 }
      });
    }
  }

  const totalItems = results.reduce((sum, r) => sum + r.items.length, 0);
  const errors = results.filter(r => r.error).map(r => `${r.entity_name}: ${r.error}`);

  return {
    results,
    summary: {
      total_entities: input.entities.length,
      total_items: totalItems,
      description: `${totalItems} feed items from ${input.entities.length} sources${errors.length ? ` (${errors.length} failed)` : ''}`,
      errors
    }
  };
}

module.exports = execute;
```

After creating this folder and restarting the skeleton, "RSS Feeds" appears in the UI under the News category in Step 1.

---

## What You DON'T Do

- **No database access** — the skeleton handles all persistence
- **No queue management** — the skeleton creates and manages BullMQ jobs
- **No UI rendering** — the skeleton renders Input, Results, and CTA buttons; you only provide an optional Options component
- **No raw HTTP** — use `tools.http` (rate-limited, retried, logged)
- **No imports of skeleton code** — your submodule is isolated in a separate repo
- **No registration** — the skeleton auto-discovers your folder at startup
```

---
## SPEC: UI_REFERENCE.md
```markdown
# UI Reference — v2 Component Specifications

> **Date finalized:** February 11, 2026
> **Rule:** Keep the existing visual design. Only make the functional changes listed below.
> **Existing app:** http://188.245.110.34:3000/
> **Companion artifacts:** .jsx visual references in Claude.ai conversation (Feb 11, 2026)
> Files: projects-list-v2.jsx, step0-project-setup.jsx, step1-category-cards.jsx, submodule-panel.jsx

---

## Component 1: Header

**Current:** "Content Pipeline v3.0", tabs [Projects, Pipeline Monitor, Content Library, Templates], Demo/Live toggle
**v2:**
- Title → "OnlyiGaming Content Tool" + v2.0 badge
- Tabs → [New Project, Projects, Templates]
- Remove Demo/Live toggle entirely
- Visual layout: NO CHANGES

✅ APPROVED — See `header-current.jsx`

---

## Component 2: Projects List

**Current:** Stat cards (Total/Completed/Running/Failed), project rows with type tags, filter input, + New Project button
**v2:**
- Remove stat cards row entirely
- Remove type tags from project rows
- Remove filter input (can add later)
- Keep: + New Project button, project rows (name + date + status badge only)
- Visual layout of rows: NO CHANGES

✅ APPROVED — See `projects-list-v2.jsx`

---

## Component 3: Step 0 — Project Setup

**Dedicated form — NOT the universal step template.**

**Fields (from Part 4 of SKELETON_SPEC):**
- Project Name (required, active)
- Intent (optional, active)
- Template (optional, disabled — "Not available yet")
- Parent Project (optional, disabled — "Not available yet")
- Timing (optional, disabled — "Not available yet")

**NO Description field. NO data upload.**

**Two states:**
1. ACTIVE: Creation form + "Create & Start Run" button
2. COMPLETED: Green summary box showing project name + intent

**Header always visible** above the step accordion (← Back + project name).

✅ APPROVED — See `step0-project-setup.jsx`

---

## Component 4: Step Accordion (collapsed cards)

**NO CHANGES to visual appearance.**

Each collapsed step card shows:
- Numbered circle (green ✓ = completed, blue = active, gray = pending)
- Step name + description
- Status badge
- Expand/collapse arrow

Step names and descriptions come from STEP_CONFIG constant (not hardcoded per component).

Steps 1–10 all use the **universal step template** when expanded.

---

## Component 5: Universal Step Template (expanded step, Steps 1–10)

**Layout inside every expanded step:**
1. Pink banner: category description (e.g., "Source Types (click to configure)")
2. CategoryCardGrid: grid of category cards from manifest
3. StepSummary: per-submodule summary rows (NOT an aggregate summary)
4. StepApprovalFooter: [Skip Step] + [Approve Step]

### Category Cards (collapsed)
- Icon + label + "X/Y submodules" count — X = approved submodules, Y = total submodules in category
- Click → expands inline

### Category Cards (expanded) — submodule rows
Each row shows, LEFT to RIGHT:
1. **Data operation toggle** (➕➖＝) — clickable, cycles through add/subtract/replace
2. **Checkbox** — checked if approved
3. **Status dot** — idle (gray), running (blue pulse), has_results (blue), approved (green), failed (red)
4. **Submodule name** + result count if completed (e.g., "623 URLs")
5. **Description** (small text below name)
6. **Arrow →** — click opens SubmodulePanel

### StepSummary (above CTAs)
**Per-submodule rows, NOT a single aggregate line.**
- Skeleton provides the container area and data flow
- Each submodule provides its own summary content
- Only submodules that have been run appear (idle ones hidden)
- Each row: status icon + submodule name + summary text from module + status badge

### StepApprovalFooter
- [Skip Step] — secondary/gray
- [Approve Step] — primary/pink

✅ APPROVED — See `step1-category-cards.jsx`

---

## Component 6: SubmodulePanel (slides from left)

**Fixed width: 480px. Always same size. Never resizes.**
**Only ONE accordion open at a time.**

### Panel structure (top to bottom):

#### 6a. Panel Header (dark)
- Line 1: "Step {N} — {submodule_name}" + Close (✕) button
- Line 2: Project name

#### 6b. Description Bar
- One line from manifest.description
- Read-only

#### 6c. Data Operation Indicator
- Toggleable: ➕➖＝ (cycles on click)
- Shows label + working pool count
- ➕ "Adding to working pool · Currently: N items"
- ➖ "Filtering working pool · Currently: N items"
- ＝ "Transforming working pool · Currently: N items"
- Syncs with the data op toggle on the submodule row

#### 6d. Previous Run Summary (conditional)
- Only visible if submodule has been run before
- Blue bar: "Last run: 623 URLs · Approved ✓ · 2h ago" + [View results]

#### 6e. Input Accordion (blue/cyan header)
**Skeleton owns entirely.**
Contents (top to bottom):
- **UrlTextarea** — "Paste URLs or data" multiline freeform textarea
- **"or" divider**
- **CsvUploadInput** — drag-and-drop file zone (CSV, XLSX). Shows filename + count after upload, [Replace] link
- **↓ Download template** — generates CSV from manifest `requires_columns`
- **Content preview** — auto-resolved from previous step, shared context, or saved input
  - Rendered via ContentRenderer using render_schema from producing module
  - Source label: "From Step {N-1}" / "Saved input" / "From {submodule} upload"
- **[Save Input]** button — active only if user changed something. Label: "Save Input (no changes)" when clean.
  - **Guided flow:** After save → collapses Input, opens Options automatically
- Mutual exclusion: typing in textarea clears uploaded CSV, uploading CSV clears textarea

#### 6f. Options Accordion (teal header)
**Slot for module-provided component.**
- If module provides `options_component` → render that component
- If no component but `options[]` in manifest → auto-render form
- If neither → "No configurable options"
- **[Save Options]** button — active only if dirty. Label: "Save Options (no changes)" when clean.
- **[Next]** button — below Save Options. Active when `hasInput` is true.
  - If options dirty → saves first, then collapses Options, opens Results, triggers RUN TASK
  - Completes guided flow: Input → Save → Options → Next → Run

#### 6g. Results Accordion (pink header) — ALWAYS RENDERED
**Skeleton renders via ContentRenderer + output_schema from module.**

Before run: "No results yet. Configure input and click RUN TASK."
During run: Progress bar + entity counter (polls every 2s)
After run (content driven by output_render_schema via ContentRenderer):
- Summary line (from module output)
- If render_schema has `selectable: true`: [Select all] / [Deselect all] + checkboxes per row
- If `selectable: false` or absent: read-only list (APPROVE means approve all)
- Per-row data operation icon only when selectable (read-only, matches pane setting)
- Pagination + counts (total, and approved/rejected when selectable)
- **Action CTAs at bottom of results:**
  - [Change Input] → collapses Results, opens Input accordion
  - [Change Options] → collapses Results, opens Options accordion
  - [Download] — exports current results
  - [Try again] — clears results, resets to fresh state for new run

#### 6h. Fixed CTA Footer (always visible at bottom)
| Button | When enabled | Action |
|--------|-------------|--------|
| RUN TASK | hasInput && !isRunning | Creates BullMQ job, opens Results |
| SEE RESULTS | isCompleted | Opens Results accordion |
| APPROVE | isCompleted | Approves run, updates pool, closes panel |

✅ APPROVED — See `submodule-panel.jsx`

---

## Ownership Model

| Area | Skeleton owns | Module provides |
|------|--------------|----------------|
| Step accordion, expand/collapse | ✅ | — |
| Category card grid | ✅ | Categories from manifest |
| Submodule rows (checkbox, status, data op) | ✅ | Status from submodule_runs |
| StepSummary container | ✅ | Summary text per submodule |
| Panel header, description, data op indicator | ✅ | Manifest fields |
| Input accordion (upload, preview, auto-resolve) | ✅ | — |
| Options accordion container | ✅ | React component OR options[] |
| Results accordion container + action CTAs | ✅ | — |
| Results accordion content (rendering, selection) | ContentRenderer (pass-through) | Data + output_schema (incl. selectable) |
| CTA footer | ✅ | — |

---

## What Does NOT Change (visual)

- Color scheme, fonts, spacing
- Card border styles, rounded corners
- Accordion expand/collapse animations
- Panel slide-in behavior, backdrop, escape-to-close
- Button styles (pink primary, gray secondary)
- Status badge colors (green/blue/gray/red)
- Project row layout
```

---
## SPEC: BACKLOG.md
```markdown
# Content Pipeline — Backlog

**Single source of truth for known issues and deferred work.**

---

## Known Issues

| ID | Issue | Status | Target |
|----|-------|--------|--------|
| K001 | ContentRenderer `isDuplicate` hardcoded check | Deferred | Phase 10 (schema-driven row_highlight) |
| K002 | rss-feeds, url-filter have no execute.js | Placeholder only | Phase 9+ |
| K003 | Race condition on concurrent approvals | Known | Needs optimistic locking |
| K004 | No pagination for large result sets | Known | Phase 10 |

## Backlog

| ID | Task | Added |
|----|------|-------|
| B001 | URL cleanup after scraping (purge old discovered_urls) | 2026-01-30 |
| B002 | Project-level filter customization (custom exclude/include patterns) | 2026-01-30 |
| B003 | Re-run cascade invalidate (supersedes/needs_review columns) | 2026-02-01 |

---

*Updated: 2026-02-15*
```


# PART 2: SKELETON REPO SOURCE CODE

---
## FILE: client/postcss.config.js
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}

```

---
## FILE: client/src/api/client.ts
```typescript
import { QueryClient } from '@tanstack/react-query';
import { useAppStore } from '../stores/appStore';

// Base API URL - defaults to same origin
const API_BASE = import.meta.env.VITE_API_URL || '';

// Create QueryClient with global config
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30_000, // 30 seconds
    },
    mutations: {
      retry: 0, // No auto-retry for mutations
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        useAppStore.getState().showToast(errorMessage, 'error');
      },
    },
  },
});

// Generic fetch wrapper with error handling
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// API methods
import type {
  Project, CreateProjectInput, CreateProjectResponse,
  RunWithStages, PipelineStage, StepApproveResponse, StepSkipResponse,
  CategoryGroups, SubmoduleConfig,
  SubmoduleRun, SubmoduleLatestRunMap, ApproveSubmoduleRunResponse,
} from '../types/step';

export const api = {
  // Projects
  getProjects: () => apiFetch<Project[]>('/api/projects'),
  getProject: (id: string) => apiFetch<Project>(`/api/projects/${id}`),
  createProject: (data: CreateProjectInput) =>
    apiFetch<CreateProjectResponse>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Runs
  getRun: (id: string) => apiFetch<RunWithStages>(`/api/runs/${id}`),

  // Steps
  getStep: (runId: string, stepIndex: number) =>
    apiFetch<PipelineStage>(`/api/runs/${runId}/steps/${stepIndex}`),
  approveStep: (runId: string, stepIndex: number) =>
    apiFetch<StepApproveResponse>(`/api/runs/${runId}/steps/${stepIndex}/approve`, { method: 'POST' }),
  skipStep: (runId: string, stepIndex: number) =>
    apiFetch<StepSkipResponse>(`/api/runs/${runId}/steps/${stepIndex}/skip`, { method: 'POST' }),

  // Submodules
  getSubmodules: (stepIndex: number) =>
    apiFetch<CategoryGroups>(`/api/submodules?step=${stepIndex}`),

  // Submodule config
  getSubmoduleConfig: (runId: string, stepIndex: number, submoduleId: string) =>
    apiFetch<SubmoduleConfig>(`/api/runs/${runId}/steps/${stepIndex}/submodules/${submoduleId}/config`),
  getSubmoduleConfigs: (runId: string, stepIndex: number) =>
    apiFetch<Record<string, SubmoduleConfig>>(`/api/runs/${runId}/steps/${stepIndex}/submodule-configs`),
  saveSubmoduleConfig: (runId: string, stepIndex: number, submoduleId: string, config: Partial<SubmoduleConfig>) =>
    apiFetch<SubmoduleConfig>(`/api/runs/${runId}/steps/${stepIndex}/submodules/${submoduleId}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  // Submodule execution (Phase 7)
  executeSubmodule: (runId: string, stepIndex: number, submoduleId: string, body?: { entities?: Record<string, unknown>[] }) =>
    apiFetch<{ submodule_run_id: string; status: string }>(
      `/api/runs/${runId}/steps/${stepIndex}/submodules/${submoduleId}/run`,
      { method: 'POST', body: JSON.stringify(body || {}) }
    ),
  getSubmoduleRun: (submoduleRunId: string) =>
    apiFetch<SubmoduleRun>(`/api/submodule-runs/${submoduleRunId}`),
  approveSubmoduleRun: (submoduleRunId: string, approvedItemKeys: string[]) =>
    apiFetch<ApproveSubmoduleRunResponse>(`/api/submodule-runs/${submoduleRunId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approved_item_keys: approvedItemKeys }),
    }),
  getLatestSubmoduleRuns: (runId: string, stepIndex: number) =>
    apiFetch<SubmoduleLatestRunMap>(`/api/runs/${runId}/steps/${stepIndex}/submodule-runs/latest`),
};

```

---
## FILE: client/src/components/layout/AppHeader.tsx
```typescript
import { NavLink } from 'react-router-dom';

const TABS = [
  { path: '/new', label: 'New Project' },
  { path: '/projects', label: 'Projects' },
  { path: '/templates', label: 'Templates' },
];

export function AppHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">
            OnlyiGaming Content Tool
          </h1>
        </div>
      </div>

      {/* Tab navigation */}
      <nav className="flex px-6 border-t border-gray-100">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `
              px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${isActive
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

```

---
## FILE: client/src/components/layout/Toast.tsx
```typescript
import { useAppStore } from '../../stores/appStore';

export function Toast() {
  const { toast, hideToast } = useAppStore();

  if (!toast) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[toast.type];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}
      >
        <span>{toast.message}</span>
        <button
          onClick={hideToast}
          className="text-white/80 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

```

---
## FILE: client/src/components/pages/NewProject.tsx
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '../../hooks/useProjects';
import { useAppStore } from '../../stores/appStore';

export function NewProject() {
  const navigate = useNavigate();
  const { showToast } = useAppStore();
  const createProject = useCreateProject();

  const [name, setName] = useState('');
  const [intent, setIntent] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Please enter a project name', 'error');
      return;
    }

    createProject.mutate(
      { name: trimmed, intent: intent.trim() || undefined },
      {
        onSuccess: (data) => {
          showToast(`Project "${trimmed}" created`, 'success');
          navigate(`/projects/${data.project.id}/runs/${data.run.id}`);
        },
      }
    );
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">New Project</h2>

      <div className="space-y-4">
        {/* Project Name (required) */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nordic Operators Q1 2026"
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* Template (disabled placeholder) */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">Template</label>
          <select
            disabled
            className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-not-allowed"
          >
            <option>Coming in v2</option>
          </select>
        </div>

        {/* Parent Project (disabled placeholder) */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">Parent Project</label>
          <select
            disabled
            className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-not-allowed"
          >
            <option>Not available yet</option>
          </select>
        </div>

        {/* Intent (optional freeform) */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">Intent</label>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            rows={2}
            placeholder="What is the goal of this project?"
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        {/* Timing (disabled placeholder) */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">Timing</label>
          <select
            disabled
            className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-not-allowed"
          >
            <option>Not available yet</option>
          </select>
        </div>

        {/* Create & Start Run */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || createProject.isPending}
          className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            name.trim() && !createProject.isPending
              ? 'bg-sky-600 hover:bg-sky-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {createProject.isPending ? 'Creating...' : 'Create & Start Run'}
        </button>
      </div>
    </div>
  );
}

```

---
## FILE: client/src/components/pages/ProjectsList.tsx
```typescript
import { Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import type { Project } from '../../types/step';

export function ProjectsList() {
  const { data: projects = [], isLoading, error } = useProjects();

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500 text-sm">Loading projects...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 text-sm">
        Failed to load projects: {error.message}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">No projects yet</p>
        <Link to="/new" className="text-brand-600 hover:underline text-sm mt-2 inline-block">
          Create your first project
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
        <Link
          to="/new"
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-lg font-medium transition-colors"
        >
          New Project
        </Link>
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.id}/runs/latest`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
          {project.description && (
            <p className="text-xs text-gray-500 mt-0.5">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`status-badge ${project.status === 'active' ? 'approved' : 'pending'}`}>
            {project.status}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

```

---
## FILE: client/src/components/pages/RunView.tsx
```typescript
import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useRunData, useApproveStep, useSkipStep } from '../../hooks/useRun';
import { usePipelineStore } from '../../stores/pipelineStore';
import { STEP_CONFIG } from '../../config/stepConfig';
import { StepContainer } from '../steps/StepContainer';
import { Step0View } from '../steps/Step0View';
import { UniversalStepTemplate } from '../steps/UniversalStepTemplate';
import type { PipelineStage, ProjectWithRuns } from '../../types/step';

export function RunView() {
  const { projectId, runId } = useParams<{ projectId: string; runId: string }>();

  // Resolve "latest" to the actual latest run ID
  const { data: projectWithRuns } = useQuery({
    queryKey: ['project-with-runs', projectId],
    queryFn: () => api.getProject(projectId!) as Promise<ProjectWithRuns>,
    enabled: !!projectId && runId === 'latest',
  });

  if (runId === 'latest' && projectWithRuns?.runs?.length) {
    const latestRun = projectWithRuns.runs[0];
    return <Navigate to={`/projects/${projectId}/runs/${latestRun.id}`} replace />;
  }

  if (runId === 'latest') {
    return <div className="text-center py-12 text-gray-500 text-sm">Resolving latest run...</div>;
  }

  return <RunViewInner projectId={projectId!} runId={runId!} />;
}

function RunViewInner({ projectId, runId }: { projectId: string; runId: string }) {
  const { data: run, isLoading, error } = useRunData(runId);
  const { setExpandedStep } = usePipelineStore();

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.getProject(projectId),
    enabled: !!projectId,
  });

  // Known: isPending is shared across all steps — resolves when steps get per-step queries (Phase 4+)
  const approveStep = useApproveStep(runId);
  const skipStep = useSkipStep(runId);

  // Auto-expand the active step when run data loads
  useEffect(() => {
    if (run?.stages) {
      const activeStage = run.stages.find((s: PipelineStage) => s.status === 'active');
      if (activeStage) {
        setExpandedStep(activeStage.step_index);
      }
    }
  }, [run?.stages, setExpandedStep]);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500 text-sm">Loading run...</div>;
  }

  if (error || !run) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-sm">{error?.message || 'Run not found'}</p>
        <Link to="/projects" className="text-brand-600 hover:underline text-sm mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  const stages: PipelineStage[] = run.stages || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {project?.name || 'Loading...'}
          </h2>
          <p className="text-xs text-gray-500">
            Run {runId.slice(0, 8)} · Step {run.current_step} of 10 · {run.status}
          </p>
        </div>
        <Link to="/projects" className="text-sm text-gray-500 hover:text-gray-700">
          ← Projects
        </Link>
      </div>

      <div className="space-y-2">
        {STEP_CONFIG.map((stepCfg) => {
          const stage = stages.find((s) => s.step_index === stepCfg.index);
          const status = stage?.status || 'pending';

          return (
            <StepContainer
              key={stepCfg.index}
              step={stepCfg.index}
              title={stepCfg.name}
              description={stepCfg.description}
              status={status as 'pending' | 'active' | 'completed' | 'skipped'}
            >
              {stage && stepCfg.index === 0 && project ? (
                <Step0View
                  stage={stage}
                  project={project}
                  onApprove={() => approveStep.mutate(0)}
                  onSkip={() => skipStep.mutate(0)}
                  isApproving={approveStep.isPending}
                  isSkipping={skipStep.isPending}
                />
              ) : stage ? (
                <UniversalStepTemplate
                  stage={stage}
                  onApprove={() => approveStep.mutate(stepCfg.index)}
                  onSkip={() => skipStep.mutate(stepCfg.index)}
                  isApproving={approveStep.isPending}
                  isSkipping={skipStep.isPending}
                />
              ) : null}
            </StepContainer>
          );
        })}
      </div>
    </div>
  );
}

```

---
## FILE: client/src/components/primitives/ContentRenderer.tsx
```typescript
import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

/** Render schema from output_schema — drives display_type, selectable, columns */
export interface RenderSchema {
  display_type?: string;
  selectable?: boolean;
  [field: string]: unknown;
}

export interface ContentRendererProps {
  /** Array of entity/item objects (rows) */
  entities: Record<string, unknown>[];
  /** Render schema — drives display_type, selectable, and column definitions */
  renderSchema?: RenderSchema | null;
  /** Column names to display (auto-detected from first entity if omitted) */
  columns?: string[];
  /** Maximum container height in pixels (default: 320). Ignored when fullHeight is true. */
  maxHeight?: number;
  /** Use all available space in parent container */
  fullHeight?: boolean;
  /** Optional label above the table (e.g. "12 entities loaded") */
  label?: string;
  /** Optional download handler — shows Download CSV button when set */
  onDownloadCsv?: () => void;
  /** Selectable mode props — only used when renderSchema.selectable is true */
  checkedKeys?: Set<string>;
  onCheckedKeysChange?: (keys: Set<string>) => void;
  /** Field used as unique key for each row (default: 'url') */
  itemKey?: string;
  /** Current data operation — shown as per-row icon when selectable */
  dataOperation?: string;
}

const DATA_OP_ICONS: Record<string, string> = { add: '\u2795', remove: '\u2796', transform: '\uFF1D' };

/**
 * Pass-through content renderer for entity/item data.
 *
 * Renders a virtual-scrolling table for large datasets (10,000+ rows).
 * Used by Input accordion (CSV preview) and Results accordion (output preview).
 *
 * When renderSchema.selectable is true, adds per-row checkboxes and
 * Select all / Deselect all controls for item-level approval.
 *
 * DO NOT replace with naive .map() — virtualisation is critical for performance.
 */
export function ContentRenderer({
  entities,
  renderSchema,
  columns: columnsProp,
  maxHeight = 320,
  fullHeight = false,
  label,
  onDownloadCsv,
  checkedKeys,
  onCheckedKeysChange,
  itemKey = 'url',
  dataOperation,
}: ContentRendererProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const selectable = renderSchema?.selectable === true && !!checkedKeys && !!onCheckedKeysChange;

  // Derive columns from renderSchema field definitions (exclude meta fields) or from props/data
  const columns = useMemo(() => {
    if (columnsProp) return columnsProp;
    if (renderSchema) {
      const metaFields = new Set(['display_type', 'selectable']);
      return Object.keys(renderSchema).filter((k) => !metaFields.has(k));
    }
    return entities.length > 0 ? Object.keys(entities[0]) : [];
  }, [columnsProp, renderSchema, entities]);

  const virtualizer = useVirtualizer({
    count: entities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 15,
  });

  if (entities.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">No data to display</p>
      </div>
    );
  }

  const handleDownload = () => {
    if (onDownloadCsv) {
      onDownloadCsv();
      return;
    }

    // Default CSV download
    const headerRow = columns.map((c) => `"${c}"`).join(',');
    const rows = entities.map((entity) =>
      columns
        .map((col) => {
          const val = String(entity[col] ?? '');
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csv = [headerRow, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-${entities.length}-rows.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Selectable helpers ---
  const toggleItem = (key: string) => {
    if (!checkedKeys || !onCheckedKeysChange) return;
    const next = new Set(checkedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onCheckedKeysChange(next);
  };

  const selectAll = () => {
    if (!onCheckedKeysChange) return;
    const allKeys = entities.map((e) => String(e[itemKey] ?? '')).filter(Boolean);
    onCheckedKeysChange(new Set(allKeys));
  };

  const deselectAll = () => {
    if (!onCheckedKeysChange) return;
    onCheckedKeysChange(new Set());
  };

  // Grid template: optional checkbox + optional data-op icon + # + columns
  const checkboxCol = selectable ? '28px ' : '';
  const opIconCol = selectable && dataOperation ? '24px ' : '';
  const gridTemplate = `${checkboxCol}${opIconCol}40px repeat(${columns.length}, minmax(80px, 1fr))`;

  const opIcon = dataOperation ? (DATA_OP_ICONS[dataOperation] || '\uFF1D') : '';

  return (
    <div className={fullHeight ? 'h-full flex flex-col' : 'space-y-2'}>
      {/* Header bar */}
      <div className={`flex items-center justify-between ${fullHeight ? 'flex-shrink-0 mb-1' : ''}`}>
        <p className="text-xs text-gray-600 font-medium">
          {label || `${entities.length} rows \u00d7 ${columns.length} columns`}
        </p>
        <button
          onClick={handleDownload}
          className="text-xs text-[#0891B2] hover:text-[#0891B2]/80 flex items-center gap-1"
        >
          <span>{'\u2b07'}</span> CSV
        </button>
      </div>

      {/* Select all / Deselect all controls — only when selectable */}
      {selectable && (
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={selectAll} className="text-xs text-[#0891B2] hover:underline">
            Select all
          </button>
          <button onClick={deselectAll} className="text-xs text-[#0891B2] hover:underline">
            Deselect all
          </button>
          <span className="text-xs text-gray-400 ml-auto">
            {checkedKeys!.size} approved {'\u00b7'} {entities.length - checkedKeys!.size} rejected
          </span>
        </div>
      )}

      {/* Table with virtual scrolling */}
      <div
        ref={parentRef}
        className={`overflow-auto border border-gray-200 rounded ${fullHeight ? 'flex-1 min-h-0' : ''}`}
        style={fullHeight ? undefined : { maxHeight }}
      >
        {/* Sticky header */}
        <div
          className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200"
          style={{ display: 'grid', gridTemplateColumns: gridTemplate }}
        >
          {selectable && <span className="px-1 py-1.5" />}
          {selectable && dataOperation && <span className="px-1 py-1.5" />}
          <span className="px-2 py-1.5 text-left text-gray-500 font-medium text-xs">#</span>
          {columns.map((col) => (
            <span key={col} className="px-2 py-1.5 text-left text-gray-500 font-medium text-xs truncate">
              {col}
            </span>
          ))}
        </div>

        {/* Virtual rows */}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const entity = entities[virtualItem.index];
            const key = String(entity[itemKey] ?? `row-${virtualItem.index}`);
            const isChecked = selectable ? checkedKeys!.has(key) : true;
            const isDuplicate = entity.status === 'duplicate';

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                  display: 'grid',
                  gridTemplateColumns: gridTemplate,
                }}
                className={`items-center text-xs border-b border-gray-100 ${
                  isDuplicate ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                } ${selectable && !isChecked ? 'opacity-50' : ''
                } ${selectable ? 'cursor-pointer' : ''}`}
                onClick={selectable ? () => toggleItem(key) : undefined}
              >
                {selectable && (
                  <span className="px-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(key)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0891B2] focus:ring-[#0891B2] cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </span>
                )}
                {selectable && dataOperation && (
                  <span className="px-1 text-center text-[10px]" title={dataOperation}>{opIcon}</span>
                )}
                <span className="px-2 text-gray-400 truncate">
                  {virtualItem.index + 1}
                </span>
                {columns.map((col) => (
                  <span key={col} className="px-2 truncate text-gray-700" title={String(entity[col] ?? '')}>
                    {String(entity[col] ?? '')}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

```

---
## FILE: client/src/components/primitives/CsvUploadInput.tsx
```typescript
import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';

export interface UploadResult {
  entity_count: number;
  columns_found: string[];
  columns_missing: string[];
  all_columns: string[];
  filename: string;
}

interface CsvUploadInputProps {
  onUploadComplete: (result: UploadResult) => void;
  onError?: (message: string) => void;
  uploadUrl: string;
  submoduleId?: string;
  currentFileName: string | null;
  currentEntityCount: number;
  requiredColumns: string[];
}

export function CsvUploadInput({
  onUploadComplete,
  onError,
  uploadUrl,
  submoduleId,
  currentFileName,
  currentEntityCount,
  requiredColumns,
}: CsvUploadInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      onError?.('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (submoduleId) formData.append('submodule_id', submoduleId);

      const resp = await fetch(uploadUrl, { method: 'POST', body: formData });
      const data = await resp.json();

      if (!resp.ok) {
        onError?.(data.error || `Upload failed (${resp.status})`);
        return;
      }

      onUploadComplete(data as UploadResult);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Uploading state
  if (isUploading) {
    return (
      <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mb-2" />
        <p className="text-xs text-blue-600">Uploading and parsing...</p>
      </div>
    );
  }

  // Show loaded file info
  if (currentFileName) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-sm">CSV</span>
            <div>
              <p className="text-sm font-medium text-green-800">{currentFileName}</p>
              <p className="text-xs text-green-600">{currentEntityCount} entities loaded</p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
          >
            Replace
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  // Drag-drop upload zone
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-xs text-gray-500">
        {isDragging ? 'Drop CSV here' : 'Drop CSV or click to browse'}
      </p>
      {requiredColumns.length > 0 && (
        <p className="text-[10px] text-gray-400 mt-1">
          Expected columns: {requiredColumns.join(', ')}
        </p>
      )}
    </div>
  );
}

```

---
## FILE: client/src/components/primitives/SubmoduleOptions.tsx
```typescript
import type { SubmoduleOption } from '../../types/step';

interface SubmoduleOptionsProps {
  options: SubmoduleOption[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}

/**
 * Dynamic form generator for submodule options.
 *
 * Renders form fields based on manifest options[] array.
 * Supports: select, checkbox/boolean, number, text, textarea.
 */
export function SubmoduleOptions({
  options,
  values,
  onChange,
}: SubmoduleOptionsProps) {
  if (options.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-2">
        No options available for this submodule
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const value = values[option.name] ?? option.default;

        switch (option.type) {
          case 'select':
            return (
              <div key={option.name}>
                <label className="block text-xs text-gray-600 mb-1">
                  {option.label}
                </label>
                <select
                  value={String(value)}
                  onChange={(e) => onChange(option.name, e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#0891B2]"
                >
                  {option.values?.map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
                {option.description && (
                  <p className="text-[10px] text-gray-400 mt-1">{option.description}</p>
                )}
              </div>
            );

          case 'boolean':
            return (
              <label key={option.name} className="flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => onChange(option.name, e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#0891B2] focus:ring-[#0891B2]"
                />
                <span className="text-gray-700">
                  {option.label}
                  {option.description && (
                    <span className="block text-[10px] text-gray-400 mt-0.5">
                      {option.description}
                    </span>
                  )}
                </span>
              </label>
            );

          case 'number':
            return (
              <div key={option.name}>
                <label className="block text-xs text-gray-600 mb-1">
                  {option.label}
                </label>
                <input
                  type="number"
                  value={Number(value)}
                  min={option.min}
                  max={option.max}
                  onChange={(e) => onChange(option.name, Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#0891B2]"
                />
                {option.description && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    {option.description}
                    {(option.min != null || option.max != null) && (
                      <span className="ml-1">
                        ({option.min != null && `min: ${option.min}`}
                        {option.min != null && option.max != null && ', '}
                        {option.max != null && `max: ${option.max}`})
                      </span>
                    )}
                  </p>
                )}
              </div>
            );

          case 'textarea':
            return (
              <div key={option.name}>
                <label className="block text-xs text-gray-600 mb-1">
                  {option.label}
                </label>
                <textarea
                  value={String(value ?? '')}
                  maxLength={option.maxLength}
                  onChange={(e) => onChange(option.name, e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#0891B2] resize-y"
                />
                {option.description && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    {option.description}
                    {option.maxLength && (
                      <span className="ml-1">(max {option.maxLength} chars)</span>
                    )}
                  </p>
                )}
              </div>
            );

          case 'text':
          default:
            return (
              <div key={option.name}>
                <label className="block text-xs text-gray-600 mb-1">
                  {option.label}
                </label>
                <input
                  type="text"
                  value={String(value ?? '')}
                  onChange={(e) => onChange(option.name, e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#0891B2]"
                />
                {option.description && (
                  <p className="text-[10px] text-gray-400 mt-1">{option.description}</p>
                )}
              </div>
            );
        }
      })}
    </div>
  );
}

```

---
## FILE: client/src/components/primitives/UrlTextarea.tsx
```typescript
import { useRef, useCallback } from 'react';

interface UrlTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Multiline textarea for pasting URLs or entity data.
 * One URL/entity per line. Returns raw text to parent;
 * parsing into structured entities happens at the parent level.
 */
export function UrlTextarea({
  value,
  onChange,
  placeholder = 'https://example.com\nhttps://another.com\n...',
}: UrlTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1 font-medium">
        Paste URLs or data
      </label>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#3B82F6] resize-y placeholder:text-gray-300"
      />
    </div>
  );
}

/** Parse raw textarea text into entity objects. One line = one entity. */
export function parseTextareaToEntities(
  text: string,
  primaryColumn: string
): Record<string, unknown>[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ [primaryColumn]: line }));
}

```

---
## FILE: client/src/components/shared/CategoryCardGrid.tsx
```typescript
import { useState } from 'react';
import type { CategoryGroups, SubmoduleManifest, SubmoduleLatestRunMap, SubmoduleConfig } from '../../types/step';
import { usePanelStore } from '../../stores/panelStore';

const DATA_OP_OPTIONS = ['add', 'remove', 'transform'] as const;
const DATA_OP_ICONS: Record<string, string> = {
  add: '\u2795',
  remove: '\u2796',
  transform: '\uFF1D',
};

interface CategoryCardGridProps {
  categories: CategoryGroups;
  latestRuns?: SubmoduleLatestRunMap;
  configMap?: Record<string, SubmoduleConfig>;
  onDataOperationChange?: (submoduleId: string, op: 'add' | 'remove' | 'transform') => void;
}

export function CategoryCardGrid({ categories, latestRuns = {}, configMap = {}, onDataOperationChange }: CategoryCardGridProps) {
  const { openSubmodulePanel } = usePanelStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categoryEntries = Object.entries(categories);

  if (categoryEntries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-400 text-sm">No submodules available for this step</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      {categoryEntries.map(([catKey, submodules]) => {
        const isExpanded = expandedCategory === catKey;

        return (
          <div
            key={catKey}
            className={`rounded-lg border transition-all ${
              isExpanded
                ? 'border-dashed border-2 border-sky-400 bg-white'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* Category Header */}
            <div
              className="p-3 cursor-pointer"
              onClick={() => setExpandedCategory(isExpanded ? null : catKey)}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-800 capitalize">{catKey}</p>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {submodules.length} submodule{submodules.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Inline Submodules (shown when expanded) */}
            {isExpanded && (
              <div className="border-t border-gray-200">
                <p className="text-[10px] text-gray-500 font-medium uppercase px-3 pt-2">
                  Submodules
                </p>
                <div className="p-2 space-y-1">
                  {submodules.map((sub) => {
                    const savedOp = configMap[sub.id]?.data_operation;
                    const currentOp = savedOp || sub.data_operation_default;

                    return (
                      <SubmoduleRow
                        key={sub.id}
                        submodule={sub}
                        categoryKey={catKey}
                        onOpen={openSubmodulePanel}
                        latestRun={latestRuns[sub.id]}
                        currentDataOp={currentOp}
                        onCycleDataOp={
                          onDataOperationChange
                            ? () => {
                                const idx = DATA_OP_OPTIONS.indexOf(currentOp as typeof DATA_OP_OPTIONS[number]);
                                const next = DATA_OP_OPTIONS[(idx + 1) % DATA_OP_OPTIONS.length];
                                onDataOperationChange(sub.id, next);
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubmoduleRow({
  submodule,
  categoryKey,
  onOpen,
  latestRun,
  currentDataOp,
  onCycleDataOp,
}: {
  submodule: SubmoduleManifest;
  categoryKey: string;
  onOpen: (submoduleId: string, categoryKey: string) => void;
  latestRun?: { status: string; result_count: number; approved_count: number; progress: { current: number; total: number; message: string } | null };
  currentDataOp: string;
  onCycleDataOp?: () => void;
}) {
  const opIcon = DATA_OP_ICONS[currentDataOp] || '\uFF1D';

  return (
    <div
      className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer group"
      onClick={() => onOpen(submodule.id, categoryKey)}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-sm w-5 text-center hover:scale-125 transition-transform"
          title={`Data operation: ${currentDataOp} (click to change)`}
          onClick={(e) => {
            e.stopPropagation();
            onCycleDataOp?.();
          }}
        >
          {opIcon}
        </button>
        <div>
          <p className="text-sm text-gray-700">{submodule.name}</p>
          <p className="text-[10px] text-gray-400">{submodule.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SubmoduleStatusBadge latestRun={latestRun} />
        <svg
          className="w-4 h-4 text-gray-400 opacity-50 group-hover:opacity-100"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

function SubmoduleStatusBadge({ latestRun }: { latestRun?: { status: string; result_count: number; approved_count: number; progress: { current: number; total: number; message: string } | null } }) {
  if (!latestRun) {
    return <span className="text-[10px] text-gray-300">idle</span>;
  }

  switch (latestRun.status) {
    case 'pending':
      return <span className="text-[10px] text-amber-400">queued</span>;
    case 'running':
      return (
        <span className="flex items-center gap-1 text-[10px] text-sky-500">
          <span className="inline-block w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          {latestRun.progress
            ? `${latestRun.progress.current}/${latestRun.progress.total}`
            : 'running'}
        </span>
      );
    case 'completed':
      return (
        <span className="text-[10px] font-medium text-amber-500">
          {latestRun.result_count} result{latestRun.result_count !== 1 ? 's' : ''}
        </span>
      );
    case 'approved':
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {latestRun.approved_count}
        </span>
      );
    case 'failed':
      return <span className="text-[10px] font-medium text-red-500">failed</span>;
    default:
      return <span className="text-[10px] text-gray-300">idle</span>;
  }
}

```

---
## FILE: client/src/components/shared/StepApprovalFooter.tsx
```typescript
interface StepApprovalFooterProps {
  status: 'active' | 'completed' | 'skipped';
  canApprove: boolean;
  onApprove: () => void;
  onSkip: () => void;
  isApproving?: boolean;
  isSkipping?: boolean;
}

export function StepApprovalFooter({
  status,
  canApprove,
  onApprove,
  onSkip,
  isApproving = false,
  isSkipping = false,
}: StepApprovalFooterProps) {
  if (status === 'completed') {
    return (
      <div className="mt-4 flex justify-end">
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-100 text-green-700 text-xs font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Step Completed
        </span>
      </div>
    );
  }

  if (status === 'skipped') {
    return (
      <div className="mt-4 flex justify-end">
        <span className="text-xs text-gray-400 italic">Step was skipped</span>
      </div>
    );
  }

  const isBusy = isApproving || isSkipping;

  return (
    <div className="mt-4 flex justify-end gap-2">
      <button
        onClick={onSkip}
        disabled={isBusy}
        className={`px-4 py-1.5 rounded text-xs font-medium ${
          isBusy ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
      >
        {isSkipping ? 'Skipping...' : 'Skip Step'}
      </button>
      <button
        onClick={onApprove}
        disabled={!canApprove || isBusy}
        className={`px-4 py-1.5 rounded text-xs font-medium shadow-sm ${
          !canApprove || isBusy
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#0891B2] hover:bg-[#0891B2]/90 text-white'
        }`}
      >
        {isApproving ? (
          <span className="inline-flex items-center gap-1">
            <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
            Approving...
          </span>
        ) : (
          'Approve Step'
        )}
      </button>
    </div>
  );
}

```

---
## FILE: client/src/components/shared/StepSummary.tsx
```typescript
interface SubmoduleSummaryRow {
  name: string;
  dataOperation: 'add' | 'remove' | 'transform';
  resultCount: number;
  status: string;
  description?: string;
}

interface StepSummaryProps {
  submodules: SubmoduleSummaryRow[];
}

const OP_ICON: Record<string, string> = { add: '➕', remove: '➖', transform: '＝' };

export function StepSummary({ submodules }: StepSummaryProps) {
  const approved = submodules.filter((s) => s.status === 'approved');

  if (approved.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-400">No approved submodules yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <p className="text-xs text-gray-600 font-medium uppercase mb-2">Summary</p>
      <div className="space-y-1">
        {approved.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-sm text-gray-700">
            <span>{OP_ICON[s.dataOperation] || '＝'}</span>
            <span>{s.name}:</span>
            <span className="font-medium">
              {s.description || `${s.resultCount} items approved`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

```

---
## FILE: client/src/components/shared/SubmodulePanel.tsx
```typescript
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePanelStore } from '../../stores/panelStore';
import { useStepContext } from '../../hooks/useStepContext';
import { useSubmoduleRun, useExecuteSubmodule, useApproveSubmoduleRun, useLatestSubmoduleRuns } from '../../hooks/useSubmoduleRuns';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../api/client';
import type { SubmoduleManifest, SubmoduleConfig } from '../../types/step';
import { CsvUploadInput, type UploadResult } from '../primitives/CsvUploadInput';
import { ContentRenderer, type RenderSchema } from '../primitives/ContentRenderer';
import { SubmoduleOptions } from '../primitives/SubmoduleOptions';
import { UrlTextarea, parseTextareaToEntities } from '../primitives/UrlTextarea';

type AccordionVariant = 'blue' | 'teal' | 'pink';

const VARIANT_COLORS: Record<AccordionVariant, { bg: string; buttonBg: string; buttonText: string }> = {
  blue: { bg: 'bg-[#3B82F6]', buttonBg: 'bg-white', buttonText: 'text-[#3B82F6]' },
  teal: { bg: 'bg-[#0891B2]', buttonBg: 'bg-[#E11D73]', buttonText: 'text-white' },
  pink: { bg: 'bg-[#E11D73]', buttonBg: 'bg-white', buttonText: 'text-[#E11D73]' },
};

const DATA_OP_OPTIONS = ['add', 'remove', 'transform'] as const;
const DATA_OP_ICONS: Record<string, string> = { add: '\u2795', remove: '\u2796', transform: '\uFF1D' };
const DATA_OP_LABELS: Record<string, string> = { add: 'Add to pool', remove: 'Filter pool', transform: 'Transform pool' };

interface SubmodulePanelProps {
  stepName: string;
  submodule: SubmoduleManifest | null;
  runId: string | undefined;
  stepIndex: number;
  dataOperation: 'add' | 'remove' | 'transform';
  onDataOperationChange: (op: 'add' | 'remove' | 'transform') => void;
  savedConfig: SubmoduleConfig | undefined;
  onSaveConfig: (config: Partial<SubmoduleConfig>) => void;
  previousStepData: Record<string, unknown>[] | null;
  previousStepRenderSchema: Record<string, unknown> | null;
}

function PanelAccordionItem({
  title,
  badge,
  isOpen,
  onToggle,
  variant,
  children,
}: {
  title: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
  variant: AccordionVariant;
  children: React.ReactNode;
}) {
  const colors = VARIANT_COLORS[variant];

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${isOpen ? 'flex-1 flex flex-col min-h-0' : 'flex-shrink-0'}`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 ${colors.bg} text-white rounded-t-lg`}
      >
        <span className="font-semibold text-sm flex items-center gap-2">
          {title}
          {badge && (
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{badge}</span>
          )}
        </span>
        <div
          className={`w-6 h-6 rounded-full ${colors.buttonBg} flex items-center justify-center`}
        >
          <span className={`${colors.buttonText} font-bold text-sm`}>
            {isOpen ? '\u2212' : '+'}
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 flex-1 overflow-y-auto">{children}</div>
      )}
    </div>
  );
}

export function SubmodulePanel({
  stepName,
  submodule,
  runId,
  stepIndex,
  dataOperation,
  onDataOperationChange,
  savedConfig,
  onSaveConfig,
  previousStepData,
  previousStepRenderSchema,
}: SubmodulePanelProps) {
  const queryClient = useQueryClient();
  const showToast = useAppStore((s) => s.showToast);
  const {
    submodulePanelOpen,
    panelAccordion,
    activeSubmoduleRunId,
    closeSubmodulePanel,
    setPanelAccordion,
    setActiveSubmoduleRunId,
  } = usePanelStore();

  // Step context (shared CSV data for this step)
  const { data: stepContext } = useStepContext(runId, stepIndex);

  // Latest submodule runs — to auto-load previous run on panel open
  const { data: latestRuns } = useLatestSubmoduleRuns(runId, stepIndex);

  // Auto-set activeSubmoduleRunId when opening a panel for a submodule with a previous run
  useEffect(() => {
    if (!submodulePanelOpen || !submodule || !latestRuns) return;
    const latest = latestRuns[submodule.id];
    if (latest && !activeSubmoduleRunId) {
      setActiveSubmoduleRunId(latest.id);
    }
  }, [submodulePanelOpen, submodule?.id, latestRuns, activeSubmoduleRunId, setActiveSubmoduleRunId]);

  // Clear activeSubmoduleRunId when switching submodules
  useEffect(() => {
    setActiveSubmoduleRunId(null);
  }, [submodule?.id, setActiveSubmoduleRunId]);

  // Poll active submodule run — only poll while panel is open
  const { data: submoduleRun } = useSubmoduleRun(activeSubmoduleRunId, submodulePanelOpen);

  // Execution mutation
  const executeMutation = useExecuteSubmodule();
  const approveMutation = useApproveSubmoduleRun();

  // --- Render schema and selectable flag ---
  const renderSchema = submoduleRun?.output_render_schema as RenderSchema | null;
  const isSelectable = renderSchema?.selectable === true;

  // --- Flatten results into a single list of items with entity_name ---
  const flatItems = useMemo(() => {
    if (!submoduleRun?.output_data?.results) return [];
    const items: Array<Record<string, unknown> & { entity_name: string }> = [];
    for (const entityResult of submoduleRun.output_data.results) {
      for (const item of entityResult.items || []) {
        items.push({ ...item, entity_name: entityResult.entity_name });
      }
    }
    return items;
  }, [submoduleRun?.output_data]);

  const itemKey = submodule?.item_key || 'url';

  // --- Checked items state (only used when selectable) ---
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());

  // Initialize checked keys when results arrive — only for selectable mode
  useEffect(() => {
    if (!isSelectable) return;
    if (flatItems.length === 0) {
      setCheckedKeys(new Set());
      return;
    }

    if (submoduleRun?.status === 'approved' && submoduleRun.approved_items) {
      setCheckedKeys(new Set(submoduleRun.approved_items));
    } else if (submoduleRun?.status === 'completed') {
      const allKeys = flatItems.map((item) => String(item[itemKey] ?? '')).filter(Boolean);
      setCheckedKeys(new Set(allKeys));
    }
  }, [flatItems, submoduleRun?.status, submoduleRun?.approved_items, itemKey, isSelectable]);

  // --- Textarea state (for manual URL/data entry) ---
  const [textareaValue, setTextareaValue] = useState('');
  // Track which input source is active: 'textarea' | 'csv' | null
  const [inputSource, setInputSource] = useState<'textarea' | 'csv' | null>(null);
  const [inputDirty, setInputDirty] = useState(false);

  // Reset input state when switching submodules
  useEffect(() => {
    setTextareaValue('');
    setInputSource(null);
    setInputDirty(false);
  }, [submodule?.id]);

  // Textarea parsed entities
  const primaryColumn = submodule?.requires_columns?.[0] || 'url';
  const textareaEntities = useMemo(
    () => (textareaValue.trim() ? parseTextareaToEntities(textareaValue, primaryColumn) : []),
    [textareaValue, primaryColumn]
  );

  // Determine which entities to show in content preview
  const hasStepContext = !!stepContext?.entities && stepContext.entities.length > 0;
  const hasPreviousStepData = !!previousStepData && previousStepData.length > 0;
  const previewEntities = inputSource === 'textarea'
    ? textareaEntities
    : hasStepContext
      ? stepContext!.entities
      : hasPreviousStepData
        ? previousStepData!
        : [];
  const hasPreviewData = previewEntities.length > 0;
  // Track whether we're showing previous step data (for render schema and label)
  const showingPreviousStepData = !inputSource && !hasStepContext && hasPreviousStepData;

  // Mutual exclusion handlers
  const handleTextareaChange = useCallback((value: string) => {
    setTextareaValue(value);
    setInputSource(value.trim() ? 'textarea' : null);
    setInputDirty(true);
  }, []);

  const handleUploadComplete = useCallback((result: UploadResult) => {
    queryClient.invalidateQueries({ queryKey: ['stepContext', runId, stepIndex] });
    setTextareaValue(''); // Mutual exclusion: CSV clears textarea
    setInputSource('csv');
    setInputDirty(true);
    showToast(`Uploaded ${result.filename}: ${result.entity_count} entities`, 'success');
    if (result.columns_missing.length > 0) {
      showToast(`Missing columns: ${result.columns_missing.join(', ')}`, 'error');
    }
  }, [queryClient, runId, stepIndex, showToast]);

  const handleUploadError = (msg: string) => {
    showToast(msg, 'error');
  };

  // Download template handler — generates CSV with column headers from requires_columns
  const handleDownloadTemplate = () => {
    if (!submodule) return;
    const cols = submodule.requires_columns.length > 0
      ? submodule.requires_columns
      : ['url'];
    const csv = cols.map((c) => `"${c}"`).join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${submodule.id}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // SAVE INPUT handler
  const handleSaveInput = () => {
    if (inputSource === 'textarea') {
      onSaveConfig({ input_config: { source: 'textarea', raw_text: textareaValue, entities: textareaEntities } });
    } else if (inputSource === 'csv') {
      onSaveConfig({ input_config: { source: 'csv', filename: stepContext?.filename || null } });
    }
    setInputDirty(false);
    showToast('Input saved', 'success');
    // Guided flow: collapse Input, open Options
    setPanelAccordion('options');
  };

  // Local options state — initialized from savedConfig or manifest defaults
  const manifestDefaults = useMemo(() => {
    if (!submodule) return {};
    return submodule.options_defaults || {};
  }, [submodule]);

  const [localOptions, setLocalOptions] = useState<Record<string, unknown>>({});
  const [optionsDirty, setOptionsDirty] = useState(false);

  // Reset local options when submodule or savedConfig changes
  useEffect(() => {
    const base = { ...manifestDefaults };
    if (savedConfig?.options) {
      Object.assign(base, savedConfig.options);
    }
    setLocalOptions(base);
    setOptionsDirty(false);
  }, [submodule?.id, savedConfig?.options, manifestDefaults]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && submodulePanelOpen) {
        closeSubmodulePanel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [submodulePanelOpen, closeSubmodulePanel]);

  // Show toast when background job completes
  useEffect(() => {
    if (!submoduleRun || !submodule) return;
    if (submoduleRun.status === 'completed' && submoduleRun.output_data) {
      const count = submoduleRun.output_data.summary?.total_items ?? 0;
      if (!submodulePanelOpen) {
        showToast(`${submodule.name} completed \u2014 ${count} results`, 'success');
      }
    }
    if (submoduleRun.status === 'failed') {
      showToast(`${submodule.name} failed: ${submoduleRun.error || 'Unknown error'}`, 'error');
    }
  }, [submoduleRun?.status]);

  if (!submodulePanelOpen || !submodule) return null;

  const submoduleName = submodule.name;
  const submoduleDescription = submodule.description;

  const cycleDataOp = () => {
    const idx = DATA_OP_OPTIONS.indexOf(dataOperation);
    const next = DATA_OP_OPTIONS[(idx + 1) % DATA_OP_OPTIONS.length];
    onDataOperationChange(next);
  };

  const uploadUrl = `/api/runs/${runId}/steps/${stepIndex}/context`;

  // --- Options logic ---
  const handleOptionChange = (name: string, value: unknown) => {
    setLocalOptions((prev) => ({ ...prev, [name]: value }));
    setOptionsDirty(true);
  };

  const handleSaveOptions = () => {
    onSaveConfig({ options: localOptions as Record<string, unknown> });
    setOptionsDirty(false);
    showToast('Options saved', 'success');
  };

  // --- Execution state ---
  // hasInput: content preview has data from ANY source (textarea, CSV, step context, or previous step)
  const hasInput = hasPreviewData || stepIndex > 0;
  const isRunning = submoduleRun?.status === 'pending' || submoduleRun?.status === 'running';
  const isCompleted = submoduleRun?.status === 'completed' || submoduleRun?.status === 'approved';

  // --- CTA handlers ---

  // Auto-save dirty input before executing — ensures server has the data
  const saveInputIfDirty = async () => {
    if (!inputDirty || !inputSource || !runId || !submodule) return;
    if (inputSource === 'textarea') {
      await api.saveSubmoduleConfig(runId, stepIndex, submodule.id, {
        input_config: { source: 'textarea', raw_text: textareaValue, entities: textareaEntities },
      });
    } else if (inputSource === 'csv') {
      await api.saveSubmoduleConfig(runId, stepIndex, submodule.id, {
        input_config: { source: 'csv', filename: stepContext?.filename || null },
      });
    }
    setInputDirty(false);
  };

  const handleRunTask = async () => {
    if (!runId || !submodule) return;

    // Resolve entities to send directly in the request body (no DB roundtrip needed)
    let entitiesToSend: Record<string, unknown>[] | undefined;
    if (inputSource === 'textarea' && textareaEntities.length > 0) {
      entitiesToSend = textareaEntities;
    } else if (hasPreviewData) {
      entitiesToSend = previewEntities;
    }

    // Also persist the input config for future runs (fire-and-forget)
    saveInputIfDirty().catch(() => { /* non-critical */ });

    executeMutation.mutate(
      { runId, stepIndex, submoduleId: submodule.id, entities: entitiesToSend },
      {
        onSuccess: (data) => {
          setActiveSubmoduleRunId(data.submodule_run_id);
          setPanelAccordion('results');
        },
      }
    );
  };

  const handleSeeResults = () => {
    setPanelAccordion('results');
  };

  const handleApprove = () => {
    if (!activeSubmoduleRunId) return;

    let approvedKeys: string[];
    if (isSelectable) {
      approvedKeys = Array.from(checkedKeys);
    } else {
      approvedKeys = flatItems.map((item) => String(item[itemKey] ?? '')).filter(Boolean);
    }

    approveMutation.mutate(
      { submoduleRunId: activeSubmoduleRunId, approvedItemKeys: approvedKeys },
      {
        onSuccess: () => {
          closeSubmodulePanel();
          queryClient.invalidateQueries({ queryKey: ['latestSubmoduleRuns'] });
        },
      }
    );
  };

  // NEXT button handler — saves dirty options, then runs (handleRunTask sends entities directly)
  const handleNext = () => {
    if (optionsDirty) {
      onSaveConfig({ options: localOptions as Record<string, unknown> });
      setOptionsDirty(false);
    }
    handleRunTask();
  };

  // Results action CTAs
  const handleChangeInput = () => setPanelAccordion('input');
  const handleChangeOptions = () => setPanelAccordion('options');
  const handleTryAgain = () => {
    setActiveSubmoduleRunId(null);
    setPanelAccordion('input');
  };

  // --- Input badge ---
  const inputBadge = hasPreviewData
    ? showingPreviousStepData
      ? `${previewEntities.length} from previous step`
      : `${previewEntities.length} entities`
    : stepIndex > 0
      ? 'From previous step'
      : undefined;

  // --- Results badge ---
  const summary = submoduleRun?.output_data?.summary;

  const resultsBadge = isRunning
    ? 'running'
    : isCompleted
      ? isSelectable
        ? `${checkedKeys.size}/${flatItems.length}`
        : `${flatItems.length} items`
      : undefined;

  // --- Results summary label — submodule-authored, skeleton just renders it ---
  const resultsLabel = summary?.description
    || (summary ? `${summary.total_items} items across ${summary.total_entities} entities` : undefined);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 transition-opacity duration-300 opacity-100"
        onClick={closeSubmodulePanel}
      />

      {/* Panel — slides from left */}
      <div className="fixed inset-y-0 left-0 w-[672px] min-w-[672px] max-w-[672px] bg-gray-100 shadow-2xl flex flex-col transition-transform duration-300 translate-x-0">
        {/* Header */}
        <div className="bg-[#0891B2] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-base font-semibold">
              {stepName} — {submoduleName}
            </h3>
          </div>
          <button
            onClick={closeSubmodulePanel}
            className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="px-4 py-2 text-xs text-gray-500 bg-white border-b flex-shrink-0">
          {submoduleDescription}
        </p>

        {/* Data Operation Toggle */}
        <div className="px-4 py-2 bg-white border-b flex-shrink-0">
          <button
            onClick={cycleDataOp}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            title="Click to cycle data operation"
          >
            <span className="text-lg">{DATA_OP_ICONS[dataOperation]}</span>
            <span className="font-medium">{DATA_OP_LABELS[dataOperation]}</span>
            <span className="text-[10px] text-gray-400 ml-1">(click to change)</span>
          </button>
        </div>

        {/* Accordions */}
        <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
          {/* --- INPUT ACCORDION --- */}
          <PanelAccordionItem
            title="Input"
            badge={inputBadge}
            isOpen={panelAccordion === 'input'}
            onToggle={() => setPanelAccordion(panelAccordion === 'input' ? null : 'input')}
            variant="blue"
          >
            <div className="flex flex-col gap-3 h-full">
              {/* UrlTextarea */}
              <div className="flex-shrink-0">
                <UrlTextarea
                  value={textareaValue}
                  onChange={handleTextareaChange}
                />
              </div>

              {/* "or" divider */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* CsvUploadInput */}
              <div className="flex-shrink-0">
                <CsvUploadInput
                  uploadUrl={uploadUrl}
                  submoduleId={submodule.id}
                  onUploadComplete={handleUploadComplete}
                  onError={handleUploadError}
                  currentFileName={inputSource === 'csv' ? (stepContext?.filename || null) : null}
                  currentEntityCount={inputSource === 'csv' ? (stepContext?.entities?.length || 0) : 0}
                  requiredColumns={submodule.requires_columns || []}
                />
              </div>

              {/* Download template link */}
              {submodule.requires_columns.length > 0 && (
                <button
                  onClick={handleDownloadTemplate}
                  className="text-xs text-[#3B82F6] hover:text-[#3B82F6]/80 flex items-center gap-1 flex-shrink-0"
                >
                  <span>{'\u2B07'}</span> Download template
                </button>
              )}

              {/* Content preview — shows textarea, CSV, or previous step data */}
              {hasPreviewData && (
                <div className="flex-1 min-h-0">
                  {showingPreviousStepData && (
                    <p className="text-xs text-blue-600 font-medium mb-1">Input from previous step — override by entering data above</p>
                  )}
                  <ContentRenderer
                    entities={previewEntities}
                    renderSchema={showingPreviousStepData ? previousStepRenderSchema as RenderSchema | undefined : undefined}
                    fullHeight
                    label={`${previewEntities.length} items \u00d7 ${Object.keys(previewEntities[0] || {}).length} columns`}
                  />
                </div>
              )}

              {!hasPreviewData && stepIndex > 0 && (
                <div className="bg-blue-50 rounded border border-blue-200 p-3 flex-shrink-0">
                  <p className="text-xs text-blue-700 font-medium">No input data available</p>
                  <p className="text-xs text-blue-500 mt-1">Previous step has no output yet. Complete and approve the previous step, or upload data above.</p>
                </div>
              )}

              {!hasPreviewData && stepIndex === 0 && (
                <div className="text-center py-4 flex-shrink-0">
                  <p className="text-xs text-gray-400">No input data. Upload a file or enter data above.</p>
                </div>
              )}

              {/* SAVE INPUT button */}
              <button
                onClick={handleSaveInput}
                disabled={!inputDirty}
                className={`w-full py-2 rounded text-sm font-medium transition-colors flex-shrink-0 ${
                  inputDirty
                    ? 'bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {inputDirty ? 'Save Input' : 'Save Input (no changes)'}
              </button>
            </div>
          </PanelAccordionItem>

          {/* --- OPTIONS ACCORDION --- */}
          <PanelAccordionItem
            title="Options"
            badge={optionsDirty ? 'unsaved' : undefined}
            isOpen={panelAccordion === 'options'}
            onToggle={() => setPanelAccordion(panelAccordion === 'options' ? null : 'options')}
            variant="teal"
          >
            <div className="space-y-4">
              <SubmoduleOptions
                options={submodule.options || []}
                values={localOptions}
                onChange={handleOptionChange}
              />

              {/* SAVE OPTIONS button */}
              <button
                onClick={handleSaveOptions}
                disabled={!optionsDirty}
                className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                  optionsDirty
                    ? 'bg-[#0891B2] text-white hover:bg-[#0891B2]/90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {optionsDirty ? 'Save Options' : 'Save Options (no changes)'}
              </button>

              {/* NEXT button */}
              <button
                onClick={handleNext}
                disabled={!hasInput || isRunning}
                className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                  hasInput && !isRunning
                    ? 'bg-[#E11D73] text-white hover:bg-[#E11D73]/90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isRunning ? 'Running...' : 'Next \u2192'}
              </button>
            </div>
          </PanelAccordionItem>

          {/* --- RESULTS ACCORDION (pass-through via ContentRenderer) --- */}
          <PanelAccordionItem
            title="Results"
            badge={resultsBadge}
            isOpen={panelAccordion === 'results'}
            onToggle={() => setPanelAccordion(panelAccordion === 'results' ? null : 'results')}
            variant="pink"
          >
            <ResultsContent
              submoduleRun={submoduleRun ?? null}
              flatItems={flatItems}
              renderSchema={renderSchema}
              itemKey={itemKey}
              dataOperation={dataOperation}
              checkedKeys={checkedKeys}
              onCheckedKeysChange={isSelectable ? setCheckedKeys : undefined}
              summary={summary}
              resultsLabel={resultsLabel}
              onChangeInput={handleChangeInput}
              onChangeOptions={handleChangeOptions}
              onTryAgain={handleTryAgain}
            />
          </PanelAccordionItem>
        </div>

        {/* CTA Footer */}
        <div className="border-t border-gray-200 px-4 py-3 bg-white flex-shrink-0">
          <div className="flex items-center justify-center gap-3">
            {/* RUN TASK */}
            <button
              disabled={!hasInput || isRunning}
              onClick={handleRunTask}
              className={`px-8 py-3 rounded text-sm font-medium transition-colors ${
                hasInput && !isRunning
                  ? 'bg-[#E11D73] text-white hover:bg-[#E11D73]/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isRunning ? 'RUNNING...' : 'RUN TASK'}
            </button>

            {/* SEE RESULTS */}
            <button
              disabled={!isCompleted}
              onClick={handleSeeResults}
              className={`px-8 py-3 rounded text-sm font-medium transition-colors ${
                isCompleted
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              SEE RESULTS
            </button>

            {/* APPROVE */}
            <button
              disabled={!isCompleted || approveMutation.isPending}
              onClick={handleApprove}
              className={`px-8 py-3 rounded text-sm font-medium transition-colors ${
                isCompleted && !approveMutation.isPending
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {approveMutation.isPending ? 'APPROVING...' : 'APPROVE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- Results Content (skeleton container + ContentRenderer pass-through) ---

function ResultsContent({
  submoduleRun,
  flatItems,
  renderSchema,
  itemKey,
  dataOperation,
  checkedKeys,
  onCheckedKeysChange,
  summary,
  resultsLabel,
  onChangeInput,
  onChangeOptions,
  onTryAgain,
}: {
  submoduleRun: { status: string; progress: { current: number; total: number; message: string } | null; error: string | null } | null;
  flatItems: Array<Record<string, unknown> & { entity_name: string }>;
  renderSchema: RenderSchema | null;
  itemKey: string;
  dataOperation: string;
  checkedKeys: Set<string>;
  onCheckedKeysChange?: (keys: Set<string>) => void;
  summary: { total_entities: number; total_items: number; errors: string[]; description?: string; [key: string]: unknown } | undefined;
  resultsLabel: string | undefined;
  onChangeInput: () => void;
  onChangeOptions: () => void;
  onTryAgain: () => void;
}) {
  // No run yet
  if (!submoduleRun) {
    return <p className="text-sm text-gray-400">No results yet. Configure input and click RUN TASK.</p>;
  }

  // Pending
  if (submoduleRun.status === 'pending') {
    return (
      <div className="flex items-center gap-3 py-4">
        <Spinner />
        <p className="text-sm text-gray-500">Waiting to start...</p>
      </div>
    );
  }

  // Running — show progress
  if (submoduleRun.status === 'running') {
    const progress = submoduleRun.progress;
    const pct = progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
      <div className="space-y-3 py-2">
        <div className="flex items-center gap-3">
          <Spinner />
          <p className="text-sm text-gray-700">
            {progress?.message || 'Processing...'}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#E11D73] h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-right">
          {progress ? `${progress.current}/${progress.total}` : ''} {pct}%
        </p>
      </div>
    );
  }

  // Failed
  if (submoduleRun.status === 'failed') {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-700 font-medium">Execution failed</p>
          <p className="text-xs text-red-600 mt-1">{submoduleRun.error || 'Unknown error'}</p>
        </div>
        <ResultsActionCTAs onChangeInput={onChangeInput} onChangeOptions={onChangeOptions} onTryAgain={onTryAgain} />
      </div>
    );
  }

  // Completed or Approved — pass-through to ContentRenderer
  if (flatItems.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-400">No results returned.</p>
        <ResultsActionCTAs onChangeInput={onChangeInput} onChangeOptions={onChangeOptions} onTryAgain={onTryAgain} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Summary */}
      {summary && (
        <div className="flex-shrink-0 text-xs text-gray-600">
          {resultsLabel}
          {summary.errors.length > 0 && (
            <span className="text-red-500 ml-2">{summary.errors.length} errors</span>
          )}
        </div>
      )}

      {/* ContentRenderer — drives all rendering from render_schema */}
      <div className="flex-1 min-h-0">
        <ContentRenderer
          entities={flatItems}
          renderSchema={renderSchema}
          itemKey={itemKey}
          dataOperation={dataOperation}
          checkedKeys={checkedKeys}
          onCheckedKeysChange={onCheckedKeysChange}
          fullHeight
        />
      </div>

      {/* Action CTAs */}
      <ResultsActionCTAs
        onChangeInput={onChangeInput}
        onChangeOptions={onChangeOptions}
        onTryAgain={onTryAgain}
        showDownload
        entities={flatItems}
        renderSchema={renderSchema}
      />
    </div>
  );
}


// --- Results Action CTAs ---

function ResultsActionCTAs({
  onChangeInput,
  onChangeOptions,
  onTryAgain,
  showDownload,
  entities,
  renderSchema,
}: {
  onChangeInput: () => void;
  onChangeOptions: () => void;
  onTryAgain: () => void;
  showDownload?: boolean;
  entities?: Record<string, unknown>[];
  renderSchema?: RenderSchema | null;
}) {
  const handleDownload = () => {
    if (!entities || entities.length === 0) return;
    const metaFields = new Set(['display_type', 'selectable']);
    const columns = renderSchema
      ? Object.keys(renderSchema).filter((k) => !metaFields.has(k))
      : Object.keys(entities[0]);
    const headerRow = columns.map((c) => `"${c}"`).join(',');
    const rows = entities.map((entity) =>
      columns
        .map((col) => {
          const val = String(entity[col] ?? '');
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csv = [headerRow, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results-${entities.length}-rows.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0 pt-2 border-t border-gray-100">
      <button
        onClick={onChangeInput}
        className="text-xs text-[#3B82F6] hover:underline"
      >
        Change Input
      </button>
      <button
        onClick={onChangeOptions}
        className="text-xs text-[#0891B2] hover:underline"
      >
        Change Options
      </button>
      {showDownload && (
        <button
          onClick={handleDownload}
          className="text-xs text-gray-500 hover:underline"
        >
          Download
        </button>
      )}
      <button
        onClick={onTryAgain}
        className="text-xs text-[#E11D73] hover:underline ml-auto"
      >
        Try again
      </button>
    </div>
  );
}


// --- Spinner ---

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-[#E11D73]" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

```

---
## FILE: client/src/components/steps/Step0View.tsx
```typescript
import type { PipelineStage, Project } from '../../types/step';
import { StepApprovalFooter } from '../shared/StepApprovalFooter';

interface Step0ViewProps {
  stage: PipelineStage;
  project: Project;
  onApprove: () => void;
  onSkip: () => void;
  isApproving: boolean;
  isSkipping: boolean;
}

export function Step0View({ stage, project, onApprove, onSkip, isApproving, isSkipping }: Step0ViewProps) {
  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Project Summary</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-gray-500">Name</dt>
          <dd className="text-gray-900 font-medium">{project.name}</dd>

          {project.description && (
            <>
              <dt className="text-gray-500">Intent</dt>
              <dd className="text-gray-900">{project.description}</dd>
            </>
          )}

          <dt className="text-gray-500">Status</dt>
          <dd className="text-gray-900">{project.status}</dd>

          <dt className="text-gray-500">Created</dt>
          <dd className="text-gray-900">{new Date(project.created_at).toLocaleString()}</dd>
        </dl>
      </div>

      <StepApprovalFooter
        status={stage.status as 'active' | 'completed' | 'skipped'}
        canApprove={stage.status === 'active'}
        onApprove={onApprove}
        onSkip={onSkip}
        isApproving={isApproving}
        isSkipping={isSkipping}
      />
    </div>
  );
}

```

---
## FILE: client/src/components/steps/StepContainer.tsx
```typescript
import type { ReactNode } from 'react';
import { usePipelineStore } from '../../stores/pipelineStore';

export type StepStatus = 'pending' | 'active' | 'completed' | 'skipped';

interface StepContainerProps {
  step: number;
  title: string;
  description: string;
  status: StepStatus;
  children?: ReactNode;
}

function getStepNumberClass(status: StepStatus): string {
  switch (status) {
    case 'active':
      return 'bg-sky-600 text-white';
    case 'completed':
      return 'bg-green-500 text-white';
    case 'skipped':
      return 'bg-gray-300 text-gray-500';
    default:
      return 'bg-gray-200 text-gray-500';
  }
}

function getStatusBadgeClass(status: StepStatus): string {
  switch (status) {
    case 'active':
      return 'bg-sky-100 text-sky-700';
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'skipped':
      return 'bg-gray-100 text-gray-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
}

function getContainerClass(status: StepStatus): string {
  const base = 'rounded-lg border overflow-hidden transition-all';
  if (status === 'active') return `${base} bg-white border-sky-500 shadow-md ring-1 ring-sky-200`;
  if (status === 'completed') return `${base} bg-white border-gray-200`;
  if (status === 'skipped') return `${base} bg-gray-50 border-gray-200 opacity-40`;
  return `${base} bg-gray-50 border-gray-200 opacity-60`;
}

export function StepContainer({ step, title, description, status, children }: StepContainerProps) {
  const { expandedStep, toggleStep } = usePipelineStore();
  const isExpanded = expandedStep === step;
  const isClickable = status === 'active' || status === 'completed';

  return (
    <div className={getContainerClass(status)}>
      <div
        className={`flex items-center gap-3 px-4 py-3 select-none ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={() => isClickable && toggleStep(step)}
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getStepNumberClass(status)}`}>
          {status === 'completed' ? <span className="text-sm">✓</span> : <span>{step}</span>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${status === 'active' ? 'text-gray-900' : status === 'completed' ? 'text-gray-700' : 'text-gray-400'}`}>
              {title}
            </span>
            {status === 'skipped' && <span className="text-xs text-gray-400 italic">skipped</span>}
          </div>
          <p className={`text-xs truncate ${status === 'active' ? 'text-gray-500' : 'text-gray-300'}`}>
            {description}
          </p>
        </div>

        <div className={`flex items-center gap-2 flex-shrink-0 ${isClickable ? '' : 'opacity-50'}`}>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(status)}`}>
            {status}
          </span>
          {isClickable && (
            <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
          )}
        </div>
      </div>

      {isExpanded && children && (
        <div className="border-t border-gray-200">
          <div className="p-4">{children}</div>
        </div>
      )}
    </div>
  );
}

```

---
## FILE: client/src/components/steps/UniversalStepTemplate.tsx
```typescript
import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { PipelineStage, SubmoduleManifest } from '../../types/step';
import { useStepSubmodules } from '../../hooks/useSubmodules';
import { useSubmoduleConfig, useSubmoduleConfigs, useSaveSubmoduleConfig } from '../../hooks/useSubmoduleConfig';
import { useLatestSubmoduleRuns } from '../../hooks/useSubmoduleRuns';
import { usePanelStore } from '../../stores/panelStore';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../api/client';
import { CategoryCardGrid } from '../shared/CategoryCardGrid';
import { SubmodulePanel } from '../shared/SubmodulePanel';
import { StepSummary } from '../shared/StepSummary';
import { StepApprovalFooter } from '../shared/StepApprovalFooter';
import { ContentRenderer, type RenderSchema } from '../primitives/ContentRenderer';

interface UniversalStepTemplateProps {
  stage: PipelineStage;
  onApprove: () => void;
  onSkip: () => void;
  isApproving: boolean;
  isSkipping: boolean;
}

export function UniversalStepTemplate({ stage, onApprove, onSkip, isApproving, isSkipping }: UniversalStepTemplateProps) {
  const queryClient = useQueryClient();
  const showToast = useAppStore((s) => s.showToast);
  const isCompleted = stage.status === 'completed';
  const { data: categories, isLoading: submodulesLoading } = useStepSubmodules(stage.step_index);
  const { activeSubmoduleId } = usePanelStore();
  const { data: latestRuns } = useLatestSubmoduleRuns(stage.run_id, stage.step_index);

  // All submodule configs for this step — used by CategoryCardGrid for data op display
  const { data: configMap } = useSubmoduleConfigs(stage.run_id, stage.step_index);

  // canApprove: true when at least one submodule has an approved run
  const hasApprovedSubmodule = useMemo(() => {
    if (!latestRuns) return false;
    return Object.values(latestRuns).some((run) => run.status === 'approved');
  }, [latestRuns]);

  // Build summary rows for StepSummary from latestRuns + categories + configMap
  const summaryRows = useMemo(() => {
    if (!latestRuns || !categories || !configMap) return [];
    const rows: Array<{ name: string; dataOperation: 'add' | 'remove' | 'transform'; resultCount: number; status: string; description?: string }> = [];
    for (const subs of Object.values(categories)) {
      for (const sub of subs) {
        const run = latestRuns[sub.id];
        if (run) {
          const savedOp = configMap[sub.id]?.data_operation;
          rows.push({
            name: sub.name,
            dataOperation: (savedOp || sub.data_operation_default) as 'add' | 'remove' | 'transform',
            resultCount: run.approved_count || run.result_count || 0,
            status: run.status,
            description: run.description,
          });
        }
      }
    }
    return rows;
  }, [latestRuns, categories, configMap]);

  // Flatten categories to find active submodule by ID
  const activeSubmodule: SubmoduleManifest | null = useMemo(() => {
    if (!activeSubmoduleId || !categories) return null;
    for (const subs of Object.values(categories)) {
      const found = subs.find((s) => s.id === activeSubmoduleId);
      if (found) return found;
    }
    return null;
  }, [activeSubmoduleId, categories]);

  // Submodule config — persisted via API (for active submodule panel)
  const { data: savedConfig } = useSubmoduleConfig(stage.run_id, stage.step_index, activeSubmoduleId);
  const saveConfig = useSaveSubmoduleConfig(stage.run_id, stage.step_index, activeSubmoduleId);

  const currentDataOp = savedConfig?.data_operation
    || activeSubmodule?.data_operation_default
    || 'add';

  const handleDataOpChange = (op: 'add' | 'remove' | 'transform') => {
    saveConfig.mutate({ data_operation: op }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['submoduleConfigs', stage.run_id, stage.step_index] });
      },
    });
  };

  const handleSaveConfig = (config: Partial<NonNullable<typeof savedConfig>>) => {
    saveConfig.mutate(config, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['submoduleConfigs', stage.run_id, stage.step_index] });
      },
    });
  };

  // CategoryCardGrid data op toggle — saves for any submodule (not just the active one)
  const handleGridDataOpChange = useCallback(async (submoduleId: string, op: 'add' | 'remove' | 'transform') => {
    try {
      await api.saveSubmoduleConfig(stage.run_id, stage.step_index, submoduleId, { data_operation: op });
      queryClient.invalidateQueries({ queryKey: ['submoduleConfigs', stage.run_id, stage.step_index] });
      // Also invalidate the per-submodule config in case the panel is open for this submodule
      queryClient.invalidateQueries({ queryKey: ['submoduleConfig', stage.run_id, stage.step_index, submoduleId] });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save data operation', 'error');
    }
  }, [stage.run_id, stage.step_index, queryClient, showToast]);

  return (
    <div>
      {/* CategoryCardGrid — real manifest data */}
      {submodulesLoading ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center mb-4">
          <p className="text-gray-400 text-sm">Loading submodules...</p>
        </div>
      ) : (
        <CategoryCardGrid
          categories={categories || {}}
          latestRuns={latestRuns}
          configMap={configMap}
          onDataOperationChange={handleGridDataOpChange}
        />
      )}

      {/* StepSummary */}
      <div className="mb-4">
        <StepSummary submodules={summaryRows} />
      </div>

      {/* Completed step read-only output */}
      {isCompleted && stage.output_data && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
          <p className="text-xs text-gray-500 font-medium uppercase mb-2">Step Output</p>
          {Array.isArray(stage.output_data) && stage.output_data.length > 0 ? (
            <ContentRenderer
              entities={stage.output_data as Record<string, unknown>[]}
              renderSchema={stage.output_render_schema as RenderSchema | undefined}
              maxHeight={320}
              label={`${(stage.output_data as unknown[]).length} items`}
            />
          ) : (
            <pre className="text-xs text-gray-600 overflow-auto max-h-48">
              {JSON.stringify(stage.output_data, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Approval footer */}
      {(stage.status === 'active' || isCompleted || stage.status === 'skipped') && (
        <StepApprovalFooter
          status={stage.status as 'active' | 'completed' | 'skipped'}
          canApprove={hasApprovedSubmodule}
          onApprove={onApprove}
          onSkip={onSkip}
          isApproving={isApproving}
          isSkipping={isSkipping}
        />
      )}

      {/* SubmodulePanel — slides from left when submodule row clicked */}
      <SubmodulePanel
        stepName={stage.step_name}
        submodule={activeSubmodule}
        runId={stage.run_id}
        stepIndex={stage.step_index}
        dataOperation={currentDataOp}
        onDataOperationChange={handleDataOpChange}
        savedConfig={savedConfig}
        onSaveConfig={handleSaveConfig}
        previousStepData={stage.input_data as Record<string, unknown>[] | null}
        previousStepRenderSchema={stage.input_render_schema as Record<string, unknown> | null}
      />
    </div>
  );
}

```

---
## FILE: client/src/config/stepConfig.ts
```typescript
export { STEP_CONFIG } from '../../../shared/stepConfig.js';

export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

```

---
## FILE: client/src/hooks/useProjects.ts
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CreateProjectInput } from '../types/step';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}


```

---
## FILE: client/src/hooks/useRun.ts
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAppStore } from '../stores/appStore';

export function useRunData(runId: string | undefined) {
  return useQuery({
    queryKey: ['run', runId],
    queryFn: () => api.getRun(runId!),
    enabled: !!runId,
  });
}

export function useApproveStep(runId: string) {
  const queryClient = useQueryClient();
  const showToast = useAppStore((s) => s.showToast);

  return useMutation({
    mutationFn: (stepIndex: number) => api.approveStep(runId, stepIndex),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['run', runId] });
      showToast(
        data.next_step !== null
          ? `Step ${data.step_completed} approved — advancing to Step ${data.next_step}`
          : `Step ${data.step_completed} approved — run complete!`,
        'success'
      );
    },
  });
}

export function useSkipStep(runId: string) {
  const queryClient = useQueryClient();
  const showToast = useAppStore((s) => s.showToast);

  return useMutation({
    mutationFn: (stepIndex: number) => api.skipStep(runId, stepIndex),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['run', runId] });
      showToast(
        data.next_step !== null
          ? `Step ${data.step_skipped} skipped — advancing to Step ${data.next_step}`
          : `Step ${data.step_skipped} skipped — run complete!`,
        'info'
      );
    },
  });
}

```

---
## FILE: client/src/hooks/useStepContext.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/client';

export interface StepContextData {
  id: string;
  run_id: string;
  step_index: number;
  entities: Record<string, unknown>[];
  filename: string | null;
  source_submodule: string | null;
  created_at: string;
}

/**
 * Fetch stored step context (uploaded CSV data) for a run + step.
 * Returns null if no context has been uploaded yet.
 */
export function useStepContext(runId: string | undefined, stepIndex: number) {
  return useQuery<StepContextData | null>({
    queryKey: ['stepContext', runId, stepIndex],
    queryFn: () =>
      apiFetch<StepContextData | null>(
        `/api/runs/${runId}/steps/${stepIndex}/context`
      ),
    enabled: !!runId,
    staleTime: 30_000,
  });
}

```

---
## FILE: client/src/hooks/useSubmoduleConfig.ts
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { SubmoduleConfig } from '../types/step';

/**
 * Fetch saved config for a submodule in a run/step.
 * Returns defaults (all nulls) if no config saved yet.
 */
export function useSubmoduleConfig(runId: string | undefined, stepIndex: number, submoduleId: string | null) {
  return useQuery<SubmoduleConfig>({
    queryKey: ['submoduleConfig', runId, stepIndex, submoduleId],
    queryFn: () => api.getSubmoduleConfig(runId!, stepIndex, submoduleId!),
    enabled: !!runId && !!submoduleId,
    staleTime: 30_000,
  });
}

/**
 * Fetch all saved configs for a step as a map { submoduleId: SubmoduleConfig }.
 * Used by CategoryCardGrid to show per-submodule data operations.
 */
export function useSubmoduleConfigs(runId: string | undefined, stepIndex: number) {
  return useQuery<Record<string, SubmoduleConfig>>({
    queryKey: ['submoduleConfigs', runId, stepIndex],
    queryFn: () => api.getSubmoduleConfigs(runId!, stepIndex),
    enabled: !!runId,
    staleTime: 30_000,
  });
}

/**
 * Mutation to save submodule config (data_operation, input_config, options).
 * Optimistically updates the query cache.
 */
export function useSaveSubmoduleConfig(runId: string | undefined, stepIndex: number, submoduleId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['submoduleConfig', runId, stepIndex, submoduleId];

  return useMutation({
    mutationFn: (config: Partial<SubmoduleConfig>) =>
      api.saveSubmoduleConfig(runId!, stepIndex, submoduleId!, config),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });
}

```

---
## FILE: client/src/hooks/useSubmoduleRuns.ts
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiFetch } from '../api/client';
import { useAppStore } from '../stores/appStore';
import type { SubmoduleRun, SubmoduleLatestRunMap, ApproveSubmoduleRunResponse } from '../types/step';

/**
 * Poll a submodule run by ID.
 * Polls every 2s while status is "pending" or "running".
 * Stops polling on "completed", "failed", or "approved".
 * Pass enabled=false to pause polling (e.g. when panel is closed).
 */
export function useSubmoduleRun(submoduleRunId: string | null, enabled = true) {
  return useQuery<SubmoduleRun | null>({
    queryKey: ['submoduleRun', submoduleRunId],
    queryFn: () => {
      if (!submoduleRunId) return null;
      return api.getSubmoduleRun(submoduleRunId);
    },
    enabled: enabled && !!submoduleRunId,
    refetchInterval: (query) => {
      if (!enabled) return false;
      const status = query.state.data?.status;
      if (status === 'pending' || status === 'running') return 2000;
      return false; // stop polling
    },
    staleTime: 1000,
  });
}

/**
 * Trigger submodule execution.
 * Returns { submodule_run_id, status: "pending" }.
 */
export function useExecuteSubmodule() {
  const queryClient = useQueryClient();
  const showToast = useAppStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ runId, stepIndex, submoduleId, entities }: { runId: string; stepIndex: number; submoduleId: string; entities?: Record<string, unknown>[] }) =>
      api.executeSubmodule(runId, stepIndex, submoduleId, entities?.length ? { entities } : undefined),
    onSuccess: (_data, vars) => {
      // Invalidate latest runs so CategoryCardGrid updates
      queryClient.invalidateQueries({ queryKey: ['latestSubmoduleRuns', vars.runId, vars.stepIndex] });
      showToast('Task started', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to start task', 'error');
    },
  });
}

/**
 * Approve (or re-approve) a submodule run.
 * Sends approved item keys, server updates working pool.
 */
export function useApproveSubmoduleRun() {
  const queryClient = useQueryClient();
  const showToast = useAppStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ submoduleRunId, approvedItemKeys }: { submoduleRunId: string; approvedItemKeys: string[] }) =>
      api.approveSubmoduleRun(submoduleRunId, approvedItemKeys),
    onSuccess: (data) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['latestSubmoduleRuns'] });
      queryClient.invalidateQueries({ queryKey: ['submoduleRun'] });
      showToast(`Approved — ${data.approved_count} items, pool: ${data.pool_count}`, 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to approve', 'error');
    },
  });
}

/**
 * Fetch latest submodule run per submodule for a step.
 * Used by CategoryCardGrid to show status badges.
 */
export function useLatestSubmoduleRuns(runId: string | undefined, stepIndex: number) {
  return useQuery<SubmoduleLatestRunMap>({
    queryKey: ['latestSubmoduleRuns', runId, stepIndex],
    queryFn: () => api.getLatestSubmoduleRuns(runId!, stepIndex),
    enabled: !!runId,
    refetchInterval: 5000, // refresh every 5s to catch background job completions
    staleTime: 2000,
  });
}

```

---
## FILE: client/src/hooks/useSubmodules.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CategoryGroups } from '../types/step';

/**
 * Fetch submodules for a specific step, grouped by category.
 * Returns CategoryGroups: Record<categoryName, SubmoduleManifest[]>
 */
export function useStepSubmodules(stepIndex: number) {
  return useQuery<CategoryGroups>({
    queryKey: ['submodules', stepIndex],
    queryFn: () => api.getSubmodules(stepIndex),
    staleTime: 5 * 60 * 1000, // 5 min — manifests rarely change
  });
}

```

---
## FILE: client/src/index.css
```css
@import "tailwindcss";

/* Design tokens matching Alpine.js UI */
:root {
  --teal: #0891B2;
  --pink: #E11D73;
  --brand-600: #0284c7;
  --green-500: #22c55e;
  --blue-500: #3b82f6;
  --orange-500: #f59e0b;
  --yellow-500: #eab308;
  --red-500: #ef4444;
  --bg-panel: #f3f4f6;
  --bg-page: #f9fafb;
}

body {
  background-color: var(--bg-page);
  color: #111827;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Status badges */
.status-badge {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.status-badge.approved { background-color: #dcfce7; color: #15803d; }
.status-badge.has-results { background-color: #dbeafe; color: #1d4ed8; }
.status-badge.running { background-color: #ffedd5; color: #c2410c; }
.status-badge.pending { background-color: #f3f4f6; color: #4b5563; }
.status-badge.error { background-color: #fee2e2; color: #b91c1c; }

/* Button styles */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary { background-color: var(--teal); color: white; }
.btn-primary:hover { background-color: #0e7490; }
.btn-secondary { background-color: #e5e7eb; color: #374151; }
.btn-secondary:hover { background-color: #d1d5db; }
.btn-approve { background-color: var(--pink); color: white; }
.btn-approve:hover { background-color: #be185d; }

/* Step container styles */
.step-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  overflow: hidden;
  background: white;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
  cursor: pointer;
}

.step-header.active { background-color: var(--brand-600); color: white; }
.step-content { border-top: 1px solid #e5e7eb; }

```

---
## FILE: client/src/main.tsx
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

```

---
## FILE: client/src/router.tsx
```typescript
import { createBrowserRouter, Link, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/client';
import { AppHeader } from './components/layout/AppHeader';
import { Toast } from './components/layout/Toast';
import { NewProject } from './components/pages/NewProject';
import { ProjectsList } from './components/pages/ProjectsList';
import { RunView } from './components/pages/RunView';

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-5xl mx-auto p-6">
          <Outlet />
        </main>
        <Toast />
      </div>
    </QueryClientProvider>
  );
}

function TemplatesPage() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
      <p className="text-gray-400 text-sm">No templates yet</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">Page not found</p>
      <Link to="/projects" className="text-brand-600 hover:underline text-sm mt-2 inline-block">
        Back to Projects
      </Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: 'new', element: <NewProject /> },
      { path: 'projects', element: <ProjectsList /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'projects/:projectId/runs/:runId', element: <RunView /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

```

---
## FILE: client/src/stores/appStore.ts
```typescript
import { create } from 'zustand';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppStore {
  toast: Toast | null;
  showToast: (message: string, type?: Toast['type']) => void;
  hideToast: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  hideToast: () => set({ toast: null }),
}));

```

---
## FILE: client/src/stores/panelStore.ts
```typescript
import { create } from 'zustand';

export type PanelAccordion = 'input' | 'options' | 'results' | null;

/**
 * Panel UI Store - UI state only
 *
 * ARCHITECTURE NOTE: This store only holds panel visibility and accordion state.
 * Domain data (results, run IDs) comes from TanStack Query mutations.
 * Form state (CSV, options) should be local useState in components.
 */
interface PanelStore {
  // Panel visibility
  submodulePanelOpen: boolean;
  activeSubmoduleId: string | null;
  activeCategoryKey: string | null;

  // Active submodule run ID — for polling resume on panel reopen
  activeSubmoduleRunId: string | null;

  // Accordion state
  panelAccordion: PanelAccordion;

  // Actions
  openSubmodulePanel: (submoduleId: string, categoryKey: string) => void;
  closeSubmodulePanel: () => void;
  setPanelAccordion: (accordion: PanelAccordion) => void;
  setActiveSubmoduleRunId: (runId: string | null) => void;
}

export const usePanelStore = create<PanelStore>((set) => ({
  submodulePanelOpen: false,
  activeSubmoduleId: null,
  activeCategoryKey: null,
  activeSubmoduleRunId: null,
  panelAccordion: 'input',

  openSubmodulePanel: (submoduleId, categoryKey) =>
    set({
      submodulePanelOpen: true,
      activeSubmoduleId: submoduleId,
      activeCategoryKey: categoryKey,
      panelAccordion: 'input',
    }),

  closeSubmodulePanel: () =>
    set({
      submodulePanelOpen: false,
      // Keep activeSubmoduleRunId so polling can resume on reopen
    }),

  setPanelAccordion: (accordion) =>
    set({ panelAccordion: accordion }),

  setActiveSubmoduleRunId: (runId) =>
    set({ activeSubmoduleRunId: runId }),
}));

```

---
## FILE: client/src/stores/pipelineStore.ts
```typescript
import { create } from 'zustand';

interface PipelineStore {
  expandedStep: number | null;
  toggleStep: (step: number) => void;
  setExpandedStep: (step: number | null) => void;
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  expandedStep: null,
  toggleStep: (step) => {
    set({ expandedStep: get().expandedStep === step ? null : step });
  },
  setExpandedStep: (step) => set({ expandedStep: step }),
}));

```

---
## FILE: client/src/types/step.ts
```typescript
export interface Project {
  id: string;
  name: string;
  description: string | null;
  timing: string | null;
  template_id: string | null;
  status: 'active' | 'archived';
  created_at: string;
}

export interface PipelineRun {
  id: string;
  project_id: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  current_step: number;
  started_at: string;
  completed_at: string | null;
}

export interface PipelineStage {
  id: string;
  run_id: string;
  step_index: number;
  step_name: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  input_data: unknown;
  input_render_schema: unknown;
  output_data: unknown;
  output_render_schema: unknown;
  working_pool: unknown;
  working_pool_render_schema: unknown;
  started_at: string | null;
  completed_at: string | null;
}

export interface ProjectWithRuns extends Project {
  runs: PipelineRun[];
}

export interface RunWithStages extends PipelineRun {
  stages: PipelineStage[];
}

export interface CreateProjectInput {
  name: string;
  intent?: string;
}

export interface CreateProjectResponse {
  project: Project;
  run: PipelineRun;
}

export interface StepApproveResponse {
  step_completed: number;
  next_step: number | null;
  items_forwarded: number;
}

export interface StepSkipResponse {
  step_skipped: number;
  next_step: number | null;
}

// Submodule types (from manifest.json)
export interface SubmoduleManifest {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: 'cheap' | 'medium' | 'expensive';
  data_operation_default: 'add' | 'remove' | 'transform';
  requires_columns: string[];
  item_key: string;
  options: SubmoduleOption[];
  options_defaults: Record<string, unknown>;
  output_schema: Record<string, string>;
}

export interface SubmoduleOption {
  name: string;
  type: 'boolean' | 'number' | 'text' | 'select' | 'textarea';
  label: string;
  description: string;
  default: unknown;
  min?: number;
  max?: number;
  values?: string[];
  maxLength?: number;
}

// CategoryGroups: Record<categoryName, SubmoduleManifest[]>
export type CategoryGroups = Record<string, SubmoduleManifest[]>;

// Persisted submodule configuration per run/step/submodule
export interface SubmoduleConfig {
  id?: string;
  run_id: string;
  step_index: number;
  submodule_id: string;
  input_config: unknown;
  options: Record<string, unknown> | null;
  data_operation: 'add' | 'remove' | 'transform' | null;
  updated_at?: string;
}

// Phase 7: Submodule run — one execution of one submodule
export interface SubmoduleRun {
  id: string;
  submodule_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'approved';
  progress: { current: number; total: number; message: string } | null;
  output_data: SubmoduleOutput | null;
  output_render_schema: { display_type?: string; selectable?: boolean; [field: string]: unknown } | null;
  approved_items: string[] | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
}

// Output shape from execute() — per-entity results + summary
export interface SubmoduleOutput {
  results: SubmoduleEntityResult[];
  summary: { total_entities: number; total_items: number; errors: string[]; description?: string; [key: string]: unknown };
}

export interface SubmoduleEntityResult {
  entity_name: string;
  items: Record<string, unknown>[];
  meta?: Record<string, unknown>;
  error?: string;
}

// Latest run status per submodule (from /submodule-runs/latest endpoint)
export interface SubmoduleLatestRun {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'approved';
  progress: { current: number; total: number; message: string } | null;
  result_count: number;
  approved_count: number;
  description?: string;
}

export type SubmoduleLatestRunMap = Record<string, SubmoduleLatestRun>;

// Approval response
export interface ApproveSubmoduleRunResponse {
  status: 'approved';
  pool_count: number;
  approved_count: number;
}

```

---
## FILE: client/tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens from Alpine UI
        teal: {
          500: '#0891B2',
          600: '#0e7490',
        },
        pink: {
          500: '#E11D73',
          600: '#be185d',
        },
        brand: {
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
    },
  },
  plugins: [],
}

```

---
## FILE: client/vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: ['..'] },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

```

---
## FILE: server/routes/projects.js
```javascript
import { Router } from 'express';
import db from '../services/db.js';
import { STEP_CONFIG } from '../../shared/stepConfig.js';

const router = Router();

/**
 * GET /api/projects
 * List all projects
 */
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await db
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) { next(err); }
});

/**
 * GET /api/projects/:id
 * Project details with latest run
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { data: project, error: projErr } = await db
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (projErr && projErr.code !== 'PGRST116') throw projErr;
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { data: runs, error: runsErr } = await db
      .from('pipeline_runs')
      .select('id, status, current_step, started_at, completed_at')
      .eq('project_id', req.params.id)
      .order('started_at', { ascending: false })
      .limit(10);

    if (runsErr) throw runsErr;

    res.json({ ...project, runs: runs || [] });
  } catch (err) { next(err); }
});

/**
 * POST /api/projects
 * Create project + pipeline_run + 11 pipeline_stages
 * Body: { name, intent? }
 * Returns: { project, run }
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, intent } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    // 1. Create project
    const { data: project, error: projErr } = await db
      .from('projects')
      .insert({
        name: name.trim(),
        description: intent || null,
        status: 'active',
      })
      .select()
      .single();

    if (projErr) throw projErr;

    // 2. Create pipeline_run
    const { data: run, error: runErr } = await db
      .from('pipeline_runs')
      .insert({
        project_id: project.id,
        status: 'running',
        current_step: 0,
      })
      .select()
      .single();

    if (runErr) throw runErr;

    // 3. Create 11 pipeline_stages (step 0 = active, steps 1-10 = pending)
    const stages = STEP_CONFIG.map((step) => ({
      run_id: run.id,
      step_index: step.index,
      step_name: step.name,
      status: step.index === 0 ? 'active' : 'pending',
    }));

    const { error: stagesErr } = await db
      .from('pipeline_stages')
      .insert(stages);

    if (stagesErr) throw stagesErr;

    res.status(201).json({ project, run });
  } catch (err) { next(err); }
});

export default router;

```

---
## FILE: server/routes/runs.js
```javascript
import { Router } from 'express';
import db from '../services/db.js';

const router = Router();

/**
 * GET /api/runs/:id
 * Run status, current step, all stages
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { data: run, error: runErr } = await db
      .from('pipeline_runs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (runErr && runErr.code !== 'PGRST116') throw runErr;
    if (!run) return res.status(404).json({ error: 'Run not found' });

    const { data: stages, error: stagesErr } = await db
      .from('pipeline_stages')
      .select('*')
      .eq('run_id', req.params.id)
      .order('step_index', { ascending: true });

    if (stagesErr) throw stagesErr;

    res.json({ ...run, stages: stages || [] });
  } catch (err) { next(err); }
});

/**
 * GET /api/runs/:runId/steps/:stepIndex
 * Get step data for a specific step
 */
router.get('/:runId/steps/:stepIndex', async (req, res, next) => {
  try {
    const { runId, stepIndex } = req.params;

    const { data: stage, error } = await db
      .from('pipeline_stages')
      .select('*')
      .eq('run_id', runId)
      .eq('step_index', parseInt(stepIndex))
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!stage) return res.status(404).json({ error: 'Step not found' });

    res.json(stage);
  } catch (err) { next(err); }
});

/**
 * GET /api/runs/:runId/steps/:stepIndex/submodule-configs
 * Returns all saved submodule configs for this step as a map { submoduleId: config }.
 */
router.get('/:runId/steps/:stepIndex/submodule-configs', async (req, res, next) => {
  try {
    const { runId, stepIndex } = req.params;

    const { data, error } = await db
      .from('run_submodule_config')
      .select('*')
      .eq('run_id', runId)
      .eq('step_index', parseInt(stepIndex));

    if (error) throw error;

    const map = {};
    for (const row of data || []) {
      map[row.submodule_id] = row;
    }
    res.json(map);
  } catch (err) { next(err); }
});

/**
 * POST /api/runs/:runId/steps/:stepIndex/approve
 * Approve step — full version (Phase 8).
 * Step 0: unconditional advance. Steps 1-10: require at least one approved submodule.
 * Finalizes working_pool → output_data, flows data to next step.
 */
router.post('/:runId/steps/:stepIndex/approve', async (req, res, next) => {
  try {
    const { runId, stepIndex: stepIndexStr } = req.params;
    const stepIndex = parseInt(stepIndexStr);

    // Load the stage
    const { data: stage, error: stageErr } = await db
      .from('pipeline_stages')
      .select('*')
      .eq('run_id', runId)
      .eq('step_index', stepIndex)
      .single();

    if (stageErr) throw stageErr;
    if (!stage) return res.status(404).json({ error: 'Step not found' });
    if (stage.status !== 'active') return res.status(400).json({ error: 'Step is not active' });

    // For steps with submodules (step > 0): validate at least one approved submodule_run
    let approvedRuns = [];
    if (stepIndex > 0) {
      const { data, error } = await db
        .from('submodule_runs')
        .select('id, submodule_id, approved_items, output_render_schema')
        .eq('stage_id', stage.id)
        .eq('status', 'approved');

      if (error) throw error;
      approvedRuns = data || [];

      if (approvedRuns.length === 0) {
        return res.status(400).json({ error: 'At least one submodule must be approved before approving the step' });
      }
    }

    // Compute output_render_schema (union of approved submodule schemas)
    let stageOutputRenderSchema = stage.output_render_schema;
    if (approvedRuns.length > 0) {
      const mergedSchema = {};
      for (const run of approvedRuns) {
        if (run.output_render_schema) {
          Object.assign(mergedSchema, run.output_render_schema);
        }
      }
      if (!mergedSchema.display_type) {
        mergedSchema.display_type = 'table';
      }
      stageOutputRenderSchema = mergedSchema;
    }

    // Finalize pool → output_data
    const outputData = stage.working_pool || [];
    const itemsForwarded = Array.isArray(outputData) ? outputData.length : 0;

    // Mark current step completed with finalized output
    const { error: completeErr } = await db
      .from('pipeline_stages')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        output_data: outputData,
        output_render_schema: stageOutputRenderSchema,
      })
      .eq('id', stage.id);

    if (completeErr) throw completeErr;

    const isLastStep = stepIndex >= 10;
    let nextStep = null;

    if (!isLastStep) {
      nextStep = stepIndex + 1;

      // Activate next step: copy output → input, initialize working_pool
      const { error: nextErr } = await db
        .from('pipeline_stages')
        .update({
          status: 'active',
          input_data: outputData,
          input_render_schema: stageOutputRenderSchema,
          working_pool: outputData,
          started_at: new Date().toISOString(),
        })
        .eq('run_id', runId)
        .eq('step_index', nextStep);

      if (nextErr) throw nextErr;

      // Update run's current_step
      const { error: runErr } = await db
        .from('pipeline_runs')
        .update({ current_step: nextStep })
        .eq('id', runId);

      if (runErr) throw runErr;
    } else {
      // Last step — complete the run
      const { error: runErr } = await db
        .from('pipeline_runs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', runId);

      if (runErr) throw runErr;
    }

    // Log decision
    await db
      .from('decision_log')
      .insert({
        run_id: runId,
        step_index: stepIndex,
        decision: 'step_approved',
        context: {
          approved_submodule_count: approvedRuns.length,
          items_forwarded: itemsForwarded,
          next_step: nextStep,
        },
      });

    res.json({
      step_completed: stepIndex,
      next_step: nextStep,
      items_forwarded: itemsForwarded,
    });
  } catch (err) { next(err); }
});

/**
 * POST /api/runs/:runId/steps/:stepIndex/skip
 * Skip step — pass input_data -> output_data unchanged, advance
 */
router.post('/:runId/steps/:stepIndex/skip', async (req, res, next) => {
  try {
    const { runId, stepIndex: stepIndexStr } = req.params;
    const stepIndex = parseInt(stepIndexStr);

    // Load the stage
    const { data: stage, error: stageErr } = await db
      .from('pipeline_stages')
      .select('*')
      .eq('run_id', runId)
      .eq('step_index', stepIndex)
      .single();

    if (stageErr) throw stageErr;
    if (!stage) return res.status(404).json({ error: 'Step not found' });
    if (stage.status !== 'active') return res.status(400).json({ error: 'Step is not active' });

    // Mark skipped — pass input_data through as output_data
    const { error: skipErr } = await db
      .from('pipeline_stages')
      .update({
        status: 'skipped',
        output_data: stage.input_data,
        output_render_schema: stage.input_render_schema,
        completed_at: new Date().toISOString(),
      })
      .eq('id', stage.id);

    if (skipErr) throw skipErr;

    const isLastStep = stepIndex >= 10;
    let nextStep = null;

    if (!isLastStep) {
      nextStep = stepIndex + 1;

      // Activate next step
      const { error: nextErr } = await db
        .from('pipeline_stages')
        .update({
          status: 'active',
          input_data: stage.input_data,
          input_render_schema: stage.input_render_schema,
          working_pool: stage.input_data,
          started_at: new Date().toISOString(),
        })
        .eq('run_id', runId)
        .eq('step_index', nextStep);

      if (nextErr) throw nextErr;

      // Update run's current_step
      const { error: runErr } = await db
        .from('pipeline_runs')
        .update({ current_step: nextStep })
        .eq('id', runId);

      if (runErr) throw runErr;
    } else {
      // Last step — complete the run
      const { error: runErr } = await db
        .from('pipeline_runs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', runId);

      if (runErr) throw runErr;
    }

    // Log decision
    await db
      .from('decision_log')
      .insert({
        run_id: runId,
        step_index: stepIndex,
        decision: 'step_skipped',
        context: {
          items_passed_through: Array.isArray(stage.input_data) ? stage.input_data.length : 0,
          next_step: nextStep,
        },
      });

    res.json({
      step_skipped: stepIndex,
      next_step: nextStep,
    });
  } catch (err) { next(err); }
});

export default router;

```

---
## FILE: server/routes/stepContext.js
```javascript
import { Router } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import supabase from '../services/db.js';
import { getSubmodules } from '../services/moduleLoader.js';

const router = Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * Compute the union of requires_columns for all submodules in a step.
 */
function getStepRequiredColumns(stepIndex) {
  const subs = getSubmodules(stepIndex);
  const cols = new Set();
  for (const sub of subs) {
    for (const col of sub.requires_columns || []) {
      cols.add(col);
    }
  }
  return [...cols].sort((a, b) => {
    if (a === 'name') return -1;
    if (b === 'name') return 1;
    return a.localeCompare(b);
  });
}

/**
 * POST /api/runs/:runId/steps/:stepIndex/context
 * Upload a CSV file, parse server-side, validate columns, store in step_context.
 */
router.post('/', upload.single('file'), async (req, res) => {
  const { runId, stepIndex } = req.params;
  const step = parseInt(stepIndex, 10);
  const submoduleId = req.body?.submodule_id || null;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const ext = req.file.originalname.split('.').pop()?.toLowerCase();
  if (ext !== 'csv') {
    return res.status(415).json({ error: 'Unsupported file type. Supported: CSV' });
  }

  // Parse CSV
  let records;
  try {
    let content = req.file.buffer.toString('utf-8');

    // Detect double-encoded CSV: when a spreadsheet app (Numbers/Excel) re-saves a CSV,
    // it can wrap each row as a single quoted field with doubled internal quotes.
    // e.g. header becomes: "url,""priority"",""last_modified"""  (one field instead of four)
    // Fix: strip the outer quoting layer and un-escape doubled quotes.
    const firstLine = content.split(/\r?\n/)[0];
    const testParse = parse(firstLine + '\n', { columns: false, skip_empty_lines: true, bom: true, relax_column_count: true });
    if (testParse.length > 0 && testParse[0].length === 1 && testParse[0][0].includes(',')) {
      console.log('[stepContext] Detected double-encoded CSV — stripping outer quoting layer');
      // Each line is a single quoted field. Un-wrap: strip outer quotes and unescape "" → "
      const lines = content.split(/\r?\n/);
      const fixed = lines.map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          // Remove outer quotes and unescape doubled quotes
          return trimmed.slice(1, -1).replace(/""/g, '"');
        }
        return trimmed;
      });
      content = fixed.join('\n');
    }

    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    });
  } catch (err) {
    return res.status(400).json({ error: `CSV parse error: ${err.message}` });
  }

  if (records.length === 0) {
    return res.status(400).json({ error: 'CSV contains no data rows' });
  }

  if (records.length > 10000) {
    return res.status(400).json({ error: `Too many rows (${records.length}). Maximum: 10,000` });
  }

  // Validate columns against step's union of requires_columns
  const requiredColumns = getStepRequiredColumns(step);
  const foundColumns = Object.keys(records[0]);
  const normalizedFound = foundColumns.map(c => c.toLowerCase().trim());
  const columnsMissing = requiredColumns.filter(c => !normalizedFound.includes(c.toLowerCase()));
  const columnsFound = requiredColumns.filter(c => normalizedFound.includes(c.toLowerCase()));

  // Normalize column names to lowercase
  const entities = records.map(row => {
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[key.toLowerCase().trim()] = value;
    }
    return normalized;
  });

  // Upsert into step_context (one per run + step)
  const { data, error } = await supabase
    .from('step_context')
    .upsert({
      run_id: runId,
      step_index: step,
      entities,
      filename: req.file.originalname,
      source_submodule: submoduleId,
      created_at: new Date().toISOString(),
    }, { onConflict: 'run_id,step_index' })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    entity_count: entities.length,
    columns_found: columnsFound,
    columns_missing: columnsMissing,
    all_columns: foundColumns,
    filename: req.file.originalname,
  });
});

/**
 * GET /api/runs/:runId/steps/:stepIndex/context
 * Returns stored step context or null.
 */
router.get('/', async (req, res) => {
  const { runId, stepIndex } = req.params;
  const step = parseInt(stepIndex, 10);

  const { data, error } = await supabase
    .from('step_context')
    .select('*')
    .eq('run_id', runId)
    .eq('step_index', step)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;

```

---
## FILE: server/routes/submoduleConfig.js
```javascript
import { Router } from 'express';
import supabase from '../services/db.js';

const router = Router({ mergeParams: true });

/**
 * GET /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/config
 * Returns saved config for a submodule in a run/step, or defaults if none saved.
 */
router.get('/', async (req, res) => {
  const { runId, stepIndex, submoduleId } = req.params;

  const { data, error } = await supabase
    .from('run_submodule_config')
    .select('*')
    .eq('run_id', runId)
    .eq('step_index', parseInt(stepIndex, 10))
    .eq('submodule_id', submoduleId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Return saved config or empty defaults
  res.json(data || {
    run_id: runId,
    step_index: parseInt(stepIndex, 10),
    submodule_id: submoduleId,
    input_config: null,
    options: null,
    data_operation: null,
  });
});

/**
 * PUT /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/config
 * Upsert config for a submodule. Body may contain: data_operation, input_config, options.
 */
router.put('/', async (req, res) => {
  const { runId, stepIndex, submoduleId } = req.params;
  const { data_operation, input_config, options } = req.body;

  const row = {
    run_id: runId,
    step_index: parseInt(stepIndex, 10),
    submodule_id: submoduleId,
    updated_at: new Date().toISOString(),
  };

  // Only include fields that were sent
  if (data_operation !== undefined) row.data_operation = data_operation;
  if (input_config !== undefined) row.input_config = input_config;
  if (options !== undefined) row.options = options;

  const { data, error } = await supabase
    .from('run_submodule_config')
    .upsert(row, { onConflict: 'run_id,step_index,submodule_id' })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;

```

---
## FILE: server/routes/submoduleRuns.js
```javascript
/**
 * Submodule Run Routes — execution, polling, approval, re-approval.
 *
 * Routes:
 *   POST /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/run
 *   GET  /api/submodule-runs/:id
 *   POST /api/submodule-runs/:id/approve
 *   GET  /api/runs/:runId/steps/:stepIndex/submodule-runs/latest
 */

import { Router } from 'express';
import db from '../services/db.js';
import { getSubmoduleById, getSubmodules } from '../services/moduleLoader.js';
import { enqueueSubmoduleJob } from '../services/queue.js';

// --- Execute router (mounted at /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId) ---
export const executeRouter = Router({ mergeParams: true });

/**
 * POST /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/run
 * Create a BullMQ job to execute the submodule.
 */
executeRouter.post('/run', async (req, res) => {
  try {
    const { runId, stepIndex, submoduleId } = req.params;
    const stepIdx = parseInt(stepIndex, 10);

    // 1. Validate manifest exists
    const manifest = getSubmoduleById(submoduleId);
    if (!manifest) {
      return res.status(404).json({ error: `Submodule not found: ${submoduleId}` });
    }

    // 2. Get stage row
    const { data: stage, error: stageErr } = await db
      .from('pipeline_stages')
      .select('id')
      .eq('run_id', runId)
      .eq('step_index', stepIdx)
      .single();

    if (stageErr || !stage) {
      return res.status(404).json({ error: 'Pipeline stage not found' });
    }

    // 3. Check no active run (409 if pending/running exists)
    const { data: activeRuns } = await db
      .from('submodule_runs')
      .select('id, status')
      .eq('run_id', runId)
      .eq('submodule_id', submoduleId)
      .in('status', ['pending', 'running']);

    if (activeRuns && activeRuns.length > 0) {
      return res.status(409).json({ error: 'Submodule already has an active run', active_run_id: activeRuns[0].id });
    }

    // 4. Resolve input — auto-resolution priority:
    //    0. Request body entities (sent directly from client — no DB roundtrip)
    //    1. Saved input_config (textarea entities or csv reference)
    //    2. Previous step output (step_index > 0)
    //    3. step_context (shared CSV upload, may exist without explicit save)
    let inputData = null;

    console.log(`[execute] Resolving input for ${submoduleId} at step ${stepIdx}`);

    // Priority 0: Entities sent directly in request body (most reliable — no save-then-read)
    if (req.body?.entities?.length > 0) {
      inputData = { entities: req.body.entities, run_id: runId, step_index: stepIdx, submodule_id: submoduleId };
      console.log(`[execute] Priority 0: ${req.body.entities.length} entities from request body`);
    }

    // Priority 1: Check saved input_config (user explicitly saved via SAVE INPUT)
    if (!inputData) {
      const { data: savedConfig } = await db
        .from('run_submodule_config')
        .select('input_config')
        .eq('run_id', runId)
        .eq('step_index', stepIdx)
        .eq('submodule_id', submoduleId)
        .maybeSingle();

      if (savedConfig?.input_config) {
        const inputConfig = savedConfig.input_config;

        if (inputConfig.source === 'textarea' && inputConfig.entities?.length > 0) {
          // Textarea: entities stored directly in input_config
          inputData = { entities: inputConfig.entities, run_id: runId, step_index: stepIdx, submodule_id: submoduleId };
          console.log(`[execute] Priority 1: ${inputConfig.entities.length} entities from textarea config`);
        } else if (inputConfig.source === 'csv') {
          // CSV: load parsed entities from step_context
          const { data: ctx } = await db
            .from('step_context')
            .select('entities')
            .eq('run_id', runId)
            .eq('step_index', stepIdx)
            .maybeSingle();

          if (ctx?.entities) {
            inputData = { entities: ctx.entities, run_id: runId, step_index: stepIdx, submodule_id: submoduleId };
            console.log(`[execute] Priority 1: ${ctx.entities.length} entities from CSV config`);
          }
        }
      }
    }

    // Priority 2: Previous step output (re-group flat pool items into entity format)
    if (!inputData && stepIdx > 0) {
      const { data: prevStage } = await db
        .from('pipeline_stages')
        .select('output_data')
        .eq('run_id', runId)
        .eq('step_index', stepIdx - 1)
        .maybeSingle();

      console.log(`[execute] Priority 2: prevStage exists=${!!prevStage}, output_data type=${prevStage?.output_data ? (Array.isArray(prevStage.output_data) ? `array(${prevStage.output_data.length})` : typeof prevStage.output_data) : 'null'}`);

      if (prevStage?.output_data && Array.isArray(prevStage.output_data) && prevStage.output_data.length > 0) {
        // Working pool is a flat array of items with entity_name.
        // Re-group into entity format: [{ name, items: [...] }]
        const poolItems = prevStage.output_data;
        const entityMap = new Map();
        for (const item of poolItems) {
          const name = item.entity_name || 'unknown';
          if (!entityMap.has(name)) {
            entityMap.set(name, { name, items: [] });
          }
          entityMap.get(name).items.push(item);
        }
        const groupedEntities = Array.from(entityMap.values());
        inputData = { entities: groupedEntities, run_id: runId, step_index: stepIdx, submodule_id: submoduleId };
        console.log(`[execute] Priority 2: Re-grouped ${poolItems.length} pool items into ${groupedEntities.length} entities. First item keys: ${poolItems.length > 0 ? Object.keys(poolItems[0]).join(', ') : 'n/a'}`);
      }
    }

    // Priority 3: step_context (shared CSV upload — may exist without SAVE INPUT)
    if (!inputData) {
      const { data: ctx } = await db
        .from('step_context')
        .select('entities')
        .eq('run_id', runId)
        .eq('step_index', stepIdx)
        .maybeSingle();

      if (ctx?.entities) {
        inputData = { entities: ctx.entities, run_id: runId, step_index: stepIdx, submodule_id: submoduleId };
        console.log(`[execute] Priority 3: ${ctx.entities.length} entities from step_context`);
      }
    }

    if (!inputData) {
      console.log(`[execute] NO INPUT FOUND for ${submoduleId} at step ${stepIdx}, run ${runId}`);
      return res.status(400).json({ error: 'No input data available. Upload data or ensure previous step has output.' });
    }

    console.log(`[execute] Final input: ${inputData.entities.length} entities for ${submoduleId}`);

    // 5. Resolve options
    const { data: optConfig } = await db
      .from('run_submodule_config')
      .select('options')
      .eq('run_id', runId)
      .eq('step_index', stepIdx)
      .eq('submodule_id', submoduleId)
      .maybeSingle();

    const options = optConfig?.options || manifest.options_defaults || {};

    // 6. Create submodule_runs row
    const { data: subRun, error: insertErr } = await db
      .from('submodule_runs')
      .insert({
        stage_id: stage.id,
        run_id: runId,
        submodule_id: submoduleId,
        status: 'pending',
        input_data: inputData,
        options,
        output_render_schema: manifest.output_schema || null,
      })
      .select()
      .single();

    if (insertErr) {
      // Unique constraint violation from partial index = concurrent duplicate request
      if (insertErr.code === '23505') {
        return res.status(409).json({ error: 'Submodule already has an active run (concurrent request)' });
      }
      console.error('[execute] Failed to create submodule_runs row:', insertErr);
      return res.status(500).json({ error: 'Failed to create execution record' });
    }

    // 7. Enqueue BullMQ job
    await enqueueSubmoduleJob({
      submoduleRunId: subRun.id,
      submoduleId,
      stepIndex: stepIdx,
      cost: manifest.cost || 'medium',
    });

    res.json({ submodule_run_id: subRun.id, status: 'pending' });
  } catch (err) {
    console.error('[execute] Error:', err);
    res.status(500).json({ error: err.message });
  }
});


// --- Submodule run router (mounted at /api/submodule-runs) ---
export const submoduleRunRouter = Router();

/**
 * GET /api/submodule-runs/:id
 * Polling endpoint — returns status, progress, output_data, approved_items.
 */
submoduleRunRouter.get('/:id', async (req, res) => {
  try {
    const { data, error } = await db
      .from('submodule_runs')
      .select('id, submodule_id, status, progress, output_data, output_render_schema, approved_items, error, started_at, completed_at')
      .eq('id', req.params.id)
      .single();

    if (error?.code === 'PGRST116' || !data) {
      return res.status(404).json({ error: 'Submodule run not found' });
    }
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('[submodule-runs] GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/submodule-runs/:id/approve
 * Approve (or re-approve) a submodule run.
 * Body: { approved_item_keys: [...] }
 *
 * Re-approval: if status is already "approved", updates approved_items
 * and re-runs the working pool update.
 */
submoduleRunRouter.post('/:id/approve', async (req, res) => {
  try {
    const { approved_item_keys } = req.body;

    if (!Array.isArray(approved_item_keys)) {
      return res.status(400).json({ error: 'approved_item_keys must be an array' });
    }
    if (approved_item_keys.length > 50000) {
      return res.status(400).json({ error: 'approved_item_keys exceeds maximum length (50000)' });
    }
    if (approved_item_keys.some((k) => typeof k !== 'string' && typeof k !== 'number')) {
      return res.status(400).json({ error: 'approved_item_keys must contain only strings or numbers' });
    }

    // 1. Load submodule run
    const { data: subRun, error: getErr } = await db
      .from('submodule_runs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (getErr?.code === 'PGRST116' || !subRun) {
      return res.status(404).json({ error: 'Submodule run not found' });
    }
    if (getErr) throw getErr;

    // Allow approval from "completed" or re-approval from "approved"
    if (subRun.status !== 'completed' && subRun.status !== 'approved') {
      return res.status(400).json({ error: `Cannot approve run with status "${subRun.status}"` });
    }

    // 2. Get manifest for item_key and data_operation
    const manifest = getSubmoduleById(subRun.submodule_id);
    const itemKey = manifest?.item_key || 'url';

    // 3. Read data_operation from saved config or manifest default
    const { data: savedConfig } = await db
      .from('run_submodule_config')
      .select('data_operation')
      .eq('run_id', subRun.run_id)
      .eq('step_index', subRun.input_data?.step_index)
      .eq('submodule_id', subRun.submodule_id)
      .maybeSingle();

    const dataOperation = savedConfig?.data_operation || manifest?.data_operation_default || 'add';

    // 4. Filter output_data to approved items only
    const outputResults = subRun.output_data?.results || [];
    const approvedKeySet = new Set(approved_item_keys.map(String));
    const approvedItems = [];

    for (const entityResult of outputResults) {
      const items = entityResult.items || [];
      const approved = items.filter((item) => {
        const keyVal = String(item[itemKey] ?? '');
        return approvedKeySet.has(keyVal);
      });
      if (approved.length > 0) {
        approvedItems.push(...approved.map((item) => ({
          ...item,
          entity_name: entityResult.entity_name,
        })));
      }
    }

    // 5. Update working pool (with row-level lock via RPC or sequential update)
    //    Load current pool → apply operation → write back
    const { data: stageRow, error: stageErr } = await db
      .from('pipeline_stages')
      .select('id, working_pool')
      .eq('id', subRun.stage_id)
      .single();

    if (stageErr) throw stageErr;

    let currentPool = stageRow.working_pool || [];

    if (dataOperation === 'add') {
      // Merge approved items into pool, deduplicate by item_key (later wins)
      const poolMap = new Map();
      for (const item of currentPool) {
        poolMap.set(item[itemKey], item);
      }
      for (const item of approvedItems) {
        poolMap.set(item[itemKey], item);
      }
      currentPool = Array.from(poolMap.values());
    } else if (dataOperation === 'remove') {
      // Replace pool with approved items only (filter operation)
      currentPool = approvedItems;
    } else if (dataOperation === 'transform') {
      // Replace pool with approved items (same items, different shape)
      currentPool = approvedItems;
    }

    // 6. Write updated pool back
    await db
      .from('pipeline_stages')
      .update({ working_pool: currentPool })
      .eq('id', subRun.stage_id);

    // 7. Update submodule_runs
    await db
      .from('submodule_runs')
      .update({
        status: 'approved',
        approved_items: approved_item_keys,
      })
      .eq('id', req.params.id);

    // 8. Log decision
    await db
      .from('decision_log')
      .insert({
        run_id: subRun.run_id,
        step_index: subRun.input_data?.step_index ?? 0,
        submodule_id: subRun.submodule_id,
        decision: 'approved',
        context: {
          submodule_run_id: subRun.id,
          approved_count: approved_item_keys.length,
          total_count: outputResults.reduce((sum, r) => sum + (r.items?.length || 0), 0),
          data_operation: dataOperation,
          pool_count: currentPool.length,
        },
      });

    res.json({
      status: 'approved',
      pool_count: currentPool.length,
      approved_count: approved_item_keys.length,
    });
  } catch (err) {
    console.error('[submodule-runs] approve error:', err);
    res.status(500).json({ error: err.message });
  }
});


// --- Latest runs router (mounted at /api/runs/:runId/steps/:stepIndex/submodule-runs) ---
export const latestRunsRouter = Router({ mergeParams: true });

/**
 * GET /api/runs/:runId/steps/:stepIndex/submodule-runs/latest
 * Returns the latest submodule_run per submodule for this step.
 * Used by CategoryCardGrid to show status per submodule row.
 */
latestRunsRouter.get('/latest', async (req, res) => {
  try {
    const { runId, stepIndex } = req.params;
    const stepIdx = parseInt(stepIndex, 10);

    // Get stage_id for this run+step
    const { data: stage } = await db
      .from('pipeline_stages')
      .select('id')
      .eq('run_id', runId)
      .eq('step_index', stepIdx)
      .maybeSingle();

    if (!stage) {
      return res.json({});
    }

    // Get all submodule runs for this stage, ordered by creation (latest first)
    const { data: runs, error } = await db
      .from('submodule_runs')
      .select('id, submodule_id, status, progress, approved_items, output_data, completed_at')
      .eq('stage_id', stage.id)
      .order('completed_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    // Group by submodule_id, take the latest (first in desc order)
    const latest = {};
    for (const run of runs || []) {
      if (!latest[run.submodule_id]) {
        // Count results
        const outputResults = run.output_data?.results || [];
        const resultCount = outputResults.reduce((sum, r) => sum + (r.items?.length || 0), 0);
        const approvedCount = run.approved_items?.length || 0;
        const outputSummary = run.output_data?.summary || {};

        latest[run.submodule_id] = {
          id: run.id,
          status: run.status,
          progress: run.progress,
          result_count: resultCount,
          approved_count: approvedCount,
          description: outputSummary.description || null,
        };
      }
    }

    res.json(latest);
  } catch (err) {
    console.error('[latest-runs] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

```

---
## FILE: server/routes/submodules.js
```javascript
import { Router } from 'express';
import { getSubmodulesGroupedByCategory, getSubmodules } from '../services/moduleLoader.js';

const router = Router();

/**
 * GET /api/submodules
 * GET /api/submodules?step=1
 *
 * Returns submodules from the module registry.
 * If ?step is provided, returns only submodules for that step grouped by category.
 * Without ?step, returns all submodules as a flat array.
 */
router.get('/', (req, res) => {
  const stepParam = req.query.step;

  if (stepParam !== undefined) {
    const stepIndex = parseInt(stepParam, 10);
    if (isNaN(stepIndex) || stepIndex < 0 || stepIndex > 10) {
      return res.status(400).json({ error: 'step must be 0-10' });
    }

    const grouped = getSubmodulesGroupedByCategory(stepIndex);
    return res.json(grouped);
  }

  // No step filter — return flat list
  const all = getSubmodules();
  const flat = all.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    step: m.step,
    category: m.category,
    cost: m.cost,
    data_operation_default: m.data_operation_default,
  }));

  res.json(flat);
});

export default router;

```

---
## FILE: server/server.js
```javascript
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import projectsRouter from './routes/projects.js';
import runsRouter from './routes/runs.js';
import submodulesRouter from './routes/submodules.js';
import submoduleConfigRouter from './routes/submoduleConfig.js';
import stepContextRouter from './routes/stepContext.js';
import { executeRouter, submoduleRunRouter, latestRunsRouter } from './routes/submoduleRuns.js';
import { loadModules } from './services/moduleLoader.js';

// Import worker — starts BullMQ worker in the same process
import './workers/stageWorker.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static files — serve React build in production
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// Routes
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/projects', projectsRouter);
app.use('/api/runs', runsRouter);
app.use('/api/submodules', submodulesRouter);
app.use('/api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/config', submoduleConfigRouter);
app.use('/api/runs/:runId/steps/:stepIndex/submodules/:submoduleId', executeRouter);
app.use('/api/runs/:runId/steps/:stepIndex/context', stepContextRouter);
app.use('/api/runs/:runId/steps/:stepIndex/submodule-runs', latestRunsRouter);
app.use('/api/submodule-runs', submoduleRunRouter);

// Load submodule manifests from MODULES_PATH
loadModules();

// SPA fallback — serve React app for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack || err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));

```

---
## FILE: server/services/db.js
```javascript
import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default supabase;

```

---
## FILE: server/services/moduleLoader.js
```javascript
import fs from 'fs';
import path from 'path';

const REQUIRED_FIELDS = ['id', 'name', 'description', 'version', 'step', 'category', 'cost', 'data_operation_default', 'requires_columns', 'item_key', 'output_schema'];
const VALID_STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const VALID_COSTS = ['cheap', 'medium', 'expensive'];
const VALID_OPERATIONS = ['add', 'remove', 'transform'];

// In-memory registry: Map<submoduleId, manifest>
const registry = new Map();

/**
 * Validate a manifest has all required fields and valid values.
 * Returns null if valid, or an error message string if invalid.
 */
function validateManifest(manifest, filePath) {
  const missing = REQUIRED_FIELDS.filter(f => manifest[f] === undefined);
  if (missing.length > 0) {
    return `missing fields: ${missing.join(', ')}`;
  }

  if (!VALID_STEPS.includes(manifest.step)) {
    return `invalid step: ${manifest.step}`;
  }

  if (!VALID_COSTS.includes(manifest.cost)) {
    return `invalid cost: ${manifest.cost}`;
  }

  if (!VALID_OPERATIONS.includes(manifest.data_operation_default)) {
    return `invalid data_operation_default: ${manifest.data_operation_default}`;
  }

  if (!Array.isArray(manifest.requires_columns)) {
    return 'requires_columns must be an array';
  }

  if (typeof manifest.output_schema !== 'object' || manifest.output_schema === null) {
    return 'output_schema must be an object';
  }

  if (registry.has(manifest.id)) {
    return `duplicate id "${manifest.id}" (already registered)`;
  }

  return null;
}

/**
 * Scan MODULES_PATH for manifest.json files and populate the registry.
 * Directory structure: step-{N}-{name}/{submodule-name}/manifest.json
 */
export function loadModules() {
  const modulesPath = process.env.MODULES_PATH;
  if (!modulesPath) {
    console.warn('[moduleLoader] MODULES_PATH not set — no submodules loaded');
    return;
  }

  const modulesDir = path.resolve(modulesPath, 'modules');
  if (!fs.existsSync(modulesDir)) {
    console.warn(`[moduleLoader] modules directory not found: ${modulesDir}`);
    return;
  }

  registry.clear();

  const stepDirs = fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^step-\d+-/.test(d.name));

  for (const stepDir of stepDirs) {
    const stepPath = path.join(modulesDir, stepDir.name);
    const submoduleDirs = fs.readdirSync(stepPath, { withFileTypes: true })
      .filter(d => d.isDirectory());

    for (const subDir of submoduleDirs) {
      const manifestPath = path.join(stepPath, subDir.name, 'manifest.json');

      if (!fs.existsSync(manifestPath)) {
        console.warn(`[moduleLoader] No manifest.json in ${stepDir.name}/${subDir.name} — skipped`);
        continue;
      }

      try {
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        const manifest = JSON.parse(raw);

        const error = validateManifest(manifest, manifestPath);
        if (error) {
          console.warn(`[moduleLoader] Invalid manifest ${stepDir.name}/${subDir.name}: ${error} — skipped`);
          continue;
        }

        // Store manifest with its filesystem path for later execute.js loading
        manifest._path = path.join(stepPath, subDir.name);
        registry.set(manifest.id, manifest);
        console.log(`[moduleLoader] Registered: ${manifest.id} (step ${manifest.step}, ${manifest.category})`);
      } catch (err) {
        console.warn(`[moduleLoader] Failed to parse ${stepDir.name}/${subDir.name}/manifest.json: ${err.message} — skipped`);
      }
    }
  }

  console.log(`[moduleLoader] ${registry.size} submodule(s) loaded`);
}

/**
 * Get all registered submodules, optionally filtered by step.
 */
export function getSubmodules(stepIndex) {
  const all = Array.from(registry.values());
  if (stepIndex !== undefined) {
    return all.filter(m => m.step === stepIndex);
  }
  return all;
}

/**
 * Get a single submodule by ID.
 */
export function getSubmoduleById(id) {
  return registry.get(id) || null;
}

/**
 * Get submodules grouped by category for a specific step.
 * Returns array of { category, submodules: [...] }
 */
export function getSubmodulesGroupedByCategory(stepIndex) {
  const submodules = getSubmodules(stepIndex);
  const groups = {};

  for (const manifest of submodules) {
    const cat = manifest.category;
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push({
      id: manifest.id,
      name: manifest.name,
      description: manifest.description,
      category: manifest.category,
      cost: manifest.cost,
      data_operation_default: manifest.data_operation_default,
      requires_columns: manifest.requires_columns,
      item_key: manifest.item_key,
      options: manifest.options || [],
      options_defaults: manifest.options_defaults || {},
      output_schema: manifest.output_schema,
    });
  }

  return groups;
}

```

---
## FILE: server/services/queue.js
```javascript
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

// Shared Redis connection for queue operations
export const redis = new IORedis(redisConnection);

redis.on('error', (err) => {
  console.error('[queue] Redis connection error:', err.message);
});

// Single queue for all pipeline stage work
export const pipelineQueue = new Queue('pipeline-stages', { connection: redis });

// Cost-based job configuration (from spec Part 15)
const COST_CONFIG = {
  cheap:     { timeout: 5 * 60 * 1000,  attempts: 3, priority: 1  },
  medium:    { timeout: 15 * 60 * 1000, attempts: 2, priority: 5  },
  expensive: { timeout: 30 * 60 * 1000, attempts: 1, priority: 10 },
};

/**
 * Enqueue a submodule execution job.
 * @param {object} params
 * @param {string} params.submoduleRunId - UUID of the submodule_runs row
 * @param {string} params.submoduleId    - Manifest id (e.g. "sitemap-parser")
 * @param {number} params.stepIndex      - Step number (0-10)
 * @param {string} params.cost           - "cheap" | "medium" | "expensive"
 */
export async function enqueueSubmoduleJob({ submoduleRunId, submoduleId, stepIndex, cost }) {
  const config = COST_CONFIG[cost] || COST_CONFIG.medium;

  const job = await pipelineQueue.add(
    'execute-submodule',
    { submodule_run_id: submoduleRunId, submodule_id: submoduleId, step_index: stepIndex },
    {
      attempts: config.attempts,
      priority: config.priority,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  );

  console.log(`[queue] Enqueued job ${job.id} for ${submoduleId} (cost: ${cost}, timeout: ${config.timeout / 1000}s)`);
  return { jobId: job.id, timeout: config.timeout };
}

```

---
## FILE: server/workers/stageWorker.js
```javascript
/**
 * Pipeline Stage Worker — BullMQ worker that executes submodules.
 *
 * Job payload: { submodule_run_id, submodule_id, step_index }
 * The worker loads input_data and options from the submodule_runs row,
 * then loads execute.js from MODULES_PATH and calls it.
 */

import { Worker } from 'bullmq';
import path from 'path';
import { pathToFileURL } from 'url';
import db from '../services/db.js';
import { redis } from '../services/queue.js';
import { getSubmoduleById } from '../services/moduleLoader.js';

const COST_TIMEOUTS = {
  cheap: 5 * 60 * 1000,
  medium: 15 * 60 * 1000,
  expensive: 30 * 60 * 1000,
};

/**
 * Build the tools object that gets passed to execute().
 * See spec Part 12.
 */
function buildTools(submoduleRunId, submoduleId) {
  const logs = [];

  const logger = {
    info: (message) => {
      console.log(`[${submoduleId}] ${message}`);
      logs.push({ level: 'info', message, timestamp: new Date().toISOString() });
    },
    warn: (message) => {
      console.warn(`[${submoduleId}] ${message}`);
      logs.push({ level: 'warn', message, timestamp: new Date().toISOString() });
    },
    error: (message) => {
      console.error(`[${submoduleId}] ${message}`);
      logs.push({ level: 'error', message, timestamp: new Date().toISOString() });
    },
  };

  const http = {
    get: async (url, options = {}) => {
      const timeout = options.timeout || 30000;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: options.headers || {},
        });
        const body = await res.text();
        return { status: res.status, headers: Object.fromEntries(res.headers), body };
      } finally {
        clearTimeout(timer);
      }
    },
    post: async (url, body, options = {}) => {
      const timeout = options.timeout || 30000;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
          body: typeof body === 'string' ? body : JSON.stringify(body),
        });
        const responseBody = await res.text();
        return { status: res.status, headers: Object.fromEntries(res.headers), body: responseBody };
      } finally {
        clearTimeout(timer);
      }
    },
  };

  const progress = {
    update: (current, total, message) => {
      // Fire-and-forget — progress writes should never crash the execute function
      const progressData = { current, total, message };
      db.from('submodule_runs')
        .update({ progress: progressData })
        .eq('id', submoduleRunId)
        .then(({ error }) => {
          if (error) logger.warn(`Progress update failed: ${error.message}`);
        })
        .catch(() => { /* silent */ });
    },
  };

  return { logger, http, progress, _logs: logs };
}

/**
 * Load execute function from a submodule's directory.
 * Supports both ESM (export default) and CommonJS (module.exports).
 */
async function loadExecuteFunction(manifest) {
  const modulePath = manifest._path;
  const executePath = path.join(modulePath, 'execute.js');

  // Use dynamic import (works for both ESM and CJS with file:// URL)
  const moduleUrl = pathToFileURL(executePath).href;
  const mod = await import(moduleUrl);

  // Support both: export default function, module.exports = function
  const fn = mod.default || mod;
  if (typeof fn !== 'function') {
    throw new Error(`execute.js in ${manifest.id} does not export a function`);
  }
  return fn;
}

// Create the worker
const worker = new Worker(
  'pipeline-stages',
  async (job) => {
    const { submodule_run_id, submodule_id, step_index } = job.data;

    console.log(`[worker] Processing job ${job.id}: ${submodule_id} (step ${step_index})`);

    // 1. Load submodule_runs row
    const { data: run, error: runErr } = await db
      .from('submodule_runs')
      .select('*')
      .eq('id', submodule_run_id)
      .single();

    if (runErr || !run) {
      throw new Error(`submodule_runs row not found: ${submodule_run_id}`);
    }

    // 2. Look up manifest
    const manifest = getSubmoduleById(submodule_id);
    if (!manifest) {
      throw new Error(`Submodule not found in registry: ${submodule_id}`);
    }

    // 3. Mark as running
    await db
      .from('submodule_runs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', submodule_run_id);

    // 4. Load execute function
    const executeFn = await loadExecuteFunction(manifest);

    // 5. Build tools
    const tools = buildTools(submodule_run_id, submodule_id);

    // 6. Set up timeout (with cleanup to prevent leaked timers)
    const cost = manifest.cost || 'medium';
    const timeout = COST_TIMEOUTS[cost] || COST_TIMEOUTS.medium;
    let timeoutTimer;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutTimer = setTimeout(() => reject(new Error(`Execution timed out after ${timeout / 1000}s`)), timeout);
    });

    // 7. Execute with timeout
    const input = run.input_data;
    const options = run.options || manifest.options_defaults || {};

    let result;
    try {
      result = await Promise.race([executeFn(input, options, tools), timeoutPromise]);
    } catch (err) {
      // Write failure
      await db
        .from('submodule_runs')
        .update({
          status: 'failed',
          error: err.message,
          logs: tools._logs,
          completed_at: new Date().toISOString(),
        })
        .eq('id', submodule_run_id);
      throw err;
    } finally {
      clearTimeout(timeoutTimer);
    }

    // 8. Write success
    await db
      .from('submodule_runs')
      .update({
        status: 'completed',
        output_data: result,
        output_render_schema: manifest.output_schema || null,
        logs: tools._logs,
        progress: { current: 1, total: 1, message: 'Done' },
        completed_at: new Date().toISOString(),
      })
      .eq('id', submodule_run_id);

    console.log(`[worker] Completed: ${submodule_id} (run ${submodule_run_id})`);
    return result;
  },
  {
    connection: redis,
    concurrency: 2,
    stalledInterval: 60000,
  }
);

worker.on('failed', (job, err) => {
  console.error(`[worker] Job ${job?.id} failed: ${err.message}`);
});

worker.on('ready', () => {
  console.log('[worker] Pipeline stage worker ready');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});

export default worker;

```

---
## FILE: shared/stepConfig.js
```javascript
export const STEP_CONFIG = [
  { index: 0, name: "Project Start", description: "Define project scope and metadata" },
  { index: 1, name: "Discovery", description: "Find candidate sources and seed data" },
  { index: 2, name: "Validation", description: "Filter before committing to expensive operations" },
  { index: 3, name: "Scraping", description: "Fetch actual content from validated sources" },
  { index: 4, name: "Filtering & Assembly", description: "Clean and organize into source packages" },
  { index: 5, name: "Analysis & Generation", description: "Produce output content from sources" },
  { index: 6, name: "Quality Assurance", description: "Verify output meets standards" },
  { index: 7, name: "Routing", description: "Decide what happens to items that fail QA" },
  { index: 8, name: "Bundling", description: "Package into delivery formats" },
  { index: 9, name: "Distribution", description: "Push to external systems" },
  { index: 10, name: "Review", description: "Final human gate before publication" },
];

```

---
## FILE: sql/schema.sql
```sql
-- Content Pipeline v2 — Database Schema
-- Phase 2: Core pipeline tables

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  timing TEXT,
  template_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pipeline Runs — one execution of a project through the 11-step sequence
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  status TEXT NOT NULL DEFAULT 'running',
  current_step INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Pipeline Stages — one step's data within a run
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id),
  step_index INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  input_data JSONB,
  input_render_schema JSONB,
  output_data JSONB,
  output_render_schema JSONB,
  working_pool JSONB,
  working_pool_render_schema JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_run_id ON pipeline_stages(run_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_project_id ON pipeline_runs(project_id);

-- Phase 5: Submodule configuration per run/step/submodule
CREATE TABLE IF NOT EXISTS run_submodule_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id),
  step_index INTEGER NOT NULL,
  submodule_id TEXT NOT NULL,
  input_config JSONB,
  options JSONB,
  data_operation TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_id, step_index, submodule_id)
);

-- Phase 6: Shared step context (CSV upload storage)
CREATE TABLE IF NOT EXISTS step_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id),
  step_index INTEGER NOT NULL,
  entities JSONB NOT NULL,
  filename TEXT,
  source_submodule TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_id, step_index)
);

-- Phase 7: Submodule runs — one execution of one submodule within a step
CREATE TABLE IF NOT EXISTS submodule_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES pipeline_stages(id),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id),
  submodule_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  options JSONB,
  input_data JSONB,
  output_data JSONB,
  output_render_schema JSONB,
  approved_items JSONB,
  progress JSONB,
  error TEXT,
  logs JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_submodule_runs_run_id ON submodule_runs(run_id);
CREATE INDEX IF NOT EXISTS idx_submodule_runs_stage_id ON submodule_runs(stage_id);
CREATE INDEX IF NOT EXISTS idx_submodule_runs_stage_submodule ON submodule_runs(stage_id, submodule_id);

-- Prevent concurrent execution: only one pending/running run per submodule per pipeline run
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_run_per_submodule
  ON submodule_runs(run_id, submodule_id)
  WHERE status IN ('pending', 'running');

-- Phase 7: Decision log — every human judgment recorded
CREATE TABLE IF NOT EXISTS decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id),
  step_index INTEGER NOT NULL,
  submodule_id TEXT,
  entity_id TEXT,
  decision TEXT NOT NULL,
  reason TEXT,
  context JSONB,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decision_log_run_id ON decision_log(run_id);

```

---
## FILE: package.json
```
{
  "name": "content-pipeline-v2",
  "version": "1.0.0",
  "description": "Content Creation Tool — Skeleton",
  "type": "module",
  "scripts": {
    "dev:server": "node server/server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "bullmq": "^5.1.0",
    "cors": "^2.8.5",
    "csv-parse": "^6.1.0",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "ioredis": "^5.3.2",
    "multer": "^2.0.2"
  },
  "devDependencies": {
    "pg": "^8.18.0"
  }
}
```

---
## FILE: CLAUDE.md
```
# CLAUDE.md — Content Creation Tool v2 (Skeleton Repo)

## ⛔ STOP — READ THIS ENTIRE FILE BEFORE WRITING ANY CODE

You are building the skeleton infrastructure for an 11-step content creation wizard. This repo is the BUILDING — walls, wiring, plumbing, doors. Submodules (the furniture) live in a separate repo.

---

## 📂 File System — CRITICAL

### Active repos (ALL work happens here):
- **Skeleton:** `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline-v2/`
- **Modules:** `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline-modules-v2/`

### Archived (READ-ONLY, never write to):
- **v1 original:** `/Users/danieloskarsson/Library/CloudStorage/Dropbox/content-pipeline/`

### Specs (READ-ONLY reference — lives OUTSIDE this repo):
- `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/Content-Pipeline/specs/`

⛔ **Do NOT create a `specs/` folder inside this repo.** Specs live ONLY in the project folder above. Read them by path. Never copy, symlink, or duplicate them here. A previous copy caused spec divergence — the project folder fell behind while edits accumulated in the repo copy. Single source of truth = project folder.

**Phase 0 creates the v2 repos from scratch. The original repo stays at its current path as a READ-ONLY reference. V1 files are audited just-in-time in each phase — never bulk-copied. If you find yourself writing to `content-pipeline/` (without -v2), STOP — you are in the wrong directory.**

---

## 🧭 How You Work

### MANDATORY: Plan Before You Code

For EVERY phase:
1. **Read** the spec sections referenced in that phase
2. **Audit** any v1 files listed in the phase's "V1 Audit" section (open → compare against spec → decide REUSE/FIX/FRESH)
3. **Present a plan** listing: which files you'll create, which v1 files you'll reuse/fix, and what each change does
4. **Wait for approval** before writing any code
5. **Execute** the approved plan
6. **Verify** against the deliverables checklist

**NEVER skip the plan step.** If you start coding without presenting a plan first, you are doing it wrong.

### Phase Gating

You may ONLY work on the current phase. Check the `CURRENT PHASE` marker at the bottom of this file.

- Do NOT start the next phase until told to
- Do NOT "prepare" things for future phases
- Do NOT stub or scaffold future work
- If you discover the current phase needs something from a future phase, STOP and flag it

### When Existing Code Contradicts the Spec

The spec ALWAYS wins. Rewrite the code to match the spec. Do not adapt the spec to match existing code.

---

## 📚 Required Reading (in order)

| Document | Location | What it tells you |
|----------|----------|-------------------|
| SKELETON_SPEC_v2.md | Content-Pipeline/specs/ | Architecture, components, data flow, database schema — THE source of truth |
| BUILD_PLAN.md | Content-Pipeline/specs/ | Phased build sequence, what to copy vs build vs delete |
| UI_REFERENCE.md | Content-Pipeline/specs/ | Visual specs for every component, what changes vs stays, ownership model |
| STRATEGIC_ARCHITECTURE.md | Content-Pipeline/specs/ | Governing strategy (read once for context) |

**Before each phase:** Re-read the specific Parts of SKELETON_SPEC referenced in BUILD_PLAN for that phase.

---

## 🚫 Rules — Never Break These

### Architecture Rules
1. **No submodule-specific logic in this repo.** Ever. If you're writing code that only applies to one submodule, it belongs in the modules repo.
2. **No hardcoded step content.** Step names, descriptions, categories — all come from STEP_CONFIG or manifests. Never from component code.
3. **Universal step template for Steps 1–10.** One component renders all of them. There is no Step1Discovery.tsx, no Step2Validation.tsx.
4. **Skeleton renders slots. Modules fill them.** The only module-provided React component is the Options accordion slot. Everything else is skeleton-rendered using data/schema from modules.

### State Management Rules
5. **Zustand = UI state ONLY.** Which panel is open, which accordion is expanded, toast messages. NEVER domain data (projects, runs, entities).
6. **TanStack Query = ALL server data.** Projects, runs, steps, submodule results — all fetched and cached via TanStack Query.
7. **No fetch() in components.** All API calls go through hooks in `client/src/hooks/`. Components call hooks, never fetch directly.

### UI Rules (from UI_REFERENCE.md)
8. **Keep the existing visual design.** Colors, fonts, spacing, border styles, rounded corners — no changes unless UI_REFERENCE.md explicitly says to change it.
9. **SubmodulePanel: fixed 480px width.** Never resizes. `w-[480px] min-w-[480px] max-w-[480px]`.
10. **SubmodulePanel: one accordion open at a time.** Opening one closes the others.
11. **StepSummary: per-submodule rows, NOT an aggregate summary.** Each submodule provides its own summary content. Skeleton provides the container.
12. **Submodule rows show (left to right):** Data op toggle (➕➖＝) → checkbox → status dot → name + result count → description → arrow →.
13. **Results accordion action CTAs:** Change Input, Change Options, Download, Try again. These are at the bottom of the results list inside the accordion.
14. **CTA Footer (panel bottom):** RUN TASK, SEE RESULTS, APPROVE. Always visible, activation based on state.

### Code Quality Rules
15. **Each phase must compile and run.** No broken builds between phases. `npm run dev` must work after every phase.
16. **No TODO/FIXME stubs for future phases.** If it's not needed now, don't write it.
17. **No silent modifications to previous phases.** If Phase 5 needs a Phase 2 change, flag it and wait for approval.

---

## 🏗 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Server state:** TanStack Query
- **UI state:** Zustand
- **Tables:** TanStack Table (Phase 7+ for results)
- **Backend:** Express.js + Node.js 20 LTS
- **Database:** Supabase PostgreSQL
- **Job queue:** Redis + BullMQ (Phase 7+)

---

## 📁 File Structure

```
content-pipeline-v2/
├── client/
│   ├── src/
│   │   ├── components/    ← UI components (NO fetch, NO domain state)
│   │   │   ├── layout/    ← AppHeader, Toast
│   │   │   ├── shared/    ← CategoryCardGrid, SubmodulePanel,
│   │   │   │                 StepSummary, StepApprovalFooter
│   │   │   ├── steps/     ← StepContainer
│   │   │   ├── primitives/← CsvUploadInput, SubmoduleOptions, ResultsList,
│   │   │   │                 ContentRenderer, UrlTextarea
│   │   │   └── pages/     ← ProjectsList, NewProject, RunView, Templates
│   │   ├── stores/        ← Zustand (UI state ONLY)
│   │   ├── hooks/         ← TanStack Query (ALL data fetching)
│   │   ├── api/           ← API client wrapper
│   │   ├── types/         ← TypeScript types
│   │   └── config/        ← STEP_CONFIG and other constants
│   └── ...config files
├── server/
│   ├── server.js
│   ├── routes/
│   ├── services/
│   └── workers/
├── sql/
│   └── schema.sql
└── CLAUDE.md              ← This file (no specs/ folder — specs live in Content-Pipeline/specs/)
```

---

## ✅ Architecture Self-Check

Run these before committing. All should return nothing:

```bash
# Stores must NOT contain domain data
grep -rn "entities\|projects:\s*\[\|selectedProjectId\|submodules:\s*\[" client/src/stores/ || echo "PASS: No domain data in stores"

# Components must NOT fetch directly  
grep -rn "fetch(\|axios\|supabase\." client/src/components/ || echo "PASS: No direct fetching in components"

# No step-specific components (should all be deleted)
ls client/src/components/steps/Step[0-9]*.tsx 2>/dev/null && echo "FAIL: Step-specific components exist" || echo "PASS: No step-specific components"

# No step-specific stores
ls client/src/stores/*discovery*  client/src/stores/*validation* 2>/dev/null && echo "FAIL: Step-specific stores exist" || echo "PASS: No step-specific stores"
```

---

## 🔄 Ownership Model (what renders what)

| Component | Skeleton owns | Module provides |
|-----------|--------------|----------------|
| Step accordion expand/collapse | ✅ | — |
| Category card grid | ✅ | Categories from manifest |
| Submodule rows (checkbox, status, data op) | ✅ | Status from submodule_runs |
| StepSummary container | ✅ area + data flow | Summary text per submodule |
| Panel header, description, data op indicator | ✅ | manifest fields |
| Input accordion (upload, preview, auto-resolve) | ✅ | — |
| Options accordion container | ✅ | React component OR options[] from manifest |
| Results accordion (list, checkboxes, pagination, CTAs) | ✅ via ContentRenderer | Data + output_schema |
| CTA footer | ✅ | — |

---

## 📋 Phase Checklist Reference

Detailed phase steps and deliverables are in **BUILD_PLAN.md**. Read that document for each phase.

Summary:
- **Phase 0:** Create empty v2 repos, copy inert config (vite/tailwind/tsconfig), seed modules, minimal main.tsx + server.js, git init
- **Phase 1:** Header bar, routing (3 pages), placeholder content
- **Phase 2:** Step 0 form, Supabase tables (projects, pipeline_runs, pipeline_stages), projects list
- **Phase 3:** Run View, vertical step accordion, Step 0 approval, universal step template (empty)
- **Phase 4:** Module auto-discovery, manifest reading, real category cards
- **Phase 5:** SubmodulePanel shell (3 accordions placeholder, CTA footer, data op toggle)
- **Phase 6:** Input accordion internals, Options accordion internals, file upload, ContentRenderer
- **Phase 7:** BullMQ execution, Results accordion, approval flow, working pool
- **Phase 8:** Step-to-step data flow, step approval aggregation, skip step
- **Phase 9:** First real submodules (in modules repo)
- **Phase 10:** Polish, error states, edge cases

---

## ⚠️ Common Mistakes to Avoid

1. **Building the results table inside the skeleton as a fixed component.** The skeleton uses ContentRenderer which reads render_schema from the module's output_schema. Different modules produce different displays (url_list, table, content_cards, file_list).

2. **Putting the summary as one aggregate line.** StepSummary shows one row PER submodule, each with its own content from the module. Not "728 items total."

3. **Making the Options accordion a skeleton form.** Options is a SLOT. The module provides either a custom React component (options_component) or an options[] array that the skeleton auto-renders. If neither exists, show "No options."

4. **Hardcoding categories.** Categories come from the `category` field in submodule manifests. The skeleton groups by this field dynamically.

5. **Forgetting the action CTAs in Results.** Below the item list: Change Input, Change Options, Download, Try again. These are NOT in the footer — they're inside the Results accordion.

6. **Making the panel resizable or responsive.** Panel is exactly 480px. Always.

7. **Allowing multiple accordions open in the panel.** One at a time. Opening one closes the other.

8. **Working in the wrong directory.** The original `content-pipeline/` is a READ-ONLY reference. ALL work happens in `content-pipeline-v2/`. If your path doesn't end in `-v2/`, you're in the wrong place.

---

## 🏷 CURRENT PHASE: 0 — Repo Scaffold

**Read BUILD_PLAN.md Phase 0 for detailed steps and deliverables.**

When Phase 0 is complete and verified, this line will be updated to Phase 1.
```

---
## FILE: client/package.json
```json
{
  "name": "content-pipeline-v2-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc -b",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.90.20",
    "@tanstack/react-virtual": "^3.13.18",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.18",
    "@types/node": "^24.10.9",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.24",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "~5.9.3",
    "vite": "^7.2.4"
  }
}
```


# PART 3: MODULES REPO SOURCE CODE

---
## FILE: CLAUDE.md
```markdown
# CLAUDE.md — Content Creation Tool v2 (Modules Repo)

## ⛔ STOP — READ THIS ENTIRE FILE BEFORE WRITING ANY CODE

This repo contains pluggable submodules for the Content Creation Tool. Each submodule is self-contained: manifest + execute function + optional React component.

---

## 🧭 How You Work

1. Read SUBMODULE_DEVELOPMENT.md in the skeleton repo specs/ before writing any module
2. Every module needs a valid manifest.json before an execute.js
3. Test manifests load correctly via the skeleton's auto-discovery before writing execution logic
4. One module at a time. Verify it works end-to-end before starting the next.

---

## 🚫 Rules

1. **NEVER import skeleton code.** Modules are standalone. No imports from content-pipeline-v2.
2. **NEVER access the database directly.** Use the tools object provided to execute().
3. **NEVER use raw fetch/axios.** Use tools.http for all HTTP requests.
4. **Each module folder is completely self-contained.**
5. **manifest.json is required.** No manifest = module doesn't exist.

---

## 📁 Folder Pattern

```
modules/
├── step-1-discovery/
│   ├── sitemap-parser/
│   │   ├── manifest.json     (required)
│   │   ├── execute.js        (required)
│   │   └── OptionsPanel.jsx  (optional — custom options UI)
│   └── rss-feeds/
│       ├── manifest.json
│       └── execute.js
├── step-2-validation/
│   └── url-filter/
│       ├── manifest.json
│       └── execute.js
└── ...
```

---

## 📋 manifest.json Required Fields

```json
{
  "id": "example-submodule",
  "name": "Example Submodule",
  "description": "One-line explanation of what this submodule does",
  "version": "1.0.0",
  "step": 1,
  "category": "example-category",
  "cost": "cheap",
  "data_operation_default": "add",
  "requires_columns": ["website"],
  "item_key": "url",

  "options": [
    {
      "name": "max_results",
      "type": "number",
      "label": "Maximum Results",
      "default": 1000,
      "min": 1,
      "max": 50000
    }
  ],

  "options_defaults": {
    "max_results": 1000
  },

  "output_schema": {
    "display_type": "table",
    "url": "string (required)",
    "source": "string",
    "last_modified": "string (ISO date, if available)"
  }
}
```

**output_schema format:** Keys are field names, values are type strings. NOT a "fields" array. See SKELETON_SPEC_v2.md Part 11 for the full field reference.

---

## 🔄 execute.js Input Contract

```javascript
async function execute(input, options, tools) → results
```

**Step 1 modules** receive flat entities from user upload:
```javascript
input.entities = [
  { name: "Company A", website: "companya.com" },
  { name: "Company B", website: "companyb.com" }
]
```

**Step 2+ modules** receive entities enriched with `items` from the previous step's working pool:
```javascript
input.entities = [
  {
    name: "Company A",
    website: "companya.com",
    items: [
      { url: "https://companya.com/about", last_modified: "2024-01-01" },
      { url: "https://companya.com/products", last_modified: "2024-02-15" }
    ]
  }
]
```

Step 2+ modules process `entity.items`, NOT top-level entity fields. Always check for missing/empty `items` gracefully.

---

## CURRENT PHASE: Waiting for skeleton Phase 4 (auto-discovery) before building real modules.

```

---
## FILE: modules/step-1-discovery/rss-feeds/manifest.json
```json
{
  "id": "rss-feeds",
  "name": "RSS Feed Discovery",
  "description": "Find RSS/Atom feeds by probing common feed paths on company websites",
  "version": "1.0.0",
  "step": 1,
  "category": "news",
  "cost": "cheap",
  "data_operation_default": "add",

  "requires_columns": ["website"],

  "options": [
    {
      "name": "max_feeds",
      "type": "number",
      "label": "Maximum feeds per site",
      "description": "Limit how many feed URLs to return per website.",
      "default": 10,
      "min": 1,
      "max": 100
    },
    {
      "name": "check_common_paths",
      "type": "boolean",
      "label": "Check common feed paths",
      "description": "Try /feed, /rss, /atom.xml and other common feed locations.",
      "default": true
    }
  ],

  "options_defaults": {
    "max_feeds": 10,
    "check_common_paths": true
  },

  "item_key": "url",

  "output_schema": {
    "display_type": "table",
    "url": "string (required)",
    "feed_type": "string",
    "title": "string",
    "item_count": "number"
  }
}

```

---
## FILE: modules/step-1-discovery/sitemap-parser/execute.js
```javascript
/**
 * Sitemap Parser — Step 1 Discovery submodule
 * 
 * For each entity with a website field, fetches sitemap.xml,
 * parses it, and returns discovered URLs.
 */

async function execute(input, options, tools) {
  const { entities } = input;
  const { max_urls, include_nested_sitemaps, url_pattern } = options;
  const { logger, http, progress } = tools;

  let urlFilter = null;
  if (url_pattern) {
    try {
      urlFilter = new RegExp(url_pattern);
    } catch (e) {
      logger.error(`Invalid URL pattern regex: "${url_pattern}" — ${e.message}. Ignoring filter.`);
    }
  }
  const results = [];
  let totalItems = 0;
  const errors = [];

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    progress.update(i + 1, entities.length, `Processing ${entity.name || "entity"}`);

    if (!entity.website) {
      logger.warn(`Skipping ${entity.name}: no website field`);
      results.push({
        entity_name: entity.name,
        items: [],
        error: "No website field",
        meta: { total_found: 0, errors: 1 }
      });
      errors.push(`${entity.name}: No website field`);
      continue;
    }

    try {
      const baseUrl = entity.website.startsWith("http")
        ? entity.website
        : `https://${entity.website}`;

      logger.info(`Fetching sitemap for ${entity.name}: ${baseUrl}`);
      const urls = await fetchSitemap(
        `${baseUrl.replace(/\/$/, "")}/sitemap.xml`,
        { max_urls, include_nested_sitemaps, http, logger }
      );

      // Apply URL filter if set
      const filtered = urlFilter
        ? urls.filter((u) => urlFilter.test(u.url))
        : urls;

      const limited = filtered.slice(0, max_urls);

      results.push({
        entity_name: entity.name,
        items: limited,
        meta: {
          total_found: urls.length,
          filtered: urls.length - filtered.length,
          limited: filtered.length - limited.length,
          returned: limited.length,
          errors: 0
        }
      });

      totalItems += limited.length;
      logger.info(`${entity.name}: found ${urls.length} URLs, returning ${limited.length}`);

    } catch (err) {
      logger.error(`${entity.name}: ${err.message}`);
      results.push({
        entity_name: entity.name,
        items: [],
        error: err.message,
        meta: { total_found: 0, errors: 1 }
      });
      errors.push(`${entity.name}: ${err.message}`);
    }
  }

  const successCount = entities.length - errors.length;
  const description = errors.length > 0
    ? `${totalItems} URLs found across ${successCount} of ${entities.length} entities (${errors.length} failed)`
    : `${totalItems} URLs found across ${entities.length} entities`;

  return {
    results,
    summary: {
      total_entities: entities.length,
      total_items: totalItems,
      description,
      errors
    }
  };
}

/**
 * Fetch and parse a sitemap URL. Handles sitemap index files.
 */
async function fetchSitemap(url, { max_urls, include_nested_sitemaps, http, logger }) {
  const response = await http.get(url, { timeout: 15000 });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }

  const xml = typeof response.body === "string" ? response.body : String(response.body);
  const urls = [];

  // Check if this is a sitemap index (contains <sitemapindex>)
  if (xml.includes("<sitemapindex")) {
    if (!include_nested_sitemaps) {
      logger.info("Sitemap index found but nested sitemaps disabled");
      return urls;
    }

    // Extract child sitemap URLs
    const sitemapUrls = extractTags(xml, "loc");
    logger.info(`Sitemap index: ${sitemapUrls.length} child sitemaps`);

    for (const childUrl of sitemapUrls) {
      if (urls.length >= max_urls) break;
      try {
        const childUrls = await fetchSitemap(childUrl, {
          max_urls: max_urls - urls.length,
          include_nested_sitemaps: false, // Don't recurse deeper
          http,
          logger
        });
        urls.push(...childUrls);
      } catch (err) {
        logger.warn(`Child sitemap failed: ${childUrl} — ${err.message}`);
      }
    }
  } else {
    // Regular sitemap — extract <url> entries
    const entries = extractUrlEntries(xml);
    urls.push(...entries.slice(0, max_urls));
  }

  return urls;
}

/**
 * Extract all <loc> tag contents from XML string
 */
function extractTags(xml, tagName) {
  const regex = new RegExp(`<${tagName}>\\s*([^<]+)\\s*</${tagName}>`, "gi");
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

/**
 * Extract URL entries from a standard sitemap XML
 * Returns objects matching output_schema: { url, last_modified, change_frequency, priority }
 */
function extractUrlEntries(xml) {
  const entries = [];

  // Split by <url> blocks
  const urlBlocks = xml.split("<url>").slice(1);

  for (const block of urlBlocks) {
    const loc = extractFirstTag(block, "loc");
    if (!loc) continue;

    entries.push({
      url: loc,
      last_modified: extractFirstTag(block, "lastmod") || null,
      change_frequency: extractFirstTag(block, "changefreq") || null,
      priority: parseFloat(extractFirstTag(block, "priority")) || null
    });
  }

  return entries;
}

/**
 * Extract first occurrence of a tag's content
 */
function extractFirstTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}>\\s*([^<]+)\\s*</${tagName}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

module.exports = execute;

```

---
## FILE: modules/step-1-discovery/sitemap-parser/manifest.json
```json
{
  "id": "sitemap-parser",
  "name": "Sitemap Parser",
  "description": "Discover URLs from XML sitemaps for each company website",
  "version": "1.0.0",
  "step": 1,
  "category": "crawling",
  "cost": "cheap",
  "data_operation_default": "add",

  "requires_columns": ["website"],

  "options": [
    {
      "name": "max_urls",
      "type": "number",
      "label": "Maximum URLs per site",
      "description": "Limit how many URLs to extract per sitemap.",
      "default": 10000,
      "min": 1,
      "max": 50000
    },
    {
      "name": "include_nested_sitemaps",
      "type": "boolean",
      "label": "Follow nested sitemaps",
      "description": "If sitemap index found, follow child sitemaps.",
      "default": true
    },
    {
      "name": "url_pattern",
      "type": "text",
      "label": "URL filter pattern",
      "description": "Only include URLs matching this pattern (regex). Leave empty for all.",
      "default": ""
    }
  ],

  "options_defaults": {
    "max_urls": 10000,
    "include_nested_sitemaps": true,
    "url_pattern": ""
  },

  "item_key": "url",

  "output_schema": {
    "display_type": "table",
    "url": "string (required)",
    "last_modified": "string (ISO date, if available)",
    "change_frequency": "string",
    "priority": "number"
  }
}

```

---
## FILE: modules/step-1-discovery/test-dummy/execute.js
```javascript
/**
 * Test Dummy — Step 1 Discovery submodule
 *
 * Returns fake data after a configurable delay per entity.
 * Useful for testing the full BullMQ execution pipeline
 * without requiring external HTTP calls or API keys.
 */

async function execute(input, options, tools) {
  const { entities } = input;
  const { delay_ms = 1000, items_per_entity = 3, fail_entity = '' } = options;
  const { logger, progress } = tools;

  const results = [];
  let totalItems = 0;
  const errors = [];

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const name = entity.name || `Entity ${i + 1}`;
    progress.update(i + 1, entities.length, `Processing ${name}`);

    // Simulate work
    logger.info(`[test-dummy] Processing ${name} (delay: ${delay_ms}ms)`);
    await sleep(delay_ms);

    // Optional: simulate failure for a specific entity
    if (fail_entity && name.toLowerCase().includes(fail_entity.toLowerCase())) {
      const msg = `Simulated failure for ${name}`;
      logger.error(msg);
      results.push({
        entity_name: name,
        items: [],
        error: msg,
        meta: { simulated: true },
      });
      errors.push(msg);
      continue;
    }

    // Generate fake items
    const items = [];
    for (let j = 0; j < items_per_entity; j++) {
      items.push({
        url: `https://${name.toLowerCase().replace(/\s+/g, '-')}.example.com/page-${j + 1}`,
        title: `${name} — Page ${j + 1}`,
        score: Math.round(Math.random() * 100),
      });
    }

    results.push({
      entity_name: name,
      items,
      meta: { simulated: true, delay_ms },
    });

    totalItems += items.length;
    logger.info(`[test-dummy] ${name}: generated ${items.length} fake items`);
  }

  return {
    results,
    summary: {
      total_entities: entities.length,
      total_items: totalItems,
      errors,
    },
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = execute;

```

---
## FILE: modules/step-1-discovery/test-dummy/manifest.json
```json
{
  "id": "test-dummy",
  "name": "Test Dummy",
  "description": "Returns fake data after a short delay — for testing the execution pipeline",
  "version": "1.0.0",
  "step": 1,
  "category": "testing",
  "cost": "cheap",
  "data_operation_default": "add",

  "requires_columns": [],

  "options": [
    {
      "name": "delay_ms",
      "type": "number",
      "label": "Delay per entity (ms)",
      "description": "How long to wait per entity to simulate work.",
      "default": 1000,
      "min": 100,
      "max": 30000
    },
    {
      "name": "items_per_entity",
      "type": "number",
      "label": "Items per entity",
      "description": "How many fake items to generate per entity.",
      "default": 3,
      "min": 1,
      "max": 50
    },
    {
      "name": "fail_entity",
      "type": "text",
      "label": "Fail on entity name",
      "description": "If an entity name matches this string, simulate a failure. Leave empty to succeed all.",
      "default": ""
    }
  ],

  "options_defaults": {
    "delay_ms": 1000,
    "items_per_entity": 3,
    "fail_entity": ""
  },

  "item_key": "url",

  "output_schema": {
    "display_type": "table",
    "url": "string (required)",
    "title": "string",
    "score": "number"
  }
}

```

---
## FILE: modules/step-2-validation/url-dedup/execute.js
```javascript
/**
 * URL Deduplicator — Step 2 Validation submodule
 * 
 * Takes URLs from Step 1 working pool (attached as entity.items),
 * normalizes them, removes duplicates across all entities, and
 * returns the deduplicated set.
 * 
 * Data operation: REMOVE (➖) — items marked "duplicate" are removed
 * from the working pool; "unique" items remain.
 */

async function execute(input, options, tools) {
  const { entities } = input;
  const { logger } = tools;
  const {
    normalize_www,
    normalize_trailing_slash,
    strip_query_params,
    strip_fragments,
    case_insensitive
  } = options;

  // Flatten all items across entities, keeping entity association.
  // Supports two input formats:
  //   1. Grouped: [{ name, items: [{ url, ... }] }]  — from previous step re-grouping
  //   2. Flat:    [{ url, ... }]                       — from CSV upload or direct input
  const allItems = [];
  const byEntity = new Map();

  for (const entity of entities) {
    if (entity.items && entity.items.length > 0) {
      // Grouped format: entity has name + items array
      for (const item of entity.items) {
        if (!item.url) {
          logger.warn(`Skipping item in ${entity.name}: no url field`);
          continue;
        }
        allItems.push({
          ...item,
          entity_name: entity.name || item.entity_name || 'unknown'
        });
      }
    } else if (entity.url) {
      // Flat format: entity IS the item (from CSV upload or flat pool)
      allItems.push({
        ...entity,
        entity_name: entity.entity_name || entity.name || 'unknown'
      });
    } else {
      logger.warn(`Skipping entity: no items array and no url field. Keys: ${Object.keys(entity).join(', ')}`);
    }
  }

  logger.info(`Processing ${allItems.length} URLs for deduplication`);

  // Normalize and deduplicate
  const seen = new Map(); // normalized → index into allItems of first occurrence
  const results = [];
  let duplicateCount = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const normalized = normalizeUrl(item.url, {
      normalize_www,
      normalize_trailing_slash,
      strip_query_params,
      strip_fragments,
      case_insensitive
    });

    if (seen.has(normalized)) {
      // This is a duplicate — reference the first occurrence
      const firstItem = allItems[seen.get(normalized)];
      results.push({
        url: item.url,
        original_url: item.url,
        duplicate_of: firstItem.url,
        status: "duplicate",
        entity_name: item.entity_name
      });
      duplicateCount++;
    } else {
      // First occurrence — unique
      seen.set(normalized, i);
      results.push({
        url: item.url,
        original_url: item.url,
        duplicate_of: null,
        status: "unique",
        entity_name: item.entity_name
      });
    }
  }

  const uniqueCount = allItems.length - duplicateCount;
  logger.info(`Dedup complete: ${uniqueCount} unique, ${duplicateCount} duplicates`);

  // Sort results: duplicates first, then unique — so they're immediately visible
  results.sort((a, b) => {
    if (a.status === "duplicate" && b.status !== "duplicate") return -1;
    if (a.status !== "duplicate" && b.status === "duplicate") return 1;
    return 0;
  });

  // Group results by entity for the expected output format
  for (const result of results) {
    if (!byEntity.has(result.entity_name)) {
      byEntity.set(result.entity_name, []);
    }
    byEntity.get(result.entity_name).push(result);
  }

  const entityResults = [];
  for (const [entityName, items] of byEntity) {
    const dupes = items.filter((i) => i.status === "duplicate").length;
    entityResults.push({
      entity_name: entityName,
      items,
      meta: {
        total_found: items.length,
        duplicates: dupes,
        unique: items.length - dupes,
        errors: 0
      }
    });
  }

  const description = duplicateCount > 0
    ? `Found ${duplicateCount} duplicates. ${uniqueCount} unique of ${allItems.length} total`
    : `${allItems.length} URLs — no duplicates found`;

  return {
    results: entityResults,
    summary: {
      total_entities: entities.length,
      total_items: allItems.length,
      unique: uniqueCount,
      duplicates: duplicateCount,
      description,
      errors: []
    }
  };
}

/**
 * Normalize a URL for comparison based on options
 */
function normalizeUrl(url, opts) {
  try {
    let parsed = new URL(url.startsWith("http") ? url : `https://${url}`);

    // Strip fragments
    if (opts.strip_fragments) {
      parsed.hash = "";
    }

    // Strip query params
    if (opts.strip_query_params) {
      parsed.search = "";
    }

    let result = parsed.toString();

    // Normalize www
    if (opts.normalize_www) {
      result = result.replace("://www.", "://");
    }

    // Normalize trailing slash
    if (opts.normalize_trailing_slash) {
      result = result.replace(/\/+$/, "");
    }

    // Case insensitive
    if (opts.case_insensitive) {
      result = result.toLowerCase();
    }

    return result;
  } catch {
    // If URL parsing fails, just do basic string normalization
    let result = url;
    if (opts.case_insensitive) result = result.toLowerCase();
    if (opts.normalize_trailing_slash) result = result.replace(/\/+$/, "");
    return result;
  }
}

module.exports = execute;

```

---
## FILE: modules/step-2-validation/url-dedup/manifest.json
```json
{
  "id": "url-dedup",
  "name": "URL Deduplicator",
  "description": "Remove duplicate URLs across entities, normalize formats, strip tracking parameters",
  "version": "1.0.0",
  "step": 2,
  "category": "filtering",
  "cost": "cheap",
  "data_operation_default": "remove",

  "requires_columns": ["url"],

  "options": [
    {
      "name": "normalize_www",
      "type": "boolean",
      "label": "Treat www and non-www as same",
      "description": "Consider www.example.com and example.com as duplicates.",
      "default": true
    },
    {
      "name": "normalize_trailing_slash",
      "type": "boolean",
      "label": "Ignore trailing slashes",
      "description": "Consider /page and /page/ as the same URL.",
      "default": true
    },
    {
      "name": "strip_query_params",
      "type": "boolean",
      "label": "Strip query parameters",
      "description": "Remove ?utm_source, ?ref, etc. before comparing.",
      "default": true
    },
    {
      "name": "strip_fragments",
      "type": "boolean",
      "label": "Strip URL fragments",
      "description": "Remove #section anchors before comparing.",
      "default": true
    },
    {
      "name": "case_insensitive",
      "type": "boolean",
      "label": "Case-insensitive comparison",
      "description": "Treat URL paths as case-insensitive.",
      "default": true
    }
  ],

  "options_defaults": {
    "normalize_www": true,
    "normalize_trailing_slash": true,
    "strip_query_params": true,
    "strip_fragments": true,
    "case_insensitive": true
  },

  "item_key": "url",

  "output_schema": {
    "display_type": "table",
    "selectable": true,
    "url": "string (required)",
    "original_url": "string",
    "duplicate_of": "string",
    "status": "string",
    "entity_name": "string"
  }
}

```

---
## FILE: modules/step-2-validation/url-filter/manifest.json
```json
{
  "id": "url-filter",
  "name": "URL Pattern Filter",
  "description": "Filter URLs by pattern matching and HTTP status code validation",
  "version": "1.0.0",
  "step": 2,
  "category": "filtering",
  "cost": "cheap",
  "data_operation_default": "remove",

  "requires_columns": ["url"],

  "options": [
    {
      "name": "exclude_patterns",
      "type": "textarea",
      "label": "Exclude URL patterns",
      "description": "One regex pattern per line. URLs matching any pattern will be removed.",
      "default": ""
    },
    {
      "name": "include_patterns",
      "type": "textarea",
      "label": "Include URL patterns",
      "description": "One regex pattern per line. If set, only matching URLs are kept.",
      "default": ""
    },
    {
      "name": "check_status_codes",
      "type": "boolean",
      "label": "Check HTTP status codes",
      "description": "Send HEAD requests to verify URLs return 200.",
      "default": false
    }
  ],

  "options_defaults": {
    "exclude_patterns": "",
    "include_patterns": "",
    "check_status_codes": false
  },

  "item_key": "url",

  "output_schema": {
    "display_type": "table",
    "selectable": true,
    "url": "string (required)",
    "status": "string",
    "matched_pattern": "string",
    "entity_name": "string"
  }
}

```

--- END OF REVIEW BUNDLE ---
