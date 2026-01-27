# News-Section Quick Start Guide

## What Is This Project?

Building a news publishing system with a **multi-dimensional tagging architecture** that enables "tag once, display everywhere" across 8 integrated platform sections.

**Key Innovation**: Replace rigid categories with 335+ flexible tags that allow a single article to automatically appear in multiple contexts (e.g., an article tagged "GEO-UK + PROD-002 + NEWS-007" automatically shows in UK news, Sportsbook news, and Regulation news).

---

## The Big Picture

### 335+ Tags in 5 Categories

1. **Directory (81 tags)**: DIR-001 to DIR-081 - Business categories
   - Example: DIR-033 = Live Casino Studios

2. **News (30 tags)**: NEWS-001 to NEWS-030 - Content topics
   - Example: NEWS-002 = M&A, NEWS-007 = Regulation

3. **Geographic (200+ tags)**: GEO-* - Locations
   - Example: GEO-UK = United Kingdom, GEO-US-NJ = New Jersey

4. **Product Verticals (9 tags)**: PROD-001 to PROD-009 - Gaming types
   - Example: PROD-001 = Casino, PROD-002 = Sportsbook

5. **Publication Types (15 tags)**: TYPE-001 to TYPE-015 - Content formats
   - Example: TYPE-002 = Exclusive, TYPE-003 = Interview

### 8 Platform Sections (All Connected by Tags)

1. **NEWS** - Tagged articles
2. **DIRECTORY** - 81 business category pages (DIR-001 to DIR-081)
3. **MARKETPLACE** - M&A Hub + Project/Bid Board
4. **CONSULTANTS** - Freelancer marketplace
5. **MEDIA** - Podcasts, videos, webinars + calendar
6. **EVENTS** - Conferences, trade shows + calendar
7. **CAREER** - Job board and executive moves
8. **COMMUNITY** - Forums, discussions, reviews

---

## Current Status

**Phase**: Initialization Complete
**Progress**: 0/7 phases (Ready to start Phase 1)
**Blockers**: None
**Next Up**: Design database schema for tag management

---

## Quick Navigation

### Essential Documents

1. **Start Here**: `PROJECT_STATUS.md` - Current state, next actions, blockers
2. **Planning**: `ROADMAP.md` - 7 phases over 13 weeks
3. **Architecture**: `/docs/igaming_platform_complete_architecture_v5.2.md` - Complete technical spec

### AI Context Files

- `CLAUDE.md` - Detailed context for Claude
- `GEMINI.md` - Detailed context for Gemini
- `AGENTS.md` - Quick reference for all AI agents

---

## The 7 Phases

1. **Phase 1 (Week 1-2)**: Tag Infrastructure - Database, admin UI, CMS integration
2. **Phase 2 (Week 3-4)**: Content Migration - Convert old categories to new tags
3. **Phase 3 (Week 5-6)**: Directory Integration - 81 category pages + company listings
4. **Phase 4 (Week 7-8)**: Platform Sections - Build 6 additional sections
5. **Phase 5 (Week 9-10)**: Main Navigation - Dynamic filtering, category landing pages
6. **Phase 6 (Week 11-12)**: Search & Discovery - Advanced search, saved searches, alerts
7. **Phase 7 (Week 13)**: Launch - Beta testing, training, go-live

---

## Key Concepts

### Tag Once, Display Everywhere

**Example**: Article about Evolution Gaming launching new game in UK

**Tags Applied**:
- DIR-033 (Live Casino Studios) - because Evolution is a live casino provider
- GEO-UK (United Kingdom) - launch location
- PROD-001 (Casino) - product vertical
- NEWS-012 (Platform Launches) - content type
- TYPE-001 (Breaking News) - publication format

**Where It Appears**:
- NEWS section: UK news, Casino news, Product Launches
- DIRECTORY: DIR-033 category page (Live Casino Studios)
- EVENTS: If tagged with upcoming event
- MEDIA: If video demo included
- COMMUNITY: DIR-033 forum discussions

### Dynamic Navigation vs Rigid Categories

**Old Way (Rigid)**:
- Article lives in ONE category
- Hard to discover from different angles
- Categories are silos

**New Way (Dynamic)**:
- Article has MULTIPLE tags
- Automatically appears in all relevant filtered views
- Tags create web of connections

### Many-to-Many Relationships

- One article → Many tags
- One tag → Many articles
- One company → Many tags (with one PRIMARY tag)
- One tag → Many companies

---

## Success Metrics

### 30 Days Post-Launch
- 95%+ articles properly tagged
- 4-6 average tags per article
- +50% search usage increase
- +25% user engagement increase

### 60 Days Post-Launch
- 30%+ cross-section navigation
- 500+ saved searches
- 1000+ email alerts
- 10K+ tag page views

### 90 Days Post-Launch
- +40% directory usage
- 3-5% tag CTR average
- 25%+ cross-section traffic

---

## Technical Stack Decisions Needed

Before starting Phase 1, decide:

1. **Database**: MySQL vs PostgreSQL vs other?
2. **CMS Platform**: Custom build vs existing platform integration?
3. **Caching**: Redis vs Memcached vs application-level?
4. **Search**: Elasticsearch vs Algolia vs database full-text?

---

## Next Steps (Phase 1 Start)

1. **Design database schema** (tags, article_tags, company_tags tables)
2. **Define indexing strategy** for performance
3. **Create tag validation rules** (min/max tags, required types)
4. **Build tag management admin UI** (CRUD operations)
5. **Implement CMS tag assignment** interface (multi-select picker)
6. **Populate 335+ tags** into database

**Estimated Phase 1 Duration**: 2 weeks

---

## Getting Help

### Documentation
- Architecture doc has ALL tag definitions and integration patterns
- Roadmap has detailed task breakdowns for each phase
- Project Status has current state and immediate next actions

### Context for AI
- AI agents should read AGENTS.md first for quick context
- For detailed work, AI should reference CLAUDE.md or GEMINI.md
- Always check PROJECT_STATUS.md for current state before starting

---

## Common Questions

**Q: Why 335+ tags instead of simple categories?**
A: Enables precision targeting and automatic cross-section distribution. One article reaches multiple audiences without manual work.

**Q: Won't 335 tags be confusing?**
A: AI-powered tag suggestions in CMS make it easy. Editorial team only needs to understand tag categories, not memorize all 335.

**Q: How do we prevent over-tagging or under-tagging?**
A: Validation rules: minimum 3-4 tags, maximum 8-10 tags, at least 1 NEWS and 1 GEO tag required.

**Q: What about performance with complex tag queries?**
A: Aggressive indexing, caching strategy, and query optimization designed into architecture from start.

**Q: How do we migrate existing articles?**
A: Automated migration script maps old categories to new tags, with 5% QA audit and manual review for edge cases.

---

## Project Health: GREEN

- Complete documentation
- Clear implementation path
- No blocking dependencies
- Realistic timeline
- Technical approach validated

**Status**: Ready to proceed with Phase 1
