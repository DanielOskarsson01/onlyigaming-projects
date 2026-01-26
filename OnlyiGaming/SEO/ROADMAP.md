# OnlyiGaming SEO Implementation Roadmap

## Goal Alignment Check
**Core Objective:** Transform OnlyiGaming into the definitive knowledge layer for iGaming B2B through structural SEO clarity and incremental intelligence, not through volume-based content creation.

**Success Criteria:**
- 20-30% CTR increase from rich snippet implementation
- 50-100% traffic increase to career section via Google Jobs integration
- Top 10 rankings for primary category keywords (casino software providers, igaming solutions, etc.)
- Comprehensive FAQ coverage across all 81 directory categories
- Sustainable content pipeline from podcast/media asset extraction

---

## Phase 1: Quick Wins - Schema & On-Page Foundation
**Status:** Ready to start | **Timeline:** Week 1-2 | **Owner:** Bojan (Dev)

**Objective:** Deploy high-impact, low-effort technical SEO foundation that immediately improves SERP visibility

### Tasks

#### 1.1: Schema Markup Implementation
- [ ] **Organization Schema on Company Pages** (Task 1.1)
  - JSON-LD template with aggregateRating support
  - Conditional: Only include rating if review_count > 0
  - Field mapping: company.name, logo_url, short_description, hq_country, avg_rating, review_count
  - **Impact:** 20-30% CTR increase expected from rich snippets with logo and star ratings

- [ ] **Review Schema on Company Pages** (Task 1.2)
  - Individual Review schema for each user review
  - Fields: author_name, rating, created_at (ISO format), content
  - Multiple schemas allowed per page
  - **Impact:** Strengthens aggregateRating signals

- [ ] **BreadcrumbList Schema - All Pages** (Task 1.3)
  - Company pages: Home > Category > Company
  - Category pages: Home > Category
  - Navigation path display in SERP
  - **Impact:** Improved CTR through clear navigation context

- [ ] **JobPosting Schema on Career Pages** (Task 1.4)
  - CRITICAL: validThrough field required (Google penalizes missing/expired dates)
  - Default: posted_date + 60 days if no expiry provided
  - employmentType values: FULL_TIME, PART_TIME, CONTRACTOR, TEMPORARY, INTERN
  - Fields: title, description, datePosted, validThrough, employmentType, hiringOrganization, jobLocation, baseSalary, jobLocationType
  - **Impact:** 50-100% traffic increase to career section via Google Jobs integration

- [ ] **Complete Sitemap.xml** (Task 1.5)
  - Current state: Only 6 of 85+ internal pages included
  - Update sitemap.xml to include ALL indexable pages:
    - All company profile pages
    - All category pages
    - All career/job pages
    - News pages (when available)
    - Static pages (about, contact, etc.)
  - Submit updated sitemap to Google Search Console
  - Set up automatic sitemap regeneration when new pages are added
  - **Impact:** +15% faster indexing, +10% better discoverability for deep links
  - **Effort:** 30 min - 2 hours

**Validation:**
- Test all schemas with https://search.google.com/test/rich-results
- Monitor Search Console > Enhancements for errors
- Manual SERP checks for rich snippet appearance
- Verify sitemap.xml includes all pages (Search Console > Sitemaps)

#### 1.2: Title & Meta Templates
- [ ] **Dynamic Title Tag Implementation** (Task 2.1)
  - Company pages: {{company.name}} Review 2025 | {{category}} | OnlyiGaming (60 char limit)
  - Category pages: Best {{category.name}} 2025 | Compare & Review | OnlyiGaming
  - Career hub: iGaming Jobs 2025 | Casino & Sports Betting Careers | OnlyiGaming
  - Job pages: {{job.title}} at {{company}} | iGaming Jobs | OnlyiGaming

- [ ] **Dynamic Meta Description Implementation** (Task 2.2)
  - Company: "Read verified reviews of {{company.name}}. Compare features, pricing, and services. {{service}} solutions. ⭐ {{rating}} from {{count}} reviews." (160 char limit)
  - Category: "Compare top {{category}} providers. Read reviews, compare features. Find the perfect solution. 🎯 Updated December 2025."
  - Job: "{{company}} is hiring a {{title}} in {{location}}. {{requirement}}. Apply through OnlyiGaming."

**Dependencies:** None - ready for immediate implementation

**Blockers:** None

---

## Phase 2: FAQ Content Strategy
**Status:** Pending | **Timeline:** Week 2-6 | **Owners:** Stefan (SEO) + Daniel (Content)

