# OnlyiGaming SEO Content Strategy - Final Decisions

This document captures every decision made during the strategy conversation.
It is the single source of truth for producing guide articles.

---

## 1. Content Model: Pillar + Satellites Per Category

Each OnlyiGaming directory category (from master_categories.md) can have a content cluster:

**Pillar article** (1 per category):
- "Best [Category Name] in 2026: Complete Comparison"
- Compares all relevant vendors ACROSS evaluation dimensions
- 5,000-7,000 words
- Lives at /guides/best-[category-slug]-2026

**Satellite articles** (5-15 per category, based on demand):
- Each targets a specific buyer need or decision angle
- 2,500-5,500 words depending on satellite class (see [skill/references/satellite-prompt-templates.md](skill/references/satellite-prompt-templates.md) for per-class targets; the `best-for` class also uses niche profiles for crypto-operators, emerging-markets, operator-size, regulated-markets, generic-use-case)
- Lives at /guides/[category-slug]-[angle]

**Satellite types per category:**

| # | Satellite Type | Template | Generate How | Produce When |
|---|---|---|---|---|
| 1 | **Buyer's guide** | "How to Choose a [Category]" | Universal template | ALWAYS - first satellite produced |
| 2 | **Dimension-specific** | "Best [Category] for [Dimension]" | Pull from category-rubrics.md | ALWAYS - 2-4 per category |
| 3 | **Audience-based** | "Best [Category] for [Audience Scenario]" | Derive from master_categories.md description - audiences are category-specific, not a universal list | ALWAYS - 2-4 per category |
| 4 | **Head-to-head** | "[Vendor A] vs [Vendor B]" | Biggest companies in each category from directory data | ALWAYS - 1-3 per category |
| 5 | **Newcomers** | "[Category] to Watch: Rising Stars" | Directory data - newer/smaller companies | ALWAYS - showcase beyond dominant players |
| 6 | **Challenges** | "Common Challenges in [Category] and Who Solves Them" | Derive from category description + rubric dimensions | ALWAYS - reverse of pillar (problem finds company) |
| 7 | **Glossary** | "[Category] Terminology Explained" | Category-specific jargon from rubrics | IF category has specialized terms |
| 8 | **Market-specific** | "Best [Category] for [Market/Region]" | Only where geography changes the answer | IF category is market-dependent |
| 9 | **Pricing** | "[Category] Pricing Comparison" | Only if public pricing data exists for most vendors | RARELY - pricing is seldom public |
| 10 | **Trends** | "[Category] Trends to Watch" | Gemini search + industry reports - must pass thin-content check | IF enough substance found |

**Dropped types (and why):**
- Migration playbook - too hard to write generically for a whole category
- Checklist / RFP template - manual work, hard to automate
- Cost breakdown - same problem as pricing, data not public
- Case study / use case - hallucination risk too high without real operator interviews

### Audience-Based Satellites: Category-Specific, Not Universal

Audiences are derived from reading the category description in master_categories.md and understanding who actually buys this product. The audience list is DIFFERENT for every category.

**Example: casino-platforms audiences:**
- Operators on grey/unregulated markets
- Operators on emerging markets
- Operators where speed to market is the top priority
- Operators who want to differentiate through UX/gamification
- Operators planning heavy CRM and gamification integration
- Crypto-first operators
- Multi-market regulated operators
- Operators without a tech team

**Example: payment-processing audiences:**
- Operators needing local payment methods (split by region: LatAm, Africa, Asia, Nordics)
- Operators in regulated markets (compliance-heavy payment requirements)
- Operators in unregulated markets (flexibility over compliance)
- Operators wanting "flexible" multi-method payment solutions
- High-volume enterprise operators optimizing fees
- Crypto-first operators

**Example: ui-ux-and-graphic-design audiences:**
- Operators launching new brands from scratch
- Operators redesigning existing products
- Operators needing compliance-aware design (regulated markets)
- Sportsbook operators (different UX patterns than casino)
- Mobile-first operators targeting emerging markets

### Challenges Satellite: Reverse of the Pillar

The Challenges article is structurally different from all other satellite types:

- **Pillar says:** "Here are 12 companies. Each one does X."
- **Challenges says:** "Here are 7 problems operators face. For each problem, here is which company solves it best."

Same companies, completely different angle. The problem finds the company, not the company showcases the product. A buyer searching "casino platform integration challenges" has different intent than "best casino platforms."

