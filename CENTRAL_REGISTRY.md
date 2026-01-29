# Central Registry

**Purpose:** Cross-session awareness. Every agent logs changes here. Read at session start to catch up.

---

## Recent Actions

| Timestamp | Project | Agent | Action | Path | Notes |
|-----------|---------|-------|--------|------|-------|
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
- **Last touched:** 2026-01-29
- **Status:** Dashboard ready for testing (approval gates implemented)
- **Key recent files:** services/orchestrator.js, public/index.html, routes/runs.js

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
