# Satellite Article Prompt Templates

Each satellite class has a detailed, structured prompt equal in specificity to the pillar prompt.
These are used by the Command Center's draft endpoint when writing satellite articles.

---

## CLASS 1: BEST-FOR

**Covers:** Dimension-specific, Audience-based, Market-specific satellites — "Best [category] for [angle]" articles
**Examples:** "Best Casino Platforms with Crypto Support", "Best Casino Platforms for Startups", "Best Casino Platforms for Brazil"
**Why one template with profiles:** All "Best X for Y" articles share the same structural skeleton — vendor comparison through a specific lens. What differs is the angle-specific guidance: which buyer concerns matter, which vendor cohort to include, what to verify, what trap questions to ask, what section names map to the angle. These angle-specific overrides live in **profiles** (see the `## PROFILES` section at the bottom of this file). The template interpolates the matching profile at draft time via `detectNicheProfile()`. The category rubric (`${rubric.dimensions}`) provides category-specific dimensions; the profile provides angle-specific emphasis — they are separate concerns.

### Prompt Template

```
You are writing a BEST-FOR satellite article for OnlyiGaming.com.

ARTICLE CONTEXT:
- Title: "${articleTitle}"
- Category: ${categorySlug}
- Niche angle: "${angle}"
- Parent pillar: /guides/best-${categorySlug}-2026 (link to this early)

This article narrows the pillar's full comparison to vendors most relevant to one specific angle: "${angle}". Readers already know they need this category — they want to know which vendor fits THEIR specific situation.

CATEGORY RUBRIC (what dimensions matter for this category — applies to all articles in this category):
- Dimensions: ${rubric.dimensions}
- Group: ${rubric.group}

ANGLE-SPECIFIC GUIDANCE (from the niche profile — applies specifically to this "for [angle]" article, distinct from the category dimensions above):

Buyer concerns for this angle:
${profile.subtypeBuyerConcerns}

Expected vendor cohort for this angle:
${profile.expectedVendorCohort}

What to verify before signing (angle-specific):
${profile.whatToVerify}

Trap questions to ask vendors (angle-specific):
${profile.trapQuestions}

Suggested H2 section names (use these as starting points, adapt to actual vendors and evidence):
${profile.sectionNameHints}

${pillarContent ? `PILLAR ARTICLE (for context on vendors and dimensions - do not duplicate, narrow down):\n${pillarContent}` : ''}

${kwResearch ? `KEYWORD RESEARCH:\n${kwResearch}` : ''}

EDITORIAL VOICE GUIDE:
${voiceGuide}

FORMATTING RULES (apply throughout — these are non-negotiable):
- H1: the article title — rendered by the CMS from the frontmatter title field; do NOT write an H1 in the article body
- H2: every major section heading (Intro excluded — it is plain prose)
- H3: vendor profile headings, sub-section headings within H2 sections, FAQ question headings
- Never skip heading levels (no H3 without a parent H2)
- Use ### H3 heading for every Common Questions entry; prose answer in paragraph below
- Use ### H3 for each vendor profile heading
- Use markdown `-` bullet lists for any enumerable content of 3 or more items
- Use `>` blockquote for the Quick Verdict Capsule
- Use markdown tables (| col | col |) for all comparison data
- Use **bold lead sentence** for red flags and key callouts, followed by prose
- All vendor names in H3 headings must be linked to their OnlyiGaming directory page

REQUIRED STRUCTURE (in this exact order):

1. **YAML FRONTMATTER** - all fields from template (meta_title, meta_description, slug, protected_keywords, parent_pillar, type: satellite-best-for)

2. **INTRO WITH SCENARIO ROUTING** (200-300 words)
   - Opening: why this specific angle matters (not generic category intro) — reference the buyer concerns from the profile above
   - 3-4 bullet scenarios routing readers: "If you [situation], focus on [section]"
   - Format scenarios as `-` bullet list
   - Link to pillar: "For the full comparison across all dimensions, see [pillar link]"

3. **QUICK VERDICT CAPSULE** (40-60 words)
   - `>` blockquote format (for featured snippet extraction)
   - Link-free
   - Name the top pick for this specific angle and why in one sentence

4. **COMPARISON TABLE** (max 6 columns)
   - Column 1: Provider (linked to OnlyiGaming company page)
   - Columns 2-4: Angle-specific criteria drawn from the buyer concerns above (NOT the same columns as the pillar)
   - Column 5: Best For
   - Include vendors from the expected vendor cohort above (6-10, not all pillar vendors)

5. **CROSS-ANGLE COMPARISON SECTIONS** (3-5 sections, H2 each, 350-500 words each)
   - Use the "Suggested H2 section names" from the profile above as your starting framework — adapt section count and exact names to what the actual vendor cohort and evidence support
   - Each section compares ALL listed vendors on one sub-dimension of this angle
   - End each section with a clear winner statement in bold
   - Use `-` bullet lists for feature comparisons within sections; prose for analysis
   - Every section must end with one actionable item: a verification check or trap question drawn from the angle guidance above

6. **VENDOR PROFILES** (### H3 each, 6-10 vendors, 200-350 words each)
   - Verdict headline as H3: "[Vendor]: [One-Line Judgment for This Angle]" (vendor name linked)
   - Bullet format using `-`:
     - **Standout for this angle:** [specific capability tied to the buyer concerns above]
     - **Proof points:** [verifiable facts — named clients, certifications, deals from 2025-2026]
     - **Trade-off:** [honest limitation for this angle]
     - **Best for:** [operator type within this angle]
     - **Not for:** [who should look elsewhere]

7. **RUNNERS-UP** (3-5 vendors, 1-2 sentences each with directory links)

8. **BUYING SIGNALS FOR THIS ANGLE** (200-300 words)
   - Two `-` bullet lists:
     - "This angle is right for you if:" (4-5 signals derived from the buyer concerns above)
     - "Look elsewhere if:" (3-4 red flags specific to this niche)
   - Be honest — this niche is not right for everyone

9. **WHAT TO VERIFY AND TRAP QUESTIONS** (300-450 words)
   - Use the verification checks and trap questions from the angle guidance above as the foundation — operationalize each
   - Format as `-` bullet list: bold the check or question, then 1-2 sentences explaining what a good answer vs red flag answer looks like
   - This is the operator-protection section — non-negotiable for this template

10. **COMMON QUESTIONS** (4-6 questions, NOT called "FAQ")
    - ### H3 heading for each question
    - Prose paragraph answer below each heading
    - Questions specific to this angle, not generic category questions
    - ${kwResearch ? 'Use questions from keyword research where relevant' : 'Use questions a buyer with this specific need would ask'}

11. **FOOTER**
    - Link back to pillar
    - Link to directory category page
    - "Last Verified" date and independence statement

REQUIREMENTS:
- 4,000-5,500 words total
- Product-first approach throughout
- At least 2 genuinely opinionated statements specific to this angle
- Every strength gets a named trade-off
- Internal links: https://onlyigaming.com/companies/[company-slug]
- No em dashes or en dashes - regular hyphens only
- No banned words from the voice guide

Write the complete article now. Start with --- for the YAML frontmatter.
```

