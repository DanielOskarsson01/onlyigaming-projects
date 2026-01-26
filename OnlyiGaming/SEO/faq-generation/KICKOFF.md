# FAQ Project Kickoff

Run this prompt in Claude Code after placing the faq-generation folder in /SEO/:

---

## Kickoff Prompt (copy everything below this line)

```
## Setup FAQ Generation Project

### 1. Update Project Files

Add to the end of /SEO/CLAUDE.md:

"""
## FAQ Generation
For category FAQ tasks, follow /SEO/faq-generation/SKILL.md
Wave 1 (top 10 categories) is priority. Output goes to /SEO/faq-generation/output/
"""

Add to /SEO/ROADMAP.md under current tasks:

"""
## FAQ Generation for Directory Categories
**Status:** In Progress
**Owner:** Stefan (SEO)

### Scope
Generate 5-7 SEO-optimized FAQs per directory category (80 total)

### Waves
- Wave 1: Top 10 categories (iGaming Platforms, White Label, Turnkey, etc.)
- Wave 2: Next 20 categories  
- Wave 3: Remaining 50 categories

### Deliverables per category
- FAQ content (.md)
- JSON-LD schema (.json)
- Research brief (.md)
"""

Add to /SEO/PROJECT_STATUS.md:

"""
## FAQ Generation
- [ ] Wave 1 (10 categories) — IN PROGRESS
- [ ] Wave 2 (20 categories) — NOT STARTED
- [ ] Wave 3 (50 categories) — NOT STARTED
"""

### 2. Confirm Setup

After updating the files, confirm:
- You can read /SEO/faq-generation/SKILL.md
- You can read /SEO/faq-generation/config/categories.md
- You can read /SEO/faq-generation/templates/answer-template.md

### 3. Generate First Category

Then generate FAQ content for Wave 1, Category 1: "iGaming Platforms"

Follow the SKILL.md process:
1. Research using web search
2. Select 5-7 questions
3. Write answers per template
4. Generate JSON-LD schema

Save outputs to /SEO/faq-generation/output/wave-1/:
- igaming-platforms-faq-content.md
- igaming-platforms-faq-schema.json
- igaming-platforms-faq-brief.md

Show me the content for review before proceeding to the next category.
```

---

## After First Category is Done

Use this prompt to continue:

```
Continue with Wave 1. Generate FAQ content for the next category in /SEO/faq-generation/config/categories.md

Follow the same process and save to /SEO/faq-generation/output/wave-1/
```

---

## Batch Process (after you've validated quality)

```
Generate FAQ content for all remaining Wave 1 categories.
Process each one, saving outputs to /SEO/faq-generation/output/wave-1/
Update PROJECT_STATUS.md when Wave 1 is complete.
```
