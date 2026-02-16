# Content Pipeline Architecture — Decision Summary

**Last Updated**: 2026-01-29
**Status**: Active Architecture Document

---

## Overall Philosophy

**"Shit in, shit out"** — Each step is a quality gate. You don't proceed until output is good enough to feed forward. Templates are earned through iteration, not declared upfront.

**Database-mediated architecture** — Every step reads from and writes to Supabase. No direct connections between steps. This enables flexibility, branching, and maintainability.

**Modular by design** — Every step is built with submodules. Steps are containers. Submodules have the logic.

---

## Step Structure (Revised)

| Step | Name | Purpose |
|------|------|---------|
| 0 | Project Start | Name, template, intent, timing |
| 1 | Discovery | Choose sources, provide input, collect URLs (upload happens INSIDE submodules) |
| 2 | Validation / Dedupe | Clean and validate URLs before scraping |
| 3 | Scraping | Fetch content from URLs |
| 4+ | ... | Analysis, generation, QA, etc. (to be specced later) |

**Key change:** There is no separate "upload step." Upload happens INSIDE each submodule in the Discovery step. You choose what you want to discover, THEN you provide the data it needs.

---

## Step 0: Project Start

**Required:**
- Name

**Optional:**
- Choose template (if exists) OR start fresh
- Part of larger project (parent project link)
- Declare intent/goal (freeform text, e.g., "100 company profiles" / "refresh existing")
- Set timing: one-off | scheduled | continuous

**Does NOT include:**
- Entity type selection (not decided at Step 0)
- Output format choices (those come at end of pipeline)

---

## Step 1: Discovery

**This step combines input AND source collection.** No separate upload step exists.

### User Flow

1. User sees category cards (Website, News, LinkedIn, YouTube, etc.)
2. User clicks into a category, sees available submodules
3. User clicks a submodule → overlay pane slides out from left
4. Pane shows choices/options + input fields
5. User configures options, provides input (upload CSV, paste URLs)
6. [RUN] activates when input valid → user clicks to execute
7. After run completes → [SEE RESULTS] appears
8. User clicks [SEE RESULTS] → results shown in same pane
9. If satisfied → [APPROVE] appears → user clicks to approve submodule
10. Pane closes, card shows green/approved with count
11. User repeats for other submodules
12. Once all desired submodules approved → [APPROVE STEP] or [SKIP STEP]

### Available Categories (Visual Grouping)

- Website (Sitemap, Navigation, Seed Expansion)
- News (RSS Feeds, News Search)
- LinkedIn (Company Page, Posts)
- YouTube (Channel Videos, YouTube Search)
- Twitter/X (Profile)
- Crunchbase (Company Data)
- Search (Google Search)

**Note:** Categories are visual grouping only, not functional. The toggle on category cards is cosmetic — shows active state when submodules inside are used. Could be removed.

**For MVP1b:** Only Website category with 3 submodules.

---

## Shared Step Context (CSV Data Sharing)

### The Problem

Without shared context:
- Upload CSV in Sitemap (name, website, linkedin, youtube)
- Upload CSV in LinkedIn (name, linkedin) ← redundant
- Upload CSV in YouTube (name, youtube) ← redundant
- 3 uploads, same data, user frustrated

### The Solution

User uploads a CSV in ANY submodule. The data becomes available to ALL other submodules **within the same step, same run, same project**.

### How It Works

```
User uploads CSV in Sitemap submodule:
┌─────────────────────────────────────────┐
│ name,website,linkedin,youtube           │
│ Betsson,betsson.com,/company/betsson,   │
│ Evolution,evolution.com,,@evolution     │
└─────────────────────────────────────────┘

Data stored in step context (Supabase).

Later, LinkedIn submodule checks:
"I need linkedin URLs"
→ Finds linkedin column from earlier CSV
→ Auto-populates, shows: "2 LinkedIn URLs available from uploaded data"
→ User can [Use these] or [Upload different]
```

### Priority Order

