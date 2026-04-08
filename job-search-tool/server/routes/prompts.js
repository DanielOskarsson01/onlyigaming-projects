const express = require("express");
const { v4: uuid } = require("uuid");
const {
  getPrompts,
  getPrompt,
  savePrompt,
  deletePrompt,
  duplicatePrompt,
  getSettings,
  saveSettings,
} = require("../lib/promptDb");

const router = express.Router();

// List prompts (optional ?type=analysis|cover_letter)
router.get("/", (req, res) => {
  const prompts = getPrompts(req.query.type || null);
  res.json({ prompts });
});

// Get single prompt
router.get("/settings", (req, res) => {
  res.json({ settings: getSettings() });
});

// Update settings
router.put("/settings", (req, res) => {
  const settings = saveSettings(req.body);
  res.json({ settings });
});

// Get single prompt
router.get("/:id", (req, res) => {
  const prompt = getPrompt(req.params.id);
  if (!prompt) return res.status(404).json({ error: "Prompt not found" });
  res.json({ prompt });
});

// Create new prompt
router.post("/", (req, res) => {
  const { type, name, systemPrompt } = req.body;
  if (!type || !name || !systemPrompt) {
    return res.status(400).json({ error: "type, name, and systemPrompt required" });
  }
  const prompt = savePrompt({
    id: uuid(),
    type,
    name,
    systemPrompt,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  res.json({ prompt });
});

// Update prompt
router.put("/:id", (req, res) => {
  const existing = getPrompt(req.params.id);
  if (!existing) return res.status(404).json({ error: "Prompt not found" });
  const updated = savePrompt({ ...existing, ...req.body, id: existing.id });
  res.json({ prompt: updated });
});

// Duplicate prompt
router.post("/:id/duplicate", (req, res) => {
  try {
    const copy = duplicatePrompt(req.params.id);
    res.json({ prompt: copy });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Delete prompt
router.delete("/:id", (req, res) => {
  try {
    deletePrompt(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
