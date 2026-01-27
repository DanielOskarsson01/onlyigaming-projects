# News Section — Tagging Strategy

## Version 1.0 | January 2026

---

## 1. Overview

This document defines the tagging architecture for the OnlyiGaming News Section. It establishes:

- The 8 tagging dimensions and their rules
- Primary vs. secondary tag logic per dimension
- How tags drive dynamic navigation (no hardcoded sections)
- SEO implications of primary designation
- Triage rules for edge cases
- Geographic tagging model (independent region + country)

---

## 2. Core Principle: Tags Drive Everything

Navigation, category pages, theme pages, and filtered views are **not hardcoded**. They are dynamic queries against the tag system.

A "news page" is a **view definition** — a label + a tag query stored in the database. Adding, removing, or reordering pages requires zero code changes.

### View Types

| Type | Example | How Created |
|------|---------|-------------|
| **Section** | Industry News, Regulation & Law | Editorial config |
| **Directory** | Payment Gateways, Game Providers | Auto-generated from DIR tags |
| **Theme** | Crypto, Platforms, CRM | Editorial config (tag combinations) |
| **Region** | Europe, Asia, Malta | Auto-generated from GEO tags |
| **Vertical** | Casino, Sportsbook | Auto-generated from PROD tags |

### View Definition Schema

```
views table:
- id
- slug                 (URL path segment)
- label                (display name)
- description          (SEO meta description)
- tag_query            (which tags to match, with AND/OR logic)
- view_type            (section | directory | theme | region | vertical)
- sort_order           (display order in navigation)
- active               (boolean)
- created_by           (editorial | system | auto)
```

All view types use the **same article list template** and the **same API endpoint**:
`GET /news?tags=X,Y,Z&logic=OR`

---

## 3. The 8 Tagging Dimensions

| # | Dimension | ID Format | Count | Multiple? | Primary Required? | Tagging Method |
|---|-----------|-----------|-------|-----------|-------------------|----------------|
| 1 | News Topic | NEWS-xxx | 45 | Yes (2-4) | No | AI + editorial |
| 2 | Directory Category | DIR-xxx | 81 | Yes (1-3) | **Yes — 1 primary** | AI + editorial |
| 3 | Company Entity | entity:name | Open-ended | Yes (1-5) | **Yes — 1 primary** | AI extraction |
| 4 | Content Type | TYPE-xxx | 16 | 1 only | N/A | Editorial |
| 5 | Geographic | GEO-xxx | ~80 | Yes (1-4) | **Yes — 1 primary** | AI + editorial |
| 6 | Product Vertical | PROD-xxx | 10 | Yes (1-2) | No | AI + editorial |
| 7 | Commercial Status | COMM-xxx | 4 | 1 only | N/A | Editorial |
| 8 | Event Anchor | EVENT-xxx | TBD | Yes (0-2) | No | Editorial (Phase 2) |

### Validation Rules

- **Minimum tags per article**: 4
- **Maximum tags per article**: 10
- **Required**: At least 1 NEWS tag, 1 DIR tag (primary), 1 GEO tag (primary), 1 TYPE tag
- **Primary enforcement**: Exactly 1 primary DIR, 1 primary GEO, 1 primary Company

---

## 4. Primary vs. Secondary — Why and How

### Why Primary Exists

Primary designation solves the SEO problem: when an article appears on multiple category pages, which page gets the link equity?

| What Primary Controls | Effect |
|----------------------|--------|
| Canonical URL | Article's breadcrumb path and URL structure |
| Link equity | Internal linking strengthens the primary category page |
| Sitemap grouping | Google sees clear topical clusters |
| Breadcrumbs | `News > [Primary DIR label] > Article title` |

### Which Dimensions Need Primary

Only dimensions that generate **SEO destination pages**:

