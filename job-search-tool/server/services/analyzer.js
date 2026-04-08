/**
 * 5-layer job ad analysis service.
 * Reads system prompt from promptDb (configurable via Settings UI).
 * Falls back to DEFAULT_ANALYSIS_SYSTEM_PROMPT if DB not available.
 */

const Anthropic = require("@anthropic-ai/sdk").default;
const { loadAll } = require("./cvContent");
const {
  getActivePrompt,
  getPrompt,
  getSettings,
  DEFAULT_ANALYSIS_SYSTEM_PROMPT,
} = require("../lib/promptDb");
const { buildKnowledgeContext } = require("../lib/knowledgeDb");

const VALID_VARIANTS = ["generic", "igaming", "cmo", "cpo", "ceo", "startup", "digital"];
const JOB_KEYS = ["onlyigaming", "coinhero", "betclic", "comeon", "mrgreen"];

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

## SOURCE DOCUMENT 9: KNOWLEDGE BANK (learned content from previous applications)
${buildKnowledgeContext() || "No learned content yet - this is the first analysis."}

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

/**
 * Run 5-layer analysis on a job ad.
 * @param {string} jobAdText - The full job ad text
 * @param {object} [options] - Optional overrides
 * @param {string} [options.promptId] - Use a specific prompt instead of the active one
 * @returns {object} The analysis result
 */
async function analyzeJobAd(jobAdText, options = {}) {
  const client = new Anthropic();
  const prompt = buildPrompt(jobAdText);

  // Resolve system prompt: specific promptId > active prompt > hardcoded default
  let systemPrompt = DEFAULT_ANALYSIS_SYSTEM_PROMPT;
  let usedPromptId = null;

  if (options.promptId) {
    const p = getPrompt(options.promptId);
    if (p) {
      systemPrompt = p.systemPrompt;
      usedPromptId = p.id;
    }
  } else {
    const active = getActivePrompt("analysis");
    if (active) {
      systemPrompt = active.systemPrompt;
      usedPromptId = active.id;
    }
  }

  // Resolve model settings
  const settings = getSettings();
  const model = settings.analysisModel || "claude-sonnet-4-20250514";
  const maxTokens = settings.analysisMaxTokens || 8000;
  const temperature = settings.analysisTemperature ?? 0.2;

  console.log(`  Using prompt: ${usedPromptId || "hardcoded default"}, model: ${model}`);

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
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

  // Attach metadata about which prompt was used
  config._promptId = usedPromptId;

  return config;
}

module.exports = { analyzeJobAd, VALID_VARIANTS, JOB_KEYS };
