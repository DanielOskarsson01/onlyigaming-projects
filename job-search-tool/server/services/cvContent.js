/**
 * Load CV source documents from JobSearch/CVs/ at runtime.
 * Single source of truth — edits to source files are picked up on reload.
 */

const fs = require("fs");
const path = require("path");

const CVS_DIR =
  process.env.CVS_DIR ||
  "/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/JobSearch/CVs";

function loadFile(filename) {
  const p = path.join(CVS_DIR, filename);
  if (fs.existsSync(p)) return fs.readFileSync(p, "utf-8");
  const alt = path.join(CVS_DIR, "cv", filename);
  if (fs.existsSync(alt)) return fs.readFileSync(alt, "utf-8");
  console.warn(`Warning: ${filename} not found in ${CVS_DIR}`);
  return "";
}

let cached = null;

function loadAll() {
  if (cached) return cached;

  const POOL = JSON.parse(loadFile("COMPETENCY_MASTER_POOL.json"));
  const JOB_VARIANTS_MD = loadFile("CV_JOB_VARIANTS.md");
  const SECTION_VARIANTS_MD = loadFile("CV_SECTION_VARIANTS.md");
  const MASTER_CV_MD = loadFile("cv/MASTER_CV.md") || loadFile("MASTER_CV.md");
  const CV_DATA = JSON.parse(loadFile("cv_data.json"));

  // Load the core CV generator (stays in original location)
  const { VARIANTS, buildCV, TEAL, BLACK, BODY } = require(
    path.join(CVS_DIR, "generate_core_cvs")
  );

  cached = {
    POOL,
    JOB_VARIANTS_MD,
    SECTION_VARIANTS_MD,
    MASTER_CV_MD,
    CV_DATA,
    VARIANTS,
    buildCV,
    TEAL,
    BLACK,
    BODY,
  };

  return cached;
}

/** Force reload (after editing source docs). */
function reload() {
  cached = null;
  // Clear require cache for generate_core_cvs.js
  const cvsPath = path.join(CVS_DIR, "generate_core_cvs.js");
  delete require.cache[require.resolve(cvsPath)];
  return loadAll();
}

module.exports = { loadAll, reload, CVS_DIR };
