# FAQ Quality Assurance Checklist

Use this checklist before finalizing FAQ content for any category.

---

## Category: _______________
## Reviewer: _______________
## Date: _______________

---

## 1. Question Quality

### Question Selection
- [ ] Contains 5-7 questions (not fewer, not more)
- [ ] Includes at least 1 definition question
- [ ] Includes at least 1 comparison OR cost question
- [ ] Includes at least 1 process/how-to question
- [ ] All questions are B2B focused (not consumer questions)
- [ ] No duplicate/overlapping questions within this category
- [ ] Questions don't overlap with other category FAQs

### Question Formatting
- [ ] Each question uses H3 heading (`###`)
- [ ] Questions are phrased exactly as users would search
- [ ] Questions include the category keyword naturally
- [ ] No yes/no questions (unless answer provides context)

---

## 2. Answer Quality

### Content Requirements
- [ ] Each answer is 100-200 words
- [ ] Direct answer appears in first 1-2 sentences
- [ ] Specific numbers included (costs, timeframes, percentages)
- [ ] No "it depends" without providing useful ranges
- [ ] Industry terminology used correctly
- [ ] B2B tone maintained throughout

### Accuracy
- [ ] All statistics have sources noted in research brief
- [ ] Pricing data is current (2025-2026)
- [ ] Timeframes are realistic and sourced
- [ ] No factual errors or outdated information
- [ ] Jurisdictional statements are accurate
- [ ] Regulatory information is current

### Formatting
- [ ] Bullet lists used sparingly (only when adding value)
- [ ] Tables used for comparison questions
- [ ] No excessive bold/italic formatting
- [ ] Consistent formatting across all answers

---

## 3. SEO Requirements

### On-Page SEO
- [ ] Primary keyword appears in at least 3 answers
- [ ] Questions match "People Also Ask" phrasing
- [ ] Answers are featured-snippet optimized (direct, concise)
- [ ] No keyword stuffing

### Internal Linking
- [ ] Each FAQ suggests 1-2 related categories
- [ ] Links use descriptive anchor text
- [ ] No broken or placeholder links
- [ ] Links are relevant to the question context

### Schema Markup
- [ ] JSON-LD schema file generated
- [ ] Schema validates at jsonlint.com
- [ ] All questions/answers match schema exactly
- [ ] No HTML or markdown in schema text
- [ ] Schema text is under 300 characters per answer

---

## 4. Compliance & Sensitivity

### Regulatory Compliance
- [ ] No absolute legal/regulatory claims
- [ ] Jurisdiction-specific info clearly labeled
- [ ] "Consult legal counsel" disclaimer where appropriate
- [ ] No promotion of unlicensed activity

### Content Sensitivity
- [ ] No promotional bias toward specific vendors
- [ ] Balanced comparison content
- [ ] No disparagement of competitors
- [ ] Responsible gambling mentioned where relevant

---

## 5. Technical Checks

### File Deliverables
- [ ] `{category-slug}-faq-content.md` created
- [ ] `{category-slug}-faq-schema.json` created
- [ ] `{category-slug}-faq-brief.md` created
- [ ] All files saved in correct output folder

### Content Formatting
- [ ] Markdown renders correctly
- [ ] No broken formatting or special characters
- [ ] Tables display properly
- [ ] Links are properly formatted

---

## 6. Final Review

### Readability
- [ ] Content reads naturally (not robotic)
- [ ] Appropriate for target audience
- [ ] Free of typos and grammar errors
- [ ] Consistent voice throughout

### Completeness
- [ ] All 5-7 questions have complete answers
- [ ] No placeholder text remaining
- [ ] All [brackets] resolved
- [ ] Research brief is complete

---

## Sign-Off

### Quality Score: ___/50 points
(Each checkbox = 1 point, minimum 40 required for approval)

### Status:
- [ ] **APPROVED** - Ready for implementation
- [ ] **REVISIONS NEEDED** - See notes below
- [ ] **REJECTED** - Requires rewrite

### Revision Notes:
```
[List any issues that need to be addressed]
```

### Approved By: _______________
### Date: _______________

---

## Quick Reference: Common Issues

| Issue | Solution |
|-------|----------|
| Answer doesn't directly answer question | Rewrite first sentence to be the direct answer |
| Missing specific numbers | Research and add pricing/timeline data |
| Too long (>200 words) | Cut fluff, keep essential info only |
| Too short (<100 words) | Add context, examples, or related info |
| Missing internal links | Add "Related:" section at end |
| Schema validation fails | Check for special characters, remove markdown |
| Overlaps with other category | Differentiate focus or merge questions |
| Sounds promotional | Remove brand names, use generic terms |
