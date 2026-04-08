/**
 * JSON file database for prompts and settings.
 * Follows the discoveryDb.js pattern with atomic writes.
 * Auto-seeds with current hardcoded prompts on first access.
 */

const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const DB_PATH = path.join(__dirname, "..", "data", "prompts.json");

// Default analysis system prompt (extracted from analyzer.js)
const DEFAULT_ANALYSIS_SYSTEM_PROMPT = `You are a CV tailoring assistant for Daniel Oskarsson. You work in three phases:

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
- You MUST provide at least 2 suggestions. Even when the variant fits well, there are always improvements - reworded bullets, reordered highlights, keyword additions. An empty suggestions section is not acceptable.

FOR GAPS:
- Identify job ad requirements where NO existing content provides a good match.
- For each gap, note the closest existing content (if any) and write a direct question for Daniel.
- Questions should be specific: "Do you have experience with X?" not "Tell me about your background."
- You MUST identify at least 2 gaps or questions. Every job ad has requirements worth asking about.

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

// Default cover letter system prompt (extracted from coverLetterGenerator.js)
const DEFAULT_COVER_LETTER_SYSTEM_PROMPT = `You are a cover letter writer for Daniel Oskarsson. You write concise, direct, confident cover letters that feel human - not AI-generated.

=== ABOUT DANIEL ===

Daniel has 27+ years of experience. Key highlights:
- Scaled two startups to NASDAQ-listed companies (MrGreen and ComeOn)
- Teams grew from single digits to 250+ employees
- Deep expertise in CRM, gamification, growth marketing, data/BI, product development
- Built a company from scratch as CEO (Coinhero - crypto iGaming)
- Currently building OnlyiGaming.com - a B2B platform with AI-powered content automation
- Earlier career includes Betclic (Head of Casino Business), creative agencies, and consulting
- Languages: Swedish (native), English (fluent), German (professional)
- Based in Stockholm, Sweden

=== WRITING RULES (MANDATORY) ===

1. NEVER use em dashes or en dashes. Use hyphens (-) only.
2. NEVER use "leveraged", "spearheaded", "cutting-edge", "robust", "passionate about", "excited to", "thrilled", or other AI-typical words.
3. Write in first person. Direct, confident, human tone.
4. No filler phrases or corporate fluff.
5. Keep it SHORT - 3-4 paragraphs max, roughly 200-300 words total.
6. Lead with the strongest connection to the role.
7. Reference specific things from the job ad - show you read it.
8. End with a clear call to action.
9. Do NOT repeat the CV - the cover letter should add personality and context, not rehash bullet points.

=== STRUCTURE ===

Paragraph 1: Why this role, why this company. Show you understand what they need.
Paragraph 2: Your strongest relevant experience - pick 2-3 things that directly match. Be specific with numbers.
Paragraph 3 (optional): Something that differentiates you - a unique angle or added value.
Final paragraph: Short closing. Available for conversation. No begging.

=== TONE ===

Think: experienced professional writing to a peer, not a junior applicant writing to a gatekeeper.
Confident but not arrogant. Specific but not exhaustive. Human but not casual.

Return ONLY valid JSON. No markdown formatting or code fences.`;

const DEFAULT_DB = {
  prompts: [
    {
      id: "default-analysis",
      type: "analysis",
      name: "Default 5-Layer Analysis",
      systemPrompt: DEFAULT_ANALYSIS_SYSTEM_PROMPT,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-cover-letter",
      type: "cover_letter",
      name: "Default Cover Letter",
      systemPrompt: DEFAULT_COVER_LETTER_SYSTEM_PROMPT,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  settings: {
    activeAnalysisPromptId: "default-analysis",
    activeCoverLetterPromptId: "default-cover-letter",
    analysisModel: "claude-sonnet-4-20250514",
    analysisMaxTokens: 8000,
    analysisTemperature: 0.2,
    coverLetterModel: "claude-sonnet-4-20250514",
    coverLetterMaxTokens: 2000,
  },
};

function read() {
  if (!fs.existsSync(DB_PATH)) {
    write(JSON.parse(JSON.stringify(DEFAULT_DB)));
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function write(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

function getPrompts(type) {
  const data = read();
  if (type) return data.prompts.filter((p) => p.type === type);
  return data.prompts;
}

function getPrompt(id) {
  return read().prompts.find((p) => p.id === id) || null;
}

function savePrompt(prompt) {
  const data = read();
  const idx = data.prompts.findIndex((p) => p.id === prompt.id);
  prompt.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    data.prompts[idx] = prompt;
  } else {
    prompt.createdAt = prompt.createdAt || new Date().toISOString();
    data.prompts.push(prompt);
  }
  write(data);
  return prompt;
}

function deletePrompt(id) {
  const data = read();
  const prompt = data.prompts.find((p) => p.id === id);
  if (prompt && prompt.isDefault) {
    throw new Error("Cannot delete default prompts");
  }
  data.prompts = data.prompts.filter((p) => p.id !== id);
  write(data);
}

function duplicatePrompt(id) {
  const source = getPrompt(id);
  if (!source) throw new Error("Prompt not found");
  const copy = {
    ...source,
    id: uuid(),
    name: `${source.name} (copy)`,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const data = read();
  data.prompts.push(copy);
  write(data);
  return copy;
}

function getSettings() {
  return read().settings;
}

function saveSettings(settings) {
  const data = read();
  data.settings = { ...data.settings, ...settings };
  write(data);
  return data.settings;
}

/** Get the active prompt for a given type. */
function getActivePrompt(type) {
  const settings = getSettings();
  const id =
    type === "analysis"
      ? settings.activeAnalysisPromptId
      : settings.activeCoverLetterPromptId;
  return getPrompt(id);
}

module.exports = {
  getPrompts,
  getPrompt,
  savePrompt,
  deletePrompt,
  duplicatePrompt,
  getSettings,
  saveSettings,
  getActivePrompt,
  DEFAULT_ANALYSIS_SYSTEM_PROMPT,
  DEFAULT_COVER_LETTER_SYSTEM_PROMPT,
};