| Dimension | Primary? | Reasoning |
|-----------|----------|-----------|
| DIR | Yes | 81 directory category pages each need focused link equity |
| GEO | Yes | Regional/country pages are SEO targets |
| Company | Yes | Article "belongs to" one company for entity association |
| NEWS | No | News topics power filtered views, not SEO destination pages |
| PROD | No | Usually only 1-2 apply; views aggregate them |
| TYPE | No | Single-select; defines format, not SEO destination |
| COMM | No | Internal metadata, not user-facing |
| EVENT | No | Temporal context, not primary SEO signal |

### How Primary Affects Display

An article tagged with multiple DIR tags appears in **all** relevant filtered views. But:

- Only the **primary DIR** category page counts for SEO
- Only the **primary GEO** market page counts for SEO
- Secondary tags provide **discoverability** without diluting link equity

---

## 5. Geographic Tagging Model

### Key Decision: Region and Country Are Independent

Region tags (GEO-EU, GEO-ASIA) and country tags (GEO-MT, GEO-UK) are **independent editorial decisions**. A country tag does NOT automatically imply its parent region.

### Why Independent

| Scenario | Tags | Rationale |
|----------|------|-----------|
| "Cambodia revokes 3 licenses" | GEO-KH only | Specific to Cambodia, not an Asia-wide story |
| "Asian regulation trends shifting" | GEO-ASIA only | About the region, no single country focus |
| "Cambodia decision signals Asia-wide shift" | GEO-KH + GEO-ASIA | Relevant at both levels |
| "EU gambling directive affects Malta most" | GEO-MT (primary) + GEO-EU | Malta is primary focus, EU is context |

### Hierarchy Is for UI Only

```
GEO-EU (Europe)
  ├── GEO-UK
  ├── GEO-MT (Malta)
  ├── GEO-SE (Sweden)
  └── ...

GEO-ASIA (Asia)
  ├── GEO-KH (Cambodia)
  ├── GEO-PH (Philippines)
  └── ...
```

The hierarchy provides:
- UI structure (grouping countries under regions in filter dropdowns)
- Tag validation (GEO-KH is confirmed as a valid tag)
- AI context (AI knows Cambodia is in Asia, can evaluate both levels)

The hierarchy does **NOT** provide:
- Automatic inheritance (tagging Cambodia ≠ tagging Asia)
- Query roll-up (searching "Europe" does NOT auto-include all European countries)

### AI Auto-Tagging for GEO

The AI evaluates two independent questions:
1. Is this article relevant to the **specific country/countries**?
2. Is this article relevant to the **broader region** as a concept?

Each gets its own confidence score. Both can be true, one can be true, or neither (global news).

---

## 6. Triage Rules for Primary Designation

When the primary tag is ambiguous, apply these rules:

### DIR Primary (Directory Category)

1. **Subject test**: Which category is the article fundamentally *about*? Not which companies are mentioned, but what business domain is the focus.
2. **Reader test**: Which category page would a reader expect to find this article on?
3. **50/50 tie-breaker**: Choose the category with less existing content (builds weaker pages).

**Examples:**
| Article | Primary DIR | Secondary DIR | Reasoning |
|---------|-------------|---------------|-----------|
| "Payment provider launches casino game" | DIR-059 (Payment Gateways) | DIR-029 (Game Providers) | Company's core business is payments |
| "Game studio adds crypto payments" | DIR-029 (Game Providers) | DIR-061 (Crypto Payments) | Company's core business is games |
| "Platform integrates 5 payment providers" | DIR-015 (Platform Providers) | DIR-059 (Payment Gateways) | Article is about the platform's capability |

### GEO Primary (Geographic)

1. **Specificity wins**: Most specific geographic focus becomes primary. Malta article affecting Europe → primary is GEO-MT.
2. **No single country**: Pan-regional story with no country focus → primary is the region (GEO-EU, GEO-ASIA).
3. **Global news**: No geographic focus at all → primary is GEO-GLOBAL.

