# Central Registry

**Purpose:** Cross-session awareness. Every agent logs changes here. Read at session start to catch up.

---

## Recent Actions

| Timestamp | Project | Agent | Action | Path | Notes |
|-----------|---------|-------|--------|------|-------|
| 2026-03-23 | Content-Pipeline | session-closer | Fixed/Created | stageWorker.js, SubmodulePanel.tsx, client.ts, submoduleRuns.js, schema.sql, code-review skill | Fixed empty text (FK constraint drop), all-or-nothing failure display (synthetic error items), added Download All CTA for per-entity batch mode (new /all-items endpoint), created /code-review pre-commit skill. 4 commits pushed. |
| 2026-03-23 | Content-Pipeline | session-closer | Created | modules/step-6-qa/*, step-4-filtering/intent-tagger, step-5-generation/tone-seo-editor, step-8-bundling/schema-org-injector, step-10-review/loop-router | Built 7 new submodules (citation-coverage-checker, keyword-sufficiency-checker, hallucination-detector, intent-tagger, tone-seo-editor, schema-org-injector, loop-router). Fixed 8 rendering bugs (flagged_when string coercion, array→string outputs, invalid display types). Total built submodules: 29. |
| 2026-03-22 | Content-Pipeline | claude | Restructured | CLAUDE.md, skills/, docs/SUBMODULE_INVENTORY.md | Doc restructure: CLAUDE.md 191→79 lines (rules only). /submodule-create skill rewritten as 44-line thin router with decision guidance (points to SUBMODULE_DEVELOPMENT.md). Inventory table extracted to docs/SUBMODULE_INVENTORY.md. Submodule CLAUDE.md now required (stale-docs rule). Cross-references added between skills. |
| 2026-03-22 | Content-Pipeline | claude | Fixed | api-scraper/execute.js, manifest.json, README.md | ScrapFly rate limiting: 429 circuit breaker (3 consecutive = abort), global token-bucket rate limiter (10 req/min), reduced retry delays. Comprehensive README rewrite (230+ lines). |
| 2026-03-22 | Content-Pipeline | claude | Created | skills/submodule-readme/SKILL.md, skills/submodule-create/SKILL.md | Two skills: /submodule-readme (documentation generator + conversational descriptions) and /submodule-create (creation workflow + decision guidance). |
| 2026-03-22 | Content-Pipeline | claude | Fixed | content-pipeline-v2/client/src/components/primitives/UrlTextarea.tsx | URL textarea: added Name; URL format (semicolon separator), fixed bare domain name derivation. |
| 2026-03-21 | Content-Pipeline | session-closer | Created | content-pipeline-modules-v2/modules/step-3-scraping/api-scraper/ | api-scraper submodule: ScrapFly API fallback for Cloudflare-protected sites (manifest.json, execute.js, README.md). 6 commits: creation + 5 iterative block detection fixes. |
| 2026-03-21 | Content-Pipeline | session-closer | Fixed | content-pipeline-v2/server/routes/submoduleRuns.js | Per-entity pool dedup bug: `add` operation used item_key alone, dropping sibling submodule items. Now uses composite key (item_key + source_submodule). Fixed Step 5 content-writer "Missing upstream output: seo-planner" error. |
| 2026-03-20 | Content-Pipeline | claude | Created | Content-Pipeline/specs/submodule-briefs/ (28 files) | 28 submodule research briefs written across Steps 1-10. Parallel development decision: submodules are pure functions with defined contracts, can be built independently by second Claude session, freelancer, or claude.ai. Key corrections: PSE Directories = one configurable submodule (not per-directory), Curated List Import = separate from PSE, AI Discovery Scout runs first (generates leads for downstream), Image & Logo Search added to Step 1, SEO Keyword Researcher added to Step 5 (Ahrefs/SERPApi), Media Transcript Fetcher moved from Step 5 to Step 3, Step 5 media split into 3 (Image/Video/Audio generators). |
| 2026-03-17 | Infrastructure | claude | Installed | ~/.mcp.json, skills/meeting-agenda/ | Google Docs MCP server (read/write Docs/Sheets/Drive), meeting-agenda skill (professional .docx agendas with clickable links + decision/goal boxes) |
| 2026-03-19 | Content-Pipeline | session-closer | Fixed | stageWorker.js | Null byte sanitization before PostgreSQL JSONB write — fixes Play'n GO Step 3 "unsupported Unicode escape sequence" error in per-entity mode |
| 2026-03-19 | Content-Pipeline | session-closer | Fixed | runs.js, submoduleRuns.js | Per-entity URL forwarding: entity summaries out of working_pool, input_data lazy-populate, logger crash fix, hard reset cascade delete, transform approval key-based replacement |
| 2026-03-17 | Content-Pipeline | claude | Fixed | submoduleRuns.js, runs.js | Pool operations: granularity-aware transform (entity_name keeps url-level items), poolKey uses source submodule's item_key, pool pruning after Step 5 (~95% size reduction) |
| 2026-03-17 | Content-Pipeline | claude | Fixed | json-output/execute.js, markdown-output/execute.js | Step 8 bundlers prefer AI-written content (section_count) over raw scraped content_markdown |
| 2026-03-17 | Content-Pipeline | claude | Fixed | browserPool.js | B008 browser scraper working — removed --single-process flag, added isConnected() crash recovery. Extraction rate improved. |
| 2026-03-17 | Content-Pipeline | claude | Fixed | runs.js (reopen handler) | Step reopen now initializes working_pool from input_data instead of empty array |
| 2026-03-17 | Content-Pipeline | claude | Deployed | Both repos pushed | CI/CD auto-deploy to Hetzner. Flow test in progress — browser scraper working, bundler data flow fixed, URL pattern filter timeout being investigated |
| 2026-03-13 | SEO | claude | Created | SEO/OnlyiGaming_SEO_Tasks.docx, SEO/OnlyiGaming_SEO_Strategy_v3.docx | Strategy v3 + Task List v3 finalized. Audience-agnostic section added, Phase 0 removed, canonical URLs added (7.1), NewsArticle schema (7.2), all FAQ content marked complete for 80+ categories |
| 2026-03-13 | SEO | claude | Updated | SEO/CLAUDE.md, SEO/PROJECT_STATUS.md | Session close: synced to v3 content, task number contract documented, Stefan's 5 review tasks defined, wave language retired |
| 2026-03-13 | Content-Pipeline | claude | Fixed | stepContext.js, UrlTextarea.tsx, CsvUploadInput.tsx | Entity name contract: auto-derive name from URL, column alias system (Company Name→name, URL→website, etc.), safety net fallback |
| 2026-03-13 | Content-Pipeline | claude | Updated | BACKLOG.md | B011 expanded to include Mercury (Inception Labs). B012 added: prompt archive / option presets |
| 2026-03-13 | Content-Pipeline | claude | Created | PROJECT_OVERVIEW.md (memory) | Cross-project status tracker in .claude/projects memory |
| 2026-03-11 | Content-Pipeline | claude | Fixed | 8 files in modules repo (commit 7a0f815) | Data shape fixes (frontmatter, schema.org, Strapi, keywords), display_type→cards, url-filter auto-remove, http.head() |
| 2026-03-07 | Content-Pipeline | claude | Created | 5 Step 8 bundling submodules | markdown-output, html-output, json-output, meta-output, media-output (Phase 11 complete) |
| 2026-03-07 | Content-Pipeline | claude | Fixed | 3 CTO review issues | removeMetaSection regex (Perl→JS), removed dead "custom" option, added downloadable_fields |
| 2026-03-07 | Content-Pipeline | claude | Updated | BUILD_PLAN.md, BACKLOG.md, CLAUDE.md (both repos) | Phase 11 documented, data-shape routing guide added |
| 2026-02-25 | Content-Pipeline | claude | Created | Step 5 generation submodules | content-analyzer, seo-planner, content-writer (v1.3.0) |
| 2026-02-23 | Content-Pipeline | claude | Created | content-filter submodule | Step 4 filtering submodule |
| 2026-02-21 | Content-Pipeline | claude | Created | page-scraper submodule | Step 3 scraping submodule |
| 2026-02-17 | Content-Pipeline | claude | Completed | Phase 10 (UI polish) | ContentRenderer pagination, Previous Run Summary, flagged_when, display_type, console.log cleanup |
| 2026-02-16 | Content-Pipeline | claude | Fixed | P9-003 through P9-011 (9 bugs) | Phase 9 testing: data operation semantics (＝/➖/➕), sibling chaining, tools.ai, textarea sharing, reopen step, flagged pre-deselection, clickable URLs, query invalidation |
| 2026-02-16 | Content-Pipeline | claude | Modified | content-pipeline-v2: 13 files | submoduleRuns.js (input resolution), runs.js (reopen), submoduleConfig.js (textarea→step_context), SubmodulePanel, ContentRenderer, StepApprovalFooter, useRun, useSubmoduleRuns, RunView, Step0View, UniversalStepTemplate, client.ts, stageWorker.js |
| 2026-02-16 | Content-Pipeline | claude | Modified | content-pipeline-modules-v2: 4 files | 3x manifest.json (add→transform), url-filter/execute.js (sort excluded to top) |
| 2026-02-16 | Content-Pipeline | claude | Created | url-relevance submodule | New Step 2 submodule: LLM-based URL classification (manifest.json + execute.js) |
| 2026-02-16 | Content-Pipeline | claude | Updated | PROJECT_STATUS.md, ROADMAP.md, BACKLOG.md, CLAUDE.md | Phase 9 documentation: status, findings, phase markers |
| 2026-02-15 | Content-Pipeline | claude | Rewritten | CLAUDE.md, PROJECT_STATUS.md, ROADMAP.md | Doc reorganization: trimmed ~1600→~360 lines, removed stale schema refs, session logs moved to sessions/ |
| 2026-02-15 | Content-Pipeline | claude | Created | sessions/SESSIONS_2026-01-23_to_2026-01-29_Early_History.md | Extracted 12 early sessions from PROJECT_STATUS |
| 2026-02-15 | Content-Pipeline | claude | Created | sessions/SESSION_2026-02-14_Phase8_StepToStep_Plumbing.md | Extracted from old root CLAUDE.md |
| 2026-02-15 | Content-Pipeline | claude | Fixed | R004, K003, R008, R009 (Phase 8b) | Query invalidation scoped, step approval transaction (RPC), async CSV parse, local stepConfig |
| 2026-02-15 | Content-Pipeline | claude | Fixed | R001, R002, R003 (Phase 8b) | handleNext race (await save), orphaned pending row (try/catch enqueue), global ErrorBoundary |
| 2026-02-15 | Content-Pipeline | claude | Created | specs/BACKLOG.md | Consolidated known issues (K001-K004) + backlog (B001-B003) from PROJECT_STATUS + ROADMAP |
| 2026-02-15 | Content-Pipeline | claude | Updated | specs/CLAUDE.md | Phase marker: Phase 0 → Phase 9 |
| 2026-02-14 | Content-Pipeline | claude | Modified | content-pipeline-v2: 10 files | Phase 8: step-to-step plumbing, description pattern, previous step data display |
| 2026-02-14 | Content-Pipeline | claude | Modified | content-pipeline-modules-v2: 4 files | Phase 8: summary.description in sitemap-parser + url-dedup execute.js |
| 2026-02-14 | Content-Pipeline | claude | Modified | SKELETON_SPEC_v2.md | Added rendering rule + ContentRenderer TODO note |
| 2026-02-11 | Content-Pipeline | claude | Created | sessions/SESSION_2026-02-11_UI_Component_Review.md | UI component review session documentation |
| 2026-02-11 | Content-Pipeline | claude | Rewritten | specs/UI_REFERENCE.md | All 6 components specified, ownership model table, CTA inventory |
| 2026-02-11 | Content-Pipeline | claude | Created | submodule-panel.jsx (Claude.ai) | Complete panel reference with 3 accordions, fixed 480px width |
| 2026-02-11 | Content-Pipeline | claude | Updated | step1-category-cards.jsx (Claude.ai) | Added data ops (➕➖＝), per-submodule summary rows |
| 2026-02-09 | Content-Pipeline | claude | Reorganized | Project folder structure | **Major restructure:** Code repo cleaned (only CLAUDE.md, READMEs), all docs moved to project folder |
| 2026-02-09 | Content-Pipeline | claude | Created | specs/ (15 files) | SKELETON_SPEC.md, SKELETON_DEFINITION_v2.md, SKELETON_SPEC_DELTA.md, STRATEGIC_ARCHITECTURE.md, etc. |
| 2026-02-09 | Content-Pipeline | claude | Created | guides/ (4 files) | How-to guides including QUICKSTART.md |
| 2026-02-09 | Content-Pipeline | claude | Created | sessions/ (3 files) | Session logs including ARCH_REVIEW_React_Rebuild.md |
| 2026-02-09 | Content-Pipeline | claude | Created | archive/ (14 files) | Old .md and .docx files preserved |
| 2026-02-08 | Content-Pipeline | claude | Created | specs/SKELETON_SPEC_DELTA.md | 4 agreed changes not yet implemented (icons, chaining, CTAs, universal template) |
| 2026-02-08 | Content-Pipeline | claude | Created | specs/SKELETON_DEFINITION_v2.md | Updated skeleton definition - what skeleton provides vs submodules |
| 2026-02-07 | Content-Pipeline | claude | Created | specs/SKELETON_SPEC.md | Full skeleton specification v1.2 - two-repo split, manifest contract |
| 2026-02-07 | Content-Pipeline | claude | Created | specs/STRATEGIC_ARCHITECTURE.md | Strategic architecture - WHY decisions were made, AI containment rationale |
| 2026-02-04 12:00 | Root | claude | Modified | GLOBAL_AGENT_INSTRUCTIONS.md | Added Architecture Check (Step 3), Implementation Checkpoints |
| 2026-02-04 12:00 | Content-Pipeline | claude | Modified | CLAUDE.md | Added MANDATORY architecture enforcement section |
| 2026-02-04 11:00 | Content-Pipeline | claude | Modified | WORKFLOW.md | Added zombie process cleanup, automated testing section |
| 2026-02-04 11:00 | Content-Pipeline | claude | Modified | INFRASTRUCTURE.md | Updated local dev (unified npm run dev), removed Alpine.js refs |
| 2026-02-04 11:00 | Root | claude | Modified | GLOBAL_AGENT_INSTRUCTIONS.md | Added Architecture Change Protocol, narrowed coworker pattern to browser-only |
| 2026-02-04 10:30 | Content-Pipeline | claude | Created | playwright.config.js | E2E test configuration |
| 2026-02-04 10:30 | Content-Pipeline | claude | Created | tests/e2e/app.spec.js | Sample E2E test |
| 2026-02-04 10:30 | Content-Pipeline | claude | Created | client/src/test/setup.ts | Vitest setup |
| 2026-02-04 10:30 | Content-Pipeline | claude | Created | client/src/stores/appStore.test.ts | Sample store test |
| 2026-02-04 10:30 | Content-Pipeline | claude | Modified | client/package.json | Added Vitest, testing-library |
| 2026-02-04 10:30 | Content-Pipeline | claude | Modified | client/vite.config.ts | Added Vitest config |
| 2026-02-04 10:30 | Content-Pipeline | claude | Modified | package.json | Added @playwright/test, e2e scripts, concurrently |
| 2026-02-04 09:00 | Root | claude | Created | .tools/brochures/md_to_brochure.py | PDF brochure generator (ReportLab) |
| 2026-02-04 09:00 | Root | claude | Created | .claude/commands/brochure.md | Brochure skill definition |
| 2026-02-04 09:00 | Root | claude | Created | .claude/settings.json | Auto-approve read-only permissions |
| 2026-02-04 09:00 | Root | claude | Created | research/DEV_WORKFLOW_BEST_PRACTICES.md | 681 lines research on dev workflows |
| 2026-02-02 14:00 | Content-Pipeline | session-closer | Created | docs/SESSION_2026-02-02_React_Migration.md | Full session documentation (React migration) |
| 2026-02-02 14:00 | Content-Pipeline | session-closer | Modified | CLAUDE.md | Added React migration session log |
| 2026-02-02 14:00 | Content-Pipeline | session-closer | Modified | PROJECT_STATUS.md | Updated status, milestone progress, session log |
| 2026-02-02 14:00 | Content-Pipeline | session-closer | Modified | ROADMAP.md | Added Phase 1.7 (React Migration), milestone tracking |
| 2026-02-02 12:00 | Content-Pipeline | claude | Created | client/* (36 files) | React client: Step 0 & 1, shared components, stores, API client (6,441 lines) |
| 2026-02-02 12:00 | Content-Pipeline | claude | Modified | .gitignore | Added client/dist/, client/node_modules/ |
| 2026-02-02 12:00 | Content-Pipeline | claude | Modified | public/index.html | Alpine UI updates (66 lines) |
| 2026-02-02 12:00 | Content-Pipeline | claude | Modified | routes/submodules.js | Added new endpoints (74 lines) |
| 2026-02-02 12:00 | Content-Pipeline | claude | Deleted | docs/* (9 files) | Moved to OnlyiGaming/content-pipeline/docs/ (3,329 lines) |
| 2026-01-29 18:00 | Community | claude | Modified | COMMUNITY_PRODUCT_VISION.md | Major revision: Sections 4-9 expanded, Appendix B (Maria scenario), Appendix C (revenue mapping), Notes for Future Work (28 items with build vs buy) |
| 2026-01-29 14:00 | Content-Pipeline | claude | Modified | docs/ARCHITECTURE_DECISIONS.md | Corrected submodule flow, added step-level approval, inline search section |
| 2026-01-29 14:00 | Content-Pipeline | claude | Modified | docs/Full_Workflow_Document_With_Intro_Formatted_v3.md | Rewrote to v3.2, all steps updated for 11-step structure |
| 2026-01-29 13:00 | Content-Pipeline | claude | Modified | PROJECT_STATUS.md | Added architecture summary, step_context table, 11-step refs |
| 2026-01-29 13:00 | Content-Pipeline | claude | Modified | ROADMAP.md | Added shared step context section, session log |
| 2026-01-29 13:00 | Content-Pipeline | claude | Modified | CLAUDE.md | Updated to 11-step pipeline |
| 2026-01-29 13:00 | Content-Pipeline | claude | Modified | docs/bullmq_architecture_doc.md | Added shared step context section |
| 2026-01-29 13:00 | Content-Pipeline | claude | Modified | docs/Universal_Content_Pipeline_Architecture.md | Updated to 11-step, content reuse marked Phase 2 |
| 2026-01-29 12:00 | Content-Pipeline | claude | Created | docs/ARCHITECTURE_DECISIONS.md | Master architecture decision document |
| 2026-01-27 11:30 | Root | claude | Modified | CLAUDE.md | Added SPEED RULE at top - never ask for read-only operations |
| 2026-01-27 11:25 | Root | claude | Modified | GLOBAL_AGENT_INSTRUCTIONS.md | Expanded "NEVER ASK" to include all read-only bash commands, tests, builds |
| 2026-01-27 11:20 | Root | claude | Modified | GLOBAL_AGENT_INSTRUCTIONS.md | Added "NEVER ASK PERMISSION FOR" section - reading files should just happen |
| 2026-01-27 11:15 | Root | claude | Modified | GLOBAL_AGENT_INSTRUCTIONS.md | Added continuous CTO oversight checks during work (erasure, conflict, scope drift) |
| 2026-01-27 11:00 | Root | claude | Modified | GLOBAL_AGENT_INSTRUCTIONS.md | MAJOR: Integrated automatic behaviors (orchestrator, CTO, critic, strategic-thinker) |
| 2026-01-27 11:00 | Root | claude | Modified | CLAUDE.md | Updated to reflect new integrated system, removed manual agent workflow |
| 2026-01-27 10:30 | Root | PA | Modified | .agents/personal-assistant.md | Added Step 2: Cross-Session Sync (orchestrator check) |
| 2026-01-27 10:30 | Root | PA | Modified | .agents/session-closer.md | Added Step 9: Report to Orchestrator (registry logging) |
| 2026-01-26 15:45 | Root | claude | Created | CENTRAL_REGISTRY.md | Established central tracking system |
| 2026-01-26 15:40 | Root | claude | Modified | GLOBAL_AGENT_INSTRUCTIONS.md | Added Section 0 - Fundamental Operating Principles |
| 2026-01-26 15:30 | Root | claude | Created | docs/AGENT_RESTRUCTURE_PROPOSAL.md | Agent system restructure proposal |
| 2026-01-26 14:30 | SEO | session-closer | Modified | faq-generation/output/wave-1/*.md | Wave 1 FAQ updates (HTML links, H2/H3 labels, .txt files) |
| 2026-01-26 14:30 | SEO | session-closer | Modified | .claude/commands/faq.md | Added Introduction requirement, HTML links, .txt output |

---

## Project Index

All projects live under `Dropbox/Projects/OnlyiGaming/` unless noted otherwise.

### Content-Pipeline (ACTIVE — primary focus)
- **Last touched:** 2026-03-23
- **Path:** `Content-Pipeline/` (specs), `content-pipeline-v2/` (skeleton), `content-pipeline-modules-v2/` (modules)
- **Status:** Phase 11 CODE COMPLETE. **29 built submodules** (28 functional + rss-feeds placeholder). Fixed: FK constraint blocking text_content storage, all-or-nothing failure display, missing Download All CTA in per-entity mode. /code-review pre-commit skill created.
- **Key specs:** SKELETON_SPEC_v2.md, SUBMODULE_DEVELOPMENT.md, BUILD_PLAN.md, BACKLOG.md
- **Architecture:** Two-repo split. Express+React+Supabase+BullMQ. Data ops: ＝ (accumulate), ➖ (chain/filter), ➕ (chain/enrich)
- **Pipeline steps built:** 0-5 + 6 + 8 + 10 (Steps 7/9 not yet built)
- **Built submodules (29):** sitemap-parser, page-links, deep-links, url-dedup, url-filter, url-relevance, page-scraper, browser-scraper, api-scraper, content-filter, seed-url-builder, boilerplate-stripper, intent-tagger, content-analyzer, seo-planner, content-writer, tone-seo-editor, meta-compliance-checker, keyword-sufficiency-checker, citation-coverage-checker, hallucination-detector, markdown-output, html-output, json-output, meta-output, company-media, schema-org-injector, loop-router, test-dummy (+ rss-feeds placeholder)
- **Remaining briefs (18):** Step 1: ai-discovery-scout, google-pse-news, google-pse-directories, linkedin-discovery, youtube-podcast-discovery, social-media-discovery, curated-list-import, image-logo-search. Step 2: learned-validator. Step 3: media-transcript-fetcher, api-data-fetcher. Step 5: seo-keyword-researcher, image-generator, video-generator, audio-tts-generator. Step 9: strapi-publisher, google-docs-exporter, google-sheets-logger.
- **Known issues:** URL pattern filter timeout (sequential HEAD requests), pool tech debt (flat array multi-granularity)
- **Next priorities:** (1) Complete flow test end-to-end, (2) Build submodules from briefs (parallel dev), (3) B012 prompt archive, (4) B011 multi-provider LLM (Gemini + Mercury)

### SEO
- **Last touched:** 2026-03-13
- **Path:** `SEO/`
- **Status:** Strategy v3 and Task List v3 finalized. FAQ content complete for all 80+ categories. Both .docx files ready for Google Docs upload. Foundational schemas (1.1-1.5) deployed and verified. Tasks 7.1 (Canonical URLs) and 7.2 (NewsArticle Schema) newly defined. Stefan has 5 review tasks pending.
- **Key files:** OnlyiGaming_SEO_Tasks.docx (canonical task list), OnlyiGaming_SEO_Strategy_v3.docx (canonical strategy), faq-generation/output/ (all categories complete)

### Tags (Tagging System)
- **Last touched:** Ongoing
- **Path:** `tags/`
- **Status:** 4-layer tagging system (335+ tags). Category registries for directory, career, geography, community.
- **Key files:** dir-categories.md, career-categories.md, geo-registry.md, comm-status.md

### LinkedIn Strategy
- **Last touched:** Unknown
- **Path:** `linkedin/`
- **Status:** Strategy/skill docs. 4 files.
- **Key files:** README.md, SKILL.md

### Community
- **Last touched:** 2026-01-29
- **Path:** `Community/`
- **Status:** Vision document complete (COMMUNITY_PRODUCT_VISION.md), ready for build vs buy research
- **Key files:** COMMUNITY_PRODUCT_VISION.md, CONSULTANCY_STRATEGY.md

### News-Section
- **Last touched:** 2026-01-25
- **Path:** `News-Section/`
- **Status:** Database schema complete, roadmap drafted, awaiting handoff
- **Key files:** PROJECT_STATUS.md, ROADMAP.md

### Plasmic (Frontend Migration)
- **Last touched:** Unknown
- **Path:** `Plasmic/`
- **Status:** Frontend migration from Alpine to Plasmic. 17 files.
- **Key files:** ROADMAP.md

### Directory
- **Last touched:** Unknown
- **Path:** `Directory/`
- **Status:** 80+ company categories. Roadmap exists.
- **Key files:** ROADMAP.md

### Communication-Marketing
- **Path:** `Communication-Marketing/`
- **Key files:** ROADMAP.md

### Sections with boilerplate only (5 files each — CLAUDE.md, AGENTS.md, GEMINI.md, ROADMAP.md stubs)
Awards, Career, Consultant-Section, Cooperations, Education, Events, M-And-A, Marketplace, Media, Reviews, Startups

---

### Non-OnlyiGaming Projects

### Brochure Generator
- **Path:** `Dropbox/Projects/brochure-generator/`
- **Status:** Unknown — needs review

### PA Mobile App
- **Path:** `Dropbox/Projects/PA mobile app/`
- **Key files:** SESSION_SUMMARY.md

### Job Search
- **Path:** `Dropbox/Projects/JobSearch/`
- **Key files:** CLAUDE.md

### Research
- **Path:** `Dropbox/Projects/research/`
- **Files:** job-search-apis-2026.md, faq-optimization-best-practices-2026.md, supabase-mcp-claude-code-setup.md, DEV_WORKFLOW_BEST_PRACTICES.md

---

## How to Use

### At Session Start
Read this file to see what happened in other sessions since you last worked.

### After Any Change
Add a row to "Recent Actions" table:
```
| [YYYY-MM-DD HH:MM] | [Project] | [agent-name] | [Created/Modified/Deleted] | [path] | [brief note] |
```

### Weekly Maintenance
Archive entries older than 7 days to `CENTRAL_REGISTRY_ARCHIVE.md` to keep this file manageable.

---

## Archive Reference

Old entries moved to: `CENTRAL_REGISTRY_ARCHIVE.md` (created when needed)

---

*Established: 2026-01-26*
