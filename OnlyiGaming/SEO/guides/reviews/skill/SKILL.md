# SEO Review Articles Skill - OnlyiGaming

## What This Skill Does

Produces B2B iGaming review/comparison articles for OnlyiGaming.com. Each article compares vendors across category-specific evaluation dimensions, runs through a 5-step automated pipeline (keyword research → draft → SEO edit → fact-check → polish), and produces publication-ready output.

## When To Use

- User says "write article for [category-slug]" or "produce article for [category]"
- User says "polish article [folder]" or "run pipeline on [folder]"
- User says "produce satellites for [category]"
- User says "list article status"

## Base Path

```
/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/guides/reviews/
```

## Reference Files (READ THESE FIRST)

- `SEO_CONTENT_STRATEGY_FINAL.md` - Full strategy with all decisions
- `TIER1_OUTLINES_FOR_APPROVAL.md` - Approved outlines for Tier 1 articles
- `skill/references/editorial-voice.md` - Voice rules (CRITICAL for writing)
- `skill/references/article-template.md` - YAML frontmatter and structure template (pillar)
- `skill/references/satellite-prompt-templates.md` - 8 satellite class prompts + niche profiles
- `skill/references/category-rubrics.md` - Per-category evaluation dimensions (73 categories — B2B target audience; B2C operator categories like "casino", "bingo", "sportsbook" are out of scope)
- `skill/references/content-quality-standard.md` - The editorial quality bar (proof points, honest uncertainty, etc.)
- `skill/references/keyword-targets.md` - Category-to-keyword mapping

## Production Pipeline (5 Steps via Project Command Center)

Each step is an HTTP endpoint on the local project-command-center server (`http://localhost:3000/api/review-articles/...`). The endpoints are also wired into the Review Articles UI.

### Step 1: Keyword Research (Perplexity Sonar)

`POST /api/review-articles/:slug/keyword-research?article=<articleSlug>`

Generates SEO keyword intelligence + actual buyer search queries. Output saved to `keyword-research/<articleSlug>.md` (article-level) or `keyword-research/<categorySlug>.md` (category-level fallback). Read by every later step.

**Model:** `sonar` default. Override via `PERPLEXITY_MODEL` env var in `project-command-center/server/.env`.

### Step 2: Draft (Claude Sonnet 4)

`POST /api/review-articles/:slug/draft?article=<articleSlug>`

Writes `article.md`. Pillar uses inline prompt in `reviewArticlesRoutes.ts` + `article-template.md`. Satellite uses one of 8 class prompts from `satellite-prompt-templates.md`, selected by `detectSatelliteClass()`. For `best-for` class, a niche profile is also interpolated (5 profiles defined: crypto-operators, emerging-markets, operator-size, regulated-markets, generic-use-case).

**Model:** `claude-sonnet-4-20250514` default. Per-call override via `model` in request body.
**Max tokens:** 16,384 (both pillar and satellite).

### Step 3: SEO Edit (Claude Sonnet 4)

`POST /api/review-articles/:slug/seo-edit?article=<articleSlug>`

Tightens H1/H2 keyword placement, integrates keyword research output (Common Questions become real operator search queries verbatim), strips em/en dashes, removes citation markers. Output: `article-seo-edited.md`. Structure-preserving — does not add or remove sections.

**Model:** `claude-sonnet-4-20250514`. Max tokens: 16,384.

### Step 4: Fact-Check (Gemini 2.5 Flash with web search grounding)

`POST /api/review-articles/:slug/factcheck?article=<articleSlug>`

Verifies every factual claim. Categories: VERIFIED, SOFTENED, FLAGGED, EDITORIAL. Reads `article-seo-edited.md`, outputs `article-factchecked.md` + `factcheck-report.md` (change log). Preserves trap questions, "Not for" statements, and operator-protection content (these are editorial features, not factual claims).

**Model:** `gemini-2.5-flash`.

### Step 5: Polish (Gemini 2.5 Flash)

`POST /api/review-articles/:slug/polish?article=<articleSlug>`

Final editorial pass. Reads `article-factchecked.md` (or seo-edited if no fact-check, or draft if no SEO edit). Writes back to `article.md` (overwrites the draft). Also generates `article.docx` + `article.html`.

**Model:** `gemini-2.5-flash`.

### Files in each article folder after a complete pipeline run