---

## CLASS 2: BUYER'S GUIDE

**Covers:** "How to Choose a [Category]" satellites
**Examples:** "How to Choose a Casino Platform: Questions, Scoring & Red Flags"
**Why unique:** Framework article. No vendor profiles or comparison tables. Structured around the buying PROCESS, not vendor evaluation.

### Prompt Template

```
You are writing a BUYER'S GUIDE satellite article for OnlyiGaming.com.

ARTICLE CONTEXT:
- Title: "How to Choose a ${categoryTitle}: Questions, Scoring & Red Flags"
- Category: ${categorySlug}
- Parent pillar: /guides/best-${categorySlug}-2026 (link to this early and at end)

This article helps operators who are EARLIER in the buying process than the pillar's audience. They don't know what to prioritize yet. This guide gives them a decision framework before they start comparing vendors.

CATEGORY RUBRIC:
- Dimensions: ${rubric.dimensions}
- Group: ${rubric.group}

${kwResearch ? `KEYWORD RESEARCH:\n${kwResearch}` : ''}

EDITORIAL VOICE GUIDE:
${voiceGuide}

FORMATTING RULES (apply throughout — these are non-negotiable):
- H1: the article title — rendered by the CMS from the frontmatter title field; do NOT write an H1 in the article body
- H2: every major section heading (Intro excluded — it is plain prose)
- H3: self-assessment question headings, demo group headings, red flag sub-headings, FAQ question headings
- Never skip heading levels (no H3 without a parent H2)
- Use ### H3 heading for each self-assessment question in "Before You Talk to Any Vendor"
- Use ### H3 heading for each question group heading in "Questions to Ask During Demos"
- Use ### H3 heading for every Common Questions entry; prose answer in paragraph below
- Use markdown `-` bullet lists for Red Flags (both "Walk away if:" and "Proceed with caution if:")
- Use markdown `-` bullet lists for "After You Choose" action items
- Use **bold lead sentence** for each Red Flag item, followed by explanation prose
- Use markdown table for the Scoring Framework
- Include at least 2 current-year market context points (regulatory deadlines, enforcement dates, licensing milestones) where publicly verifiable

REQUIRED STRUCTURE (in this exact order):

1. **YAML FRONTMATTER** - all fields (type: satellite-buyers-guide)

2. **INTRO** (150-250 words)
   - Hook: the most common mistake buyers make in this category
   - What this guide covers: self-assessment, demo questions, scoring, red flags
   - Link to pillar: "For the full vendor comparison, see [pillar link]"

3. **FRAMEWORK AT A GLANCE** (markdown table — replaces a verdict capsule for this class)
   - Table: Section | What It Covers | When to Use It
   - 6 rows — one per framework section in this article
   - Purpose: lets a busy reader jump to the section most relevant to where they are in the process
   - Keep each cell to one short sentence

4. **BEFORE YOU TALK TO ANY VENDOR** (700-1,100 words)
   - 5-6 questions the buyer must answer about THEMSELVES before evaluating vendors
   - Use ### H3 heading for each question (not bold — proper heading)
   - Under each heading: why it matters, how the answer narrows the field
   - Be specific to this category (not generic "what's your budget")
   - Name specific vendors that each answer points toward or eliminates (with links)
   - Include at least one question about current regulatory environment or market timing

5. **QUESTIONS TO ASK DURING DEMOS** (700-1,100 words)
   - ### H3 for each topic group: Integration, Compliance, Operations, Commercial Terms, Infrastructure
   - 3-5 questions per group, formatted as `-` bullet list
   - Include at least 2 "trap" questions that reveal vendor weaknesses
   - After each trap question, add: "A good answer looks like: [X]. A red flag answer is: [Y]"

6. **SCORING FRAMEWORK** (350-500 words)
   - Markdown table: Dimension | Weight (1-5) | Vendor A | Vendor B | Vendor C
   - 8-10 dimensions from the category rubric
   - Rows use ___ as placeholder values
   - Below table: explain that weighting matters more than scores
   - Give 3 examples of different operator types and how they would weight differently (as `-` bullet list)

7. **RED FLAGS** (400-600 words)
   - ### H3: "Walk away if:"
   - Format as `-` bullet list: 5-7 absolute deal-breakers
   - Each item: **bold the deal-breaker** followed by 1-2 sentences explaining why it matters
   - ### H3: "Proceed with caution if:"
   - Format as `-` bullet list: 5-7 warning signs
   - Each item: **bold the signal** followed by 1-2 sentences on what to investigate

8. **AFTER YOU CHOOSE: PROTECT YOURSELF** (300-450 words)
   - Format as `-` bullet list: 3-4 contract negotiations that matter
   - Each item: **bold the negotiation point** (e.g., "Exit clause") followed by specific terms to demand
   - Be concrete: "maximum 90-day notice", "99.95% uptime with financial penalties per hour"

9. **COMMON QUESTIONS** (4-6 questions, NOT called "FAQ")
   - ### H3 heading for each question
   - Prose paragraph answer below each heading
   - Questions about the BUYING PROCESS, not about specific vendors
   - ${kwResearch ? 'Use questions from keyword research' : 'Use questions a first-time buyer would ask'}

10. **FOOTER**
    - Link to pillar for full vendor comparison
    - Link to directory category page
    - Independence statement

REQUIREMENTS:
- 3,500-5,000 words total
- Authoritative but helpful tone - guide the reader, don't lecture
- Name specific vendors as examples (linking to OnlyiGaming pages) but this is NOT a review
- At least 3 specific, actionable pieces of advice a buyer won't find elsewhere
- No em dashes or en dashes - regular hyphens only
- No banned words from the voice guide

Write the complete article now. Start with --- for the YAML frontmatter.
```

---

## CLASS 3: HEAD-TO-HEAD