1. **Submodule-specific upload** (if user uploads in this submodule) → use that
2. **Shared step context** (if column exists from earlier upload) → use that
3. **Prompt user** to upload

### Scope Boundaries

| Shared Within | NOT Shared Across |
|---------------|-------------------|
| Same step (Step 1 Discovery) | Different steps |
| Same run | Different runs |
| Same project | Different projects |
| Submodules in that step | Templates |

### Database Schema

```sql
step_context (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES pipeline_runs(id),
  step_index INTEGER NOT NULL,
  entities JSONB NOT NULL,           -- parsed CSV data
  source_submodule TEXT,             -- which submodule uploaded
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(run_id, step_index)
)
```

### Submodule UI

```
┌─────────────────────────────────────────────────┐
│ LinkedIn Submodule                              │
│                                                 │
│ LinkedIn URLs needed                            │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ ✓ Found 2 LinkedIn URLs from project data   │ │
│ │   Betsson: /company/betsson                 │ │
│ │   Evolution: (missing)                      │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Use available data]  [Upload CSV to add more] │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Step 2: Validation / Dedupe

- Remove duplicates
- Filter low-quality URLs
- Pre-scrape validation
- Can be skipped

---

## Step 3: Scraping

- Fetch content from URLs
- Different scrapers based on URL source (website vs LinkedIn vs YouTube)
- Also built with submodules
- Spec deferred

---

## Submodule Architecture

### Step Container Structure

Steps are containers:
- Steps hold submodules
- Steps have: [APPROVE STEP] and [SKIP STEP] buttons
- Steps don't have their own logic (deduplication, validation = dedicated steps)
- All logic lives in submodules

### Step-Level Approval

**Requirement:** ALL submodules within a step must be individually approved before the step can be approved.

| Action | Effect |
|--------|--------|
| [APPROVE STEP] | Marks step complete, opens next step |
| [SKIP STEP] | Marks step skipped, opens next step |

Both actions advance the pipeline. Skip is for optional steps or when user decides not to use any submodules in that step.

### Step Definition Schema

```javascript
{
  id: string,
  name: string,
  order: number,
  description: string,
  can_skip: boolean,
  available_submodules: [...],
  input_from_step: string | null,
  output_to_step: string | null,
}
```

### Submodule Flow

1. User clicks a submodule from the category menu
2. Overlay pane slides out from the left
3. Pane shows:
   - Choices/options (if any)
   - Input fields (upload CSV, paste URLs, etc.)
4. User configures options, provides input
5. [RUN] button activates when input is valid
6. User clicks [RUN] → submodule executes
7. After run completes → [SEE RESULTS] button appears
8. User clicks [SEE RESULTS] → results shown in same pane
9. User reviews results (URL list, counts, errors)
10. If satisfied → [APPROVE] button appears
11. User clicks [APPROVE] → submodule marked as approved, pane closes
12. Submodule card shows green/approved state with result count
13. User repeats for other submodules OR proceeds to step approval

```
┌─────────────────────────────────────────────────────┐
│ Sitemap Submodule                            [X]    │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Options                                         │ │
│ │ ☑ Include nested sitemaps                       │ │
│ │ Max depth: [3]                                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Input                                           │ │
│ │ [Upload CSV] or drag file here                  │ │
│ │ ✓ companies.csv (6 rows)                        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│                              [RUN]  ← activates     │
│                                                     │
│ ─────────────── after run ─────────────────────     │
│                                                     │
│ ✓ Run complete: 42 URLs found                       │
│                                                     │
│                        [SEE RESULTS]                │
│                                                     │
│ ─────────────── after viewing ─────────────────     │
│                                                     │
│ Results:                                            │
│ • betsson.com: 12 URLs                              │
│ • evolution.com: 8 URLs                             │
│ • ...                                               │
│                                                     │
│                             [APPROVE]               │
└─────────────────────────────────────────────────────┘
```

### Submodule Definition Schema

```javascript
{
  id: string,
  name: string,
  description: string,
  category: string,                    // visual grouping ("website", "news", etc.)
  cost_tier: "cheap" | "medium" | "expensive",

  inputs_required: [
    { name: string, type: string, label: string, description: string }
  ],
  inputs_optional: [...],

  options: [
    { name: string, type: string, values: [...], default: any, description: string }
  ],

  output_type: string,                 // "urls", "content", "metadata"
  output_schema: {...},

  // For future versions:
  requires_submodules: [...],          // dependencies (v3)
  fallback_submodule: string,          // if fails, try X (v3)
}
```

### Submodule Principles

- **Siloed** — each has its own options, inputs, run button, results
- **Chainable** (v3) — output of A can feed input of B
- **Independent** — can run separately, results merge
- **Self-describing** — declares what it needs, user provides
- **Skippable** — user doesn't have to use any specific submodule

---

## Entity Schema Decisions

### Step 1: Freeform Input

Step 1 accepts freeform data. No strict schema enforcement.

- Required: `name`
- Optional: `website`, `linkedin`, `youtube`, `twitter`, `description`, etc.
- Better field descriptions in UI showing what each field enables

### Step 2+: Contextual Validation

Each submodule validates what IT needs:

```javascript
// sitemap submodule
{
  name: 'sitemap',
  requires: ['website'],  // Won't run without this
  optional: ['sitemap_url']
}

