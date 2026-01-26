# FAQ Generation Skill for OnlyiGaming Directory

## Purpose
Generate comprehensive, authoritative FAQ content for each of the 80 iGaming B2B directory categories. FAQs should target featured snippets, answer real search queries, establish thought leadership, and drive qualified B2B traffic.

## Overview
This skill automates the research, writing, and formatting of **12-15 FAQs per category page** with a target of **2,500-3,500 words total**. Output includes ready-to-publish content with JSON-LD schema markup. The tone should be opinionated and authoritative—like insider advice from a seasoned industry consultant who's seen the pitfalls firsthand.

---

## Content Hierarchy: H2 and H3 Structure

FAQs use a **two-level hierarchy** to signal importance to Google and improve scannability:

### H2 Questions (Primary - 5-6 per category)
- **Featured snippet targets** - these are the main queries people search
- Full, comprehensive answers (200-280 words)
- Cover the core topics: definition, cost, comparison, process, requirements
- Stand alone as complete answers

### H3 Questions (Supporting - 7-9 per category)
- **Depth and detail** - supporting questions under related H2 topics
- Focused answers (150-220 words)
- Cover: hidden costs, red flags, mistakes, niche variations, trends, metrics
- Grouped logically under parent H2 topics

### Structure Example
```markdown
## What is [X]?
[Full answer - 200-280 words]

## How much does [X] cost?
[Full answer - 200-280 words]

### What are the hidden costs of [X]?
[Supporting detail - 150-220 words]

## What is the difference between [X] and [Y]?
[Full answer - 200-280 words]

### When should I upgrade from [X] to [Y]?
[Supporting detail - 150-220 words]

## What are the risks and downsides of [X]?
[Full answer - 200-280 words]

### What are red flags when choosing [X]?
[Supporting detail - 150-220 words]

### What mistakes do operators make with [X]?
[Supporting detail - 150-220 words]
```

---

## Workflow

### Step 1: Load Category Data
Read the category list from `/faq-generation/config/categories.md` to get:
- Category name
- Slug
- Parent category
- Priority wave

### Step 1.5: Load Category Description
**REQUIRED:** Before researching, read the category description from:
`/SEO/faq-generation/config/category-descriptions.md`

Find the matching category heading and use its description as foundation for:
- Terminology and industry language
- Positioning and tone
- Keywords to weave naturally into answers
- Understanding of category scope

Do NOT contradict or ignore the established description.

### Step 2: Research Phase
For each category, perform web searches to discover:
1. "People Also Ask" style questions
2. Competitor FAQ content
3. Industry-specific terminology
4. Current pricing/timeframe data
5. Common complaints and red flags
6. Hidden costs and gotchas
7. Comparison points with alternatives

**Search queries to run:**
```
"{category name}" iGaming FAQ
"{category name}" gambling "what is"
"{category name}" casino "how much cost"
"{category name}" vs alternative
"{category name}" requirements license
"{category name}" problems issues complaints
"{category name}" hidden costs fees
"{category name}" red flags avoid
"{category name}" best providers 2025 2026
```

### Step 3: Question Selection
Select **12-15 questions** per category with this H2/H3 distribution:

**H2 Primary Questions (5-6):**
- 1 Definition question ("What is X?")
- 1 Cost/Pricing question ("How much does X cost?")
- 1 Comparison question ("What is the difference between X and Y?")
- 1 Process question ("How long does X take?" or "How do I get started with X?")
- 1 Risk/Downside question ("What are the risks of X?" or "What are the disadvantages?")
- 1 Provider question ("Who are the top X providers?") - optional, can be H3

**H3 Supporting Questions (7-9):**
- 1-2 Hidden costs / pricing detail questions
- 1-2 Red flags / due diligence questions
- 1-2 Mistakes / pitfalls questions
- 1-2 Niche variation questions (crypto, specific markets, etc.)
- 1 Trends question ("How is X changing?")
- 1-2 Post-purchase questions (metrics, when to upgrade/switch)

### Step 4: Answer Writing
Write answers following the template in `/faq-generation/templates/answer-template.md`

**Key principles:**
- Lead with a direct answer (featured snippet bait)
- Include specific numbers with ranges
- Add opinionated insights ("In my experience...", "The reality is...")
- Call out industry BS and marketing hype
- Provide actionable red flags and due diligence tips
- Include insider perspective on hidden costs

