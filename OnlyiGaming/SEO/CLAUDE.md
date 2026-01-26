# OnlyiGaming SEO Implementation Project

## Project Overview
SEO optimization project for OnlyiGaming, an iGaming B2B directory platform with 1,500+ company profiles. The goal is to achieve scalable organic growth through structural clarity and incremental intelligence, positioning OnlyiGaming as the definitive knowledge layer for the iGaming industry.

## Goals
1. Implement foundational SEO technical infrastructure (schema markup, title/meta templates, heading structure)
2. Establish OnlyiGaming as the authoritative knowledge source through comprehensive FAQ content across 81 directory categories
3. Increase organic traffic through improved SERP visibility (rich snippets, FAQ dropdowns, Google Jobs integration)
4. Build topical authority through strategic content distribution from podcast/media assets
5. Achieve measurable improvements: 20-30% CTR increase from schema, 50-100% career traffic increase from JobPosting schema

## Key Documents
- /docs/SEO Strategy - 11.12.25.docx - Comprehensive SEO strategy including quick wins, FAQ strategy, news SEO, and podcast content distribution
- /docs/SEO Implementation Task List 11.12.25.docx - Prioritized task list with owner assignments and technical specifications
- ROADMAP.md - Project phases and implementation timeline

## 🔄 Auto-Sync to Google Docs (IMPORTANT)
**After updating any key markdown files, always run:**
```bash
cd /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO && ./auto-sync-to-google-docs.sh
```

This automatically creates Google Docs-ready versions of:
- PROJECT_STATUS.md → PROJECT_STATUS_FOR_GOOGLE_DOCS.md
- ROADMAP.md → ROADMAP_FOR_GOOGLE_DOCS.md
- QUICK_START.md → QUICK_START_FOR_GOOGLE_DOCS.md
- README.md → README_FOR_GOOGLE_DOCS.md

User can then copy/paste these into Google Docs to share with team.

## Architecture/Stack
- Platform: OnlyiGaming B2B directory (existing functionality)
- Content Types: Company profiles (1,500+), Category pages (81), News articles, Job listings, Podcast hub
- SEO Assets: Schema.org markup (JSON-LD), Dynamic meta templates, FAQ content, Internal linking structure
- Tools: Google Search Console, Rich Results Test, Google Analytics 4

## Current Status
**Project Phase:** Phase 1 Implementation - In Progress

**What's Done:**
- Comprehensive SEO strategy documented (Version 3.0)
- Technical specifications prepared for all schema implementations
- Task prioritization completed with clear owner assignments
- Field mappings and templates ready for developer implementation
- Organization Schema implemented on company pages (Task 1.1)
- Review Schema implemented on review pages (Task 1.2)
- BreadcrumbList Schema implemented on all pages (Task 1.3)
- JobPosting Schema implemented on career pages (Task 1.4)
- Sitemap changes and improvements completed (Task 1.5)
- FAQ content created for 10 companies

**What's Active:**
- Bojan: FAQPage Schema implementation (Task 3.4) - in progress this week
- Bojan: News Schema implementation - in progress this week
- Daniel: FAQ content creation (10 companies completed, continuing)
- Phase 1 foundational schemas: COMPLETE (Organization, Review, BreadcrumbList, JobPosting)
- Phase 1 overall: ~85% complete

**Blockers:**
- None currently. Phase 1 progressing well with multiple schemas deployed.

## Team & Roles
- **Bojan (Developer):** Schema implementation, title/meta templates, internal linking, H1 structure fixes
- **Stefan (SEO):** FAQ briefs, H1/heading audits, SEO QA checklist, Search Console monitoring
- **Daniel (Content):** FAQ content writing based on Stefan's briefs

## Session Log

### 2026-01-23 (Update 3): Schema Verification Completed - All Foundational Schemas Verified Live
**Verification Completed:**
- All Phase 1 foundational schemas verified as live and production-ready through direct HTML inspection
- Verification method: Direct curl + grep (WebFetch tool unreliable for JSON-LD extraction in Next.js)
- Test URL: https://onlyigaming.com/companies/kyzen
- Job page tested: https://onlyigaming.com/careers/jobs/senior-product-manager-sports

**Verified Schemas:**
- Organization Schema (Task 1.1) - Found with logo, address, aggregateRating
- Review Schema (Task 1.2) - Found with proper structure
- BreadcrumbList Schema (Task 1.3) - Found on all tested pages with proper hierarchy
- JobPosting Schema (Task 1.4) - Found with validThrough field, hiring org, location

