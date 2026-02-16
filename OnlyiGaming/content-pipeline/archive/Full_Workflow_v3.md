# Universal Content Pipeline — Master Workflow Document (Steps 0–10)

**Version**: 3.2 (Updated 2026-01-29)
**Previous**: v3.0 had 12 steps. v3.1 combined Input + Discovery. v3.2 corrects all step descriptions.
**Architecture**: Database-mediated pipeline with submodule-based execution and shared step context.

---

## Purpose & Fit

This workflow defines the **generic 11-step pipeline (Steps 0–10)** for the Universal Content Intelligence Platform. It is content-type-agnostic — the same steps apply to company profiles, news articles, podcast pages, competitor analyses, and any future content type.

> **2026-01-28 Update:** Old Step 1 (Input) and Step 2 (Discovery) are now combined into Step 1 (Discovery). Upload happens INSIDE each submodule. See `docs/ARCHITECTURE_DECISIONS.md` for details.

**Each content type** configures which operations run at each step via `pipeline_templates`. The steps themselves are universal.

The pipeline ensures:

- **Completeness**: no thin content, every item reaches QA
- **Content Reuse**: all scraped/generated content stored in the universal `content_items` table with tags
- **Traceability**: every decision logged in `pipeline_stages`
- **Evolution**: tags and content grow across projects, benefiting all future work

### Content Types (Configuration, Not Code)

Each content type is a `pipeline_template` that selects operations per step:

| Content Type | Template | Key Operations |
|---|---|---|
| Company Profile | `company_profile` | url-discovery, content-scrape, profile-generate |
| News Article | `news_article` | topic-discovery, source-validate, article-generate |
| Podcast Page | `podcast_page` | metadata-extract, transcript-generate, page-generate |
| Competitor Analysis | `competitor_analysis` | multi-entity-discover, compare-generate |

Adding a new content type = new template row + operation modules. No infrastructure changes.

---

## Workflow Philosophy

The design principle is **operations, not monoliths**.

- Every step runs an **operation module** (pluggable function with standard interface)
- Each operation reads from the **content library** (content_items + tags) and writes back
- Pipeline templates define the sequence — configuration, not code branches
- All content is tagged and reusable across projects

### Content Library Integration

Every operation interacts with the shared content library:

```
Operation reads → content_items (by tags) → processes → writes → content_items (with new tags)
```

This means:
- A company profile operation can reuse scraped pages from a previous news article project
- A news article operation can reference existing company profiles
- Nothing is scraped twice for the same URL (conflict resolution: latest wins)

### Loopbacks

- **Automated Router (Step 7)** handles failures, routing back to earlier steps
- **Manual Review (Step 10)** provides human oversight
- Nothing progresses without valid QA or explicit approval

---

## Architecture Overview

### Data Flow

```
Project Config → Pipeline Template → Operations (Steps 0-10) → content_items + tags
```

### Storage

All content writes to ONE table:

```sql
content_items (
  id, content_type, title, source_url, content JSONB,
  status, filter_reason, quality_score, version,
  tags via content_tags junction
)
```

### Orchestration

- **BullMQ**: Single `pipeline-stages` queue
- **Worker**: Dynamically loads operation per stage from template
- **Supabase**: Source of truth for all content and pipeline state

### Tools

- **BullMQ + Redis** — Job orchestration (replaces n8n from v2)
- **Supabase** — Content library, pipeline state, audit trail
- **LLMs (OpenAI, Claude)** — Analysis, generation, QA
- **Cheerio/Readability** — Default static parsers
- **Playwright** — JS-heavy fallback
- **Express.js** — API server
- **WebSocket** — Real-time updates

---

## Outputs & Canonicalization

Every approved content item is packaged into configurable output formats:

- **Markdown** — canonical text source
- **JSON** — structured fields
- **HTML** — schema.org ready
- **Meta** — title, description, keywords
- **Media refs** — logos, images, videos
- **Manifest** — artifact list + checksums

Output format is defined per content type in the pipeline_template.

---

## Validation Principles

- **Evidence-based**: every claim must cite a source
- **No hallucinations**: unsupported facts rejected in QA
- **Tag-based taxonomy**: content organized by 352+ tags across dimensions
- **Freshness flags, not gates**: old content flagged but never blocked
- **Loopbacks not failures**: weak content routed back for improvement
- **Human review is final**: Step 10 reviewer decides publish/reject

---

## The 11 Steps (Steps 0–10)

> **Note:** Step numbering changed on 2026-01-28. Old Steps 1+2 are now combined into new Step 1.

### Step 0 — Project Start

**Generic Purpose**: Create and configure the project before any pipeline work begins. Name the project, choose an existing project or create new, optionally select a template (saved config, no data), link to parent project.

**Operation**: Creates a `projects` record. Templates are saved configurations from previous runs — they do NOT contain input data.

