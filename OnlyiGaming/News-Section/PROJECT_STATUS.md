# News-Section Project Status

**Last Updated**: 2026-01-25

---

## Current State

**Project Phase**: Phase 1 - Tag Infrastructure (IN PROGRESS)

**Overall Progress**: Phase 1 partially complete (~40%)

**Status**: Tag taxonomy complete, database schema specification complete

**Completed This Phase**:
- Tag taxonomy finalized (~299 tags across 7 dimensions)
- All tag definitions documented as atom files in `/OnlyiGaming/tags/`
- Primary triage rules, confidence thresholds, geographic model documented
- Company extraction rules established
- Database schema specification created (`sql/schema.sql`) — ready for developer handoff

**Documentation**: Complete and validated
- Shared tag source of truth: `/OnlyiGaming/tags/` (atom/molecule architecture)
- 81 directory categories (DIR) — `dir-categories.md`
- 45 news topics (NEWS) — `news-topics.md`
- ~115 geographic tags (GEO) — `geo-registry.md`
- 10 product verticals (PROD) — `prod-verticals.md`
- 16 publication types (TYPE) — `type-formats.md`
- 4 commercial status tags (COMM) — `comm-status.md`
- 28 career categories (CAREER) — `career-categories.md`
- Rule documents in `/OnlyiGaming/tags/rules/`:
  - `primary-triage.md` — How to choose primary tags
  - `confidence-thresholds.md` — AI auto-tagging score thresholds
  - `geographic-model.md` — Independent region/country model
  - `company-extraction.md` — How to identify and classify company entities
  - `cross-section-discovery.md` — How related content displays across sections

---

## Highest Priority

**Continue Phase 1: Tag Infrastructure — Developer Handoff**

Tag definitions and database schema specification are complete. Next step is handoff to site developer.

**Completed**:
1. ✅ Database schema specification (`sql/schema.sql`) — aligned with Content-Pipeline
2. ✅ Cross-section discovery architecture (`/OnlyiGaming/tags/rules/cross-section-discovery.md`)

**Next Steps**:
1. Hand off `sql/schema.sql` to site developer for implementation
2. Coordinate with developer on tag seeding from `/OnlyiGaming/tags/` atom documents
3. Review developer's tag management admin UI design
4. Review developer's CMS tag assignment interface design

**Scope Clarification**:
- We provide **specifications and tag definitions** — the site developer implements them
- Content-Pipeline code is maintained separately (for content generation)
- Website database code is owned by the site developer

**Cross-Project Coordination**:
- Content-Pipeline shares the same tag taxonomy
- Both projects should use `/OnlyiGaming/tags/` as the seed source
- Schema aligns with Content-Pipeline's `platform_tags` table for future unification

---

## Active Blockers

**None** - Clear path to implementation.

All prerequisites are met:
- Tag taxonomy finalized (~299 tags in `/OnlyiGaming/tags/`)
- Platform integration patterns defined
- Implementation roadmap approved
- Technical requirements understood
- Shared tag folder established as single source of truth

---

## Recommended Next Actions

### 1. Design Tag Database Schema
**Objective**: Create database tables aligned with Content-Pipeline

**Concrete Steps**:
- Coordinate with Content-Pipeline on shared `platform_tags` schema
- Define `article_tags` junction table with composite primary key
- Define `company_tags` junction table with is_primary flag
- Create indexing strategy for performance
- Document foreign key relationships and constraints

**Completion Criteria**:
- Database schema aligned with Content-Pipeline's `platform_tags` table
- SQL migration scripts written
- Schema reviewed and approved
- Performance implications understood

**Estimated Time**: 2-3 days

---

### 2. Populate Tags Database from Shared Source
**Objective**: Seed database from `/OnlyiGaming/tags/` atom documents

**Concrete Steps**:
- Parse atom documents from `/OnlyiGaming/tags/`:
  - `dir-categories.md` (81 DIR tags)
  - `news-topics.md` (45 NEWS tags)
  - `geo-registry.md` (~115 GEO tags)
  - `prod-verticals.md` (10 PROD tags)
  - `type-formats.md` (16 TYPE tags)
  - `comm-status.md` (4 COMM tags)
  - `career-categories.md` (28 CAREER tags)
- Write import script with validation
- Execute import and verify all tags loaded

