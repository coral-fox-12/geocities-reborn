# Design — GeoCities Reborn

## Overview
A zero-dependency Node app. The browser UI collects a prompt, shows the agent
plan, and renders the generated page in an iframe (via `srcdoc`) inside a
retro browser-chrome frame. The generator is a pure module shared by the
browser and by a small Node script that produces the gallery samples. The
server only serves static files and optionally proxies an LLM call.

## Architecture
```
browser ──► index.html ──► app.js ──► generator.js (pure, seeded)
   │                        │              ▲
   │                        ▼              │ (same module, Node)
   │                   preview iframe      │
   │                   (srcdoc page)       ▼
   └─► server.mjs ──► /api/generate ──► generator.js ──► sample pages
                     (LLM proxy, optional)
```
- `generator.js` is written as an ES module with no DOM dependency so Node
  can import it directly for tests and sample generation.
- The app never sends the prompt to any server unless the visitor's own
  deployment configured an LLM key; the default path is 100% local.

## Components

### generator.js
- `hashSeed(str)` — FNV-1a hash → 32-bit seed.
- `mulberry32(seed)` — deterministic PRNG.
- `pick(rng, arr)`, `pickN(rng, arr, n)` — seeded choices.
- `THEMES` — six theme packs: `{ id, name, tagline, bg, bgPattern, ink,
  accent, accent2, divider, melody, emoji, shrineLabel, greeting }`.
- `parsePrompt(prompt)` — extracts a display name (first capitalized word or
  "Friend"), topic keywords (cat, dog, music, space, game, food, sport,
  book, movie, default), and a vibe (cozy, loud, mysterious, sparkly).
- `buildPage({ prompt, themeId, seed })` — returns `{ html, theme, plan }`.
  Sections, in order: doctype/head/style, marquee title, nav, about,
  favorites, shrine, guestbook (with inline script using localStorage),
  webring, counter (inline script), badges, sparkle-trail script, chiptune
  toggle button wired to an inline WebAudio sequencer.
- `planSteps({ prompt, theme })` — the five agent steps with human-readable
  log lines shown in the UI.

### chiptune.js
- `playMelody(themeId, audioCtx)` — note sequences per theme (8–16 steps,
  square-wave oscillator + gain envelope, ~140 BPM loop). `stop()` halts it.
- Melodies are short original patterns (no copyrighted tunes).

### app.js
- State: current prompt, theme, generated HTML, plan log.
- `runGeneration()` — validates input, animates the five plan steps with
  realistic pacing (~250–450 ms each), calls `buildPage`, injects into the
  iframe, updates counter, enables Download/Regenerate.
- `renderGallery()` — fetches `/api/gallery`, renders cards.
- Guestbook on the portal page is the generated page's own guestbook (inside
  the iframe); the portal also shows the count.
- `downloadPage()` — Blob + `a.click()`.

### server.mjs
- Static serving of `public/` with correct MIME types, plus `/` → index.html.
- `GET /api/gallery` — lists `public/samples/*.html` with title/theme parsed
  from a `<meta name="geocities" content="...">` tag.
- `POST /api/generate` — body `{ prompt, themeId, seed }`. If
  `GROQ_API_KEY` is set, it asks Groq (`llama-3.3-70b-versatile`, free tier)
  for three short bio lines and merges them into the generator's copy; on any
  failure it falls back to the local generator silently. If no key is set, it
  just runs the local generator. Response is always `{ html, theme, source:
  "llm" | "local" }`. No key is ever sent to the client.

## Data model
- Generated page: `{ html: string, theme: ThemePack, plan: string[] }`.
- Gallery item: `{ file, title, theme, blurb }`.
- Guestbook entry: `{ name, message, at }` in localStorage key
  `gc-guestbook-<pageHash>`.

## Correctness / testing
- `test/generator-test.mjs` (Node, no deps): determinism (same input →
  identical bytes), all six themes produce all nine required sections, zero
  `http://` or `https://` URLs in output, prompt parsing on 8 sample prompts.
- `test/headless-check.mjs` (Playwright): load app, zero console errors,
  generate a page from a prompt, guestbook sign persists after reload,
  download produces a file, screenshots (portal, generating, generated page).
