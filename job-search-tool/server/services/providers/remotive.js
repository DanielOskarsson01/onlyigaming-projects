/**
 * Remotive API adapter.
 * Free JSON endpoint at https://remotive.com/api/remote-jobs
 */

const { httpGet } = require("../../lib/http");

function stripHtml(str) {
  return (str || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchJobs(source) {
  const { baseUrl, params } = source.config;
  const url = baseUrl || "https://remotive.com/api/remote-jobs";
  const qs = new URLSearchParams(params || {});
  const fullUrl = qs.toString() ? `${url}?${qs}` : url;

  const res = await httpGet(fullUrl, { timeout: 15000 });
  if (res.status !== 200) {
    throw new Error(`Remotive API returned ${res.status}`);
  }

  const data = JSON.parse(res.body);
  const jobs = data.jobs || [];

  return jobs.map((job) => ({
    externalId: `remotive-${job.id}`,
    url: job.url || null,
    title: job.title || "Unknown",
    company: job.company_name || null,
    location: job.candidate_required_location || "Remote",
    snippet: stripHtml(job.description || "").slice(0, 200),
    category: job.category || null,
    postedAt: job.publication_date || null,
  }));
}

module.exports = { fetchJobs };