**Challenges article structure:**
1. Intro: the most common challenges in this category
2. For each challenge (5-8):
   - What the challenge is and why it matters
   - Which companies on OnlyiGaming address it best
   - What to look for when evaluating solutions for this specific problem
3. Summary: mapping challenges to recommended vendors
4. Link back to pillar for full company comparisons

### Trends Satellite: Thin-Content Gate

Trends articles are only produced if there is enough substance. Before writing:
1. Gemini searches for recent industry reports, conference themes (ICE, SiGMA, SBC), and trade publication coverage
2. If fewer than 5 distinct, verifiable trends are found, the article is flagged as "thin content" and skipped
3. A separate quality check confirms each trend is substantive (not just hype) before inclusion

The buyer's guide satellite is NOT an FAQ. It's a standalone decision-support article:
- Questions to ask yourself before looking (budget, markets, team, tech capability)
- Questions to ask in demos (back-office UX, contract terms, exit clauses, support SLA)
- A scoring/rating framework for evaluating vendors
- Red flags to watch for during sales process

This replaces the "FAQ" and "How to choose" sections that were in earlier drafts.
The category page already has its own FAQ. The guide articles don't duplicate it.

**Every category gets the full satellite treatment.** Content is AI-generated - there's no meaningful marginal cost to producing satellites for all categories. The priority tiers in Section 8 determine the ORDER of production, not the depth. Even a niche category like `bingo-platforms` gets its pillar + satellites. The only categories that don't get guides are the ones where it genuinely doesn't make sense (operator categories are B2C, not B2B review targets).

---

## 2. Pillar Article Structure

The core article compares vendors ACROSS dimensions, not in isolation.

```
1. INTRO WITH SCENARIO ROUTING (200 words)
   - Why this choice matters
   - OnlyiGaming's angle (independent, directory-backed)
   - How we put this together (2-3 sentences folded in, NOT its own H2 section)
   - SCENARIO ROUTER: "Migrating from legacy? See section X. Launching fast? See Y. Crypto-first? See Z."
     (Routes different buyer personas to relevant sections immediately)

1b. QUICK VERDICT CAPSULE (40-60 words, immediately after intro)
   - Link-free, self-contained answer paragraph
   - Designed for featured snippet and AI Overview extraction
   - Example: "For most operators in 2026, EveryMatrix offers the strongest modular
     casino platform. SOFTSWISS leads for crypto. Startups should evaluate NuxGame
     or Soft2Bet for fast turnkey launch."

2. QUICK REFERENCE TABLE (rich, category-specific columns)
   - Comes early - readers scan this first to build a shortlist
   - Columns vary by category (see Section 5 below)
   - NO founding year or HQ columns - focus on product attributes

3. CROSS-DIMENSION COMPARISON SECTIONS (the core value - ~2,500 words)
   - 6-8 sections, each covering ONE evaluation dimension
   - Each section compares ALL relevant vendors on that topic
   - Picks winners, names trade-offs, gives specific recommendations
   - This is what no competitor article does
   - Dimensions are category-specific (see Section 5)

4. VENDOR PROFILES (consistent structure for reference - ~1,500 words)
   - Each vendor gets a short, structured profile (100-150 words)
   - HEADLINE = verdict/USP finding, not just company name
     e.g. "EveryMatrix: Most Flexible, But You Need the Team"
   - CONSISTENT rubrics per vendor (see Section 4) - enables comparison
   - Bullet points for scannable reference data
   - Links to OnlyiGaming company profile

5. RUNNERS-UP (200-300 words)
   - "Other [category] providers worth exploring"
   - 10-15 companies with one-line description + directory link each
   - Captures long-tail SEO for company names
   - Acknowledges companies in the category not featured in main review
   - Reduces risk of upsetting listed companies who didn't make the cut

6. COMMON QUESTIONS WHEN CHOOSING A [CATEGORY] (300 words)
   - NOT called "FAQ" (category pages already have FAQs)
   - 4-6 questions specific to buying decisions in this category
   - Links to the buyer's guide satellite for deeper coverage
```

---

## 3. What Goes in Vendor Profiles (Product-First, Not Bio-First)


**NEVER open with:** "Founded in 2008 and headquartered in Malta..."
**ALWAYS open with:** What the product does and why it matters.

The vendor profile section uses CONSISTENT structure with bullet points for scannability.
Readers need the same information in the same order to compare across vendors.

