# OnlyiGaming News-Section

## Project Overview

The News-Section is a critical component of the OnlyiGaming Platform, implementing a multi-dimensional tagging architecture that powers content discovery, navigation, and cross-section integration. This section serves as the content hub that connects all platform sections through intelligent tagging.

**Core Purpose**: News publishing system with an 8-dimension tagging architecture that enables "tag once, display everywhere" functionality across the entire OnlyIgaming platform. The same tagging logic applies regardless of submission source (pipeline scrape, user submission, editorial CMS).

## Goals

1. **Multi-dimensional tagging system** - 8 active dimensions covering ~756 tags
2. **Dynamic navigation** - Tag-filtered views combining multiple dimensions instead of rigid categories
3. **Cross-section integration** - Tagged content flows across NEWS, DIRECTORY, MARKETPLACE, CONSULTANTS, MEDIA, EVENTS, CAREER, COMMUNITY
4. **News submission flow** - Registered users and companies submit content through the frontend with AI-assisted tagging
5. **Editorial review queue** - All AI-tagged content (scraped + submitted) reviewed before publication
6. **Performance** - Caching, indexing, derived fields for presentation priority and related content scoring

## Tag Dimensions (May 2026)

| Dimension | Count | Cardinality per article | Primary required |
|---|---|---|---|
| NEWS | 48 codes (46 active; 2 deprecated and reserved - NEWS-027, NEWS-034). Includes 3 series tags: TechWatch Series, iGaming Startup Series, iGaming Insider Series | 2-4 | No |
| DIR | 83 (DIR-001 to DIR-083) | 1-3 | Yes |
| PROD | 10 | 0-2 | No |
| TYPE | 17 (TYPE-017 News is default cascade; TYPE-012 active) | 1 | N/A |
| GEO | 342 (full ISO + US states + Canada + 20 Indian states) | 1-4 | Yes |
| COMM | 4 (Editorial / Sponsored / Affiliate / Partner) | 1 | N/A |
| LIC | 293 regulators (NEW dimension May 2026) | 0-many | No |
| Company | Open-ended | 1-5 | Yes |

Total: ~756 tags across 8 active dimensions. Separately, CAREER (28 tags) exists for the Career section and is not part of news tagging.

## Submission Sources Supported

The v3.1 AI tagging prompt handles four submission contexts via the `submission_source` flag, in a single prompt:

1. `pipeline_scrape` - Articles scraped from onlyigaming.com/news (audit pipeline)
2. `user_news_submission` - General news submitted by users (user picks 1-2 NEWS themes; AI tags everything else)
3. `user_press_release_submission` - Press releases submitted by companies (heavy auto-fill from company directory profile; TYPE-008 forced)
4. `editorial_cms` - Articles created or edited by editorial staff

Same logic across all surfaces. Single source of truth for tagging behavior.

## Key Documents

### Tag Source of Truth
**`/OnlyiGaming/tags/`** - Single source of truth for all tag definitions per dimension

- `news-topics.md` (NEWS, 48 codes / 46 active, v2.3)
- `dir-categories.md` (DIR codes) + `master_categories.md` (slug-based, 83 categories, v2.0)
- `prod-verticals.md` (PROD, 10 tags, v1.1)
- `type-formats.md` (TYPE, 17 tags, v1.1)
- `geo-registry.md` (GEO, 342 tags, v2.0)
- `comm-status.md` (COMM, 4 tags, v2.0)
- `lic-regulators.md` (LIC, 293 tags, v1.0)
- `licenses_v3_cleaned.csv` (236 jurisdictions reference data)
- `career-categories.md` (CAREER, separate from news tagging)

### Tagging Rules
**`/OnlyiGaming/tags/rules/`** - Canonical rule documents

- `primary-triage.md` (v2.1) - Primary DIR/GEO/Company selection + presentation priority deprioritization
- `press-release-detection.md` (v1.0) - 5 detection signals, 2+ threshold → TYPE-008
- `company-directory-linking.md` (v1.0) - Lookup at `onlyigaming.com/companies/{slug}` workflow
- `cross-section-discovery.md` (v2.0) - Related content scoring (100% editorial, no commercial boost)
- `confidence-thresholds.md`, `company-extraction.md`, `geographic-model.md`

### Editorial & AI Tagging
- `editorial_tagging_guide_v2.md` (v2.1) - 78-page consolidated tagging reference (all 8 dimensions + all 4 rules). The look-up doc for tagging decisions.
- `docs/editorial_workflow_guide.md` (v1.0) - Editorial workflow guide: sourcing, evaluation, rewriting, theme routing. Replaces `editorial_operations_guide.md` (archived).
- `news_article_comprehensive_tagging_prompt_v3_2.md` - Current AI tagging prompt (supports 4 submission contexts; aligned with NEWS v2.3 taxonomy)
- `news_article_tagging_pipeline_brief_v2_4.md` - Pipeline operational spec with mandatory scraping schema

### Navigating This Folder
- `DOCS_INDEX.md` - Complete catalogue of every file in News-Section/ with purpose and status. Start here when looking for a file.
- `docs/session_summary_may_17_18_2026.md` - Most recent session summary. Covers v2.1 tagging guide regeneration, v1.1 LinkedIn tagger alignment, folder organisation (DOCS_INDEX + workflow guide creation, operations guide archived), and the Philip front-end handoff with the layout brief and four locked design decisions. Read this when resuming work; it's where this conversation left off.

