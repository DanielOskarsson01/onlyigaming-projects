# News-Section Implementation Roadmap

**Last Updated**: 2026-01-25

## Goal Alignment Check

**Core Goals**:
1. Implement ~299 tag multi-dimensional tagging system (7 dimensions)
2. Enable "tag once, display everywhere" across 8 platform sections
3. Build CMS for multi-tag content creation
4. Migrate historical content to new architecture
5. Create dynamic navigation replacing rigid categories
6. Optimize performance for complex tag queries at scale

**Success Criteria**:
- 95%+ articles properly tagged with 4-6 tags average
- Cross-section navigation at 30%+ (users visiting 2+ sections)
- Search usage increase of 50%+
- Tag page views exceeding 10K within 60 days

---

## Tag Source of Truth

**IMPORTANT**: All tag definitions, counts, and rules now live in a shared location:

**`/OnlyiGaming/tags/`** — Single source of truth for all projects

This folder contains atom documents (individual tag dimension definitions) and rule documents that are referenced by News-Section, Content-Pipeline, SEO, Directory, and Career projects.

See `/OnlyiGaming/tags/README.md` for the complete architecture.

---

## Cross-Section Content Discovery

**Architecture Decision (2026-01-25)**: How related content displays across platform sections.

**Problem**: Each section has different taxonomies (Jobs → function tags, News → topic tags). Simple tag matching doesn't connect them.

**Solution**: Layered widget strategy with pre-computed semantic similarity.

| Page Type | Widget Logic | Implementation |
|-----------|--------------|----------------|
| Homepage / Landing | Latest (generic) | `ORDER BY date DESC` |
| Category pages | Latest in category | `WHERE tag = X ORDER BY date DESC` |
| Detail pages | Related (contextual) | Pre-computed similarity lookup |

**Pre-computed Similarity**:
- On content publish → background job generates embeddings
- AI finds semantically similar content across ALL sections
- Stores top N matches in `related_content` table (website database)
- Page load does fast lookup (no real-time AI)

**Reference**: `/OnlyiGaming/tags/rules/cross-section-discovery.md`

---

## Phase 1: Tag Infrastructure
**Status**: IN PROGRESS (Schema spec complete, awaiting developer handoff)
**Timeline**: Week 1-2 (2 weeks)
**Dependencies**: None
**Blockers**: None

**Scope Note**: This project provides **specifications** for the site developer. We do not maintain website database code.

### Tasks

- [x] 1.1: Define tag taxonomy and rules (COMPLETE — in `/OnlyiGaming/tags/`)
  - 7 tag dimensions defined with atom documents
  - Primary triage rules documented
  - AI confidence thresholds established
  - Geographic independence model defined
  - Company extraction rules documented

- [x] 1.2: Design database schema specification (COMPLETE — `sql/schema.sql`)
  - Tags table aligned with Content-Pipeline's `platform_tags`
  - Article_tags junction table with confidence scoring
  - Company_tags junction table with is_primary flag
  - Related_content table for cross-section discovery
  - Indexes, constraints, and helper views defined
  - **Handoff**: Provide `sql/schema.sql` to site developer

- [ ] 1.3: Developer implements schema and seeds ~299 tags from `/OnlyiGaming/tags/`
  - 81 Directory tags (DIR-001 to DIR-081) — from `dir-categories.md`
  - 45 News tags (NEWS-001 to NEWS-045) — from `news-topics.md`
  - ~115 Geographic tags (GEO-*) — from `geo-registry.md`
  - 10 Product Vertical tags (PROD-001 to PROD-010) — from `prod-verticals.md`
  - 16 Publication Type tags (TYPE-001 to TYPE-016) — from `type-formats.md`
  - 4 Commercial Status tags (COMM-001 to COMM-004) — from `comm-status.md`
  - 28 Career tags (CAREER-*) — from `career-categories.md`

- [ ] 1.4: Developer builds tag management UI (admin interface)
  - CRUD operations for tags
  - Tag category organization view
  - Tag usage analytics dashboard
  - Bulk import/export functionality

- [ ] 1.5: Implement tag assignment interface in CMS
  - Multi-select tag picker with search
  - Tag suggestions based on content analysis
  - Required vs optional tag validation
  - Tag preview showing where content will appear

- [ ] 1.6: Create tag validation rules (reference `/OnlyiGaming/tags/rules/`)
  - Minimum tags per article (3-4)
  - Maximum tags per article (8-10)
  - Required tag types (at least 1 NEWS, 1 GEO)
  - Tag combination warnings for conflicts

