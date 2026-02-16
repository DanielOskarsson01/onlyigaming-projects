# BRUTAL CRITIC REVIEW — Seed Modules + Spec Consistency

You are a brutal, pedantic code reviewer. Your job is to find every contradiction, bug, gap, and inconsistency. Do NOT be nice. Do NOT assume anything works. Verify everything against the source specs.

## What to review

### Seed modules (4 files):
- `specs/seed-modules/step-1-discovery/sitemap-parser/manifest.json`
- `specs/seed-modules/step-1-discovery/sitemap-parser/execute.js`
- `specs/seed-modules/step-2-validation/url-dedup/manifest.json`
- `specs/seed-modules/step-2-validation/url-dedup/execute.js`

### Specs they must comply with (READ THESE FIRST):
- `specs/SKELETON_SPEC_v2.md` — Part 11 (Manifest Contract), Part 12 (Tools Object), Part 14 (Execute Function Contract)
- `specs/CLAUDE_MODULES.md` — Module rules and execute input contract
- `specs/BUILD_PLAN.md` — Phase 0 steps 11-12 (seed module copy)

## Review checklist — check EVERY item

### Manifest compliance (per Part 11):
- [ ] Every required field present? (id, name, description, version, step, category, cost, data_operation_default, requires_columns, item_key, output_schema)
- [ ] options_defaults keys exactly match options[].name keys?
- [ ] options[].default values match corresponding options_defaults values?
- [ ] options[].type is one of: "boolean", "number", "text", "select", "textarea"?
- [ ] output_schema format is field-name-as-key with type strings (NOT a "fields" array)?
- [ ] output_schema has display_type and it's one of: "table", "url_list", "content_cards", "file_list"?
- [ ] cost is one of: "cheap", "medium", "expensive"?
- [ ] data_operation_default is one of: "add", "remove", "transform"?
- [ ] No options_component declared (v1 deferred)?

### Execute.js compliance (per Part 14):
- [ ] Signature is exactly: async function execute(input, options, tools)
- [ ] Destructures entities from input (not input directly)
- [ ] Uses ONLY tools.logger, tools.http, tools.progress from tools object (Part 12)?
- [ ] tools.http return shape: { status, headers, body } — NOT fetch-style .ok/.text()
- [ ] Returns { results: [...], summary: {...} }?
- [ ] Each result has: { entity_name, items: [...], meta: {...} }?
- [ ] Summary has: { total_entities, total_items, errors }?
- [ ] Handles missing required fields gracefully (skip + log, don't crash)?
- [ ] module.exports = execute (CommonJS)?

### Step 2+ input contract (per Part 14 enrichment section + CLAUDE_MODULES.md):
- [ ] url-dedup reads entity.items (NOT entity.url or flat entity fields)?
- [ ] Handles empty/missing entity.items gracefully?
- [ ] sitemap-parser does NOT read entity.items (Step 1 = flat entities)?

### Cross-document consistency:
- [ ] SKELETON_SPEC Part 14 input enrichment section matches CLAUDE_MODULES.md execute input contract?
- [ ] BUILD_PLAN Phase 0 folder structure matches actual seed-modules/ directory structure?
- [ ] BUILD_PLAN step 12 copy command source path matches where files actually are?
- [ ] Manifest output_schema field names match what execute.js actually returns in items?
- [ ] Manifest requires_columns match what execute.js actually checks for?
- [ ] Manifest options[].name keys match what execute.js destructures from options?

### Code quality (find bugs, not style preferences):
- [ ] Any unhandled exceptions that would crash the worker?
- [ ] Any wrong variable references or typos?
- [ ] Any logic bugs in the dedup algorithm?
- [ ] Any regex that would fail on valid input?
- [ ] Any infinite loops or unbounded recursion?
- [ ] Any case where entity.name could be undefined?

## Output format

For each finding, use:
- 🔴 CRITICAL — Will cause runtime failure or spec violation
- 🟡 WARNING — Won't crash but is wrong or risky
- 🟢 SUGGESTION — Nice to have, not required

Format:
```
🔴 CRITICAL: [title]
File: [filename:line]
Spec reference: [which spec section contradicts]
What's wrong: [exact problem]
Fix: [exact fix]
```

At the end, give a GO / NO-GO verdict for Phase 0 readiness.

## Rules
- Read ALL spec sections listed above BEFORE reviewing any module code
- Do not skip any checklist item — mark each explicitly
- If you find zero issues, you're not looking hard enough
- Do NOT review code style, naming conventions, or formatting — only correctness and spec compliance
- Every claim must reference the specific spec section that supports or contradicts it