**Covers:** "[Vendor A] vs [Vendor B]" comparison satellites
**Examples:** "EveryMatrix vs SOFTSWISS: Which Casino Platform?"
**Why unique:** Only two vendors compared in depth. Side-by-side format. "Who wins" verdict per dimension.

### Prompt Template

```
You are writing a HEAD-TO-HEAD comparison satellite article for OnlyiGaming.com.

ARTICLE CONTEXT:
- Title: "${vendorA} vs ${vendorB}: ${categoryTitle} Comparison"
- Category: ${categorySlug}
- Parent pillar: /guides/best-${categorySlug}-2026

This article serves buyers who have narrowed their shortlist to these two specific vendors. They want a direct, honest comparison - not a feature list. Every section must have a clear winner statement.

CATEGORY RUBRIC:
- Dimensions: ${rubric.dimensions}

${pillarContent ? `PILLAR CONTEXT (vendor profiles for both companies):\n${pillarContent}` : ''}

${kwResearch ? `KEYWORD RESEARCH:\n${kwResearch}` : ''}

EDITORIAL VOICE GUIDE:
${voiceGuide}

FORMATTING RULES (apply throughout — these are non-negotiable):
- H1: the article title — rendered by the CMS from the frontmatter title field; do NOT write an H1 in the article body
- H2: every major section heading (Intro excluded — it is plain prose)
- H3: vendor profile headings, sub-headings within dimension sections, FAQ question headings
- Never skip heading levels (no H3 without a parent H2)
- Use ### H3 for each vendor profile heading (vendor name linked)
- Use ### H3 for each question in Common Questions; prose answer below
- Use markdown table for the side-by-side comparison
- Use `>` blockquote for the Quick Verdict
- Use `-` bullet lists for "Choose X if:" and "Choose Y if:" scenarios
- Use **bold lead sentence** for deal-breaker and red flag items
- The "Winner:" statement at the end of each dimension section must be on its own line, bold

REQUIRED STRUCTURE (in this exact order):

1. **YAML FRONTMATTER** - all fields (type: satellite-head-to-head)

2. **INTRO** (200-300 words)
   - Why these two are commonly compared (what makes them natural alternatives)
   - Who should read this (what situation puts you between these two)
   - Link to pillar for the full market comparison

3. **QUICK VERDICT** (100-150 words, `>` blockquote)
   - "Choose [Vendor A] if [scenario]. Choose [Vendor B] if [scenario]. If [third scenario], read on."
   - No links (featured snippet extraction)

4. **SIDE-BY-SIDE TABLE**
   - Column 1: Dimension
   - Column 2: ${vendorA} (linked)
   - Column 3: ${vendorB} (linked)
   - Column 4: Winner
   - 8-10 rows covering key dimensions from the category rubric
   - "Winner" column: name the winner or "Depends" with a one-word qualifier in parentheses

5. **DIMENSION-BY-DIMENSION COMPARISON** (6-8 sections, H2 each, 350-500 words each)
   - Each section: one dimension from the rubric
   - Structure per section:
     - What ${vendorA} offers (specific facts, `-` bullet for 3+ items)
     - What ${vendorB} offers (specific facts, `-` bullet for 3+ items)
     - **Winner: [name]** - one sentence why (on its own line)
   - Be direct. "X wins this one" not "both have strengths"

6. **COMPANY PROFILES** (### H3 each, 400-600 words each)
   - ### H3: [Vendor name linked to OnlyiGaming directory page]
   - Under each profile, use `-` bullet list:
     - **Strengths:** [3-4 items]
     - **Weaknesses:** [2-3 items]
     - **Best for:** [operator type]
     - **Not for:** [who should look elsewhere]

7. **WHICH SHOULD YOU CHOOSE?** (300-450 words)
   - Two `-` bullet lists:
     - "Choose ${vendorA} if you..." (3-4 scenarios, each starting with a concrete condition)
     - "Choose ${vendorB} if you..." (3-4 scenarios)
   - "Consider neither if..." sub-section with 2-3 conditions where both are wrong and what to look for instead

8. **RED FLAGS TO WATCH FOR** (200-300 words)
   - `-` bullet list: 4-5 warning signs that apply when evaluating EITHER of these vendors
   - Focus on buying-process red flags: contract terms, migration complexity, support gaps
   - **Bold the red flag**, prose explanation after

9. **COMMON QUESTIONS** (4-6 questions, NOT called "FAQ")
   - ### H3 heading for each question
   - Prose paragraph answer below each heading
   - Questions about choosing between these two specifically
   - "Can I migrate from ${vendorA} to ${vendorB}?"
   - "Which is better for [common use case]?"

10. **FOOTER** - pillar link, directory links for both vendors, independence statement

REQUIREMENTS:
- 4,000-5,500 words total
- Every dimension comparison must declare a winner (or explain exactly why "depends")
- At least 3 genuinely opinionated statements
- Honest about weaknesses for both - not balanced for the sake of balance
- No em dashes or en dashes - regular hyphens only

Write the complete article now. Start with --- for the YAML frontmatter.
```

---

## CLASS 4: NEWCOMERS / RISING STARS

**Covers:** "[Category] to Watch: Rising Stars" satellites
**Examples:** "Casino Platforms to Watch: Rising Stars in 2026"
**Why unique:** Showcases companies beyond the dominant players. More exploratory tone. Companies may have less public information available.

### Prompt Template

