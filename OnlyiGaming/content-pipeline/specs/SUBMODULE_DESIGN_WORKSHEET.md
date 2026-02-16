# Submodule Design Worksheet

**Purpose:** Standardized interface checklist for designing new submodules. Fill this in before writing code.
**Companion doc:** For functional/conceptual design, use `SUBMODULE_RESEARCH_BRIEF_TEMPLATE.md`.
**Full spec reference:** `SUBMODULE_DEVELOPMENT.md` (execute contract), `SKELETON_SPEC_v2.md` Part 11 (manifest).

---

## Phase A: Identity

| Decision | Your Value | Notes |
|----------|-----------|-------|
| **id** | | URL-safe, lowercase, hyphens. Permanent — used in DB, API, file paths. |
| **name** | | Human-readable. Shown on submodule card. |
| **description** | | One line. Shown in panel description bar. |
| **step** | | Integer 0-10. See step reference below. |
| **category** | | Visual grouping within the step. See existing categories. |
| **cost** | | `cheap` / `medium` / `expensive`. See cost reference. |
| **version** | | Semver. Start with `1.0.0`. |

### Step Reference

| Step | Name | Description |
|------|------|-------------|
| 0 | Project Start | Define project scope and metadata |
| 1 | Discovery | Find candidate sources and seed data |
| 2 | Validation | Filter before committing to expensive operations |
| 3 | Scraping | Fetch actual content from validated sources |
| 4 | Filtering & Assembly | Clean and organize into source packages |
| 5 | Analysis & Generation | Produce output content from sources |
| 6 | Quality Assurance | Verify output meets standards |
| 7 | Routing | Decide what happens to items that fail QA |
| 8 | Bundling | Package into delivery formats |
| 9 | Distribution | Push to external systems |
| 10 | Review | Final human gate before publication |

### Cost Tiers

| Tier | Timeout | Retries | BullMQ Priority | Use When |
|------|---------|---------|-----------------|----------|
| `cheap` | 5 min | 3 | 1 (highest) | No API calls, fast processing |
| `medium` | 15 min | 2 | 5 | Some API calls, moderate processing |
| `expensive` | 30 min | 1 | 10 (lowest) | Paid APIs, rate-limited, heavy processing |

### Existing Categories

| Step | Categories in Use |
|------|------------------|
| 1 (Discovery) | `crawling` (sitemap-parser), `news` (rss-feeds) |
| 2 (Validation) | `filtering` (url-dedup, url-filter) |

---

## Phase B: Data Flow

| Decision | Your Value | Notes |
|----------|-----------|-------|
| **data_operation_default** | | `add` (+) / `remove` (-) / `transform` (=) |
| **requires_columns** | | Array of column names that must exist in input |
| **item_key** | | Primary key field(s) for dedup and tracking. String or array. |

### Data Operation Reference

| Operation | Icon | Pool Behavior on Approve | Convention |
|-----------|------|-------------------------|------------|
| `add` | + | Merge approved items into pool (union, dedup by item_key) | Discovery submodules that find new items |
| `remove` | - | Pool replaced with approved items (output IS the filtered result) | Filtering/validation submodules |
| `transform` | = | Pool replaced with transformed items | Enrichment/conversion submodules |

### Input Shape by Step

**Step 1 — Raw entities (from CSV/upload):**
```javascript
input.entities = [
  { name: "Company A", website: "companya.com", linkedin: "..." },
  { name: "Company B", website: "companyb.com" }
]
```

**Step 2+ — Entities with items (from previous step working pool):**
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

### Planning Prompts

- What does this submodule **consume**? (URLs, scraped content, generated text, scores?)
- What does it **produce**? (URLs, filtered items, new content, metadata?)
- What's the **primary key** of each output item? (url, content_id, entity+url?)
- Can the same item appear from multiple entities? How should overlap be handled?

### Existing requires_columns

