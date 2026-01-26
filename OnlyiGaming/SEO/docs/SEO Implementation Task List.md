# SEO Implementation Task List

**OnlyiGaming — Ordered by Priority**
**December 2025**

**SCOPE:** Only tasks that can be executed NOW with existing functionality. Excluded: News schemas, Podcast schemas (not yet built)

---

## PRIORITY 1: Schema Markup

These are copy-paste implementations. Developer needs the JSON-LD templates and field mapping.

### Task 1.1: Organization Schema on Company Pages

**Owner:** Bojan (Dev)
**Status:** Ready to implement
**Impact:** Shows company logo, rating stars in Google. 20-30% CTR increase expected.

**Implementation:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{{company.name}}",
  "url": "https://onlyigaming.com/companies/{{company.slug}}",
  "logo": "{{company.logo_url}}",
  "description": "{{company.description}}",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "{{company.city}}",
    "addressCountry": "{{company.country_code}}"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{company.average_rating}}",
    "reviewCount": "{{company.review_count}}",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

**Field Mapping:**

| Schema Field | Database Field | Notes |
|--------------|----------------|-------|
| name | company.name | Required |
| logo | company.logo_url | Required |
| description | company.short_description | First 160 chars |
| addressCountry | company.hq_country | ISO 2-letter code |
| ratingValue | company.avg_rating | Only if reviews exist |
| reviewCount | company.review_count | Only if > 0 |

**Condition:** Only include aggregateRating block if review_count > 0

**Validation:** https://search.google.com/test/rich-results

---

### Task 1.2: Review Schema on Company Pages

**Owner:** Bojan (Dev)
**Status:** Ready to implement
**Impact:** Each review gets schema. Strengthens aggregateRating signal.

**Implementation (for each review):**
```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Organization",
    "name": "{{company.name}}"
  },
  "author": {
    "@type": "Person",
    "name": "{{review.author_name}}"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "{{review.rating}}",
    "bestRating": "5"
  },
  "datePublished": "{{review.created_at | date: 'YYYY-MM-DD'}}",
  "reviewBody": "{{review.content}}"
}
```

**Note:** Can include multiple Review schemas on one page. datePublished must be ISO format (YYYY-MM-DD).

---

### Task 1.3: BreadcrumbList Schema (All Pages)

**Owner:** Bojan (Dev)
**Status:** Ready to implement
**Impact:** Shows navigation path in Google (Home > Category > Company). Improves CTR.

