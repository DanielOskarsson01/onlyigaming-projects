# OnlyiGaming News-Section

## Project Overview

The News-Section implements a sophisticated multi-dimensional tagging architecture for the OnlyiGaming Platform. This system enables "tag once, display everywhere" functionality, allowing articles to automatically appear across 8 integrated platform sections based on their tag combinations.

**Core Purpose**: Build a news publishing system with ~299 dynamic tags across 7 dimensions that powers intelligent content discovery and seamless cross-platform integration.

**Key Innovation**: Replace traditional rigid category structures with flexible tag combinations that enable precision targeting (e.g., "UK + Sportsbook + Regulation" = UK sports betting regulation news).

## Goals

1. **Implement Multi-Dimensional Tagging System** - Deploy ~299 tags across 7 dimensions (81 Directory, 45 News, ~115 Geographic, 10 Product Verticals, 16 Publication Types, 4 Commercial Status, 28 Career)

2. **Create Dynamic Navigation Architecture** - Build tag-filtered views that combine multiple tag types for smart content discovery

3. **Enable Cross-Platform Integration** - Connect tagged content across NEWS, DIRECTORY, MARKETPLACE, CONSULTANTS, MEDIA, EVENTS, CAREER, COMMUNITY sections

4. **Build News Publishing CMS** - Develop editorial interface with multi-tag support, validation, and analytics

5. **Migrate Historical Content** - Convert existing categorized articles to new multi-tag architecture

6. **Optimize Performance** - Implement caching and indexing for ~299 tags and complex tag combinations

## Key Documents

### Tag Source of Truth
**`/OnlyiGaming/tags/`** — Single source of truth for all tag definitions (~299 tags across 7 dimensions)

- `dir-categories.md` — 81 DIR business categories
- `news-topics.md` — 45 NEWS content topics
- `geo-registry.md` — ~115 GEO regions, countries, states
- `prod-verticals.md` — 10 PROD gaming verticals
- `type-formats.md` — 16 TYPE content formats
- `comm-status.md` — 4 COMM commercial status
- `career-categories.md` — 28 CAREER job function categories
- `rules/` — Tagging rules and algorithms

### Editorial & Strategy
- **docs/news_tagging_strategy.md** - 8-dimension tagging architecture and rules
- **docs/editorial_tagging_guide.md** - Per-tag editorial criteria ("belongs here" / "doesn't belong")

### Project Management
- **ROADMAP.md** - 7-phase implementation plan (13 weeks)
- **PROJECT_STATUS.md** - Current status and next steps

### Technical
- **sql/schema.sql** - Database schema specification (ready for developer handoff)

### Reference Data
- **docs/igaming news sites.xlsx** - Competitive analysis

## Architecture Stack

### Tagging System (~299 Tags across 7 Dimensions)
1. **Directory Tags (81)**: DIR-001 to DIR-081 - Business categories across 11 parent groups
2. **News Tags (45)**: NEWS-001 to NEWS-045 - Content topics
3. **Geographic Tags (~115)**: GEO-* - Regions, countries, US states
4. **Product Vertical Tags (10)**: PROD-001 to PROD-010 - Gaming verticals
5. **Publication Type Tags (16)**: TYPE-001 to TYPE-016 - Content formats
6. **Commercial Status Tags (4)**: COMM-001 to COMM-004 - Editorial vs. paid
7. **Career Tags (28)**: CAREER-* - Job function categories

### Navigation Architecture
- **Main Categories**: Filtered views using tag combinations (NOT rigid categories)
- **Directory Pages**: 81 dedicated pages (DIR-001 to DIR-081) showing related news, companies, media, events
- **Dynamic Filtering**: Multi-tag combination queries
- **Related Content**: Pre-computed semantic similarity (see `/OnlyiGaming/tags/rules/cross-section-discovery.md`)

### Integration Model
- **Tag-Once Distribution**: Single article automatically appears in relevant sections based on tags
- **Cross-Section Flow**: NEWS, DIRECTORY, MARKETPLACE, CONSULTANTS, MEDIA, EVENTS, CAREER, COMMUNITY
- **Monetization**: Premium tag sponsorships, directory listings, targeted advertising by tag combination

## Current Status

**Phase**: Phase 1 — Tag Infrastructure (IN PROGRESS, ~40%)

**Completed**: Tag taxonomy (~299 tags in `/OnlyiGaming/tags/`), database schema spec (`sql/schema.sql`), cross-section discovery architecture

**Next Priority**: Hand off `sql/schema.sql` to site developer for implementation

**Blockers**: None

---

*Last updated: 2026-05-22*

## Session Log

### Session: 2026-05-22 - News ops brief + handoff review
**Accomplished:**
- Confirmed all 6 documents from Bojan's v2.3 update are present on disk
- Assessed build handoff: Philip ready for index page; Bojan needs DB schema doc + continuous scraping spec
- Created `news_operations_brief.md` v1.0 (RSS+PSE discovery, pipeline, opinion calendar, LinkedIn distribution, weekly rhythm)
- Fixed SUPABASE_ANON_KEY: added to `~/.zprofile` for git hook compatibility

**Decisions:**
- RSS + PSE hybrid discovery; opinion pieces 2×/week based on LinkedIn engagement data

**Blockers/Questions:**
- DB schema doc and continuous scraping spec still to write

**Updated by:** session-closer agent
