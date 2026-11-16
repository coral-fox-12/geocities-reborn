// GeoCities Reborn — zero-dependency server (Node stdlib only).
// Serves the portal, the gallery API, and an optional LLM-backed generate
// proxy. No key is ever sent to the client; without a key the local
// deterministic generator runs and the response is identical in shape.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPage } from './public/js/generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 8931);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function send(res, code, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(code, { 'content-type': type });
  res.end(body);
}

function galleryItems() {
  const dir = path.join(PUBLIC, 'samples');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.html')).map((f) => {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    const meta = html.match(/<meta name="geocities" content="([^"]+)">/);
    const title = html.match(/<title>([^<]+)<\/title>/);
    const [theme = 'area51', name = ''] = meta ? meta[1].split('|') : [];
    return { file: '/samples/' + f, title: title ? title[1] : f, theme, name };
  });
}

async function llmBio(prompt, parsed) {
  // Optional upgrade: if a free-tier key is configured, draft three short
  // bio lines with it. Any failure falls back to the local generator.
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/gallery') {
    return send(res, 200, JSON.stringify(galleryItems()), 'application/json; charset=utf-8');
  }

  if (req.method === 'POST' && url.pathname === '/api/generate') {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', async () => {
      try {
        const body = JSON.parse(raw || '{}');
        const prompt = String(body.prompt || '').slice(0, 300);
        if (!prompt.trim()) return send(res, 400, JSON.stringify({ error: 'empty prompt' }), 'application/json; charset=utf-8');
        const themeId = body.themeId || null;
        const first = buildPage({ prompt, themeId });
        const bio = await llmBio(prompt, first.parsed);
        const finalPage = bio ? buildPage({ prompt, themeId, llmBio: bio }) : first;
        return send(res, 200, JSON.stringify({
          html: finalPage.html, theme: finalPage.theme, plan: finalPage.plan,
          source: bio ? 'llm' : 'local',
        }), 'application/json; charset=utf-8');
      } catch (e) {
        return send(res, 500, JSON.stringify({ error: String(e.message || e) }), 'application/json; charset=utf-8');
      }
    });
    return;
  }

  // Static files.
  let rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    return send(res, 404, 'not found');
  }
  return send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
});

server.listen(PORT, () => {
  console.log(`GeoCities Reborn listening on http://127.0.0.1:${PORT}`);
  console.log(`LLM upgrade: ${process.env.GROQ_API_KEY ? 'Groq key set' : process.env.GEMINI_API_KEY ? 'Gemini key set' : 'none — local generator only (demo works offline)'}`);
});