```
You are writing a NEWCOMERS / RISING STARS satellite article for OnlyiGaming.com.

ARTICLE CONTEXT:
- Title: "${categoryTitle} to Watch: Rising Stars and Newcomers in 2026"
- Category: ${categorySlug}
- Parent pillar: /guides/best-${categorySlug}-2026

This article exists because the pillar focuses on established market leaders. Many operators want to discover smaller, newer, or differentiated vendors that the big comparison articles miss. This is OnlyiGaming's unique value - we have 1,400+ company listings and can showcase vendors nobody else covers.

CATEGORY RUBRIC:
- Dimensions: ${rubric.dimensions}

${kwResearch ? `KEYWORD RESEARCH:\n${kwResearch}` : ''}

EDITORIAL VOICE GUIDE:
${voiceGuide}

FORMATTING RULES (apply throughout — these are non-negotiable):
- H1: the article title — rendered by the CMS from the frontmatter title field; do NOT write an H1 in the article body
- H2: every major section heading (Intro excluded — it is plain prose)
- H3: company profile headings, FAQ question headings
- Never skip heading levels (no H3 without a parent H2)
- Use ### H3 for each company profile heading (company name linked)
- Use ### H3 for each question in Common Questions; prose answer below
- Use `-` bullet list for each company profile's key attributes
- Use markdown table for the comparison summary
- Use `-` bullet list for evaluation checklist items
- Use **bold lead sentence** for risk factors and red flags
- Every Risk Factor must name a specific, concrete concern (not generic "limited track record")

REQUIRED STRUCTURE (in this exact order):

1. **YAML FRONTMATTER** - all fields (type: satellite-newcomers)

2. **INTRO** (200-300 words)
   - Why looking beyond the big names matters (differentiation, pricing, specialization)
   - What qualifies a company for this list (criteria: founded recently, entering new markets, unique approach, underserved niche)
   - Link to pillar for established vendors

3. **WHAT MAKES A "RISING STAR"** (200-300 words)
   - Define the criteria clearly as `-` bullet list
   - Not just new - could be established in one market and expanding
   - Distinguish from "risky startup" - these are credible companies with verifiable proof points

4. **COMPANIES AT A GLANCE** (markdown table — the summary before the detailed profiles)
   - Table: Company | Focus Area | Why Interesting | Risk Level (Low/Med/High) | Best For
   - Include all companies that will be profiled
   - This lets skimmers identify 1-2 companies to read in depth and skip the rest

5. **COMPANY PROFILES** (### H3 each, 8-12 companies, 250-400 words each)
   - ### H3: "[Company Name]" (linked to OnlyiGaming directory page): [One-Line Hook]
   - `-` bullet list per profile:
     - **What they do:** [product/service in one sentence]
     - **Why they're interesting:** [specific differentiator — not "innovative approach"]
     - **Track record:** [clients, certifications, market presence — be specific]
     - **Risk factor:** [concrete concern: missing certification, single-market focus, limited client base]
     - **Best for:** [operator type and why]
   - Prioritize companies from the OnlyiGaming directory NOT featured in the pillar

6. **HOW TO EVALUATE A NEWCOMER** (300-450 words)
   - Numbered checklist (`1.`, `2.`...) of due diligence steps before committing
   - Include: client reference check, certification status, financial stability signals, exit terms, pilot program availability
   - "Start with a pilot, not a full contract" as the closing recommendation

7. **RED FLAGS WHEN WORKING WITH NEWCOMERS** (200-300 words)
   - `-` bullet list: 4-5 warning signs that a company is not ready for production deployment
   - **Bold each red flag**, prose explanation after
   - Examples: no client references willing to speak publicly, no sandbox/test environment, pricing that seems too low (subsidized to acquire), founders without iGaming background

8. **COMMON QUESTIONS** (3-4 questions, NOT called "FAQ")
   - ### H3 heading for each question
   - Prose paragraph answer below each heading
   - "Is it risky to choose a smaller vendor?"
   - "How do I evaluate a company with limited public track record?"

9. **FOOTER** - pillar link, directory category page link, independence statement

REQUIREMENTS:
- 3,500-5,000 words total
- Tone: exploratory and fair, not promotional
- Be honest about risks - "rising star" does not mean "guaranteed success"
- Every company gets both a reason to consider AND a specific risk factor
- No em dashes or en dashes - regular hyphens only

Write the complete article now. Start with --- for the YAML frontmatter.
```

---

## CLASS 5: CHALLENGES

**Covers:** "Common Challenges in [Category] and Who Solves Them" satellites
**Examples:** "Common Challenges in Casino Platform Selection and Who Solves Them"
**Why unique:** REVERSE of the pillar. Pillar: company showcases product. Challenges: problem finds company. Structured around problems, not vendors.

### Prompt Template

```
You are writing a CHALLENGES satellite article for OnlyiGaming.com.

ARTICLE CONTEXT:
- Title: "Common Challenges in ${categoryTitle} and Who Solves Them"
- Category: ${categorySlug}
- Parent pillar: /guides/best-${categorySlug}-2026

CRITICAL STRUCTURAL DIFFERENCE: This article is the REVERSE of the pillar.
- Pillar says: "Here are 12 companies. Each one does X."
- This article says: "Here are 7 problems operators face. For each problem, here is which company solves it best."

The same companies appear, but organized around PROBLEMS, not products. A buyer searching "casino platform integration challenges" has different intent than "best casino platforms." This article captures them.

CATEGORY RUBRIC:
- Dimensions: ${rubric.dimensions}

${pillarContent ? `PILLAR CONTEXT (use these vendors as solutions):\n${pillarContent}` : ''}

${kwResearch ? `KEYWORD RESEARCH:\n${kwResearch}` : ''}

EDITORIAL VOICE GUIDE:
${voiceGuide}

FORMATTING RULES (apply throughout — these are non-negotiable):
- H1: the article title — rendered by the CMS from the frontmatter title field; do NOT write an H1 in the article body
- H2: each challenge section heading (format: "Challenge: [Problem Statement]")
- H3: sub-headings within each H2 challenge (Why it matters / What to look for / Who solves it best / Watch out for), plus FAQ question headings
- Never skip heading levels (no H3 without a parent H2)
- Use ### H3 for "Why it matters", "What to look for", "Who solves it best", "Watch out for" sub-headings within each challenge section
- Use `-` bullet lists for "What to look for", "Who solves it best", and "Watch out for" items
- Use **bold vendor name** when naming a solution provider in a bullet item
- Use markdown table for the Challenge Overview and the Mapping summary
- Use ### H3 for each question in Common Questions; prose answer below
- "Watch out for" items must each name a specific vendor claim or behavior to be skeptical of

REQUIRED STRUCTURE (in this exact order):

1. **YAML FRONTMATTER** - all fields (type: satellite-challenges)

2. **INTRO** (200-300 words)
   - Acknowledge the challenges are real and common
   - Frame: this article maps problems to solutions, not the other way around
   - Link to pillar for full vendor comparison

3. **CHALLENGE OVERVIEW TABLE**
   - Challenge | Business Impact | Primary Vendor(s) | Difficulty to Solve
   - 6-8 rows summarizing all challenges covered
   - Vendor names linked to OnlyiGaming pages

4. **CHALLENGE SECTIONS** (6-8 sections, H2 each, 400-600 words each)
   Each challenge section follows this exact structure:
   - **H2: "Challenge: [Problem Statement]"**
   - ### H3: "Why it matters"
     - 2-3 sentences on business impact (revenue, compliance, speed)
   - ### H3: "What to look for"
     - `-` bullet list: 3-5 criteria that solve this problem
   - ### H3: "Who solves it best"
     - `-` bullet list: 2-4 vendors with **bold name** and specific explanation of HOW they address it
   - ### H3: "Watch out for"
     - `-` bullet list: 2-3 vendor claims or behaviors that sound good but don't hold up in practice
     - Be specific: name the pattern ("vendors who claim X but..."), not a generic warning

   Example challenges for casino-platforms:
   - Multi-market compliance complexity
   - Integration time exceeding projections
   - Hidden costs in revenue-share models
   - Vendor lock-in and data portability
   - Scaling from startup to enterprise
   - Crypto support that actually works in practice
   - Speed to market pressure

5. **MAPPING: CHALLENGES TO VENDORS** (300-450 words)
   - Markdown table: Challenge | Best Vendor | Runner-Up | Who It's Wrong For
   - Summary paragraph: "If your biggest challenge is X, start with [Vendor]"
   - "If you face multiple challenges simultaneously, [Vendor] covers the broadest ground"

6. **RED FLAGS IN VENDOR CONVERSATIONS** (200-300 words)
   - `-` bullet list: 4-5 warning signs that a vendor is not honestly addressing your challenge
   - **Bold each red flag**, prose explanation after
   - Focus on sales-process signals: vague timelines, deflecting technical questions, no reference clients for your specific challenge

7. **COMMON QUESTIONS** (4-6 questions, NOT called "FAQ")
   - ### H3 heading for each question
   - Prose paragraph answer below each heading
   - Problem-focused: "How long does integration really take?", "What are the hidden costs?"
   - ${kwResearch ? 'Use questions from keyword research' : 'Use questions that operators facing these challenges would search for'}

8. **FOOTER** - pillar link, directory link, independence statement

REQUIREMENTS:
- 3,500-5,000 words total
- Problem-first, always. The challenge headline comes before any vendor mention
- At least 2 "watch out for" items per challenge
- Vendors as solutions, not as profiles - this is NOT a review article
- Same companies can appear across multiple challenges
- No em dashes or en dashes - regular hyphens only

Write the complete article now. Start with --- for the YAML frontmatter.
```

