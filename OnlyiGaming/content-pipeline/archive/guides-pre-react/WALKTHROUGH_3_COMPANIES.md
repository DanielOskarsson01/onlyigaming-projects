# Walkthrough: 3 Company Profiles Through the Pipeline

> **Purpose:** Trace Betsson, Evolution, and Yggdrasil through Steps 0–2, showing exactly what happens at every level (database, submodule interaction, UI). Based on Strategic Architecture v1.0 and Skeleton Spec v1.2. Written to expose gaps.
> **Format:** Change, correct, or question anything. This becomes the reference for how the tool actually works.

---

## Step 0: Project Start

### What this step does

Define what we're making. No computation, no fetching. Just: what content type, which entities, and any project-level settings.

---

### Level 1: What goes into the database

**User clicks "New Project" on the Dashboard.**

Skeleton creates a `projects` row:

```
projects:
  id: proj-001
  name: "iGaming Company Profiles — Batch 1"
  project_type: "company_profile"
  status: "active"
  config: {
    template: null,
    notes: "First batch, 3 companies for testing"
  }
```

**User clicks "Start Run."**

Skeleton creates a `pipeline_runs` row:

```
pipeline_runs:
  id: run-001
  project_id: proj-001
  status: "running"
  current_step: 0
  started_at: 2026-02-08T14:00:00Z
```

Skeleton creates 11 `pipeline_stages` rows (one per step, 0–10):

```
pipeline_stages:
  id: stage-0-001
  run_id: run-001
  step_index: 0
  step_name: "project_start"
  status: "active"
  input_data: null (first step, nothing before it)
  output_data: null (not completed yet)

  id: stage-1-001
  run_id: run-001
  step_index: 1
  step_name: "discovery"
  status: "pending"
  ...

  (stages 2–10 all "pending")
```

---

### Level 2: No submodules in Step 0

Step 0 has no submodules in v1. It's a project setup form built into the skeleton. The user enters entity data directly.

**The user uploads a CSV or enters entities manually:**

```csv
name,website,linkedin
Betsson,betsson.com,/company/betsson
Evolution,evolution.com,/company/evolution-ab
Yggdrasil,yggdrasil.com,/company/yggdrasil-gaming
```

Skeleton writes this to `step_context` for Step 0:

```
step_context:
  id: ctx-0-001
  run_id: run-001
  step_index: 0
  entities: [
    { "name": "Betsson", "website": "betsson.com", "linkedin": "/company/betsson" },
    { "name": "Evolution", "website": "evolution.com", "linkedin": "/company/evolution-ab" },
    { "name": "Yggdrasil", "website": "yggdrasil.com", "linkedin": "/company/yggdrasil-gaming" }
  ]
  source_submodule: "manual_entry"
```

---

### Level 3: What the user sees

**Dashboard:**
- List of projects (empty for first use)
- [+ New Project] button

**After clicking New Project:**
- Form: Project Name, Content Type (dropdown: company_profile, news_article, etc.)
- Entity input area: CSV upload or manual entry table
- The user types in the three companies or uploads a CSV
- Preview shows: "3 entities loaded: Betsson, Evolution, Yggdrasil"
- Columns detected: name, website, linkedin

**After clicking "Start Run":**
- Redirect to RunView for run-001
- Step navigation shows Step 0 as active, Steps 1–10 as locked

---

### Step 0 Approval

Step 0 doesn't have submodule-level approval. The user reviews the entity list and clicks [APPROVE STEP].

Skeleton writes:

```
pipeline_stages (stage-0-001):
  status: "completed"
  output_data: {
    entities: [
      { "name": "Betsson", "website": "betsson.com", "linkedin": "/company/betsson" },
      { "name": "Evolution", "website": "evolution.com", "linkedin": "/company/evolution-ab" },
      { "name": "Yggdrasil", "website": "yggdrasil.com", "linkedin": "/company/yggdrasil-gaming" }
    ]
  }
```

```
pipeline_runs (run-001):
  current_step: 1
```