**Examples:**
| Article | Primary GEO | Secondary GEO | Reasoning |
|---------|-------------|---------------|-----------|
| "MGA updates licensing framework" | GEO-MT | GEO-EU | Malta-specific regulation |
| "EU gambling directive proposal" | GEO-EU | — | No single country focus |
| "Company X opens Malta office for EU expansion" | GEO-MT | GEO-EU | Office is in Malta specifically |
| "Global online gambling market report" | GEO-GLOBAL | — | No geographic specificity |

### Company Primary

1. **Subject, not partner**: Who is the article about? "Company X expands" → X is primary even if Y is mentioned as partner.
2. **Active party wins**: In deals, the acquirer/initiator is primary. "X acquires Y" → X is primary.
3. **Multiple subjects**: In comparison articles, choose the one mentioned first or with more text devoted to it.

---

## 7. Dimension Details

### 7.1 News Topics (NEWS-xxx) — 45 Tags

**Purpose**: What the article is about thematically.
**Cardinality**: 2-4 tags per article (no primary).
**Method**: AI auto-tag + editorial review.

These tags power the main navigation sections (Industry News, Deals & Money, etc.) through view definitions. An article can appear in multiple navigation sections if it carries tags from multiple groups.

*Full tag list: See Editorial Tagging Guide.*

### 7.2 Directory Categories (DIR-xxx) — 81 Tags

**Purpose**: Which business category/categories are involved.
**Cardinality**: 1-3 tags per article (1 primary required).
**Method**: AI auto-tag + editorial review.

Primary DIR tag determines:
- Canonical category page association
- Breadcrumb path
- Sitemap clustering
- Which directory page gets link equity

Each of the 81 DIR tags automatically generates a news view page (e.g., `/news/dir/payment-gateways`).

*Full tag list: See Editorial Tagging Guide.*

### 7.3 Company Entities — Open-Ended

**Purpose**: Which specific companies are mentioned in the article.
**Cardinality**: 1-5 per article (1 primary required).
**Method**: AI extraction from article text.

Company entities are not from a fixed tag list. They reference the company database. New companies are created when first encountered.

**Fields per company mention:**
- company_id (reference to companies table)
- is_primary (boolean)
- mention_type: subject | partner | competitor | quoted

### 7.4 Content Type (TYPE-xxx) — 16 Tags

**Purpose**: The format/style of the article.
**Cardinality**: 1 per article.
**Method**: Editorial assignment.

| ID | Label |
|----|-------|
| TYPE-001 | Breaking News |
| TYPE-002 | News |
| TYPE-003 | Interview |
| TYPE-004 | Opinion |
| TYPE-005 | Analysis |
| TYPE-006 | Feature |
| TYPE-007 | Review |
| TYPE-008 | Editorial |
| TYPE-009 | Press Release |
| TYPE-010 | Report |
| TYPE-011 | Case Study |
| TYPE-012 | Webinar Recap |
| TYPE-013 | Video |
| TYPE-014 | Podcast |
| TYPE-015 | Infographic |
| TYPE-016 | Listicle |

### 7.5 Geographic (GEO-xxx) — ~80 Tags

**Purpose**: Geographic relevance of the article.
**Cardinality**: 1-4 per article (1 primary required).
**Method**: AI auto-tag + editorial review.
**Model**: Independent region/country (see Section 5).

**Regions:**
- GEO-GLOBAL
- GEO-EU (Europe)
- GEO-NA (North America)
- GEO-LATAM (Latin America)
- GEO-ASIA (Asia)
- GEO-AFRICA (Africa)
- GEO-ME (Middle East)
- GEO-OCEANIA (Oceania)

