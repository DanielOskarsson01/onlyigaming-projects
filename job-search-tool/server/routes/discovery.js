const express = require("express");
const { v4: uuid } = require("uuid");
const db = require("../lib/discoveryDb");
const { runScan } = require("../services/discovery");
const { scrapeUrl } = require("../services/scraper");
const { saveJob } = require("../lib/db");
const { detectJobsOnPage } = require("../services/sourceDetector");

const router = express.Router();

// --- AI-Assisted Source Setup ---

router.post("/detect", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url required" });

  try {
    console.log(`[Discovery] Detecting jobs on: ${url}`);
    const result = await detectJobsOnPage(url);
    res.json(result);
  } catch (err) {
    console.error("[Discovery] Detection failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Sources ---

router.get("/sources", (req, res) => {
  res.json({ sources: db.getSources() });
});

router.post("/sources", (req, res) => {
  const source = { id: req.body.id || uuid(), ...req.body };
  if (!source.provider || !source.name) {
    return res.status(400).json({ error: "provider and name required" });
  }
  source.lastChecked = source.lastChecked || null;
  source.lastFoundCount = source.lastFoundCount || 0;
  source.lastError = source.lastError || null;
  source.enabled = source.enabled !== false;
  db.saveSource(source);
  res.json({ source });
});

router.put("/sources/:id", (req, res) => {
  const existing = db.getSource(req.params.id);
  if (!existing) return res.status(404).json({ error: "Source not found" });
  const updated = { ...existing, ...req.body, id: req.params.id };
  db.saveSource(updated);
  res.json({ source: updated });
});

router.delete("/sources/:id", (req, res) => {
  if (!db.getSource(req.params.id)) return res.status(404).json({ error: "Source not found" });
  db.deleteSource(req.params.id);
  res.json({ ok: true });
});

// --- Discoveries ---

router.get("/items", (req, res) => {
  const status = req.query.status;
  const filter = status ? [].concat(status) : null;
  const items = db.getDiscoveries(filter);
  // Sort newest first
  items.sort((a, b) => (b.discoveredAt || "").localeCompare(a.discoveredAt || ""));
  res.json({ items, total: items.length });
});

router.patch("/items/:id", (req, res) => {
  const item = db.getDiscovery(req.params.id);
  if (!item) return res.status(404).json({ error: "Discovery not found" });

  if (req.body.status) item.status = req.body.status;
  item.updatedAt = new Date().toISOString();
  db.saveDiscovery(item);
  res.json({ item });
});

router.delete("/items/:id", (req, res) => {
  if (!db.getDiscovery(req.params.id)) return res.status(404).json({ error: "Discovery not found" });
  db.deleteDiscovery(req.params.id);
  res.json({ ok: true });
});

// --- Promote: discovery → pipeline job ---

router.post("/items/:id/promote", async (req, res) => {
  const item = db.getDiscovery(req.params.id);
  if (!item) return res.status(404).json({ error: "Discovery not found" });

  const skipScrape = req.query.scrape === "false";

  try {
    let job;

    if (skipScrape && item.description) {
      // API already provided full description (e.g. Applyflow) — no scrape needed
      const textContent = item.description;
      job = {
        id: uuid(),
        url: item.url || null,
        title: item.title || "Unknown",
        company: item.company || null,
        status: "scraped",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scrapeResult: {
          textContent,
          wordCount: textContent.split(/\s+/).filter(Boolean).length,
          title: item.title,
          metaDescription: null,
          scrapeMethod: "api",
        },
        analysis: null,
        userChoices: null,
        outputs: null,
      };
    } else if (skipScrape) {
      // Create job entry without scraping (scraping happens in Validate step)
      job = {
        id: uuid(),
        url: item.url || null,
        title: item.title || "Unknown",
        company: item.company || null,
        status: "promoted",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scrapeResult: null,
        analysis: null,
        userChoices: null,
        outputs: null,
      };
    } else if (item.url) {
      // Scrape the job URL (legacy behavior)
      console.log(`[Promote] Scraping: ${item.url}`);
      const result = await scrapeUrl(item.url);

      job = {
        id: uuid(),
        url: item.url,
        title: result.title || item.title || "Unknown",
        company: item.company || null,
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
    } else {
      // No URL — create with snippet as text content
      job = {
        id: uuid(),
        url: null,
        title: item.title || "Unknown",
        company: item.company || null,
        status: "scraped",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scrapeResult: {
          textContent: item.snippet || "",
          wordCount: (item.snippet || "").split(/\s+/).filter(Boolean).length,
          title: item.title,
          metaDescription: null,
          scrapeMethod: "discovery",
        },
        analysis: null,
        userChoices: null,
        outputs: null,
      };
    }

    saveJob(job);

    // Update discovery item
    item.status = "promoted";
    item.promotedJobId = job.id;
    item.updatedAt = new Date().toISOString();
    db.saveDiscovery(item);

    res.json({ job, discovery: item });
  } catch (err) {
    console.error("[Promote] Failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Scan ---

router.post("/scan", async (req, res) => {
  const sourceId = req.query.sourceId || null;
  try {
    const results = await runScan(sourceId);
    res.json(results);
  } catch (err) {
    console.error("[Discovery] Scan error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Search Profile ---

router.get("/profile", (req, res) => {
  res.json({ profile: db.getSearchProfile() });
});

router.put("/profile", (req, res) => {
  if (!req.body) return res.status(400).json({ error: "Profile data required" });
  const profile = db.saveSearchProfile(req.body);
  res.json({ profile });
});

module.exports = router;