```
pipeline_stages (stage-1-001):
  status: "active"
  input_data: {
    entities: [
      { "name": "Betsson", "website": "betsson.com", "linkedin": "/company/betsson" },
      { "name": "Evolution", "website": "evolution.com", "linkedin": "/company/evolution-ab" },
      { "name": "Yggdrasil", "website": "yggdrasil.com", "linkedin": "/company/yggdrasil-gaming" }
    ]
  }
```

```
decision_log:
  id: dec-001
  run_id: run-001
  step_index: 0
  submodule_id: null
  entity_id: null
  decision: "step_approved"
  reason: null
  context: { entity_count: 3, columns: ["name", "website", "linkedin"] }
```

**Step 0 → Step 1 transition complete.** Step 1 now has the entity list as input.

---

## Step 1: Discovery

### What this step does

Find candidate URLs for each entity. Multiple submodules each discover URLs through different methods. The user runs whichever submodules they want, reviews results from each, and approves the step to aggregate all approved URLs.

### Available submodules (from auto-discovery)

The moduleLoader found these manifests in `modules/step-1-discovery/`:

1. **Sitemap** — Parses XML sitemaps. Cost: cheap. Requires: website.
2. **Navigation** — Crawls top-level navigation links. Cost: cheap. Requires: website.
3. **Seed Expansion** — Takes known URLs and expands to related pages. Cost: medium. Requires: website.

---

### First submodule: Sitemap

#### Level 3: What the user sees

**Step 1 is now active.** The Step Workspace shows three SubmoduleCards:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 🌐 Sitemap      │  │ 🌐 Navigation   │  │ 🌐 Seed Expand  │
│ Parses XML      │  │ Crawls top nav  │  │ Expands from    │
│ sitemaps        │  │ links           │  │ known URLs      │
│ Cost: cheap     │  │ Cost: cheap     │  │ Cost: medium    │
│ Status: idle    │  │ Status: idle    │  │ Status: idle    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**User clicks the Sitemap card.** SubmodulePanel opens with three accordions:

**Accordion 1 — Input (expanded by default):**

Skeleton checks: Does Step 1 have input_data from Step 0? Yes — 3 entities.
Skeleton checks: Does the Sitemap manifest require any columns? Yes — `["website"]`.
Skeleton checks: Do the entities have a `website` column? Yes.

Display:
```
Input: 3 entities from Step 0
  ✓ Required column "website" available

  Betsson          betsson.com
  Evolution        evolution.com
  Yggdrasil        yggdrasil.com

  [Upload different data]
```

No step_context exists yet for Step 1 (this is the first submodule to run). The entities come directly from Step 0's output.

**Accordion 2 — Options (collapsed, click to expand):**

Skeleton reads the Sitemap manifest's `options` array and renders:

```
Maximum URLs        [1000]          (number input, min: 1, max: 50000)
Include nested      [✓]             (toggle, default: true)
URL filter          [All ▾]         (dropdown: All, Pages Only, Blog Only, Custom Regex)
```

User changes "Maximum URLs" to 500. Leaves everything else at defaults.

**Accordion 3 — Results (collapsed, empty — nothing run yet):**

```
No results yet. Configure options and click [RUN].
```

**User clicks [RUN].**

---

#### Level 1: What goes into the database

Skeleton creates a `submodule_runs` row:

```
submodule_runs:
  id: smr-001
  stage_id: stage-1-001
  run_id: run-001
  submodule_id: "sitemap"
  status: "pending"
  options: { "max_urls": 500, "include_nested": true, "url_filter": "all" }
  input_data: {
    entities: [
      { "name": "Betsson", "website": "betsson.com" },
      { "name": "Evolution", "website": "evolution.com" },
      { "name": "Yggdrasil", "website": "yggdrasil.com" }
    ],
    run_id: "run-001",
    step_index: 1,
    submodule_id: "sitemap"
  }
  output_data: null
  approved_items: null
  error: null
  logs: []
  started_at: null
  completed_at: null
```

