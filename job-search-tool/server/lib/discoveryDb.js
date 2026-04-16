/**
 * JSON file database for discovery data.
 * Mirrors db.js pattern with atomic writes.
 */

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "discovery.json");
const SEED_PATH = path.join(__dirname, "..", "data", "discovery.seed.json");

const DEFAULT_DB = {
  sources: [],
  discoveries: [],
  searchProfile: {
    keywords: [
      "CMO", "CPO", "COO", "CEO",
      "Marknadschef", "Produktchef",
      "Chief Marketing Officer", "Chief Product Officer", "Chief Operating Officer",
      "Head of Marketing", "Head of Product",
      "VP Marketing", "VP Product",
    ],
    excludeKeywords: ["intern", "junior", "student", "trainee", "assistant", "praktikant"],
    locations: ["Stockholm", "Sweden", "Remote", "Europe", "Nordic", "Portugal", "Spain", "UAE", "Global"],
  },
  lastScanAt: null,
};

function read() {
  if (!fs.existsSync(DB_PATH)) {
    // First run: copy from seed if available, otherwise use defaults
    if (fs.existsSync(SEED_PATH)) {
      const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));
      write(seed);
      return seed;
    }
    return JSON.parse(JSON.stringify(DEFAULT_DB));
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

function getSources() {
  return read().sources;
}

function getSource(id) {
  return read().sources.find((s) => s.id === id) || null;
}

function saveSource(source) {
  const data = read();
  const idx = data.sources.findIndex((s) => s.id === source.id);
  if (idx >= 0) data.sources[idx] = source;
  else data.sources.push(source);
  write(data);
  return source;
}

function deleteSource(id) {
  const data = read();
  data.sources = data.sources.filter((s) => s.id !== id);
  write(data);
}

function getDiscoveries(statusFilter) {
  const data = read();
  if (!statusFilter || statusFilter.length === 0) return data.discoveries;
  return data.discoveries.filter((d) => statusFilter.includes(d.status));
}

function getDiscovery(id) {
  return read().discoveries.find((d) => d.id === id) || null;
}

function saveDiscovery(item) {
  const data = read();
  const idx = data.discoveries.findIndex((d) => d.id === item.id);
  if (idx >= 0) data.discoveries[idx] = item;
  else data.discoveries.push(item);
  write(data);
  return item;
}

function deleteDiscovery(id) {
  const data = read();
  data.discoveries = data.discoveries.filter((d) => d.id !== id);
  write(data);
}

function addDiscoveries(items) {
  const data = read();
  data.discoveries.push(...items);
  write(data);
}

function getSearchProfile() {
  return read().searchProfile;
}

function saveSearchProfile(profile) {
  const data = read();
  data.searchProfile = profile;
  write(data);
  return profile;
}

function getLastScanAt() {
  return read().lastScanAt;
}

function setLastScanAt(time) {
  const data = read();
  data.lastScanAt = time;
  write(data);
}

function cleanupOldDismissed(daysOld = 30) {
  const data = read();
  const cutoff = new Date(Date.now() - daysOld * 86400000).toISOString();
  const before = data.discoveries.length;
  data.discoveries = data.discoveries.filter(
    (d) => d.status !== "dismissed" || d.discoveredAt > cutoff
  );
  if (data.discoveries.length < before) write(data);
  return before - data.discoveries.length;
}

module.exports = {
  getSources,
  getSource,
  saveSource,
  deleteSource,
  getDiscoveries,
  getDiscovery,
  saveDiscovery,
  deleteDiscovery,
  addDiscoveries,
  getSearchProfile,
  saveSearchProfile,
  getLastScanAt,
  setLastScanAt,
  cleanupOldDismissed,
  _read: read,
  _write: write,
};
