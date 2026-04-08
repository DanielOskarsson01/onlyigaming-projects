/**
 * Knowledge bank — persistent cross-job learning.
 * Stores content points (bullets, achievements, competencies) derived from
 * accepted suggestions and gap answers. Grows with each job application.
 */

const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const DB_PATH = path.join(__dirname, "..", "data", "knowledge.json");

const DEFAULT_DB = {
  contentPoints: [],
  rejectedPatterns: [],
};

function read() {
  if (!fs.existsSync(DB_PATH)) {
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

function getContentPoints() {
  return read().contentPoints;
}

function getContentPoint(id) {
  return read().contentPoints.find((p) => p.id === id) || null;
}

function addContentPoint(point) {
  const data = read();
  const entry = {
    id: uuid(),
    type: point.type || "bullet",
    text: point.text,
    context: point.context || null,
    sourceJobId: point.sourceJobId || null,
    sourceJobTitle: point.sourceJobTitle || null,
    section: point.section || null,
    createdAt: new Date().toISOString(),
    usedInJobs: point.usedInJobs || [],
    tags: point.tags || [],
  };
  data.contentPoints.push(entry);
  write(data);
  return entry;
}

function updateContentPoint(id, updates) {
  const data = read();
  const idx = data.contentPoints.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  data.contentPoints[idx] = { ...data.contentPoints[idx], ...updates, id };
  write(data);
  return data.contentPoints[idx];
}

function deleteContentPoint(id) {
  const data = read();
  data.contentPoints = data.contentPoints.filter((p) => p.id !== id);
  write(data);
}

/** Record a rejected suggestion pattern (to avoid re-suggesting). */
function addRejectedPattern(text, reason) {
  const data = read();
  const existing = data.rejectedPatterns.find((p) => p.text === text);
  if (existing) {
    existing.rejectedCount = (existing.rejectedCount || 1) + 1;
    existing.reason = reason || existing.reason;
  } else {
    data.rejectedPatterns.push({
      text,
      reason: reason || null,
      rejectedCount: 1,
      createdAt: new Date().toISOString(),
    });
  }
  write(data);
}

function getRejectedPatterns() {
  return read().rejectedPatterns;
}

/** Mark that a content point was used in a specific job. */
function markUsedInJob(contentPointId, jobId) {
  const data = read();
  const point = data.contentPoints.find((p) => p.id === contentPointId);
  if (!point) return;
  if (!point.usedInJobs.includes(jobId)) {
    point.usedInJobs.push(jobId);
    write(data);
  }
}

/**
 * Build knowledge context string for inclusion in prompts.
 * Returns a formatted string of learned content points.
 */
function buildKnowledgeContext() {
  const points = getContentPoints();
  if (points.length === 0) return null;

  const lines = points.map((p) => {
    const usage = p.usedInJobs.length > 0 ? ` (used in ${p.usedInJobs.length} jobs)` : "";
    return `- [${p.type}] ${p.text}${usage}`;
  });

  const rejected = getRejectedPatterns();
  const rejectLines = rejected
    .filter((r) => r.rejectedCount >= 2)
    .map((r) => `- AVOID: "${r.text}" (rejected ${r.rejectedCount}x)`);

  let context = `=== LEARNED CONTENT (from previous applications) ===\n${lines.join("\n")}`;
  if (rejectLines.length > 0) {
    context += `\n\n=== REJECTED PATTERNS (do not suggest these) ===\n${rejectLines.join("\n")}`;
  }

  return context;
}

module.exports = {
  getContentPoints,
  getContentPoint,
  addContentPoint,
  updateContentPoint,
  deleteContentPoint,
  addRejectedPattern,
  getRejectedPatterns,
  markUsedInJob,
  buildKnowledgeContext,
};
