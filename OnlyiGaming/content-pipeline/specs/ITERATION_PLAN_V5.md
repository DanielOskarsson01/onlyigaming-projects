# Content Pipeline - Iteration Plan v5

> **Date:** 2026-04-26 (revised 2026-04-29 post-CTO-audit)
> **Predecessor:** ITERATION_PLAN_V4.md (frozen historical snapshot, 2026-04-24)
> **Context:** V5 adjusts V4 to reflect Phase 1/2 execution, items cut during testing, and the Versioning Architecture design that replaces E3 preset bundles. V4 stays untouched as a record of what was planned. V5 is the working document.
>
> **2026-04-29 revision:** Phase 3-6 restructured into Phase 3-7 to combine quality and routing infrastructure into one phase. The original V5 had Phase 3 (QA tuning alone), Phase 4 (humanizer alone), Phase 5 (escalation + routing alone). Strategic insight: shipping QA improvements without routing means catching more problems but not fixing them - 80% of failures still need manual intervention. Routing infrastructure must ship together with QA improvements to deliver real quality gains. The combined Phase 3 (Quality Foundation) is bigger than the original Phase 3, but smaller than Phase 3+4+5 combined, and ships a working remediation pipeline rather than just better detection.

---

## REVIEWS APPLIED

### CTO Review (from V4)
- B1 (Load More) blocker removed
- Escalation gates: both, Gate 1 after Step 2, Gate 2 after Step 4
- qa-consolidate dropped (loop-router already does it)
- Versioned presets: new table (submodule_preset_bundles)
- Humanizer reordered BEFORE tone-seo-editor
- Quick wins unparked (D1 to Phase 1, D2 to Phase 2)
- 6 gaps added (timeouts, DECISION_TARGET_MAP, loop guard, B023, etc.)
- **PUSHBACK KEPT: qa-structural stays** - can't optimize what you can't measure

### Brutal Critic (score: 4/10, from V4)
- **Module names corrected** - actual Step 6: hallucination-detector, meta-compliance-checker, keyword-sufficiency-checker, citation-coverage-checker (4, not 3)
- **Presets + routing ship together** - no dead infrastructure
- **Gate 2 kept** - simple word count filter catches 50-word teasers early. Quick and easy.
- **Phase 0 (Measure) rejected** - output already measured. 11 entities tested, every single one had failures, many had several. That's why this plan exists.
- **Humanizer stays** - text is painfully AI-sounding. Confirmed by reading actual output. Not premature.
- **qa-ai-detector** - small insignificant step, not complicated. Ships with humanizer.
- **Scope note** - this is a strategic plan, not a sprint backlog. Details are finalized right before each phase starts.

### V5 Adjustments (post-execution reality check)

Items cut or replaced during Phase 1/2 execution:

- **A2 google-pse-news: CUT** — Replaced by google-pse-curated-search (one configurable submodule instead of three separate ones)
- **A3 google-pse-directories: CUT** — Same, merged into google-pse-curated-search
- **A4 linkedin-discovery: CUT** — PSE-based LinkedIn discovery (via google-pse-curated-search with LinkedIn site list) confirmed sufficient for name-based use case. Dedicated submodule deferred to B044.
- **D2 compact reference docs: CUT** — `primary_categories` field doesn't exist in content-analyzer output. "60% savings" claim was unmeasured. Prompt caching (B035) is higher-ROI for the same goal.
- **E3 preset bundles: REMOVED** — Replaced by Versioning Architecture (Multi-Card Pattern). Cross-template preset sharing either too generic to be useful or creates silent coupling between templates.
- **E6 MAX_ROUTING_LOOPS: REMOVED** — Per-entity `max_loops=3` in routingHandler is mathematically sufficient for termination. An entity that passes iteration N cannot appear in iteration N+1. Run-level safety ceiling already exists in autoExecutor (commit `46fd49e`).

---

## ITERATION SCOPE

Fix a pipeline where 11/11 test entities failed QA. Every track addresses confirmed problems, not hypothetical ones.

**Phase 1: DONE.** All 6 bug fixes + quick wins shipped (skeleton `4cd1f2c`, modules `7c136e0`).

**Phase 2: DONE.** Scraping + pagination items shipped. Discovery submodules (A2/A3/A4) cut — replaced by google-pse-curated-search concept. D2 cut — unmeasured claim. 15+ unplanned items shipped during testing (Bright Data Web Unlocker, anti-detection hardening, url-canonicalizer, deep-links overhaul, auto-detect Load More, options merge fix, timeout improvements, CI/CD safeguards, and more). All shipped items evaluated through CTO review during implementation.

