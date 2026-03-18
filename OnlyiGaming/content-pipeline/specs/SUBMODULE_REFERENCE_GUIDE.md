# Submodule Reference Guide

> Complete reference for all built submodules in the Content Creation Tool.

**Last Updated:** 2026-03-18
**Companion to:** SKELETON_SPEC_v2.md, SUBMODULE_DEVELOPMENT.md, STRATEGIC_ARCHITECTURE.md
**Source of truth for each module:** The README.md in each module's folder (this document is a consolidated overview)

---

## Purpose

This document serves two audiences:

1. **Operators and AI assistants** — Understand which modules to use, what settings to choose, and what to expect. Make informed decisions about module selection and configuration for different content types.

2. **Developers** — Understand each module's strategy, technical implementation, limitations, and relationship to the original vision. Know what exists before building new modules.

Each module has a detailed README.md in its folder. This document provides the cross-module overview: how they relate, how they chain, and how to choose between them.

---

## Architecture Context

### The 11-Step Pipeline

| Step | Name | Purpose | Modules Built |
|------|------|---------|---------------|
| 0 | Project Start | Define scope | (UI only) |
| 1 | Discovery | Find candidate URLs | 6 modules |
| 2 | Validation | Filter before scraping | 3 modules |
| 3 | Scraping | Fetch page content | 2 modules |
| 4 | Filtering & Assembly | Clean and organize | 1 module |
| 5 | Analysis & Generation | LLM content creation | 3 modules |
| 6 | Quality Assurance | Verify standards | Not built |
| 7 | Routing | Handle failures | Not built |
| 8 | Bundling | Package formats | 5 modules |
| 9 | Distribution | Push to systems | Not built |
| 10 | Review | Human approval | Not built |

### Data Operation Types

| Symbol | Operation | Meaning | Used By |
|--------|-----------|---------|---------|
| ＝ | Transform | Each module works independently, results merge into pool | Step 1 modules, Page Scraper, Browser Scraper, Content Analyzer, Step 8 modules |
| ➖ | Remove | Modules chain — each filters the previous sibling's output | Step 2 modules, Content Filter |
| ➕ | Add | Modules chain — each adds to previous sibling's output | SEO Planner, Content Writer |

### Step 1 vs Step 2 Data Flow

**Step 1 (Discovery)** — Independent modules, shared pool:
```
Sitemap Parser   ──→ results ──┐
Page Links       ──→ results ──┤
RSS Feeds        ──→ results ──┼──→ Shared Working Pool ──→ Step 2
Deep Links       ──→ results ──┤
Browser Crawler  ──→ results ──┤
Test Dummy       ──→ results ──┘
```
Each module runs independently. Results accumulate in a shared pool. Deep Links is special — it reads the pool from siblings. Browser Crawler is an expensive Playwright fallback for sites where HTTP-based crawlers fail.

**Step 2 (Validation)** — Chained modules, sequential filtering:
```
Working Pool ──→ URL Dedup ──→ URL Filter ──→ URL Relevance ──→ Step 3
```
Each module reads the previous sibling's approved output and filters it further. Order matters: cheapest first.

---

## Module Inventory

### Step 1 — Discovery

| Module | ID | Category | Cost | What It Does |
|--------|----|----------|------|-------------|
| Sitemap Parser | `sitemap-parser` | crawling | cheap | Parses XML sitemaps for indexed URLs |
| Page Link Extractor | `page-links` | crawling | cheap | Extracts links from homepage nav/header/footer |
| RSS Feed Discovery | `rss-feeds` | news | cheap | Finds RSS/Atom feed URLs |
| Deep Link Crawler | `deep-links` | crawling | medium | Follows pool URLs one level deeper |
| Browser Link Crawler | `browser-crawler` | crawling | expensive | Playwright-based link crawler with Cloudflare bypass, stealth mode, proxy support, and Wayback Machine fallback |
| Test Dummy | `test-dummy` | testing | cheap | Generates fake data for pipeline testing |

**Selection guide:**

| Scenario | Recommended Modules |
|----------|-------------------|
| Standard company profile | Sitemap Parser + Page Links + Deep Links |
| Quick scan (speed priority) | Sitemap Parser only |
| Small/startup companies | Page Links (may not have sitemap) |
| News-oriented pipeline | RSS Feeds + Sitemap Parser |
| Thorough enterprise research | Sitemap Parser + Page Links + Deep Links + Browser Crawler |
| Cloudflare-protected / JS-heavy sites | Browser Crawler (after cheaper crawlers return 0 URLs) |
| Pipeline development & testing | Test Dummy |

