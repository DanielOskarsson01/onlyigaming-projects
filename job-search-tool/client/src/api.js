const API = '/api';

export async function fetchJobs() {
  const res = await fetch(`${API}/jobs`);
  return res.json();
}

export async function fetchJob(id) {
  const res = await fetch(`${API}/jobs/${id}`);
  return res.json();
}

export async function createJob({ title, company, textContent }) {
  const res = await fetch(`${API}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, company, textContent }),
  });
  return res.json();
}

export async function deleteJob(id) {
  const res = await fetch(`${API}/jobs/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function scrapeUrls(urls) {
  const res = await fetch(`${API}/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  });
  return res.json();
}

export async function analyzeJob(jobId) {
  const res = await fetch(`${API}/analyze/${jobId}`, { method: 'POST' });
  return res.json();
}

export async function saveChoices(jobId, choices) {
  const res = await fetch(`${API}/jobs/${jobId}/choices`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(choices),
  });
  return res.json();
}

export async function generateCv(jobId) {
  const res = await fetch(`${API}/generate/${jobId}`, { method: 'POST' });
  return res.json();
}

export function downloadUrl(filename) {
  return `${API}/generate/download/${filename}`;
}

// --- Discovery API ---

export async function fetchDiscoveries(statusFilter) {
  const params = new URLSearchParams();
  if (statusFilter) {
    for (const s of [].concat(statusFilter)) params.append('status', s);
  }
  const qs = params.toString();
  const res = await fetch(`${API}/discovery/items${qs ? '?' + qs : ''}`);
  return res.json();
}

export async function patchDiscoveryItem(id, update) {
  const res = await fetch(`${API}/discovery/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  return res.json();
}

export async function promoteDiscoveryItem(id) {
  const res = await fetch(`${API}/discovery/items/${id}/promote`, { method: 'POST' });
  return res.json();
}

export async function triggerScan(sourceId) {
  const params = sourceId ? `?sourceId=${sourceId}` : '';
  const res = await fetch(`${API}/discovery/scan${params}`, { method: 'POST' });
  return res.json();
}

export async function fetchSources() {
  const res = await fetch(`${API}/discovery/sources`);
  return res.json();
}

export async function createSource(source) {
  const res = await fetch(`${API}/discovery/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(source),
  });
  return res.json();
}

export async function updateSource(id, update) {
  const res = await fetch(`${API}/discovery/sources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  return res.json();
}

export async function deleteSource(id) {
  const res = await fetch(`${API}/discovery/sources/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchSearchProfile() {
  const res = await fetch(`${API}/discovery/profile`);
  return res.json();
}

export async function updateSearchProfile(profile) {
  const res = await fetch(`${API}/discovery/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return res.json();
}

export async function detectSource(url) {
  const res = await fetch(`${API}/discovery/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return res.json();
}