**Completion Criteria**:
- All ~299 tags loaded from atom documents
- Tag counts verified by dimension
- No duplicate tag IDs
- Descriptions match atom source files

**Estimated Time**: 1-2 days

---

### 3. Build Tag Management Admin UI
**Objective**: Create administrative interface for managing tags

**Concrete Steps**:
- Design UI wireframes for tag management
- Implement CRUD operations (Create, Read, Update, Delete)
- Build category organization view
- Add search and filter functionality
- Create tag usage analytics view
- Implement bulk operations (import/export)

**Completion Criteria**:
- Admin can view all tags organized by category
- Admin can create, edit, delete tags
- Admin can see tag usage statistics
- Admin can export tags to CSV

**Estimated Time**: 3-4 days

---

## Phase Status Overview

| Phase | Status | Timeline | Progress | Dependencies Met |
|-------|--------|----------|----------|------------------|
| Phase 1: Tag Infrastructure | IN PROGRESS | Week 1-2 | ~40% | Yes |
| Phase 2: Content Migration | Not Started | Week 3-4 | 0% | No (needs Phase 1) |
| Phase 3: Directory Integration | Not Started | Week 5-6 | 0% | No (needs Phase 1) |
| Phase 4: Platform Sections | Not Started | Week 7-8 | 0% | No (needs Phase 1, 3) |
| Phase 5: Main Navigation | Not Started | Week 9-10 | 0% | No (needs Phase 1, 2) |
| Phase 6: Search & Discovery | Not Started | Week 11-12 | 0% | No (needs Phase 1, 5) |
| Phase 7: Launch | Not Started | Week 13 | 0% | No (needs all phases) |

---

## Key Metrics (Not Yet Applicable)

**Target Metrics for 30 Days Post-Launch**:
- Articles properly tagged: 95%+
- Average tags per article: 4-6
- Search usage increase: +50%
- User engagement increase: +25%

**Target Metrics for 60 Days Post-Launch**:
- Cross-section navigation: 30%+
- Saved searches created: 500+
- Email alerts active: 1000+
- Tag page views: 10K+

**Target Metrics for 90 Days Post-Launch**:
- Directory usage increase: +40%
- Tag CTR average: 3-5%
- Cross-section traffic: 25%+

---

## Technical Decisions Made

### Cross-Section Content Discovery (2026-01-25)
**Decision**: Layered widget strategy with pre-computed semantic similarity

| Page Type | Widget Logic |
|-----------|--------------|
| Homepage / Landing | Latest (generic) — `ORDER BY date DESC` |
| Category pages | Latest in category — filter by tag |
| Detail pages | Related (contextual) — pre-computed similarity lookup |

**Implementation**:
- On content publish → background job generates AI embeddings
- AI finds semantically similar content across ALL sections
- Stores top N matches in `related_content` table (website database)
- Page load does fast lookup (no real-time AI)

**Reference**: `/OnlyiGaming/tags/rules/cross-section-discovery.md`

### Database Architecture
- **Many-to-many relationships**: Articles and companies can have multiple tags; tags apply to multiple items
- **Primary tag concept**: Companies have one primary DIR category plus secondary tags
- **Tag categories**: 7 distinct types (DIR, NEWS, GEO, PROD, TYPE, COMM, CAREER)

### Performance Strategy
- **Indexing**: Composite indexes on tag_id + article_id for fast lookups
- **Caching**: 1-hour cache for tag combination results, 30-min for directory pages
- **Query optimization**: Plan for 335+ tags with complex combination queries

### Validation Rules
- **Minimum tags**: 3-4 tags per article required
- **Maximum tags**: 8-10 tags per article to prevent over-tagging
- **Required types**: At least 1 NEWS tag and 1 GEO tag mandatory
- **Conflict detection**: Warn about incompatible tag combinations

### Migration Strategy
- **Batch processing**: Migrate historical content in controlled batches
- **Rollback capability**: Maintain ability to revert failed migrations
- **Quality assurance**: 5% random sample audit after migration
- **Manual review**: Editorial team handles edge cases and complex articles

---

## Open Questions

### Technical
1. **Database platform**: MySQL, PostgreSQL, or other? (Decision needed before schema design)
2. **CMS platform**: What existing CMS are we integrating with, or building custom?
3. **Caching layer**: Redis, Memcached, or application-level caching?
4. **Search engine**: Elasticsearch, Algolia, or database full-text search?

