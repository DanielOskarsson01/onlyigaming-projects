# OnlyiGaming Content Creation Tool — Skeleton Specification

> **Version:** 1.2 — February 7, 2026 (v1.1: item_key dedup, bulk filter-approve, queue priority, logger destination. v1.2: clarified shared context sequencing, output_type as rendering switch, two-repo AI containment rationale, no-ORM meaning)
> **Purpose:** This is the technical blueprint for the frozen skeleton — the infrastructure that submodules plug into. It specifies what to build, what decisions have been made, and what contracts must be honored. Detailed enough to build from. No actual code.
> **Governed by:** Strategic Architecture (Document 1). If anything here conflicts with strategic principles, Strategic Architecture wins.
> **Living document:** This document updates as the project encounters new challenges. Implementation status, MVP phasing, and schema evolve. The contracts and mechanics stabilize over time but are not untouchable.

---

## Part 1: Tech Stack — Committed Choices

These are deliberate choices, not inherited defaults. Each was chosen for a reason.

| Layer | Technology | Why This |
|-------|------------|----------|
| **Server** | Hetzner CX22 VPS (2 vCPU, 4GB RAM, Ubuntu 24.04) | Cheap, reliable, full control. No vendor lock-in. Enough for a content creation tool that runs batch jobs, not real-time traffic. |
| **Database** | Supabase (PostgreSQL) | Hosted Postgres with a good dashboard, API layer, and real-time subscriptions. Eliminates database administration burden. The data model is pure PostgreSQL — nothing Supabase-specific in the schema. Could migrate to any Postgres host. |
| **Job Queue** | Redis + BullMQ | Industry-standard Node.js job queue. Reliable, well-documented, handles retries and concurrency. Redis is the backing store — simple, fast, already running on Hetzner. |
| **Runtime** | Node.js 20 LTS | Stable, long-term support. The entire backend (API server, workers, submodule execution) runs on Node.js. |
| **API** | Express.js | Minimal HTTP server. Routes map to skeleton operations (create run, execute submodule, approve result, finalize step). No framework magic. |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS | React for component architecture and state management. TypeScript for catching bugs before runtime. Vite for fast development builds. Tailwind for utility-first styling without a design system dependency. |
| **State Management** | TanStack Query (server state) + React hooks (UI state) | Server state (runs, results, step data) managed by TanStack Query — handles caching, refetching, background sync. UI state (which panel is open, which tab is active) lives in React hooks. No global state store unless proven necessary. |
| **Tables** | TanStack Table | Headless table library. Handles sorting, filtering, pagination for result tables without imposing UI decisions. |

### What's NOT in the stack and why

- **No Docker** — Adds complexity for a single-server deployment. PM2 manages Node.js processes. Revisit when the tool needs multi-server or reproducible environments.
- **No GraphQL** — REST endpoints are simpler for the operations this tool performs. Every API call is either "get data for this step" or "write a decision." GraphQL's flexibility isn't needed.
- **No SSR** — The tool is an internal application, not a public website. Client-side React is fine.
- **No ORM** — Direct Supabase client calls. The data model is simple enough that an ORM adds abstraction without reducing complexity. **Clarification:** The Supabase JS client is a thin HTTP wrapper over PostgREST, not an ORM. "No ORM" means no Prisma schemas, no migration files, no model definitions, no generated types sitting between us and the database. The Supabase client is essentially `fetch` with auth. If we ever migrate to raw PostgreSQL, replacing `supabase.from('projects').select()` with SQL queries is a find-and-replace job, not an architectural rewrite. This is a deliberate choice to stay close to the data, not a contradiction.

---

## Part 2: Two-Repo Split

This is the physical enforcement mechanism described in Strategic Architecture Part 8. Two separate repositories, two separate concerns.

**Why not a monorepo?** The two-repo split is not about CI/CD convenience or developer workflow — it's about **AI assistant containment**. When an AI coding assistant (Claude Code, Cursor, Copilot) is debugging a submodule, it will follow imports, read related files, and "helpfully" fix things along the way. In a monorepo, even with ESLint rules or package boundaries, the AI can still see and modify infrastructure files. ESLint rules don't help when an AI assistant decides to "fix" the database connection while debugging a scraper. Physical repo separation means the modules repo literally does not contain infrastructure code — there's nothing for the AI to accidentally break. This is a constraint designed for AI-assisted development, not human-only workflows.

### Repo 1: Skeleton (Frozen After Build)

Everything that submodules plug into. Once working, rarely modified.