#### Fields

| Field | Required | Description |
|-------|----------|-------------|
| Project Name | Yes | Human-readable identifier |
| Template | No | Saved config from previous pipeline (config only, no data) |
| Parent Project | No | Link to parent project if this is a sub-project |
| Intent | No | Freeform goal description |
| Timing | No | one-off, scheduled, continuous |

**Does NOT include**: Entity type selection, output format choices, data input (those happen in Step 1)

#### Behavior

- Creating a new project opens Step 0 as the first active step
- Project type determines which pipeline template is loaded
- Tags are stored in `content_tags` linked to the project for later filtering/discovery
- Once Step 0 is completed, Step 1 (Discovery) becomes active

---

### Step 1 — Discovery

**Generic Purpose**: Combine input AND source collection. User chooses what to discover, provides data within each submodule, collects URLs.

**Key change from v3.0**: Old Step 1 (Input) and Step 2 (Discovery) are now combined. Upload happens INSIDE each submodule, not as a separate step.

**Operations write discovered items to**: `content_items` (content_type: 'discovered_url', status: 'pending')

**Tags applied**: entity:{type}:{name}, source:{method}, relevant dimension tags

#### User Flow

1. User sees category cards (Website, News, LinkedIn, YouTube, etc.)
2. User clicks a submodule → overlay pane slides out from left
3. Pane shows choices/options + input fields (upload CSV, paste URLs)
4. [RUN] activates when input valid → user clicks to execute
5. After run completes → [SEE RESULTS] appears
6. User clicks [SEE RESULTS] → results shown in same pane
7. If satisfied → [APPROVE] appears → user clicks to approve submodule
8. Pane closes, card shows green/approved with count
9. Repeat for other submodules
10. Once all desired submodules approved → [APPROVE STEP] or [SKIP STEP]

#### Available Submodules (grouped by category)

| Category | Submodules |
|----------|------------|
| Website | Sitemap, Navigation, Seed Expansion |
| News | RSS Feeds, News Search |
| LinkedIn | Company Page, Posts |
| YouTube | Channel Videos, YouTube Search |
| Twitter/X | Profile |
| Search | Google Search |

**For MVP1b**: Only Website category with Sitemap, Navigation, Seed Expansion.

#### Shared Step Context

CSV uploaded in one submodule is available to other submodules within the same step:
- Upload CSV in Sitemap (name, website, linkedin, youtube)
- LinkedIn submodule auto-finds linkedin column
- YouTube submodule auto-finds youtube column

Priority: submodule-local upload > shared context > prompt user

**Writes to**: `discovered_urls` table, `step_context` table (for shared CSV data)

---

### Step 2 — Validation & Dedupe (FILTER STEP)

**Generic Purpose**: Clean and validate URLs before scraping. Remove duplicates.

**Filter behavior**: Items failing validation are marked `status = 'filtered_step2'` with `filter_reason`.

**Body purged after 7 days** (tiered retention). Metadata row persists forever.

#### Operations:
- **url-validation**: HTTP status check, content-type verification
- **domain-trust**: Domain authority scoring
- **deduplication**: Remove duplicate URLs across all sources
- **policy-check**: Blocked domains, robots.txt compliance

#### Filter Reasons:
- `duplicate` — URL already exists in project
- `untrusted_source` — domain not in whitelist / low authority
- `blocked` — HTTP error, robots.txt denied
- `non_content` — privacy page, login, terms, 404

**Can be skipped**: If user trusts their input sources, skip to Step 3.

---

### Step 3 — Scraping

**Generic Purpose**: Fetch content from validated URLs.

**Operations write to**: `content_items` (content_type: 'scraped_page', content: {html, text, structured})

**Tags applied**: Inherited from discovery + content-specific tags

#### Operations:
- **content-scrape-cheerio**: Static HTML parsing (default, cheapest)
- **content-scrape-playwright**: JS-heavy / consent-gated sites (fallback)
- **transcript-generate**: Whisper API for audio/video (podcasts)
- **structured-extract**: Directory listings, metadata tables

#### Content Library Integration:
- Check `content_items` by `source_url` before scraping
- If exists and fresh → skip (reuse existing)
- If exists but stale → re-scrape, version increments
- If not exists → scrape and insert with tags

**Writes to**: `scraped_pages` table (bulk content)

---

### Step 4 — Filtering (FILTER STEP)

**Generic Purpose**: Quality filtering, language detection, adaptive depth.

**Filter behavior**: Items failing are marked `status = 'filtered_step4'` with `filter_reason`.

**Body purged after 7 days**. Metadata persists.

#### Operations:
- **content-filter-junk**: Remove boilerplate, too-short content (<100 words)
- **content-filter-language**: Detect and filter wrong-language content
- **content-filter-relevance**: Does content relate to entity/topic?
- **content-filter-cap**: Adaptive page capping per entity (prevent over-representation)

