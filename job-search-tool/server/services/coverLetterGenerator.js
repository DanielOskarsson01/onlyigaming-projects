/**
 * Cover letter generation service.
 * Ported from JobSearch/CVs/generate-cover-letter.js for use in the web tool.
 */

const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk").default;
const {
  Document, Packer, Paragraph, TextRun, ImageRun,
  AlignmentType, BorderStyle, Header
} = require("docx");
const { loadAll } = require("./cvContent");

// Design constants (matching CV styling)
const TEAL = "2B5C6E";
const BLACK = "1a1a1a";
const BODY = "3a3a3a";
const MUTED = "666666";
const RULE_GRAY = "d0d0d0";

const PAGE_W = 11906;
const PAGE_H = 16838;
const ML = 560;
const MR = 560;
const MT = 0;
const MB = 500;

const CVS_DIR = path.join(
  process.env.HOME,
  "Library/CloudStorage/Dropbox/Projects/JobSearch/CVs"
);
const IMG_DIR = path.join(CVS_DIR, "images", "png");

const COVER_IMAGE_MAP = {
  generic: "cover large business.png",
  igaming: "cover large internationlist.png",
  cmo: "cover large business.png",
  cpo: "cover large builder.png",
  ceo: "cover large business.png",
  startup: "cover large builder.png",
  digital: "cover large builder.png",
};

const SYSTEM_PROMPT = `You are a cover letter writer for Daniel Oskarsson. You write concise, direct, confident cover letters that feel human - not AI-generated.

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

function buildPrompt(jobAdText) {
  const { MASTER_CV_MD, SECTION_VARIANTS_MD, CV_DATA } = loadAll();

  const identityPositioning = (CV_DATA.identity_positioning || [])
    .map((p) => `- ${p.label}: ${p.description}`)
    .join("\n");

  return `## JOB ADVERTISEMENT
---
${jobAdText}
---

## DANIEL'S FULL CV (for reference - do NOT copy-paste from this)
---
${MASTER_CV_MD}
---

## CV SECTION VARIANTS (shows how Daniel positions himself for different roles)
---
${SECTION_VARIANTS_MD}
---

## IDENTITY POSITIONING
${identityPositioning}

## RESPONSE FORMAT

Return this exact JSON structure:

{
  "company_name": "Short company name for filename",
  "variant": "one of: generic, igaming, cmo, cpo, ceo, startup, digital",
  "variant_reasoning": "Why this variant/theme was chosen",
  "greeting": "Dear [Hiring Manager / specific name if mentioned in ad],",
  "paragraphs": [
    "First paragraph text...",
    "Second paragraph text...",
    "Third paragraph text (optional)...",
    "Closing paragraph..."
  ],
  "sign_off": "Best regards"
}`;
}

// DOCX helpers
function t(text, opts = {}) {
  return new TextRun({
    text,
    font: opts.font || "Calibri",
    size: opts.size || 22,
    bold: opts.bold || false,
    italics: opts.italics || false,
    color: opts.color || BODY,
  });
}

function par(runs, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before || 0, after: opts.after || 0 },
    alignment: opts.alignment || AlignmentType.LEFT,
    children: runs,
    ...(opts.indent ? { indent: opts.indent } : {}),
  });
}

function tealRule() {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: TEAL, space: 1 },
    },
    spacing: { before: 0, after: 0 },
    children: [],
  });
}

function buildCoverLetterDoc(variant, data) {
  const coverImageFile = COVER_IMAGE_MAP[variant] || COVER_IMAGE_MAP.generic;
  const imgPath = path.join(IMG_DIR, coverImageFile);

  const children = [];

  // Cover image (if available)
  if (fs.existsSync(imgPath)) {
    const coverImageData = fs.readFileSync(imgPath);
    const imgWidth = 800;
    const imgHeight = 451;

    children.push(
      new Paragraph({
        spacing: { before: 0, after: 120 },
        alignment: AlignmentType.CENTER,
        indent: { left: -560, right: -560 },
        children: [
          new ImageRun({
            type: "png",
            data: coverImageData,
            transformation: { width: imgWidth, height: imgHeight },
            altText: {
              title: "Cover Letter",
              description: "Cover letter header",
              name: "cover",
            },
          }),
        ],
      })
    );
  }

  // Name & Contact
  children.push(
    par([t("Daniel Oskarsson", { bold: true, size: 34, color: BLACK })], {
      after: 10,
    })
  );

  const contactItems = [
    "+46 70 250 15 50",
    "danieloskarsson@hotmail.com",
    "linkedin.com/in/daniel-oskarsson-3859191",
    "Stockholm, Sweden",
  ];
  const contactRuns = [];
  contactItems.forEach((item, i) => {
    if (i > 0) contactRuns.push(t("  |  ", { size: 17, color: RULE_GRAY }));
    contactRuns.push(t(item, { size: 17, color: MUTED }));
  });
  children.push(par(contactRuns, { after: 20 }));
  children.push(tealRule());

  // Date
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  children.push(
    par([t(dateStr, { size: 20, color: MUTED })], { before: 200, after: 200 })
  );

  // Greeting
  children.push(
    par([t(data.greeting, { size: 22, color: BLACK })], { after: 160 })
  );

  // Body paragraphs
  data.paragraphs.forEach((text, i) => {
    const isLast = i === data.paragraphs.length - 1;
    children.push(
      par([t(text, { size: 22, color: BODY })], { after: isLast ? 200 : 160 })
    );
  });

  // Sign-off
  children.push(
    par([t(data.sign_off + ",", { size: 22, color: BODY })], { after: 60 })
  );
  children.push(
    par([t("Daniel Oskarsson", { bold: true, size: 22, color: BLACK })], {
      after: 0,
    })
  );

  return new Document({
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } },
    },
    sections: [
      {
        properties: {
          titlePage: true,
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: MT, bottom: MB, left: ML, right: MR, header: 0 },
          },
        },
        headers: {
          first: new Header({
            children: [
              new Paragraph({
                spacing: { before: 0, after: 0, line: 20 },
                children: [new TextRun({ text: "", size: 2 })],
              }),
            ],
          }),
          default: new Header({
            children: [new Paragraph({ spacing: { after: 200 }, children: [] })],
          }),
        },
        children,
      },
    ],
  });
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
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch (_) {}
  }
  throw new Error("Failed to parse cover letter API response as JSON");
}

/**
 * Generate a cover letter for a job.
 * @param {string} jobAdText - The full job ad text content
 * @param {string} variant - CV variant (igaming, cmo, etc.) from analysis
 * @param {string} companySlug - Sanitized company name for filename
 * @param {string} outputDir - Directory to write the file
 * @returns {{ coverLetterFilename: string, coverLetterData: object }}
 */
async function generateCoverLetter(jobAdText, variant, companySlug, outputDir) {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(jobAdText) }],
  });

  const raw = response.content[0].text;
  const result = extractJSON(raw);

  // Sanitize em/en dashes
  if (result.paragraphs) {
    result.paragraphs = result.paragraphs.map((p) =>
      p.replace(/[\u2013\u2014]/g, "-")
    );
  }

  // Build and save DOCX
  const usedVariant = result.variant || variant || "generic";
  const doc = buildCoverLetterDoc(usedVariant, result);
  const buffer = await Packer.toBuffer(doc);

  const coverLetterFilename = `CoverLetter_Daniel_Oskarsson_${companySlug}.docx`;
  fs.writeFileSync(path.join(outputDir, coverLetterFilename), buffer);

  return { coverLetterFilename, coverLetterData: result };
}

module.exports = { generateCoverLetter };