**Company Pages:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://onlyigaming.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{{company.primary_category.name}}",
      "item": "https://onlyigaming.com/categories/{{company.primary_category.slug}}"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{{company.name}}"
    }
  ]
}
```

**Note:** Last item should NOT have 'item' property (it's the current page).

---

### Task 1.4: JobPosting Schema on Career Pages

**Owner:** Bojan (Dev)
**Status:** Ready to implement (if career section exists)
**HIGH IMPACT:** Gets jobs into Google Jobs search. 50-100% traffic increase to career section.

**Implementation:**
```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "{{job.title}}",
  "description": "{{job.description_html}}",
  "identifier": {
    "@type": "PropertyValue",
    "name": "OnlyiGaming",
    "value": "{{job.id}}"
  },
  "datePosted": "{{job.posted_date | date: 'YYYY-MM-DD'}}",
  "validThrough": "{{job.expiry_date | date: 'YYYY-MM-DDTHH:mm:ssZ'}}",
  "employmentType": ["{{job.employment_type}}"],
  "hiringOrganization": {
    "@type": "Organization",
    "name": "{{job.company_name}}",
    "sameAs": "https://onlyigaming.com/companies/{{job.company_slug}}",
    "logo": "{{job.company_logo}}"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "{{job.city}}",
      "addressCountry": "{{job.country_code}}"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "{{job.salary_currency}}",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": "{{job.salary_min}}",
      "maxValue": "{{job.salary_max}}",
      "unitText": "YEAR"
    }
  },
  "jobLocationType": "{{job.remote_type}}",
  "directApply": true
}
```

**CRITICAL:** validThrough is REQUIRED. Google penalizes missing/expired dates. If source doesn't provide expiry, set to posted_date + 60 days. Jobs with expired validThrough must be removed or de-indexed.

**employmentType Values (use exact strings):**
- FULL_TIME
- PART_TIME
- CONTRACTOR
- TEMPORARY
- INTERN

---

### Task 1.5: Complete Sitemap.xml

**Owner:** Bojan (Dev)
**Status:** Ready to implement
**Impact:** +15% faster indexing, +10% better discoverability for deep links

**Current state:** Only 6 of 85+ internal pages included in sitemap.xml

**Implementation:**
- Update sitemap.xml to include ALL indexable pages:
  - All company profile pages
  - All category pages
  - All career/job pages
  - News pages (when available)
  - Static pages (about, contact, etc.)
- Submit updated sitemap to Google Search Console
- Set up automatic sitemap regeneration when new pages are added

**Effort:** 30 min - 2 hours

---

## PRIORITY 2: Title & Meta Templates

### Task 2.1: Implement Dynamic Title Tags

**Owner:** Bojan (Dev)
**Character limit:** 60 characters. Truncate if needed.

| Page Type | Title Template |
|-----------|----------------|
| Company | {{company.name}} Review 2025 \| {{company.primary_category}} \| OnlyiGaming |
| Category | Best {{category.name}} 2025 \| Compare & Review \| OnlyiGaming |
| Career Hub | iGaming Jobs 2025 \| Casino & Sports Betting Careers \| OnlyiGaming |
| Individual Job | {{job.title}} at {{job.company}} \| iGaming Jobs \| OnlyiGaming |

---

### Task 2.2: Implement Dynamic Meta Descriptions

**Owner:** Bojan (Dev)
**Character limit:** 160 characters.

**Company Pages:**
```html
<meta name="description" content="Read verified reviews of {{company.name}}. Compare features, pricing, and services. {{company.primary_service}} solutions. {{company.rating}} from {{company.review_count}} reviews.">
```

**Category Pages:**
```html
<meta name="description" content="Compare top {{category.name}} providers. Read reviews, compare features. Find the perfect solution for your iGaming business. Updated December 2025.">
```

**Individual Jobs:**
```html
<meta name="description" content="{{job.company}} is hiring a {{job.title}} in {{job.location}}. {{job.key_requirement}}. Apply through OnlyiGaming.">
```

---

## PRIORITY 3: FAQ Content Creation

FAQ functionality exists on category pages. This task is about creating the actual FAQ content.

### Task 3.1: Stefan Creates FAQ Brief Template

**Owner:** Stefan (SEO)
**Delivers to:** Daniel
**Status:** Needs to be done

Stefan creates a brief template that Daniel will use to write FAQs for each category. Brief should include:
- Category name and ID (DIR-XXX)
- Primary and secondary keywords to target
- Competitor FAQ analysis (what questions competitors answer)
- 8-15 specific questions with answer guidance
- Required FAQ themes (see below)
- Internal linking recommendations

**Required FAQ Themes per Category:**

| Theme | Question Pattern | Example |
|-------|------------------|---------|
| Definition | What is [X]? | What is a casino platform? |
| Selection | How do I choose a [X]? | How do I choose a payment gateway? |
| Pricing | How much does [X] cost? | How much does KYC cost? |
| Comparison | Difference between [A] and [B]? | White-label vs turnkey? |
| Regulations | Is [X] required by [jurisdiction]? | What AML applies to Malta? |

---

### Task 3.2: Stefan Completes Briefs for Top 20 Categories

**Owner:** Stefan (SEO)
**Delivers to:** Daniel

**Priority Order:**

| # | Category | DIR Code | Search Volume |
|---|----------|----------|---------------|
| 1 | Casino Platform Providers | DIR-016 | High |
| 2 | Game Providers / Developers | DIR-029 | High |
| 3 | Sports Betting Platforms | DIR-017 | High |
| 4 | Payment Solutions | DIR-058 | High |
| 5 | White Label Solutions | DIR-019 | Medium-High |
| 6 | Game Aggregators | DIR-021 | Medium-High |
| 7 | Live Casino Providers | DIR-030 | Medium-High |
| 8 | KYC/Identity Verification | DIR-009 | Medium |
| 9 | Licensing Consultants | DIR-008 | Medium |
| 10 | Affiliate Platforms | DIR-001 | Medium |

(Plus 10 more: Crypto Payments, RNG Certification, Sportsbook, Slots, CRM, Fraud, Hosting, RG, AML, Recruitment)

---

### Task 3.3: Daniel Writes FAQ Content

**Owner:** Daniel (Content)
**Input:** FAQ briefs from Stefan
**Depends on:** Task 3.2

**Quality Checklist per FAQ:**
- [ ] Direct answer in first sentence
- [ ] 50-300 words
- [ ] Includes at least 1 internal link
- [ ] Factually accurate
- [ ] No fluff or filler content
- [ ] Natural keyword usage (not stuffed)

---

### Task 3.4: Implement FAQPage Schema

**Owner:** Bojan (Dev)
**Depends on:** FAQ content being added to CMS

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{#each category.faqs}}
    {
      "@type": "Question",
      "name": "{{this.question}}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{this.answer}}"
      }
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

---

## PRIORITY 4: Internal Linking

### Task 4.1: Add Related Companies Section

**Owner:** Bojan (Dev)
**Status:** Ready to implement

Display 5-7 companies from the same primary category on each company page.

```html
<section class="related-companies">
  <h2>Similar {{company.primary_category}} Companies</h2>
  <ul>
    {{#each related_companies limit=7}}
    <li><a href="/companies/{{this.slug}}">{{this.name}}</a> {{this.rating}}</li>
    {{/each}}
  </ul>
  <a href="/categories/{{company.primary_category.slug}}">View all →</a>
</section>
```

---

### Task 4.2: Add Open Positions Section to Company Pages

**Owner:** Bojan (Dev)
**Status:** Ready if career data has company linking

```html
{{#if company.job_count > 0}}
<section class="company-jobs">
  <h2>Open Positions at {{company.name}}</h2>
  <p>{{company.job_count}} open positions</p>
  <a href="/companies/{{company.slug}}/careers/">View all jobs →</a>
</section>
{{/if}}
```

---

### Task 4.3: Careers ↔ Recruitment Cross-Links

**Owner:** Bojan (Dev)
**Status:** Ready to implement

**On Career Hub (/careers/):**
```html
<section class="recruitment-cta">
  <p>Can't find the right role? Work with an iGaming recruitment specialist.</p>
  <a href="/categories/recruitment-services/">Browse Recruitment Agencies →</a>
</section>
```

**On Recruitment Services category:**
```html
<section class="jobs-cta">
  <p>Looking for a job yourself? Browse open positions directly.</p>
  <a href="/careers/">View All iGaming Jobs →</a>
</section>
```

---

## PRIORITY 5: H1-H6 Structure Audit

### Task 5.1: Stefan Audits Current Heading Structure

**Owner:** Stefan (SEO)
**Delivers to:** Bojan
**Status:** Needs to be done

Stefan reviews current pages and documents issues in a spreadsheet:
- Pages with missing H1
- Pages with multiple H1s
- Heading level skips (H2 → H4)
- Non-semantic heading usage (headings used for styling)

---

### Task 5.2: Bojan Implements H1 Fixes

**Owner:** Bojan (Dev)
**Depends on:** Task 5.1 audit

**Correct structure for Company Pages:**
```html
<h1>{{company.name}} - {{company.primary_service}}</h1>
  <h2>Company Overview</h2>
  <h2>Products & Services</h2>
    <h3>{{product_1}}</h3>
    <h3>{{product_2}}</h3>
  <h2>Pricing & Packages</h2>
  <h2>Customer Reviews</h2>
  <h2>Open Positions</h2>
  <h2>Latest News</h2>
```

---

## PRIORITY 6: SEO QA Checklist

Simple governance framework to catch issues before they go live and monitor ongoing quality.

### Task 6.1: Create SEO QA Checklist

**Owner:** Stefan (SEO)
**Status:** Can do now
**Deliverable:** One-page checklist document

**Pre-Launch Checklist (before any page goes live):**
- [ ] Title tag follows template (50-60 chars)
- [ ] Meta description follows template (150-160 chars)
- [ ] H1 exists and is unique
- [ ] H1-H6 hierarchy is correct (no skipped levels)
- [ ] Schema markup present (test with Rich Results)
- [ ] Internal links working
- [ ] Breadcrumbs accurate
- [ ] Images have alt text

**Weekly Monitoring (Stefan):**
- [ ] Search Console: Coverage errors
- [ ] Search Console: Enhancement errors (schema)
- [ ] Search Console: Core Web Vitals
- [ ] New 404s or broken links

**Monthly Review (Stefan):**
- [ ] Keyword ranking changes (top 20 keywords)
- [ ] Organic traffic trends
- [ ] New pages indexed
- [ ] Job posting freshness (expired jobs removed)

**Responsibility Matrix:**

| Check | Who | When |
|-------|-----|------|
| Pre-launch page checks | Daniel (Content) / Bojan (Dev) | Before publish |
| Schema validation | Bojan (Dev) | After deploy |
| Search Console review | Stefan (SEO) | Weekly |
| Performance reporting | Stefan (SEO) | Monthly |

---

## Task Assignment Summary

### Bojan (Developer) — Can Start Immediately
- [ ] Task 1.1: Organization Schema
- [ ] Task 1.2: Review Schema
- [ ] Task 1.3: BreadcrumbList Schema
- [ ] Task 1.4: JobPosting Schema
- [ ] Task 1.5: Complete Sitemap.xml
- [ ] Task 2.1: Title Tag Templates
- [ ] Task 2.2: Meta Description Templates
- [ ] Task 4.1: Related Companies Section
- [ ] Task 4.2: Open Positions Section
- [ ] Task 4.3: Recruitment Cross-Links

### Stefan (SEO) — Can Start Immediately
- [ ] Task 3.1: Create FAQ Brief Template
- [ ] Task 3.2: Complete FAQ Briefs (Top 20 categories)
- [ ] Task 5.1: H1-H6 Structure Audit
- [ ] Task 6.1: Create SEO QA Checklist

### Daniel (Content) — Waiting for Stefan
- [ ] Task 3.3: Write FAQ Content (depends on 3.2)

### Bojan (Developer) — Waiting for Dependencies
- [ ] Task 3.4: FAQPage Schema (depends on FAQ content)
- [ ] Task 5.2: H1 Fixes (depends on audit)
- [ ] Task 4.2: Latest News Section (blocked by News development)

---

## Validation Checklist

After implementation, validate with:

**Schema Validation:**
- https://search.google.com/test/rich-results — Test each page type

**Google Search Console:**
- Enhancements → Review snippets
- Enhancements → Job posting
- Enhancements → Breadcrumbs
- Enhancements → FAQs

**Manual SERP Check:**
- Search for company names, check for rich snippets
- Search for job titles, check Google Jobs appearance

---

*— End of Task List —*
