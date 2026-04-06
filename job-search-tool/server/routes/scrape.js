const express = require("express");
const { v4: uuid } = require("uuid");
const { scrapeUrl } = require("../services/scraper");
const { saveJob } = require("../lib/db");

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

module.exports = router;
