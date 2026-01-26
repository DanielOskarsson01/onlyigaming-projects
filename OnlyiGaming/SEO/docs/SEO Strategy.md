# OnlyiGaming Combined SEO Strategy

**Version 3.0 | December 2025**

**Comprehensive SEO Implementation Guide**
Including: Quick Wins | FAQ Strategy | News SEO | Podcast Content Distribution

---

## Executive Summary

OnlyiGaming's competitive advantage will not come from 'more pages,' but from structural clarity and incremental intelligence:

1. **Phase 1:** Become the definitive knowledge layer — companies + categories + FAQs
2. **Phase 2:** Refine for the highest-value audience(s) validated by data

This dual-stage approach ensures scalable SEO growth, market relevance, and long-term strategic defensibility.

### Current State

**Strengths:**
- Clean URL structure (/companies/company-name)
- Existing company database (1500+ profiles)
- User review system in place
- Modern technical stack

**Weaknesses:**
- Low domain authority
- Missing high-volume keyword targeting
- Limited topical content beyond company profiles
- Minimal backlink profile
- No schema markup implementation

---

## Part 1: Quick Wins (Low Effort, High Impact)

### 1.1 On-Page Optimization

#### Title Tag Templates

**Character limit:** 50-60 characters

**Company Pages:**
```html
<title>[Company Name] Review 2025 | iGaming Solutions & Services | OnlyiGaming</title>
```
Structure: Brand + 'review' + year + category descriptor

**Category Pages:**
```html
<title>Best [Category] Companies 2025 | Compare & Review | OnlyiGaming</title>
```

**Homepage:**
```html
<title>iGaming Directory | 1500+ B2B Companies, Reviews & Comparisons</title>
```

**News Articles:**
```html
<title>[Headline - max 45 chars] | iGaming News | OnlyiGaming</title>
```

**Podcast Episodes:**
```html
<title>[Episode Title] | OnlyiGaming Podcast Ep. [X]</title>
```

#### Meta Description Templates

**Character limit:** 150-160 characters

**Company Pages:**
```html
<meta name="description" content="Read verified reviews of [Company Name]. Compare features, pricing, and services. [Main Service] solutions for iGaming operators. [Rating] from [X] reviews.">
```
Structure: Brand + 'review' + rating + compare + service description. Include emoji for visual appeal.

**Category Pages:**
```html
<meta name="description" content="Compare top [Category] providers. Read reviews, compare features, and find the perfect [service] for your iGaming business. Updated [Month] 2025.">
```

**News Articles:**
```html
<meta name="description" content="[First 130 characters of article lead]. Breaking iGaming news from OnlyiGaming.">
```

**Podcast Episodes:**
```html
<meta name="description" content="[Guest Name] discusses [main topic]. Expert insights on [category]. Listen to the full [XX min] episode.">
```

#### H1-H6 Heading Structure

**Example structure for a company page:**
```html
<h1>SOFTSWISS - Casino Platform & Game Aggregator</h1>
  <h2>Company Overview</h2>
  <h2>Products & Services</h2>
    <h3>Casino Platform</h3>
    <h3>Game Aggregator</h3>
    <h3>Sportsbook</h3>
  <h2>Pricing & Packages</h2>
  <h2>Customer Reviews</h2>
    <h3>Pros and Cons</h3>
  <h2>Integration & Technical Specs</h2>
  <h2>Latest News</h2>
```

**Key Rules:**
- **H1:** One per page. Company/brand name + main service descriptor
- **H2:** Major page sections. Include target keywords naturally
- **H3:** Sub-sections within H2 blocks
- Never skip levels (don't go from H2 to H4)
- Don't use headings for styling — only for semantic structure

---

### 1.2 Schema Markup Implementation

#### Organization Schema (Company Pages)

Add this JSON-LD to every company profile page:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SOFTSWISS",
  "url": "https://onlyigaming.com/companies/softswiss",
  "logo": "https://onlyigaming.com/logos/softswiss.png",
  "description": "Global tech expert providing iGaming software solutions",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Gzira",
    "addressCountry": "MT"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "47",
    "bestRating": "5",
    "worstRating": "1"
  },
  "areaServed": "Worldwide",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "iGaming Solutions",
    "itemListElement": [
      {
        "@type": "Service",
        "name": "Casino Platform"
      },
      {
        "@type": "Service",
        "name": "Game Aggregator"
      },
      {
        "@type": "Service",
        "name": "Sportsbook"
      }
    ]
  }
}
```

#### Review Schema

Add for each individual review on a company page:

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Organization",
    "name": "SOFTSWISS"
  },
  "author": {
    "@type": "Person",
    "name": "John Smith"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "datePublished": "2025-01-15",
  "reviewBody": "Excellent platform with great support. Integration was smooth and their team was very responsive throughout the process."
}
```