**Objective:** Establish OnlyiGaming as authoritative knowledge source through comprehensive FAQ content that captures long-tail queries and earns FAQPage rich snippets

### Tasks

#### 2.1: FAQ Infrastructure Setup
- [ ] **Stefan: Create FAQ Brief Template** (Task 3.1)
  - Template includes: Category name/ID (DIR-XXX), primary/secondary keywords, competitor FAQ analysis
  - Required FAQ themes: Definition, Selection, Pricing, Comparison, Regulations
  - 8-15 specific questions per category with answer guidance
  - Internal linking recommendations
  - **Delivers to:** Daniel

- [ ] **Stefan: Complete FAQ Briefs for Top 20 Categories** (Task 3.2)
  - Priority categories (high search volume):
    1. Casino Platform Providers (DIR-016)
    2. Game Providers/Developers (DIR-029)
    3. Sports Betting Platforms (DIR-017)
    4. Payment Solutions (DIR-058)
    5. White Label Solutions (DIR-019)
    6. Game Aggregators (DIR-021)
    7. Live Casino Providers (DIR-030)
    8. KYC/Identity Verification (DIR-009)
    9. Licensing Consultants (DIR-008)
    10. Affiliate Platforms (DIR-001)
    11-20: Crypto Payments, RNG Certification, Sportsbook, Slots, CRM, Fraud, Hosting, RG, AML, Recruitment
  - **Delivers to:** Daniel for content writing

