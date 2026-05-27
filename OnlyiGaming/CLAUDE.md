# OnlyiGaming — Claude Context (All Projects)

**Last Updated**: 2026-02-16
**Purpose**: Platform-level context for Claude (Claude.ai, Claude Code, Claude Projects) working across any OnlyiGaming project.

---

## Platform Overview

OnlyiGaming (onlyigaming.com) is an iGaming industry platform covering company directory, news, events, awards, education, marketplace, and community features.

## Active Projects

| Project | Folder | Status |
|---------|--------|--------|
| Content Pipeline | `Content-Pipeline/` + `content-pipeline-v2/` + `content-pipeline-modules-v2/` | Active — Phase 9/10 (Step 1+2 end-to-end tested) |
| *Other projects* | *See folder structure in AGENTS.md* | *Status TBD — needs inventory* |

> **TODO**: Inventory remaining project folders and add status here.

## How to Work on a Specific Project

1. Read this file (platform context)
2. Read `AGENTS.md` in this folder (global rules)
3. Navigate to the project folder
4. Read the project's `CLAUDE.md` for project-specific context
5. Follow project-specific instructions

## Content Pipeline Quick Access

The Content Pipeline is currently the most active project. Key entry points:
- **Status**: `Content-Pipeline/PROJECT_STATUS.md`
- **Claude rules**: `content-pipeline-v2/CLAUDE.md`
- **Specs**: `Content-Pipeline/specs/` (read-only, single source of truth)
- **Sessions**: `Content-Pipeline/sessions/`

---
*Last updated: 2026-02-16*

## Decision Log

This project uses automated decision logging via a PostToolUse hook.
A shell script fires after every Claude tool call and writes session checkpoints to Supabase every 60 minutes — zero tokens, fully automatic.

For important decisions, write a detailed entry:

```sql
INSERT INTO decision_log (project_name, entry_type, summary, decision_made, alternatives_rejected, reasoning, source)
VALUES ('onlyigaming', 'decision', 'What was decided', 'The choice made', 'What was rejected', 'Why this choice', 'manual');
```

Entry types: decision | progress | blocker | idea

## Session Log

### Session: 2026-04-03 - Bojan meeting response document

**Accomplished:**
- Located existing partial response document (only covered 2 of 8 agenda topics) in OnlyiGaming root
- Moved Response-to-Bojan-Meeting-Comments.md and .docx to proper meeting folder (meetings/2026-03-16_bojan/)
- Expanded response document to cover all 8 agenda topics using Bojan's annotated PDF comments
- Wrote responses for: SEO Task List, News Design in Figma, Crosslinking Draft, Plasmic Status, Company Profile Delivery, Registration Forms
- Regenerated .docx using md-to-docx skill (22 KB, professional OnlyiGaming styling)

**Decisions:**
- Company profile delivery format: Markdown (pipeline already outputs Markdown, simplest path)
- Response document belongs in meetings/2026-03-16_bojan/, not OnlyiGaming root

**Blockers/Questions:**
- Waiting for Bojan's status on SEO tasks 2.1/2.2/3.4
- Bojan needs to create API endpoint for company profile delivery
- Crosslinking (pgvector) timeline and hosting cost estimate needed from Bojan
- Registration form timeline estimate needed from Bojan

**Updated by:** session-closer agent

### Session: 2026-05-27 - Casino-platforms pillar locked + 754-article inventory

**Accomplished:**
- Recovered the May 25 22:06 casino-platforms pillar article (7,238 words, 12 vendor rows, 12 vendor profiles — Gemini-praised reference standard) via Dropbox version history, after I mistakenly overwrote it earlier today by re-running the pipeline with a one-line prompt edit added
- Reverted that one-line prompt edit in `project-command-center/server/reviewArticlesRoutes.ts` so the locked prompt recipe exactly matches what produced the good output
- Committed prompt recipe to project-command-center (commit f2a6761) — 87 insertions / 15 deletions, scaffold table + vendor rubric parsing intact
- Committed locked article files to OnlyiGaming repo: article.md, article.html, article 25.05.docx, article-factchecked.md
- Wrote decision_log entry to Supabase explaining the lock-in
- Built complete article inventory (INVENTORY.md and INVENTORY.xlsx) covering all 754 planned articles: 73 pillars + 681 satellites
- Fetched live onlyigaming.com directory data via API: 1,679 companies across 83 categories (used as canonical vendor source per category)
- Identified 21 satellite template patterns covering 544/681 satellites (137 still uncategorized as too category-specific to template)
- XLSX has 5 sheets: Summary, Templates (with target articles + coverage gaps per template), Articles (754-row flat list with status), Vendors by Category, Recurring Themes

**Decisions:**
- Lock May 25 22:06 article + prompt recipe as the reference standard for the 754-article pipeline (Gemini-praised baseline; further pipeline runs that don't match this quality bar should not overwrite without explicit approval)
- Revert the "MUST have 12 vendor rows" prompt edit (added today) — the May 25 version already had 12 rows without it; the edit didn't help and produced a worse 6,462-word output today
- "Duplicate satellites" are actually "recurring themes" — same question across categories (e.g. "Best for emerging markets") has completely different vendor/answer sets per category, so not a duplication problem
- Adopt template-based article system for scaling: each template (21 identified) gets its own prompt + target/best-case article + coverage tracking across categories
- Use live onlyigaming.com directory as canonical source for vendors per category (not the rubric file alone — rubric has 12 curated vendors for casino-platforms but the live directory has 141)

**Blockers/Questions:**
- Non-determinism in pipeline: same prompts produce different quality each run. Need consistency strategy (N-of-3 generation + pick best, automated quality gate before overwriting article.md, or lower temperature) before scaling beyond the locked casino-platforms baseline to remaining 748 articles
- Slug mismatches between rubric and live directory: `e-wallet-solutions` vs `ewallet-solutions`, `elearning-solutions` vs `e-learning-solutions`, `cro-consulting` not in directory at all
- 60 of 73 categories have no `**Vendors:**` curation line in rubric — needs curation before pillar generation (live directory has 100+ companies in many categories; need to pick top 10-12)
- Only the pillar template has a tested prompt + polished target article. The other 20 templates (head-to-head, newcomers-to-watch, known-challenges, evolution-of, etc.) need per-template prompts authored and a target article produced before scaling

**Updated by:** session-closer agent
