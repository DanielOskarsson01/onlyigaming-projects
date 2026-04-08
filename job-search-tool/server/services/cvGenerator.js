/**
 * CV DOCX generation service.
 * Wraps generate_core_cvs.js buildCV() and the suggestions DOCX builder.
 */

const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, BorderStyle } = require("docx");
const { loadAll } = require("./cvContent");
const { JOB_KEYS } = require("./analyzer");
const { generateCoverLetter } = require("./coverLetterGenerator");

const OUTPUT_DIR = path.join(__dirname, "..", "..", "output");
const JOBSEARCH_DIR = path.join(
  process.env.HOME,
  "Library/CloudStorage/Dropbox/Projects/JobSearch/Applications"
);

function buildOverrides(cv) {
  const overrides = {};
  if (cv.summary) overrides.summary = cv.summary;
  if (cv.highlights) overrides.highlights = cv.highlights;
  if (cv.competencies) overrides.competencies = cv.competencies;
  if (cv.otherExp) overrides.otherExp = cv.otherExp;
  if (cv.jobs) {
    overrides.jobs = {};
    for (const jobKey of JOB_KEYS) {
      if (cv.jobs[jobKey]) {
        overrides.jobs[jobKey] = {
          role: cv.jobs[jobKey].role,
          intro: cv.jobs[jobKey].intro,
          bullets: cv.jobs[jobKey].bullets,
        };
      }
    }
  }
  return overrides;
}