**Countries** (selection — full list in Editorial Tagging Guide):
- GEO-UK, GEO-MT, GEO-SE, GEO-DE, GEO-ES, GEO-IT, GEO-PT, GEO-GR, GEO-NL, GEO-DK, GEO-FI, GEO-NO, GEO-IE, GEO-FR, GEO-AT, GEO-CH, GEO-PL, GEO-RO, GEO-BG, GEO-CZ, GEO-HR, GEO-EE, GEO-LT, GEO-LV
- GEO-US, GEO-CA, GEO-MX
- GEO-BR, GEO-AR, GEO-CO, GEO-CL, GEO-PE
- GEO-PH, GEO-KH, GEO-JP, GEO-KR, GEO-IN, GEO-SG, GEO-AU, GEO-NZ
- GEO-ZA, GEO-NG, GEO-KE, GEO-GH
- GEO-AE, GEO-IL

**US States** (regulated markets):
- GEO-US-NJ, GEO-US-PA, GEO-US-MI, GEO-US-NY, GEO-US-CT, GEO-US-WV, GEO-US-VA, GEO-US-IL

### 7.6 Product Verticals (PROD-xxx) — 10 Tags

**Purpose**: Which gaming vertical the article relates to.
**Cardinality**: 0-2 per article (no primary).
**Method**: AI auto-tag + editorial review.

| ID | Label |
|----|-------|
| PROD-001 | Online Casino |
| PROD-002 | Sportsbook |
| PROD-003 | Live Casino |
| PROD-004 | Poker |
| PROD-005 | Esports Betting |
| PROD-006 | Lottery |
| PROD-007 | Skill Games |
| PROD-008 | Bingo |
| PROD-009 | Crypto Gaming |
| PROD-010 | Horse Racing |

### 7.7 Commercial Status (COMM-xxx) — 4 Tags

**Purpose**: Distinguish editorial from paid content (legal/ethical requirement).
**Cardinality**: 1 per article.
**Method**: Editorial assignment.

| ID | Label | Description |
|----|-------|-------------|
| COMM-001 | Editorial | Independent editorial content |
| COMM-002 | Sponsored | Paid content with editorial oversight |
| COMM-003 | Partner Content | Co-created with a commercial partner |
| COMM-004 | Native Advertising | Advertiser-created content |

### 7.8 Event Anchors (EVENT-xxx) — Phase 2

**Purpose**: Link articles to major industry events for clustered coverage.
**Cardinality**: 0-2 per article (no primary).
**Method**: Editorial assignment.
**Status**: To be defined in Phase 2 based on editorial calendar.

Candidate events: ICE London, SiGMA, G2E, SBC Summit, iGB Live, GiGse.

---

## 8. Auto-Tagging Confidence Thresholds

When AI auto-tags articles, confidence scores determine the workflow:

| Confidence | Action | Applies To |
|------------|--------|------------|
| ≥ 0.85 | Auto-apply, no review needed | All dimensions |
| 0.70 – 0.84 | Auto-apply, flag for weekly audit | NEWS, GEO, PROD |
| 0.50 – 0.69 | Suggest only, human decides | DIR (primary), Company |
| < 0.50 | Discard | All dimensions |

### Primary Designation by AI

- AI may suggest primary DIR/GEO/Company based on content analysis
- Primary suggestions always require editorial confirmation (regardless of confidence)
- Secondary tags above 0.70 can auto-apply

### Threshold Adjustment

These thresholds are starting points. After 100 tagged articles:
- Measure false positive rate per dimension
- Adjust thresholds per dimension independently
- Goal: < 5% false positive rate for auto-applied tags

---

## 9. Tag Query Logic for Views

Views support boolean logic in their tag queries:

### OR Logic (Union — broad, more results)
"Show articles with ANY of these tags"

```
Industry News view: NEWS-015 OR NEWS-032 OR NEWS-031 OR NEWS-005 OR NEWS-022
```

### AND Logic (Intersection — narrow, specific results)
"Show articles with ALL of these tags"

```
Crypto news in Europe: PROD-009 AND GEO-EU
```

### Combined Logic
```
Payment news in regulated US states:
(DIR-058 OR DIR-059 OR DIR-061) AND (GEO-US-NJ OR GEO-US-PA OR GEO-US-MI)
```

### View Examples