**Between Phase 2 and Phase 3 (Apr 29 – May 6):** Non-V5 work shipped while Phase 3 planning was pending:
- Job Search pipeline: second content type proven (template + 3 submodules, zero skeleton changes). Not V5 scope.
- Data flow optimization: activated existing envelope system — pool_items IO reduced 57-84% per item. Reactive fix for Supabase Micro IO budget exhaustion, not V5 planned. Commits: `8b869ac`, `b42cb0c`, `c11388c`, `c345dfd`.
- Operational hardening: auto-resume orphaned runs (`926e36d`), 7-day retention service (`a339daa`), DB truncation recovery. Reactive fixes.

**Phases 3-7: Remain.** Quality Foundation (combined QA + routing + gates), Humanizer + AI Detection, PSE submodule, Prompt Caching, Production Hardening.

---

## ACTUAL STEP 6 QA SUBMODULES (corrected)

| Submodule | What it checks |
|-----------|----------------|
| hallucination-detector | Fact checks claims against source content |
| meta-compliance-checker | Meta title/description lengths, format compliance |
| keyword-sufficiency-checker | Keyword density, placement, coverage |
| citation-coverage-checker | Source attribution, citation presence |

4 existing submodules. Adding qa-structural and qa-ai-detector.

---

## TRACK A - NEW DISCOVERY SOURCES

**Goal:** More URLs from more source types per entity.