### Project Management
- `ROADMAP.md` - Phased implementation plan (needs rebuild May 2026)
- `PROJECT_STATUS.md` - Current implementation status

### Recent Session Summaries
- `../docs/session_summary_may_13_15_2026.md` - Three-day taxonomy rebuild + Phase 2 execution + frontend architecture design

### Phase 2 Outputs (May 2026)
- `phase1_scraper.py`, `phase2_analyzer_v3.py` - Pipeline implementation
- `news_articles_audit.db` - Audit dataset (Phase 1 scraped + Phase 2 tagged)
- `phase2_full_results.md` - Full batch run results
- `phase2_priority_distribution.md`, `phase2_priority_distribution_v2.md` - Distribution analysis
- `news_front_page_simulation.html`, `.md` - Front page simulation from tagged dataset

### Technical
- `sql/schema.sql` - Database schema specification (needs update for v2.3 additions: `lic_tags`, `press_release_signals_fired`, `companies_added_to_backlog`, `submission_source`, `tagging_failed`, richer per-company entity fields, derived `presentation_priority`)

## Cross-Section Discovery
**`/OnlyiGaming/tags/rules/cross-section-discovery.md`** - How related content displays across sections

- Landing pages → "Latest" widgets (simple date query)
- Detail pages → "Related" widgets (pre-computed semantic similarity)
- Background job on publish generates related content via AI embeddings
- Fast lookup on page load (no real-time AI)
- 100% editorial weighting (sponsorship boost removed in v2.0)

## Presentation Priority

Articles tagged TYPE-008 (Press Release) OR COMM-003 (Affiliate) are deprioritized below editorial content in:
- Homepage news widgets, category landing feeds, latest-news sidebar widgets
- Theme landing pages, search results within news
- Related content widgets when relevance score is tied

Implemented as a derived field `presentation_priority` (editorial | deprioritized) computed at tagging time. The front-end just sorts by this field; no rule logic in queries.

## Status

See `PROJECT_STATUS.md` for current state and next steps.

**Recent milestones (May 2026):**
- Complete taxonomy rebuild to 8 dimensions (~756 tags)
- v3.2 AI tagging prompt with submission_source handling (aligned to NEWS v2.3)
- v2.4 pipeline brief with mandatory scraping schema
- 78-page consolidated editorial guide v2.1
- Phase 2 analyzer run successfully (20-article test + full batch)
- Frontend submission flow architecture designed
- Shared TypeScript rules library architecture defined for Bojan implementation
- v2.3 taxonomy cleanup (May 17): deprecated NEWS-027 and NEWS-034; renames applied across SSOT, prompt, brief, theme ranking, and 240 KB tagging guide; British English pass on all NEWS tag descriptions
- v1.1 LinkedIn post tagging prompt aligned with v2.3 (renamed news_post_tagging_prompt.md and updated linkedin_post_tagger.py SYSTEM_PROMPT)
- Editorial operations guide v3.0 (March 2026) split: workflow content extracted into `docs/editorial_workflow_guide.md` v1.0; redundant tagging-reference dropped (now in editorial_tagging_guide_v2.md); old file archived
- `DOCS_INDEX.md` created as folder navigation index

---
*Last updated: 2026-05-22*

## Session Log

### Session: 2026-05-22 - News ops brief + handoff review
**Accomplished:**
- Confirmed all 6 documents from Bojan's v2.3 update are present: news-topics.md v2.3, tagging prompt v3.2, pipeline brief v2.4, theme ranking v2.2, editorial_tagging_guide_v2.md v2.1 (240 KB confirmed), news_post_tagging_prompt.md v1.1 + linkedin_post_tagger.py
- Assessed build handoff readiness: Philip confirmed ready for index page (has layout brief + simulation + theme ranking); Bojan missing standalone DB schema doc and continuous scraping spec
- Created `news_operations_brief.md` v1.0 — new operational document covering daily RSS+PSE discovery, processing pipeline (dedup→scrape→AI tag→AI rewrite→editorial queue), opinion content calendar (2×/week Tue+Thu grounded in LinkedIn engagement data), LinkedIn distribution pattern and post formulas, weekly rhythm, content wishlist format, and tech stack gaps
- Fixed SUPABASE_ANON_KEY: added to `~/.zprofile` so git pre-commit hooks fire correctly in non-interactive shells

**Decisions:**
- RSS + PSE hybrid for daily discovery: RSS primary for Tier 1-2 sources (every 6h), PSE daily sweep for Tier 3-4 and sites without feeds
- Opinion content cadence: Tuesday (analytical — Expansion/Market Entry/M&A) + Thursday (human — Behind the Scenes/profiles/Insider Series), based on LinkedIn engagement ranking
- SUPABASE_ANON_KEY belongs in `~/.zprofile` not only `~/.zshrc` — git hooks run non-interactive shells that only load login profile

**Blockers/Questions:**
- DB schema doc not yet written — Bojan blocked on schema implementation
- Continuous scraping spec not yet written — daily pipeline not specced
- RSS feed URLs in ops brief need curl-verification before going live
- PSE setup required (Google Custom Search API key + engine config) before automated discovery runs

**Updated by:** session-closer agent