#### BreadcrumbList Schema

Add to all pages with breadcrumb navigation:

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
      "name": "Casino Platform Providers",
      "item": "https://onlyigaming.com/categories/casino-platform-providers"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "SOFTSWISS"
    }
  ]
}
```

#### JobPosting Schema (Career Section)

Critical for Google Jobs integration. Expected 50-100% traffic increase to career section.

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior Backend Developer",
  "description": "We are looking for an experienced backend developer...",
  "datePosted": "2025-01-10",
  "validThrough": "2025-03-10",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "SOFTSWISS",
    "sameAs": "https://onlyigaming.com/companies/softswiss",
    "logo": "https://onlyigaming.com/logos/softswiss.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Gzira",
      "addressCountry": "MT"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "EUR",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 60000,
      "maxValue": 80000,
      "unitText": "YEAR"
    }
  },
  "jobLocationType": "TELECOMMUTE"
}
```

#### FAQPage Schema (Category Pages)

Add to category pages with FAQ sections. Creates expandable FAQ dropdowns in SERP:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a casino platform provider?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A casino platform provider supplies the core software infrastructure that powers online casinos, including player management, game integration, payment processing, and back-office administration tools."
      }
    },
    {
      "@type": "Question",
      "name": "How much does a white-label casino solution cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "White-label casino solutions typically range from €30,000 to €150,000 for setup, plus monthly fees of €5,000-€20,000 depending on features, support level, and revenue share arrangements."
      }
    }
  ]
}
```

#### NewsArticle Schema

Required for Google News inclusion and news carousels:

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "SOFTSWISS Launches New Game Aggregator Features",
  "image": "https://onlyigaming.com/news/images/softswiss-update.jpg",
  "datePublished": "2025-01-15T08:00:00+00:00",
  "dateModified": "2025-01-15T10:30:00+00:00",
  "author": {
    "@type": "Person",
    "name": "Sarah Johnson",
    "url": "https://onlyigaming.com/authors/sarah-johnson"
  },
  "publisher": {
    "@type": "Organization",
    "name": "OnlyiGaming",
    "logo": {
      "@type": "ImageObject",
      "url": "https://onlyigaming.com/logo.png"
    }
  },
  "description": "SOFTSWISS announces major updates to their game aggregator platform, including new provider integrations and improved analytics.",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://onlyigaming.com/news/softswiss-game-aggregator-update"
  }
}
```

#### PodcastEpisode Schema

For podcast episode pages (even though noindex, helps with podcast directories):

```json
{
  "@context": "https://schema.org",
  "@type": "PodcastEpisode",
  "name": "Leadership Lessons with Pontus Lindwall",
  "description": "Betsson CEO Pontus Lindwall shares 30 years of gaming industry insights...",
  "datePublished": "2025-01-10",
  "duration": "PT58M30S",
  "url": "https://onlyigaming.com/podcasts/pontus-lindwall-leadership",
  "associatedMedia": {
    "@type": "AudioObject",
    "contentUrl": "https://audio.onlyigaming.com/ep-42.mp3"
  },
  "partOfSeries": {
    "@type": "PodcastSeries",
    "name": "OnlyiGaming Podcast",
    "url": "https://onlyigaming.com/podcasts/"
  },
  "actor": [
    {
      "@type": "Person",
      "name": "Pontus Lindwall",
      "jobTitle": "CEO",
      "worksFor": {
        "@type": "Organization",
        "name": "Betsson AB"
      }
    }
  ]
}
```

---

### 1.3 Internal Linking Structure

Internal linking distributes link equity, helps Google crawl, and guides users to related content.