| Item | What | Status |
|------|------|--------|
| A1 | Fix page-links query string stripping (B027) | **DONE** — modules `7c136e0` |
| A-1 | Build google-pse-curated-search (replaces V4's A2/A3/A4) | Planned |
| A-2 | Multi-Card Submodule Pattern (architectural, see Versioning Architecture) | Planned |
| A5 | Build ai-discovery-scout (B028d) | Future |

### A-1: google-pse-curated-search submodule
One configurable Google PSE submodule replacing the planned google-pse-news + google-pse-directories + linkedin-discovery as three separate submodules. Configuration per instance: curated site list (JSON files in modules repo), query template, PSE ID. Per-API-key rate limiting via env vars in real units (requests/sec, burst, daily max). Defaults in code (5/sec, 10 burst, 500/day), env-overridable. Multi-card compatible from day one (multiple instances stackable). Scope: one submodule, four seed JSON lists, rate limiter utility. Scheduled for Phase 5 (after Phase 3 ships multi-card pattern).

### A-2: Multi-Card Submodule Pattern
Pipeline-wide capability for stacking submodule instances per step. Each instance has Round 1 (default) and optional Round 2-4 (retry variants) configurations. See Versioning Architecture section for full design. Substantial work: data model, execution logic, template editor UI. Reconciles with what V4 called E3 (preset bundles) — E3 is removed in V5, replaced by this. Scheduled for Phase 3 (combined with QA + gates).

A-2 ships first as part of Phase 3. A-1 ships in Phase 5 once the multi-card pattern is established.

---

## TRACK B - PAGINATION & SCRAPING

**Goal:** More content per URL.

| Item | What | Status |
|------|------|--------|
| B1 | Browser-crawler "Load More" clicking | **DONE** — skeleton `0450400`, modules `e536e2f`, `a2e9814` |
| B2 | url-filter browser fallback for Cloudflare | **DONE** — modules `e536e2f`, `258710b` |
| B3 | Browser-scraper auto-scroll | **DONE** — skeleton `4cd1f2c`, modules `7c136e0` |

All Track B items complete. Additionally shipped: browser-crawler `auto_click_load_more` with 35+ Playwright selectors for auto-detection (`a2e9814`), locator API migration with array selector support (`dcc5650`).

---

## TRACK C - EARLY ESCALATION (two gates)

**Goal:** Try harder before dropping, drop before wasting AI tokens.

### Gate 1: After Step 2 (volume check)
How many URLs survived url-filter? Cheap DB query on entity_stage_pool.
- Above threshold: proceed
- Below threshold: run escalation submodules (google-pse-curated-search with news/directory lists)
- Still below after escalation: mark failed, drop before Steps 3-6

### Gate 2: After Step 4 (quality check)
Sum word counts of scraped content. Catches 50-word teasers and thin pages early.
- Above threshold: proceed to Step 5
- Below threshold: try different source types or flag for manual review

### Config (per template)
```json
"escalation_rules": {
  "2": { "volume_threshold": 10, "escalation_submodules": ["google-pse-curated-search"] },
  "4": { "quality_threshold_words": 2000, "escalation_submodules": [] }
}
```

Insertion point: autoExecutor evaluateStepResult (line 270).

---

## TRACK D - PARTIALLY UNPARKED

| Item | What | Status |
|------|------|-------|
| D1 | Temperature + max_tokens manifest edits (B029 items 1,2) | **DONE** — skeleton `4cd1f2c`, modules `7c136e0` |
| D2 | ~~Compact reference docs + smart keyword filtering~~ | **CUT** — see V5 Adjustments |
| Rest | Prompt improvements, model selection tuning | Ongoing |

---

## TRACK E - ROUTING INFRASTRUCTURE

### What's done
- Step 7 router migration: DONE
- E1 flagged_when bug fix: DONE (skeleton `4cd1f2c`)

### What to build

**E4. Measurement/logging layer** - Phase 7

**E5. Migrate DECISION_TARGET_MAP** - Phase 7
Currently hardcoded in routingHandler.js. Move to manifest-driven declarations.

**B043. Multi-Card Pattern + routing rules editor** - Phase 3 (combined with QA + gates)

---

## QA LAYER

### Keep existing 4, add 2 new

| Submodule | Status | Change |
|-----------|--------|--------|
| hallucination-detector | Keep | Add model selection to manifest |
| meta-compliance-checker | Keep | Add model selection to manifest |
| keyword-sufficiency-checker | Keep | Add model selection to manifest. Separate from meta - routing needs granularity |
| citation-coverage-checker | Keep | Add model selection to manifest |
| qa-structural | NEW | Format spec adherence: sections, categories, tags, headings, FAQs, word counts |
| qa-ai-detector | NEW | Human/AI detection score. Ships with humanizer |

### qa-structural rationale (CTO pushback overruled)
CTO said "fix via content-writer prompts." Pushback: prompts change and fail across 1,200 entities with varying source quality. Every prompt improvement is a guess until you measure actual structural compliance rates. You can't optimize what you can't measure.

### qa-consolidate: NOT needed
Loop-router already does this (aggregateQaResults lines 67-98).

---

## STEP 5 - GENERATION CHAIN

### Current chain
```
content-analyzer -> seo-planner -> content-writer -> tone-seo-editor
```

### Target chain (humanizer BEFORE tone-seo-editor)
```
content-analyzer -> seo-planner -> content-writer -> humanizer -> tone-seo-editor
```

### Why this order
Humanizer makes prose natural first. Tone-seo-editor makes surgical keyword insertions into already-natural text. Keywords are words people actually search for - they're natural language by definition. SEO edits stick because nothing runs after. QA keyword failures route to tone-seo-editor (last step), which fixes them permanently.

Reversed order (humanizer last) creates a loop trap: QA fails on keywords, routes to tone-seo-editor, keywords placed, humanizer breaks them, QA fails again.

### Other changes
- Reference doc upload on all Step 5 submodules — **DONE** (tone-seo-editor was missing it, added in Phase 1, commit `7c136e0`)

---

## VERSIONING ARCHITECTURE (Multi-Card Pattern with Per-Entity Instructions)

V4's E3 (preset bundles) is **removed** in V5. Preset bundles assume reusable configurations across templates. For this pipeline, a "version" of a submodule includes template-specific prompts, reference docs, format specs, and tone guides. These cannot be meaningfully shared across funnels. Cross-template preset sharing would either be too generic to be useful or create silent coupling between templates.

### Cards
Stackable submodule instances per step. Each card has Round 1 (default) and optional Round 2-4 (retry variants). Each card has complete configuration: options, prompts, reference docs, format spec, tone guide. Configuration lives entirely in template's `execution_plan`. No cross-template sharing, no centralized preset library.

### Routing Rules (configured per template)
User maps each QA failure type to specific target cards. Targets identify cards by name across the pipeline (any step). Multiple failures from same entity aggregate their targets. Severity-based mapping supported (e.g., hallucination:high → step_1: PSE-v2 + step_3: scraper-deluxe-v2 + step_5: writer-v2; hallucination:low → no retry).

### Per-Entity Instructions (constructed at runtime)
Router reads each entity's QA failures. Looks up user's failure-to-card mappings in template. Produces per-entity instruction list:
```
Entity X: {step_1: card_a, step_3: card_b}
Entity Y: {step_5: card_c}
```
These instructions are passed to Round 2 execution.

### Round 2+ Execution
All retry-needing entities flow through pipeline from Step 1. At each step, submodules check per-entity instructions. If entity has v2 instruction for this step: submodule runs v2 logic for that entity. If no instruction: submodule processes normally (which already handles "no new data, approve and forward" case from Round 1). Pool accumulates per-entity changes naturally. No skeleton-level lane management needed.

### Submodule Behavior
Submodules read per-entity instructions. Branch behavior based on "v2/v3/v4 instructed?" flag. Pool updates work via existing data_operations (add, transform, replace). v2/v3/v4 cards are alternate code paths within the same submodule type. Already handle "skip and forward" pattern from Round 1 when entity has nothing to do.

### Round Progression
- Round 2 instructions trigger v2 cards
- Round 3 instructions trigger v3 cards (if configured)
- Round 4 instructions trigger v4 cards (if configured)
- If a step has only v2 configured but routing is on Round 3+: fall back to highest available variant (don't undo previous fix by reverting to Round 1)

### User Configuration (Template Setup)
1. Configure cards per step (with v2, v3, v4 variants where needed)
2. Map failures to v2/v3/v4 cards (which cards trigger for which QA failure types)

### UI Implications
- Template editor: cards stacked per step, "+" button to add variants
- Routing rules editor: per template, map QA failures to target cards
- No preset library page (no centralized preset management)
- Card configuration entirely on the card (no shared configurations)
- Template duplication is the cross-template reusability mechanism
- AI assistant (future) can read all card names and configs across templates for pattern recognition

### Implementation Phases (rough)
1. Multi-card pattern data model and execution
2. Per-entity instruction list construction at routing time
3. Submodule branching on per-entity instructions
4. Routing rules editor UI per template

Substantial work. Each phase needs its own planning round. Tracked as B043.

---

## EXECUTION ORDER

### Phase 1: Bug fixes + quick wins — **DONE**

All 6 items shipped. Skeleton `4cd1f2c`, modules `7c136e0`.

| # | Item | Commit |
|---|------|--------|
| 1 | Fix page-links query string stripping (A1/B027) | modules `7c136e0` |
| 2 | Fix flagged_when bug (E1/B024) | skeleton `4cd1f2c` |
| 3 | Browser-scraper auto-scroll (B3) | skeleton `4cd1f2c`, modules `7c136e0` |
| 4 | Add reference doc upload to tone-seo-editor | modules `7c136e0` |
| 5 | Temperature + max_tokens manifest edits (D1) | skeleton `4cd1f2c`, modules `7c136e0` |
| 6 | Add Step 6/7 timeout entries to timeouts.js | skeleton `4cd1f2c` |

### Phase 2: Scraping + pagination + testing — **DONE**

#### Original V4 items shipped
| # | Item | Commit |
|---|------|--------|
| 10 | Browser-crawler Load More clicking (B1) | skeleton `0450400`, modules `e536e2f` |
| 11 | url-filter Cloudflare fallback (B2) | modules `e536e2f`, `258710b` |
| — | B032 url-canonicalizer transform fix | skeleton `0450400`, modules `e536e2f` |

#### Items CUT from V4 Phase 2
| # | Item | Reason |
|---|------|--------|
| 7 | google-pse-news (A2) | Replaced by google-pse-curated-search concept |
| 8 | google-pse-directories (A3) | Replaced by google-pse-curated-search concept |
| 9 | linkedin-discovery (A4) | PSE-based LinkedIn discovery sufficient for primary use case |
| 12 | Compact reference docs + smart keyword filtering (D2) | primary_categories field doesn't exist, savings claim unmeasured |

#### Unplanned items shipped during Phase 2 testing
All evaluated through CTO review during implementation. Not unreviewed code — tactical fixes during real testing that surfaced issues V4 didn't anticipate.

| Item | Commit(s) |
|------|-----------|
| Bright Data Web Unlocker Cloudflare fallback tier | skeleton `2a57145` |
| Anti-detection hardening (Chrome UA 136, webdriver removed, chrome stubs, timezone/language) | skeleton `4123c9b` |
| Proxy 407 retry handling | skeleton `10d4311` |
| url-canonicalizer submodule (Step 2, redirect resolution + dedup) | modules `da1f637`, `4816cb3`, `e536e2f` |
| url-relevance drop criteria relaxed for B2B | modules `da1f637` |
| deep-links defaults overhaul (crawl all, max_pages 30/200, cost→expensive, junk URL filter) | modules `f49261a` |
| sitemap-parser exclude_patterns option + B040 browser fallback | modules `65a63f0`, `258710b` |
| browser-crawler auto_click_load_more (35+ auto-detect selectors) | modules `a2e9814` |
| browserPool click loop locator API migration (array selector support) | skeleton `dcc5650`, `6cea2dd` |
| Options merge bug fix (critical — OR fallback→spread merge) | skeleton `7b75114` |
| URL sanitization (trailing semicolons/commas) | skeleton `7b75114` |
| Step timeout failure-threshold evaluation (evaluate instead of hard-halt) | skeleton `2b252ec` |
| Step 2 timeout bumps (base 300→600s, entity factor 10→60s) | skeleton `3252397`, `8433912` |
| Expose res.url in http.get/head for redirect detection | skeleton `398d8a4` |
| PresetField UI fix (show all presets, allow saving new ones) | skeleton `2471398` |
| browser-scraper text_content preservation on pass-through | modules `96fb56a` |
| word_count NaN guards across 3 scrapers | modules `9a3f9ab` |
| 12-submodule manifest description enrichment | modules `dd9fea0` |
| CI/CD safeguards (stale .git removal, deployed commit verification) | skeleton `934708e` |
| api-search full text_content preservation | modules `87b2137` |

### Phase 3: Quality Iteration Foundation (not started, 4-6 weeks)

**Goal:** Ship the infrastructure that makes the pipeline produce usable output. Multi-card pattern, per-entity instructions, routing, gates, QA improvements, first round of v2 cards. Functional remediation pipeline where user can configure cards, routing rules, gates, and template authors iterate on prompts without code changes.

**Why combined:** QA improvements alone identify problems but don't fix them. Routing infrastructure alone has no improved QA to react to. Shipping them together delivers an actual quality gain - automatic remediation when QA detects problems, instead of flagging entities for manual intervention.

**Pre-Phase 3 sweep (before any Phase 3 work starts):** Resolve known sub-plan 1 leftover bugs that would compound under Phase 3 UI work. The principle: sweep clean before next build, so Phase 3 ships onto stable ground.

- **B052** — `onConflict` strings stale after Multi-Card Pattern migration. UI saves fail with "no unique or exclusion constraint matching the ON CONFLICT specification" error toast. Phase 3's card stacking UI (#16) and routing rules editor UI (#17) ship on top of this exact save path; fixing it before Phase 3 starts means new UI work runs on a healthy save path instead of inheriting a broken one. Filed 2026-06-06. See `specs/BACKLOG.md` for full diagnosis and fix scope.
- **B053** — Step 2 UI display doesn't reflect actual pool state between submodules. Per-submodule "received/approved/rejected" counts don't chain serially even though the underlying pool IS being filtered correctly. Operator confusion: pipeline looks broken but isn't. Phase 3's Multi-Card Pattern adds round indicators + card identity to per-step results display; building on top of an already-confusing per-submodule display layer will compound. Fix or relabel the display BEFORE Phase 3 UI work increases display complexity. Filed 2026-06-06. See `specs/BACKLOG.md` for full diagnosis and fix shape options.
- **B054** — applyDataOperation `remove` + `transform` failed to collapse multi-source duplicates. **STATUS: FIXED + DEPLOYED 2026-06-06** (commit `d45c16c`). Listed here as a record: the bug shipped 2026-05-24 in commit `4407a77` (V5 empty-pool-fix work) and ran for ~13 days before observed on a 2-entity test run. Phase 3 introduces new submodules (qa-structural, humanizer, qa-ai-detector) that will use `add`/`transform`/`remove` operations — building on the fixed contract instead of the broken one.
- **B055** — Phase 3 Entry Sweep: Skeleton Stability Audit. **CTO-mandated.** Three skeleton bugs (B052/B053/B054) surfacing in 24h of testing on 2026-06-06 is the visible part of an iceberg. Before Phase 3 (4-6 weeks of UI + QA work) begins, run a focused audit: (1) onConflict strings vs DB unique indexes; (2) data_operation consumers vs documented contracts; (3) UI counts vs actual pool sizes. 1-2 days of focused work. De-risks Phase 3 from building on hidden architectural drift. See `specs/BACKLOG.md` for full diagnosis.
- *(Add others here as discovered before Phase 3 starts. Items that surface during single-pass test runs and that would compound under Phase 3 scope belong in this sweep.)*

Estimated sweep effort: <1 day. Treat as Phase 3 entry gate, not part of Phase 3 scope itself. Phase 3 task numbering (#13-33 below) starts after the sweep is clear.

**Scope:**

Infrastructure (B043 Multi-Card Pattern + Routing):
13. Multi-card data model (execution_plan structure supports multiple cards per submodule slot, schema migration if needed)
14. Per-entity instructions data structure (tracks card targets and consumed versions per entity)
15. Multi-card execution logic (autoExecutor, submoduleRuns read card definitions, branch on round)
16. Card stacking UI in template editor ("+" button, round dropdown, name field, add/remove/reorder)
17. Routing rules editor UI (per template, map QA failure types to target cards)
18. Step 7 routing logic updated for per-entity instructions (consult what's available, what's consumed)

Escalation Gates (Track C):
19. Gate 1 implementation (after Step 2, URL count threshold check)
20. Gate 2 implementation (after Step 4, word count threshold check)
21. escalation_rules in execution_plan (per-template configuration)
22. Gates write to per-entity instructions, mark v2 as consumed (Step 7 won't re-trigger same v2)

QA improvements:
23. Add model_select to all 4 QA submodule manifests (Opus for hallucination, Sonnet for others)
24. Adjust QA thresholds based on observed Phase 2 failures
25. Build qa-structural submodule (format spec adherence: sections, categories, tags, headings, FAQs, word counts)
26. Test E1 fix end-to-end (verify routing works)

First round of v2 cards (template-level work, company_profile template):
27. PSE-v2 card (Step 1, broader curated list, different query template)
28. scraper-deluxe-v2 card (Step 3, Bright Data Web Unlocker for hard URLs)
29. content-writer-v2 card (Step 5, stricter prompt, citation-required)
30. SEO-writer-v2 card (Step 5, stricter meta requirements)
31. Routing rules configured for company_profile template (failure -> card mappings)
32. Escalation rules configured (Gate 1: URL<10 -> PSE-v2; Gate 2: words<2000 -> scraper-deluxe-v2)

Validation:
33. End-to-end testing on 50-entity run, target 80%+ pass rate on existing 4 QA checks

### Phase 4: Humanizer + AI Detection (not started, 2 weeks)

**Goal:** Address AI-sounding output. Build humanizer submodule, build qa-ai-detector, integrate into Step 5 chain and routing.

**Depends on:** Phase 3 complete (uses multi-card pattern, routing rules editor)

**Scope:**
34. Build humanizer submodule (Step 5, position: after content-writer, before tone-seo-editor)
35. Build qa-ai-detector submodule (Step 6, configurable threshold)
36. Reorder Step 5 chain: content-analyzer -> seo-planner -> content-writer -> humanizer -> tone-seo-editor
37. humanizer-v2 card (more aggressive humanization for repeat retries)
38. Routing rules updated: ai_score > 0.7 -> humanizer-v2

### Phase 5: google-pse-curated-search (not started, 1-2 weeks)

**Goal:** Add new discovery source. One configurable PSE submodule replacing planned A2/A3/A4.

**Depends on:** Phase 3 complete (uses multi-card pattern from day one)

**Scope:**
39. Build google-pse-curated-search submodule (configuration: curated list, query template, PSE ID)
40. Per-API-key rate limiting via env vars (5/sec, 10 burst, 500/day defaults, env-overridable)
41. Seed JSON lists: igaming-directories, linkedin-companies, linkedin-people, igaming-news-domains
42. Template integration: configure cards in company_profile template using new submodule
43. Update routing rules and escalation gates to target the new cards

### Phase 6: Pipeline-Wide Token Optimization (not started, 2 weeks)

**Goal:** Reduce LLM costs via prompt caching for static per-run content.

**Depends on:** Pre-work audit (where Anthropic SDK calls happen)

**Scope:**
44. Audit codebase: SDK calls centralized in helper or duplicated per submodule?
45. Add per-LLM-call token logging (input, output, cache_creation, cache_read, cost)
46. Run baseline: one full pipeline run, document token usage
47. Mark cacheable content in API calls (reference docs, system prompts, format_spec, tone_guide)
48. Apply caching to all Step 5 generation submodules and Step 6 QA submodules
49. Validation run: target 50%+ reduction in input tokens for repeated calls within a run

### Phase 7: Production Hardening (not started, 2-3 weeks)

**Goal:** Address scalability and operational concerns before high-volume production runs.

**Depends on:** Phases 3-6 complete

**Scope:**
50. B023: Per-submodule concurrency (entity-level only currently, blocks production-scale 1000+ entity runs)
51. E5: Migrate DECISION_TARGET_MAP to manifest-driven (currently hardcoded in routingHandler.js)
52. E4: Measurement/logging layer (per-submodule cost logging, QA pass/fail rates over time, routing decision tracking)
53. Step 8 compatibility verification after content structure changes from Phases 3-4

Also ongoing throughout Phases 3-7:
- Run pipeline, refine routing rules and v2 prompts based on what fails
- Tune humanizer via qa-ai-detector scores
- Track D remainder (prompt improvements, model selection)
- This is iteration, not a phase

---

## DEPENDENCIES

```
Phase 1 (bug fixes + quick wins)        -----> DONE
Phase 2 (scraping + testing)            -----> DONE
Phase 3 (Quality Foundation)            -----> E1 fix → SATISFIED (Phase 1)
                                                Combines QA + routing + gates + v2 cards
Phase 4 (Humanizer + qa-ai-detector)    -----> Phase 3 complete (uses multi-card)
Phase 5 (google-pse-curated-search)     -----> Phase 3 complete (uses multi-card)
Phase 6 (Prompt Caching)                -----> SDK call audit pre-work
Phase 7 (Production Hardening)          -----> Phases 3-6 complete
```

After Phase 7, the V5 quality iteration is complete. Next strategic phases (News content type, Podcast content type, Self-Service Registration) are tracked in ROADMAP.md.

---

## MISSING ITEMS ADDED (CTO gaps, updated for V5)

| Gap | Impact | Where | Status |
|-----|--------|-------|--------|
| No Step 6/7 timeouts in timeouts.js | Low | Phase 1 | **DONE** |
| DECISION_TARGET_MAP hardcoded | Medium - blocks E5 | Phase 7 | Open |
| ~~MAX_ROUTING_LOOPS guard~~ | ~~Medium~~ | ~~Phase 5~~ | **REMOVED** — per-entity max_loops sufficient |
| B023 per-submodule concurrency | High at scale | Phase 7 | Open |
| Escalation E2E needs gates infrastructure | Low - implicit | Noted | Open until Phase 3 |
| Step 8 compat after structure changes | Low | Phase 7 | Open |

---

## BACKLOG UPDATES

| ID | Change |
|----|--------|
| B013 | Humanizer - BEFORE tone-seo-editor in chain |
| B024 | flagged_when bug - **FIXED (Phase 1)** |
| B025 | Early escalation - two gates (Step 2 volume, Step 4 quality) |
| B026 | Load More - **FIXED (Phase 2)** |
| B027 | Query string bug - **FIXED (Phase 1)** |
| B029 | Items 1-2 **DONE (Phase 1)**, items 3-4 **CUT (D2)** |
| B032 | url-canonicalizer transform bug - **FIXED (Phase 2)** |
| B040 | Sitemap-parser browser fallback - **FIXED (Phase 2)** |
| B043 | NEW: Multi-Card Submodule Pattern (replaces V4's E3 preset bundles) |
| B044 | NEW: Dedicated LinkedIn Discovery Submodule (deferred from V4's A4) |
| B045 | NEW: V5 Plan Reconciliation Tracking |
| CORRECTED | Step 6 module names: meta-compliance-checker, keyword-sufficiency-checker, citation-coverage-checker |
| REMOVED | submodule_preset_bundles table (E3) — replaced by Versioning Architecture |
| REMOVED | MAX_ROUTING_LOOPS guard (E6) — per-entity max_loops sufficient |
| KEPT | qa-structural submodule (Phase 3) |
| KEPT | qa-ai-detector submodule (Phase 4, ships with humanizer) |
| KEPT | DECISION_TARGET_MAP migration (Phase 7) |
| KEPT | Model selection on all QA manifests (Phase 3) |
| KEPT | Reference doc upload on tone-seo-editor — **DONE (Phase 1)** |
