Generate a comprehensive FAQ for the iGaming directory category: $ARGUMENTS

## Process Overview

Execute steps 1-5 sequentially. Generate all three output files in a single pass after research is complete.

---

## Step 1: Determine Wave and Output Path

Look up the category in `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/faq-generation/config/categories.md` to determine:
- The wave number (1, 2, or 3)
- The category slug
- The parent category

Save output files to: `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/faq-generation/output/wave-{N}/`

If the category is not in categories.md, ask for clarification before proceeding.

---

## Step 2: Load Context and Templates

1. **Category description** from `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/faq-generation/config/category-descriptions.md`
   - Find the matching category to establish terminology, positioning, and related categories
   - Use the description to identify comparison targets and related directory links

2. **Templates** from `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO/faq-generation/templates/`:
   - `answer-template.md` - H2/H3 answer structures, word counts, tone guidance
   - `schema-template.json` - FAQPage JSON-LD format
   - `brief-template.md` - Research brief structure (10 sections)

---

## Step 3: Research via Web Search

Execute 4-6 web searches covering:

1. **General FAQ discovery:** "[category] iGaming FAQ" / "[category] gambling frequently asked questions"
2. **Cost/pricing data:** "[category] iGaming cost pricing 2025 2026"
3. **Competitor analysis:** "[category] providers comparison 2025 2026"
4. **Regulatory/requirements:** "[category] requirements regulations iGaming"
5. **Trends and changes:** "[category] trends 2026" / "[category] market changes"
6. **Problems/risks:** "[category] risks challenges problems iGaming operators"

Document all findings for the research brief. Note specific data points with sources.

---

## Step 4: Select 14 Questions

### H2 Primary Questions (pick 6)

| # | Type | Template | Notes |
|---|------|----------|-------|
| 1 | Definition | "What is [X]?" | Always include |
| 2 | Cost/Pricing | "How much does [X] cost?" | Include specific ranges |
| 3 | Comparison | "What is the difference between [X] and [Y]?" | Use related category from descriptions |
| 4 | Process/Timeline | "How long does it take to [X]?" | Include realistic timelines |
| 5 | Risks/Downsides | "What are the risks of [X]?" | Honest assessment |
| 6 | Providers | "Who are the top [X] providers in 2026?" | Name real companies |

### H3 Supporting Questions (pick 8)

Group H3s logically under related H2 topics:

| # | Type | Template | Groups Under |
|---|------|----------|--------------|
| 1 | Hidden Costs | "What are the hidden costs of [X]?" | Cost H2 |
| 2 | Red Flags | "What are red flags when choosing [X]?" | Risks H2 |
| 3 | Mistakes | "What mistakes do operators make with [X]?" | Risks H2 |
| 4 | Upgrade/Transition | "When should I upgrade from [X] to [Y]?" | Comparison H2 |
| 5 | Niche/Advanced | "What about [X] for [specific use case]?" | Providers H2 |
| 6 | Trends | "How is [X] changing in 2026?" | Providers H2 |
| 7 | Metrics | "How do I know if my [X] is performing well?" | Standalone |
| 8 | Requirements | "Do I need [requirement] for [X]?" | Definition H2 |
| 9 | Optimization | "How do I optimize/improve [X]?" | Process H2 |
| 10 | Challenges | "What are the biggest challenges with [X]?" | Risks H2 |

Pick 8 that are most relevant to the category. Not all types apply to every category.

---

## Step 5: Generate Three Output Files

### File 1: `{category-slug}-faq-content.md`

#### Header Format

```markdown
# {Category Name} - Frequently Asked Questions

## Category Information

- **Category:** {Category Name}
- **Slug:** {category-slug}
- **Parent:** {Parent Category}
- **Wave:** {N} (Priority)
- **Questions:** 14 (6 H2, 8 H3)
- **Word Count:** ~3,200

---

## Introduction

{1-2 sentences describing what this FAQ covers and who it's for. Frame the category's core value proposition and what readers will learn. This helps Google understand the page context and improves featured snippet eligibility.}

---
```

**Note:** The Introduction is MANDATORY. It signals to Google this is an FAQ section and provides context for the questions that follow.

#### Content Structure Rules

- **Total:** 14 questions (6 H2 + 8 H3)
- **Total word count:** ~3,200 (2,500-3,500 range)
- **H2 answers:** 200-280 words each
- **H3 answers:** 150-220 words each
- **First 1-2 sentences:** Direct answer (featured snippet optimization)
- **Sub-headings:** Use `####` (H4) within answers, NOT bold text as labels
- **Section dividers:** Use `---` between H2 sections only
- **Lists:**
  - Bullet points for unordered items
  - Numbered lists for sequential steps, rankings, or countable items (costs, mistakes, trends)
- **Related links:** End each FAQ section with HTML links (for Strapi CMS):
  `Related: <a href="/directory/category-slug">Category Name</a> | <a href="/directory/category-slug">Category Name</a>`
  - Use 1-2 related links per section
  - Pull related categories from category-descriptions.md
  - Link format: `<a href="/directory/slug">Display Name</a>`

#### Formatting Rules - STRICT