// google-search submodule
{
  name: 'google-search',
  requires: ['name'],  // Minimal - always works
  optional: ['website', 'keywords']
}
```

### Duplicate Detection

Multiple identifiers - match on ANY:

```javascript
const identifiers = {
  primary: 'name',           // Always required
  alternates: [
    'website',               // betsson.com
    'linkedin',              // linkedin.com/company/betsson
    'twitter',               // x.com/betsson
    'youtube'                // youtube.com/@betsson
  ]
};
```

Deduplication handled in Step 2 (Validation/Dedupe), NOT in Step 1.

### Error UX

When CSV has errors, show all errors with 3 options:

1. **Continue with valid** — Import valid rows, skip errors
2. **Upload new CSV** — Show errors, let user fix and re-upload
3. **Fix inline** — Edit errors directly in UI

---

## URL/Data Output Schema

All discovery submodules output URLs with metadata:

```javascript
{
  url: string,
  source_category: string,             // "website", "news", "linkedin", etc.
  source_submodule: string,            // "sitemap", "rss_feeds", etc.
  project_id: string,
  found_at: timestamp,
  // Submodule-specific metadata:
  depth: number,                       // for sitemap
  snippet: string,                     // for search
  title: string,                       // for RSS
  pub_date: string,                    // for RSS
  // etc.
}
```

**Why track source:**
- Know what tool is working/not working
- Different URLs need different scrapers (LinkedIn ≠ YouTube ≠ Website)
- Next steps route based on URL type

---

## Templates

**Template = saved config, NOT input data**

Template saves:
- Which submodules active
- Option values per submodule
- Step-level settings (if any)

Template does NOT save:
- Input data (URLs, company names, CSVs)
- Results

User loads template → config pre-filled → user adds their data → runs.
Same template, different companies every time.

---

## Feedback Loops

**In Step 1 (Discovery):** Manual gut decision. User decides "enough or not" by feel.

**Later in pipeline (around Step 5, Step 8):** Automated quality check. If content insufficient, automatic routing back to Step 1 for more sources. Companies with too few sources are flagged/separated for rerun.

**For MVP:** User can run small batch first to test, then scale up. If results weak, go back manually and add more sources.

---

## MVP Scope

**MVP1b:** Website submodules only
- Sitemap
- Navigation
- Seed Expansion

**MVP1a:** Add PSE (News, Directories)

**MVP2:** Add LinkedIn, YouTube, expanded validation

**Full:** Everything, automated loops

---

## Code vs Supabase Split

**In Code:**
- Submodule definitions (schema, inputs, options, output type)
- Submodule execution logic
- UI rendering logic

**In Supabase:**
- Project config (which submodules enabled, option values chosen)
- Template config (saved combinations)
- Results (URLs, metadata, content)
- Step context (shared CSV data within step)
- Option defaults (tweakable without deploy)
- Step definitions (for flexibility)

---

## Inline Search (Deferred to v3)

Some submodules need data that other submodules could find (e.g., LinkedIn submodule needs LinkedIn URLs, Google Search could find them).

**MVP approach:** User provides data themselves. No inline "search to get input" functionality.

**v3 approach:** Submodule can offer search buttons ([Google] [AI Search]) that run a search and feed results back as input.

```
┌─────────────────────────────────────────────────────┐
│ LinkedIn Submodule                                  │
│                                                     │
│ LinkedIn URLs needed                                │
│                                                     │
│ No LinkedIn URLs found in project data.             │
│                                                     │
│ [Upload CSV]                                        │
│                                                     │
│ ─── v3 only ───────────────────────────────────     │
│ Or search for them:                                 │
│ [Google Search] [AI Search]                         │
└─────────────────────────────────────────────────────┘
```

---

## Submodule UI Pattern

**Two presentation levels (same schema, different visibility):**

**Level 1: Basic (default view)**
- Input field + [RUN] button only
- Options hidden but defaults pre-applied
- Works immediately for most users

**Level 2: Advanced (expandable)**
- [Advanced options ▼] toggle reveals all configurable options
- Power users can customize behavior
- Same underlying `inputs_required` and `options` schema

Both levels use identical submodule definition schema. The UI simply hides complexity until requested.

---

## Shared Entity Context API

### Purpose

Entities (companies, topics, persons) uploaded in one submodule are available to other submodules within the same step/run/project.

### Storage

```sql
-- Uses existing step_context table
step_context (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES pipeline_runs(id),
  step_index INTEGER NOT NULL,
  entities JSONB NOT NULL,           -- [{entity_name, website, linkedin, ...}]
  source_submodule TEXT,             -- which submodule uploaded
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(run_id, step_index)
)
```

### Write API (first upload in any submodule)

```javascript
// POST /api/runs/:runId/step-context
{
  step_index: 1,
  entities: [
    { entity_name: "Betsson", website: "https://betsson.com", linkedin: "/company/betsson" },
    { entity_name: "Evolution", website: "https://evolution.com" }
  ],
  source_submodule: "sitemap"
}
// Response: { id, entities_count: 2, columns: ["entity_name", "website", "linkedin"] }
```

**Behavior:** UPSERT by (run_id, step_index) — re-upload REPLACES existing data (no merge).

### Read API (subsequent submodules)

```javascript
// GET /api/runs/:runId/step-context?step_index=1
// Response:
{
  entities: [...],
  source_submodule: "sitemap",
  stats: {
    total: 6,
    columns: ["entity_name", "website", "linkedin", "youtube"],
    by_column: {
      entity_name: 6,  // all have this
      website: 6,
      linkedin: 4,     // 4 of 6 have linkedin
      youtube: 2
    }
  }
}
```

### Submodule UI Behavior

1. On submodule open → query step context
2. If found → Show banner: "Found 6 entities (4 have linkedin) from sitemap upload" + [Use these] [Upload different]
3. If not found → Show upload prompt
4. If user uploads → Write to step context, available to other submodules

### Master CSV Template

**Filename:** `entities_template.csv`

```csv
entity_name,website,linkedin,youtube,twitter,category
Betsson,https://betsson.com,https://linkedin.com/company/betsson,https://youtube.com/@betsson,https://twitter.com/betsson,Slots
Evolution,https://evolution.com,,,https://twitter.com/evolution,Live Casino
```

| Column | Required | Used By |
|--------|----------|---------|
| `entity_name` | Yes | All (identifier) |
| `website` | No | Sitemap, Navigation, Seed Expansion |
| `linkedin` | No | LinkedIn submodules |
| `youtube` | No | YouTube submodules |
| `twitter` | No | Twitter submodules |
| `category` | No | Metadata, filtering |

---

## MVP1b Submodule Specifications

### URL Output Schema (All Discovery Submodules)

```javascript
{
  url: string,
  source_category: string,             // "website", "news", "linkedin", etc.
  source_submodule: string,            // "sitemap", "navigation", "seed_expansion"
  run_id: string,
  run_entity_id: string,               // FK to run_entities table
  entity_type: string,                 // "company", "topic", "person" (from entity_snapshot)
  entity_name: string,                 // for display
  found_at: timestamp,

  // Submodule-specific metadata (nullable):
  nav_location: string | null,         // navigation: "header", "footer", "sidebar"
  seed_url: string | null,             // seed_expansion: which seed page found this
  sitemap_lastmod: string | null,      // sitemap: lastmod from sitemap.xml
}
```

**Note:** Deduplication happens in Step 2, not in Discovery. Duplicate URLs across submodules are expected and intentional (tracks which sources found what).

---

### Sitemap Submodule

**Purpose:** Parse sitemap.xml to find URLs for each entity's website.

**Input Required:** `website` column from entity data

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| Sitemap location | auto / custom | auto | Auto-detect at `/sitemap.xml`, `/sitemap_index.xml`, or specify URL |
| Include nested | boolean | true | Follow sitemap index to child sitemaps |

**Output:** URLs with `sitemap_lastmod` metadata (if available in sitemap)

**Error Contracts:**

| Error Code | Condition | Recoverable | Partial Results |
|------------|-----------|-------------|-----------------|
| `SITEMAP_NOT_FOUND` | No sitemap at expected locations | Yes | No |
| `SITEMAP_PARSE_ERROR` | Invalid XML or unexpected format | Yes | Possible |
| `SITEMAP_TIMEOUT` | Request exceeded 30s | Yes | No |
| `NO_WEBSITE_URL` | Entity missing `website` column | No | Skip entity |

**UI States:**

```
┌─────────────────────────────────────────────────────┐
│ ← Sitemap                                           │
│ Parse sitemap.xml to find URLs                      │
│                                                     │
│ Input data                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ✓ 6 entities loaded (from previous upload)      │ │
│ │ ✓ 6 have website (required)                     │ │
│ │                                                 │ │
│ │ [Use these]  [Upload different]                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [Advanced options ▼]                                │
│                                                     │
│ [RUN]                                               │
│                                                     │
│ ─────────────── after run ─────────────────────     │
│                                                     │
│ ✓ Run complete: 312 URLs found                      │
│ ⚠ 1 entity failed: SITEMAP_NOT_FOUND (BetCorp)      │
│                                                     │
│                        [SEE RESULTS]                │
│                                                     │
│ ─────────────── after viewing ─────────────────     │
│                                                     │
│ Results by entity:                                  │
│ • Betsson: 89 URLs                                  │
│ • Evolution: 124 URLs                               │
│ • LeoVegas: 67 URLs                                 │
│ • Kindred: 32 URLs                                  │
│ • BetCorp: ⚠ SITEMAP_NOT_FOUND                      │
│ • ...                                               │
│                                                     │
│                             [APPROVE]               │
└────────────────��────────────────────────────────────┘
```

---

### Navigation Submodule

**Purpose:** Extract links from site navigation (header, footer, menus) for each entity's website.

**Input Required:** `website` column from entity data

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| Scan areas | multi-select | header, footer | Which nav areas to scan |
| Follow dropdowns | boolean | true | Extract links inside dropdown menus |

**Output:** URLs with `nav_location` metadata ("header", "footer", "sidebar")

**Error Contracts:**

| Error Code | Condition | Recoverable | Partial Results |
|------------|-----------|-------------|-----------------|
| `PAGE_LOAD_ERROR` | Homepage returned 4xx/5xx or blocked | Yes | No |
| `NO_NAV_FOUND` | Could not identify navigation elements | Yes | No |
| `NAV_TIMEOUT` | Page load exceeded 30s | Yes | No |
| `NO_WEBSITE_URL` | Entity missing `website` column | No | Skip entity |

---

### Seed Expansion Submodule

**Purpose:** Start from seed URLs (base domain + common paths) and find internal links on those pages.

**Input Required:** `website` column from entity data

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| Same domain only | boolean | true | Only keep links on same domain |
| [Use common seeds] | button | — | Appends common paths to base domains |

**Depth:** Fixed at 1 for MVP (links on seed page only). Depth 2+ deferred to v2.

**Common Seeds (configurable in Supabase):**
```
/about, /about-us, /company
/products, /solutions, /services
/press, /news, /media
/blog, /insights, /resources
/careers, /jobs
/contact, /contact-us
```

**[Use Common Seeds] Behavior:**
1. For each entity with `website` value
2. Append each common seed path to base domain
3. Result: `["https://betsson.com/about", "https://betsson.com/products", ...]`
4. These become the seed URLs to crawl

**Output:** URLs with `seed_url` metadata (which seed page found this link)

**Error Contracts:**

| Error Code | Condition | Recoverable | Partial Results |
|------------|-----------|-------------|-----------------|
| `PAGE_LOAD_ERROR` | Seed URL returned 4xx/5xx | Yes | Yes (other seeds) |
| `NO_LINKS_FOUND` | Page has no internal links | Yes | Yes (other seeds) |
| `SEED_TIMEOUT` | Page load exceeded 30s | Yes | Yes (other seeds) |
| `NO_WEBSITE_URL` | Entity missing `website` column | No | Skip entity |

---

### Submodule Definition Examples (Schema Compliance)

```javascript
// Sitemap submodule definition
{
  id: "sitemap",
  name: "Sitemap",
  description: "Parse sitemap.xml to find URLs",
  category: "website",
  cost_tier: "cheap",

  inputs_required: [
    { name: "website", type: "url", label: "Website URL", description: "Entity's website (from CSV)" }
  ],
  inputs_optional: [],

  options: [
    { name: "sitemap_location", type: "select", values: ["auto", "custom"], default: "auto", description: "Auto-detect or specify URL" },
    { name: "include_nested", type: "boolean", values: [true, false], default: true, description: "Follow sitemap index" }
  ],

  output_type: "urls",
  output_schema: {
    url: "string",
    sitemap_lastmod: "string|null"
  },

  error_codes: ["SITEMAP_NOT_FOUND", "SITEMAP_PARSE_ERROR", "SITEMAP_TIMEOUT", "NO_WEBSITE_URL"]
}
```

---

## Next Steps for Claude Code

Implementation roadmap for MVP1b:

1. **Build submodule infrastructure**
   - Definition schema
   - Rendering logic
   - State management (pending → running → results → approved)

2. **Build step container infrastructure**
   - Step wrapper component
   - [APPROVE STEP] / [SKIP STEP] buttons
   - Track which submodules are approved

3. **Implement Step 0 (Project Start)**
   - Name input
   - Template selector (optional)
   - Parent project link (optional)

4. **Implement Step 1 (Discovery) with three Website submodules**
   - Sitemap: parse sitemap.xml
   - Navigation: extract nav links from homepage
   - Seed Expansion: expand known URL patterns

5. **Wire up Supabase**
   - Project config storage
   - Step context (shared CSV data)
   - Results storage (discovered URLs)

6. **Test full flow**
   - Step 0 → Step 1 → results in DB
   - Verify shared step context works
   - Verify approval flow works

---

## What Still Needs Speccing

1. **Step 2 (Validation/Dedupe)** — deferred
2. **Step 3+ (Scraping, etc.)** — deferred, also submodule-based
3. ~~**Individual submodule specs** for MVP1b~~ ✅ COMPLETE (see above)
4. **Project schema** (Supabase)
5. **Template schema** (Supabase)
6. **Data contracts between steps**

---

*Document created: 2026-01-28*
*Updated: 2026-01-29 — Corrected submodule flow, added step-level approval, Inline Search, Next Steps sections*
*Updated: 2026-01-29 — Added MVP1b Submodule Specifications (Sitemap, Navigation, Seed Expansion), Shared Entity Context API, Submodule UI Pattern, error contracts*
*Based on strategic discussion with Claude*