### Step 2 — Validation

| Module | ID | Category | Cost | What It Does |
|--------|----|----------|------|-------------|
| URL Deduplicator | `url-dedup` | filtering | cheap | Normalizes URLs, removes duplicates |
| URL Pattern Filter | `url-filter` | filtering | cheap | Regex include/exclude patterns |
| URL Relevance Filter | `url-relevance` | filtering | cheap | LLM-based KEEP/MAYBE/DROP classification |

**Always run in this order:** Dedup → Filter → Relevance. Each reduces the workload for the next.

**Selection guide:**

| Scenario | Recommended Modules |
|----------|-------------------|
| Multiple discovery modules ran | All three (dedup essential) |
| Single discovery module, large pool | URL Filter + URL Relevance |
| Single discovery module, small pool | URL Relevance only (or skip Step 2) |
| Budget-conscious | URL Dedup + URL Filter (skip LLM cost) |

### Step 3 — Scraping

| Module | ID | Category | Cost | What It Does |
|--------|----|----------|------|-------------|
| Page Scraper | `page-scraper` | scraping | expensive | Fetches HTML, extracts text via Readability |
| Browser Scraper | `browser-scraper` | scraping | expensive | Re-scrapes JS-heavy pages using Playwright where HTTP fetch extracted < 50 words |

**Two-module chain:** Run Page Scraper first (cheaper, handles most pages), then Browser Scraper on failures. Browser Scraper only re-scrapes pages where Readability extracted fewer than `min_word_threshold` words — pages above the threshold pass through unchanged.

**Selection guide:**

| Scenario | Recommended Modules |
|----------|-------------------|
| Standard scraping | Page Scraper only |
| JS-heavy / SPA sites | Page Scraper + Browser Scraper |
| Maximum extraction coverage | Page Scraper + Browser Scraper (reduces 56% failure rate from HTTP-only) |
| Budget-conscious | Page Scraper only (accept lower extraction rate) |

### Step 4 — Filtering & Assembly

| Module | ID | Category | Cost | What It Does |
|--------|----|----------|------|-------------|
| Content Filter | `content-filter` | filtering | cheap | Filters pages by quality: scrape status, word count, language, URL patterns, title keywords |

**First post-scrape quality gate.** Applies five deterministic filters in cheapest-first order. No API calls — pure local data processing. Future Step 4 siblings will handle content deduplication, intent tagging, and adaptive page caps.

**Selection guide:**

| Scenario | Recommended Settings |
|----------|---------------------|
| Standard company profile | Default settings (min 50 words, English required) |
| Article-length content only | Strict: min_word_count 200, extra title/URL exclusions |
| Multilingual content | Disable require_english |
| After thorough Step 2 | Can reduce URL/title exclusion lists (Step 2 already caught most) |

### Step 5 — Analysis & Generation

| Module | ID | Category | Cost | What It Does |
|--------|----|----------|------|-------------|
| Content Analyzer | `content-analyzer` | analysis | expensive | LLM-powered extraction of categories, tags, key facts, differentiators per entity |
| SEO Planner | `seo-planner` | planning | medium | Generates keywords, content outline, meta tags, and FAQs from analysis |
| Content Writer | `content-writer` | generation | expensive | Writes full company profiles following the SEO plan and analysis |

**Three-part chain:** Analyzer (＝) -> Planner (➕) -> Writer (➕). Each stage has a human review gate. The analyzer reads scraped pages independently; planner and writer chain from the pool via `source_submodule`.

**This is where LLM costs concentrate.** Analyzer sends full page text to the LLM. Writer produces 2,000+ word articles. Planner is the cheapest — safe to re-run while iterating.

**Selection guide:**

| Scenario | Recommended Modules |
|----------|-------------------|
| Full company profile pipeline | All three in order |
| Categorization/tagging only | Content Analyzer alone |
| Content brief for human writers | Content Analyzer + SEO Planner |
| Quick draft iteration | All three with Haiku models |
| Flagship content | All three with Sonnet (analyzer/planner) + Opus (writer) |

### Step 8 — Bundling

| Module | ID | Category | Cost | What It Does |
|--------|----|----------|------|-------------|
| Markdown Output | `markdown-output` | formatting | cheap | Clean publishable Markdown with optional YAML frontmatter |
| HTML Output | `html-output` | formatting | cheap | HTML conversion with optional schema.org Organization JSON-LD |
| JSON Output | `json-output` | data | cheap | Structured JSON per entity from all pipeline data shapes |
| Meta Output | `meta-output` | seo | cheap | Validated SEO metadata (title, description, keywords, OG tags) |
| Company Media | `company-media` | media | medium | Finds logos, OG images, team photos, product screenshots, and award badges |