Skeleton creates a BullMQ job:

```
Queue: "pipeline-stages"
Priority: 1 (cheap)
Job data: {
  run_id: "run-001",
  stage_id: "stage-1-001",
  submodule_id: "sitemap",
  input: { entities: [...] },
  options: { max_urls: 500, include_nested: true, url_filter: "all" },
  submodule_run_id: "smr-001"
}
```

---

#### The worker executes

stageWorker picks up the job:

1. Looks up "sitemap" in the module registry → found at `modules/step-1-discovery/sitemap/`
2. Loads `execute.js`
3. Builds the tools object (logger writes to smr-001.logs, http wraps fetch with rate limiting, progress updates smr-001)
4. Updates `submodule_runs` smr-001: status → "running", started_at → now

5. Calls:
```
execute(
  { entities: [Betsson, Evolution, Yggdrasil], run_id: "run-001", step_index: 1, submodule_id: "sitemap" },
  { max_urls: 500, include_nested: true, url_filter: "all" },
  tools
)
```

6. The sitemap submodule does its work:
   - For Betsson: fetches betsson.com/sitemap.xml → follows nested sitemaps → finds 342 URLs → truncates to 500 limit (already under)
   - For Evolution: fetches evolution.com/sitemap.xml → finds 187 URLs
   - For Yggdrasil: fetches yggdrasil.com/sitemap.xml → finds 94 URLs
   - Logs progress: tools.progress.update(1, 3, "Betsson: 342 URLs"), tools.progress.update(2, 3, "Evolution: 187 URLs"), etc.

7. Submodule returns:

```json
{
  "results": [
    {
      "entity_name": "Betsson",
      "items": [
        { "url": "https://betsson.com/about", "source_category": "page", "depth": 1, "last_modified": "2026-01-15" },
        { "url": "https://betsson.com/products", "source_category": "page", "depth": 1 },
        { "url": "https://betsson.com/blog/2026-strategy", "source_category": "blog", "depth": 2 },
        ... (342 items total)
      ],
      "meta": { "total_found": 342, "filtered": 0, "errors": 0, "sitemap_count": 3 }
    },
    {
      "entity_name": "Evolution",
      "items": [
        { "url": "https://evolution.com/our-games", "source_category": "page", "depth": 1 },
        { "url": "https://evolution.com/about-us", "source_category": "page", "depth": 1 },
        ... (187 items total)
      ],
      "meta": { "total_found": 187, "filtered": 0, "errors": 0, "sitemap_count": 1 }
    },
    {
      "entity_name": "Yggdrasil",
      "items": [
        { "url": "https://yggdrasil.com/games", "source_category": "page", "depth": 1 },
        ... (94 items total)
      ],
      "meta": { "total_found": 94, "filtered": 0, "errors": 0, "sitemap_count": 1 }
    }
  ],
  "summary": {
    "total_entities": 3,
    "total_items": 623,
    "errors": []
  }
}
```

8. Worker writes to database:

```
submodule_runs (smr-001):
  status: "completed"
  output_data: { results: [...], summary: {...} }
  logs: [
    { "level": "info", "message": "Fetching sitemap for betsson.com", "timestamp": "..." },
    { "level": "info", "message": "Found 3 nested sitemaps for betsson.com", "timestamp": "..." },
    { "level": "info", "message": "Betsson: 342 URLs discovered", "timestamp": "..." },
    { "level": "info", "message": "Evolution: 187 URLs discovered", "timestamp": "..." },
    { "level": "info", "message": "Yggdrasil: 94 URLs discovered", "timestamp": "..." }
  ]
  completed_at: 2026-02-08T14:05:23Z
```

---

#### Level 3: What the user sees after execution

The SubmoduleCard updates:

```
┌─────────────────┐
│ 🌐 Sitemap      │
│ 623 URLs found  │
│ Cost: cheap     │
│ Status: done ✓  │
└─────────────────┘
```