| View | Label | Tag Query | Logic |
|------|-------|-----------|-------|
| /news/industry | Industry News | NEWS-015, NEWS-032, NEWS-031, NEWS-005, NEWS-022, NEWS-019, NEWS-033, NEWS-034, NEWS-030, NEWS-029, NEWS-018 | OR |
| /news/deals | Deals & Money | NEWS-002, NEWS-004, NEWS-015, NEWS-006, NEWS-021, NEWS-020, NEWS-040 | OR |
| /news/regulation | Regulation & Law | NEWS-001, NEWS-007, NEWS-008, NEWS-009, NEWS-010 | OR |
| /news/dir/payment-gateways | Payment Gateways | DIR-059 | exact |
| /news/region/europe | Europe | GEO-EU, GEO-UK, GEO-MT, GEO-SE, ... | OR |
| /news/theme/crypto | Crypto | PROD-009 OR DIR-061 OR NEWS-038 | OR |

---

## 10. Database Schema (Conceptual)

```sql
-- Tags registry (single source of truth)
CREATE TABLE platform_tags (
  id VARCHAR(20) PRIMARY KEY,        -- e.g., 'DIR-059', 'GEO-MT'
  dimension VARCHAR(10) NOT NULL,    -- DIR, NEWS, GEO, PROD, TYPE, COMM, EVENT
  label VARCHAR(100) NOT NULL,       -- Display name
  description TEXT,                  -- From editorial tagging guide
  parent_id VARCHAR(20),             -- For GEO hierarchy (UI grouping only)
  slug VARCHAR(100),                 -- URL-safe version of label
  active BOOLEAN DEFAULT TRUE,
  sort_order INT,
  created_at TIMESTAMP,
  deprecated_at TIMESTAMP
);

-- Article-to-tag associations
CREATE TABLE article_tags (
  article_id UUID NOT NULL,
  tag_id VARCHAR(20) NOT NULL REFERENCES platform_tags(id),
  is_primary BOOLEAN DEFAULT FALSE,
  confidence FLOAT,                  -- AI confidence score (null if human-assigned)
  assigned_by VARCHAR(20),           -- 'ai' | 'editorial' | user_id
  created_at TIMESTAMP,
  PRIMARY KEY (article_id, tag_id)
);

-- Company mentions in articles
CREATE TABLE article_companies (
  article_id UUID NOT NULL,
  company_id UUID NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  mention_type VARCHAR(20),          -- subject | partner | competitor | quoted
  created_at TIMESTAMP,
  PRIMARY KEY (article_id, company_id)
);

-- Dynamic navigation views
CREATE TABLE news_views (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  tag_query TEXT NOT NULL,            -- Boolean tag expression
  view_type VARCHAR(20) NOT NULL,    -- section | directory | theme | region | vertical
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(20),            -- editorial | system | auto
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Validation constraints
-- Enforce: exactly 1 primary DIR, 1 primary GEO, 1 primary Company per article
-- Enforce: minimum 4 tags, maximum 10 tags per article
-- Enforce: at least 1 NEWS, 1 DIR, 1 GEO, 1 TYPE per article
```

---

## 11. Editorial Workflow

### Per-Article Tagging Process

1. **Content Type** — Select 1 TYPE tag (what format is this?)
2. **Commercial Status** — Select 1 COMM tag (editorial or paid?)
3. **Primary Directory Category** — Select 1 DIR tag as primary (which category page owns this?)
4. **Secondary Directory Categories** — Optionally add 1-2 more DIR tags
5. **Primary Geographic** — Select 1 GEO tag as primary (which market page owns this?)
6. **Secondary Geographic** — Optionally add 1-3 more GEO tags
7. **Primary Company** — Confirm 1 company as primary subject
8. **Secondary Companies** — Review AI-extracted company mentions
9. **News Topics** — Select 2-4 NEWS tags (all equal weight)
10. **Product Verticals** — Select 0-2 PROD tags if applicable
11. **Event Anchor** — Select if tied to a specific industry event (Phase 2)