---

## CLASS 6: EDUCATIONAL

**Covers:** Glossary/Terminology AND Trends satellites
**Examples:** "Casino Platform Terminology Explained", "Casino Platform Trends to Watch in 2027"

These share a structure: informational content that supports the comparison articles. Not vendor-focused. Two sub-templates.

### Sub-Template A: GLOSSARY

```
You are writing a GLOSSARY / TERMINOLOGY satellite article for OnlyiGaming.com.

ARTICLE CONTEXT:
- Title: "${categoryTitle} Terminology Explained: A Glossary for Operators"
- Category: ${categorySlug}
- Parent pillar: /guides/best-${categorySlug}-2026

This article explains the specialized terms buyers encounter when evaluating this category. It targets operators who are new to this category or non-technical decision-makers who need to understand what vendors are talking about.

CATEGORY RUBRIC:
- Dimensions: ${rubric.dimensions}

${kwResearch ? `KEYWORD RESEARCH:\n${kwResearch}` : ''}

EDITORIAL VOICE GUIDE:
${voiceGuide}

FORMATTING RULES (apply throughout — these are non-negotiable):
- H1: the article title — rendered by the CMS from the frontmatter title field; do NOT write an H1 in the article body
- H2: topic group headings if grouping terms (e.g., "Integration Terms", "Compliance Terms"); omit if alphabetical
- H3: every individual term heading, FAQ question headings
- Never skip heading levels (no H3 without a parent H2 when grouping is used)
- Use ### H3 for every term heading
- Use markdown table for the Quick Reference section
- Use `-` bullet list for "Commonly confused with" comparisons within a term entry
- Use **bold** for the first mention of a term that has its own entry elsewhere in the glossary
- Use ### H3 for each question in Common Questions; prose answer below
- Plain language throughout — a non-technical CEO must understand every definition

REQUIRED STRUCTURE:

1. **YAML FRONTMATTER** (type: satellite-glossary)

2. **INTRO** (150-200 words)
   - Who this is for (non-technical buyers, new market entrants)
   - How to use this glossary (skim the quick reference, dive into terms you encounter in demos)
   - Link to pillar and buyer's guide

3. **QUICK REFERENCE TABLE** (8-12 most common terms)
   - Term | Plain Definition (one sentence) | Why It Matters in Vendor Evaluation
   - Use the most frequently encountered terms in demos and RFPs for this category

4. **TERMS** (### H3 each, 15-25 terms, 100-180 words each)
   - Alphabetical or grouped by topic (choose whichever reads better)
   - Each term:
     - ### H3: [Term]
     - Plain-language definition (no jargon to explain jargon)
     - Why it matters to an operator evaluating vendors
     - Example: how this shows up in vendor comparisons or contracts
     - If a term relates to a specific vendor strength, mention the vendor with directory link
     - "Commonly confused with: [other term]" as a `-` bullet where relevant

5. **COMMON QUESTIONS** (3-4 questions, NOT called "FAQ")
   - ### H3 heading for each question
   - Prose paragraph answer below each heading
   - "What is the difference between [Term A] and [Term B]?"

6. **FOOTER** - pillar link, buyer's guide link, directory link

REQUIREMENTS:
- 2,500-3,500 words total
- Plain language - a non-technical CEO should understand every definition
- Link vendor names to OnlyiGaming directory pages where relevant
- No em dashes or en dashes - regular hyphens only

Write the complete article now. Start with --- for the YAML frontmatter.
```

### Sub-Template B: TRENDS

