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

export async function analyzeJob(jobId, { promptId } = {}) {
  const res = await fetch(`${API}/analyze/${jobId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promptId }),
  });
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

// --- Prompts & Settings API ---

export async function fetchPrompts(type) {
  const qs = type ? `?type=${type}` : '';
  const res = await fetch(`${API}/prompts${qs}`);
  return res.json();
}

export async function fetchPrompt(id) {
  const res = await fetch(`${API}/prompts/${id}`);
  return res.json();
}

export async function createPrompt(prompt) {
  const res = await fetch(`${API}/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prompt),
  });
  return res.json();
}

export async function updatePrompt(id, data) {
  const res = await fetch(`${API}/prompts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePrompt(id) {
  const res = await fetch(`${API}/prompts/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function duplicatePrompt(id) {
  const res = await fetch(`${API}/prompts/${id}/duplicate`, { method: 'POST' });
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API}/prompts/settings`);
  return res.json();
}

export async function updateSettings(settings) {
  const res = await fetch(`${API}/prompts/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return res.json();
}

// --- Materials API ---

export async function fetchMaterials(category) {
  const qs = category ? `?category=${category}` : '';
  const res = await fetch(`${API}/materials${qs}`);
  return res.json();
}

export async function uploadMaterial(data) {
  const res = await fetch(`${API}/materials/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateMaterial(id, data) {
  const res = await fetch(`${API}/materials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteMaterial(id) {
  const res = await fetch(`${API}/materials/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchMaterialContent(id) {
  const res = await fetch(`${API}/materials/${id}/content`);
  return res.json();
}

export async function fetchMaterialSets() {
  const res = await fetch(`${API}/materials/sets`);
  return res.json();
}

export async function createMaterialSet(data) {
  const res = await fetch(`${API}/materials/sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateMaterialSet(id, data) {
  const res = await fetch(`${API}/materials/sets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteMaterialSet(id) {
  const res = await fetch(`${API}/materials/sets/${id}`, { method: 'DELETE' });
  return res.json();
}

// --- Knowledge Bank API ---

export async function fetchKnowledge() {
  const res = await fetch(`${API}/knowledge`);
  return res.json();
}

export async function addKnowledgePoint(data) {
  const res = await fetch(`${API}/knowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateKnowledgePoint(id, data) {
  const res = await fetch(`${API}/knowledge/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteKnowledgePoint(id) {
  const res = await fetch(`${API}/knowledge/${id}`, { method: 'DELETE' });
  return res.json();
}

// --- Refine API ---

export async function refineJob(jobId) {
  const res = await fetch(`${API}/refine/${jobId}`, { method: 'POST' });
  return res.json();
}

export async function refineIterate(jobId, comments) {
  const res = await fetch(`${API}/refine/${jobId}/iterate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comments }),
  });
  return res.json();
}

export async function refineApprove(jobId) {
  const res = await fetch(`${API}/refine/${jobId}/approve`, { method: 'PATCH' });
  return res.json();
}