#### Filter Reasons:
- `too_short` — body < 100 words
- `wrong_language` — not in target language
- `irrelevant` — doesn't relate to entity/topic
- `over_cap` — entity already has enough sources
- `boilerplate` — cookie banners, navigation-only content

#### Output:
- Clean, filtered set of content_items ready for generation
- Assembled as SOURCES array in stage output_data JSONB

---

### Step 5 — Analysis & Generation

**Generic Purpose**: Classification, SEO logic, and content generation via LLM.

**Operations write to**: `content_items` (content_type: 'generated_article' or 'generated_profile')

#### Company Profile Operations:
- **analysis-classify**: Map to MASTER_CATEGORIES + MASTER_TAGS, detect suggested categories/tags
- **seo-plan**: Target keywords, H2/H3 outline, meta title/description, FAQs
- **profile-generate**: Full draft (overview, category sections, tag sections, credentials, FAQs)

#### News Article Operations:
- **article-analyze**: Key facts, quotes, angles from sources
- **article-generate**: Full article draft with headline, body, summary

#### Podcast Operations:
- **summary-generate**: Episode summary, key takeaways, guest info
- **page-generate**: Landing page with episode list, summaries, links

**Tags applied**: content-type:profile / content-type:article / content-type:podcast-page + topic tags

---

### Step 6 — QA

**Generic Purpose**: Fact checks, hallucination detection, structural validation.

#### Operations:
- **qa-structural**: JSON schema validation, section presence, word counts
- **qa-factcheck**: Verify claims against source content_items
- **qa-seo**: Meta lengths, keyword coverage, heading hierarchy, tone
- **qa-consolidate**: Weighted scoring → pass / needs_revision / fail

#### QA Thresholds (per content type, from template config):
- Company profiles: 90% overall pass
- News articles: 80% fact-check, 90% SEO
- Podcast pages: 85% completeness

**Output**: `quality_score` written to content_items, verdict in stage output_data

---

### Step 7 — Routing & Flow Control

**Generic Purpose**: Conditional routing, retries, and loops.

#### Routing Rules:
- `pass` → proceed to Step 8 (Bundling)
- `fail: sources_thin` → loop back to Step 1 (more discovery)
- `fail: tone_seo` → loop back to Step 5 (regenerate with fixes)
- `fail: structure` → loop back to Step 5 (reformat)
- `fail: max_retries` → mark project as failed, alert

#### Retry Logic:
- Max 2 loops per failure type
- Configurable per template stage

---

### Step 8 — Bundling

**Generic Purpose**: Package approved content into output-agnostic formats.

#### Operations:
- **output-package**: Generate configured formats (Markdown, JSON, HTML, Meta, Manifest)
- Format list defined in template config per content type
- Schema.org markup for HTML output
- Checksums for manifest

**Writes to**: `content_items` (content_type: 'packaged_output', content: {markdown, json, html, meta, manifest})

---

### Step 9 — Distribution

**Generic Purpose**: Push to CMS, APIs, exports.

#### Operations:
- **distribute-cms**: Push to WordPress/CMS API
- **distribute-sheets**: Update Google Sheets tracker
- **distribute-api**: Send to partner APIs
- **distribute-file**: Export to filesystem / cloud storage

#### Audit:
- All distribution outcomes logged in stage output_data
- Success/failure per destination

---

### Step 10 — Review

**Generic Purpose**: Human approval, rejection, retriggers.

#### Operations:
- **human-review-queue**: Present content for manual review
- **human-review-decide**: Capture approve/reject/loop decision
- **human-trigger-loop**: Route rejected content back to appropriate step

#### Review States:
- `approved` → published
- `rejected` → archived with reason
- `loop` → routed back to specified step with reviewer notes

---

## Content Type Examples

### Company Profile Pipeline Template

```json
{
  "project_type": "company_profile",
  "stages": [
    {"name": "input", "operation": "batch-kickoff", "config": {"source": "csv"}},
    {"name": "discovery", "operation": "url-discovery", "config": {"methods": ["sitemap", "navigation", "seed"]}},
    {"name": "validation", "operation": "source-validation", "config": {"min_authority": 10}},
    {"name": "extraction", "operation": "content-scrape", "config": {"engine": "cheerio", "fallback": "playwright"}},
    {"name": "filtering", "operation": "content-filter", "config": {"min_words": 100, "dedup_threshold": 0.85}},
    {"name": "generation", "operation": "profile-generate", "config": {"model": "gpt-4", "reference_docs": true}},
    {"name": "qa", "operation": "qa-validation", "config": {"min_score": 0.9}},
    {"name": "routing", "operation": "auto-router", "config": {"max_loops": 2}},
    {"name": "packaging", "operation": "output-package", "config": {"formats": ["markdown", "json", "html"]}}
  ]
}
```

