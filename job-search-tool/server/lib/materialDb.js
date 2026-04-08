/**
 * JSON file database for uploaded materials.
 * Auto-seeds from existing CVS_DIR files on first access.
 */

const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const DB_PATH = path.join(__dirname, "..", "data", "materials.json");
const MATERIALS_DIR = path.join(__dirname, "..", "data", "materials");

const CVS_DIR =
  process.env.CVS_DIR ||
  "/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/JobSearch/CVs";

// Files to seed from CVS_DIR on first access
const SEED_FILES = [
  { filename: "COMPETENCY_MASTER_POOL.json", name: "Competency Master Pool", category: "competencies" },
  { filename: "CV_JOB_VARIANTS.md", name: "CV Job Variants", category: "variants" },
  { filename: "CV_SECTION_VARIANTS.md", name: "CV Section Variants", category: "variants" },
  { filename: "cv/MASTER_CV.md", name: "Master CV", category: "cv" },
  { filename: "cv_data.json", name: "CV Data (identity positioning)", category: "other" },
];

const DEFAULT_DB = {
  materials: [],
  materialSets: [],
};

function ensureDir() {
  if (!fs.existsSync(MATERIALS_DIR)) fs.mkdirSync(MATERIALS_DIR, { recursive: true });
}

function read() {
  if (!fs.existsSync(DB_PATH)) {
    // First run: seed from CVS_DIR
    const data = seed();
    write(data);
    return data;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function write(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

/** Seed materials from existing CVS_DIR files. */
function seed() {
  ensureDir();
  const data = JSON.parse(JSON.stringify(DEFAULT_DB));
  const materialIds = [];

  for (const sf of SEED_FILES) {
    const srcPath = path.join(CVS_DIR, sf.filename);
    if (!fs.existsSync(srcPath)) {
      console.warn(`[MaterialDb] Seed: ${sf.filename} not found, skipping`);
      continue;
    }

    const id = uuid();
    const ext = path.extname(sf.filename);
    const storedFilename = `${id}${ext}`;

    // Copy file into materials dir
    fs.copyFileSync(srcPath, path.join(MATERIALS_DIR, storedFilename));

    data.materials.push({
      id,
      name: sf.name,
      filename: storedFilename,
      originalFilename: path.basename(sf.filename),
      category: sf.category,
      tags: ["default"],
      enabled: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    materialIds.push(id);
    console.log(`[MaterialDb] Seeded: ${sf.name} (${storedFilename})`);
  }

  // Create default material set
  if (materialIds.length > 0) {
    data.materialSets.push({
      id: uuid(),
      name: "Standard (All Materials)",
      materialIds,
      isDefault: true,
      createdAt: new Date().toISOString(),
    });
  }

  return data;
}

function getMaterials(category) {
  const data = read();
  if (category) return data.materials.filter((m) => m.category === category);
  return data.materials;
}

function getMaterial(id) {
  return read().materials.find((m) => m.id === id) || null;
}

function saveMaterial(material) {
  const data = read();
  const idx = data.materials.findIndex((m) => m.id === material.id);
  material.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    data.materials[idx] = material;
  } else {
    material.createdAt = material.createdAt || new Date().toISOString();
    data.materials.push(material);
  }
  write(data);
  return material;
}

function deleteMaterial(id) {
  const data = read();
  const material = data.materials.find((m) => m.id === id);
  if (!material) return;

  // Remove file
  const filePath = path.join(MATERIALS_DIR, material.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  // Remove from all material sets
  for (const set of data.materialSets) {
    set.materialIds = set.materialIds.filter((mid) => mid !== id);
  }

  data.materials = data.materials.filter((m) => m.id !== id);
  write(data);
}

/** Upload a new material from base64 content. */
function uploadMaterial({ name, content, originalFilename, category, tags }) {
  ensureDir();
  const id = uuid();
  const ext = path.extname(originalFilename || ".txt");
  const storedFilename = `${id}${ext}`;

  // Write file
  const isBase64 = /^[A-Za-z0-9+/=\s]+$/.test(content) && content.length > 100;
  if (isBase64) {
    fs.writeFileSync(path.join(MATERIALS_DIR, storedFilename), Buffer.from(content, "base64"));
  } else {
    fs.writeFileSync(path.join(MATERIALS_DIR, storedFilename), content, "utf-8");
  }

  const material = {
    id,
    name: name || originalFilename || "Untitled",
    filename: storedFilename,
    originalFilename: originalFilename || storedFilename,
    category: category || "other",
    tags: tags || [],
    enabled: true,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const data = read();
  data.materials.push(material);
  write(data);
  return material;
}

/** Read material file content. */
function getMaterialContent(id) {
  const material = getMaterial(id);
  if (!material) return null;
  const filePath = path.join(MATERIALS_DIR, material.filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

// Material Sets
function getMaterialSets() {
  return read().materialSets;
}

function getMaterialSet(id) {
  return read().materialSets.find((s) => s.id === id) || null;
}

function saveMaterialSet(set) {
  const data = read();
  const idx = data.materialSets.findIndex((s) => s.id === set.id);
  if (idx >= 0) {
    data.materialSets[idx] = set;
  } else {
    set.createdAt = set.createdAt || new Date().toISOString();
    data.materialSets.push(set);
  }
  write(data);
  return set;
}

function deleteMaterialSet(id) {
  const data = read();
  data.materialSets = data.materialSets.filter((s) => s.id !== id);
  write(data);
}

/** Load all materials in a set as { name, content } array. */
function loadMaterialSetContents(setId) {
  const set = getMaterialSet(setId);
  if (!set) return null;
  const results = [];
  for (const mid of set.materialIds) {
    const mat = getMaterial(mid);
    if (!mat || !mat.enabled) continue;
    const content = getMaterialContent(mid);
    if (content) {
      results.push({ id: mat.id, name: mat.name, category: mat.category, content });
    }
  }
  return results;
}

module.exports = {
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
  loadMaterialSetContents,
  MATERIALS_DIR,
};