```
You are writing a TRENDS satellite article for OnlyiGaming.com.

ARTICLE CONTEXT:
- Title: "${categoryTitle} Trends to Watch in ${trendYear}"
- Category: ${categorySlug}
- Parent pillar: /guides/best-${categorySlug}-2026

This article covers genuine industry trends - not hype. Each trend must be verifiable from public sources (conference agendas, industry reports, vendor announcements, regulatory changes).

THIN-CONTENT GATE: If you cannot identify at least 5 distinct, verifiable trends with real evidence, output a short note saying "Insufficient trend data for this category" instead of writing a thin article.

CATEGORY RUBRIC:
- Dimensions: ${rubric.dimensions}

${kwResearch ? `KEYWORD RESEARCH:\n${kwResearch}` : ''}

EDITORIAL VOICE GUIDE:
${voiceGuide}

FORMATTING RULES (apply throughout — these are non-negotiable):
- H1: the article title — rendered by the CMS from the frontmatter title field; do NOT write an H1 in the article body
- H2: each trend section heading
- H3: sub-headings within each H2 trend (What's happening / Why it matters / Who's ahead / What to do now), plus FAQ question headings
- Never skip heading levels (no H3 without a parent H2)
- Use ### H3 for "What's happening", "Why it matters", "Who's ahead", "What to do now" within each trend section
- Use `-` bullet list for "Who's ahead" vendor items and "What to do now" actions
- Use markdown table for the Trend Timeline Overview
- Use **bold vendor name** when naming a leader for a trend
- Use ### H3 for each question in Common Questions; prose answer below

REQUIRED STRUCTURE:

1. **YAML FRONTMATTER** (type: satellite-trends)

2. **INTRO** (150-250 words)
   - Set context: what is changing in this category and why operators should care now
   - Link to pillar for current vendor comparison

3. **TREND TIMELINE OVERVIEW TABLE**
   - Trend | Status | Urgency for Operators | Key Vendors Ahead
   - Include all trends covered in the article
   - Status options: Emerging / Accelerating / Mainstream / Regulatory-driven

4. **TREND SECTIONS** (5-8 trends, H2 each, 350-500 words each)
   Each trend follows this exact structure:
   - **H2: "[Trend Name]"**
   - ### H3: "What's happening"
     - Specific, verifiable facts (source type noted: "per [conference/report/announcement]")
   - ### H3: "Why it matters to operators"
     - Business impact: revenue, compliance, competitive risk
   - ### H3: "Who's ahead"
     - `-` bullet list: vendors leading this trend with **bold name** and specific evidence
   - ### H3: "What to do now"
     - `-` bullet list: 2-3 concrete operator actions (immediate vs 12-18 month horizon)

5. **WHAT THIS MEANS FOR YOUR VENDOR SELECTION** (300-450 words)
   - How these trends should influence buying decisions today
   - Table: Trend | Short-Term Impact | Vendor Question to Ask

6. **COMMON QUESTIONS** (3-4 questions, NOT called "FAQ")
   - ### H3 heading for each question
   - Prose paragraph answer below each heading
   - Forward-looking questions operators ask

7. **FOOTER** - pillar link, directory link, independence statement

REQUIREMENTS:
- 3,000-4,000 words total
- Every trend must be supportable by public evidence (Gemini will fact-check this)
- "Trend" means directional change with evidence, not "thing that exists"
- Name vendors leading each trend with directory links
- No em dashes or en dashes - regular hyphens only

Write the complete article now. Start with --- for the YAML frontmatter.
```

---

## CLASS 7: PRICING

**Covers:** "[Category] Pricing Comparison" satellites
**Only produce if:** Public pricing data exists for at least 4-5 vendors in the category
**Examples:** "Casino Platform Pricing: What It Actually Costs in 2026"

### Prompt Template

```
You are writing a PRICING COMPARISON satellite article for OnlyiGaming.com.

ARTICLE CONTEXT:
- Title: "${categoryTitle} Pricing: What It Actually Costs in ${year}"
- Category: ${categorySlug}
- Parent pillar: /guides/best-${categorySlug}-2026

CRITICAL HONESTY RULE: Only state pricing that is publicly confirmed. For vendors without public pricing, say "Pricing not publicly disclosed - contact vendor." Do NOT guess, estimate, or state "industry standard" pricing as if it were confirmed.

CATEGORY RUBRIC:
- Dimensions: ${rubric.dimensions}

${kwResearch ? `KEYWORD RESEARCH:\n${kwResearch}` : ''}

EDITORIAL VOICE GUIDE:
${voiceGuide}

FORMATTING RULES (apply throughout — these are non-negotiable):
- H1: the article title — rendered by the CMS from the frontmatter title field; do NOT write an H1 in the article body
- H2: every major section heading (Intro excluded — it is plain prose)
- H3: pricing model headings, sub-headings within H2 sections, FAQ question headings
- Never skip heading levels (no H3 without a parent H2)
- Use markdown table for both the Vendor Pricing Table and TCO scenarios
- Use `-` bullet list for Hidden Cost items, grouped by cost type
- Use `-` bullet list for red flags in pricing conversations
- Use **bold** for each hidden cost category heading within the bullet list
- Use ### H3 for "Pros" and "Cons" within each pricing model explanation
- Use ### H3 for each question in Common Questions; prose answer below

REQUIRED STRUCTURE:

1. **YAML FRONTMATTER** (type: satellite-pricing)

2. **INTRO** (200-300 words)
   - The problem: pricing in this category is opaque and comparison is hard
   - What this article covers: publicly available pricing, commercial model types, hidden costs
   - Link to pillar for full vendor comparison

3. **PRICING AT A GLANCE** (markdown table — the summary before the analysis)
   - Table: Vendor | Model | Price Transparency | Estimated Year 1 Range | Best For
   - Include all vendors covered in this article
   - Use "Not disclosed" for unverified pricing — this table previews the full analysis below
   - One sentence below the table: "The total cost of ownership is typically 2-3x the headline license fee."

4. **PRICING MODELS EXPLAINED** (400-600 words)
   - Common models in this category (revenue share, license fee, hybrid, per-transaction, etc.)
   - For each model, use ### H3 heading then `-` bullet list with:
     - ### H3: [Model Name]
     - **Pros:** `-` bullet list
     - **Cons:** `-` bullet list
     - **Best for:** operator type and scale
   - Which model favors which operator type

5. **VENDOR PRICING TABLE**
   - Vendor (linked) | Model | Public Price | Setup Fees | Notes
   - ONLY include publicly confirmed data
   - "Not disclosed" for anything unverified
   - Add a "Pricing Transparency" column: High / Medium / Low based on what's publicly available

6. **HIDDEN COST ANALYSIS** (600-900 words)
   - `-` bullet list grouped by cost category:
     - **Implementation and onboarding:** [typical range and what drives variation]
     - **Data migration:** [what's usually charged vs included]
     - **Training and support tiers:** [premium support costs]
     - **Content surcharges:** [if applicable to category]
     - **Exit and migration costs:** [what it costs to leave]
     - **Currency/FX markups:** [if applicable]
   - Close with: "The true cost is rarely what's in the headline price"

7. **TOTAL COST OF OWNERSHIP FRAMEWORK** (400-600 words)
   - Formula: License + Implementation + Hidden Costs + Opportunity Cost (time to value)
   - Markdown table showing 3 operator scenarios:
     - Scenario | Annual GGR | Est. Platform Cost | Hidden Cost Estimate | Total Year 1
   - Be clear these are illustrative, not guaranteed

8. **RED FLAGS IN PRICING CONVERSATIONS** (200-300 words)
   - `-` bullet list: 4-5 warning signs during vendor pricing discussions
   - **Bold each red flag**, prose explanation after
   - Examples: bundled pricing that obscures per-unit costs, "custom pricing" with no ballpark, costs that only appear after contract signing, minimum GGR commitments buried in terms

9. **COMMON QUESTIONS** (4-6 questions, NOT called "FAQ")
   - ### H3 heading for each question
   - Prose paragraph answer below each heading
   - "Why won't vendors publish pricing?", "How do I compare revenue share vs license fee at scale?"

10. **FOOTER** - pillar link, directory link, independence statement

REQUIREMENTS:
- 3,500-5,000 words total
- NEVER state unverified pricing as fact
- The value is in the hidden cost analysis and TCO framework, not the price table
- Name specific vendors with directory links
- No em dashes or en dashes - regular hyphens only

Write the complete article now. Start with --- for the YAML frontmatter.
```