**On Company Pages:**
```html
<section class="related-companies">
  <h2>Similar Casino Platform Providers</h2>
  <!-- Link to 5-7 related companies in same category -->
  <a href="/companies/aspire-global">Aspire Global</a>
  <a href="/companies/softgamings">SoftGamings</a>
  ...
</section>

<section class="in-category">
  <h2>More in Casino Platforms</h2>
  <a href="/categories/casino-platform-providers">View all 45 providers →</a>
</section>

<section class="latest-news">
  <h2>Latest SOFTSWISS News</h2>
  <!-- Auto-populated from articles tagged with this company -->
</section>
```

**On Category Pages:**
```html
<section class="top-companies">
  <h2>Top Casino Platform Providers</h2>
  <!-- Link to top 10 companies with brief description snippet -->
</section>

<section class="related-categories">
  <h2>Related Categories</h2>
  <a href="/categories/white-label-solutions">White Label Solutions</a>
  <a href="/categories/game-aggregators">Game Aggregators</a>
</section>

<section class="category-news">
  <h2>Latest News in Casino Platforms</h2>
  <!-- Articles tagged with this category -->
</section>
```

**Anchor Text Guidelines:**
- Use descriptive, keyword-rich anchor text
- Avoid generic text like 'click here' or 'read more'
- Vary anchor text naturally — don't over-optimize
- Example: 'Compare SOFTSWISS alternatives' not 'click here for alternatives'

---

## Part 2: FAQ Content Strategy for Categories

FAQ sections on category pages capture long-tail search queries, earn FAQPage rich snippets, and position OnlyiGaming as the authoritative knowledge source.

### 2.1 Why FAQs Are Critical

- **Long-tail keyword capture:** Capture 'what is', 'how to', 'best for' queries
- **Rich snippet opportunity:** FAQPage schema creates expandable answers directly in Google SERP
- **Voice search optimization:** Question-answer format aligns with voice search patterns
- **User engagement:** Reduces bounce rate by answering questions on-page
- **Content depth signal:** Demonstrates comprehensive topic coverage to Google

### 2.2 FAQ Structure Per Category

Each of the 81 directory categories should have 8-15 FAQs covering these themes:

| Theme | Question Pattern | Example |
|-------|------------------|---------|
| Definition | What is [X]? What does a [X] do? | What is a casino platform provider? |
| Selection | How do I choose a [X]? What features should I look for? | How do I choose a payment gateway? |
| Pricing | How much does [X] cost? What pricing models exist? | How much does KYC verification cost? |
| Comparison | What's the difference between [A] and [B]? | What's the difference between white-label and turnkey? |
| Integration | How long does integration take? What are requirements? | How long does game aggregator integration take? |
| Regulations | Is [X] required by [jurisdiction]? What compliance? | What AML requirements apply to Malta operators? |
| Best Practices | What are best practices? Common mistakes to avoid? | What are common RG implementation mistakes? |
| Trends | What are current trends? Future predictions? | What are 2025 trends in live casino? |

### 2.3 FAQ Examples by Directory Group

#### iGaming Platforms (DIR-016 to DIR-028)

- What is a casino platform provider and why do operators need one?
- How do white-label casino solutions differ from turnkey solutions?
- What certifications should a casino platform have (MGA, UKGC, etc.)?
- How much do white-label casino solutions typically cost?
- What is a game aggregator and how does it differ from direct integration?
- What are the licensing requirements for launching a casino platform?
- How long does it take to launch a white-label casino?
- What payment providers are typically integrated with casino platforms?

#### Payments & Financial (DIR-058 to DIR-065)

- What payment methods are essential for iGaming operators in Europe?
- How does crypto payment processing work for online casinos?
- What is the difference between a payment gateway and payment processor?
- Which jurisdictions require specific payment compliance (e.g., Trustly in Sweden)?
- What are typical payment processing fees for iGaming transactions?
- How do chargeback rates affect payment processing for gambling sites?
- What is a high-risk merchant account and why do casinos need one?

#### Compliance & Security (DIR-008 to DIR-015)

- What AML (Anti-Money Laundering) requirements apply to iGaming operators?
- How does KYC verification work for online gambling?
- What is RNG certification and why does it matter for game providers?
- What responsible gambling tools are required by UKGC? By MGA?
- How often do gaming licenses require compliance audits?
- What is the difference between game testing and game certification?

