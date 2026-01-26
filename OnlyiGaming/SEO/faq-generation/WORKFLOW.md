# FAQ Generation Workflow - Execution Guide

## How to Use This System

This document provides exact prompts and steps for generating FAQ content using Claude Code.

---

## Quick Start Commands

### Generate FAQs for ONE category:
```
Generate FAQ content for "White Label Solutions" following /home/claude/faq-generation/SKILL.md
```

### Generate FAQs for Wave 1 (batch):
```
Generate FAQ content for all Wave 1 categories in /home/claude/faq-generation/config/categories.md
Process one category at a time, saving outputs to /home/claude/faq-generation/output/wave-1/
```

### Research only (no writing):
```
Research FAQ questions for "Payment Processing" category. 
Show me the top 7 questions found before writing answers.
Use the research template in /home/claude/faq-generation/templates/brief-template.md
```

---

## Full Workflow: Single Category

### Step 1: Research Phase

**Prompt:**
```
I need to generate FAQ content for the iGaming directory category: "[CATEGORY NAME]"

First, research this category by:
1. Searching for common questions people ask about [CATEGORY NAME] in iGaming
2. Finding competitor FAQ content
3. Identifying pricing/cost data
4. Finding timeline/process information

Use web search to gather current data. Document findings using the template at:
/home/claude/faq-generation/templates/brief-template.md

Save the research brief to:
/home/claude/faq-generation/output/wave-[X]/[category-slug]-faq-brief.md
```

### Step 2: Question Selection

**Prompt:**
```
Based on the research for "[CATEGORY NAME]", select 5-7 FAQ questions.

Requirements:
- 1 definition question ("What is...?")
- 1-2 comparison or cost questions  
- 1-2 process/how-to questions
- 1 requirements question

Follow question types from: /home/claude/faq-generation/templates/answer-template.md

Show me the selected questions with rationale before proceeding.
```

### Step 3: Answer Writing

**Prompt:**
```
Write FAQ answers for "[CATEGORY NAME]" using the selected questions.

Follow the answer template at: /home/claude/faq-generation/templates/answer-template.md

Requirements:
- 100-200 words per answer
- Direct answer in first sentence
- Include specific numbers (costs, timeframes)
- Suggest related category links
- B2B tone

Save content to:
/home/claude/faq-generation/output/wave-[X]/[category-slug]-faq-content.md
```

### Step 4: Schema Generation

**Prompt:**
```
Generate JSON-LD FAQ schema for "[CATEGORY NAME]" based on the content just created.

Follow the schema template at: /home/claude/faq-generation/templates/schema-template.json

Requirements:
- Remove all markdown formatting from answers
- Keep answer text under 300 characters where possible
- Ensure valid JSON syntax

Save schema to:
/home/claude/faq-generation/output/wave-[X]/[category-slug]-faq-schema.json
```

### Step 5: Quality Check

**Prompt:**
```
Review the FAQ content for "[CATEGORY NAME]" against the quality checklist at:
/home/claude/faq-generation/quality/checklist.md

Flag any issues that need attention.
```

---

## Full Workflow: Batch Processing

### Process Wave 1 (Top 10 Categories)

**Prompt:**
```
Process Wave 1 FAQ categories from /home/claude/faq-generation/config/categories.md

For each category:
1. Research using web search
2. Select 5-7 questions
3. Write answers following templates
4. Generate JSON-LD schema
5. Save all outputs to /home/claude/faq-generation/output/wave-1/

Process categories in order:
1. iGaming Platforms
2. White Label Solutions
3. Turnkey Platforms
4. Casino Platforms
5. Licensing & Regulatory Consulting
6. Payment Processing
7. Game Providers
8. Affiliate Programs
9. KYC Services
10. AML Solutions

After each category, show me a summary before proceeding to the next.
```

---

## Output File Naming Convention

