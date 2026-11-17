# GeoCities Reborn — redesign notes

New identity: **"The neighborhood bulletin board"** — a warm-black board, paper
cream, one coral-red accent. No gradients, no glow, no Comic Sans.

## Before (audited live, 1440px + 390px)

- Purple/blue radial-gradient background over near-black; hot-pink + cyan neon.
- Centred hero, giant Comic Sans gold/pink/cyan title with hard offset shadows.
- Seven identical ridge-bordered panels stacked in one centred column.
- Emoji everywhere: headings, every button, every theme/gallery card; the
  blinking UNDER CONSTRUCTION badge was invisible half the time (caught
  mid-blink in screenshots).
- The empty preview was a 620px-tall blank white void: `#preview{display:block}`
  in CSS overrode the `hidden` attribute, so the "hidden" iframe rendered
  anyway. Two 404s on every load (`/api/gallery`, `/favicon.ico`).

## After

- **Palette:** warm black `#171310`, paper cream `#f4ecdd`, ONE accent coral-red
  `#ff4d2e`, muted tan `#9a8d78`, hairline `#3d332a`. Zero blue, zero gradients.
- **Type (self-hosted, `public/fonts/`, ~64 KB, zero external requests):**
  Archivo Black for display, IBM Plex Mono for kickers/labels/URLs/numbers,
  system sans for body.
- **Layout:** asymmetric masthead — giant two-line title left, an "ON THIS
  STREET" directory of the six real neighborhoods right (01 Area 51 …
  06 Silicon Valley), mono dateline strip underneath. Numbered sections
  01–04 separated by hairline rules, not boxes.
- **Builder:** paper-cream textarea, mono example buttons, theme picker as
  ledger rows (accent left edge when picked), solid coral build button.
- **Preview:** square-dot browser chrome, mono URL field, "VACANT LOT" sign
  for the empty state.
- **Copy:** same facts, tightened. No emoji in portal chrome; no banned
  marketing words. The generated 90s pages themselves (samples + generator
  output) are untouched — the emoji and chaos live there, where they belong.

## Real bugs fixed (not just paint)

1. **Hidden iframe rendered as a white void** — added `#preview[hidden]{display:none}`.
2. **`/api/gallery` 404 on the static host** — added a static `public/api/gallery`
   JSON file (same 3 entries as the embedded fallback), so the gallery loads
   from the API path with no console error.
3. **`/api/generate` POST 404 on every build on a static host** — `app.js`
   now detects a real API by the `/api/gallery` response content-type
   (`application/json` on the Node server and the Worker, `application/octet-stream`
   for the static file) and skips the probe entirely when there is no server,
   going straight to the local generator. Behaviour on a real server and on
   Workers is unchanged.
4. **Missing favicon** — inline SVG data-URI icon (coral square, black G).

## Files changed

- `public/index.html` — new masthead/directory, numbered sections, no emoji in
  portal chrome, inline favicon, clean embedded gallery titles.
- `public/css/style.css` — full rewrite.
- `public/js/app.js` — two button-label strings de-emojied; server detection
  (see bug 3). No IDs, links, or flows changed.
- `public/fonts/` — archivo-black + plex-mono 400/500/600 (OFL).
- `public/api/gallery` — static gallery JSON for static hosts.
- `worker.mjs` — gallery titles de-emojied to match the portal.
- `test/screenshots/` — refreshed by the headless check (new design).
- `redesign/` — this note, `shot.cjs`, `smoke.cjs`, `headless-check-8932.mjs`
  (port-8932 copy of the headless check; port 8931 was held by another
  project's test server), before/after + live screenshots.

## Verification

- `node test/generator-test.mjs`: **13/13 pass**.
- `node test/headless-check.mjs` (port 8932 copy): **14/14 pass** — server
  starts, portal loads, gallery 3 cards, empty-prompt error, generate flow
  (marquee, guestbook, counter 000001), guestbook persists, download is
  standalone, regenerate runs, sample renders, theme picker forces Hollywood,
  **zero console/page errors**.
- Live smoke (`redesign/smoke.cjs` vs https://geocities-reborn.surge.sh):
  **11/11 pass** — h1, both fonts loaded, gallery 3 cards with emoji-free
  titles, no gradient in computed background, no `#0000ff`/Comic Sans in
  served CSS, generate flow (marquee + guestbook + counter), zero external
  requests, zero console/page errors.
- Live screenshots: `redesign/live-desktop.png`, `redesign/live-mobile.png`.

## Notes for the parent

- The demo video (`demo-video/`) was recorded against the OLD UI — it needs
  re-recording against this design before the 05/12 Kiroween submission.
- The Cloudflare Workers deploy is still blocked on a Cloudflare account/token
  (see DEPLOY.md) — Surge remains the live URL.
- Nothing submitted to Devpost.