**Data-shape routing:** Step 8 modules detect their input by checking which fields exist on pool items (`content_markdown`, `analysis_json`, `seo_plan_json`), never by checking `source_submodule`. This allows new upstream producers without modifying Step 8 code.

**All formatting modules are independent** — each reads from the Step 5 pool and produces its own output format. Run whichever combination your distribution workflow needs.

**Selection guide:**

| Scenario | Recommended Modules |
|----------|-------------------|
| CMS import (Strapi, WordPress) | JSON Output + Meta Output |
| Editorial review / human reading | Markdown Output |
| Standalone web pages | HTML Output (with schema.org enabled) |
| Full bundling (all formats) | All five |
| SEO metadata only | Meta Output alone |
| Company directory with images | Company Media + JSON Output |
| Quick export for sharing | Markdown Output only |

---

## Cross-Module Data Flow

### What Carries Through the Pipeline

| Field | Created By | Used By | Purpose |
|-------|-----------|---------|---------|
| `url` | All Step 1 modules | All downstream | Primary identifier |
| `link_text` | Page Links, Deep Links, Browser Crawler | URL Relevance Filter | Classification signal |
| `source_location` | Page Links, Browser Crawler | URL Relevance Filter | nav/header/footer/body signal |
| `found_on` | Deep Links, Browser Crawler | (provenance) | Which page the URL was found on |
| `feed_type`, `item_count` | RSS Feeds | (metadata) | Feed characteristics |
| `last_modified`, `priority` | Sitemap Parser | (metadata) | Sitemap metadata |
| `status` | Step 2 modules | Approval flow | unique/duplicate, kept/excluded, KEEP/DROP |
| `text_content` | Page Scraper, Browser Scraper | Content Filter, Step 5+ | Actual page text for generation |
| `word_count` | Page Scraper, Browser Scraper | Content Filter, Step 5+ | Minimum content threshold |
| `scrape_method` | Browser Scraper | (provenance) | Tracks whether page was scraped via HTTP or browser |
| `title`, `meta_description` | Page Scraper, Browser Scraper | Content Filter, Step 5+ | Page metadata |
| `filter_status` | Content Filter | Step 5+ | kept/excluded quality classification |
| `filter_reason` | Content Filter | (provenance) | Why a page was excluded |
| `analysis_json` | Content Analyzer | SEO Planner, Content Writer, Step 8 | Structured company analysis (categories, tags, facts) |
| `seo_plan_json` | SEO Planner | Content Writer, Meta Output, JSON Output | Keywords, outline, meta tags, FAQs |
| `content_markdown` | Content Writer | Markdown Output, HTML Output, JSON Output | Full written article in Markdown |
| `source_submodule` | Step 5 modules | Step 5 chaining | Identifies which submodule produced each pool item |
| `final_markdown` | Markdown Output | (terminal output) | Clean publishable Markdown with frontmatter |
| `final_html` | HTML Output | (terminal output) | HTML with optional schema.org JSON-LD |
| `final_json` | JSON Output | (terminal output) | Structured JSON for CMS import |
| `meta_title`, `meta_description` | Meta Output | (terminal output) | Validated SEO metadata |
| `logo_url`, `og_image_url` | Company Media | (terminal output) | Discovered media URLs |

### Entity Grouping

All modules group results by `entity_name`. This means:
- Step 1: Each company's URLs are tracked separately
- Step 2: Dedup works across entities (catching cross-company duplicates) but results are re-grouped
- Step 3: Each company's pages are scraped and grouped together
- Step 4: Content Filter processes all entities, grouping results back by entity with per-entity kept/excluded counts
- Step 5: Shape change — many pages per entity collapse into one analysis/plan/article per entity. Grouping shifts from URL-level to entity-level
- Step 8: Entity-level output — each bundling module produces one output item per entity (one .md, one .html, one .json, one meta object, one media manifest)

---

## Options Quick Reference

### Step 1 — Discovery Options

#### Sitemap Parser
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `max_urls` | 10,000 | URLs per sitemap |
| `include_nested_sitemaps` | true | Follow sitemap index files |
| `url_pattern` | "" | Regex filter on URLs |

