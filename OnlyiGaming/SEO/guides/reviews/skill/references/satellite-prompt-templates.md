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

GLOBAL EDITORIAL RULES (apply everywhere — non-negotiable):

G1. **Operator consequence**: every feature, spec, or capability you describe must be paired with its operator consequence (revenue, compliance posture, launch timeline, retention, cost, or migration risk). A feature with no stated consequence is cut from the article. "X has feature Y" alone is not acceptable; "X has feature Y, which means Z for the operator" is.

G2. **Proprietary product naming**: when discussing a vendor capability, name the actual product or module — CasinoEngine, PaymentIQ, BonusEngine, OddsMatrix, MEGA, Spring Platform — not generic descriptors like "their gamification engine" or "their platform." If you cannot verify the product name, flag the uncertainty ("reported as MEGA") rather than asserting it. Generic "their platform supports X" without a product name is a failure.

G3. **Negative definition**: state explicitly what this article is NOT for. Set expectations up front so the wrong reader self-selects out.

G4. **Concrete next step in footer**: the footer must include one concrete reader action (e.g. "request a sandbox demo with three reference operators in your target market") in addition to the independence statement.

G5. **Category macro-thread**: thread the category's defining themes through multiple sections. For casino-platforms specifically — Brazil's Law 14.790/2023 framework (and its prohibition of crypto for licensed operators), the 4-6 week vendor-promised vs 12-16 week operator-reported integration reality, and the revenue-share-at-scale trap. Pull macro-themes from the category brief; do not invent.

G6. **Verification instruments, not asserted numbers**: when technical depth requires specifics (concurrency, latency, uptime, integration speed), express it as a verification instrument — "ask the vendor for X," "time this in the demo," "request the most recent 90-day uptime report" — never as an asserted unsourced number. If you have a sourced number, attribute it. If you don't, convert it to an instrument.

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

EVERGREEN MANDATE (critical — this article ages slowly and must avoid date drift):
- Structural regulatory context is allowed and encouraged: "Brazil's licensed-operator framework exists," "the UK affordability regime applies," "Germany's deposit caps shape the buying calculus." These statements stay valid for 12+ months.
- Forbidden: dated awards, quarter-specific product launches, current license counts, enforcement dates, this-year company-specific milestones. The pillar is where current vendor data lives — this article points readers to the pillar for that.
- When in doubt: write the sentence so it would still read accurately 18 months from now.
- Reinforce the bridge to pillar: "For the up-to-date vendor comparison and current license/proof points, see the pillar."
- YAML frontmatter `last_verified` should reflect the actual verification date; do not freeze it at draft time.

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
   - At least one question must address the buyer's regulatory posture (which markets they target, which licenses they hold) — phrased so the question stays valid as licensing landscapes evolve. Do NOT cite current dated enforcement events.

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

GLOBAL EDITORIAL RULES (apply everywhere — non-negotiable):

G1. **Operator consequence**: every feature, spec, or capability you describe must be paired with its operator consequence (revenue, compliance posture, launch timeline, retention, cost, or migration risk). A feature with no stated consequence is cut.

G2. **Proprietary product naming**: when discussing a vendor capability, name the actual product or module (CasinoEngine, PaymentIQ, BonusEngine, OddsMatrix, MEGA, Spring Platform) — not generic descriptors. Flag uncertainty rather than asserting an unverified name.

G3. **Negative definition**: state explicitly what this article is NOT for, beyond the existing "this is NOT a vendor review." Set expectations up front.

G4. **Concrete next step in footer**: include one concrete reader action in the footer in addition to the independence statement.

G5. **Category macro-thread**: thread the category's defining macro-themes through the framework. For casino-platforms — Brazil's Law 14.790/2023, the 4-6 week vs 12-16 week integration reality, the rev-share-at-scale trap. Pull from the category brief; do not invent.

G6. **Verification instruments, not asserted numbers**: technical specifics (concurrency, latency, uptime, integration speed) are expressed as instruments ("ask the vendor for X," "time this in the demo," "request the 90-day uptime report") not as asserted unsourced numbers.

