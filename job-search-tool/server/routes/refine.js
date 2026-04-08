const express = require("express");
const { v4: uuid } = require("uuid");
const { getJob, saveJob } = require("../lib/db");
const { generateRefinePreview } = require("../services/refiner");
const { addContentPoint, addRejectedPattern } = require("../lib/knowledgeDb");

const router = express.Router();

// Generate initial refine preview
router.post("/:jobId", async (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (!job.analysis) return res.status(400).json({ error: "Job not analyzed" });
  if (!job.userChoices) return res.status(400).json({ error: "No user choices saved" });

  try {
    console.log(`Refining: ${job.analysis.company_name}`);
    const preview = await generateRefinePreview({
      analysis: job.analysis,
      userChoices: job.userChoices,
    });

    const iteration = {
      id: uuid(),
      preview,
      userComments: null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (!job.refinement) {
      job.refinement = { iterations: [], activeIterationId: null, status: "in_progress" };
    }
    job.refinement.iterations.push(iteration);
    job.refinement.activeIterationId = iteration.id;
    job.updatedAt = new Date().toISOString();
    saveJob(job);

    res.json({ iteration });
  } catch (err) {
    console.error("Refine failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Re-run refine with user comments (iterate)
router.post("/:jobId/iterate", async (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (!job.refinement) return res.status(400).json({ error: "No refinement started" });

  const { comments } = req.body;

  // Mark current iteration as commented
  const current = job.refinement.iterations.find(
    (i) => i.id === job.refinement.activeIterationId
  );
  if (current) {
    current.userComments = comments;
    current.status = "commented";
  }

  try {
    console.log(`Re-refining with comments: ${job.analysis.company_name}`);
    const preview = await generateRefinePreview({
      analysis: job.analysis,
      userChoices: job.userChoices,
      comments,
    });

    const iteration = {
      id: uuid(),
      preview,
      userComments: null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    job.refinement.iterations.push(iteration);
    job.refinement.activeIterationId = iteration.id;
    job.updatedAt = new Date().toISOString();
    saveJob(job);

    res.json({ iteration });
  } catch (err) {
    console.error("Refine iterate failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Approve current iteration
router.patch("/:jobId/approve", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (!job.refinement) return res.status(400).json({ error: "No refinement started" });

  const current = job.refinement.iterations.find(
    (i) => i.id === job.refinement.activeIterationId
  );
  if (!current) return res.status(400).json({ error: "No active iteration" });

  // Mark as approved
  current.status = "approved";
  job.refinement.status = "approved";
  job.status = "refined";
  job.updatedAt = new Date().toISOString();

  // Save new content points to knowledge bank
  const preview = current.preview;
  if (preview?.newContentPoints) {
    for (const point of preview.newContentPoints) {
      addContentPoint({
        type: point.type,
        text: point.text,
        context: point.derivedFrom,
        sourceJobId: job.id,
        sourceJobTitle: `${job.title} @ ${job.company || "Unknown"}`,
        section: point.type === "highlight" ? "highlights" : null,
        tags: [],
      });
    }
    console.log(`  Saved ${preview.newContentPoints.length} knowledge points`);
  }

  // Save rejected suggestions to rejected patterns
  if (job.userChoices?.accepted) {
    const suggestions = job.analysis?.suggestions || {};
    for (const [key, val] of Object.entries(job.userChoices.accepted)) {
      if (val !== false) continue;
      const [section, indexStr] = key.split(".");
      const item = suggestions[section]?.items?.[parseInt(indexStr)];
      if (item) {
        addRejectedPattern(item.text || item.suggestion || "", "User rejected");
      }
    }
  }

  saveJob(job);
  res.json({ job: { id: job.id, status: job.status, refinement: job.refinement } });
});

module.exports = router;