**Quality Assessment:**
- All schemas follow schema.org standards correctly
- All critical fields present and properly formatted
- Bojan's reported work is 100% verified and production-ready

**Lesson Learned:**
- For schema verification in Next.js applications, use direct HTML inspection (curl) rather than WebFetch
- WebFetch may miss JSON-LD blocks in complex server-rendered applications

### 2026-01-23 (Update 2): JobPosting Schema Completion - Foundational Schemas Now Complete
**Major Milestone Achieved:**
- Bojan completed JobPosting Schema implementation on career pages (Task 1.4)
- ALL foundational Phase 1 schemas now DEPLOYED: Organization, Review, BreadcrumbList, JobPosting
- Phase 1 schema markup now ~85% complete (only FAQPage and News schemas remaining)

**Significance:**
- Expected 50-100% traffic increase to career section via Google Jobs integration
- All core entity types (companies, reviews, jobs, navigation) now have proper schema markup
- Rich snippets for company profiles, reviews, and job listings ready for SERP display
- Foundation for advanced content strategies (Phase 2-4) now fully established

**Active Work:**
- Bojan implementing FAQPage Schema (Task 3.4) - in progress this week
- Bojan implementing News Schema - in progress this week
- Daniel continuing FAQ content creation for remaining companies

**Next Priority:**
1. Bojan completes FAQPage Schema this week
2. Bojan completes News Schema this week
3. Deploy title/meta templates (Tasks 2.1, 2.2)
4. Daniel continues FAQ content for remaining companies
5. Check status of Stefan's FAQ brief template (Task 3.1)

### 2026-01-23 (Update 1): Phase 1 Major Progress Update
**Accomplishments:**
- Bojan completed Organization Schema implementation on company pages (Task 1.1)
- Bojan completed Review Schema implementation on review pages (Task 1.2)
- Bojan completed BreadcrumbList Schema implementation on all pages (Task 1.3)
- Bojan completed sitemap changes and improvements (Task 1.5)
- Daniel created FAQ content for 10 companies
- Phase 1 schema markup reached ~80% complete

**Active Work:**
- Bojan implementing FAQPage Schema (Task 3.4)
- Bojan implementing News Schema
- Daniel continuing FAQ content creation for remaining companies

**Decisions:**
- Task 6.1 (SEO QA Checklist) CANCELLED - Stefan does not need to create this

### 2025-12-14: Project Initialization
**Accomplishments:**
- Analyzed comprehensive SEO strategy documentation (39 pages covering quick wins, FAQ strategy, news SEO, podcast distribution)
- Analyzed detailed implementation task list with technical specifications
- Created foundational context files (CLAUDE.md, GEMINI.md, AGENTS.md)
- Created detailed roadmap with 4 implementation phases

**Decisions:**
- Prioritize schema markup as Phase 1 (highest impact, ready for immediate implementation)
- Focus on top 20 high-value categories for initial FAQ rollout
- Exclude podcast episode pages from indexing (noindex strategy) while distributing content to category/company pages
- Use phased approach: Phase 1 (Quick Wins) -> Phase 2 (FAQ Content) -> Phase 3 (Advanced Content) -> Phase 4 (Ongoing Optimization)

**Next Priority:**
Phase 1 implementation - Bojan can start immediately on schema markup tasks (Organization, Review, BreadcrumbList, JobPosting schemas)

## FAQ Generation
For category FAQ tasks, follow /SEO/faq-generation/SKILL.md

### Current Status (2026-01-21)
- ✅ Wave 1 (10 categories) — COMPLETE
- ⏳ Wave 2 (20 categories) — READY TO START

### Wave 1 Output
Location: `/SEO/faq-generation/output/wave-1/`
All 10 categories complete: White Label, Turnkey, Casino Platforms, Licensing, Payment Processing, Game Providers, Affiliate Programs, KYC, AML, Sportsbook

### Next Action: Wave 2
Start with category #11 (Live Casino Studios) from `/SEO/faq-generation/config/categories.md`
Create output in `/SEO/faq-generation/output/wave-2/`

### Content Format
- 14 questions per category (6 H2 + 8 H3)
- ~3,200 words per category
- Use `####` for sub-headings within answers
- NO tables (site doesn't support them)
- Use bullet points and numbered lists instead
