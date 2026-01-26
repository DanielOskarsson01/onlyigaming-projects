# OnlyiGaming SEO - Quick Start Guide

## For Bojan (Developer) - START HERE

### You Can Start RIGHT NOW - No Blockers

**Phase 1 Priority Tasks (Week 1-2):**

1. **Schema Markup Implementation** (Highest Impact)
   - Task 1.1: Organization Schema on company pages
   - Task 1.2: Review Schema on company pages
   - Task 1.3: BreadcrumbList Schema on all pages
   - Task 1.4: JobPosting Schema on career pages

   **Where to find specs:** /docs/SEO Implementation Task List 11.12.25.docx
   - Complete JSON-LD templates provided
   - Field mappings documented
   - Conditional logic specified

2. **Title & Meta Templates** (Quick Win)
   - Task 2.1: Dynamic title tags
   - Task 2.2: Dynamic meta descriptions

   **Templates provided for:** Company pages, category pages, career hub, job pages

3. **Validation** (Critical)
   - Test all schemas: https://search.google.com/test/rich-results
   - Monitor: Google Search Console > Enhancements
   - Check: Manual SERP appearance

**Expected Impact:**
- 20-30% CTR increase from rich snippets
- 50-100% career traffic increase from Google Jobs
- Rich snippets within 2-4 weeks of deployment

---

## For Stefan (SEO) - START HERE

### You Can Start RIGHT NOW - No Blockers

**Phase 1 Priority Tasks (Week 1-2):**

1. **Task 3.1: Create FAQ Brief Template**
   - Required components: Category name/ID, keywords, competitor analysis, 8-15 questions, answer guidance, themes, internal links
   - Deliver to: Daniel
   - Timeline: This week

2. **Task 6.1: Create SEO QA Checklist**
   - Pre-launch checklist (before pages go live)
   - Weekly monitoring checklist (Search Console)
   - Monthly review checklist (rankings, traffic)

3. **Task 5.1: Begin H1-H6 Structure Audit**
   - Document: Missing H1s, multiple H1s, level skips, non-semantic usage
   - Deliver: Issues spreadsheet to Bojan

**Next Week:**

4. **Task 3.2: Complete FAQ Briefs for Top 20 Categories**
   - Priority order documented in ROADMAP.md
   - Start with: Casino Platform Providers, Game Developers, Sports Betting, Payment Solutions

---

## For Daniel (Content) - STANDBY

### Waiting for Dependencies

**Your Next Task:**

**Task 3.3: Write FAQ Content**
- **Depends on:** Stefan completing Task 3.2 (FAQ briefs for top 20 categories)
- **Timeline:** Weeks 2-4

**Quality Checklist (Use This):**
- [ ] Direct answer in first sentence
- [ ] 50-300 words per answer
- [ ] At least 1 internal link
- [ ] Factually accurate
- [ ] No fluff or filler
- [ ] Natural keyword usage (not stuffed)

**Expected Output:**
- 160-300 FAQs for top 20 categories
- Each category: 8-15 FAQs
- Review quarterly based on Search Console data

---

## Project Structure Overview

```
/SEO/
├── docs/
│   ├── SEO Strategy - 11.12.25.docx          [39-page comprehensive strategy]
│   └── SEO Implementation Task List 11.12.25.docx  [Technical specifications]
├── ROADMAP.md                                 [5-phase implementation plan]
├── PROJECT_STATUS.md                          [Current state & next actions]
├── QUICK_START.md                             [This file - quick reference]
├── CLAUDE.md                                  [Claude AI context]
├── GEMINI.md                                  [Gemini AI context]
└── AGENTS.md                                  [Generic AI context]
```

---

## File Locations (Absolute Paths)

**Strategy Documents:**
- SEO Strategy: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/docs/SEO Strategy - 11.12.25.docx`
- Task List: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/docs/SEO Implementation Task List 11.12.25.docx`

**Project Management:**
- Roadmap: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/ROADMAP.md`
- Status: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/PROJECT_STATUS.md`
- Quick Start: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/QUICK_START.md`

**AI Context Files:**
- Claude: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/CLAUDE.md`
- Gemini: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/GEMINI.md`
- Agents: `/Users/daniel-oldlaptop/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/AGENTS.md`

---

## Key Resources

**Validation Tools:**
- Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Docs: https://schema.org/
- Google Search Console: (Monitor Enhancements section)

**Schema Templates:**
All templates with field mappings in Task List document:
- Organization Schema (Task 1.1) - Company pages
- Review Schema (Task 1.2) - Individual reviews
- BreadcrumbList Schema (Task 1.3) - All pages
- JobPosting Schema (Task 1.4) - Career pages
- FAQPage Schema (Task 3.4) - Category pages with FAQs

---

## Critical Implementation Notes

### For Bojan - IMPORTANT

**JobPosting Schema:**
- validThrough field is REQUIRED
- Google penalizes missing or expired dates
- If source doesn't provide expiry: Use posted_date + 60 days
- Set up automated cleanup for expired jobs

**Schema Validation:**
- Test EVERY schema with Rich Results Test before deployment
- Monitor Search Console > Enhancements for errors
- Fix errors immediately to maintain SERP visibility

**Title Tag Limits:**
- 50-60 characters maximum
- Truncate if needed to stay within limit

**Meta Description Limits:**
- 150-160 characters maximum

---

## Success Metrics - Phase 1

**Week 1-2 Completion Criteria:**
- [ ] All company pages have Organization schema
- [ ] All review pages have Review schema
- [ ] All job pages have JobPosting schema
- [ ] All pages have BreadcrumbList schema
- [ ] 100% schemas pass Rich Results Test
- [ ] Zero schema errors in Search Console
- [ ] Title/meta templates deployed

**2-4 Weeks Post-Deployment:**
- [ ] Rich snippets appear in SERP
- [ ] Company pages show logos and ratings
- [ ] Jobs appear in Google Jobs search

---

## FAQ - Common Questions

**Q: Where are the technical specs for schema implementation?**
A: /docs/SEO Implementation Task List 11.12.25.docx - Tasks 1.1-1.4 have complete JSON-LD templates and field mappings

**Q: What if I find a blocker or issue?**
A: Document it in PROJECT_STATUS.md under "Active Blockers" section and notify the team

**Q: How do I validate schemas?**
A: Use https://search.google.com/test/rich-results - paste page URL or code snippet

**Q: What order should tasks be done?**
A: Follow priority order in ROADMAP.md - Phase 1 tasks can be done in parallel

**Q: When will we see results?**
A: Rich snippets typically appear 2-4 weeks after deployment if schemas validate correctly

---

## Contact & Ownership

**Technical Implementation:** Bojan (Developer)
**SEO Strategy & Audits:** Stefan (SEO Lead)
**Content Production:** Daniel (Content Writer)

---

## Decision Authority

**SEO Strategy Decisions:** Stefan
**Content Quality Decisions:** Stefan + Daniel (jointly)
**Technical Implementation Decisions:** Bojan (with SEO review by Stefan before deployment)

---

## Next Steps Summary

1. **Bojan:** Start schema implementation TODAY (Tasks 1.1-1.4)
2. **Stefan:** Create FAQ brief template THIS WEEK (Task 3.1)
3. **Stefan:** Create SEO QA checklist THIS WEEK (Task 6.1)
4. **Daniel:** Standby for FAQ briefs from Stefan
5. **All:** Review ROADMAP.md for full context and dependencies

**Project Status: GREEN - Ready for immediate Phase 1 implementation**
