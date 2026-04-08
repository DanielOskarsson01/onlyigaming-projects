const express = require("express");
const {
  getContentPoints,
  getContentPoint,
  addContentPoint,
  updateContentPoint,
  deleteContentPoint,
  getRejectedPatterns,
} = require("../lib/knowledgeDb");

const router = express.Router();

// List all content points
router.get("/", (req, res) => {
  res.json({ contentPoints: getContentPoints(), rejectedPatterns: getRejectedPatterns() });
});

// Add content point manually
router.post("/", (req, res) => {
  const { type, text, context, section, tags } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });
  const point = addContentPoint({ type, text, context, section, tags });
  res.json({ contentPoint: point });
});

// Update content point
router.put("/:id", (req, res) => {
  const updated = updateContentPoint(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Content point not found" });
  res.json({ contentPoint: updated });
});

// Delete content point
router.delete("/:id", (req, res) => {
  deleteContentPoint(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
