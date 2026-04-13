const express = require("express");
const { v4: uuid } = require("uuid");
const { scrapeUrl } = require("../services/scraper");
const { getJob, saveJob } = require("../lib/db");

const router = express.Router();

// Scrape one or more URLs and create job entries
router.post("/", async (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "urls array required" });
  }

  const results = [];

  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed) continue;

    console.log(`Scraping: ${trimmed}`);
    const result = await scrapeUrl(trimmed);

    const job = {
      id: uuid(),
      url: trimmed,
      title: result.title || "Unknown",
      company: null,
      status: result.status === "success" ? "scraped" : "scrape_failed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scrapeResult: {
        textContent: result.textContent,
        wordCount: result.wordCount,
        title: result.title,
        metaDescription: result.metaDescription,
        scrapeMethod: "readability",
        error: result.error,
      },
      analysis: null,
      userChoices: null,
      outputs: null,
    };

    saveJob(job);
    results.push({
      id: job.id,
      url: trimmed,
      title: result.title,
      wordCount: result.wordCount,
      status: job.status,
      error: result.error,
    });
  }

  res.json({ results });
});

// Scrape an existing job by ID
router.post("/:jobId", async (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });

  if (job.scrapeResult?.textContent && job.status !== "promoted") {
    return res.json({ job, skipped: true });
  }

  if (!job.url) {
    return res.status(400).json({ error: "Job has no URL to scrape" });
  }

  try {
    console.log(`[Scrape] Scraping job ${job.id}: ${job.url}`);
    const result = await scrapeUrl(job.url);

    job.scrapeResult = {
      textContent: result.textContent,
      wordCount: result.wordCount,
      title: result.title,
      metaDescription: result.metaDescription,
      scrapeMethod: result.scrapeMethod || "readability",
      error: result.error,
    };
    job.title = result.title || job.title;
    job.status = result.status === "success" ? "scraped" : "scrape_failed";
    job.updatedAt = new Date().toISOString();
    saveJob(job);

    res.json({ job });
  } catch (err) {
    job.status = "scrape_failed";
    job.scrapeResult = { error: err.message };
    job.updatedAt = new Date().toISOString();
    saveJob(job);
    res.status(500).json({ error: err.message, job });
  }
});

module.exports = router;
