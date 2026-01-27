# OnlyiGaming News-Section - AI Agent Instructions

## Project Context

Building a news publishing system for OnlyiGaming Platform with a multi-dimensional tagging architecture. The system uses ~299 tags to enable "tag once, display everywhere" functionality across 8 integrated platform sections.

## Critical Information

### Tag Source of Truth
**`/OnlyiGaming/tags/`** — Single source of truth for all tag definitions (~299 tags across 7 dimensions)

See `/OnlyiGaming/tags/README.md` for complete architecture.

### Tagging System (~299 Tags)
- **Directory (81)**: DIR-001 to DIR-081 - Business categories
- **News (45)**: NEWS-001 to NEWS-045 - Content topics
- **Geographic (~115)**: GEO-* - Regions, countries, states
- **Product (10)**: PROD-001 to PROD-010 - Gaming verticals
- **Publication (16)**: TYPE-001 to TYPE-016 - Content formats
- **Commercial (4)**: COMM-001 to COMM-004 - Commercial status
- **Career (28)**: CAREER-* - Job function categories

### Platform Integration
Articles flow across 8 sections: NEWS, DIRECTORY, MARKETPLACE, CONSULTANTS, MEDIA, EVENTS, CAREER, COMMUNITY

### Cross-Section Discovery
Related content across sections uses pre-computed semantic similarity (not tag matching).
- **Reference**: `/OnlyiGaming/tags/rules/cross-section-discovery.md`
- Landing pages → "Latest" widgets (generic)
- Detail pages → "Related" widgets (pre-computed similarity)

### Key Documents
- `/OnlyiGaming/tags/` - Tag definitions and rules (source of truth)
- `ROADMAP.md` - Implementation plan (7 phases, 13 weeks)
- `PROJECT_STATUS.md` - Current status and next steps

## Current Phase

**Status**: Project Initialization Complete

**Next**: Phase 1 - Tag Infrastructure (database schema, tag management UI, CMS integration)

**Priority**: Design database schema for tag management system

## Agent Guidelines

1. **Always Reference Architecture**: Check `/docs/igaming_platform_complete_architecture_v5_3.md` for tag definitions and integration patterns

2. **Use Editorial Guide for Tag Details**: Check `/docs/editorial_tagging_guide.md` for:
   - "Belongs here" / "Does NOT belong here" criteria
   - Example headlines for each tag
   - Edge case handling rules

3. **Tag Validation**: Ensure tag IDs follow format (DIR-001, NEWS-001, GEO-UK, PROD-001, TYPE-001)

4. **Many-to-Many Relationships**: Articles can have multiple tags; tags apply to multiple articles

5. **Performance Considerations**: Plan for ~299 tags with complex combination queries

6. **Cross-Section Awareness**: Consider how tags distribute content across all 8 platform sections

## Current Status

Phase: Initialization Complete
Blockers: None
Next Action: Begin Phase 1 database schema design

## Session Log

### 2025-12-14: Project Initialization
- Analyzed architecture documentation
- Created context files
- Ready for Phase 1 implementation

### 2025-12-21: Editorial Guide Integration
- Added editorial_tagging_guide.md (152 core tags with full criteria)
- Added UX navigation mapping reference
- Enhanced Phase 1 to include guide-based seed data and AI training

### 2026-01-25: Cross-Section Content Discovery Architecture
- Designed layered widget strategy for cross-section content discovery
- Created `/OnlyiGaming/tags/rules/cross-section-discovery.md` architecture decision document
- Updated ROADMAP.md Phase 4.7 and Phase 6.5 with pre-computed similarity implementation
- Updated PROJECT_STATUS.md Technical Decisions section
- Key insight: AI embeddings capture semantic meaning across different taxonomies
