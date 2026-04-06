/**
 * JobTech API adapter (Arbetsformedlingen / Platsbanken).
 * Free, no auth required. Docs: https://jobsearch.api.jobtechdev.se/
 */

const { httpGet } = require("../../lib/http");

async function fetchJobs(source) {
  const { baseUrl, params } = source.config;
  const qs = new URLSearchParams({ ...params, limit: params.limit || "100" });
  const url = `${baseUrl}?${qs}`;

  const res = await httpGet(url, { timeout: 15000 });
  if (res.status !== 200) {
    throw new Error(`JobTech API returned ${res.status}`);
  }

  const data = JSON.parse(res.body);
  const hits = data.hits || [];

  return hits.map((hit) => ({
    externalId: `jobtech-${hit.id}`,
    url: hit.webpage_url || hit.application_details?.url || null,
    title: hit.headline || "Unknown",
    company: hit.employer?.name || null,
    location: hit.workplace_address?.municipality || hit.workplace_address?.region || null,
    snippet: (hit.description?.text || "").slice(0, 200),
    postedAt: hit.publication_date || null,
  }));
}

module.exports = { fetchJobs };
