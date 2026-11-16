# Tech Steering — GeoCities Reborn

## Stack (zero dependencies)
- **Runtime:** Node.js 22+ standard library only. No npm install, no build
  step, no framework. The server is one file (`server.mjs`).
- **Frontend:** vanilla HTML/CSS/JS. No CDN, no external fonts, no external
  images — a downloaded page must work offline forever.
- **Persistence:** browser `localStorage` only (guestbook entries, visitor
  counter, saved pages). No backend database.
- **Optional LLM:** server-side proxy `POST /api/generate`. If
  `GROQ_API_KEY` or `GEMINI_API_KEY` is set in the environment, copy is
  drafted by that free-tier model; otherwise the deterministic local
  generator runs. The key is never shipped to the client and never committed.

## Architecture
- `server.mjs` — static file server + `/api/generate` proxy + `/api/gallery`.
- `public/js/generator.js` — deterministic retro page generator (seeded PRNG,
  theme packs, section builders). Pure functions, testable in Node and in the
  browser; the same code generates the gallery samples.
- `public/js/chiptune.js` — WebAudio sequencer (theme melodies, no audio files).
- `public/js/app.js` — UI: prompt form, agent plan animation, live preview
  frame, guestbook, counter, download.
- `public/samples/*.html` — pre-generated sample homepages (produced by the
  generator itself, committed as fixtures).

## Conventions
- All generated pages are single self-contained HTML strings: inline `<style>`,
  no external resources.
- Every user-visible string that the generator produces must come from a
  template table in `generator.js` (no hard-coded copy in `app.js`).
- Deterministic: same prompt + same theme + same seed → byte-identical page.
  This makes the gallery reproducible and the tests meaningful.
- Accessibility: generated pages keep semantic headings, alt text on decorative
  art is empty, contrast is kept readable despite the retro palette.

## Testing
- `test/headless-check.mjs` — Playwright (chromium headless shell): loads the
  app, asserts zero console errors, runs the full generate flow, signs the
  guestbook, downloads a page, and captures screenshots.
- `test/generator-test.mjs` — Node assertions on the generator: determinism,
  per-theme output, required sections present, no external URLs in output.