### 2.4 FAQ Answer Guidelines

**Length:** 50-300 words per answer. Detailed enough to be helpful, concise enough to scan.

**Structure:** Lead with direct answer, then provide context/details. Front-load the key information.

**Links:** Include internal links to relevant company profiles, comparison pages, or related categories.

**Updates:** Review and update FAQs quarterly. Add new questions based on Search Console query data.

---

## Part 3: News Section SEO Strategy

The News section drives recurring traffic, builds topical authority, and attracts backlinks. News content requires different optimization than evergreen directory content.

### 3.1 News Article SEO Checklist

**Before Publishing:**

1. **Headline:** Keyword-optimized, 60 characters max, newsworthy angle
2. **Meta description:** Key facts, 155 characters, include company names
3. **Featured image:** High quality, descriptive alt text, 1200x630px for social
4. **NewsArticle schema:** All required properties (see Section 1.2)
5. **Internal links:** Link all company mentions to their profiles
6. **Related articles:** 3-5 links to related news stories
7. **Tags:** News category tag + directory tags + geography tags
8. **Author byline:** Link to author profile page
9. **Open Graph tags:** og:title, og:description, og:image for social sharing

#### Open Graph Implementation

```html
<meta property="og:title" content="SOFTSWISS Launches New Game Aggregator Features">
<meta property="og:description" content="Major updates include 15 new provider integrations and real-time analytics dashboard.">
<meta property="og:image" content="https://onlyigaming.com/news/images/softswiss-update.jpg">
<meta property="og:type" content="article">
<meta property="og:url" content="https://onlyigaming.com/news/softswiss-game-aggregator-update">
<meta property="article:published_time" content="2025-01-15T08:00:00+00:00">
<meta property="article:author" content="https://onlyigaming.com/authors/sarah-johnson">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="SOFTSWISS Launches New Game Aggregator Features">
<meta name="twitter:description" content="Major updates include 15 new provider integrations.">
<meta name="twitter:image" content="https://onlyigaming.com/news/images/softswiss-update.jpg">
```

### 3.2 News-to-Directory Integration

News articles should strengthen directory pages through cross-linking:

- Every company mentioned in article → link to company profile
- Company profiles → 'Latest News' section pulling tagged articles
- Category pages → 'Latest News in [Category]' widget
- Articles tagged with DIR-xxx tags appear on relevant category pages

#### Author Pages for E-E-A-T

Create author profile pages with Person schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Sarah Johnson",
  "url": "https://onlyigaming.com/authors/sarah-johnson",
  "jobTitle": "Senior iGaming Analyst",
  "description": "Sarah covers regulatory news and M&A activity in the iGaming industry.",
  "sameAs": [
    "https://linkedin.com/in/sarahjohnson",
    "https://twitter.com/sarahjohnson"
  ]
}
```

### 3.3 News Sitemap

Create a separate news sitemap for Google News inclusion:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://onlyigaming.com/news/softswiss-update</loc>
    <news:news>
      <news:publication>
        <news:name>OnlyiGaming</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>2025-01-15T08:00:00+00:00</news:publication_date>
      <news:title>SOFTSWISS Launches New Game Aggregator Features</news:title>
    </news:news>
  </url>
</urlset>
```

---

## Part 4: Podcast & Media Content Distribution

**CORE PRINCIPLE:** Podcasts are raw material that feeds our REAL SEO assets (categories, companies, themes). The podcast pages themselves don't need to rank. Individual episode pages are noindex. Content is extracted and distributed to strengthen pages where SEO authority should live.

### 4.1 Why Not Index Episode Pages?

- People rarely search for 'podcast about gambling regulation' — they search for 'gambling regulation'
- Episode pages have thin content and compete poorly against Spotify, Apple, YouTube
- Thin content signals hurt overall site quality in Google's eyes
- Wastes crawler budget on 500+ low-value pages per year
- Dilutes link equity across hundreds of pages instead of concentrating it

### 4.2 Technical Implementation

**Podcast Hub (Indexed):**
```
URL: /podcasts/
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://onlyigaming.com/podcasts/">
```