```
skeleton/
├── server/
│   ├── index.js                    # Express server, CORS, middleware
│   ├── routes/
│   │   ├── projects.js             # Create/list/update projects
│   │   ├── runs.js                 # Create/manage pipeline runs
│   │   ├── steps.js                # Step operations, finalize, skip
│   │   ├── submodules.js           # Execute, approve, reject submodule runs
│   │   └── context.js              # Shared step context operations
│   ├── services/
│   │   ├── db.js                   # Supabase client (single connection point)
│   │   ├── queue.js                # BullMQ queue setup
│   │   ├── moduleLoader.js         # Auto-discovery and loading of submodules
│   │   ├── orchestrator.js         # Run lifecycle (create, advance, complete)
│   │   └── decisionLog.js          # Decision logging service
│   └── workers/
│       └── stageWorker.js          # BullMQ consumer — loads and executes submodules
│
├── client/
│   ├── src/
│   │   ├── App.tsx                 # Root layout + routing
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Project list, create new
│   │   │   └── RunView.tsx         # Active run — step navigation + submodule panels
│   │   ├── components/
│   │   │   ├── StepContainer.tsx   # Generic step shell (any step, any submodules)
│   │   │   ├── SubmodulePanel.tsx  # Three-accordion pane (input, options, results)
│   │   │   ├── SubmoduleCard.tsx   # Card in step grid (status, count, open)
│   │   │   ├── ResultsTable.tsx    # Generic results table with approval per row
│   │   │   ├── OptionRenderer.tsx  # Renders option fields from manifest declarations
│   │   │   ├── InputLoader.tsx     # Handles CSV upload, shared context, prompting
│   │   │   └── ApprovalBar.tsx     # Approve/reject/re-run controls
│   │   ├── hooks/
│   │   │   ├── useSubmoduleRun.ts  # Execute submodule, track progress, get results
│   │   │   ├── useStepData.ts      # Load step context, entity data, previous output
│   │   │   └── useApproval.ts      # Approve/reject items, track approval state
│   │   ├── api/
│   │   │   └── client.ts           # API wrapper — all backend calls go through here
│   │   └── types/
│   │       └── index.ts            # Shared TypeScript types
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── sql/
│   └── schema.sql                  # Full database schema (source of truth)
│
├── package.json
└── README.md
```

### Repo 2: Modules (Active Development)

Individual submodule folders. Each is self-contained.

```
modules/
├── step-1-discovery/
│   ├── sitemap/
│   │   ├── manifest.json
│   │   └── execute.js
│   ├── navigation/
│   │   ├── manifest.json
│   │   └── execute.js
│   └── seed-expansion/
│       ├── manifest.json
│       └── execute.js
│
├── step-2-validation/
│   └── url-pattern-filter/
│       ├── manifest.json
│       └── execute.js
│
├── step-3-scraping/
│   └── http-scraper/
│       ├── manifest.json
│       └── execute.js
│
├── step-5-generation/
│   └── profile-generator/
│       ├── manifest.json
│       └── execute.js
│
├── step-9-distribution/
│   └── strapi-push/
│       ├── manifest.json
│       └── execute.js
│
└── README.md
```

### How they connect

Repo 1 needs to know where Repo 2 lives. One configuration value:

```
MODULES_PATH=/path/to/modules
```

The skeleton's moduleLoader scans this path at startup, reads every manifest.json, and registers available submodules. When a submodule is executed, the skeleton loads its execute.js, passes input/options/tools, and captures the result.

During development, the modules path points to a local folder. In production, it points to where the modules repo is deployed on Hetzner. The connection between repos is a filesystem path — nothing more complex.

### Cross-boundary changes

When a feature genuinely requires changes to both skeleton and modules (estimated 1-2 times per month):

1. Make the skeleton change in Repo 1 first
2. Test that existing modules still work (the skeleton change should be backwards-compatible)
3. Make the module change in Repo 2
4. Test end-to-end

This takes roughly 30 minutes of extra coordination. Acceptable trade-off against the hours lost to accidental infrastructure regressions.

---

## Part 3: Infrastructure Detail

### Hetzner Server

- **Type:** CX22 — 2 vCPU, 4GB RAM, 40GB disk
- **IP:** 188.245.110.34
- **OS:** Ubuntu 24.04.3 LTS
- **Node.js:** 20.20.0
- **Process Manager:** PM2 (runs Express API and BullMQ workers)
- **SSH:** `ssh hetzner` (key-based authentication)
- **Project path:** `/opt/content-pipeline/`

PM2 manages two processes:
- `content-pipeline-api` — Express server on port 3000
- `content-pipeline-worker` — BullMQ worker that processes queued jobs

### Redis

Runs on Hetzner alongside the application.

- **Bind:** 127.0.0.1 (local only — not exposed to the internet)
- **Port:** 6379
- **Persistence:** RDB snapshots (save 900 1)

Redis serves one purpose: backing store for BullMQ job queues. No caching, no pub/sub, no session storage. If Redis needs to restart, BullMQ handles job recovery.

### Supabase

- **Project:** fevxvwqjhndetktujeuu
- **Dashboard:** https://supabase.com/dashboard/project/fevxvwqjhndetktujeuu
- **Connection:** Via Supabase JS client (`@supabase/supabase-js`), not direct PostgreSQL

The application connects to Supabase through its JavaScript client library. All database operations go through a single `db.js` service file in the skeleton. No other file imports the Supabase client. This is the primary protection against database coupling — if submodules can't import the db service, they can't write to the database.

### Local Development

- **Express API:** Port 3000
- **React Dev Server:** Port 5173 (Vite, proxies /api to port 3000)
- **Access the app at:** http://localhost:5173

Single command: `npm run dev` starts both the API server and the React dev server.

---

## Part 4: Database Schema

Supabase PostgreSQL. Schema is in `sql/schema.sql` and is the source of truth for table structure.

### Core Tables

**projects** — A batch of work. "100 iGaming company profiles" is a project.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| name | TEXT | User-defined project name |
| project_type | TEXT | Content type discriminator — "company_profile", "news_article", etc. |
| status | TEXT | "active", "completed", "archived" |
| config | JSONB | Project-level settings, template reference, entity list |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**pipeline_runs** — One execution of a project through the 11-step sequence.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| status | TEXT | "running", "completed", "failed", "paused" |
| current_step | INTEGER | Which step the run is currently on (0-10) |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | Null until run completes |

