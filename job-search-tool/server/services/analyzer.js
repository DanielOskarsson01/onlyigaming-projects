/**
 * 5-layer job ad analysis service.
 * Extracted from generate-tailored-cv.js — same system prompt and prompt builder.
 */

const Anthropic = require("@anthropic-ai/sdk").default;
const { loadAll } = require("./cvContent");

const VALID_VARIANTS = ["generic", "igaming", "cmo", "cpo", "ceo", "startup", "digital"];
const JOB_KEYS = ["onlyigaming", "coinhero", "betclic", "comeon", "mrgreen"];

const SYSTEM_PROMPT = `You are a CV tailoring assistant for Daniel Oskarsson. You work in three phases:

PHASE 1: Deep 5-layer analysis of the job ad.
PHASE 2: Select the best pre-approved CV content from ALL provided source documents.
PHASE 3: Suggest new/changed items AND identify gaps where no existing content matches.

=== 5-LAYER ANALYSIS FRAMEWORK ===

Analyze the job ad through these 5 layers:

Layer 1 - EXPLICIT REQUIREMENTS: Hard skills, years of experience, certifications, tools, technologies. Mark each as "must-have" or "nice-to-have" based on language used.

Layer 2 - PREFERRED QUALIFICATIONS: Nice-to-haves that differentiate candidates. Things listed after "ideally", "bonus", "preferred", "plus".

Layer 3 - INDUSTRY LANGUAGE: Jargon, acronyms, domain-specific terms the employer uses. These are keywords that should appear in the CV where truthful.

Layer 4 - OPERATIONAL CONTEXT: Team size, reporting line, scope (global/local/regional), contract type, location requirements, travel expectations.

Layer 5 - CULTURE SIGNALS: Values, work style indicators ("fast-paced", "autonomous", "collaborative"), mission language, management philosophy.

=== KEYWORD PRIORITIZATION ===

- FREQUENCY: Keywords mentioned 3+ times = core requirement (highest priority)
- POSITION: Terms in opening paragraph or closing "what we're looking for" = high weight
- EXPLICITNESS: "Must have" > "Looking for" > "Nice to have" > unstated-but-implied

=== CRITICAL CONTENT RULES ===

FOR THE CV SECTION:
- Use ONLY exact pre-approved text from the provided documents. Zero creative writing.
- Select the best variant of each section. You may mix variants across sections (e.g., CMO summary + iGaming highlights).
- For job entries: select one complete variant per job. Do NOT mix bullets from different variants of the same job.
- Never invent job titles, company names, or achievements.
- Never replace industry terms (e.g., do NOT change "players" to "members" or "iGaming" to "technology").
- Competency categories and items must come from COMPETENCY_MASTER_POOL exactly as written.
- Reorder items within a section by relevance to the job ad. That is the primary tailoring mechanism.

FOR SUGGESTIONS:
- Suggestions go in a SEPARATE section. Each is clearly marked NEW or CHANGED.
- Suggested changes must be truthful based on Daniel's actual background.
- Write in Daniel's voice: direct, confident, specific, human. No corporate AI-speak.
- Each suggestion must state which job ad keyword/requirement it addresses.
- Never use em dashes or en dashes. Use hyphens only.
- Never use "leveraged", "spearheaded", "cutting-edge", or "robust".

FOR GAPS:
- Identify job ad requirements where NO existing content provides a good match.
- For each gap, note the closest existing content (if any) and write a direct question for Daniel.
- Questions should be specific: "Do you have experience with X?" not "Tell me about your background."

FOR FIT SCORING:
- Calculate an overall fit score (0-100) based on how well Daniel's profile matches this role.
- Weight must-have requirements heavily (each unmet must-have reduces score significantly).
- Nice-to-haves have less impact. Industry/domain match adds bonus points.
- 90-100: Excellent fit, meets virtually all requirements.
- 70-89: Good fit, meets most must-haves with minor gaps.
- 50-69: Moderate fit, significant gaps but relevant experience.
- Below 50: Poor fit, major requirements unmet.
- Write a 1-2 sentence fit_summary explaining the score.

Return ONLY valid JSON. No markdown formatting or code fences.`;