**Individual Episode Pages (NOT Indexed):**
```
URL: /podcasts/[episode-slug]/
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://onlyigaming.com/podcasts/">
```

**robots.txt:**
```
User-agent: *
Allow: /
Disallow: /podcasts/*/
Allow: /podcasts/$

Sitemap: https://onlyigaming.com/sitemap.xml
```

### 4.3 Content Distribution Targets

Each podcast episode is analyzed, transcribed, and transformed into content for these page types:

| Page Type | SEO Priority | Content Extracted |
|-----------|--------------|-------------------|
| Category Pages | HIGHEST | Long-form articles (1500-3000 words), expert insights, FAQ entries |
| Company Pages | HIGH | Leadership insights, executive quotes, strategic viewpoints, timeline updates |
| Theme Pages | HIGH | Historical context, expert perspectives, timeline events, case studies |
| Comparison Pages | MEDIUM-HIGH | Expert analysis, real-world examples, different perspectives |
| Expert Profiles | MEDIUM | Quotes, philosophy, career insights, featured perspectives |

### 4.4 Example: One Episode → Multiple Assets

**Example:** 'Legends' episode with Jesper Kärrbrink & Pontus Lindwall

**Topics discussed:** Leadership, Regulation, Swedish Gaming History, Company Culture

**Content Distributed To:**

- **Category: Licensing & Regulatory** → Article 'Why European Gambling Regulation Is Failing' (2,800 words)
- **Category: Leadership & Management** → Article 'Leadership Lessons from 30-Year Gaming CEOs' (1,500 words)
- **Company: Betsson AB** → Leadership Insights section, executive quotes
- **Company: Enlabs Group** → Leadership Insights section, work-life perspectives
- **Theme: Swedish Gaming History** → New section 'The Monopoly Wars (2000s)'
- **Theme: Regulatory Evolution** → New section 'From Monopoly to Licensing'
- **Comparison: State Monopolies vs Private Operators** → Case study addition
- **Expert Profile: Pontus Lindwall** → New quotes, philosophy updates
- **Expert Profile: Jesper Kärrbrink** → New quotes, career insights
- **FAQ additions:** 3-5 new questions added to relevant category pages

### 4.5 Content Extraction Workflow

1. **Record & Publish:** Episode goes to hosting platform
2. **Transcribe:** AI transcription (Whisper or similar)
3. **Analyze:** AI extracts key topics, quotes, company mentions, themes
4. **Create:** AI drafts articles (80% automated), human review (30-45 min per article)
5. **Distribute:** Week 1: category articles | Week 2: company updates | Week 3: theme pages | Week 4: community
6. **Archive:** Create noindex episode page with transcript and attribution links

### 4.6 Expected Output Per Episode

- 1-2 long-form articles (1,500-2,800 words each)
- 3-5 company page updates (300-500 words each)
- 1-2 theme page sections (500-1,000 words each)
- 5-10 FAQ entries for category pages
- 2 expert profile updates
- 10-15 social media snippets

---

## Part 5: Content Strategy & Keyword Targeting

### 5.1 Primary Keywords (High Volume)

| Keyword | Monthly Searches | Target Page |
|---------|------------------|-------------|
| igaming companies | 1,300 | Homepage |
| casino software providers | 880 | Category hub |
| sports betting platforms | 720 | Category hub |
| igaming solutions | 590 | Homepage |
| online gambling software | 480 | Category hub |
| white label casino solution | 390 | Category hub |
| casino game developers | 520 | Category hub |
| casino payment providers | 450 | Category hub |

### 5.2 Long-tail Keywords (High Intent)

- [company] alternatives (e.g., 'softswiss alternatives')
- [company] pricing (e.g., 'evolution gaming pricing')
- [company] vs [competitor] (e.g., 'softswiss vs aspire global')
- best [category] for [use case] (e.g., 'best casino platform for crypto')
- how to choose [category] (e.g., 'how to choose payment provider')

### 5.3 Content Types & Templates

#### Category Hub Pages (3,000+ words)