**Headline:** Verdict or USP finding
  e.g. "SOFTSWISS: The Only Serious Option for Crypto"
  e.g. "NuxGame: Cheapest Path to Market, But You'll Outgrow It"

**Profile content (bullet points):**
- What it does (2-3 sentences - product/service description, not company history)
- Standout capability (the ONE thing that differentiates this from others on the list)
- Proof points (notable clients, growth stats, awards, recent wins - this is where
  company facts like scale, years in market etc. go as EVIDENCE, not as intro)
- Trade-off (what you give up by choosing this - every vendor gets one)
- Best for / Not for (one line each)

**The rubric labels change by category type.** See Section 5.

**Why bullet points, not prose, for profiles:**
- The comparison sections (Section 3 in article) carry the editorial depth in prose
- The vendor profiles serve as a scannable REFERENCE INDEX
- Readers compare across profiles - consistent bullets make this possible
- Prose in profiles was what made the earlier drafts feel like 12 isolated brochures

---

## 4. Company Bio Data - Where It Goes

| Data Point | Goes in profile? | Goes in comparison table? |
|---|---|---|
| What the product does | YES - opening line | NO |
| Key differentiator | YES - standout capability | YES - "Key Strength" column |
| Notable clients / recent wins | YES - proof points | NO (too detailed for table) |
| Growth stats / scale | YES - proof points | MAYBE (if relevant column exists) |
| Trade-offs / limitations | YES - trade-off line | NO |
| Best for / Not for | YES | YES - "Best For" column |
| Founding year | NO | NO |
| Headquarters / country | NO | NO |
| Number of games | Only if relevant to category | YES - if game-related category |
| Licensing jurisdictions | Only in compliance comparison section | YES |
| Pricing model | Only in pricing comparison section | YES |
| Deployment models | Only if relevant | YES |

**Rule: The profile adds judgment and context to facts, not just restates them.**
The table says "Revenue share." The profile says "Revenue share - which sounds aligned
until you're processing $5M monthly." Same data point, but the profile adds opinion.
Facts CAN appear in both places. The profile is NOT just a prose version of the table row.

---

## 5. Category-Specific Rubrics and Table Columns

Every single category needs its own evaluation dimensions and table columns.
There is no universal template. "Key Features / Strengths / Considerations" is wrong for most categories.

**Full rubrics for all 83 categories are in: `references/category-rubrics.md`**

That file defines, for each category:
- 5-8 comparison dimensions (used for the cross-vendor sections in the pillar article)
- Comparison table columns
- Vendor profile rubric labels
- Suggested satellite angles

Below are examples showing how different category TYPES need different approaches.
The full file covers every individual category.

### Example: Casino Platforms (casino-platforms)

**Comparison dimensions for cross-vendor sections:**
- Game/content aggregation (if applicable)
- Integration architecture (modular vs monolithic, API quality)
- Regulatory coverage (which licenses, which markets)
- Payment/crypto flexibility
- Gamification and retention tools
- Pricing and cost structure
- Speed to market (turnkey options, launch timelines)
- Support and onboarding experience
- Integration timeline / time to value (contract to live)
- Uptime and infrastructure (SLA, cloud provider, redundancy)


**Comparison table columns:**
| Provider | Key Strength | Game Count | Licenses | Deployment | Pricing Model | Best For |

**Vendor profile rubric:**
- What it does
- Standout capability
- Proof points
- Trade-off
- Best for / Not for

### Payment Solutions (payment-processing, payment-gateways, e-wallet-solutions)

**Comparison dimensions:**
- Security and fraud prevention
- Regional coverage
- Supported currencies and methods
- Fees and settlement times
- Crypto support
- Integration complexity
- Compliance (PCI DSS, PSD2, local regulations)

**Comparison table columns:**
| Provider | Key Feature | Regions | Currencies | Fees | Settlement | Crypto |

**Vendor profile rubric:**
- What it does
- Coverage and methods
- Proof points
- Fee structure (brief)
- Best for / Not for

### Game Providers / Studios (game-providers, game-developers, live-casino-studios)

**Comparison dimensions:**
- Portfolio size and game types
- RTP range and math models
- Certified markets
- Release frequency
- Mobile optimization
- Branded/exclusive content
- Integration (direct vs aggregator)

**Comparison table columns:**
| Provider | Game Types | Portfolio Size | Certified Markets | Release Pace | Notable Titles |