- [ ] 1.7: Set up database indexes and optimization
  - Composite indexes on tag combinations
  - Query performance testing
  - Caching strategy implementation

**Deliverables**:
- Functional tag database with ~299 tags (seeded from `/OnlyiGaming/tags/`)
- Admin UI for tag management
- CMS integration for tag assignment
- Tag validation system (based on `/OnlyiGaming/tags/rules/`)

**Success Metrics**:
- All ~299 tags loaded and verified against atom documents
- Tag assignment UI tested with sample articles
- Query performance < 100ms for tag combinations

---

## Phase 2: Content Migration
**Status**: Not Started
**Timeline**: Week 3-4 (2 weeks)
**Dependencies**: Phase 1 complete
**Blockers**: None

### Tasks

- [ ] 2.1: Audit existing article database
  - Count articles by current category
  - Identify missing metadata
  - Document edge cases and special handling needs

- [ ] 2.2: Create migration mapping document
  - Map old categories to new tag combinations
  - Define business rules for automatic tagging
  - Identify articles requiring manual review

- [ ] 2.3: Write automated migration scripts
  - Category to tag conversion logic
  - Batch processing with error handling
  - Rollback capability for testing

- [ ] 2.4: Test migration on subset (100-200 articles)
  - Validate tag assignments
  - Check for missing or incorrect tags
  - Measure conversion accuracy

- [ ] 2.5: Bulk migrate historical articles
  - Execute full migration in batches
  - Monitor progress and errors
  - Generate migration report

- [ ] 2.6: Quality assurance validation
  - Random sample audit (5% of articles)
  - Fix systematic errors
  - Verify tag coverage completeness

- [ ] 2.7: Manual review and correction
  - Editorial team reviews flagged articles
  - Correct edge cases
  - Finalize tag assignments

**Deliverables**:
- All historical articles migrated to new tag system
- Migration report with statistics
- QA validation report

**Success Metrics**:
- 95%+ articles with proper tags
- Average 4-6 tags per article
- Less than 5% requiring manual intervention

---

## Phase 3: Directory Integration
**Status**: Not Started
**Timeline**: Week 5-6 (2 weeks)
**Dependencies**: Phase 1 complete
**Blockers**: None

### Tasks

- [ ] 3.1: Create 81 directory category page templates
  - Standardized layout for all DIR categories
  - Dynamic sections (news, companies, media, events)
  - SEO optimization per category

- [ ] 3.2: Import/create company listings
  - Migrate existing company database
  - Assign primary DIR category to each company
  - Add secondary DIR tags where applicable

- [ ] 3.3: Tag all companies with DIR categories
  - Ensure all companies have primary DIR tag
  - Add geographic tags (headquarters, markets)
  - Add product vertical tags

- [ ] 3.4: Build company-content relationship system
  - Link articles to mentioned companies
  - Auto-tag articles with company's DIR category
  - Display related news on company profiles

- [ ] 3.5: Implement related news feeds on directory pages
  - Show latest news tagged with DIR category
  - Filter by time period (24h, week, month)
  - Pagination and "load more" functionality

- [ ] 3.6: Create featured listing system
  - Premium placement logic
  - Highlighting mechanism
  - Analytics tracking for featured listings

- [ ] 3.7: Test directory search and filters
  - Search by company name
  - Filter by DIR category, location, product
  - Performance testing with full dataset

**Deliverables**:
- 81 functional directory category pages
- Company database fully tagged
- Related news feeds working
- Featured listing system operational

**Success Metrics**:
- All 81 directory pages live and functional
- 100% companies tagged with primary DIR category
- Directory page load time < 2 seconds

---

## Phase 4: Platform Sections
**Status**: Not Started
**Timeline**: Week 7-8 (2 weeks)
**Dependencies**: Phase 1, Phase 3 complete
**Blockers**: None

### Tasks

- [ ] 4.1: Build Marketplace section
  - M&A Hub database and interface
  - Project/Bid Board functionality
  - Escrow and payment system integration
  - Tag filtering (link projects to DIR categories)

- [ ] 4.2: Create Consultants marketplace
  - Consultant profile system
  - Skills and DIR category tagging
  - Service package management
  - Review and rating system

- [ ] 4.3: Implement Media section
  - Media content types (podcasts, videos, webinars, demos)
  - Media calendar functionality
  - Tag-based filtering and search
  - Subscription and reminder system

- [ ] 4.4: Set up Events system
  - Event database and page templates
  - Event calendar integration
  - Exhibitor/attendee management
  - Tag-based event discovery