REQUIREMENTS:
- 3,000-4,500 words total (framework articles naturally cap tighter than vendor-comparison articles — actionable concision beats padding)
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
   - "Choose [Vendor A] if [scenario]. Choose [Vendor B] if [scenario]. Consider neither if [scenario] — look at [alternative vendor or category]."
   - The third element must be a redirect (avoid both, look elsewhere) aligning with the "Consider neither if..." section below — not a "read on" hook.
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
   - One of the dimensions MUST be **Regulatory cross-check** — addresses the category's macro-regulatory theme (per G5) for BOTH vendors and explicitly flags when a vendor's headline strength inverts under a macro-ban or regime constraint (e.g. SOFTSWISS's crypto strength becomes a liability for Brazil-licensed operators because Law 14.790/2023 prohibits crypto for licensed operators).
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
   - **Operator-type recommendation matrix** (markdown table):
     - Columns: Operator Type | Recommendation | Why
     - Rows: Startup operator | Crypto-first operator | Regulated-market operator | Sportsbook-first operator | Operator with strong technical team | Non-technical founder | Multi-market operator
     - Each "Recommendation" cell: ${vendorA}, ${vendorB}, "Consider neither," or "Either, with caveats" — and the "Why" cell explains in one sentence

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

GLOBAL EDITORIAL RULES (apply everywhere — non-negotiable):

G1. **Operator consequence**: every feature or spec paired with its operator consequence (revenue, compliance, launch timeline, retention, cost, migration risk). Feature without consequence is cut.

G2. **Proprietary product naming**: name the actual products/modules (CasinoEngine, PaymentIQ, BonusEngine, OddsMatrix, MEGA, Spring Platform) — never generic "their platform." Flag if unverified.

G3. **Negative definition**: state explicitly what this article is NOT for (e.g. operators who haven't shortlisted these two vendors, operators outside this product tier).

G4. **Concrete next step in footer**: include one concrete reader action.

G5. **Category macro-thread**: address the category's defining themes for BOTH vendors. For casino-platforms — Law 14.790/2023, the 4-6 week vs 12-16 week integration reality, rev-share-at-scale. Pull from the category brief.

G6. **Verification instruments, not asserted numbers**: technical specifics expressed as instruments ("time this in the demo," "request the 90-day uptime report") not asserted numbers. Attribute any sourced number; convert any unsourced one.

REQUIREMENTS:
- 3,000-4,500 words total (h2h naturally caps tighter than vendor-cohort articles — opinionated brevity beats padding)
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

GLOBAL EDITORIAL RULES (apply everywhere — non-negotiable):

G1. **Operator consequence**: every capability paired with its operator consequence (revenue, compliance, launch, retention, cost, migration). Newcomer claims especially: "X has Y capability" → "X has Y, which means Z for the operator considering them."

G2. **Proprietary product naming**: when a newcomer has named products/modules, name them. Don't paraphrase to generic "their platform."

G3. **Negative definition**: state explicitly what this article is NOT — not a buying recommendation for production deployment, not a competitive ranking. It is a watchlist with risk flags.

G4. **Concrete next step in footer**: include one concrete reader action (e.g. "before piloting any newcomer, request three operator references operating live, not 'in pilot'").

G5. **Category macro-thread**: even rising stars must address the category's defining themes (for casino-platforms: Law 14.790/2023, integration timelines, rev-share traps). If a newcomer can't address them, flag the gap as a risk.

G6. **Verification instruments, not asserted numbers**: newcomers have limited public data — that's expected. Use instruments ("ask the vendor for X," "request live operator references") rather than asserting unverified scale or uptime numbers.

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
- H3: the 8 diagnostic sub-headings within each H2 challenge (see CHALLENGE SECTIONS below), plus FAQ question headings
- Never skip heading levels (no H3 without a parent H2)
- Use ### H3 for each of the 8 diagnostic sub-headings within each challenge section
- Use `-` bullet lists for "Early warning signs," "Who solves it," "Who makes it worse," and demo-question good/red-flag answer items
- Use **bold vendor name** when naming a solution provider in a bullet item
- Use markdown table for the Challenge Overview and the Mapping summary
- Use ### H3 for each question in Common Questions; prose answer below
- Regulations must be cited by identifier (Law 14.790/2023, UKGC LCCP, GlüStV 2021, Spelinspektionen, iGaming Ontario, MGA, etc.) — never generic "regulatory compliance"

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
   Each challenge section follows this exact 8-part diagnostic structure:
   - **H2: "Challenge: [Problem Statement]"**
   - ### H3: "Why it happens"
     - The root cause — categorize it as architectural, commercial, or organizational. Be specific (e.g. "architectural: the platform was built monolithic and retrofitted with modular APIs that share an underlying ORM").
   - ### H3: "Early warning signs"
     - `-` bullet list: 3-5 symptoms that appear BEFORE the challenge fully hits (e.g. "vendor quotes integration in weeks but won't commit to a written timeline," "support tickets go through three escalation tiers before reaching engineering").
   - ### H3: "Business impact"
     - Revenue, compliance, launch — thresholded where possible. (e.g. "every week of slipped launch costs roughly 1.5% of monthly GGR at steady-state; in a market opening like Brazil under Law 14.790/2023, missing the first 90 days costs significantly more.")
   - ### H3: "Hidden cost"
     - The part operators don't expect — e.g. re-certification cost when changing a payment provider in a regulated market; data egress fees during platform migration; mandatory professional-services hours for any custom bonus structure.
   - ### H3: "Who solves it"
     - `-` bullet list: 2-4 vendors or vendor types with **bold name** and a one-sentence specific explanation of HOW they address it (G2: name actual products, e.g. "EveryMatrix's PaymentIQ orchestrates payments across providers without re-certification per swap").
   - ### H3: "Who makes it worse"
     - `-` bullet list: 1-3 vendor TYPES (e.g. "monolithic all-in-one platforms with no module-level swap-out," "bolt-on payment processors layered on legacy PAMs") that exacerbate this challenge. Name vendor types or architectures, not individual vendors here.
   - ### H3: "Demo question — auditable instrument"
     - One concrete verification action the operator can run during a demo or RFP: e.g. "Request public sandbox access for 5 business days," "Request a 12-month uptime report with root-cause analyses for every incident over 30 minutes," "Demand a line-item breakdown of game-vendor pass-through fees in the contract appendix."
     - Then: "Good answer looks like: [specific format/depth]. Red flag answer: [vague deflection]."
   - ### H3: "Contract protection"
     - One concrete clause to negotiate into the contract before signing: e.g. "90-day exit with full data export at no incremental cost," "uptime SLA with financial penalties scaled to monthly revenue," "professional-services hours capped at X with overage rates published in advance."

   Example challenges for casino-platforms:
   - Multi-market compliance complexity (cite Law 14.790/2023, UKGC LCCP, GlüStV 2021)
   - Integration time exceeding projections (the 4-6 vs 12-16 week reality)
   - Hidden costs in revenue-share models (rev-share-at-scale trap above ~$X GGR)
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

GLOBAL EDITORIAL RULES (apply everywhere — non-negotiable):

G1. **Operator consequence**: every challenge AND every solution-vendor mention paired with its operator consequence. Make the operational pain concrete (revenue loss, compliance exposure, launch delay, churn).

G2. **Proprietary product naming**: when a solution involves a specific product/module (CasinoEngine, PaymentIQ, BonusEngine, OddsMatrix, MEGA, Spring Platform), name it. Generic "their platform handles it" is a failure.

G3. **Negative definition**: state explicitly what this article is NOT — beyond the existing "this is NOT a vendor review," it is also not a checklist of features to demand. It is a diagnostic mapping of common failure modes to vendors that demonstrably address them.

G4. **Concrete next step in footer**: include one concrete reader action.

G5. **Category macro-thread**: cite regulations by identifier — Law 14.790/2023, UKGC LCCP, GlüStV 2021, Spelinspektionen, iGaming Ontario — never generic "regulatory compliance." Thread the category's defining themes through multiple challenges.

G6. **Verification instruments, not asserted numbers**: every challenge's auditable instrument should be a verification action ("request public sandbox access," "demand a 12-month uptime report with root-cause analyses," "demand a line-item breakdown of game-vendor pass-through fees") — not an asserted unsourced number.

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
   - **Required disambiguation entry**: include a "Pragmatic Solutions vs Pragmatic Play" entry. These are SEPARATE companies — Pragmatic Solutions is the platform/PAM provider; Pragmatic Play is the game studio. Operators conflate them in RFPs and contract negotiations, with material commercial consequences. Make the distinction explicit.

5. **COMMON QUESTIONS** (3-4 questions, NOT called "FAQ")
   - ### H3 heading for each question
   - Prose paragraph answer below each heading
   - "What is the difference between [Term A] and [Term B]?"

6. **FOOTER** - pillar link, buyer's guide link, directory link

GLOBAL EDITORIAL RULES (apply everywhere — non-negotiable):

G1. **Operator consequence**: every term's "Why it matters" section must state the operator consequence of getting it wrong (compliance exposure, cost surprise, integration delay, lock-in).

G2. **Proprietary product naming**: when a term maps to a specific vendor product (e.g. "Game aggregator" → Slotegrator's APIgrator, EveryMatrix's CasinoEngine, SOFTSWISS's Game Aggregator), name the vendor products as examples.

G3. **Negative definition**: state explicitly what this article is NOT — not a glossary of generic casino terms, not a beginner's guide to gambling. It is a B2B operator's reference for terms encountered in vendor demos and RFPs.

G4. **Concrete next step in footer**: include one concrete reader action.

G5. **Evergreen mandate**: this article must not contain quarter-specific events, dated awards, license counts, or enforcement dates. Definitions are evergreen. Refer to structural realities ("the Brazilian licensing framework," "the UK affordability regime") not dated events.

G6. **Verification instruments, not asserted numbers**: where a term involves quantitative thresholds (e.g. "what counts as low-latency for a casino platform"), express the answer as a verification instrument ("what to ask the vendor to measure") rather than asserting a number.

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

GLOBAL EDITORIAL RULES (apply everywhere — non-negotiable):

G1. **Operator consequence**: every trend's "Why it matters" section must state the concrete operator consequence — revenue exposure, compliance shift, competitive risk, migration cost.

G2. **Proprietary product naming**: when a trend is being executed by a vendor, name the actual product/module driving it (CasinoEngine, PaymentIQ, MEGA, Spring Platform). Flag if unverified.

G3. **Negative definition**: state explicitly what this article is NOT — not a buyer's comparison, not a current-month news roundup. It is a structural trend analysis with vendor implications.

G4. **Concrete next step in footer**: include one concrete reader action.

G5. **Category macro-thread**: anchor trends in the category's defining themes (for casino-platforms — Law 14.790/2023's effect on the Brazilian market shape, the industry's modular vs monolithic architectural transition, the rev-share-at-scale economics). Pull from the category brief.

G6. **Verification instruments, not asserted numbers**: trend evidence is sourced (conference / regulatory publication / vendor announcement) or the trend is cut. Don't assert market-size or adoption numbers without attribution.

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

**Covers:** "[Category] Pricing — Models, Rev Share, and Hidden Costs" satellites — a CONCEPTUAL discussion of pricing dynamics, not a vendor price list
**Examples:** "Casino Platform Pricing: Models, Rev Share, and Hidden Costs in 2026"
**Why unique — the no-vendor-prices rule:** In iGaming B2B, vendor list prices are almost never published, and what IS published is rarely current or applicable to the reader. A pricing-comparison article that fabricates per-vendor dollar ranges is dangerous — it misleads operators and the vendors won't honor those numbers. This article is therefore CONCEPTUAL: how pricing MODELS work, where money actually goes in this category, hidden costs operators consistently underestimate, scale economics, negotiation levers. Vendor names appear only to illustrate WHICH MODEL a vendor uses (modular vs rev-share vs enterprise-fixed), never to state prices.

### Prompt Template

```
You are writing a PRICING CONCEPTS satellite article for OnlyiGaming.com.

ARTICLE CONTEXT:
- Title: "${categoryTitle} Pricing: Models, Rev Share, and Hidden Costs in ${year}"
- Category: ${categorySlug}
- Parent pillar: /guides/best-${categorySlug}-2026

CRITICAL — NO COMPANY-SPECIFIC PRICES OF ANY KIND:
This article does NOT include any dollar amount, percentage, license fee, rev-share rate, monthly minimum, setup cost, or pricing range attributed to a specific company. This rule applies UNIVERSALLY to:
- Platform vendors (EveryMatrix, SOFTSWISS, BetConstruct, Playtech, etc.)
- Game studios and content providers (Evolution Gaming, Pragmatic Play, Hacksaw, etc.)
- Payment providers, PSPs, gateways (any named company)
- KYC, compliance, RG, infrastructure vendors (any named company)
- ANY company you name in this article

Phrases like "Evolution Gaming might require $50K", "Pragmatic Play minimums are around $25K", "EveryMatrix charges 15-20%" are ALL forbidden — even with "might", "around", "approximately", "estimated", "reported", or any other hedge word. Hedge words do NOT make fabricated prices acceptable. They make them worse — operators read "$50K" and discount the "might".

List prices in iGaming B2B are not publicly published reliably. What IS public:
1. Category-level ranges in the abstract ("revenue share in this category typically lands 10-25% of GGR") — ACCEPTABLE because it's a category statement, not a company claim
2. Pricing model archetypes inferred from vendor PUBLIC marketing ("EveryMatrix positions itself as modular-per-component" — note: positions itself, not "charges this way") — ACCEPTABLE in the PRICING MODEL ARCHETYPES table only, with hedge language
3. Operator-reported anecdotes ("operators report that white-label deals in this category typically include X but not Y") — ACCEPTABLE because they're patterns, not specific company prices

What is NOT acceptable, in any section:
- Any dollar amount or percentage attached to a specific named company
- "Premium guarantee" numbers attributed to specific game studios
- Setup fee ranges attributed to specific platforms
- Anything that names a company and then states a number, no matter how hedged

If you find yourself wanting to write a specific company's price in any section, REPLACE IT with either: (a) a category-level range without naming any company, or (b) a verification instrument ("ask the vendor for X").

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
- Use markdown tables for: Pricing Model Archetypes (vendor → model, no prices) AND Budget Anatomy AND Scale Economics scenarios
- Use `-` bullet list for Hidden Cost items, grouped by cost type
- Use `-` bullet list for red flags in pricing conversations
- Use **bold** for each cost category heading within the bullet list
- Use ### H3 for "Pros" and "Cons" within each pricing model explanation
- Use ### H3 for each question in Common Questions; prose answer below

REQUIRED STRUCTURE:

1. **YAML FRONTMATTER** (type: satellite-pricing)

2. **INTRO** (200-300 words)
   - The problem: pricing in this category is opaque BY DESIGN — vendors keep it that way because every deal is custom
   - What this article is NOT: a quote-shopping list, a guarantee any number applies to your situation, a substitute for talking to vendors directly
   - What this article IS: how pricing MODELS work, where the money actually goes, hidden costs operators consistently underestimate, what changes at scale, how to negotiate
   - Link to pillar for the vendor comparison itself

3. **PRICING MODEL ARCHETYPES** (markdown table — NO per-vendor prices; even MODEL claims are hedged)
   - Columns: Vendor (linked to directory) | Likely Pricing Model | What's Bundled in Public Positioning | What's Likely Separate
   - 6-12 rows
   - **CRITICAL — these are inferences from public positioning, not asserted facts.** Vendors rarely publish pricing models any more reliably than they publish prices. The model column reflects what the vendor's public marketing and product architecture SUGGESTS, not what they confirm contractually. Every cell is implicitly hedged. Add this sentence directly below the table heading: "Based on vendor public positioning and operator reports. Confirm actual model and bundling with the vendor — terms vary per deal."
   - "Likely Pricing Model" cell uses ONE OF: revenue-share, license-fee, hybrid, per-transaction, enterprise-fixed, modular-per-component, white-label-bundled. If even the model isn't publicly inferable, use "Not publicly disclosed."
   - "What's Bundled in Public Positioning" describes which components the vendor markets as included in the headline offering (e.g. "PAM + casino aggregation + reporting"). Name actual products/modules per G2.
   - "What's Likely Separate" describes what operators report being billed on top
   - This table replaces the deprecated "Vendor Pricing Table." It shows STRUCTURE inferences without making up prices.

4. **PRICING MODELS EXPLAINED** (500-800 words)
   - The common pricing models in this category. For each model, use ### H3 heading then:
     - ### H3: [Model Name] (e.g. "Revenue Share")
     - Plain-language explanation of how the model works
     - **Pros:** `-` bullet list (operator perspective)
     - **Cons:** `-` bullet list
     - **Best for:** operator type and scale (e.g. "Startups testing market viability — low upfront, vendor aligned with operator growth")
     - **Worst for:** the operator type that gets burned by this model (e.g. "High-margin operators at scale — the share you pay grows as your revenue grows, with no ceiling")
     - **Typical category range (if generally known):** e.g. "10-25% of GGR in this category, with most deals between 12-18%" — this is a CATEGORY-LEVEL range, not a vendor-specific claim
   - Close with a one-paragraph summary of WHICH MODEL favors WHICH OPERATOR TYPE

5. **BUDGET ANATOMY — WHERE THE MONEY ACTUALLY GOES** (600-900 words)
   - The headline platform fee is rarely more than 30-50% of the real cost. This section breaks down the rest.
   - `-` bullet list grouped by category (each bolded):
     - **Platform license or rev share:** what's included, what's not, where vendors hide costs
     - **Implementation and onboarding:** what drives the variation (custom UI work, additional certifications, content migration), why "turnkey in 4 weeks" usually means 12-16 weeks
     - **Payment processing:** gateway fees, FX markups, chargeback handling, payment-provider rev share — typically 2-5% of GGR in this category
     - **Game content and provider fees:** game-studio rev share stacks on top of platform rev share (typically another 10-25% to studios)
     - **Compliance and regulatory:** per-jurisdiction costs that grow as you add markets — RG tooling, audit support, regulatory reporting
     - **Infrastructure and hosting:** CDN, redundancy, peak handling
     - **Support tiers:** what "premium support" actually buys
     - **Data migration and exit costs:** what it costs to leave (often more than what it cost to onboard)
   - Close: "Operators consistently underestimate items 3-5 in this list. The headline number is a starting point, not the final number."

6. **SCALE ECONOMICS — WHAT CHANGES AT EACH GGR LEVEL** (400-600 words)
   - Markdown table showing operator scenarios. Columns: Scale | Monthly GGR | Pricing Model That Favors | Pricing Model That Hurts | Key Negotiation Lever
   - Rows: Startup (pre-launch / $0-$100K MGR) | Growth ($100K-$1M MGR) | Mid-market ($1M-$10M MGR) | Enterprise ($10M+ MGR)
   - Below the table: a paragraph on the rev-share-at-scale trap — at what threshold revenue share becomes more expensive than a fixed license, why operators often miss the inflection point, and how to negotiate it ahead of time
   - DO NOT state per-vendor dollar amounts in this section. Use the operator scenario scales, not vendor pricing.

7. **HIDDEN COSTS OPERATORS UNDERESTIMATE** (400-600 words)
   - `-` bullet list of category-specific surprises, each **bolded**:
     - The 5-7 most common cost surprises operators encounter AFTER signing
     - Each item: name the surprise, explain why it happens, state what to negotiate INTO the contract before signing
   - Close: "Negotiate these BEFORE signing, not after — once the contract is signed, every change becomes a billable variation."

8. **NEGOTIATION LEVERS** (300-500 words)
   - `-` bullet list: 5-7 specific levers operators have during pricing negotiations
   - Each lever: name it, when it applies (e.g. "if you're committing to a 3-year minimum, you can negotiate the rev share down 200-300 basis points"), how to ask
   - Frame as actionable operator playbook, not abstract advice

9. **RED FLAGS IN PRICING CONVERSATIONS** (300-500 words)
   - `-` bullet list: 5-7 warning signs that a pricing conversation is going badly
   - **Bold each red flag**, prose explanation after
   - Examples: bundled pricing that obscures per-unit costs, "custom pricing" with no ballpark, costs that only appear after contract signing, minimum GGR commitments buried in terms, "industry standard" claims without specifics, vendor refuses to put hidden-cost categories in writing

10. **COMMON QUESTIONS** (4-6 questions, NOT called "FAQ")
   - ### H3 heading for each question
   - Prose paragraph answer below each heading
   - Examples: "Why won't vendors publish pricing?", "At what GGR does revenue share become more expensive than a license fee?", "What's the realistic Year 1 total cost vs the headline number?", "How do I compare two vendors when neither publishes pricing?"

11. **FOOTER** - pillar link, directory link, independence statement

GLOBAL EDITORIAL RULES (apply everywhere — non-negotiable):

G1. **Operator consequence**: every pricing model, fee, or cost line must be paired with its operator consequence (margin impact at scale, cash-flow timing, exit cost). Pricing without consequence is just numbers.

G2. **Proprietary product naming**: when discussing what's priced, name the actual product/module being licensed (CasinoEngine, PaymentIQ, BonusEngine, Spring Platform). Generic "their platform" hides whether the buyer is paying for one module or the whole stack.

G3. **Negative definition**: state explicitly what this article is NOT — not a quote-comparison shopping list, not a guarantee that listed prices apply to the reader. It is an analysis of pricing model trade-offs and hidden-cost categories operators consistently underestimate.

G4. **Concrete next step in footer**: include one concrete reader action.

G5. **Category macro-thread**: tie pricing to the category's defining commercial realities — for casino-platforms — the rev-share-at-scale trap, the integration-cost reality (4-6 vs 12-16 weeks), and how Law 14.790/2023's licensing requirements change the cost base in Brazil. Pull from the category brief.

G6. **Verification instruments, not asserted numbers**: the NO VENDOR-SPECIFIC PRICES rule above is the strongest form of this. Per-vendor prices are not "verifiable specifics" — they are negotiated per deal and rarely public. Category-level ranges in PRICING MODELS EXPLAINED are acceptable; per-vendor dollar amounts are not.

REQUIREMENTS:
- 3,000-4,500 words total (the conceptual scope is contained; padding becomes filler)
- NEVER state per-vendor prices, percentages, license fees, or rev-share rates. Vendor names appear only in PRICING MODEL ARCHETYPES and only to identify WHICH MODEL the vendor uses.
- The value is in the budget anatomy, scale economics, hidden costs, and negotiation levers — not in fabricated price tables
- Category-level pricing ranges (e.g. "rev share typically 10-25% in this category") are acceptable as conceptual context, NOT as vendor-specific claims
- Name specific vendors with directory links in PRICING MODEL ARCHETYPES and PRICING MODELS EXPLAINED to show which vendor uses which model — never to state what they charge
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
- Stablecoin network/protocol specificity — which chain USDT settles on (TRON/TRC-20 vs Ethereum/ERC-20 vs Solana) materially changes per-transaction fee and confirmation latency. Vendors describing "USDT support" without naming the network are obscuring this.
- Hybrid fiat-crypto cashier quality (concurrent flows without conversion delays)
- Wallet management — custodial vs non-custodial, hot wallet exposure, withdrawal speed
- Wallet/ledger portability on migration — what wallet and ledger data exports, in what format, on what timeline, at what cost if the operator switches platforms
- Settlement speed and on-chain finality vs internal ledger reconciliation
- Regulatory posture, especially Brazil's Law 14.790/2023 (and the prohibition of crypto for licensed operators — disqualifies hybrid crypto for Brazil licensees, a category-defining constraint)
- KYC complexity when crypto deposits arrive from mixers, exchanges, or non-custodial wallets
- FX markup on coin-to-fiat conversion — often hidden in spread, not in stated fee

**Expected vendor cohort:**
Crypto-native platforms (SOFTSWISS leads), turnkey crypto operations (GR8 Tech), hybrid platforms with native crypto modules (EveryMatrix, BetConstruct), bolt-on crypto payment processors layered on traditional platforms (NOWPayments, CoinsPaid). Slotegrator and BlueOcean Gaming offer crypto via bolt-on. Pure-fiat-only vendors (Playtech, traditional white-label providers) excluded from the comparison table.

**What to verify:**
- Request a live on-chain crypto withdrawal demo (not a sandbox transaction) — settlement time, network fee handling, confirmation count
- For each supported stablecoin, get the network/protocol explicitly named (USDT on TRC-20 vs ERC-20 vs Solana) and the per-network fee and confirmation latency in writing. Ask which network the vendor's withdrawal layer defaults to and why.
- Get the published list of supported coins and the date each was added (signals platform investment vs marketing claim)
- Ask for the FX spread on the top 3 coins for fiat conversion — get it in writing, not "competitive rates"
- For licensed operators: confirm jurisdiction allowlist for crypto operations. Brazil under Law 14.790/2023 prohibits crypto gambling for licensed operators — vendor must demonstrate geo-fencing or alternative product for that market
- **Wallet/ledger portability on full migration**: get in writing what wallet, ledger, and player-transaction-history data exports if the operator leaves, in what format (CSV, JSON, API), on what timeline (24h vs 30-day), and at what cost. "Available on request" is not an answer.
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

### PROFILE: gamification

**Matches:** slugs/titles containing "gamification", "retention", "loyalty", "engagement", "tournaments"

**Subtype buyer concerns:**
- Retention-mechanic depth: tournaments, missions, loyalty progression, achievement systems — how sophisticated, how customizable, how often updated
- Native engine vs bolt-on/third-party module — a native engine integrates with the platform's player data, wallet, and CRM; a bolt-on requires extra integration work and often duplicates player state
- Bonus-abuse controls — how the engine detects and prevents farming, multi-accounting, and reverse-engineering of tournament reward mechanics
- Conflict with responsible-gambling limits — what happens to a player mid-tournament when they hit deposit, time, or loss limits; this is a real compliance edge case in regulated markets
- CRM and segmentation integration — does the gamification engine read player segments from the CRM and trigger feature variants per segment, or does it operate independently
- Retention-ROI attribution — can the platform attribute revenue lift to specific gamification features (before/after, A/B, holdout cohorts), or is "retention" just a vibe
- Tournament scalability under real load — leaderboard updates, concurrent player count, latency during peak — these break under load if not built for it

**Expected vendor cohort:**
Native gamification leaders: Soft2Bet (MEGA — built operator-side, then commercialized), EveryMatrix (BonusEngine — modular but requires development effort), SOFTSWISS, BetConstruct (Spring Platform's integrated tournament + loyalty features). Content-first or basic-turnkey providers (Slotegrator, NuxGame, BlueOcean Gaming) included as limited or cautionary cohort — they offer surface-level gamification without the depth a retention-led operator needs.

**What to verify:**
- Load-test results at YOUR projected peak concurrency, with timestamps and methodology — not a 500-player demo
- Live walkthrough of the gamification engine, showing whether it is native (reads platform player data directly) or bolt-on (a third-party module integrated via API). Ask to see an operator running it standalone.
- Bonus-abuse control demo: show how the engine identifies and blocks farming patterns, multi-accounting, and reverse-engineered tournament play
- How the engine handles a player hitting an RG deposit or time limit mid-tournament — does it freeze the player's entry, refund the entry fee, exclude them from leaderboards
- Retention attribution reporting: ask for a before/after comparison of a specific gamification feature's impact on retention metrics, with operator name and methodology

**Trap questions:**
- "Show load-test data at our peak concurrency — not a 500-player demo. What was the leaderboard update latency at the 99th percentile?"
- "Is this gamification engine native to your platform or a third-party module — show us an operator running it standalone outside your platform"
- "How do you stop bonus abuse in tournaments? Show an actual case where your controls blocked a farming attempt."
- "What happens to a player mid-tournament when they hit their RG deposit limit? Walk through the player experience and the platform's compliance log."
- "Show retention attribution tied to a specific gamification feature: which feature, which operator, what was the before/after lift, what was the methodology?"

**Section name hints:**
- Retention Mechanics Depth
- Native vs Bolt-On Engine
- Bonus-Abuse and Responsible-Gambling Controls
- CRM and Segmentation Integration
- Measuring Retention ROI

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