**pipeline_stages** — One step's data within a run.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| run_id | UUID (FK → pipeline_runs) | |
| step_index | INTEGER | 0-10 |
| step_name | TEXT | "project_start", "discovery", etc. |
| status | TEXT | "pending", "active", "completed", "skipped" |
| input_data | JSONB | Data received from previous step |
| output_data | JSONB | Approved results from this step (becomes next step's input) |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |

**submodule_runs** — One execution of one submodule within a step.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| stage_id | UUID (FK → pipeline_stages) | |
| run_id | UUID (FK → pipeline_runs) | |
| submodule_id | TEXT | Matches manifest id — "sitemap", "navigation", etc. |
| status | TEXT | "pending", "running", "completed", "failed", "approved", "rejected" |
| options | JSONB | Option values the user configured for this run |
| input_data | JSONB | What was fed to the submodule |
| output_data | JSONB | Raw results from execute() |
| approved_items | JSONB | Subset of results the user approved |
| error | TEXT | Error message if execution failed |
| logs | JSONB | Array of {level, message, timestamp} from tools.logger during execution |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |

**step_context** — Shared data within a step (the CSV sharing mechanism).

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| run_id | UUID (FK → pipeline_runs) | |
| step_index | INTEGER | |
| entities | JSONB | Parsed entity data — array of objects with columns as keys |
| source_submodule | TEXT | Which submodule uploaded the data |
| created_at | TIMESTAMPTZ | |

Unique constraint on (run_id, step_index) — one context per step per run.

**decision_log** — Every human judgment recorded.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| run_id | UUID (FK → pipeline_runs) | |
| step_index | INTEGER | |
| submodule_id | TEXT | |
| entity_id | TEXT | Which entity this decision was about |
| decision | TEXT | "approved", "rejected", "re-run", "skipped", "rerouted" |
| reason | TEXT | Optional — why the user made this decision |
| context | JSONB | Snapshot of relevant data at decision time |
| decided_at | TIMESTAMPTZ | |

### Content Library Tables (Platform Integration)

These tables connect the Content Creation Tool to the broader OnlyiGaming platform.

**content_items** — Universal content storage.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| content_type | TEXT | Discriminator: "scraped_page", "entity", "generated_article", etc. |
| source_url | TEXT (UNIQUE) | For deduplication — same URL never scraped twice |
| content | JSONB | The actual content. Nullable (nulled after retention purge for filtered items) |
| status | TEXT | "active", "filtered_step3", "filtered_step5", "superseded", "archived" |
| version | INTEGER | Increments on re-scrape. Latest version wins. |
| scraped_at | TIMESTAMPTZ | |
| purged_at | TIMESTAMPTZ | When content was nulled for retention |

**platform_tags** — The 335+ tag taxonomy.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| tag_code | TEXT (UNIQUE) | Human-readable: "DIR-029", "NEWS-015", "GEO-EU" |
| dimension | TEXT | "DIR", "NEWS", "GEO", "PROD", "TYPE", "SYSTEM" |
| label | TEXT | Display name |
| status | TEXT | "active", "deprecated", "retired" |

**content_tags** — Junction table between content and tags.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID (PK) | |
| content_item_id | UUID (FK → content_items) | |
| tag_id | UUID (FK → platform_tags) | |
| confidence | DECIMAL | 0-1, how confident the tagging is |
| source | TEXT | "manual", "auto_llm", "auto_rule" |

### Schema Principles

- **Content reuse:** Scraped content is stored once by source_url. Multiple projects can reference the same scraped content.
- **Freshness flags, not gates:** Stale content is flagged but never blocked. >14 days = stale_news, >3 months = stale_company.
- **Conflict resolution:** On re-scrape, newer version wins. `ON CONFLICT (source_url) DO UPDATE WHERE new.scraped_at > existing.scraped_at` with version increment.
- **Tiered retention:** Filtered content (Steps 3, 5) keeps the metadata row but JSONB body is nulled after 7 days.

---

## Part 5: The Manifest Contract

Every submodule has a `manifest.json` that tells the skeleton everything it needs to know. The skeleton never reads `execute.js` to understand a submodule — the manifest is the complete interface declaration.

### Manifest Shape

```json
{
  "id": "sitemap",
  "name": "Sitemap Parser",
  "description": "Parses XML sitemaps to discover page URLs.",
  "version": "1.0.0",
  "step": 1,
  "category": "website",
  "cost": "cheap",

  "requires_columns": ["website"],

  "options": [
    {
      "name": "max_urls",
      "type": "number",
      "label": "Maximum URLs",
      "description": "Limit total URLs returned per entity.",
      "default": 1000,
      "min": 1,
      "max": 50000
    },
    {
      "name": "include_nested",
      "type": "boolean",
      "label": "Include nested sitemaps",
      "description": "Follow sitemap index files to discover sub-sitemaps.",
      "default": true
    },
    {
      "name": "url_filter",
      "type": "select",
      "label": "URL filter",
      "description": "Which URL patterns to include.",
      "default": "all",
      "values": ["all", "pages_only", "blog_only", "custom_regex"]
    }
  ],

  "item_key": "url",

  "output_type": "urls",

  "output_schema": {
    "url": "string (required)",
    "source_category": "string",
    "depth": "number",
    "last_modified": "string (ISO date, if available)"
  }
}
```

### Manifest Fields Explained

**id** — Unique identifier. Used in database records, file paths, and API calls. Must be URL-safe (lowercase, hyphens, no spaces). Once set, never changes.

**name** — Human-readable display name. Shown on submodule cards in the UI.

**description** — One-line explanation. Shown in the UI when the user hovers or expands the submodule card.

**version** — Semantic version. Allows the skeleton to detect manifest changes.

**step** — Which step this submodule belongs to (0-10). Determines where it appears in the UI. A submodule appears in exactly one step.

**category** — Visual grouping within a step. In Step 1 (Discovery), categories might be "website", "news", "social", "data". Categories are visual only — they help the user find submodules. They have no functional meaning.

**cost** — Cost tier: "cheap", "medium", "expensive". Displayed on the submodule card so the user knows what they're paying for. "cheap" = no external API calls. "medium" = some API calls. "expensive" = LLM calls or heavy scraping.

**requires_columns** — Which columns must exist in the entity data for this submodule to run. The skeleton uses this to check shared step context and determine if the submodule can execute. If entity data has a `website` column, the Sitemap submodule can run. If not, the skeleton shows a message ("This submodule needs a website column — upload data or use a submodule that provides it").

**options** — Array of configuration fields. The skeleton's OptionRenderer reads this array and generates the form UI automatically. Each option has:
- `name` — Key used in the options object passed to execute()
- `type` — "boolean" (renders toggle), "number" (renders number input), "text" (renders text input), "select" (renders dropdown), "textarea" (renders multiline input)
- `label` — Display label
- `description` — Help text
- `default` — Pre-filled value
- Type-specific constraints: `min`/`max` for numbers, `values` for selects, `maxLength` for text

**item_key** — Which field(s) in the output items uniquely identify a result. Used by the skeleton for two purposes: (1) deduplication during step aggregation — when multiple submodules produce the same item (e.g., Sitemap and Navigation both find `betsson.com/about`), the skeleton deduplicates by this key. (2) Tracking across re-runs — if a submodule is re-run, the skeleton can match new results to previously approved/rejected items. For URL-producing submodules, this is typically `"url"`. For content-producing submodules, it might be `"entity_name"`. Can be a single field name (string) or an array of field names for composite keys (e.g., `["entity_name", "content_type"]`).

**output_type** — What kind of results this submodule produces. **This is the rendering switch.** The skeleton uses output_type to decide how to display results — no additional UI configuration needed. Currently supported types:
- `"urls"` → ResultsTable renders as a sortable, filterable table with URL, source, and metadata columns. Each row has approve/reject controls.
- `"content"` → Results render as content previews (text blocks with headings, excerpts, word count). Approve/reject per content piece.
- `"metadata"` → Results render as structured key-value data tables.

New output_types can be added to the skeleton when needed (e.g., `"file"` for bundled outputs). The manifest does NOT need a separate "UI Manifest" or custom renderer path — output_type is sufficient because the skeleton owns all rendering logic.

**output_schema** — Describes the shape of each result item. Used for documentation and for the results table to know which columns to display. Not enforced at runtime in v1 (the submodule is trusted to return the right shape).

### What the manifest does NOT include

- No code references (execute.js is assumed to be in the same folder)
- No database configuration (submodules don't access the database)
- No dependency declarations (submodules use only what the tools object provides plus standard Node.js)
- No UI component paths (the skeleton renders all UI based on manifest declarations)

---

## Part 6: The Tools Object

When the skeleton executes a submodule, it passes three arguments: `input`, `options`, and `tools`. The tools object is the submodule's only bridge to the outside world.

### Tools Interface

```
tools.logger
  .info(message)     — Log an informational message
  .warn(message)     — Log a warning
  .error(message)    — Log an error
  Logged messages are written to two destinations:
  1. The `submodule_runs.logs` column (JSONB array of {level, message, timestamp} objects) —
     this is what the UI reads to show execution logs to the user.
  2. The server console (stdout) — for debugging during development.
  The UI can display logs in real-time by polling the submodule_runs record during execution.

tools.http
  .get(url, options)  — Fetch a URL (GET request)
  .post(url, body, options) — POST request
  Returns: { status, headers, body }
  The skeleton wraps http calls to add: rate limiting, retry logic, timeout handling, and logging.
  Submodules never use raw fetch() or axios — they use tools.http so the skeleton can manage
  request behavior centrally.

tools.progress
  .update(current, total, message) — Report execution progress
  Example: tools.progress.update(45, 100, "Processing entity 45 of 100")
  The skeleton relays this to the UI for real-time progress display.
  Optional — submodules work fine without calling progress. But long-running submodules
  should call it so the user sees activity.
```

### What tools does NOT provide

- No database access (no tools.db)
- No queue access (no tools.queue)
- No file system write access (no tools.fs.write)
- No access to other submodules' data (no tools.getSubmoduleResults)
- No access to configuration outside of what's passed as `options`

### Future tools (not in v1)

- `tools.ai.generate(prompt, options)` — When submodules in Steps 5-6 need LLM access, the skeleton provides a wrapped AI client that handles model selection, cost tracking, and retry logic. The submodule never imports an LLM SDK directly.
- `tools.cache.get(key)` / `tools.cache.set(key, value)` — For submodules that benefit from caching across runs (e.g., "I already know this domain's sitemap structure").

These are added when needed, not prebuilt.

---

## Part 7: Module Auto-Discovery

The skeleton finds submodules automatically. No registration step, no configuration file listing which submodules exist.

### How it works

At startup, the skeleton's moduleLoader service:

1. Reads the MODULES_PATH environment variable
2. Scans for directories matching the pattern `step-{N}-{name}/{submodule-name}/`
3. In each submodule directory, reads `manifest.json`
4. Validates the manifest (required fields present, id is unique, step number is valid)
5. Registers the submodule in an in-memory registry

When the UI requests available submodules for a step, the skeleton returns all registered submodules where `manifest.step === requestedStep`.

When a submodule is executed, the skeleton:

1. Looks up the submodule by id in the registry
2. Loads `execute.js` from the submodule's directory
3. Calls `execute(input, options, tools)` with the appropriate arguments
4. Captures the returned results
5. Writes results to the submodule_runs table

### Adding a new submodule

1. Create a new folder under the appropriate step directory: `modules/step-1-discovery/new-submodule/`
2. Add `manifest.json` with the required fields
3. Add `execute.js` that exports an async function
4. Restart the skeleton (or, in a future version, the skeleton hot-reloads)

No other changes needed. The skeleton discovers the new submodule, the UI shows it, the user can run it.

### Manifest validation

At startup, the moduleLoader rejects submodules with invalid manifests and logs a warning. Invalid means:

- Missing required fields (id, name, step, options, output_type)
- Duplicate id (another submodule already registered with this id)
- Invalid step number (not 0-10)
- Malformed options array (missing name, type, or default on any option)

Invalid submodules don't crash the skeleton — they're skipped with a logged warning.

---

## Part 8: Three-Level Mechanics in Detail

### Level 1: Between Steps — Database-Mediated Flow

Each step in a run has a corresponding `pipeline_stages` row. The flow:

1. **Step N completes** → User clicks [APPROVE STEP] → Skeleton aggregates all approved items from all submodule runs in this step → Writes aggregated results to `pipeline_stages.output_data` for step N → Sets step status to "completed"

2. **Step N+1 activates** → Skeleton reads `pipeline_stages.output_data` from step N → Loads it as `pipeline_stages.input_data` for step N+1 → Sets step status to "active"

3. **Submodules in Step N+1** receive this input data when they execute.

**Key rule:** Steps never communicate directly. Step 3 doesn't call Step 2. Step 3 reads what Step 2 left in Supabase. This is enforced by the architecture — there is no mechanism for direct step communication. Steps only know their own step_index.

**Skipping a step:** User clicks [SKIP STEP] → Step status set to "skipped" → The previous step's output_data passes through unchanged as the skipped step's output_data → Next step activates normally.

### Level 2: Between Submodules — Shared Context and Aggregation

Within a step, submodules interact through two mechanisms. An important clarification: **submodules within a step do not run concurrently.** The user triggers them one at a time — click Sitemap → run → review → approve → click Navigation → run → review → approve. There is no race condition between submodules because only one executes at a time. BullMQ may process jobs concurrently across DIFFERENT steps or runs, but within a single step, the user controls sequencing.

**Shared Step Context (the CSV sharing pattern):**

Shared context is **input entity data** (the CSV the user uploaded), NOT output results. Each submodule's output goes to its own `submodule_runs` row. Outputs are only combined during step finalization (aggregation), not during execution.

When a submodule receives uploaded data (e.g., a CSV), the skeleton:
1. Parses the data into an array of entity objects
2. Writes it to the `step_context` table for this run + step
3. Makes it available to all sibling submodules

When another submodule in the same step needs input, the skeleton checks:
1. Does this submodule have its own uploaded data? → Use that
2. Does step_context have data with the required columns? → Offer it with a message: "Found X entities with {column} from {source_submodule}. [Use these] or [Upload different]"
3. Neither? → Show upload prompt

**Aggregation on Step Finalize:**

When the user clicks [APPROVE STEP], the skeleton:
1. Collects `approved_items` from every submodule_run in this step where status = "approved"
2. Merges them into a single output dataset (deduplication by entity, union of results)
3. Writes the merged dataset to `pipeline_stages.output_data`

Submodules don't know about each other's results. They produce output independently. The skeleton combines them.

### Level 3: Within a Submodule — Three Accordion Sections

Every submodule panel has three sections, each an expandable/collapsible accordion. The skeleton renders all three. The submodule provides data through its manifest and execute function.

**Section 1: Input**

The skeleton handles everything:
- Check if previous step has output data for this run → if yes, show entity count and preview
- Check if step_context has data with the columns this submodule requires → if yes, show availability message
- If neither → show upload area (CSV upload, paste URLs, or text input depending on the submodule's input requirements)
- Show the entity list with columns relevant to this submodule

The submodule's `requires_columns` manifest field drives what the skeleton looks for. If a submodule requires `["website"]`, the skeleton checks entity data for a `website` column.

**Section 2: Options**

The skeleton's OptionRenderer reads the manifest's `options` array and renders:
- `type: "boolean"` → toggle switch
- `type: "number"` → number input with min/max constraints
- `type: "text"` → text input
- `type: "textarea"` → multiline text input
- `type: "select"` → dropdown with values from the manifest

All options start at their default values. The user changes what they want. When [RUN] is clicked, the skeleton collects current option values and passes them to execute().

**Section 3: Results**

After execution completes, the skeleton renders results based on `output_type`:
- `"urls"` → Table with URL, source, metadata columns. Each row has approve/reject controls.
- `"content"` → Content preview with approve/reject.
- `"metadata"` → Structured data table.

Below the results:
- Summary line: "X items found. Y approved. Z rejected."
- [APPROVE ALL] — Approve remaining pending items
- [REJECT ALL] — Reject remaining pending items  
- [TRY AGAIN] — Re-run the submodule with same or modified options
- [DOWNLOAD] — Export results as CSV

**Bulk filter-and-approve:** The ResultsTable supports column filtering (text search, pattern matching). Approve/reject actions apply to the **currently visible (filtered) rows**, not the full dataset. This means a user facing 5,000 URLs can filter to show only URLs containing `/blog/`, approve those, then filter to `/tag/`, reject those, and so on. The skeleton handles this natively through TanStack Table's built-in filtering — no submodule involvement needed. This is critical for Steps that produce high-volume results (Discovery, Validation, Scraping).

When all items are decided (approved or rejected), the submodule can be finalized (its status changes to "approved").

---

## Part 9: The Execute Function Contract

Every submodule's `execute.js` exports a single async function.

### Signature

```
async function execute(input, options, tools) → results
```

### Input

```
{
  entities: [
    { name: "Betsson", website: "betsson.com", linkedin: "/company/betsson" },
    { name: "Evolution", website: "evolution.com" }
  ],
  run_id: "uuid",
  step_index: 1,
  submodule_id: "sitemap"
}
```

`entities` is an array of objects. Each object has at minimum a `name` field. Other fields depend on what data is available from uploads and shared context. The submodule should check for the fields it needs and handle missing fields gracefully (skip that entity, log a warning).

### Options

The collected option values from the UI. Keys match the `name` fields in the manifest's options array.

```
{
  max_urls: 1000,
  include_nested: true,
  url_filter: "all"
}
```

### Tools

The tools object as described in Part 6.

### Return Value

The execute function must return an object with a `results` array:

```
{
  results: [
    {
      entity_name: "Betsson",
      items: [
        { url: "https://betsson.com/about", depth: 1, last_modified: "2026-01-15" },
        { url: "https://betsson.com/products", depth: 1 },
        ...
      ],
      meta: {
        total_found: 142,
        filtered: 12,
        errors: 0
      }
    },
    {
      entity_name: "Evolution",
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

**Per-entity grouping is required.** The skeleton displays results grouped by entity so the user can approve/reject per entity or per item. The `items` array within each entity contains the actual output data, whose shape matches the manifest's `output_schema`.

**Summary is required.** The skeleton uses the summary for the status line and submodule card badge (showing total count).

### Error Handling

If a submodule encounters errors for some entities but succeeds for others, it should return results for the successful entities and include errors in the results:

```
{
  results: [
    {
      entity_name: "Betsson",
      items: [...],
      meta: { total_found: 142 }
    },
    {
      entity_name: "BadDomain",
      items: [],
      error: "DNS resolution failed for baddomain.xyz",
      meta: { total_found: 0, errors: 1 }
    }
  ],
  summary: {
    total_entities: 2,
    total_items: 142,
    errors: ["BadDomain: DNS resolution failed"]
  }
}
```

If the entire execution fails (unrecoverable error), the function should throw. The skeleton catches it, marks the submodule_run as "failed", and displays the error message.

---

## Part 10: UI Skeleton — The React Shell

The UI skeleton is a set of React components that render any submodule without knowing what it does. This is part of the skeleton (Repo 1) — it handles layout, navigation, and the universal mechanics.

### Page Structure

**Dashboard (/)** — List of projects. Create new project button. Each project card shows name, type, status, and the last run's progress.

**Run View (/run/:runId)** — The main workspace. Two regions:

1. **Step Navigation (left sidebar or top bar)** — Shows all 11 steps as a progression. Each step shows status: locked (can't access yet), active (current step), completed (approved), skipped. Clicking a completed step shows its output for reference. Clicking the active step shows the submodule workspace.

2. **Step Workspace (main area)** — For the active step, shows:
   - Step header: name, description, status
   - Submodule cards: grid of available submodules, grouped by category
   - When a submodule card is clicked: SubmodulePanel slides in from the right (or expands in place)
   - Step actions at bottom: [APPROVE STEP] (enabled when at least one submodule is approved), [SKIP STEP]

### Component Responsibilities

**StepContainer** — Receives a step_index and run_id. Queries available submodules for this step from the moduleLoader. Renders SubmoduleCards in a grid grouped by category. Manages step-level approval. Does NOT know what any submodule does.

**SubmoduleCard** — Shows: icon/emoji based on category, name, description, cost badge, status (idle, running, completed, approved). Click opens SubmodulePanel. Badge shows result count when completed.

**SubmodulePanel** — The three-accordion layout. Receives the manifest and renders:
- Input section (via InputLoader)
- Options section (via OptionRenderer)
- Results section (via ResultsTable)
- Action buttons: [RUN], [SEE RESULTS], [APPROVE], [TRY AGAIN]

**InputLoader** — Checks step_context for shared data. Shows available entity data. Handles CSV upload. Shows which required columns are present/missing.

**OptionRenderer** — Reads the manifest's options array. Renders the appropriate form field for each option type. Collects current values.

**ResultsTable** — Generic table component. Columns come from the output_schema. Each row has approve/reject controls. Supports bulk actions (approve all, reject all). Shows summary stats.

**ApprovalBar** — Appears at the bottom of SubmodulePanel and at the step level. Handles the approve/reject/re-run flow with confirmation.

### UI State vs Server State

**TanStack Query manages server state:**
- Project list
- Run data (current step, status)
- Step data (input, output, submodule runs)
- Submodule run results
- Shared step context

**React hooks manage UI state:**
- Which panel is open
- Which accordion is expanded
- Current option values (before execution)
- Table sort/filter state
- Selection state (which items are selected for bulk action)

No global state store. TanStack Query handles caching and background refetching. React component state handles transient UI concerns.

---

## Part 11: Job Queue Architecture

BullMQ handles submodule execution. The user clicks [RUN] in the UI → API creates a job → Worker picks up the job → Worker loads and executes the submodule → Worker writes results to Supabase.

### Queue Design

One queue: `pipeline-stages`. Each job carries its own configuration — which submodule to run, what input to pass, what options are set. The worker is generic — it reads the job data, loads the right submodule, executes it, and writes results.

```
Job data:
{
  run_id: "uuid",
  stage_id: "uuid",
  submodule_id: "sitemap",
  input: { entities: [...] },
  options: { max_urls: 1000, include_nested: true },
  submodule_run_id: "uuid"
}
```

### Worker Logic

The stageWorker processes jobs:

1. Read job data
2. Look up submodule by id in the module registry
3. Load execute.js from the submodule's directory
4. Build the tools object
5. Call `execute(input, options, tools)`
6. On success: write results to `submodule_runs.output_data`, set status to "completed"
7. On failure: write error to `submodule_runs.error`, set status to "failed"

The worker handles:
- **Timeouts** — If a submodule runs longer than a configured maximum (default: 5 minutes for cheap, 15 minutes for medium, 30 minutes for expensive), the job is killed and marked failed.
- **Retries** — Failed jobs are retried based on cost tier (cheap: 3 retries, medium: 2, expensive: 1). Configurable.
- **Concurrency** — Worker processes 2 jobs concurrently. This prevents a slow expensive job from blocking a fast cheap job. Adjustable based on server resources.
- **Priority** — The manifest `cost` field maps directly to BullMQ job priority. Cheap = priority 1 (highest), medium = priority 5, expensive = priority 10 (lowest). BullMQ processes higher-priority jobs first when multiple are queued. This means a user can trigger an expensive 30-minute generation job and then trigger a cheap 10-second sitemap parse without waiting — the cheap job runs immediately in the second concurrency slot or jumps the queue.

### Why Not Direct Execution

The submodule could be executed directly in the API server process (synchronous or async). BullMQ adds:

- **Persistence** — If the server crashes mid-execution, the job is recovered when the worker restarts
- **Isolation** — A misbehaving submodule can't crash the API server
- **Visibility** — Job status, duration, and history are trackable through BullMQ's built-in monitoring
- **Future scaling** — Workers can run on separate machines without changing the architecture

For v1, the overhead of BullMQ is minimal and the benefits for reliability are worth it.

---

## Part 12: API Layer

Express routes that the React frontend calls. Every route is a skeleton operation — no business logic.

### Route Groups

**Projects**
- `POST /api/projects` — Create project
- `GET /api/projects` — List projects
- `GET /api/projects/:id` — Get project details

**Runs**
- `POST /api/projects/:id/runs` — Create a new run for a project
- `GET /api/runs/:id` — Get run status, current step
- `PATCH /api/runs/:id` — Update run (pause, resume)

**Steps**
- `GET /api/runs/:runId/steps/:stepIndex` — Get step data (input, output, submodule runs)
- `POST /api/runs/:runId/steps/:stepIndex/approve` — Approve step (aggregate and advance)
- `POST /api/runs/:runId/steps/:stepIndex/skip` — Skip step (pass through and advance)

**Submodules**
- `GET /api/submodules` — List all registered submodules (from auto-discovery)
- `GET /api/submodules?step=1` — List submodules for a specific step
- `POST /api/runs/:runId/steps/:stepIndex/submodules/:submoduleId/run` — Execute a submodule (creates BullMQ job)
- `GET /api/submodule-runs/:id` — Get submodule run status and results
- `POST /api/submodule-runs/:id/approve` — Approve submodule results (all or selected items)
- `POST /api/submodule-runs/:id/reject` — Reject submodule results

**Context**
- `POST /api/runs/:runId/steps/:stepIndex/context` — Upload entity data to step context
- `GET /api/runs/:runId/steps/:stepIndex/context` — Get step context (shared entity data)

**Decision Log**
- `POST /api/decisions` — Log a decision (called automatically by approve/reject routes)
- `GET /api/runs/:runId/decisions` — Get decision history for a run

### API Principles

- All routes return JSON
- All mutating operations return the updated record
- Error responses include a `message` field with a human-readable explanation
- Routes handle database operations through the `db.js` service — no direct Supabase imports in route files
- Routes handle queue operations through the `queue.js` service — no direct BullMQ imports in route files

---

## Part 13: Decision Logging

Every human judgment is recorded automatically. This is not a reporting feature — it's the infrastructure that enables the calibration pattern described in Strategic Architecture Part 4.

### What Gets Logged

Every time the user approves, rejects, re-runs, or skips something, the skeleton writes a decision_log entry:

- **Approve an item** — decision: "approved", entity_id, context snapshot
- **Reject an item** — decision: "rejected", entity_id, reason (optional free text), context snapshot
- **Re-run a submodule** — decision: "re-run", submodule_id, changed options
- **Skip a step** — decision: "skipped", step_index
- **Approve a step** — decision: "step_approved", step_index, aggregated stats

### Context Snapshot

The `context` JSONB field captures enough data to reconstruct the decision context later:
- For URL approval: the URL, its source submodule, any metadata
- For content approval: excerpt of the generated content, quality scores
- For step approval: count of approved/rejected items per submodule

This context is what makes calibration possible. Without it, a logged "rejected" is meaningless — we need to know WHAT was rejected and under what circumstances.

### Logging is Automatic

Decision logging is built into the skeleton's approval routes, not into submodules. When the frontend calls `POST /api/submodule-runs/:id/approve`, the route handler:
1. Updates the submodule_run record
2. Writes a decision_log entry
3. Returns the updated record

Submodules don't need to know about decision logging. It happens at the skeleton level.

### v1 Scope

In v1, decisions are logged but not analyzed. There is no rule engine, no pattern detection, no automation. The log grows. When the system is mature enough to start building calibration rules, the historical data is already there.

---

## Part 14: Approval Mechanics

The approval flow is the heart of the human-operated tool. Every result passes through human judgment.

### Three Levels of Approval

**Item-level** — Within a submodule's results, the user approves or rejects individual items (URLs, content pieces, metadata entries). This is fine-grained control.

**Submodule-level** — After reviewing and approving/rejecting individual items, the user finalizes the submodule run. A submodule is "approved" when the user is satisfied with its results (even if some individual items were rejected).

**Step-level** — After all desired submodules in a step are approved, the user approves the step. This triggers aggregation (combining approved items from all submodules) and advances the run to the next step.

### State Transitions

**Submodule run states:**
```
pending → running → completed → approved
                              → rejected
                  → failed (execution error)
```

**Step states:**
```
pending → active → completed (approved)
                 → skipped
```

**Run states:**
```
running → completed (all steps done)
        → paused (user paused)
        → failed (unrecoverable error)
```

### Rules

- A step cannot be approved until at least one submodule in it is approved
- A step can be skipped at any time (even if submodules have been run)
- A submodule can be re-run after completion (starts a new submodule_run, previous one preserved)
- Individual item approvals/rejections are per submodule_run — re-running creates fresh items
- Approving a step aggregates only from approved submodule runs (not rejected or re-run ones)
- The run advances linearly (Step 0 → 1 → 2 → ... → 10). No jumping ahead. A step can be revisited after completion to view its output, but not re-run (start a new run instead).

---

## Part 15: Current Implementation Status

*This section updates as development progresses.*

### What Exists (as of February 2026)

**Server/Infrastructure:**
- Hetzner VPS provisioned and configured
- Redis running on Hetzner
- Express API server structure (routes, services)
- BullMQ worker setup
- PM2 process management
- SSH access configured

**Database:**
- Supabase project created
- Core tables deployed (projects, pipeline_runs, pipeline_stages, submodule_runs, step_context, content_items, platform_tags, content_tags)
- Decision_log table needs creation

**Frontend:**
- React 18 + TypeScript + Vite + Tailwind initialized
- Step 0 and Step 1 components built (but need refactoring to match the skeleton spec)
- TanStack Query and TanStack Table integrated
- Basic routing with React Router

**Submodules:**
- Sitemap, Navigation, Seed Expansion — execute.js files exist but need manifest.json added and contract alignment
- Submodule interface template (_template.js) exists

### What Needs Building

**For the two-repo split:**
- Create Repo 1 (skeleton) from existing codebase — extract infrastructure
- Create Repo 2 (modules) — move submodule folders, add manifests
- Implement moduleLoader (auto-discovery)
- Implement tools object factory
- Configure MODULES_PATH environment variable

**For skeleton completion:**
- OptionRenderer component (render form fields from manifest options)
- InputLoader component (shared context checking + upload)
- ResultsTable refinement (per-item approval, bulk actions)
- SubmodulePanel three-accordion layout
- StepContainer with submodule card grid
- Step navigation progression UI
- Decision logging integration into approval routes
- API route completion (some routes exist, some need updating)

**For v1 end-to-end:**
- One content piece through all 11 steps
- Manual review at every step
- Decision logging capturing every judgment

---

## Part 16: MVP Phasing

### MVP-0: Skeleton Proves It Works

**Goal:** Run one submodule through the skeleton end-to-end. Prove the skeleton mechanics (auto-discovery, manifest loading, option rendering, execution via BullMQ, results display, approval).

**Scope:**
- Repo split completed
- moduleLoader working (discovers and loads one submodule)
- Sitemap submodule with manifest.json
- SubmodulePanel renders input/options/results for Sitemap
- [RUN] triggers BullMQ job → worker executes → results appear in UI
- [APPROVE] marks items approved
- Decision logging records the approval

**Not included:** Step-to-step flow, step approval, multiple submodules, project management.

**Why this first:** If the skeleton can't load and execute a single submodule correctly, nothing else matters. This is the smallest proof that the architecture works.

### MVP-1: Step 1 Complete

**Goal:** Full Step 1 (Discovery) working with multiple submodules and step-level approval.

**Scope:**
- Three submodules: Sitemap, Navigation, Seed Expansion (all in step-1-discovery)
- Shared step context (CSV upload in one submodule available to others)
- SubmoduleCard grid with category grouping
- Step approval: aggregate approved items from all submodules
- Step-to-step flow: Step 1's output becomes Step 2's input

**Not included:** Steps 2-10, content generation, distribution.

### MVP-2: Through to Generation

**Goal:** First content generated through Steps 0-5.

**Scope:**
- Step 0 (Project Start): project creation, entity list
- Step 2 (Validation): basic URL filtering
- Step 3 (Scraping): HTTP scraper submodule
- Step 4 (Filtering): content cleaning
- Step 5 (Generation): first LLM-powered content generation submodule

### MVP-3: End-to-End

**Goal:** First published content through all 11 steps.

**Scope:**
- Steps 6-10 with at least one submodule each
- Distribution to Strapi
- Full decision logging across all steps

---

## Part 17: What This Document Doesn't Cover

These topics are handled in the Module Decisions document (Document 3) or are deferred:

- **Individual submodule specifications** — What each submodule does, its unique options, its specific output format
- **Content type configurations** — How company profiles differ from news articles in the pipeline
- **Template system** — How templates save and restore submodule configurations
- **Strapi integration details** — Field mappings, API authentication, content type schemas
- **Tag seeding and management** — How the 335+ tags are loaded and maintained
- **Content reuse across projects** — How the content library deduplication works in practice
- **AI provider integration** — Model selection, prompt management, cost tracking
- **Monitoring and alerting** — How to know when things are broken
- **Deployment process** — How code gets from local to Hetzner
- **Testing strategy** — How submodules and skeleton are tested

Each of these will be specified when it becomes the next development priority. The skeleton spec covers the frozen house. Everything else is furniture.