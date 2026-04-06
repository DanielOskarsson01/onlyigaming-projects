/**
 * RemoteOK API adapter.
 * Free JSON endpoint at https://remoteok.com/api
 * First element in array is metadata (legal notice) — skip it.
 */

const { httpGet } = require("../../lib/http");

function stripHtml(str) {
  return (str || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchJobs(source) {
  const { baseUrl } = source.config;
  const url = baseUrl || "https://remoteok.com/api";

  const res = await httpGet(url, { timeout: 15000 });
  if (res.status !== 200) {
    throw new Error(`RemoteOK API returned ${res.status}`);
  }

  const data = JSON.parse(res.body);
  // First element is legal/metadata object — skip it
  const jobs = Array.isArray(data) ? data.slice(1) : [];

  return jobs.map((job) => ({
    externalId: `remoteok-${job.id || job.slug}`,
    url: job.url || (job.slug ? `https://remoteok.com/remote-jobs/${job.slug}` : null),
    title: job.position || "Unknown",
    company: job.company || null,
    location: job.location || "Remote",
    snippet: stripHtml(job.description || "").slice(0, 200),
    tags: job.tags || [],
    postedAt: job.date || null,
  }));
}

module.exports = { fetchJobs };