#### Page Link Extractor
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `max_urls` | 200 | Links per homepage |
| `include_footer` | true | Include footer section links |
| `include_body` | false | Include main content links |
| `same_domain_only` | true | Exclude external links |

#### RSS Feed Discovery
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `max_feeds` | 10 | Feeds per site |
| `check_common_paths` | true | Probe /feed, /rss, etc. |

#### Deep Link Crawler
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `max_pages_per_entity` | 10 | Pages to crawl per company |
| `max_urls_per_page` | 50 | New URLs per crawled page |
| `crawl_patterns` | /about, /company, /partners... | Path patterns to follow |
| `same_domain_only` | true | Exclude external links |
| `exclude_already_discovered` | true | Skip pool duplicates |

#### Browser Link Crawler
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `max_urls` | 300 | URLs per site |
| `max_depth_pages` | 5 | Internal pages to crawl beyond homepage |
| `request_timeout` | 20,000ms | Playwright page timeout |
| `same_domain_only` | true | Exclude external links |
| `concurrency` | 2 | Concurrent page fetches |

#### Test Dummy
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `delay_ms` | 1,000 | Simulated work delay per entity |
| `items_per_entity` | 3 | Fake items per entity |
| `fail_entity` | "" | Entity name to simulate failure on |

### Step 2 — Validation Options

#### URL Deduplicator
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `normalize_www` | true | www = non-www |
| `normalize_trailing_slash` | true | /page = /page/ |
| `strip_query_params` | true | Remove ?utm_source, etc. |
| `strip_fragments` | true | Remove #anchors |
| `case_insensitive` | true | /About = /about |

#### URL Pattern Filter
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `exclude_patterns` | "" | Regex patterns to remove |
| `include_patterns` | "" | If set, only matching kept |
| `check_status_codes` | false | HTTP GET to verify 200 |

#### URL Relevance Filter
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `ai_model` | haiku | LLM model for classification |
| `ai_provider` | anthropic | LLM provider |
| `keep_criteria` | about, team, leadership... | Page types to KEEP |
| `drop_criteria` | product pages, campaigns... | Page types to DROP |
| `confidence_threshold` | balanced | keep_most / balanced / aggressive |
| `max_urls_per_prompt` | 200 | Batch size per LLM call |

### Step 3 — Scraping Options

#### Page Scraper
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `request_timeout` | 10,000ms | HTTP timeout per URL |
| `max_content_length` | 50,000 chars | Text extraction limit |
| `delay_between_requests` | 500ms | Rate limiting pause |
| `skip_non_html` | true | Mark non-HTML as skipped vs error |
| `extract_meta` | true | Extract meta description |

#### Browser Scraper
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `request_timeout` | 20,000ms | Playwright page timeout |
| `wait_for_network_idle` | true | Wait until no requests for 500ms |
| `min_word_threshold` | 50 | Only re-scrape pages below this word count |
| `max_content_length` | 50,000 chars | Text extraction limit |
| `concurrency` | 3 | Concurrent browser tabs |

### Step 4 — Filtering Options

#### Content Filter
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `min_word_count` | 50 | Minimum words to keep a page |
| `drop_errors` | true | Exclude pages that failed scraping |
| `require_english` | true | Exclude non-English content |
| `exclude_title_keywords` | cookie,privacy,terms,login,404,cart,checkout | Title keywords that trigger exclusion |
| `exclude_url_patterns` | /tag/,/author/,/page/,/category/,/wp-admin/ | URL patterns that trigger exclusion |

### Step 5 — Generation Options

#### Content Analyzer
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `ai_model` | sonnet | LLM model for analysis |
| `ai_provider` | anthropic | LLM provider |
| `reference_docs` | [] (none) | Category descriptions, tag definitions |
| `max_content_chars` | 50,000 | Truncate source text for token control |
| `prompt` | (analysis template) | Full LLM instruction with placeholders |

#### SEO Planner
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `ai_model` | sonnet | LLM model for planning |
| `ai_provider` | anthropic | LLM provider |
| `reference_docs` | [] (none) | Keyword packs, format templates |
| `target_word_count` | 2,000 | Target article length |
| `faq_count` | 5 | Number of FAQ questions |
| `prompt` | (planning template) | Full LLM instruction with placeholders |

#### Content Writer
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `ai_model` | sonnet | LLM model for writing |
| `ai_provider` | anthropic | LLM provider |
| `reference_docs` | [] (none) | Tone guide, format template, style examples |
| `output_format` | markdown | markdown / json / both |
| `prompt` | (writing template) | Full LLM instruction with placeholders |

