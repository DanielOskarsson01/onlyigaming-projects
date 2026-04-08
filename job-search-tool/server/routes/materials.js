const express = require("express");
const { v4: uuid } = require("uuid");
const {
  getMaterials,
  getMaterial,
  saveMaterial,
  deleteMaterial,
  uploadMaterial,
  getMaterialContent,
  getMaterialSets,
  getMaterialSet,
  saveMaterialSet,
  deleteMaterialSet,
} = require("../lib/materialDb");

const router = express.Router();

// List materials (optional ?category=cv|competencies|variants|other)
router.get("/", (req, res) => {
  const materials = getMaterials(req.query.category || null);
  res.json({ materials });
});

// Upload new material
router.post("/upload", (req, res) => {
  const { name, content, originalFilename, category, tags } = req.body;
  if (!content) return res.status(400).json({ error: "content required" });
  try {
    const material = uploadMaterial({ name, content, originalFilename, category, tags });
    res.json({ material });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get material content (preview)
router.get("/:id/content", (req, res) => {
  const content = getMaterialContent(req.params.id);
  if (content === null) return res.status(404).json({ error: "Material not found" });
  res.json({ content });
});

// Update material metadata
router.put("/:id", (req, res) => {
  const existing = getMaterial(req.params.id);
  if (!existing) return res.status(404).json({ error: "Material not found" });
  const updated = saveMaterial({ ...existing, ...req.body, id: existing.id });
  res.json({ material: updated });
});

// Delete material
router.delete("/:id", (req, res) => {
  const existing = getMaterial(req.params.id);
  if (!existing) return res.status(404).json({ error: "Material not found" });
  deleteMaterial(req.params.id);
  res.json({ ok: true });
});

// --- Material Sets ---

router.get("/sets", (req, res) => {
  res.json({ materialSets: getMaterialSets() });
});

router.get("/sets/:id", (req, res) => {
  const set = getMaterialSet(req.params.id);
  if (!set) return res.status(404).json({ error: "Material set not found" });
  res.json({ materialSet: set });
});

router.post("/sets", (req, res) => {
  const { name, materialIds } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const set = saveMaterialSet({
    id: uuid(),
    name,
    materialIds: materialIds || [],
    isDefault: false,
    createdAt: new Date().toISOString(),
  });
  res.json({ materialSet: set });
});

router.put("/sets/:id", (req, res) => {
  const existing = getMaterialSet(req.params.id);
  if (!existing) return res.status(404).json({ error: "Material set not found" });
  const updated = saveMaterialSet({ ...existing, ...req.body, id: existing.id });
  res.json({ materialSet: updated });
});

router.delete("/sets/:id", (req, res) => {
  deleteMaterialSet(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