- `article.md` - Final polished version (also has meta_title, meta_description, slug in YAML frontmatter)
- `article-draft.md` - Original draft (backup snapshot from polish step)
- `article-seo-edited.md` - Output of Step 3
- `article-factchecked.md` - Output of Step 4
- `factcheck-report.md` - Detailed list of fact-check changes
- `article.html` - HTML preview
- `article.docx` - Word document (optional, via pandoc)

## Output Format Spec

### YAML frontmatter in article.md:
```yaml
---
title: "..."
meta_title: "..."
meta_description: "..."
slug: ...
card_headline: "..."
card_subheadline: "..."
last_verified: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
protected_keywords: [...]
primary_keyword: "..."
secondary_keywords: [...]
author: "OnlyiGaming Editorial"
date: YYYY-MM-DD
category: "..."
schema_type: "Article"
faq_schema: true
---
```

### HTML output (article.html) styling:
- Tables: max-width 897px, max 6 columns, overflow-x scroll
- Table headers: #6B2D8B purple background, white text, bold
- Provider names in table first column: linked to company page, purple (#6B2D8B), bold, no underline
- Provider names in H3 profile headlines: linked to company page, dark color, no underline
- All company names in runners-up: linked to directory pages
- Blockquote (verdict capsule): 4px purple left border, #f5f0fa background
- H3 profile headings: purple bottom border, 28px top margin
- All relative links: converted to full `https://onlyigaming.com/` URLs

### Table column rules:
- Maximum 6 columns (fits 897px)
- Always include: Provider (linked) | Key Strength | Best For
- 3 category-specific middle columns (varies by category)
- Never include: Founding year, HQ, Deployment, Pricing (unless publicly confirmed)

## Article Types

### Pillar Articles (one per category)
- "Best [Category] in 2026: Independent Comparison"
- **5,000-7,000 words** (bumped from 3,500-5,000 on 2026-05-27)
- URL: `/guides/best-[category-slug]-2026`
- 10-12 companies in main comparison table + same 10-12 with full vendor profiles, plus 8-15 in "Other Providers Worth Exploring" runners-up section
- Reference standard: `casino-platforms/best-casino-platforms-2026/article.md` (locked May 25 22:06, Gemini-praised, 7,238 words)

### Satellite Articles (5-15 per category, 8 prompt classes)

Each class has its own detailed prompt in `skill/references/satellite-prompt-templates.md`. Class is auto-detected from slug/title patterns by `detectSatelliteClass()` in `project-command-center/server/reviewArticlesRoutes.ts`.

| Class | Class ID | Covers | Word target | Detection cues |
|---|---|---|---|---|
| Best-For | `best-for` | Dimension-specific, audience-based, market-specific ("Best [category] for [angle]") | **4,000-5,500** | Default fallback. Uses a niche profile (see below). |
| Buyer's Guide | `buyers-guide` | "How to choose", multi-vs comparison decision frameworks | **3,000-4,500** | `how-to-choose`, multi-`-vs-`, "which do you need" |
| Head-to-Head | `head-to-head` | Two-vendor deep comparison | **3,000-4,500** | `-vs-` exactly once |
| Newcomers | `newcomers` | Rising stars, companies to watch | **3,500-5,000** | `to-watch`, `rising-stars`, `to-look-out-for` |
| Challenges | `challenges` | Common challenges, problems-find-companies | **3,500-5,000** | `challenges` in slug/title |
| Educational (Glossary) | `educational-glossary` | Terminology / glossary articles | **2,500-3,500** | `terminology`, `glossary`, `-explained` |
| Educational (Trends) | `educational-trends` | Industry trends, what's changing | **3,000-4,000** | `-trends` |
| Pricing | `pricing` | Pricing comparison, hidden costs, TCO | **3,500-5,000** | `pricing`, `-cost` |

All satellites: same voice guide, same linking rules, same quality bar as pillar.

### Niche Profiles (for the `best-for` class only)

When a satellite class resolves to `best-for`, a secondary detection (`detectNicheProfile()`) selects a profile that injects angle-specific guidance into the prompt. Profiles live in the `## PROFILES` section of `satellite-prompt-templates.md`.

Each profile has 5 fields (interpolated as `${profile.X}` in the BEST-FOR template):
- `subtypeBuyerConcerns` - 5-8 angle-specific buyer concerns
- `expectedVendorCohort` - which vendors to include/exclude for this angle
- `whatToVerify` - 3-5 angle-specific pre-purchase verification checks
- `trapQuestions` - 3-5 trap questions that expose angle-specific vendor weaknesses
- `sectionNameHints` - suggested H2 section names tailored to the angle

| Profile ID | When it fires | Examples |
|---|---|---|
| `crypto-operators` | Articles with "crypto", "bitcoin", "stablecoin" | Best [X] for crypto operators |
| `emerging-markets` | "emerging markets", "latam", "africa", "asia" | Best [X] for emerging markets |
| `operator-size` | "startup", "small operator", "mid-market", "enterprise" | Best [X] for startups |
| `regulated-markets` | "regulated markets", "multi-jurisdiction", named regulators | Best [X] for regulated markets |
| `generic-use-case` | Catch-all fallback for "Best X for Y" articles not matching above | Best [X] for [any other angle] |

Detection order is specificity-driven: crypto first, generic-use-case last. Profile field contents can be edited freely in the markdown file; field NAMES are interpolated by name and must not be renamed.

**Startup integrity check:** server logs `[satellite-profiles]` lines at boot — verifies all 5 profiles loaded with all 5 fields populated. Any `WARNING:` line at boot blocks the rest of pipeline validation.

## Article Structure Rules (apply to all articles)

- Product-first, never company-bio-first
- Comparison sections in prose (compare ALL vendors per dimension)
- Vendor profiles in consistent bullet structure (standout, proof points, trade-off, best for/not for)
- Every strength gets a trade-off named
- No em dashes or en dashes (regular hyphens only)
- At least 3 genuinely opinionated statements per article
- Internal links to OnlyiGaming directory for every company mentioned
- "Common questions" NOT called "FAQ"
- Scenario routing in intro (route different buyer personas to relevant sections)
- Quick verdict capsule (40-60 words, link-free) for featured snippet extraction
- `card_headline` + `card_subheadline` in frontmatter for category page cards
- `last_verified` (factual data check date) + `last_updated` (editorial change date)
- `protected_keywords` list (terms Gemini must not rephrase)
- Brazil Jan 2026 regulation as cross-cutting filter for all platform categories
- Citation markers from Gemini grounding (`[cite: X]`, `[1]`) must be stripped from final output

## Banned Words

seamlessly, robust, genuinely, unmatched, comprehensive suite, cutting-edge, leveraging, holistic, innovative, empowering, ecosystem, at its core, it's worth noting, the landscape, in the ever-evolving

## Tier 1 Categories (Polished pillars complete)

- casino-platforms (LOCKED reference standard — May 25 22:06)
- crm-platforms
- payment-processing
- game-aggregators
- sportsbook-platform

Note: only `best-casino-platforms-2026/article.md` has been run through the full 5-step pipeline (kw research + draft + SEO edit + fact-check + polish). The others have draft-only output as of 2026-05-29 and need pipeline completion before they can be treated as locked references.

## Tier 2 Categories (Next)

- affiliate-tracking
- white-label-solutions
- turnkey-solutions
- kyc-services
- live-casino-studios

## File Organization

```
SEO/guides/reviews/
  SEO_CONTENT_STRATEGY_FINAL.md/.docx     # Strategy
  TIER1_OUTLINES_FOR_APPROVAL.md          # Approved outlines
  INVENTORY.md / INVENTORY.xlsx           # 754-article master list with status
  satellite-articles-plan.csv             # Per-article planning state
  skill/
    SKILL.md (this file)
    references/
      editorial-voice.md                  # Voice guide
      keyword-targets.md                  # Category → keyword mapping
      article-template.md                 # Pillar structure template
      satellite-prompt-templates.md       # 8 class prompts + 5 profiles
      category-rubrics.md                 # 73 categories
      content-quality-standard.md         # Quality bar (proof points, honest uncertainty, etc.)
  keyword-research/                       # One .md per article or category
    best-casino-platforms-2026.md
    how-to-choose-casino-platform.md
    affiliate-tracking.md
  casino-platforms/
    best-casino-platforms-2026/           # PILLAR folder
      article.md (final polished + YAML frontmatter)
      article-draft.md                    # Pre-polish backup
      article-seo-edited.md               # Step 3 output
      article-factchecked.md              # Step 4 output
      factcheck-report.md                 # Step 4 change log
      article.html                        # Browser preview
      article.docx                        # Word doc (pandoc)
    casino-platforms-crypto-support/      # SATELLITE folder (slug-prefixed by category)
      article.md
      ...same intermediate files...
  crm-platforms/
    ...same structure...
```

Satellite folder naming: `<category-slug>-<satellite-slug>/` OR (legacy) `<satellite-slug>/` directly. Both patterns supported by `resolveArticleDir()` in the pipeline.
