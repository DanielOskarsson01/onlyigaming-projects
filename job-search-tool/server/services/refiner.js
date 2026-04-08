/**
 * Refine service — generates integration previews showing how accepted
 * suggestions and gap answers will be incorporated into the CV and cover letter.
 */

const Anthropic = require("@anthropic-ai/sdk").default;
const { getSettings } = require("../lib/promptDb");

const REFINE_SYSTEM_PROMPT = `You are helping Daniel Oskarsson preview how accepted suggestions and gap answers will be integrated into his CV and cover letter.

Given:
- The job analysis (variant, sections selected)
- Accepted suggestions (items the user approved)
- Gap answers (the user's responses to gap questions)
- Optional comments from a previous iteration

Your job is to show EXACTLY how each piece of new information will modify the CV or inform the cover letter.

For each integration, provide:
- section: which CV section it affects (summary, highlights, competencies, job_bullets, cover_letter)
- original: the current text (null if it's a new addition)
- updated: the new/modified text
- source: what generated this change (e.g. "suggestion_accepted", "gap_answer_0")
- explanation: brief note on why this change was made

Also identify any new content points that should be saved to the knowledge bank:
- type: bullet, achievement, competency, highlight, experience
- text: the content
- derivedFrom: source identifier

Rules:
- Write in Daniel's voice: direct, confident, specific, human
- Never use em dashes or en dashes. Use hyphens only.
- Never use "leveraged", "spearheaded", "cutting-edge", or "robust"
- Be specific about WHERE in the CV each change goes
- For the cover letter, explain which paragraph will reference the new information

Return ONLY valid JSON. No markdown formatting or code fences.`;

/**
 * Generate an integration preview.
 * @param {object} params
 * @param {object} params.analysis - The full analysis result
 * @param {object} params.userChoices - { accepted: {}, gapAnswers: {} }
 * @param {string} [params.comments] - User comments from previous iteration
 * @returns {object} { integratedSuggestions, coverLetterNotes, newContentPoints }
 */
async function generateRefinePreview({ analysis, userChoices, comments }) {
  const client = new Anthropic();
  const settings = getSettings();

  // Collect accepted suggestions
  const acceptedItems = [];
  const suggestions = analysis.suggestions || {};
  for (const [key, val] of Object.entries(userChoices.accepted || {})) {
    if (val !== true) continue;
    const [section, indexStr] = key.split(".");
    const index = parseInt(indexStr);
    const item = suggestions[section]?.items?.[index];
    if (item) acceptedItems.push({ section, index, ...item });
  }

  // Collect gap answers
  const gapAnswers = [];
  for (const [key, val] of Object.entries(userChoices.gapAnswers || {})) {
    if (!val?.trim()) continue;
    const gap = analysis.gaps?.[parseInt(key)];
    gapAnswers.push({
      index: parseInt(key),
      question: gap?.question || gap || `Gap ${key}`,
      answer: val,
    });
  }

  const userPrompt = `## JOB ANALYSIS
Variant: ${analysis.base_variant}
Company: ${analysis.company_name}
Fit Score: ${analysis.fit_score}

## CV SECTIONS SELECTED
Summary: ${analysis.cv?.summary?.slice(0, 200)}...
Highlights: ${JSON.stringify(analysis.cv?.highlights?.slice(0, 3))}

## ACCEPTED SUGGESTIONS (${acceptedItems.length})
${acceptedItems.length > 0 ? JSON.stringify(acceptedItems, null, 2) : "None"}

## GAP ANSWERS (${gapAnswers.length})
${gapAnswers.length > 0 ? JSON.stringify(gapAnswers, null, 2) : "None"}

${comments ? `## USER COMMENTS FROM PREVIOUS ITERATION\n${comments}\n` : ""}

## RESPONSE FORMAT
{
  "integratedSuggestions": [
    {
      "section": "summary|highlights|competencies|job_bullets|cover_letter",
      "original": "current text or null",
      "updated": "new/modified text",
      "source": "suggestion_accepted|gap_answer_N",
      "explanation": "brief note"
    }
  ],
  "coverLetterNotes": "How the new information will be woven into the cover letter",
  "newContentPoints": [
    {
      "type": "bullet|achievement|competency|highlight|experience",
      "text": "the new content",
      "derivedFrom": "source identifier"
    }
  ]
}`;

  const response = await client.messages.create({
    model: settings.analysisModel || "claude-sonnet-4-20250514",
    max_tokens: 4000,
    temperature: 0.3,
    system: REFINE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const raw = response.content[0].text;
  return extractJSON(raw);
}

function extractJSON(text) {
  try {
    return JSON.parse(text);
  } catch (_) {}
  const m = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (m) {
    try { return JSON.parse(m[1]); } catch (_) {}
  }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try { return JSON.parse(text.slice(firstBrace, lastBrace + 1)); } catch (_) {}
  }
  throw new Error("Failed to parse refine preview response as JSON");
}

module.exports = { generateRefinePreview };
