# OnlyiGaming SEO Implementation Project

## Project Initialization Complete - Ready for Phase 1 Implementation

This project transforms OnlyiGaming into the definitive knowledge layer for iGaming B2B through structural SEO clarity and incremental intelligence.

---

## Quick Navigation

### Start Here
- **[QUICK_START.md](QUICK_START.md)** - Team quick reference guide with immediate next actions
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current status, priorities, and blockers
- **[ROADMAP.md](ROADMAP.md)** - Complete 5-phase implementation plan

### For AI Assistants
- **[CLAUDE.md](CLAUDE.md)** - Project context for Claude
- **[GEMINI.md](GEMINI.md)** - Project context for Gemini
- **[AGENTS.md](AGENTS.md)** - Project context for other AI agents

### Strategy & Specifications
- **[docs/SEO Strategy - 11.12.25.docx](docs/SEO%20Strategy%20-%2011.12.25.docx)** - 39-page comprehensive strategy
- **[docs/SEO Implementation Task List 11.12.25.docx](docs/SEO%20Implementation%20Task%20List%2011.12.25%20.docx)** - Technical specifications with field mappings

---

## Current Status: GREEN - Ready to Launch

**Phase 1 (Week 1-2) can start immediately with no blockers**

### Immediate Actions

**Bojan (Developer) - START TODAY:**
1. Implement Organization Schema on company pages
2. Implement Review Schema on company pages
3. Implement BreadcrumbList Schema on all pages
4. Implement JobPosting Schema on career pages
5. Deploy title tag templates
6. Deploy meta description templates

**Stefan (SEO) - START THIS WEEK:**
1. Create FAQ brief template
2. Create SEO QA checklist
3. Begin H1-H6 structure audit

**Daniel (Content) - STANDBY:**
- Ready to write FAQ content when Stefan completes briefs

---

## Expected Impact - Phase 1

- **20-30% CTR increase** from rich snippets (Organization schema with logos and ratings)
- **50-100% traffic increase** to career section (Google Jobs integration via JobPosting schema)
- **Rich snippets in SERP** within 2-4 weeks of deployment
- **Improved SERP visibility** through breadcrumb navigation display

---

## Project Structure

```
/SEO/
├── README.md                          [This file - project overview]
├── QUICK_START.md                     [Team quick reference]
├── PROJECT_STATUS.md                  [Current status & next actions]
├── ROADMAP.md                         [5-phase implementation plan]
├── CLAUDE.md                          [Claude AI context]
├── GEMINI.md                          [Gemini AI context]
├── AGENTS.md                          [Generic AI context]
├── docs/
│   ├── SEO Strategy - 11.12.25.docx          [Comprehensive strategy - 39 pages]
│   └── SEO Implementation Task List 11.12.25.docx  [Technical specs]
├── archive/                           [Historical documents]
├── assets/                            [Project assets]
└── research/                          [Research materials]
```

---

## Key Principles

1. **Structural Clarity Over Volume** - Become the knowledge layer, not just more pages
2. **Phased Implementation** - Validate results between phases, manage complexity
3. **High-Impact First** - Schema markup (low effort, high impact) before content creation
4. **Quality Over Quantity** - 20 categories done well > 81 categories done poorly
5. **Data-Driven Decisions** - Search Console query data guides FAQ expansion

---

## Strategic Approach

### Phase 1: Quick Wins (Week 1-2)
Schema markup, title/meta templates, H1 structure - Technical foundation for SERP visibility

### Phase 2: FAQ Content (Week 2-6)
Comprehensive FAQ content across top 20 categories - Establish knowledge authority

### Phase 3: Content Architecture (Month 2)
Internal linking, comparison pages, theme pages - Strengthen site architecture

### Phase 4: Advanced Content (Month 2+)
Podcast content extraction and distribution - Build topical authority

### Phase 5: Ongoing Optimization
QA monitoring, performance tracking, quarterly reviews - Maintain quality

---

## Team & Ownership

**Bojan (Developer)**
- Owns: All technical SEO implementation
- Focus: Schema, templates, internal linking, HTML structure
- Status: Ready to start Phase 1

**Stefan (SEO Lead)**
- Owns: SEO strategy, FAQ briefs, audits, QA, monitoring
- Focus: FAQ templates, SEO checklist, Search Console
- Status: Ready to start Phase 1

**Daniel (Content Writer)**
- Owns: FAQ content, podcast content refinement
- Focus: FAQ writing based on Stefan's briefs
- Status: Standby for FAQ briefs

---

## Success Metrics

### Phase 1 KPIs (Week 1-2)
- 100% schema implementation on relevant pages
- All schemas pass Rich Results Test
- Zero schema errors in Search Console
- Title/meta templates deployed site-wide

### Long-term KPIs (3-6 months)
- 20-30% CTR increase from rich snippets
- 50-100% career traffic increase
- Top 10 rankings for 5+ primary keywords
- FAQ coverage across all 81 categories
- Operational podcast content distribution pipeline

---

## Validation & Quality Assurance

**Before Deployment:**
- Test all schemas: https://search.google.com/test/rich-results
- Validate title tag length (50-60 chars)
- Validate meta description length (150-160 chars)
- Check H1-H6 hierarchy (no skipped levels)

**After Deployment:**
- Monitor Search Console > Enhancements
- Check for schema errors weekly
- Manual SERP checks for rich snippet appearance
- Track keyword rankings monthly

---

## Critical Technical Notes

### JobPosting Schema - IMPORTANT
- **validThrough field is REQUIRED** (Google penalizes missing dates)
- Default to posted_date + 60 days if source doesn't provide expiry
- Set up automated cleanup for expired job listings

### Schema Conditional Logic
- **Organization Schema:** Only include aggregateRating block if review_count > 0
- **Career Sections:** Only show if company.job_count > 0

### Content Quality Standards
- **FAQ Answers:** 50-300 words, direct answer first, at least 1 internal link
- **Podcast Content:** 80% AI draft + 20% human refinement (30-45 min review)

---

## File Locations (Absolute Paths)

**Project Root:** `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO`

**Strategy Documents:**
- SEO Strategy: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/docs/SEO Strategy - 11.12.25.docx`
- Task List: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/docs/SEO Implementation Task List 11.12.25.docx`

**Project Management:**
- Roadmap: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/ROADMAP.md`
- Status: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/PROJECT_STATUS.md`
- Quick Start: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/QUICK_START.md`

---

## Decision Authority

**SEO Strategy:** Stefan
**Content Quality:** Stefan + Daniel (jointly)
**Technical Implementation:** Bojan (with SEO review by Stefan)

---

## Update Frequency

- **PROJECT_STATUS.md:** Weekly during active implementation, monthly during maintenance
- **ROADMAP.md:** Weekly during active phases, monthly during maintenance
- **Session Logs (AI context files):** After each significant session or decision

---

## Questions or Blockers?

1. Review technical specs in implementation task list document
2. Check schema templates and field mappings
3. Review roadmap for dependencies
4. Validate with Rich Results Test
5. Document blockers in PROJECT_STATUS.md

---

## Project Initialized: 2025-12-14

**Status:** GREEN - All Priority 1 tasks ready for immediate implementation

**Next Milestone:** Phase 1 completion (Week 1-2) - Schema markup and on-page optimization foundation

**Expected First Results:** Rich snippets in SERP within 2-4 weeks of Phase 1 deployment
