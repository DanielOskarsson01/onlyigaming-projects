/**
 * Simple JSON file database with atomic writes.
 */

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "jobs.json");

function read() {
  if (!fs.existsSync(DB_PATH)) {
    return { jobs: [] };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function write(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Atomic write: temp file then rename
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

function getJobs() {
  return read().jobs;
}

function getJob(id) {
  return read().jobs.find((j) => j.id === id) || null;
}

function saveJob(job) {
  const data = read();
  const idx = data.jobs.findIndex((j) => j.id === job.id);
  if (idx >= 0) {
    data.jobs[idx] = job;
  } else {
    data.jobs.push(job);
  }
  write(data);
  return job;
}

function deleteJob(id) {
  const data = read();
  data.jobs = data.jobs.filter((j) => j.id !== id);
  write(data);
}

module.exports = { getJobs, getJob, saveJob, deleteJob };