function buildPrompt(jobAdText) {
  const { POOL, JOB_VARIANTS_MD, SECTION_VARIANTS_MD, MASTER_CV_MD, CV_DATA, VARIANTS } = loadAll();

  const variantSummaries = VALID_VARIANTS.map(
    (v) => `**${v}**: ${VARIANTS[v].summary}`
  ).join("\n");

  const jobData = {};
  for (const jobKey of JOB_KEYS) {
    jobData[jobKey] = {};
    for (const v of VALID_VARIANTS) {
      const job = VARIANTS[v].jobs[jobKey];
      if (job) {
        jobData[jobKey][v] = { role: job.role, intro: job.intro, bullets: job.bullets };
      }
    }
  }

  const otherExpData = {};
  for (const v of VALID_VARIANTS) {
    otherExpData[v] = VARIANTS[v].otherExp;
  }

  const identityPositioning = (CV_DATA.identity_positioning || [])
    .map((p) => `- ${p.label}: ${p.description}`)
    .join("\n");

  return `## JOB ADVERTISEMENT
---
${jobAdText}
---

## INSTRUCTIONS

Analyze this job ad using the 5-layer framework, then select the best pre-approved content for a tailored CV, then suggest additions and identify gaps.

## SOURCE DOCUMENT 1: CV SECTION VARIANTS (summaries, highlights, competencies, other experience - all variants)
---
${SECTION_VARIANTS_MD}
---

## SOURCE DOCUMENT 2: CV JOB ENTRY VARIANTS (each job written in 7 role-specific variants)
---
${JOB_VARIANTS_MD}
---

## SOURCE DOCUMENT 3: COMPETENCY MASTER POOL (pick 3 categories, 4-6 items each)
${JSON.stringify(POOL.categories, null, 2)}

Rules from pool: ${JSON.stringify(POOL._rules)}

## SOURCE DOCUMENT 4: MASTER CV (full career history, detailed achievements, awards)
---
${MASTER_CV_MD}
---

## SOURCE DOCUMENT 5: IDENTITY POSITIONING (how Daniel positions himself)
${identityPositioning}

## SOURCE DOCUMENT 6: VARIANT SUMMARIES (for layout/variant selection)
${variantSummaries}

## SOURCE DOCUMENT 7: CODED JOB DATA (exact text that buildCV uses - your job entry selections MUST match these exactly)
${JSON.stringify(jobData, null, 2)}

## SOURCE DOCUMENT 8: CODED OTHER EXPERIENCE (exact text for "Other Experience" section)
${JSON.stringify(otherExpData, null, 2)}

## RESPONSE FORMAT

Return this exact JSON structure:

{
  "company_name": "Short company name for filename",
  "base_variant": "one of: generic, igaming, cmo, cpo, ceo, startup, digital",
  "variant_reasoning": "1-2 sentences explaining why this variant was chosen",

  "job_analysis": {
    "explicit_requirements": [
      { "requirement": "description", "priority": "must-have or nice-to-have", "frequency": 1 }
    ],
    "preferred_qualifications": ["qualification 1", "qualification 2"],
    "industry_language": ["term 1", "term 2"],
    "operational_context": {
      "team_size": "description",
      "reporting_to": "who",
      "scope": "global/regional/local",
      "contract_type": "full-time/contractor/etc",
      "location": "description",
      "travel": "description or null"
    },
    "culture_signals": ["signal 1", "signal 2"],
    "key_keywords_ranked": ["keyword 1 (most important)", "keyword 2", "keyword 3"]
  },

  "cv": {
    "summary": "exact summary text from CV_SECTION_VARIANTS.md",
    "summary_source": "which variant",
    "highlights": ["exact highlight 1", "..."],
    "highlights_source": "which variant",
    "competencies": [
      { "title": "Exact Category Name from Pool", "items": ["exact item 1", "exact item 2", "exact item 3", "exact item 4"] }
    ],
    "jobs": {
      "onlyigaming": { "variant_used": "CMO", "role": "exact role title", "intro": "exact intro paragraph", "bullets": ["exact bullet 1"] },
      "coinhero": { "variant_used": "...", "role": "...", "intro": "...", "bullets": ["..."] },
      "betclic": { "variant_used": "...", "role": "...", "intro": "...", "bullets": ["..."] },
      "comeon": { "variant_used": "...", "role": "...", "intro": "...", "bullets": ["..."] },
      "mrgreen": { "variant_used": "...", "role": "...", "intro": "...", "bullets": ["..."] }
    },
    "otherExp": [{ "company": "company name", "desc": "exact description" }],
    "otherExp_source": "which variant"
  },

  "suggestions": {
    "summary": { "has_suggestions": false, "items": [] },
    "highlights": { "has_suggestions": false, "items": [] },
    "competencies": { "has_suggestions": false, "items": [] },
    "job_bullets": { "has_suggestions": false, "items": [] }
  },

  "gaps": [],

  "fit_score": 75,
  "fit_summary": "1-2 sentence assessment of overall fit between Daniel's profile and this role"
}`;
}

function sanitize(text) {
  if (typeof text === "string") return text.replace(/[\u2013\u2014]/g, "-");
  if (Array.isArray(text)) return text.map(sanitize);
  if (text && typeof text === "object") {
    const out = {};
    for (const [k, v] of Object.entries(text)) out[k] = sanitize(v);
    return out;
  }
  return text;
}

function extractJSON(text) {
  try {
    return JSON.parse(text);
  } catch (_) {}
  const m = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (m) {
    try {
      return JSON.parse(m[1]);
    } catch (_) {}
  }
  throw new Error(`Failed to parse JSON:\n${text.slice(0, 500)}`);
}

async function analyzeJobAd(jobAdText) {
  const client = new Anthropic();
  const prompt = buildPrompt(jobAdText);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    temperature: 0.2,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0].text;
  const parsed = extractJSON(raw);
  const config = sanitize(parsed);

  if (!config.company_name) throw new Error("Missing company_name in response");
  if (!VALID_VARIANTS.includes(config.base_variant)) {
    console.warn(`Warning: Unknown variant "${config.base_variant}", falling back to "generic"`);
    config.base_variant = "generic";
  }

  return config;
}

module.exports = { analyzeJobAd, VALID_VARIANTS, JOB_KEYS };
