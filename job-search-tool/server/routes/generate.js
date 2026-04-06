const express = require("express");
const path = require("path");
const { getJob, saveJob } = require("../lib/db");
const { generateAll, OUTPUT_DIR } = require("../services/cvGenerator");

const router = express.Router();

// Generate all materials (CV + cover letter + suggestions + JSON) from analysis
router.post("/:jobId", async (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (!job.analysis) return res.status(400).json({ error: "Job not analyzed yet" });

  try {
    console.log(`Generating all materials for: ${job.analysis.company_name}`);
    const jobAdText = job.scrapeResult?.textContent || null;
    const outputs = await generateAll(job.analysis, jobAdText);

    job.outputs = outputs;
    job.status = "generated";
    job.updatedAt = new Date().toISOString();
    saveJob(job);

    res.json({ outputs });
  } catch (err) {
    console.error("Generation failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Download a generated file
router.get("/download/:filename", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.filename);
  if (!filePath.startsWith(path.resolve(OUTPUT_DIR))) {
    return res.status(400).json({ error: "Invalid filename" });
  }
  res.download(filePath, (err) => {
    if (err) res.status(404).json({ error: "File not found" });
  });
});

module.exports = router;