### Step 8 — Bundling Options

#### Markdown Output
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `heading_style` | strip_markers | Keep or strip [Type Marker] heading prefixes |
| `citation_format` | footnotes | inline / footnotes / strip for [#n] citations |
| `include_frontmatter` | true | Add YAML frontmatter with entity metadata |
| `include_meta_section` | false | Keep ## [Meta] section in output |

#### HTML Output
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `include_schema_org` | true | Generate schema.org Organization JSON-LD |
| `css_template` | none | none / basic / article CSS styling |
| `include_sources_section` | true | Convert citations to superscript anchor links |
| `wrap_in_document` | false | Full <!DOCTYPE html> vs HTML fragment |

#### JSON Output
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `output_format` | strapi | strapi / flat field mapping presets |
| `include_markdown` | true | Include content_markdown as a string field |
| `include_analysis` | true | Include categories, tags, key_facts |
| `include_seo_plan` | true | Include target_keywords, meta, FAQs |
| `flatten_key_facts` | false | Hoist key_facts to top level |

#### Meta Output
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `max_title_length` | 60 | Maximum characters for meta title |
| `min_description_length` | 150 | Minimum characters for meta description |
| `max_description_length` | 160 | Maximum characters for meta description |
| `include_keywords_array` | true | Assemble keywords from categories + tags |
| `include_og_tags` | true | Generate Open Graph meta tags |
| `include_twitter_tags` | false | Generate Twitter Card meta tags |

#### Company Media
| Option | Default | Quick Description |
|--------|---------|-------------------|
| `find_logo` | true | Look for company logo images |
| `find_team_photos` | true | Extract photos from /about, /team pages |
| `find_product_screenshots` | true | Extract screenshots from /products pages |
| `find_awards` | true | Look for award/certification badge images |
| `validate_urls` | true | HEAD requests to verify image accessibility |
| `max_pages_per_entity` | 8 | Pages to fetch per entity |

---

## Pipeline Recipes

### Standard Company Profile Pipeline

**Step 1 — Discovery:**
1. Sitemap Parser (default settings)
2. Page Links (default settings)
3. Deep Links (default settings — runs after 1 + 2 approved)

**Step 2 — Validation:**
1. URL Dedup (all normalization enabled)
2. URL Filter (standard iGaming exclude patterns)
3. URL Relevance (haiku, balanced, company profile keep/drop criteria)

**Step 3 — Scraping:**
1. Page Scraper (default settings)
2. Browser Scraper (default settings — re-scrapes pages with < 50 words)

**Step 4 — Filtering:**
1. Content Filter (default settings)

**Step 5 — Generation:**
1. Content Analyzer (sonnet, with category_descriptions.md)
2. SEO Planner (sonnet, 2,000 words, 5 FAQs)
3. Content Writer (sonnet, markdown, with tone_guide.md + format_template.md)

**Step 8 — Bundling:**
1. Markdown Output (strip_markers, footnotes, frontmatter)
2. HTML Output (schema.org enabled)
3. JSON Output (strapi format)
4. Meta Output (default SEO validation)
5. Company Media (all image types enabled)

**Expected flow:** ~500-5,000 discovered URLs → ~300-3,000 after dedup → ~200-2,000 after filter → ~100-500 after relevance → ~80-400 scraped pages → ~60-360 after content filter → 1 analysis + 1 SEO plan + 1 article per entity → 1 .md + 1 .html + 1 .json + 1 meta + 1 media manifest per entity

### Quick Company Scan

**Step 1:** Sitemap Parser only (max_urls: 500)
**Step 2:** URL Relevance only (aggressive threshold)
**Step 3:** Page Scraper (default)
**Step 4:** Content Filter (default)
**Step 5:** Content Analyzer (haiku) + SEO Planner (haiku, 1,000 words, 3 FAQs) + Content Writer (haiku)
**Step 8:** Markdown Output only

**Expected flow:** ~100-500 URLs → ~30-150 after relevance → ~25-120 scraped pages → ~20-100 after content filter → 1 short profile per entity → 1 .md per entity

### News Monitoring Pipeline

**Step 1:** RSS Feeds + Sitemap Parser (url_pattern: /news|/blog|/press)
**Step 2:** URL Dedup + URL Relevance (news-specific keep/drop criteria)
**Step 3:** Page Scraper (default)
**Step 4:** Content Filter (require_english: false for multilingual news sources)

---

## Lineage from Original Vision

This section maps each built module to its origin in the Content Creation Master and Strategic Architecture documents.

| Current Module | Original Concept | Original Step | Key Evolution |
|---------------|------------------|---------------|---------------|
| Sitemap Parser | Track B: Exploratory (site seeds) | Old Step 2c | Focused on sitemaps specifically |
| Page Links | Track B: seed paths (/about, /products...) | Old Step 2c | Extracts actual nav rather than hardcoded paths |
| RSS Feeds | RSS discovery from /news\|/press\|/blog | Old Step 2 | Standalone module vs inline check |
| Deep Links | Scraper depth 1-2 from seed pages | Old Step 5c/5d | Discovery-only (no content fetch) |
| Browser Crawler | Playwright fallback for protected sites | Old Step 5d | Discovery-only with Cloudflare bypass, stealth, proxy, Wayback fallback |
| Test Dummy | (not in original vision) | N/A | Development/testing utility |
| URL Dedup | Deduplication in validation | Old Step 4 | URL-level only (content dedup planned for Step 4) |
| URL Filter | Light rules (regex/path) | Old Step 4b | Operator-configured vs ML-learned rules |
| URL Relevance | Domain-aware validator with ML | Old Step 4b-4d | LLM-based vs trained classifier |
| Page Scraper | Cheerio/static primary scraper | Old Step 5c | Uses Readability (Firefox algorithm) |
| Browser Scraper | Playwright/JS fallback scraper | Old Step 5d | Re-scrapes only pages where HTTP extraction failed (< 50 words) |
| Content Filter | Post-scrape quality gate | Old Step 7 | Deterministic filters only (no content dedup, no adaptive caps yet) |
| Content Analyzer | Analysis & Classification (Node 6a) | Old Step 8a | LLM-based analysis, produces structured JSON per entity |
| SEO Planner | Tone & SEO Plan (Node 6b) | Old Step 8b | LLM keyword/outline planning, chains from analyzer |
| Content Writer | Draft Creation (Node 6c) | Old Step 8c | LLM long-form writing, chains from both analyzer and planner |
| Markdown Output | Output packaging | Old Step 8d | Clean Markdown with YAML frontmatter, citation formatting |
| HTML Output | Output packaging | Old Step 8d | HTML conversion with schema.org JSON-LD |
| JSON Output | Output packaging | Old Step 8d | Strapi-ready/flat structured JSON from all pipeline shapes |
| Meta Output | SEO metadata extraction | Old Step 8d | Validated SEO metadata with length constraints |
| Company Media | Media enrichment | Old Step 8d | Website-only image discovery (multi-source pipeline backlogged) |

**Not yet built from original vision:**
- PSE News/Directory search (old Steps 2a/2b)
- LinkedIn metadata discovery (old Step 2d)
- YouTube/podcast transcript extraction (old Step 2e/5e)
- Content deduplication — exact + near duplicate (old Step 7)
- Intent tagging — About, Products, Press, Partners, Careers, Contact (old Step 7)
- Adaptive page caps — base 12, expand to 25 (old Step 7)
- ML-based validator with shadow mode and domain policies (old Step 4b-4d full vision)
- QA with hallucination detection (old Step 9)
- Automated routing (old Step 10)
- Multi-source image pipeline — Google Image Search, LinkedIn, external sources (backlogged, see MEMORY.md)

---

## For Detailed Documentation

Each module's full documentation — including background, strategy, recipes, expected output, limitations, and technical reference — lives in its folder:

```
content-pipeline-modules-v2/modules/
├── step-1-discovery/
│   ├── sitemap-parser/README.md
│   ├── page-links/README.md
│   ├── rss-feeds/README.md
│   ├── deep-links/README.md
│   ├── browser-crawler/README.md
│   └── test-dummy/README.md
├── step-2-validation/
│   ├── url-dedup/README.md
│   ├── url-filter/README.md
│   └── url-relevance/README.md
├── step-3-scraping/
│   ├── page-scraper/README.md
│   └── browser-scraper/README.md
├── step-4-filtering/
│   └── content-filter/README.md
├── step-5-generation/
│   ├── content-analyzer/README.md
│   ├── seo-planner/README.md
│   └── content-writer/README.md
└── step-8-bundling/
    ├── markdown-output/README.md
    ├── html-output/README.md
    ├── json-output/README.md
    ├── meta-output/README.md
    └── company-media/README.md
```

---

*Document Owner: CTO Agent*
*Last Updated: 2026-03-18*
*This document consolidates information from individual module READMEs. For authoritative detail on any specific module, refer to its README.md.*