```markdown
# Ultimate Guide to Casino Platform Providers 2025

## Table of Contents
1. What is a Casino Platform?
2. Key Features to Look For
3. Top 10 Providers Compared
4. Pricing Models Explained
5. Integration Requirements
6. Regulatory Considerations
7. How to Choose the Right Provider
8. FAQ (8-15 questions)

## Content Requirements:
- Comprehensive overview (500+ words)
- Comparison tables with features
- Pricing information where available
- Links to all companies in category
- FAQ section with schema markup
- Related categories links
- Latest news widget
```

#### Comparison Pages

```markdown
# SOFTSWISS vs Aspire Global: Detailed Comparison 2025

## Quick Comparison Table
| Feature        | SOFTSWISS    | Aspire Global |
|----------------|--------------|---------------|
| Casino         | ✓            | ✓             |
| Sportsbook     | ✓            | ✓             |
| Crypto Support | ✓            | Limited       |
| Price Range    | $$$          | $$$$          |

## Sections:
- Platform Features (detailed comparison)
- Game Portfolio
- Payment Options
- Licensing & Compliance
- Customer Support
- Pricing Structure
- User Reviews Summary
- Verdict: Which is Right for You?
```

---

## Part 6: Technical SEO

### 6.1 URL Structure

**Current (Keep):**
```
/companies/[company-name]
/categories/[category-name]
/news/[article-slug]
/jobs/[job-id]
```

**Add New:**
```
/compare/[company-1]-vs-[company-2]
/themes/[theme-name]
/recommendations/[topic]
/experts/[expert-name]
/podcasts/ (hub only)
```

### 6.2 Core Web Vitals Targets

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

#### Performance Implementation

```html
<!-- Lazy Loading for Images -->
<img src="company-logo.jpg" loading="lazy" alt="SOFTSWISS Logo">

<!-- Preload Critical Resources -->
<link rel="preload" as="style" href="critical.css">
<link rel="preload" as="font" href="fonts/main.woff2" crossorigin>

<!-- Responsive Images -->
<picture>
  <source media="(max-width: 768px)" srcset="logo-mobile.jpg">
  <source media="(min-width: 769px)" srcset="logo-desktop.jpg">
  <img src="logo-default.jpg" alt="Company Logo">
</picture>
```

### 6.3 Sitemap Strategy

```
Main sitemap index: /sitemap.xml
├── /sitemap-companies.xml (all company profiles)
├── /sitemap-categories.xml (all category pages)
├── /sitemap-news.xml (news articles - Google News format)
├── /sitemap-jobs.xml (job listings)
├── /sitemap-pages.xml (static pages)
└── NO podcast episode sitemap (noindex pages excluded)
```

---

## Part 7: Measurement & KPIs

### 7.1 Primary Metrics

- Organic traffic growth (month-over-month)
- Keyword rankings (Top 3, Top 10, Top 100)
- Domain Rating (Ahrefs) / Domain Authority (Moz)
- Organic conversion rate
- Pages per session

### 7.2 Tracking Setup

```javascript
// Google Analytics 4 Events
gtag('event', 'company_profile_view', {
  'company_name': 'SOFTSWISS',
  'category': 'Casino Platform',
  'user_type': 'New Visitor'
});

gtag('event', 'comparison_completed', {
  'companies': ['Company A', 'Company B'],
  'category': 'Payment Solutions'
});

gtag('event', 'review_submitted', {
  'company': 'Company Name',
  'rating': 5,
  'verified': true
});

gtag('event', 'faq_expanded', {
  'question': 'What is a casino platform?',
  'category': 'Casino Platforms'
});
```

### 7.3 Implementation Priority Matrix

| Priority | Items |
|----------|-------|
| **HIGH VALUE, LOW EFFORT (Week 1-2)** | Title/Meta templates, 4 schemas (Organization, Review, Job, Breadcrumb), H1-H6 structure, Internal linking |
| **HIGH VALUE, MEDIUM EFFORT (Week 2-4)** | FAQPage schema, Category FAQs (top 20), News hub pages, Author profiles, NewsArticle schema |
| **HIGH VALUE, HIGH EFFORT (Month 2+)** | Podcast content extraction, Theme pages, Comparison pages, Full FAQ rollout (81 categories), Link building |
| **MEDIUM VALUE, LOW EFFORT** | Breadcrumb navigation, Related company widgets, Social meta tags, News sitemap |

---

*— End of Document —*