---

## PROFILES

Profiles are data objects interpolated into the BEST-FOR template's `${profile.X}` slots. Each profile is selected by `detectNicheProfile()` in `reviewArticlesRoutes.ts` at draft time based on slug/title patterns. Detection order: crypto-operators → emerging-markets → operator-size → regulated-markets → generic-use-case (catch-all).

The category rubric provides category-specific dimensions. Profiles provide angle-specific emphasis. These are separate concerns — both flow into the prompt at draft time.

### PROFILE: crypto-operators

**Matches:** slugs/titles containing "crypto", "cryptocurrency", "bitcoin", "stablecoin"

**Subtype buyer concerns:**
- Native crypto operations vs bolt-on cashier (matters for fraud, settlement speed, on-chain receipts)
- Coin breadth — BTC/ETH/USDT plus altcoins; relevance varies by player geography
- Hybrid fiat-crypto cashier quality (concurrent flows without conversion delays)
- Wallet management — custodial vs non-custodial, hot wallet exposure, withdrawal speed
- Settlement speed and on-chain finality vs internal ledger reconciliation
- Regulatory posture, especially Brazil's 2026 crypto gambling ban for licensed operators (this disqualifies hybrid crypto for Brazil licensees — a category-defining constraint)
- KYC complexity when crypto deposits arrive from mixers, exchanges, or non-custodial wallets
- FX markup on coin-to-fiat conversion — often hidden in spread, not in stated fee

**Expected vendor cohort:**
Crypto-native platforms (SOFTSWISS leads), turnkey crypto operations (GR8 Tech), hybrid platforms with native crypto modules (EveryMatrix, BetConstruct), bolt-on crypto payment processors layered on traditional platforms (NOWPayments, CoinsPaid). Slotegrator and BlueOcean Gaming offer crypto via bolt-on. Pure-fiat-only vendors (Playtech, traditional white-label providers) excluded from the comparison table.

**What to verify:**
- Request a live on-chain crypto withdrawal demo (not a sandbox transaction) — settlement time, network fee handling, confirmation count
- Get the published list of supported coins and the date each was added (signals platform investment vs marketing claim)
- Ask for the FX spread on the top 3 coins for fiat conversion — get it in writing, not "competitive rates"
- For licensed operators: confirm jurisdiction allowlist for crypto operations. Brazil under 2026 framework prohibits crypto gambling for licensed operators — vendor must demonstrate geo-fencing or alternative product for that market
- Verify KYC flow on crypto deposits with provable evidence — show a deposit from an exchange hot wallet, a non-custodial wallet, and a mixer to see how each is handled

**Trap questions:**
- "Can you show us a live on-chain crypto withdrawal that settles without manual approval?" — A demo with manual approval steps reveals a bolt-on, not native crypto
- "What happens to our crypto product if Brazil enforces its 2026 ban tomorrow? Can you geo-fence by jurisdiction at the platform level, not just by player KYC?"
- "Which coins on your supported list have FX markup over 1%? What's the spread on BTC, ETH, and USDT today?"
- "Show us your three largest crypto operators by deposit volume. What was their crypto deposit growth in 2025?"
- "If we replace your crypto cashier with a third-party processor, what reconciliation features do we lose?"

**Section name hints:**
- Native Crypto vs Bolt-On Cashier
- Coin Breadth and Geographic Relevance
- Hybrid Fiat-Crypto Operations
- Regulatory Position and Geo-Fencing
- Settlement Speed and FX Economics

---

### PROFILE: emerging-markets

**Matches:** slugs/titles containing "emerging markets", "latam", "africa", "asia", "developing markets"

**Subtype buyer concerns:**
- Local payment method coverage (PIX in Brazil, M-Pesa in Kenya, OXXO in Mexico, UPI in India, Boleto in LatAm)
- Low banking penetration — alternative payment rails (vouchers, mobile money, agent networks)
- Mobile-first UX with low-bandwidth performance optimization
- Currency volatility and conversion exposure (operators absorbing FX risk or passing to players)
- Regulatory uncertainty — markets where licensing frameworks are mid-formation
- Local language and cultural adaptation (Portuguese for Brazil, Spanish variants for LatAm)
- Local customer support during local business hours

**Expected vendor cohort:**
Regional specialists (Salsa Technology, Atlaslive for LatAm; regional providers for Africa and Asia), turnkey platforms with documented local PSP integrations, mobile-first platforms with low-bandwidth modes. Generic European platforms without local PSP relationships should appear only as cautionary inclusions or not at all.

**What to verify:**
- Get the published list of integrated local PSPs per target market — with onboarding date for each (signals active investment vs marketing)
- Request named operator references in your target market — operators live, not "in pilot" or "in planning"
- Confirm regulatory engagement plan: is the vendor in conversation with the local regulator, or operating gray?
- Verify currency hedging or settlement options that protect the operator from local FX moves
- Test mobile load time on 3G — most platforms quote 4G or wifi; emerging markets often run on 3G

**Trap questions:**
- "Show us your live operator in [target country]. How long have they been live? What was their first-month transaction volume by payment method?"
- "Which local PSPs have you onboarded in the last 12 months? Which are 'in progress' but not yet live?"
- "What's your regulatory engagement status with [local regulator]? Can you put us in touch with their compliance team?"
- "How do you handle currency conversion when [local currency] moves 5% in a week — does the operator absorb that or do you?"
- "Show us your mobile site load time on a throttled 3G connection from [target country] — not from your data center"

**Section name hints:**
- Local Payment Method Coverage
- Regulatory Track Record in the Region
- Mobile-First Performance and Low-Bandwidth Modes
- Currency and Settlement Risk
- Local Operator References

