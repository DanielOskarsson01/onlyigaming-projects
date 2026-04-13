const express = require("express");
const { getJobs, getJob, saveJob, deleteJob } = require("../lib/db");

const router = express.Router();

// List all jobs (without full textContent to keep response small)
router.get("/", (req, res) => {
  const jobs = getJobs().map((j) => ({
    ...j,
    scrapeResult: j.scrapeResult
      ? { ...j.scrapeResult, textContent: undefined }
      : null,
    analysis: j.analysis
      ? { company_name: j.analysis.company_name, base_variant: j.analysis.base_variant, variant_reasoning: j.analysis.variant_reasoning, fit_score: j.analysis.fit_score }
      : null,
  }));
  res.json({ jobs });
});

// Get single job with full detail
router.get("/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json({ job });
});

// Create job(s) from pasted text (no URL)
router.post("/", (req, res) => {
  const { title, company, textContent } = req.body;
  if (!textContent) return res.status(400).json({ error: "textContent required" });

  const { v4: uuid } = require("uuid");
  const job = {
    id: uuid(),
    url: null,
    title: title || "Pasted job ad",
    company: company || null,
    status: "scraped",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scrapeResult: {
      textContent,
      wordCount: textContent.split(/\s+/).filter(Boolean).length,
      title: title || null,
      metaDescription: null,
      scrapeMethod: "manual",
    },
    analysis: null,
    userChoices: null,
    outputs: null,
  };

  saveJob(job);
  res.json({ job });
});

// Delete a job
router.delete("/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  deleteJob(req.params.id);
  res.json({ ok: true });
});

// Manually set job text content (fallback when scraping fails)
router.patch("/:id/text", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const { textContent } = req.body;
  if (!textContent?.trim()) return res.status(400).json({ error: "textContent required" });

  job.scrapeResult = {
    textContent: textContent.trim(),
    wordCount: textContent.trim().split(/\s+/).filter(Boolean).length,
    title: job.title,
    metaDescription: null,
    scrapeMethod: "manual",
  };
  job.status = "scraped";
  job.updatedAt = new Date().toISOString();
  saveJob(job);
  res.json({ job });
});

// Save user choices (accept/reject suggestions, gap answers)
router.patch("/:id/choices", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  job.userChoices = req.body;
  job.status = "reviewed";
  job.updatedAt = new Date().toISOString();
  saveJob(job);
  res.json({ job });
});

module.exports = router;
