const express = require("express");
const { getJob, saveJob } = require("../lib/db");
const { analyzeJobAd } = require("../services/analyzer");

const router = express.Router();

// Run 5-layer analysis on a scraped job
router.post("/:jobId", async (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });

  if (!job.scrapeResult?.textContent) {
    return res.status(400).json({ error: "Job has no scraped text content" });
  }

  try {
    const { promptId } = req.body || {};
    console.log(`Analyzing: ${job.title} (${job.url || "pasted"})${promptId ? ` with prompt ${promptId}` : ""}`);
    const analysis = await analyzeJobAd(job.scrapeResult.textContent, { promptId });

    // Store in analyses array for multi-analysis comparison
    if (!job.analyses) job.analyses = [];
    const analysisEntry = {
      id: require("uuid").v4(),
      promptId: analysis._promptId || null,
      result: analysis,
      createdAt: new Date().toISOString(),
    };
    job.analyses.push(analysisEntry);
    job.activeAnalysisId = analysisEntry.id;

    // Backward compat: keep top-level analysis
    job.analysis = analysis;
    job.company = analysis.company_name || job.company;
    job.status = "analyzed";
    job.updatedAt = new Date().toISOString();
    saveJob(job);

    res.json({ analysis });
  } catch (err) {
    console.error("Analysis failed:", err.message);
    job.status = "error";
    job.updatedAt = new Date().toISOString();
    saveJob(job);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
