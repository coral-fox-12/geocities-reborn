// GeoCities Reborn — portal UI logic.
import { THEMES, buildPage, parsePrompt } from './generator.js';
import { playTheme, stop as stopMusic, isPlaying } from './chiptune.js';

const $ = (s) => document.querySelector(s);
const promptEl = $('#prompt');
const themesEl = $('#themes');
const buildBtn = $('#build-btn');
const regenBtn = $('#regen-btn');
const downloadBtn = $('#download-btn');
const errorEl = $('#error');
const planEl = $('#plan');
const planStepsEl = $('#plan-steps');
const previewEmpty = $('#preview-empty');
const preview = $('#preview');
const previewUrl = $('#preview-url');
const musicBtn = $('#music-btn');
const galleryCards = $('#gallery-cards');

let selectedTheme = null;
let currentHtml = '';
let currentThemeId = null;
let currentPrompt = '';
let seedCounter = 0;
// True only when a real API answered /api/gallery as JSON. On a static host
// (Surge) a static file answers the same URL as application/octet-stream,
// so the app knows there is no server and never probes /api/generate —
// a probe would 404 and log a console error for nothing.
let hasServer = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- Theme picker -----------------------------------------------------------
THEMES.forEach((t) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'theme-card';
  b.setAttribute('aria-pressed', 'false');
  b.innerHTML = `<span class="emoji">${t.emoji}</span><b>${t.name}</b><small>${t.tagline}</small>`;
  b.addEventListener('click', () => {
    selectedTheme = selectedTheme === t.id ? null : t.id;
    document.querySelectorAll('.theme-card').forEach((el) => el.setAttribute('aria-pressed', 'false'));
    if (selectedTheme) b.setAttribute('aria-pressed', 'true');
    $('#theme-note').textContent = selectedTheme
      ? `Webby will build in ${t.name}. ${t.tagline}`
      : 'No theme picked? Webby chooses the neighborhood for you.';
  });
  themesEl.appendChild(b);
});

// --- Example prompts ---------------------------------------------------------
document.querySelectorAll('[data-example]').forEach((b) => {
  b.addEventListener('click', () => { promptEl.value = b.dataset.example; promptEl.focus(); });
});

// --- Gallery -----------------------------------------------------------------
async function loadGallery() {
  // Prefer the server API; on a static host the API is absent, so fall back
  // to the gallery embedded in index.html (window.GEOCITIES_GALLERY).
  let items = null;
  try {
    const r = await fetch('/api/gallery');
    if (r.ok) {
      hasServer = (r.headers.get('content-type') || '').includes('application/json');
      items = await r.json();
    }
  } catch { /* no server — use the embedded fallback below */ }
  if (!items || !items.length) items = window.GEOCITIES_GALLERY || null;
  if (!items || !items.length) { galleryCards.innerHTML = '<p class="tiny">No neighbors moved in yet.</p>'; return; }
  galleryCards.innerHTML = '';
  items.forEach((item) => {
    const theme = THEMES.find((t) => t.id === item.theme) || THEMES[0];
    const card = document.createElement('button');
    card.className = 'card';
    card.innerHTML = `<span class="emoji">${theme.emoji}</span><h3>${item.title}</h3><p>${theme.name} · built by Webby</p>`;
    card.addEventListener('click', async () => {
      const res = await fetch(item.file);
      const html = await res.text();
      showPage(html, item.theme, item.title);
      document.getElementById('preview-section').scrollIntoView({ behavior: 'smooth' });
    });
    galleryCards.appendChild(card);
  });
}

// --- Preview -----------------------------------------------------------------
function showPage(html, themeId, title) {
  currentHtml = html;
  currentThemeId = themeId;
  previewEmpty.hidden = true;
  preview.hidden = false;
  preview.srcdoc = html;
  previewUrl.textContent = `geocities.reborn/${encodeURIComponent((title || 'homepage').toLowerCase().replace(/[^a-z0-9]+/g, '-'))} — ${themeId || 'retro'}`;
  regenBtn.hidden = false;
  downloadBtn.hidden = false;
  musicBtn.textContent = '♪';
  musicBtn.setAttribute('aria-label', 'Play the theme chiptune');
}

// --- Generation ---------------------------------------------------------------
async function runGeneration(prompt, themeId, seed) {
  const parsed = parsePrompt(prompt);
  // Wait for the gallery probe to settle so we know whether a real API
  // exists; on a static host skip the /api/generate probe entirely and
  // build locally (a POST to a static file 404s and logs a console error).
  await galleryReady.catch(() => {});
  // Prefer the server (LLM upgrade when a key is configured); fall back to
  // the local generator instantly if there is no server.
  let page = null;
  if (hasServer) {
    try {
      const r = await fetch('/api/generate', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, themeId }),
      });
      if (r.ok) {
        const j = await r.json();
        page = { html: j.html, theme: j.theme, plan: j.plan };
      }
    } catch { /* offline path below */ }
  }
  if (!page) {
    const built = buildPage({ prompt, themeId, seed });
    page = { html: built.html, theme: built.theme, plan: built.plan };
  }
  return { page, parsed };
}

async function build() {
  const prompt = promptEl.value.trim();
  if (!prompt) {
    errorEl.textContent = 'Webby needs at least one sentence! Tell it who you are and what you love.';
    errorEl.hidden = false;
    promptEl.focus();
    return;
  }
  errorEl.hidden = true;
  buildBtn.disabled = true;
  buildBtn.textContent = 'Webby is building…';
  planEl.hidden = false;
  planStepsEl.innerHTML = '';

  const { page } = await runGeneration(prompt, selectedTheme, seedCounter);
  // Animate the plan steps (the page is already built — this is the show).
  for (const line of page.plan) {
    const li = document.createElement('li');
    li.textContent = line;
    planStepsEl.appendChild(li);
    await sleep(280 + Math.random() * 200);
    li.classList.add('done');
  }
  await sleep(250);
  currentPrompt = prompt;
  showPage(page.html, page.theme.id, parsePrompt(prompt).name + "'s Homepage");
  buildBtn.disabled = false;
  buildBtn.textContent = 'Build my homepage';
}

buildBtn.addEventListener('click', build);
promptEl.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') build();
});
regenBtn.addEventListener('click', async () => {
  if (!currentPrompt) return;
  seedCounter = Math.floor(Math.random() * 1e9);
  const built = buildPage({ prompt: currentPrompt, themeId: selectedTheme, seed: seedCounter });
  showPage(built.html, built.theme.id, parsePrompt(currentPrompt).name + "'s Homepage");
});
downloadBtn.addEventListener('click', () => {
  if (!currentHtml) return;
  const blob = new Blob([currentHtml], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'my-geocities-homepage.html';
  a.click();
  URL.revokeObjectURL(a.href);
});
musicBtn.addEventListener('click', () => {
  if (isPlaying()) {
    stopMusic();
    musicBtn.textContent = '♪';
    musicBtn.setAttribute('aria-label', 'Play the theme chiptune');
    return;
  }
  const theme = playTheme(currentThemeId || 'area51');
  musicBtn.textContent = `■ ${theme.name}`;
  musicBtn.setAttribute('aria-label', `Stop the ${theme.name} chiptune`);
});

const galleryReady = loadGallery();