```
/faq-generation/output/wave-1/
├── igaming-platforms-faq-content.md
├── igaming-platforms-faq-schema.json
├── igaming-platforms-faq-brief.md
├── white-label-solutions-faq-content.md
├── white-label-solutions-faq-schema.json
├── white-label-solutions-faq-brief.md
└── ... (etc for each category)
```

---

## Example Output: FAQ Content File

```markdown
# FAQ: White Label Solutions

## Category Information
- **Slug:** white-label-solutions
- **Parent:** Platforms
- **Generated:** 2026-01-21

---

## Frequently Asked Questions

### What is a white label casino solution?

A white label casino is a pre-built online gambling platform provided by a third-party vendor that allows operators to launch under their own brand without developing technology from scratch. The provider handles licensing, software, games, and payment processing while the operator focuses on marketing and player acquisition.

This model is popular among new market entrants because it reduces time-to-market from 12+ months to as little as 4-8 weeks. Operators typically pay a setup fee plus ongoing revenue share (commonly 15-30% of GGR).

White label solutions typically include:
- Ready-made casino or sportsbook platform
- Existing gambling license (usually Curacao or MGA)
- Pre-integrated game providers (50-100+ studios)
- Payment processing and KYC tools

→ Related: [Turnkey Platforms](/directory/turnkey-platforms) | [Licensing Consulting](/directory/licensing-consulting)

---

### How much does a white label casino cost?

[... continue with remaining FAQs ...]

---

## Internal Link Suggestions
- Turnkey Platforms (comparison content)
- Licensing & Regulatory Consulting (license requirements)
- Payment Processing (payment integration)
- iGaming Platforms (parent category)

---

## Meta Information
- **Word Count:** [total]
- **Questions:** 6
- **Last Updated:** 2026-01-21
- **Research Brief:** white-label-solutions-faq-brief.md
- **Schema File:** white-label-solutions-faq-schema.json
```

---

## Troubleshooting

### Issue: Not enough search results
**Solution:** Try broader search terms, check competitor sites directly

### Issue: Pricing data seems outdated
**Solution:** Search for "[topic] 2025 pricing" or "[topic] 2026 cost"

### Issue: Questions overlap with another category
**Solution:** Differentiate by making questions more specific to this category's unique angle

### Issue: Schema validation fails
**Solution:** Check for smart quotes, special characters, unescaped text

---

## Human Review Points

Flag for human review when:
- [ ] Pricing data varies widely (>50% difference between sources)
- [ ] Regulatory information may have changed
- [ ] Content touches on legal advice
- [ ] Statistics seem questionable
- [ ] Category overlap is unclear

---

## Progress Tracking

Use this to track completion:

### Wave 1 Status — COMPLETE ✅ (2026-01-21)
1. ✅ White Label Solutions
2. ✅ Turnkey Platforms
3. ✅ Casino Platforms
4. ✅ Licensing & Regulatory Consulting
5. ✅ Payment Processing
6. ✅ Game Providers
7. ✅ Affiliate Programs
8. ✅ KYC Services
9. ✅ AML Solutions
10. ✅ Sportsbook Platforms

### Wave 2 Status — READY TO START
Categories 11-30 from `/SEO/faq-generation/config/categories.md`
Output to: `/SEO/faq-generation/output/wave-2/`

---

## Lessons Learned from Wave 1

### Format Updates (Apply to Wave 2+)
- Use `####` for sub-headings within answers (not bold text)
- Use single year "2026" (not "2025-2026")
- NO markdown tables — site doesn't support them
- Use numbered lists for sequential steps, rankings, countable items
- Use bullet points for unordered lists
- 14 questions per category (6 H2 primary + 8 H3 supporting)
- ~3,200 words per category

### Workflow Optimization
- Research via WebSearch first, then create all 3 files together
- Read category description from config/category-descriptions.md for terminology
- Include Related links at end of each answer pointing to other directory categories

Legend: ⬜ Not started | 🟡 In progress | ✅ Complete