### Consultancies / Agencies (strategy-consulting, licensing, marketing-agencies, seo-agencies)

**Comparison dimensions:**
- Specialization areas
- Notable clients and case studies
- Team expertise and credentials
- Pricing model (retainer, project, success fee)
- Geographic focus
- Track record / years active

**Comparison table columns:**
| Provider | Specialization | Notable Clients | Pricing Model | Markets | Best For |

**Vendor profile rubric:**
- What they do (service description, not company history)
- Specialization / expertise area
- Notable engagements
- How they charge
- Best for / Not for

### Recruitment Services

**Comparison dimensions:**
- Role specializations (C-suite, tech, compliance, trading)
- Geographic coverage
- Placement model (retained, contingent, RPO)
- Fee structure
- Speed and quality metrics
- Industry depth vs generalist

**Comparison table columns:**
| Provider | Specialization | Markets | Model | Fee Range | Best For |

### Data Providers (sports-data-providers, data-and-analytics)

**Comparison dimensions:**
- Data coverage (sports, leagues, events)
- Latency / real-time capability
- Official partnerships vs unofficial
- API quality and documentation
- Integrity monitoring
- Pricing structure

**Comparison table columns:**
| Provider | Coverage | Latency | Official Partnerships | API | Best For |

---

## 6. Editorial Voice Rules

Two-pass writing process. First pass: get facts and structure right. Second pass: apply voice.


### Voice Target
Write like a senior iGaming professional. Not a content marketer, not a brochure.
Someone who's been through vendor selection multiple times and knows the gap between
sales pitch and product reality.

### Key Rules
1. Product/service first, not company bio
2. Comparison sections in prose with opinions. Vendor profiles in structured bullets.
3. Banned words: seamlessly, robust, genuinely, unmatched, comprehensive suite,
   cutting-edge, leveraging, holistic, innovative, empowering, ecosystem,
   at its core, it's worth noting, the landscape, in the ever-evolving
4. Every strength gets a trade-off named
5. Sharp judgments - say things vendor-sponsored articles wouldn't
6. Use contractions. Vary sentence length. Short sentences are fine.
7. No em dashes or en dashes - regular hyphens only
8. Comparison sections vary in structure. Vendor profiles stay consistent.
9. At least one specific, recent, researched fact per vendor (2026 deal, product update, client win)
10. Read-aloud test: 3 random paragraphs should sound like a person, not a brochure

### Quality Checklist (per article)
- [ ] Product-first - no vendor section opens with founding year or HQ
- [ ] Comparison table has category-specific columns (no founding year, no HQ)
- [ ] Cross-dimension comparison sections compare vendors WITHIN each topic
- [ ] Every vendor has a verdict headline, not just a company name
- [ ] Runners-up section acknowledges companies not in the main review
- [ ] At least 3 genuinely opinionated statements per article
- [ ] No repeated buzzwords from banned list
- [ ] Links to OnlyiGaming directory for every company mentioned
- [ ] "Common questions" section is NOT called FAQ
- [ ] Links to relevant satellite articles where they exist

Full editorial voice details: see references/editorial-voice.md

---

## 7. Site Architecture for Guides

### Where guides live
URL: /guides/[article-slug]
No main navigation entry.
No landing page (yet - build when 15+ guides exist).

### Discovery paths

**Category pages** (e.g. /companies?category=casino-platforms):
- 6-9 guide cards appear AFTER company listings, BEFORE or REPLACING FAQ
- Cards are same size as company cards (3 rows of 3)
- Both pillar and relevant satellite articles appear as cards
- Each card shows: **headline** (bold) + **subheadline** (short description, 15-25 words)
- Subheadline tells the reader what they'll get, not just restates the headline
- Links to /guides/article-slug

**Card content comes from article YAML frontmatter:**
```
card_headline: "Best Casino Platforms in 2026"
card_subheadline: "Compare 12 leading casino platforms across game aggregation, regulatory coverage, pricing, and integration. Independent analysis."
```

**Subheadline rules:**
- 15-25 words
- Include category keyword naturally
- Tell the reader what value they'll get
- Different tone per article type:
  - Pillar: "Compare X providers across [dimensions]. Independent analysis."
  - Dimension satellite: "Which platforms have the strongest [dimension]?"
  - Buyer's guide: "Questions to ask, scoring framework, and red flags."
  - Newcomers: "Newer providers worth evaluating. Updated quarterly."