- [ ] 4.5: Build Career center
  - Job board functionality
  - Job posting form with DIR category tagging
  - Executive moves tracker (NEWS-001 integration)
  - Salary guide and career resources

- [ ] 4.6: Create Community forums
  - Forum structure (81 DIR category sub-forums)
  - Discussion threading and moderation
  - Member profiles and reputation system
  - Review and rating functionality

- [ ] 4.7: Connect all sections via tags
  - Cross-section navigation links
  - "Related in other sections" widgets — uses pre-computed semantic similarity
  - Tag-based content recommendations
  - **Reference**: `/OnlyiGaming/tags/rules/cross-section-discovery.md`

**Deliverables**:
- All 6 additional platform sections functional
- Tag-based filtering working across sections
- Cross-section navigation operational

**Success Metrics**:
- All 8 platform sections live
- Cross-section click-through rate > 15%
- User engagement across multiple sections > 25%

---

## Phase 5: Main Navigation
**Status**: Not Started
**Timeline**: Week 9-10 (2 weeks)
**Dependencies**: Phase 1, Phase 2 complete
**Blockers**: None

### Tasks

- [ ] 5.1: Design dynamic filtering system
  - Tag combination query builder
  - Filter state management
  - URL parameter handling for deep linking

- [ ] 5.2: Build navigation configuration system
  - Define main category structures
  - Map categories to tag combinations
  - Admin interface for navigation management

- [ ] 5.3: Create category landing pages
  - People & Moves (NEWS-001, NEWS-029, NEWS-030)
  - Deals & Money (NEWS-002, NEWS-004, NEWS-005, NEWS-006)
  - Regulation & Law (NEWS-007 to NEWS-010)
  - Technology & Innovation (NEWS-012, NEWS-014)
  - Gaming Verticals (PROD-001 to PROD-009)
  - By Region (GEO-*)

- [ ] 5.4: Implement tag combination query logic
  - AND/OR logic for tag combinations
  - Performance optimization for complex queries
  - Result caching strategy

- [ ] 5.5: Build breadcrumb and navigation UI
  - Dynamic breadcrumbs based on tag filters
  - Filter chips and active state display
  - "Clear filters" and filter modification

- [ ] 5.6: Performance testing at scale
  - Load testing with full article database
  - Query optimization for slow combinations
  - Caching implementation and tuning

- [ ] 5.7: Database query optimization
  - Analyze slow queries
  - Add missing indexes
  - Optimize JOIN operations

**Deliverables**:
- Dynamic navigation system replacing rigid categories
- All main category landing pages functional
- Optimized query performance

**Success Metrics**:
- Page load times < 1 second for filtered views
- Zero timeout errors on tag combinations
- Navigation usability score > 85%

---

## Phase 6: Search & Discovery
**Status**: Not Started
**Timeline**: Week 11-12 (2 weeks)
**Dependencies**: Phase 1, Phase 5 complete
**Blockers**: None

### Tasks

- [ ] 6.1: Build advanced search with tag filters
  - Full-text search combined with tag filters
  - Faceted search interface
  - Search results ranking algorithm

- [ ] 6.2: Implement tag autocomplete/suggestions
  - Predictive tag search
  - Popular tag suggestions
  - Related tag recommendations

- [ ] 6.3: Create saved searches feature
  - User accounts and authentication
  - Save tag combination queries
  - Manage and edit saved searches

- [ ] 6.4: Build email alerts by tag combination
  - Alert subscription system
  - Daily/weekly digest generation
  - Unsubscribe and preference management

- [ ] 6.5: Implement cross-section related content (see `/OnlyiGaming/tags/rules/cross-section-discovery.md`)
  - **Layered widget strategy**: Latest on landing pages, Related on detail pages
  - **Pre-computed similarity**: Background job on publish generates related content
  - **Semantic embeddings**: AI finds related content across all sections regardless of taxonomy
  - **`related_content` table**: Stores source_id, related_id, score (fast lookup on page load)
  - Widget display: Related News, Related Jobs, Related Companies, Related Podcasts

- [ ] 6.6: Implement tag analytics tracking
  - Tag usage statistics
  - Popular tag combinations
  - User navigation patterns by tag

- [ ] 6.7: Create performance dashboard
  - Tag performance metrics
  - Content distribution across tags
  - User engagement by tag category

**Deliverables**:
- Advanced search with tag filtering
- Saved searches and email alerts functional
- Related content recommendations working
- Analytics dashboard operational

**Success Metrics**:
- 500+ saved searches created
- 1000+ email alert subscriptions
- Search usage increase > 50%
- Tag filter usage > 60% of searches

---