The Results accordion auto-expands. The UI shows a ResultsTable grouped by entity:

```
── Betsson (342 URLs) ──────────────────────────────────────────────
│ Status │ URL                              │ Category │ Depth │ Modified   │
│   ○    │ betsson.com/about                │ page     │ 1     │ 2026-01-15 │
│   ○    │ betsson.com/products             │ page     │ 1     │            │
│   ○    │ betsson.com/blog/2026-strategy   │ blog     │ 2     │ 2026-02-01 │
│   ○    │ betsson.com/careers              │ page     │ 1     │            │
│   ○    │ betsson.com/tag/casino           │ tag      │ 2     │            │
│   ... (337 more)

── Evolution (187 URLs) ────────────────────────────────────────────
│   ○    │ evolution.com/our-games          │ page     │ 1     │            │
│   ○    │ evolution.com/about-us           │ page     │ 1     │            │
│   ... (185 more)

── Yggdrasil (94 URLs) ─────────────────────────────────────────────
│   ○    │ yggdrasil.com/games             │ page     │ 1     │            │
│   ... (93 more)

623 items found. 0 approved. 0 rejected.

[APPROVE ALL]  [REJECT ALL]  [TRY AGAIN]  [DOWNLOAD CSV]
```

---

#### Level 3: User reviews and approves

The user wants to keep useful pages but reject tag pages and blog posts for now.

**Action 1: Filter the table.**
User types `/tag/` in the URL filter → table shows only URLs containing `/tag/` (e.g., 47 URLs across all entities).
User clicks [REJECT ALL] → 47 items rejected.

**Action 2: Filter again.**
User clears filter, types `/blog/` → table shows blog URLs (e.g., 28 URLs).
User scans them, approves 5 that look relevant, rejects the rest.

**Action 3: Approve the rest.**
User clears filter → sees remaining pending items (548 items).
User clicks [APPROVE ALL] → 548 items approved.

**Final tally: 553 approved, 70 rejected.**

---

#### Level 1: What happens in the database during approval

Each approve/reject action writes to `submodule_runs` and `decision_log`:

```
submodule_runs (smr-001):
  status: "approved"
  approved_items: {
    results: [
      {
        entity_name: "Betsson",
        items: [ ...305 approved URLs... ]
      },
      {
        entity_name: "Evolution",
        items: [ ...168 approved URLs... ]
      },
      {
        entity_name: "Yggdrasil",
        items: [ ...80 approved URLs... ]
      }
    ]
  }
```

Decision log gets entries for significant actions:

```
decision_log:
  - decision: "rejected", entity_id: null, context: { filter: "/tag/", count: 47, submodule: "sitemap" }
  - decision: "rejected", entity_id: null, context: { filter: "/blog/", count: 23, submodule: "sitemap" }
  - decision: "approved", entity_id: null, context: { filter: "remaining", count: 548, submodule: "sitemap" }
```

---

### Second submodule: Navigation

#### Level 3: What the user sees

User goes back to the SubmoduleCard grid. Clicks the Navigation card. SubmodulePanel opens.

**Accordion 1 — Input:**

Skeleton checks: Does Step 1 have input_data? Yes — 3 entities from Step 0.
Skeleton checks: Does step_context exist for Step 1? No — Sitemap didn't write to step_context because the entities came from Step 0's output, not from an upload within Step 1.

The Navigation submodule requires `["website"]` — available in the input entities.

```
Input: 3 entities from Step 0
  ✓ Required column "website" available

  Betsson          betsson.com
  Evolution        evolution.com
  Yggdrasil        yggdrasil.com
```

**Accordion 2 — Options:**

Navigation manifest has different options:

```
Max depth           [2]             (number, how many clicks deep to crawl)
Include footer      [✓]             (toggle, crawl footer links too)
Ignore external     [✓]             (toggle, skip links to other domains)
```

User leaves defaults. Clicks [RUN].

---

#### Level 1: Database + BullMQ