**Company pages** (ALL companies in a category with guides):
- Simple link list at very bottom of page
- Header: "Guides for this category:" (NOT "Guides featuring [Company]")
- Shows headline links only (no subheadlines - keep it lightweight)
- Shows ALL guides for ALL of the company's categories (pillar + satellites)
- Every company tagged with casino-platforms sees the same casino platform guides
- Framed as category-level content, not company-level
- A company in 9 categories sees guides for all 9 categories
- Implementation: company has categories, categories have guides, show all
- This means 50+ company pages link to each guide, not just 12 = much stronger SEO

**Footer** (later, when landing page exists):
- Single "Guides" text link in footer alongside About, Contact, FAQ etc
- Links to /guides/ landing page

**Within guides:**
- Pillar links to all its satellites
- Satellites link back to pillar
- All guides link to relevant category pages
- All guides link to mentioned company profiles

### SEO Flow
```
Category page cards -> individual guide (direct, contextual links)
Company page lists -> individual guide (ALL companies in category, massive link equity)
Guide -> category page (strengthens directory)
Guide -> company profiles (strengthens profiles)
Pillar <-> satellites (cluster authority)
Google -> guide (organic discovery)
Footer -> /guides/ landing -> all guides (sitewide equity, LATER)
```

---

## 8. Category Production Order

All categories get the full treatment (pillar + satellites). Tiers determine ORDER of production, not depth.


### Tier 1 - Start Here (highest search volume, most competitor articles to outrank)
1. `casino-platforms` - Best Casino Platforms in 2026
2. `crm-platforms` - Best iGaming CRM Platforms in 2026
3. `payment-processing` - Best iGaming Payment Processing in 2026
4. `game-aggregators` - Best Game Aggregators in 2026
5. `sportsbook-platform` - Best Sportsbook Platforms in 2026

### Tier 2 - Next (high intent, growing search interest)
6. `affiliate-tracking` - Best Affiliate Tracking Software in 2026
7. `white-label-solutions` - Best White Label Solutions in 2026
8. `turnkey-solutions` - Best Turnkey Solutions in 2026
9. `kyc-services` - Best KYC Services for iGaming in 2026
10. `live-casino-studios` - Best Live Casino Studios in 2026

### Tier 3 - Expand (medium demand, builds topical authority)
11. `game-providers` - Best Game Providers in 2026
12. `responsible-gaming` - Best Responsible Gaming Tools in 2026
13. `gamification` - Best Gamification Platforms in 2026
14. `payment-gateways` - Best Payment Gateways for iGaming in 2026
15. `fraud-prevention` - Best Fraud Prevention for iGaming in 2026
16. `seo-agencies` - Best iGaming SEO Agencies in 2026
17. `hosting-services` - Best iGaming Hosting Services in 2026
18. `sports-data-providers` - Best Sports Data Providers in 2026
19. `cryptocurrency-payments` - Best Crypto Payment Solutions for iGaming
20. `marketing-agencies` - Best iGaming Marketing Agencies in 2026

### Categories NOT getting guides (B2C operator types only)
- Operator categories (casino, sportsbook, poker, bingo, racing, esports, lottery, crypto, multi-product)
- These are B2C operators, not B2B products to review
- Every B2B supplier/service category gets the full pillar + satellite treatment

---

## 9. Keywords: How to Validate (Not Guess)

Current approach has been guessing keywords based on competitor titles and patterns.
This should be improved.

### Minimum keyword validation per article:
1. Google the primary keyword. Check: are there competing articles? What do they look like?
   If the first page is all vendor websites (not comparison articles), it's a content gap = opportunity.
2. Check Google "People Also Ask" for the keyword. These become FAQ/satellite topics.
3. Check Google autocomplete suggestions (type the keyword, see what Google suggests).
4. If available, use Google Search Console to see if OnlyiGaming already gets
   impressions for related terms.