function buildSuggestionsDoc(config) {
  const { job_analysis, suggestions, gaps, company_name } = config;
  const children = [];

  const heading = (text) =>
    new Paragraph({
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({ text, bold: true, size: 28, color: "2B5C6E", font: "Calibri" }),
      ],
    });

  const subheading = (text) =>
    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({ text, bold: true, size: 22, color: "1a1a1a", font: "Calibri" }),
      ],
    });

  const body = (text, opts = {}) =>
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text,
          size: 18,
          color: opts.color || "3a3a3a",
          font: "Calibri",
          ...opts,
        }),
      ],
    });

  const label = (lbl, value) =>
    new Paragraph({
      spacing: { after: 30 },
      children: [
        new TextRun({ text: `${lbl}: `, bold: true, size: 18, color: "2B5C6E", font: "Calibri" }),
        new TextRun({ text: value, size: 18, color: "3a3a3a", font: "Calibri" }),
      ],
    });

  const rule = () =>
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2B5C6E" } },
      spacing: { before: 60, after: 60 },
      children: [],
    });

  // Title
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: `CV Analysis & Suggestions - ${company_name}`,
          bold: true, size: 36, color: "2B5C6E", font: "Calibri",
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Generated ${new Date().toISOString().slice(0, 10)}. Review each suggestion and approve/reject.`,
          size: 18, color: "666666", font: "Calibri", italics: true,
        }),
      ],
    })
  );

  // 5-Layer Analysis
  children.push(heading("5-Layer Job Ad Analysis"));
  children.push(rule());

  children.push(subheading("Layer 1: Explicit Requirements"));
  for (const req of job_analysis.explicit_requirements || []) {
    const freq = req.frequency > 1 ? ` (mentioned ${req.frequency}x)` : "";
    children.push(body(`  [${req.priority}] ${req.requirement}${freq}`));
  }

  children.push(subheading("Layer 2: Preferred Qualifications"));
  for (const q of job_analysis.preferred_qualifications || []) {
    children.push(body(`  - ${q}`));
  }

  children.push(subheading("Layer 3: Industry Language & Keywords"));
  children.push(body(`  ${(job_analysis.industry_language || []).join(", ")}`));

  children.push(subheading("Layer 4: Operational Context"));
  const ctx = job_analysis.operational_context || {};
  if (ctx.team_size) children.push(label("Team", ctx.team_size));
  if (ctx.reporting_to) children.push(label("Reports to", ctx.reporting_to));
  if (ctx.scope) children.push(label("Scope", ctx.scope));
  if (ctx.contract_type) children.push(label("Contract", ctx.contract_type));
  if (ctx.location) children.push(label("Location", ctx.location));
  if (ctx.travel) children.push(label("Travel", ctx.travel));

  children.push(subheading("Layer 5: Culture Signals"));
  for (const c of job_analysis.culture_signals || []) {
    children.push(body(`  - ${c}`));
  }

  children.push(subheading("Keywords Ranked by Priority"));
  const keywords = job_analysis.key_keywords_ranked || [];
  for (let i = 0; i < keywords.length; i++) {
    children.push(body(`  ${i + 1}. ${keywords[i]}`));
  }

  // Gaps
  if (gaps && gaps.length > 0) {
    children.push(heading("Content Gaps"));
    children.push(rule());
    children.push(
      body("These job requirements have no strong match in existing CV content:", {
        italics: true, color: "666666",
      })
    );
    children.push(new Paragraph({ spacing: { after: 60 }, children: [] }));

    for (let i = 0; i < gaps.length; i++) {
      const gap = gaps[i];
      children.push(subheading(`${i + 1}. ${gap.requirement} [${gap.priority}]`));
      if (gap.closest_match) children.push(label("Closest existing content", gap.closest_match));
      children.push(label("Question for Daniel", gap.question));
      children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    }
  }

  // Suggestions
  const sections = [
    { key: "summary", title: "Summary Suggestions" },
    { key: "highlights", title: "Highlights Suggestions" },
    { key: "competencies", title: "Competency Suggestions" },
    { key: "job_bullets", title: "Job Bullet Suggestions" },
  ];

  let hasSuggestions = false;
  for (const sec of sections) {
    const data = suggestions[sec.key];
    if (!data || !data.has_suggestions || !data.items || data.items.length === 0) continue;
    hasSuggestions = true;

    children.push(heading(sec.title));
    children.push(rule());

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      children.push(
        subheading(
          `${i + 1}. [${item.type}]${item.job ? ` (${item.job})` : ""}${item.category ? ` (${item.category})` : ""}`
        )
      );
      if (item.current) children.push(label("CURRENT", item.current));
      children.push(label("SUGGESTED", item.suggested));
      children.push(label("ADDRESSES", item.addresses));
      children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    }
  }

  if (!hasSuggestions && (!gaps || gaps.length === 0)) {
    children.push(heading("No Suggestions or Gaps"));
    children.push(body("The pre-approved content covers the job ad requirements well. No changes needed."));
  }

  return new Document({
    styles: { default: { document: { run: { font: "Calibri", size: 18 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children,
      },
    ],
  });
}

/**
 * Apply approved refinement integrations on top of the analysis CV overrides.
 * Modifies the cv object in-place with updated text from the refine preview.
 */
function applyRefinements(cv, refinement) {
  if (!refinement?.integratedSuggestions) return;

  for (const item of refinement.integratedSuggestions) {
    if (!item.updated) continue;

    switch (item.section) {
      case "summary":
        cv.summary = item.updated;
        break;
      case "highlights":
        if (item.original) {
          // Replace existing highlight
          const idx = (cv.highlights || []).indexOf(item.original);
          if (idx >= 0) cv.highlights[idx] = item.updated;
          else cv.highlights = [...(cv.highlights || []), item.updated];
        } else {
          // Add new highlight
          cv.highlights = [...(cv.highlights || []), item.updated];
        }
        break;
      case "competencies":
        // Competency updates are more complex - append or replace by matching category
        // For now, if it's a new competency item, we can't easily integrate into the
        // structured array. Log it and include in cover letter context instead.
        break;
      case "job_bullets":
        // Job bullet refinements - try to match and update
        if (item.original && cv.jobs) {
          for (const jobKey of Object.keys(cv.jobs)) {
            const job = cv.jobs[jobKey];
            if (!job.bullets) continue;
            const idx = job.bullets.indexOf(item.original);
            if (idx >= 0) {
              job.bullets[idx] = item.updated;
              break;
            }
          }
        }
        break;
      // cover_letter items are handled separately via coverLetterNotes
    }
  }
}

/**
 * Generate all materials for a job: CV, cover letter, suggestions, JSON.
 * @param {object} analysis - The full analysis object from analyzer
 * @param {string} jobAdText - The original job ad text (for cover letter generation)
 * @param {object} [options] - Optional refinement and user choices
 * @param {object} [options.refinement] - Approved refine preview (integratedSuggestions, coverLetterNotes, newContentPoints)
 * @param {object} [options.userChoices] - User's accepted suggestions and gap answers
 * @returns {object} outputs with consistent property names: cvPath, coverLetterPath, suggestionsPath, responsePath
 */
async function generateAll(analysis, jobAdText, options = {}) {
  const { buildCV } = loadAll();
  const { refinement, userChoices } = options;

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const companySlug = analysis.company_name
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_");

  // Apply approved refinements to the CV sections before building
  const cvData = JSON.parse(JSON.stringify(analysis.cv || {}));
  if (refinement) {
    console.log(`  Applying ${refinement.integratedSuggestions?.length || 0} refinements to CV`);
    applyRefinements(cvData, refinement);
  }

  // 1. CV DOCX
  const overrides = buildOverrides(cvData);
  const doc = buildCV(analysis.base_variant, overrides);
  const buffer = await Packer.toBuffer(doc);
  const cvFilename = `CV_Daniel_Oskarsson_${companySlug}_tailored.docx`;
  fs.writeFileSync(path.join(OUTPUT_DIR, cvFilename), buffer);
  console.log(`  CV: ${cvFilename}`);

  // 2. Cover Letter DOCX (AI-generated, enriched with refinement context)
  let coverLetterFilename = null;
  if (jobAdText) {
    try {
      // Build extra context from refinement for cover letter
      const coverLetterContext = buildCoverLetterContext(refinement, userChoices);
      const clResult = await generateCoverLetter(
        jobAdText,
        analysis.base_variant,
        companySlug,
        OUTPUT_DIR,
        coverLetterContext
      );
      coverLetterFilename = clResult.coverLetterFilename;
      console.log(`  Cover Letter: ${coverLetterFilename}`);
    } catch (err) {
      console.warn(`  Cover letter generation failed: ${err.message}`);
    }
  }

  // 3. Suggestions DOCX
  const sugDoc = buildSuggestionsDoc(analysis);
  const sugBuffer = await Packer.toBuffer(sugDoc);
  const sugFilename = `SUGGESTIONS_${companySlug}.docx`;
  fs.writeFileSync(path.join(OUTPUT_DIR, sugFilename), sugBuffer);
  console.log(`  Suggestions: ${sugFilename}`);

  // 4. Response JSON
  const jsonFilename = `RESPONSE_${companySlug}.json`;
  fs.writeFileSync(
    path.join(OUTPUT_DIR, jsonFilename),
    JSON.stringify(analysis, null, 2)
  );

  // 5. Create per-application folder and copy to JobSearch/Applications
  const appFolderName = `${companySlug}_${new Date().toISOString().slice(0, 10)}`;
  const appFolder = path.join(OUTPUT_DIR, appFolderName);
  if (!fs.existsSync(appFolder)) fs.mkdirSync(appFolder, { recursive: true });

  // Copy all files to application folder
  const filesToCopy = [cvFilename, sugFilename, jsonFilename];
  if (coverLetterFilename) filesToCopy.push(coverLetterFilename);
  for (const f of filesToCopy) {
    fs.copyFileSync(path.join(OUTPUT_DIR, f), path.join(appFolder, f));
  }

  // Also save job ad text for reference
  if (jobAdText) {
    fs.writeFileSync(
      path.join(appFolder, `JobAd_${companySlug}.md`),
      `# Job Ad - ${analysis.company_name}\n\n${jobAdText}`
    );
  }

  // Copy to JobSearch/Applications (dual output)
  try {
    if (!fs.existsSync(JOBSEARCH_DIR)) fs.mkdirSync(JOBSEARCH_DIR, { recursive: true });
    const jsFolder = path.join(JOBSEARCH_DIR, appFolderName);
    if (!fs.existsSync(jsFolder)) fs.mkdirSync(jsFolder, { recursive: true });
    for (const f of filesToCopy) {
      fs.copyFileSync(path.join(OUTPUT_DIR, f), path.join(jsFolder, f));
    }
    if (jobAdText) {
      fs.copyFileSync(
        path.join(appFolder, `JobAd_${companySlug}.md`),
        path.join(jsFolder, `JobAd_${companySlug}.md`)
      );
    }
    console.log(`  Packaged to: ${jsFolder}`);
  } catch (err) {
    console.warn(`  Failed to copy to JobSearch: ${err.message}`);
  }

  return {
    cvPath: cvFilename,
    coverLetterPath: coverLetterFilename,
    suggestionsPath: sugFilename,
    responsePath: jsonFilename,
    packageFolder: appFolderName,
  };
}

/**
 * Build extra context from refinement and user choices for the cover letter.
 * Returns a string that enriches the cover letter prompt with gap answers
 * and refinement notes.
 */
function buildCoverLetterContext(refinement, userChoices) {
  const parts = [];

  if (refinement?.coverLetterNotes) {
    parts.push(`## INTEGRATION NOTES\n${refinement.coverLetterNotes}`);
  }

  if (refinement?.newContentPoints?.length > 0) {
    parts.push(
      `## NEW CONTENT POINTS TO INCORPORATE\n${refinement.newContentPoints
        .map((p) => `- [${p.type}] ${p.text}`)
        .join("\n")}`
    );
  }

  if (userChoices?.gapAnswers) {
    const answers = Object.entries(userChoices.gapAnswers)
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `- Gap ${k}: ${v}`);
    if (answers.length > 0) {
      parts.push(`## GAP ANSWERS FROM CANDIDATE\n${answers.join("\n")}`);
    }
  }

  return parts.length > 0 ? parts.join("\n\n") : null;
}

module.exports = { generateAll, OUTPUT_DIR };