| Submodule | requires_columns |
|-----------|-----------------|
| sitemap-parser | `["website"]` |
| rss-feeds | `["website"]` |
| url-dedup | `["url"]` |
| url-filter | `["url"]` |

---

## Phase C: Visualization

| Decision | Your Value | Notes |
|----------|-----------|-------|
| **display_type** | | `table` / `url_list` / `content_cards` / `file_list` |
| **selectable** | | `true` (user picks items) / `false` (approve all) |
| **fields** | | List each field name + type. See field format below. |

### Display Type Reference

| Type | Best For | Rendering |
|------|----------|-----------|
| `table` | Structured data with multiple columns (URLs, scores, metadata) | Column headers from field names, one row per item |
| `url_list` | Compact URL-focused output | Primary URL + entity name, details on expand |
| `content_cards` | Rich content (articles, HTML, generated text) | Card layout with title, excerpt, status |
| `file_list` | File outputs (exports, packages) | Filename + size + timestamp |

**Note:** Currently only `table` is implemented in ContentRenderer. Other types will render as table fallback until extended.

### Selectable Decision Guide

| Data Operation | Typical selectable | Reasoning |
|----------------|-------------------|-----------|
| `add` (+) | `false` | Approve all discovered items |
| `remove` (-) | `true` | User picks what to filter out |
| `transform` (=) | `false` | Approve all transformed items |

A submodule CAN override these conventions if it makes sense for its use case.

### Output Schema Field Format

Each field is declared as `"field_name": "type description"`:

```json
{
  "display_type": "table",
  "selectable": false,
  "url": "string (required)",
  "last_modified": "string (ISO date, if available)",
  "score": "number",
  "status": "string"
}
```

Fields become column headers in the results table. The `(required)` marker indicates this field should always have a value.

### Existing Output Schemas

| Submodule | display_type | selectable | Fields |
|-----------|-------------|-----------|--------|
| sitemap-parser | table | false | url, last_modified, change_frequency, priority |
| rss-feeds | table | false | url, feed_type, title, item_count |
| url-dedup | table | **true** | url, original_url, duplicate_of, status, entity_name |
| url-filter | table | **true** | url, status, matched_pattern, entity_name |

---

## Phase D: Configuration

| Decision | Your Value | Notes |
|----------|-----------|-------|
| **Needs options?** | | Yes / No |
| **Custom component?** | | Yes (provide `options_component` path) / No (auto-render from `options[]`) |
| **Options list** | | See option types below |

### Option Types

| Type | Extra Properties | Renders As |
|------|-----------------|-----------|
| `boolean` | — | Toggle/checkbox |
| `number` | `min`, `max` | Number input with constraints |
| `text` | `maxLength` | Single-line text input |
| `select` | `values` (string array) | Dropdown |
| `textarea` | `maxLength` | Multiline text input |

### Option Definition Format

```json
{
  "name": "key_name",
  "type": "number",
  "label": "Display Label",
  "description": "Help text shown below the field.",
  "default": 1000,
  "min": 1,
  "max": 50000
}
```

### Existing Options Inventory

| Submodule | Option | Type | Default |
|-----------|--------|------|---------|
| sitemap-parser | max_urls | number (1-50000) | 10000 |
| sitemap-parser | include_nested_sitemaps | boolean | true |
| sitemap-parser | url_pattern | text | "" |
| rss-feeds | max_feeds | number (1-100) | 10 |
| rss-feeds | check_common_paths | boolean | true |
| url-dedup | normalize_www | boolean | true |
| url-dedup | normalize_trailing_slash | boolean | true |
| url-dedup | strip_query_params | boolean | true |
| url-dedup | strip_fragments | boolean | true |
| url-dedup | case_insensitive | boolean | true |
| url-filter | exclude_patterns | textarea | "" |
| url-filter | include_patterns | textarea | "" |
| url-filter | check_status_codes | boolean | false |

---

## Phase E: Execution Behavior