### Business
1. **Historical content volume**: How many existing articles need migration?
2. **Editorial team size**: How many people will be using the tagging system?
3. **Launch timeline**: Is 13-week timeline firm or flexible?
4. **Beta user group**: Who should be invited to beta testing?

### Process
1. **Approval process**: Who approves each phase before moving to next?
2. **QA process**: What testing standards must be met?
3. **Training timeline**: When should editorial team training begin?

---

## Resources & Documentation

### Architecture Documents
- `/docs/igaming_platform_complete_architecture_v5_3.md` - Complete platform specification (current)
- `/docs/FINAL_corrections_summary_v5.2.md` - Version 5.2 corrections reference

### Project Context Files
- `CLAUDE.md` - Detailed project context for Claude AI
- `GEMINI.md` - Detailed project context for Gemini AI
- `AGENTS.md` - Quick reference for AI agents
- `ROADMAP.md` - 7-phase implementation plan

### Reference Data
- `/docs/igaming news sites.xlsx` - Competitive analysis

---

## Next Session Planning

**When resuming work on this project**:

1. **First Action**: Review this PROJECT_STATUS.md to understand current state
2. **Read Architecture**: Review `/docs/igaming_platform_complete_architecture_v5_3.md` for technical details
3. **Check Roadmap**: Confirm Phase 1 tasks in `ROADMAP.md`
4. **Answer Open Questions**: Resolve technical platform decisions before starting
5. **Begin Phase 1**: Start with database schema design

**Estimated Time to Productive Work**: 15-20 minutes of context review

---

## Success Indicators

**Project will be successful when**:
- ~299 tags enable precision content targeting
- Articles automatically appear in relevant sections based on tags
- Users navigate seamlessly across 8 platform sections
- Editorial team finds tagging intuitive and valuable
- Search and discovery metrics exceed targets
- Monetization opportunities through tag sponsorships realized

**Early warning signs to watch for**:
- Tag assignment confusion by editorial team
- Performance degradation with complex queries
- Low tag usage or over-reliance on few tags
- User confusion with new navigation
- Migration errors or data inconsistency

---

## Project Health: GREEN

- Complete documentation
- Clear implementation path
- No blocking dependencies
- Resources available
- Timeline realistic
- Technical approach validated

**Ready to proceed with Phase 1 implementation.**

---

## Session Log

### 2026-01-25: Cross-Section Content Discovery Architecture
**Accomplishments**:
- Designed and documented layered widget strategy for cross-section content discovery
- Created `/OnlyiGaming/tags/rules/cross-section-discovery.md` as architecture decision document
- Updated ROADMAP.md with implementation details for Phase 4.7 and Phase 6.5
- Added Technical Decisions section documenting the architecture choice

**Problem Solved**: Different sections have different taxonomies (Jobs tagged by function, News by topic). Simple tag matching cannot connect semantically related content across sections.

**Solution Decided**:
- Landing pages use "Latest" widgets (simple date query)
- Category pages use "Latest in category" (filter by tag)
- Detail pages use "Related" widgets (pre-computed semantic similarity lookup)
- Background job on publish generates AI embeddings and stores top N matches
- Page load does fast lookup from `related_content` table (no real-time AI)

**Key Insight**: AI embeddings capture semantic meaning, not keywords. A Job titled "ML Engineer - Player Safety" will be found as related to a Podcast about "AI in Player Safety" even with completely different tags.

**Blockers**: None

### 2026-01-25: Database Schema Specification
**Accomplishments**:
- Explored Content-Pipeline's existing `platform_tags` schema for alignment
- Created comprehensive database schema specification (`sql/schema.sql`)
- Defined tables: `tags`, `articles`, `article_tags`, `companies`, `company_tags`, `related_content`
- Included indexes, constraints, validation rules, and helper views
- Clarified scope: we provide specifications, site developer implements

**Schema Highlights**:
- `tags` table: Synchronized from `/OnlyiGaming/tags/` atom documents (~298 tags)
- `article_tags`: Junction table with confidence scoring and source tracking
- `company_tags`: Junction table with `is_primary` flag for primary DIR category
- `related_content`: Pre-computed semantic similarity (per cross-section-discovery.md)

**Scope Clarification**:
- News-Section project provides specifications for the site developer
- We do not maintain the website database code
- Content-Pipeline is the only code we develop

**Blockers**: None — Ready for developer handoff