```
submodule_runs:
  id: smr-002
  stage_id: stage-1-001
  run_id: run-001
  submodule_id: "navigation"
  status: "pending"
  options: { "max_depth": 2, "include_footer": true, "ignore_external": true }
  input_data: { entities: [...same 3 companies...] }
```

BullMQ job created, priority 1 (cheap). Worker picks it up, executes.

---

#### The worker executes

Navigation submodule crawls the homepage of each company, follows nav links up to depth 2:

- Betsson: finds 45 navigation URLs (about, products, investors, careers, contact, plus second-level pages)
- Evolution: finds 38 navigation URLs
- Yggdrasil: finds 22 navigation URLs

Returns:

```json
{
  "results": [
    {
      "entity_name": "Betsson",
      "items": [
        { "url": "https://betsson.com/about", "source_category": "nav", "depth": 1 },
        { "url": "https://betsson.com/about/management", "source_category": "nav", "depth": 2 },
        { "url": "https://betsson.com/investors", "source_category": "nav", "depth": 1 },
        ... (45 total)
      ],
      "meta": { "total_found": 45, "errors": 0 }
    },
    {
      "entity_name": "Evolution",
      "items": [ ... 38 URLs ... ],
      "meta": { "total_found": 38, "errors": 0 }
    },
    {
      "entity_name": "Yggdrasil",
      "items": [ ... 22 URLs ... ],
      "meta": { "total_found": 22, "errors": 0 }
    }
  ],
  "summary": { "total_entities": 3, "total_items": 105, "errors": [] }
}
```

**Note the overlap:** `betsson.com/about` appears in BOTH Sitemap results and Navigation results. This is expected. Deduplication happens at step aggregation, not here.

---

#### Level 3: User reviews Navigation results

105 URLs. Much smaller set — navigation links are high quality. User scans and approves almost everything.

```
105 items found. 98 approved. 7 rejected.
```

Rejected: a few footer links (privacy policy, cookie policy, terms of service — not useful for company profiles).

Submodule run smr-002 → status: "approved", approved_items contains 98 URLs.

---

### Third submodule: Seed Expansion (user decides to skip)

The user looks at the Seed Expansion card. It's medium cost. The user already has 553 + 98 = 651 URLs from Sitemap and Navigation. For 3 companies, that's plenty.

**User does NOT run Seed Expansion.** It stays in "idle" status. This is fine — the spec says "the user decides which submodules to run."

---

### Step 1 Approval — Aggregation

#### Level 3: What the user sees

At the bottom of the Step Workspace:

```
Step 1: Discovery
  Sitemap:        553 approved URLs  ✓
  Navigation:      98 approved URLs  ✓
  Seed Expansion:  (not run)

  [APPROVE STEP]  [SKIP STEP]
```

User clicks [APPROVE STEP].

---

#### Level 2: Aggregation logic

Skeleton collects approved_items from all approved submodule_runs in Step 1:

1. smr-001 (Sitemap): 553 approved URLs
2. smr-002 (Navigation): 98 approved URLs

**Deduplication using item_key:** Both manifests declare `"item_key": "url"`. The skeleton merges by URL:

- `betsson.com/about` appears in both Sitemap (approved) and Navigation (approved). Skeleton keeps ONE entry. Which version? The first one encountered (Sitemap's), since it has more metadata (last_modified, depth from sitemap). Navigation's duplicate is dropped.
- `betsson.com/investors` appears only in Navigation. Kept.
- Most Sitemap URLs don't appear in Navigation. Kept.

**Result after dedup:** 553 + 98 = 651 total, minus ~30 overlapping URLs = ~621 unique URLs.

---

#### Level 1: What goes into the database

```
pipeline_stages (stage-1-001):
  status: "completed"
  output_data: {
    entities: [
      {
        entity_name: "Betsson",
        urls: [
          { "url": "https://betsson.com/about", "source": "sitemap", "source_category": "page", "depth": 1 },
          { "url": "https://betsson.com/about/management", "source": "navigation", "source_category": "nav", "depth": 2 },
          ... (~290 unique URLs for Betsson)
        ]
      },
      {
        entity_name: "Evolution",
        urls: [ ... (~198 unique URLs) ... ]
      },
      {
        entity_name: "Yggdrasil",
        urls: [ ... (~103 unique URLs) ... ]
      }
    ],
    summary: {
      total_entities: 3,
      total_urls: 621,
      sources: ["sitemap", "navigation"],
      deduplicated: 30
    }
  }
```

```
pipeline_runs (run-001):
  current_step: 2
```

```
pipeline_stages (stage-2-001):
  status: "active"
  input_data: (same as stage-1-001.output_data)
```

```
decision_log:
  - decision: "step_approved"
    step_index: 1
    context: {
      submodules_approved: ["sitemap", "navigation"],
      submodules_skipped: ["seed-expansion"],
      total_urls_before_dedup: 651,
      total_urls_after_dedup: 621,
      per_entity: { "Betsson": 290, "Evolution": 198, "Yggdrasil": 103 }
    }
```

**Step 1 → Step 2 transition complete.**

---

## Step 2: Pre-Scrape Validation

### What this step does

Filter the 621 URLs down to the ones worth scraping. Cheap filtering to avoid expensive fetching.

### Available submodules

1. **URL Pattern Filter** — Applies regex rules to remove junk URLs. Cost: cheap. Requires: urls in input.

(In v1, this is the only validation submodule. Future: robots.txt checker, duplicate detector, HTTP head checker.)

---

### Level 3: What the user sees

Step 2 is active. One SubmoduleCard:

```
┌──────────────────────┐
│ 🔍 URL Pattern Filter│
│ Regex-based URL      │
│ filtering            │
│ Cost: cheap          │
│ Status: idle         │
└──────────────────────┘
```

User clicks it. SubmodulePanel opens.

**Accordion 1 — Input:**

```
Input: 621 URLs across 3 entities from Step 1
  Betsson:    290 URLs
  Evolution:  198 URLs
  Yggdrasil:  103 URLs
```

No upload needed — data comes from Step 1's output.

**Accordion 2 — Options:**

URL Pattern Filter manifest options:

```
Reject patterns     [textarea, multiline]
  Default: "/tag/\n/category/\n/author/\n/page/\\d+\n/wp-json/\n/feed/"

Keep patterns       [textarea, multiline]
  Default: "" (empty = keep everything not rejected)

Min path depth      [1]             (number — reject URLs with fewer path segments)
Max path depth      [5]             (number — reject URLs with too many path segments)
```

User reviews the default reject patterns. Adds `/cdn-cgi/` and `/assets/`. Clicks [RUN].

---

### The worker executes

URL Pattern Filter runs through 621 URLs applying regex patterns:

- Betsson 290 → rejects 41 (tag pages that slipped through, pagination URLs, asset paths) → keeps 249
- Evolution 198 → rejects 22 → keeps 176
- Yggdrasil 103 → rejects 8 → keeps 95

Returns:

```json
{
  "results": [
    {
      "entity_name": "Betsson",
      "items": [
        { "url": "https://betsson.com/about", "status": "kept", "reason": "passed all filters" },
        { "url": "https://betsson.com/page/3", "status": "rejected", "reason": "matched /page/\\d+" },
        { "url": "https://betsson.com/cdn-cgi/scripts", "status": "rejected", "reason": "matched /cdn-cgi/" },
        ... (290 items total — both kept and rejected)
      ],
      "meta": { "total": 290, "kept": 249, "rejected": 41 }
    },
    ...
  ],
  "summary": { "total_entities": 3, "total_items": 621, "kept": 520, "rejected": 71 }
}
```

**Important:** The submodule returns ALL items (kept and rejected) with their status, so the user can review what was filtered and override if needed.

---

### Level 3: User reviews validation results

```
── Betsson (290 URLs — 249 kept, 41 rejected) ─────────────────────
│ Status   │ URL                              │ Reason              │
│ ✓ kept   │ betsson.com/about                │ passed all filters  │
│ ✓ kept   │ betsson.com/products             │ passed all filters  │
│ ✗ reject │ betsson.com/page/3               │ matched /page/\d+   │
│ ✗ reject │ betsson.com/cdn-cgi/scripts      │ matched /cdn-cgi/   │
│ ✓ kept   │ betsson.com/investors            │ passed all filters  │
│ ✗ reject │ betsson.com/tag/slots            │ matched /tag/       │
│ ... 

Filter: [status = rejected ▾]   →  shows 41 rejected URLs
```

The user scans the rejected URLs. All look correct — junk. One URL was wrongly rejected: `betsson.com/our-pages/about-us` matched `/page/` in the path. User manually approves that one.

User filters to "kept" → 249 URLs → scans a few, looks fine → [APPROVE ALL].

**Final: 520 kept URLs approved + 1 rescued = 521. 70 rejected.**

---

### Step 2 Approval

```
Step 2: Pre-Scrape Validation
  URL Pattern Filter:  521 approved URLs  ✓

  [APPROVE STEP]  [SKIP STEP]
```

User clicks [APPROVE STEP].

---

### Level 1: Database writes

```
pipeline_stages (stage-2-001):
  status: "completed"
  output_data: {
    entities: [
      {
        entity_name: "Betsson",
        urls: [ ...250 validated URLs... ]
      },
      {
        entity_name: "Evolution",
        urls: [ ...176 validated URLs... ]
      },
      {
        entity_name: "Yggdrasil",
        urls: [ ...95 validated URLs... ]
      }
    ],
    summary: {
      total_entities: 3,
      total_urls: 521,
      filtered_out: 100,
      filter_rules_applied: ["/tag/", "/category/", "/author/", "/page/\\d+", "/wp-json/", "/feed/", "/cdn-cgi/", "/assets/"]
    }
  }
```

```
pipeline_runs (run-001):
  current_step: 3
```

```
pipeline_stages (stage-3-001):
  status: "active"
  input_data: (same as stage-2-001.output_data — 521 validated URLs ready for scraping)
```

```
decision_log:
  - decision: "step_approved"
    step_index: 2
    context: {
      submodules_approved: ["url-pattern-filter"],
      input_urls: 621,
      output_urls: 521,
      filtered: 100,
      manually_rescued: 1,
      rescue_detail: { url: "betsson.com/our-pages/about-us", original_reject_reason: "matched /page/" }
    }
```

**Step 2 → Step 3 transition complete.** 521 validated URLs are ready for scraping.

---

## What This Walkthrough Exposed

### Questions to resolve:

1. **Step 0 entity data vs step_context:** Step 0 writes entities to both `pipeline_stages.output_data` AND `step_context`. Or just output_data? In Step 1, the submodules get entities from `pipeline_stages.input_data` (Level 1 flow). When does step_context get involved — only when a user uploads NEW data within a step?

2. **Aggregation output shape:** When Step 1 aggregates, the output_data shape changes from "entity objects with name/website/linkedin" to "entity objects with name + urls array." Each step transforms the data shape. Is this correct, or should there be a consistent wrapper format?

3. **Validation submodule returning all items:** URL Pattern Filter returns both kept and rejected items so the user can review. But the item_key dedup during step approval only looks at approved_items. Does the skeleton auto-approve "kept" items and auto-reject "rejected" items? Or does the user have to manually approve all 521 kept items?

4. **Decision log granularity:** When the user bulk-rejects 47 URLs with the `/tag/` filter, is that one decision_log entry or 47? The spec says "every human judgment" but logging 47 individual entries for one filter action seems excessive. One entry per bulk action with the filter context makes more sense.

5. **Dedup conflict resolution:** When Sitemap and Navigation both find `betsson.com/about`, the walkthrough says "keep the Sitemap version because it has more metadata." But the spec doesn't define this rule. Should it be: first encountered wins? Most metadata wins? Most recent submodule wins? Merge fields from both?
