// GeoCities Reborn — Cloudflare Worker entry (production hosting).
// Static files are served by Workers Static Assets (see wrangler.toml);
// this worker only implements the two API routes that server.mjs had.
// No secrets in this file: optional LLM keys are Worker secrets
// (set with `wrangler secret put`, see DEPLOY.md). Without a key the
// local deterministic generator runs, same as server.mjs.
import { buildPage } from './public/js/generator.js';

// Gallery manifest — the same items server.mjs reads from public/samples/
// (meta "geocities" tags). Workers have no filesystem, so the list is
// embedded here; update it if a sample is added or renamed.
const GALLERY = [
  { file: '/samples/captain-stardust.html', title: "Captain Stardust's Homepage 👽 Area 51", theme: 'area51', name: 'Captain Stardust' },
  { file: '/samples/dj-nova.html', title: "DJ Nova's Homepage 🎸 Sunset Strip", theme: 'sunsetstrip', name: 'DJ Nova' },
  { file: '/samples/mimi-the-cat.html', title: "Mimi's Homepage 🦄 Enchanted Forest", theme: 'enchantedforest', name: 'Mimi' },
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

async function llmBio(env, prompt, parsed) {
  // Optional upgrade: if a free-tier key is configured, draft three short
  // bio lines with it. Any failure falls back to the local generator.
  const groqKey = env.GROQ_API_KEY;
  const geminiKey = env.GEMINI_API_KEY;
  try {
    if (groqKey) {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + groqKey },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Write exactly 3 short, warm, funny first-person bio lines (one sentence each) for a 1990s personal homepage. No headings, no numbering, no emojis.' },
            { role: 'user', content: `The page is about: ${prompt}. The owner is ${parsed.name}, a fan of ${parsed.topic.label}.` },
          ],
          temperature: 0.9, max_tokens: 220,
        }),
      });
      if (!r.ok) return null;
      const j = await r.json();
      return j.choices?.[0]?.message?.content || null;
    }
    if (geminiKey) {
      const r = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + geminiKey,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Write exactly 3 short, warm, funny first-person bio lines (one sentence each) for a 1990s personal homepage about: ${prompt}. Owner: ${parsed.name}, fan of ${parsed.topic.label}. No headings, no numbering, no emojis.` }] }],
          }),
        },
      );
      if (!r.ok) return null;
      const j = await r.json();
      return j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n') || null;
    }
  } catch {
    return null;
  }
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/gallery') {
      return json(GALLERY);
    }

    if (request.method === 'POST' && url.pathname === '/api/generate') {
      try {
        const body = await request.json().catch(() => ({}));
        const prompt = String(body.prompt || '').slice(0, 300);
        if (!prompt.trim()) return json({ error: 'empty prompt' }, 400);
        const themeId = body.themeId || null;
        const first = buildPage({ prompt, themeId });
        const bio = await llmBio(env, prompt, first.parsed);
        const finalPage = bio ? buildPage({ prompt, themeId, llmBio: bio }) : first;
        return json({
          html: finalPage.html, theme: finalPage.theme, plan: finalPage.plan,
          source: bio ? 'llm' : 'local',
        });
      } catch (e) {
        return json({ error: String(e.message || e) }, 500);
      }
    }

    // Everything else is a static asset (portal, CSS, JS, samples).
    return env.ASSETS.fetch(request);
  },
};