| Decision | Your Value | Notes |
|----------|-----------|-------|
| **Needs HTTP?** | | Yes (tools.http) / No |
| **Progress reporting?** | | Yes (tools.progress) / No |
| **Error handling** | | Partial success / Total failure |
| **Summary description** | | What should the description say? Write a template. |

### Tools Available

| Tool | Methods | Use When |
|------|---------|----------|
| `tools.http` | `.get(url, opts)`, `.post(url, body, opts)` | External HTTP requests. Skeleton adds rate limiting, retry, timeout. |
| `tools.progress` | `.update(current, total, message)` | Processing multiple entities. Updates UI progress bar every 2s. |
| `tools.logger` | `.info(msg)`, `.warn(msg)`, `.error(msg)` | Always. Logged to submodule_runs.logs + server console. |

**Not available:** No database access, no queue access, no filesystem writes, no cross-submodule data.

### Summary Description Patterns

The skeleton displays `summary.description` as-is. Each submodule writes its own.

| Pattern | Example | Used By |
|---------|---------|---------|
| `{count} {items} across {N} entities` | "284 URLs found across 2 entities" | sitemap-parser |
| `{count} from {success} of {total} ({failures} failed)` | "142 items from 1 of 2 entities (1 failed)" | sitemap-parser (partial failure) |
| `Found {N} duplicates. {unique} unique of {total} total` | "Found 12 duplicates. 272 unique of 284 total" | url-dedup |
| `{total} {items} — no {issue} found` | "284 URLs — no duplicates found" | url-dedup (clean result) |

### Error Handling Patterns

**Partial success** — return what worked, include per-entity errors:
```javascript
results.push({
  entity_name: "Bad Domain",
  items: [],
  error: "DNS resolution failed",
  meta: { errors: 1 }
});
errors.push("Bad Domain: DNS resolution failed");
```

**Total failure** — throw an error. Skeleton catches it, marks run as "failed":
```javascript
throw new Error("API key invalid — cannot proceed");
```

---

## Blank Template

Copy this block when designing a new submodule.

### Worksheet

| Phase | Decision | Value |
|-------|----------|-------|
| A | id | |
| A | name | |
| A | description | |
| A | step | |
| A | category | |
| A | cost | |
| A | version | 1.0.0 |
| B | data_operation_default | |
| B | requires_columns | |
| B | item_key | |
| C | display_type | |
| C | selectable | |
| C | output fields | |
| D | options | |
| E | needs HTTP | |
| E | progress reporting | |
| E | error handling | |
| E | summary description template | |
| — | Research brief link | |

### Generated manifest.json

```json
{
  "id": "",
  "name": "",
  "description": "",
  "version": "1.0.0",
  "step": 0,
  "category": "",
  "cost": "cheap",
  "data_operation_default": "add",

  "requires_columns": [],

  "options": [],
  "options_defaults": {},

  "item_key": "",

  "output_schema": {
    "display_type": "table"
  }
}
```

### Generated execute.js skeleton

```javascript
async function execute(input, options, tools) {
  const { entities } = input;
  const { logger, progress } = tools;

  const results = [];
  let totalItems = 0;
  const errors = [];

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    progress.update(i + 1, entities.length, `Processing ${entity.name}`);

    try {
      const items = []; // TODO: produce items

      results.push({
        entity_name: entity.name,
        items,
        meta: { total_found: items.length, errors: 0 }
      });
      totalItems += items.length;
    } catch (err) {
      logger.error(`${entity.name}: ${err.message}`);
      results.push({
        entity_name: entity.name,
        items: [],
        error: err.message,
        meta: { errors: 1 }
      });
      errors.push(`${entity.name}: ${err.message}`);
    }
  }

  const successCount = entities.length - errors.length;
  const description = errors.length > 0
    ? `${totalItems} items from ${successCount} of ${entities.length} entities (${errors.length} failed)`
    : `${totalItems} items across ${entities.length} entities`;

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

module.exports = execute;
```