- NO markdown tables (site doesn't render them)
- NO em dashes (--)
- NO "2025-2026" year ranges, use single year "2026"
- NO filler phrases ("Great question!", "It depends", "In conclusion")
- NO smart/curly quotes
- Use `####` for sub-headings within answers
- Use `---` dividers between H2 sections only (not between H3s that follow an H2)
- H3 questions that logically follow an H2 appear after it without a `---` divider
- Next H2 section starts after a `---` divider

#### Content Flow Pattern

```markdown
## Introduction

[1-2 sentences: What this FAQ covers and who it's for. Frame the category's value and what readers will learn.]

---

## [H2 Primary Question]

[Answer 200-280 words]

Related: [Link] | [Link]

---

## [H2 Primary Question]

[Answer 200-280 words]

Related: [Link]

### [H3 Supporting Question - related to above H2]

[Answer 150-220 words]

Related: [Link]

### [H3 Supporting Question - related to above H2]

[Answer 150-220 words]

Related: [Link]

---

## [Next H2 Primary Question]
...
```

#### Footer Format

```markdown
---

## Internal Link Suggestions

- [Category 1]: Link Type: Comparison
- [Category 2]: Link Type: Prerequisite
- [Category 3]: Link Type: Next Step
- [Category 4]: Link Type: Related Service

---

## Meta Information

- **Word Count:** [total]
- **Questions:** 14
- **Last Updated:** [YYYY-MM-DD]
- **Research Brief:** {category-slug}-faq-brief.md
- **Schema File:** {category-slug}-faq-schema.json
```

---

### File 2: `{category-slug}-faq-schema.json`

#### Format

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Exact question text from content",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Plain text summary, 300-600 characters. No markdown, no bullets, no formatting."
      }
    }
  ]
}
```

#### Schema Rules

- Include ALL 14 questions (both H2 and H3)
- **Plain text only** - no markdown, no bullets, no bold, no links
- Convert bullet lists to comma-separated text
- **Answer length:** 300-600 characters (enough for meaningful answer, not just a teaser)
- Condense the full answer into a factual summary with key data points
- Use straight quotes, not smart/curly quotes
- Escape special characters properly
- Validate JSON syntax before saving
- Question text must match the heading in the content file exactly

---

### File 3: `{category-slug}-faq-brief.md`

Follow the 10-section structure from the brief template:

```markdown
# FAQ Research Brief: {Category Name}

## Category: {Category Name}

- **Slug:** {category-slug}
- **Parent Category:** {Parent}
- **Priority Wave:** {N}
- **Date Researched:** {YYYY-MM-DD}

---

## 1. Search Queries Executed
[Document each search query and what was found]

## 2. Competitor FAQ Analysis
[3+ competitors with URLs and questions found]

## 3. People Also Ask (PAA) Questions
[8+ questions discovered via search]

## 4. Selected Questions (Final 14)
[H2 and H3 questions with types and rationale]

## 5. Data Points Gathered
[Pricing, timeframes, statistics with sources]

## 6. Related Categories for Internal Links
[Categories identified for linking with context]

## 7. Keywords to Include
[Primary, secondary, and industry terms]

## 8. Gaps & Uncertainties
[Items needing human verification]

## 9. Content Warnings
[Sensitive topics or jurisdiction-specific info]

## 10. Sources Bibliography
[All sources with URLs and access dates]
```

---

## Style Rules

### Voice and Tone
- Authoritative, 15+ years industry experience
- Like advice from an experienced consultant with no sales agenda
- Opinionated with evidence-backed positions
- Call out marketing BS, hidden costs, and industry practices
- Share what providers won't tell you
- Direct and specific, never vague

### Language
- Use industry terms naturally: GGR, NGR, PAM, PSP, AML, KYC, CDD, EDD, SAR, RTP, RNG
- Mention jurisdictions where relevant: Malta (MGA), UK (UKGC), Curacao, Gibraltar, Isle of Man
- Include specific numbers with ranges (never round numbers without ranges)
- Cite timeframe for data: "as of 2026"

### Avoid
- Corporate speak and marketing language
- Hedging without providing useful ranges
- Sales language or promotional tone about specific companies
- Filler phrases ("In today's competitive landscape...")
- Em dashes (look AI-generated)
- Consumer-focused advice (this is B2B)
- Generic advice that could apply to any industry
- Starting answers with "Great question!" or similar

### Good Tone Examples
- "Here's what providers won't tell you upfront..."
- "The 15-30% revenue share sounds reasonable until you do the math at scale..."
- "In practice, the '4-week launch' often becomes 8-10 weeks because..."
- "Red flag: Any provider who won't share their full fee structure before signing..."
- "Don't believe the marketing. Here's what actually happens..."

---

## Quality Checklist (Self-Review Before Saving)

Before saving files, verify:

- [ ] Introduction section present (1-2 sentences describing the FAQ)
- [ ] 14 questions total (6 H2 + 8 H3)
- [ ] Word count in 2,500-3,500 range
- [ ] Every answer starts with a direct answer (first 1-2 sentences)
- [ ] Specific numbers with ranges (not vague statements)
- [ ] Related links on every FAQ section
- [ ] `####` used for sub-headings (not bold text)
- [ ] `---` dividers between H2 sections
- [ ] No markdown tables
- [ ] No em dashes
- [ ] No filler phrases
- [ ] H3s logically grouped under related H2s
- [ ] Schema JSON is valid
- [ ] Schema answers are 300-600 characters
- [ ] Schema includes all 14 questions
- [ ] Brief has all 10 sections filled
- [ ] Category slug matches across all 3 files

---

## Process Optimization Log

Track improvements here as the process evolves:

### Wave 1 Lessons (2026-01-21)
- Use `####` for sub-headings (not bold labels)
- Single year "2026" (not ranges)
- NO markdown tables
- Numbered lists for sequential/ranked items
- Research first, then create all 3 files together
- Read category-descriptions.md for related links
- Schema answers need 300-600 chars for meaningful summaries
- 14 questions (6+8) is the right number for depth without padding
- MANDATORY Introduction section after metadata (1-2 sentences for Google context)

### Wave 2+ Improvements
- [Add learnings here as process improves]