## Phase 7: Launch & Optimization
**Status**: Not Started
**Timeline**: Week 13 (1 week)
**Dependencies**: All previous phases complete
**Blockers**: None

### Tasks

- [ ] 7.1: Soft launch to beta user group
  - Select 50-100 beta users
  - Provide access and onboarding
  - Collect structured feedback

- [ ] 7.2: Gather and analyze feedback
  - User surveys and interviews
  - Analytics review (usage patterns, pain points)
  - Bug and issue tracking

- [ ] 7.3: Fix critical issues
  - Address blocking bugs
  - Resolve performance problems
  - Fix UX/UI issues

- [ ] 7.4: Train editorial team
  - Tagging guidelines documentation
  - Best practices workshop
  - CMS training sessions

- [ ] 7.5: Create tagging guidelines document
  - Tag selection criteria
  - Tag combination recommendations
  - Quality standards and examples

- [ ] 7.6: Public launch preparation
  - Final QA pass
  - Performance monitoring setup
  - Support documentation and FAQs

- [ ] 7.7: Public launch and monitoring
  - Go-live announcement
  - Monitor system performance
  - Rapid response to issues
  - Collect initial user feedback

**Deliverables**:
- Beta testing complete with feedback incorporated
- Editorial team trained on new system
- Tagging guidelines documentation
- Public launch executed successfully

**Success Metrics**:
- Beta user satisfaction > 80%
- Critical bugs resolved before launch
- Zero downtime during launch
- Positive user feedback in first week

---

## Post-Launch Success Tracking

### 30-Day Metrics
- Articles properly tagged: 95%+
- Average tags per article: 4-6
- Search usage increase: +50%
- User engagement increase: +25%

### 60-Day Metrics
- Cross-section navigation: 30%+ users visiting 2+ sections
- Saved searches: 500+
- Email alerts: 1000+
- Tag page views: 10K+
- Featured listings sold: 20+

### 90-Day Metrics
- Articles per tag average: 5+
- Directory usage increase: +40%
- Tag CTR average: 3-5%
- Cross-section traffic: 25%+
- Directory to content clicks: 15%+
- Content to directory clicks: 10%+

---

## Risk Mitigation

### Technical Risks
- **Performance degradation with complex queries**: Implement aggressive caching, optimize indexes, consider database sharding
- **Tag data inconsistency**: Implement validation, audit logs, regular data integrity checks
- **Migration errors**: Batch processing, rollback capability, extensive testing before full migration

### Business Risks
- **User confusion with new navigation**: Comprehensive onboarding, help documentation, video tutorials
- **Editorial resistance to tagging**: Training, clear guidelines, show value through analytics
- **Low tag usage**: Make tagging mandatory, provide AI suggestions, gamify proper tagging

### Timeline Risks
- **Phase delays**: Build buffer time, prioritize critical features, consider parallel workstreams
- **Scope creep**: Strict phase definitions, change control process, defer non-critical features
- **Resource constraints**: Cross-train team members, consider external contractors for specialized tasks

---

## Dependencies Map

```
Phase 1 (Tag Infrastructure)
    ├── Phase 2 (Content Migration)
    ├── Phase 3 (Directory Integration)
    └── Phase 5 (Main Navigation)
         └── Phase 6 (Search & Discovery)

Phase 3 (Directory Integration)
    └── Phase 4 (Platform Sections)

All Phases → Phase 7 (Launch)
```

---

## Current Status Summary

**Active Phase**: Phase 1 - Tag Infrastructure (IN PROGRESS)
**Completed**: Tag taxonomy + database schema specification (`sql/schema.sql`)
**Next Step**: Hand off schema to site developer for implementation
**Overall Progress**: ~40% (Phase 1 specification complete)
**Estimated Completion**: 12 weeks from developer implementation start
**Blockers**: None
**Shared Dependencies**: Content-Pipeline uses same tag taxonomy — schema aligned

---

## Session Log

### 2026-01-25: Database Schema Specification
- Created `sql/schema.sql` — comprehensive database specification for site developer
- Tables: tags, articles, article_tags, companies, company_tags, related_content
- Aligned with Content-Pipeline's `platform_tags` table structure
- Clarified scope: we provide specs, site developer implements

### 2026-01-25: Cross-Section Content Discovery Architecture
- Designed layered widget strategy (Latest vs Related by page depth)
- Created `/OnlyiGaming/tags/rules/cross-section-discovery.md`
- Updated Phase 4.7 and Phase 6.5 with pre-computed semantic similarity implementation
- Key architecture decision: AI embeddings on publish, fast lookup on page load
