# Central Registry

**Purpose:** Cross-session awareness. Every agent logs changes here. Read at session start to catch up.

---

## Recent Actions

| Timestamp | Project | Agent | Action | Path | Notes |
|-----------|---------|-------|--------|------|-------|
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

### Community
- **Last touched:** 2026-01-29
- **Status:** Vision document complete (COMMUNITY_PRODUCT_VISION.md), ready for build vs buy research
- **Key recent files:** COMMUNITY_PRODUCT_VISION.md, CONSULTANCY_STRATEGY.md

### Content-Pipeline
- **Last touched:** 2026-02-14
- **Status:** Phase 8 complete — 9 implementation phases committed across two repos
- **Repos:** `OnlyiGaming/content-pipeline-v2` (skeleton), `OnlyiGaming/content-pipeline-modules-v2` (modules)
- **Key specs:** SKELETON_SPEC_v2.md (updated with rendering rule), SUBMODULE_DEVELOPMENT.md
- **Architecture:** Two-repo split implemented and working (skeleton vs modules)
- **Commits:** Skeleton `8a081e8` (Phase 8), Modules `9f55c76` (Phase 8)
- **Next:** Phase 9 — End-to-end pipeline test (full multi-step flow verification)

### SEO
- **Last touched:** 2026-01-26
- **Status:** Wave 1 FAQs complete (10 categories), Wave 2 ready (20 categories)
- **Key recent files:** faq-generation/output/wave-1/*.md, .claude/commands/faq.md

### News-Section
- **Last touched:** 2026-01-25
- **Status:** Database schema complete, awaiting handoff to site developer
- **Key recent files:** sql/schema.sql

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