### Ideal (using Ahrefs Lite - $129/month):
- Keyword Explorer for actual search volume data
- Keyword difficulty scores to prioritize winnable terms
- Content gap analysis (keywords competitors rank for, OnlyiGaming doesn't)
- Site Explorer to see which competitor review articles get traffic
- Track guide rankings over time

### Keyword patterns that consistently work for B2B iGaming:
- "best [category name]" + year
- "top [category name] providers"
- "[category] for igaming"
- "[category] comparison"
- "how to choose [category]"
- "[company A] vs [company B]"

---

## 10. Handling Companies Not in the Main Review

### Problem:
OnlyiGaming directory has many companies per category. A guide reviews 10-15.
The rest could feel excluded. Some are paying/listed companies.

### Solutions:

**Runners-up section in every pillar article:**
- "Other [category] providers worth exploring"
- 10-15+ additional companies, each with one-line description + directory link
- Captures long-tail SEO for their company names
- No company in the directory category is completely invisible

**Rising Stars satellite article (per high-value category):**
- "Casino Platforms to Watch: Rising Stars and Newcomers in 2026"
- Features newer/smaller companies that aren't established enough for the main review
- Gives them visibility without diluting the pillar's credibility
- Good outreach opportunity - smaller companies are more likely to share/link

**Company pages show guides for ALL companies in the category (Section 7).**
- Framed as "Guides for this category:" not "Guides featuring you"
- Every company in the category sees the same guide links
- No exclusion issue - it's category-level content, not company-level
- Combined with runners-up section, virtually every listed company gets mentioned somewhere

---

## 11. Production Process Per Article


### Step 1: Category Research
- Identify the category from master_categories.md (exact slug)
- Determine the right rubric type (software, payments, agency, etc.)
- Define 6-8 evaluation dimensions specific to this category
- Define comparison table columns specific to this category
- Search Google for the primary keyword - analyze top 3-5 competitor articles
- Check which companies in this category are listed on OnlyiGaming
- Find market size/growth stats for the intro
- Pull aggregate data from OnlyiGaming directory for original insights
  (e.g. "40% of new platform launches used modular architecture" - uncopyable content)

### Step 2: Keyword Validation
- Google the primary keyword, check competition and content gaps
- Check "People Also Ask" for satellite/question ideas
- Check autocomplete suggestions
- Note 3-5 secondary keywords

### Step 3: Satellite Selection

Generate the full candidate list automatically, then validate with Ahrefs.

**3a. Auto-generate candidates from inputs:**

Read these inputs for the category:
- `master_categories.md` - category description (for audience derivation and challenges)
- `category-rubrics.md` - evaluation dimensions (for dimension-specific satellites)
- OnlyiGaming directory - company listings (for head-to-head pairings and newcomers)

Generate candidates from each satellite type (see Section 1 table):
1. Buyer's guide - 1 article (universal template)
2. Dimension-specific - 2-4 articles (one per top rubric dimension)
3. Audience-based - 2-4 articles (derive audiences from category description - WHO buys this?)
4. Head-to-head - 1-3 articles (pair the biggest companies in the category)
5. Newcomers / Rising stars - 1 article (smaller companies from directory)
6. Challenges - 1 article (common problems the category solves - reverse of pillar)
7. Glossary - 1 article IF category has specialized terminology
8. Market-specific - 1-2 articles IF geography changes the answer for this category
9. Pricing - 1 article ONLY IF public pricing exists for most vendors
10. Trends - 1 article IF Gemini finds 5+ verifiable trends (thin-content gate)

Total candidate pool: 12-20 per category.

**3b. Validate against Ahrefs search demand:**
- Search each candidate title/keyword in Ahrefs Keyword Explorer
- Check volume, keyword difficulty, traffic potential
- Zero volume + no competitor articles = deprioritize (not skip)
- Existing competitor ranking = check if we can beat with better structure

**3c. Check Google for buyer questions:**
- Google the category primary keyword
- Record "People Also Ask" questions - map to satellite types
- Check autocomplete for angle ideas
- Search "[vendor A] vs [vendor B]" to validate head-to-head demand

**3d. Check competitor coverage gaps:**
- Top 3 ranking articles for pillar keyword
- What sub-topics do they cover? What do they miss?
- Gaps they miss = our competitive advantage

**3e. Prioritize and select:**
- Always first: buyer's guide
- Then: challenges article (unique angle nobody else has)
- Then rank by: search volume + competitive gap + relevance to directory data
- Select 5-8 for initial production
- Keep full list for later expansion

**3f. Document:**
- Selected satellites with expected keyword targets
- Deprioritized candidates and reasons
- Revisit quarterly based on traffic data

### Step 4: Company Selection
- Select 10-15 companies for the main review
- Identify 10-15+ additional companies for the runners-up section
- For each main company, research: recent product updates, client wins, 2026 news
- Cross-reference with OnlyiGaming directory listings

### Step 5: Outline (get approval before writing)
Present to user:
- Proposed title, meta description, URL slug
- List of companies for main review (with proposed verdict headlines)
- List of runners-up companies
- Proposed evaluation dimensions (the 6-8 comparison sections)
- Proposed comparison table columns
- Proposed satellite article ideas for this category

### Step 6: First Draft (facts and structure)
- Write the full article following the structure in Section 2
- Focus on getting facts, data, and comparisons right
- Use the category-specific rubrics from Section 5
- Don't worry about voice polish yet

### Step 7: Automated Fact-Check (Gemini with search)
- Run: `cd tools/ && node gemini-factcheck.js [article-folder]`
- Gemini verifies every factual claim against public sources using search grounding
- Claims are categorized: VERIFIED, SOFTENED (overstated), FLAGGED (unverifiable), EDITORIAL (opinion)
- Pricing models only stated if publicly confirmed, otherwise "contact vendor"
- Trade-off/weakness claims explicitly framed as editorial assessment
- Unsourceable absolutes ("X does not support Y") softened to verifiable language
- Output: article-factchecked.md + factcheck-report.md (detailed change log)
- Review the factcheck-report.md before proceeding to voice polish

### Step 8: Editorial Voice Pass (Gemini)
- Run: `cd tools/ && node gemini-polish.js [article-folder]`
- Reads the fact-checked version (article-factchecked.md) if available
- Gemini applies voice rules from references/editorial-voice.md
- Gemini uses search to find specific 2026 facts per vendor (deals, product updates, client wins)
- Gemini specifically searches for recent regulatory licensing updates (new Brazil, UAE, US state licenses)
- CRITICAL: Gemini must NOT remove primary/secondary SEO keywords
- Provide a "protected keywords" list per article that Gemini must preserve verbatim
- Kill banned words, sharpen judgments, add trade-offs
- Read-aloud test on 3 random paragraphs
- Human SME does final 5-minute sanity check on Gemini's 2026 claims (hallucination risk)

### Step 9: SEO Check
- Primary keyword in: title, H1, first paragraph, 2-3 H2s, meta description
- Secondary keywords placed naturally
- Internal links: every company -> OnlyiGaming profile
- Internal links: category page links
- Internal links: satellite cross-links (if satellites exist)
- Meta title under 60 characters
- Meta description 150-160 characters

### Step 10: Output

Three files per article, all starting with meta title, meta description, and slug:

**article.md** - Clean markdown with meta fields at top:
```
Meta Title: Best Casino Platforms in 2026 | OnlyiGaming
Meta Description: Compare 12 casino platforms for 2026...
Slug: best-casino-platforms-2026

---

# Best Casino Platforms in 2026...
```

**article-for-strapi.txt** - HTML source for pasting into Strapi rich text field. Same meta header, then HTML body with:
- Tables: max-width 897px, max 6 columns, horizontal scroll on overflow
- Table headers: purple (#6B2D8B) background, white text
- Provider names in table: linked to OnlyiGaming company pages (purple bold)
- Provider names in H3 profile headlines: linked to company pages
- All company mentions in runners-up: linked to directory pages
- Verdict capsule blockquote: purple left border, light purple background
- H3 profile headings: purple bottom border
- All relative links converted to full https://onlyigaming.com/ URLs
- No inline JavaScript

**article-preview.html** - Browser-viewable preview at 897px max-width to check appearance before pasting into Strapi.

**Table column rules:**
- Maximum 6 columns to fit 897px width
- Always include: Provider (linked), Key Strength, Best For
- Category-specific middle columns (e.g. Games, Licenses, Crypto for casino platforms)
- Never include: Founding year, HQ, Deployment model, Pricing model (these go in profiles, not table)
- If pricing is not publicly confirmed for most vendors, omit the Pricing column entirely

**YAML frontmatter fields** (in the source article.md before conversion):
- card_headline: bold text for guide cards on category/company pages
- card_subheadline: 15-25 word description shown under headline on cards
- last_verified: date of last factual data check (licensing, pricing, company status)
- last_updated: date of last editorial change (rewording, layout, links)
- protected_keywords: list of SEO terms Gemini must not rephrase during voice pass

### Technical implementation notes (Bojan):
- ProductCollection + Review schema markup on all guide pages
- Use itemReviewed per vendor profile for rich result eligibility
- Recommendation schema for the Quick Verdict capsule
- "Last Verified: [date]" and "Last Updated: [date]" both displayed visibly at top of each guide
- Build /guides/ landing page when 10+ guides are published (sitelink opportunity)

---

## 12. File Organization

```
OnlyiGaming/SEO/articles/
  SEO_CONTENT_STRATEGY_FINAL.md          <- this document
  skill/
    SKILL.md                              <- Claude skill (to be updated)
    references/
      editorial-voice.md                  <- voice/tone rules
      keyword-targets.md                  <- category-to-article mapping
      article-template.md                 <- structural template
      master_categories.md                <- copy of category source of truth
  best-casino-platforms-2026/             <- pillar article folder
    article.md
    article.docx
  casino-platforms-gamification/          <- satellite folder
    article.md
    article.docx
  how-to-choose-casino-platform/         <- buyer's guide satellite
    article.md
    article.docx
```

---

## 13. Decisions on Open Questions

1. **Keyword validation tooling:** Ahrefs (Lite plan, $129/month). Better backlink data,
   content gap analysis, and competitor article traffic analysis than SEMrush.
   Key uses: validate keyword volumes, find content gaps, track guide rankings,
   see which competitor review articles actually get traffic.

2. **Voice polish pass:** Use Gemini (with search grounding) for Step 6 editorial voice pass.
   Claude handles steps 1-5 (facts, structure, draft). Gemini handles step 6 (voice,
   specific 2026 facts per vendor, de-AI polish). Critical constraint: Gemini must NOT
   remove SEO keywords during the voice pass.

3. **Satellite volume:** Start with 3 per Tier 1 category:
   - The pillar (core comparison)
   - The buyer's guide ("How to Choose a [Category]")
   - One dimension-specific satellite (highest search volume per category, validated via Ahrefs)
   That's 15 articles for 5 Tier 1 categories. Use traffic data to decide which
   additional satellites to produce.

4. **Update cadence:** Quarterly light review (new vendors, significant changes, outdated facts).
   Full annual rewrite when year rolls over (2026 to 2027). Quarterly checks cover:
   new product launches, acquisitions, licensing changes, stats updates.

5. **Commercial angle:** Decision deferred. Start with independent positioning.
   Revisit once guides generate measurable traffic.

6. **Technical implementation:** Bojan handles category page guide cards and
   company page guide links. Priority to be determined vs other dev work.

---

## 14. Adopted From Gemini Strategy Review

| Gemini Feedback | Action |
|---|---|
| "Solution Fit" scenario routing in intro | ADOPTED - Added to Section 2 article structure |
| "Quick Verdict" capsule for featured snippets | ADOPTED - 40-60 word capsule after intro |
| Guide Hub landing page | TRIGGER at 10+ guides, not now |
| Semantic drift risk in Gemini pass | ADOPTED - Protected keywords list per article |
| Human SME sanity check on 2026 claims | ADOPTED - 5-minute check added to Step 6 |
| Integration Timelines / Time to Value dimension | ADOPTED - Added to all software rubrics |
| Uptime / Infrastructure dimension | ADOPTED - Added to all software rubrics |
| ProductCollection + Review schema markup | ADOPTED - Bojan implementation task |
| "Last Verified" date (not "Last Updated") | ADOPTED - Both dates in template. last_verified = factual data check. last_updated = editorial tweaks. AI engines weight "Verified" higher for B2B trust. |
| Original directory data as competitive moat | ADOPTED - Added to Step 1 research |
| Regulatory licensing updates in Gemini step | ADOPTED - Added to Step 6 |

---

## Summary of What Changed From Earlier Drafts

| Earlier approach | Final approach |
|---|---|
| "iGaming platform providers" article | Separate articles per actual category (casino-platforms, sportsbook-platform, etc.) |
| 12 isolated company profiles | Cross-dimension comparison sections where vendors are compared WITHIN each topic |
| Company bio openings (founded, HQ) | Product-first: what it does, why it matters |
| Same rubrics for all categories | Category-specific dimensions per all 83 categories (references/category-rubrics.md) |
| Prose for everything | Prose for comparison sections, bullet points for vendor profiles |
| No runners-up | Runners-up section + rising stars satellite |
| FAQ section | "Common questions when choosing a [category]" + separate buyer's guide satellite |
| Single article per topic | Pillar + satellite cluster model |
| Founding year and HQ in comparison table | Product attributes only in table |
| Generic keyword guessing | Keyword validation step (Google search, PAA, autocomplete) |
| Articles prominent in nav | Guide cards on category pages, guide links on ALL company pages in category |