#### 2.2: FAQ Content Production
- [ ] **Daniel: Write FAQ Content for Top 20 Categories** (Task 3.3)
  - Quality checklist per FAQ:
    - Direct answer in first sentence
    - 50-300 words per answer
    - At least 1 internal link
    - Factually accurate
    - No fluff or filler
    - Natural keyword usage (not stuffed)
  - **Depends on:** Task 3.2 (Stefan's briefs)

- [ ] **Bojan: Implement FAQPage Schema** (Task 3.4)
  - JSON-LD FAQPage schema on all category pages with FAQ content
  - Creates expandable FAQ dropdowns directly in Google SERP
  - **Depends on:** FAQ content added to CMS
  - **Impact:** Long-tail keyword capture, rich snippet opportunity, voice search optimization

#### 2.3: FAQ Content Expansion
- [ ] **Stefan: Create briefs for remaining 61 categories** (Categories 21-81)
- [ ] **Daniel: Write FAQ content for remaining categories**
- [ ] **Review & update quarterly based on Search Console query data**

**Dependencies:**
- Task 3.3 depends on Task 3.2
- Task 3.4 depends on Task 3.3

**Blockers:** None - Stefan can start Task 3.1 immediately

---

## Phase 3: Internal Linking & Content Architecture
**Status:** Pending | **Timeline:** Week 3-5 | **Owner:** Bojan (Dev) + Stefan (SEO)

**Objective:** Strengthen site architecture through strategic internal linking and semantic HTML structure

### Tasks

#### 3.1: Internal Linking Implementation
- [ ] **Add Related Companies Section to Company Pages** (Task 4.1)
  - Display 5-7 companies from same primary category
  - Include ratings in link display
  - "View all" link to category page
  - **Impact:** Distributes link equity, improves crawlability

- [ ] **Add Open Positions Section to Company Pages** (Task 4.2)
  - Show job count if > 0
  - Link to company career page
  - **Depends on:** Career data linked to companies

- [ ] **Implement Careers ↔ Recruitment Cross-Links** (Task 4.3)
  - Career hub: Link to recruitment services category
  - Recruitment category: Link to career hub
  - **Impact:** Connects related content, improves user flow

#### 3.2: Heading Structure Optimization
- [ ] **Stefan: Audit Current H1-H6 Structure** (Task 5.1)
  - Document issues: Missing H1, multiple H1s, heading level skips (H2→H4), non-semantic usage
  - Deliver spreadsheet to Bojan
  - **Deliverable:** Issues spreadsheet for Bojan

- [ ] **Bojan: Implement H1 Structure Fixes** (Task 5.2)
  - Company pages structure:
    - H1: {{company.name}} - {{primary_service}}
    - H2: Company Overview, Products & Services, Pricing, Reviews, Open Positions, Latest News
    - H3: Individual products/services under Products & Services H2
  - **Depends on:** Task 5.1 audit completion

**Dependencies:**
- Task 5.2 depends on Task 5.1
- Task 4.2 depends on career data system integration

**Blockers:** None

---

## Phase 4: Content Distribution & Advanced SEO
**Status:** Future | **Timeline:** Month 2+ | **Owner:** Stefan + Daniel + Bojan

**Objective:** Build topical authority through podcast content extraction and advanced content types

### Tasks

#### 4.1: Podcast Content Distribution Pipeline
- [ ] **Establish transcription workflow** (AI transcription via Whisper or similar)
- [ ] **Create content extraction process**
  - AI analysis: Extract key topics, quotes, company mentions, themes
  - AI drafting: Generate article drafts (80% automated)
  - Human review: 30-45 min per article
- [ ] **Weekly distribution schedule**
  - Week 1: Category articles (1,500-2,800 words)
  - Week 2: Company page updates (300-500 words)
  - Week 3: Theme page sections (500-1,000 words)
  - Week 4: Community distribution
- [ ] **Create noindex episode pages** with transcript
  - Meta robots: noindex, follow
  - Canonical to /podcasts/ hub
  - robots.txt disallow /podcasts/*/

**Expected Output Per Episode:**
- 1-2 long-form articles (1,500-2,800 words each)
- 3-5 company page updates (300-500 words each)
- 1-2 theme page sections (500-1,000 words each)
- 5-10 FAQ entries for category pages
- 2 expert profile updates
- 10-15 social media snippets

#### 4.2: News Section SEO
**Status:** Blocked - News functionality not yet built

- [ ] **Implement NewsArticle schema** (see SEO Strategy Part 3)
- [ ] **Add Open Graph tags** for social sharing
- [ ] **Create author profile pages** with Person schema
- [ ] **Build news sitemap** for Google News inclusion
- [ ] **Integrate news-to-directory linking**
  - Company mentions → company profile links
  - Company profiles → "Latest News" section
  - Category pages → "Latest News in Category" widget

#### 4.3: Advanced Content Types
- [ ] **Build comparison pages** (/compare/company-a-vs-company-b)
  - Feature comparison tables
  - User reviews summary
  - Pricing structure comparison
  - Verdict/recommendation section

- [ ] **Create theme pages** (/themes/theme-name)
  - Historical context
  - Expert perspectives from podcast content
  - Timeline events
  - Case studies

- [ ] **Develop expert profiles** (/experts/expert-name)
  - Quotes from podcast appearances
  - Philosophy and insights
  - Career background
  - Featured perspectives

**Dependencies:**
- News SEO depends on news functionality being built
- Podcast distribution requires transcription workflow setup

**Blockers:**
- News section not yet developed
- Podcast content extraction workflow needs setup

---

## Phase 5: Quality Assurance & Monitoring
**Status:** Ready to implement | **Timeline:** Ongoing | **Owner:** Stefan (SEO)

**Objective:** Maintain SEO quality and catch issues before they impact rankings

### Tasks

#### 5.1: SEO QA Framework
- [ ] **Stefan: Create SEO QA Checklist** (Task 6.1)

**Pre-Launch Checklist (before any page goes live):**
- Title tag follows template (50-60 chars)
- Meta description follows template (150-160 chars)
- H1 exists and is unique
- H1-H6 hierarchy correct (no skipped levels)
- Schema markup present and validated
- Internal links working
- Breadcrumbs accurate
- Images have alt text

**Weekly Monitoring (Stefan):**
- Search Console: Coverage errors
- Search Console: Enhancement errors (schema)
- Search Console: Core Web Vitals
- New 404s or broken links

**Monthly Review (Stefan):**
- Keyword ranking changes (top 20 keywords)
- Organic traffic trends
- New pages indexed
- Job posting freshness (expired jobs removed)

#### 5.2: Performance Tracking
- [ ] **Set up GA4 event tracking**
  - company_profile_view
  - comparison_completed
  - review_submitted
  - faq_expanded

- [ ] **Monitor Primary Metrics**
  - Organic traffic growth (MoM)
  - Keyword rankings (Top 3, Top 10, Top 100)
  - Domain Rating (Ahrefs) / Domain Authority (Moz)
  - Organic conversion rate
  - Pages per session

**Dependencies:** None - can start immediately

**Blockers:** None

---

## Implementation Priority Matrix

### HIGH VALUE, LOW EFFORT (Week 1-2) - START HERE
- Title/Meta templates (Tasks 2.1, 2.2)
- 4 core schemas: Organization, Review, JobPosting, Breadcrumb (Tasks 1.1-1.4)
- Complete Sitemap.xml (Task 1.5)
- H1-H6 structure audit and fixes (Tasks 5.1, 5.2)
- Internal linking (Tasks 4.1, 4.3)
- SEO QA checklist (Task 6.1)

### HIGH VALUE, MEDIUM EFFORT (Week 2-4)
- FAQPage schema implementation (Task 3.4)
- Category FAQs for top 20 categories (Tasks 3.1, 3.2, 3.3)
- Related companies widgets (Task 4.1)

### HIGH VALUE, HIGH EFFORT (Month 2+)
- Podcast content extraction workflow and distribution
- Theme page development
- Comparison page creation
- Full FAQ rollout (81 categories)
- Link building campaigns

### MEDIUM VALUE, LOW EFFORT
- Breadcrumb navigation UI
- Related company widgets
- Social meta tags
- News sitemap (when news functionality exists)

---

## Current Sprint: Phase 1 - Week 1-2

**Focus:** Schema markup and on-page optimization foundation

**Active Tasks:**
1. Bojan: Implement Organization Schema (Task 1.1)
2. Bojan: Implement Review Schema (Task 1.2)
3. Bojan: Implement BreadcrumbList Schema (Task 1.3)
4. Bojan: Implement JobPosting Schema (Task 1.4)
5. Bojan: Complete Sitemap.xml (Task 1.5)
6. Bojan: Deploy Title Tag Templates (Task 2.1)
7. Bojan: Deploy Meta Description Templates (Task 2.2)
8. Stefan: Begin FAQ Brief Template (Task 3.1)
9. Stefan: Create SEO QA Checklist (Task 6.1)

**Success Criteria:**
- All schemas validate in Rich Results Test
- Rich snippets appear in Google SERP within 2-4 weeks
- Title/meta templates deployed across all page types
- Zero schema errors in Search Console

**Next Sprint Preview:** Phase 2 FAQ content (Stefan completes briefs, Daniel begins content writing)

---

## Risk Register

### Technical Risks
- **Risk:** Schema validation errors prevent rich snippets
  - **Mitigation:** Validate every schema with Rich Results Test before deployment
  - **Owner:** Bojan

- **Risk:** JobPosting schema missing validThrough dates causes Google penalties
  - **Mitigation:** Default to posted_date + 60 days if no expiry; automated cleanup of expired jobs
  - **Owner:** Bojan

### Content Risks
- **Risk:** FAQ content quality issues (thin content, keyword stuffing)
  - **Mitigation:** Stefan provides detailed briefs; Daniel follows quality checklist; quarterly reviews
  - **Owner:** Stefan + Daniel

- **Risk:** Podcast content extraction generates low-quality or duplicate content
  - **Mitigation:** Human review required (30-45 min per article); AI drafts at 80%, human refinement at 20%
  - **Owner:** Daniel

### Resource Risks
- **Risk:** Stefan FAQ brief creation bottleneck delays Daniel's content writing
  - **Mitigation:** Stefan completes all 20 briefs before Daniel starts; batch processing
  - **Owner:** Stefan

---

## Measurement & Success Tracking

### Phase 1 KPIs (Week 1-2)
- [ ] 100% of company pages have Organization schema
- [ ] 100% of review pages have Review schema
- [ ] 100% of job pages have JobPosting schema
- [ ] All schemas pass Rich Results Test validation
- [ ] Title/meta templates deployed across all page types
- [ ] Sitemap.xml includes all 85+ pages (submitted to Search Console)

### Phase 2 KPIs (Week 2-6)
- [ ] FAQ briefs completed for top 20 categories
- [ ] FAQ content written for top 20 categories (160-300 FAQs total)
- [ ] FAQPage schema implemented on all category pages with content
- [ ] FAQ rich snippets appear in SERP

### Phase 3 KPIs (Month 2)
- [ ] Related companies sections on all company pages
- [ ] H1-H6 structure audit complete
- [ ] Zero heading hierarchy errors
- [ ] Internal linking metrics: avg 5-7 internal links per page

### Long-term KPIs (3-6 months)
- [ ] 20-30% CTR increase from baseline (rich snippets impact)
- [ ] 50-100% career section traffic increase (Google Jobs integration)
- [ ] Top 10 rankings for 5+ primary category keywords
- [ ] FAQ coverage across all 81 categories
- [ ] Podcast content distribution pipeline operational (1 episode = 10-15 assets)

---

## Notes

**Cold Start Context:** This roadmap provides complete project context for any team member or AI assistant picking up the work. All tasks have clear specifications in the implementation task list document. No assumptions are required - everything needed to execute is documented.

**Decision Authority:** SEO strategy decisions rest with Stefan. Content quality decisions rest with Daniel and Stefan jointly. Technical implementation decisions rest with Bojan, with SEO review by Stefan before deployment.

**Update Frequency:** This roadmap should be updated weekly during active implementation phases, monthly during maintenance phases.