---

### PROFILE: operator-size

**Matches:** slugs/titles containing "startup", "small operator", "mid-market", "enterprise", "growing operator", "large operator"

**Subtype buyer concerns:**
- Tier-appropriate pricing (revenue share vs license fee thresholds where each model becomes favorable)
- Complexity-vs-simplicity trade-off (turnkey for startup, modular for enterprise)
- Growth headroom — does the platform scale 10x without replatforming
- Contract minimums and exit terms (startups need flexibility; enterprises need stability)
- Support tier definitions (dedicated account manager vs ticketed support)
- Customization depth (white-label simplicity vs API-first composability)

**Expected vendor cohort:**
For startup or small: turnkey providers (NuxGame, BlueOcean Gaming, GR8 Tech). For mid-market: modular platforms (EveryMatrix, SOFTSWISS, Soft2Bet). For enterprise: regulatory-heavy and API-first (Playtech, Pragmatic Solutions, BetConstruct). The article should cover the relevant tier explicitly and acknowledge boundaries to adjacent tiers.

**What to verify:**
- Get the published revenue thresholds where the commercial model breaks down (revenue share becomes expensive above $X GGR; license fee becomes inefficient below $Y GGR)
- Request contract minimum duration and exit cost (12 vs 24 vs 36 months matters at startup scale)
- Confirm what's included in "support" at your tier — response SLA in hours, dedicated account manager yes/no, escalation path
- Verify three named client references at your operator tier — not "we work with operators of all sizes"
- Get the migration path documentation if you outgrow this tier (most turnkeys make leaving expensive)

**Trap questions:**
- "At what GGR level does your model become unfavorable for us? Show us the spreadsheet"
- "Show us three live clients at our exact tier — same monthly GGR range, same vertical, same regulatory footprint"
- "What's the exit cost if we leave after 18 months? Quote it as a percentage of remaining contract value"
- "What support tier matches our scale, and what's the response SLA in actual hours, not 'best effort'?"
- "Can we see your standard contract before NDA signing, or only after?"

**Section name hints:**
- Pricing Model at This Operator Scale
- Operational Complexity and Team Requirements
- Support Tier and Service Levels
- Migration Path and Exit Economics
- Contract Minimums and Flexibility

---

### PROFILE: regulated-markets

**Matches:** slugs/titles containing "regulated markets", "multi-jurisdiction", "licensed operators", "MGA", "UKGC", "Spelinspektionen", "ARJEL"

**Subtype buyer concerns:**
- License portfolio depth (number of jurisdictions, not just license count — concentrated holdings in 2-3 markets vs broad coverage matter differently)
- Compliance reporting depth — automated regulator submissions vs manual extracts
- Jurisdiction-specific responsible gaming toolkit (UK self-exclusion, German deposit limits, Swedish Spelpaus integration)
- Audit trail integrity and tamper resistance
- RGS (random number generator) certification status per game per market
- Regulator references — vendor has positive relationship with key regulators, not just licenses held

**Expected vendor cohort:**
Enterprise platforms with deep license portfolios (Playtech, EveryMatrix, SOFTSWISS, BetConstruct). Specialized compliance providers may appear as adjacencies. Lighter-touch white-label providers excluded from the comparison unless they explicitly target regulated markets.

**What to verify:**
- Get specific license numbers and renewal dates per target market (not just "MGA-licensed" — get the actual MGA license number)
- Request the last regulatory audit findings — every regulated provider has audits, those with nothing to share are hiding
- Confirm the platform's RGS certifications per game catalog per target market (gaps mean games can't go live)
- Get named regulator references — vendor's compliance lead should be able to put you in touch with regulator contacts
- Verify the responsible gaming toolkit's depth per market (UK requires different RG tools than Sweden or Germany)

**Trap questions:**
- "Provide the license number for [target market] and its renewal date. What's your renewal track record over the last 5 years?"
- "Show us the findings from your last regulatory audit in [target market]. What was remediated, what is still open?"
- "How many of your games have current RGS certification for [target market]? What's the gap between your catalog and what we can launch?"
- "Put us in touch with your compliance lead at [regulator]. We want a regulator reference, not just a license certificate"
- "When [target market] updates RG requirements (e.g. new deposit limits), how long from regulator publication to your platform supporting them?"

**Section name hints:**
- License Portfolio and Renewal Track Record
- Compliance Reporting and Audit Trail
- Responsible Gaming Toolkit by Jurisdiction
- Regulator References and Engagement
- RGS Certification Coverage

---

### PROFILE: generic-use-case

**Matches:** any "Best X for Y" article not matching the profiles above (catch-all fallback)

**Subtype buyer concerns:**
- Budget fit — does the vendor's commercial model match the operator's economics
- Integration timeline and team requirements — what does "live in 8 weeks" actually exclude
- Scalability — does the platform handle the operator's projected growth without replatforming
- Support quality — response times, escalation paths, named account manager vs ticketed
- Contract terms — minimums, exit costs, data portability, IP ownership
- Reference quality — named live clients in similar situations, not anonymized case studies

**Expected vendor cohort:**
Determined by the angle keyword extracted from the article title. The article should curate 6-10 vendors from the pillar article that genuinely match the angle, plus 3-5 runners-up from the broader OnlyiGaming directory. Avoid generic vendor inclusion — every vendor in the table needs a reason tied to the angle.

**What to verify:**
- Three named live clients in a situation similar to yours — same scale, same vertical, same regulatory environment. "Anonymous case study" is a red flag
- Contract minimums and exit terms in writing before NDA — vendors who only share contracts after NDA often hide unfavorable terms
- Performance SLAs with financial penalties (uptime guarantees without penalties are marketing claims)
- The vendor's roadmap commitments relevant to the angle — what's promised in 12-24 months that affects this article's buyer
- Data portability — what data you can export and in what format if you leave

**Trap questions:**
- "Show us three live clients matching our profile: scale, vertical, regulatory environment. Not slides, not testimonials — live operations"
- "What's the fastest path from POC to production for an operator at our scale? Walk us through the timeline week by week"
- "Show us a production uptime report from the last 90 days — not the published SLA, the actual data"
- "If we leave in 18 months, what data can we export, in what format, and what does the export cost?"
- "What's on your roadmap for the next 12 months that's directly relevant to our use case? Show us the public commitment, not the pitch deck"

**Section name hints:**
- Use Case Fit and Vendor Cohort
- Implementation Reality and Timeline
- Support Model and SLAs
- Contract Terms and Exit Economics
- Reference Clients and Track Record

---