### Step 5: Generate Outputs
Create three files per category:
1. `{category-slug}-faq-content.md` - The FAQ content (2,500-3,500 words)
2. `{category-slug}-faq-schema.json` - JSON-LD markup (includes ALL questions, H2 and H3)
3. `{category-slug}-faq-brief.md` - Research notes and sources

---

## File Locations

```
/faq-generation/
├── SKILL.md                    # This file
├── config/
│   └── categories.md           # Full category list with priorities
├── templates/
│   ├── answer-template.md      # How to structure answers
│   ├── schema-template.json    # JSON-LD template
│   └── brief-template.md       # Research brief template
├── research/
│   └── competitor-faqs.md      # Competitor FAQ examples
├── output/
│   ├── wave-1/                 # High priority categories
│   ├── wave-2/                 # Medium priority
│   └── wave-3/                 # Remaining categories
└── quality/
    └── checklist.md            # QA checklist per category
```

---

## Execution Commands

### Generate FAQs for a single category:
```
Generate FAQ content for the category: "[Category Name]"
Follow the FAQ Generation Skill in /faq-generation/SKILL.md
```

### Generate FAQs for Wave 1 (top 10 priority):
```
Generate FAQ content for all Wave 1 categories listed in /faq-generation/config/categories.md
Follow the FAQ Generation Skill and save outputs to /faq-generation/output/wave-1/
```

### Batch process with approval:
```
Research FAQ questions for "[Category Name]" and show me the proposed questions before writing answers.
```

---

## Quality Standards

### Content Requirements
- **12-15 questions** per category (5-6 H2, 7-9 H3)
- **2,500-3,500 words** total per category
- **H2 answers:** 200-280 words (primary, featured snippet targets)
- **H3 answers:** 150-220 words (supporting detail)
- Direct answer in first 1-2 sentences (for featured snippet)
- Include specific numbers (costs, timeframes) where available
- B2B tone targeting business decision-makers
- At least one internal link suggestion per FAQ
- No "it depends" without providing ranges

### Tone Requirements
- **Authoritative:** Write like you've been in the industry for 15 years
- **Opinionated:** Take positions, make recommendations
- **Honest:** Call out marketing BS, hidden costs, and industry practices
- **Practical:** Focus on actionable insights, not theory
- **Insider:** Share knowledge that isn't in the marketing brochures

**Good tone examples:**
- "Here's what providers won't tell you upfront..."
- "The 15-30% revenue share sounds reasonable until you do the math at scale..."
- "In practice, the '4-week launch' often becomes 8-10 weeks because..."
- "Red flag: Any provider who won't share their full fee structure before signing..."

**Avoid:**
- Generic corporate speak
- Hedging without substance
- Sales language
- Overly academic tone

### SEO Requirements
- H2 questions target primary featured snippets
- H3 questions provide supporting depth
- Use exact keyword phrase in question
- Implement FAQ schema markup (includes ALL questions)
- Suggest 2-3 related category links per FAQ

### Accuracy Requirements
- Cite sources for statistics
- Use current data (2025-2026)
- Flag any uncertain information for human review
- Cross-reference multiple sources for pricing data

---

## H2/H3 Topic Groupings

Organize H3 questions under related H2 topics:

### Under "How much does X cost?"
- What are the hidden costs of X?
- What's the total cost of ownership?

### Under "What is the difference between X and Y?"
- When should I upgrade from X to Y?
- Which is better for [specific use case]?

### Under "What are the risks/downsides of X?"
- What are red flags when choosing X?
- What mistakes do operators make with X?

### Under "Who are the top X providers?"
- What about X for crypto/specific market?
- How is the X market changing?

### Standalone H3s (or under relevant H2)
- How do I know if X is working? (metrics)
- What do I need to get started with X? (requirements detail)

---

## Do NOT
- Invent statistics or pricing without sources
- Copy competitor content verbatim
- Include consumer-focused questions (B2C)
- Answer questions outside the category scope
- Use generic filler content
- Skip the schema markup generation
- Write neutral/bland content—take positions
- Avoid mentioning downsides or risks
- Use marketing language from provider websites
- Mix H2 and H3 randomly—maintain logical groupings