### News Article Pipeline Template

```json
{
  "project_type": "news_article",
  "stages": [
    {"name": "input", "operation": "topic-kickoff", "config": {"category": "payment_gateways"}},
    {"name": "discovery", "operation": "topic-discovery", "config": {"sources": ["rss", "google_news"]}},
    {"name": "validation", "operation": "source-validation", "config": {"min_authority": 30}},
    {"name": "extraction", "operation": "content-scrape", "config": {"engine": "cheerio"}},
    {"name": "filtering", "operation": "content-filter", "config": {"min_words": 200, "max_age_days": 14}},
    {"name": "generation", "operation": "article-generate", "config": {"model": "gpt-4", "tone": "authoritative"}},
    {"name": "qa", "operation": "qa-validation", "config": {"min_score": 0.8, "checks": ["facts", "seo"]}},
    {"name": "packaging", "operation": "output-package", "config": {"formats": ["html", "json"]}}
  ]
}
```

---

## Reference Documents (Template / Step 5 Configuration)

These guardrail documents are **generation instructions** — they belong to pipeline_templates or Step 5 configuration, NOT to Step 1 input. They are loaded when generation operations execute.

| Document | Purpose | Used By |
|---|---|---|
| MASTER_CATEGORIES (~80) | Category taxonomy with slugs, definitions, rules | Step 5, 6 |
| MASTER_TAGS (352+) | Tag taxonomy loaded into platform_tags | Step 5, 6 |
| TONE & SEO GUIDE | Style rules, heading hierarchy, word counts | Step 5, 6 |
| FORMAT SPEC | Section lengths, citation rules, JSON schema | Step 5, 6 |
| KEYWORD_PACKS | Per-category keyword sets for SEO | Step 5, 6 |

These are stored as tagged content_items (content_type: 'reference_doc') in the content library, versioned and queryable. Templates reference them by tag codes in their Step 5 config.

---

## Tiered Retention Policy

| Content Status | Body Retained | Metadata Retained | When Purged |
|---|---|---|---|
| active | Forever | Forever | Never |
| filtered_step2 | 7 days | Forever | Daily cleanup job |
| filtered_step4 | 7 days | Forever | Daily cleanup job |
| superseded | Forever | Forever | Never (old version) |
| archived | Forever | Forever | Never |

Daily cleanup:
```sql
UPDATE content_items SET content = NULL, purged_at = NOW()
WHERE status LIKE 'filtered_%'
AND created_at < NOW() - INTERVAL '7 days'
AND content IS NOT NULL;
```

---

## Freshness Flags

| Content Type | Stale After | Flag | Blocked? |
|---|---|---|---|
| News sources | 14 days | stale_news | NO — still usable |
| Company pages | 3 months | stale_company | NO — still usable |
| Transcripts | 6 months | stale_media | NO — still usable |

Freshness is a **flag for operators**, not a gate. Content is NEVER blocked from reuse.

---

## Conflict Resolution

When the same URL is scraped by multiple projects or re-scraped:

```sql
INSERT INTO content_items (...) ON CONFLICT (source_url)
DO UPDATE SET content = EXCLUDED.content, scraped_at = EXCLUDED.scraped_at,
version = content_items.version + 1, updated_at = NOW()
WHERE EXCLUDED.scraped_at > content_items.scraped_at;
```

- Latest scrape always wins
- Version column increments for audit
- All projects benefit from updated content

---

## Migration from v2

| v2 Concept | v3 Equivalent |
|---|---|
| n8n orchestrator | BullMQ + Express API |
| company-specific tables (content_raw, content_filtered, etc.) | Single content_items table with status column |
| Per-step Supabase tables | content_items + pipeline_stages |
| Hardcoded company workflow | pipeline_templates (configurable per type) |
| workflow_events log | pipeline_stages + pipeline_runs |
| qa_fail_log | quality_score + stage error JSONB |
| content_filtered, content_dedup, content_capped | status: filtered_step5, filter_reason column |

---

## Document Version History

- **v3.2** (2026-01-29): Corrected all step descriptions to match 11-step (0-10) structure. Step 1 now Discovery with submodule flow. Step numbers shifted throughout.
- **v3.1** (2026-01-28): Combined Input + Discovery into single Discovery step
- **v3.0** (2026-01-23): Universal platform, tag-based content library, pipeline templates
- **v2.0** (2025): Company-profile-specific, n8n orchestration, per-step tables
- **v1.0** (2024): Initial workflow concept

---

*Document Owner: Claude Opus 4.5*
*Updated: 2026-01-29 — Full step descriptions corrected*
*This document supersedes "Full_Workflow_Document_With_Intro_Formatted v2.docx"*
*The .docx version is preserved for historical reference only.*