### AI-Assisted Workflow

For AI-processed articles:
1. AI auto-applies tags above confidence thresholds
2. AI **suggests** primary DIR/GEO/Company (never auto-applies primary)
3. Editor reviews suggestions, confirms/overrides primary designations
4. Editor adds any missing context tags AI couldn't detect

---

## 12. SEO Integration

### How Primary Tags Drive SEO

| Element | Source |
|---------|--------|
| Canonical URL | Primary DIR slug or primary GEO slug |
| Breadcrumbs | `News > [Primary DIR label] > Article title` |
| Schema.org | `article.about` → primary DIR category |
| Internal links | Article strengthens primary category page PageRank |
| Sitemap | Articles grouped under primary DIR category |
| Meta keywords | All tags (primary + secondary) |

### Category Page SEO

Each DIR/GEO/PROD tag with `active = true` generates an SEO-optimized page:
- Title: `[Tag Label] News & Updates | OnlyiGaming`
- Description: From `platform_tags.description`
- Schema: CollectionPage with hasPart references
- Content: Filtered article feed + optional editorial intro

---

## 13. Scalability Considerations

### Adding New Sections

When the platform grows beyond the initial sections:
1. Define new view in `news_views` table (slug, label, tag query)
2. Set `view_type` and `sort_order`
3. No code changes required — same template renders all views

### Adding New Content Types (Podcasts, Video, Events)

1. TYPE tags already include TYPE-013 (Video) and TYPE-014 (Podcast)
2. New content uses the same tagging dimensions
3. Views can filter by TYPE: `/news/podcasts` → `TYPE-014`
4. Same article template adapts to content type (embed player, etc.)

### Adding New Tags

Process (to be formalized at Day 90 governance workshop):
1. Propose new tag with dimension, label, description
2. Editorial approval (Stefan)
3. Add to `platform_tags` table
4. Update Editorial Tagging Guide
5. Retrain AI auto-tagger if applicable

### Tag Deprecation

1. Set `deprecated_at` timestamp on tag
2. Tag no longer appears in CMS tag picker
3. Existing articles retain the tag (historical accuracy)
4. Views using deprecated tags continue to work (shows older content)
5. After 90 days with no new assignments, consider archiving

---

## 14. Cross-Project Integration

This tagging system is shared across 4 OnlyiGaming projects:

| Project | Uses | Integration Point |
|---------|------|-------------------|
| **News-Section** | All 8 dimensions | Primary consumer — articles tagged here |
| **Content-Pipeline** | DIR, NEWS, GEO, PROD, Company | Auto-tags scraped content for reuse |
| **SEO** | DIR (primary) | 81 category pages with FAQ schema |
| **Directory** | DIR (primary), GEO, PROD | Business category listings |

All projects read from the same `platform_tags` table. The News-Section's Editorial Tagging Guide remains the definitive reference for tag definitions and usage criteria.

---

## 15. Open Items (Phase 2)

| Item | Decision Needed | Timeline |
|------|-----------------|----------|
| Event anchor tags | Define event list and tag IDs | When editorial calendar established |
| Author attribution | Add AUTH dimension? | Based on traffic data |
| Tag governance formal process | Who approves, SLA, deprecation rules | Day 90 governance workshop |
| Confidence threshold tuning | Adjust per dimension based on data | After 100 tagged articles |
| Full GEO tag list | Confirm all countries needed at launch | Before database seeding |
| URL structure | `/news/[dir-slug]/[article]` vs. `/news/[article]` | Before Phase 1 implementation |

---

## Document Status

| Field | Value |
|-------|-------|
| Status | Draft — Pending team review |
| Author | Strategic analysis session |
| Audience | Development, Editorial, SEO |
| Dependencies | Editorial Tagging Guide (tag definitions), Platform Architecture v5.3 |
| Next Action | Team review → Finalize → Seed database |
