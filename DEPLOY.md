# Deploy — GeoCities Reborn on Cloudflare (free tier, $0)

## Why Workers, not pure Pages

`server.mjs` serves static files **plus two APIs**: `GET /api/gallery` and
`POST /api/generate`. The browser falls back to the local generator if
`/api/generate` is missing, but the gallery has **no static fallback** — on
pure static hosting it shows "The gallery is taking a nap". So the target
is **Workers + Static Assets**: `public/` is served as static files and
`worker.mjs` implements the two APIs (same logic as `server.mjs`, the
gallery list embedded as a manifest — update it in `worker.mjs` if a sample
is added/renamed). The demo video was recorded against `server.mjs` locally;
the deployed app behaves identically without keys.

## Status: READY TO DEPLOY — blocked on a Cloudflare account/token

No Cloudflare account/token exists on this machine (checked
`~/workspace/makefun/`, env vars, `~/.config/.wrangler`, `~/.cloudflare` —
nothing). **The cloud-browser signup FAILED: Cloudflare Turnstile cannot be
cleared from this VM's datacenter egress IP** (9+ failed clicks across 2
browser tasks, 2026-11-17) — no account was created. Deploy stays blocked
until the user creates the Cloudflare account on their own device/network
(free tier, no card) and hands over an API token, or runs `wrangler deploy`
themselves. Do not retry the signup from the cloud browser.

## Deploy (once the token exists — ~2 minutes)

```bash
cd ~/workspace/devpost/kiroween-2026
npm i -g wrangler            # or: npx wrangler@latest
export CLOUDFLARE_API_TOKEN='<token from the browser task>'
wrangler deploy              # → https://geocities-reborn.<subdomain>.workers.dev
```

Verify after deploy (no login needed, public URL):

```bash
curl -s https://geocities-reborn.<subdomain>.workers.dev/api/gallery
curl -s -X POST https://geocities-reborn.<subdomain>.workers.dev/api/generate \
  -H 'content-type: application/json' \
  -d '{"prompt":"I am Mimi, a cat who rules the house","themeId":"enchantedforest"}'
# both should return JSON; the page should load in a browser with 0 console errors
```

## Optional: LLM-drafted bios on the deployed server

Without keys the deployed app uses the local generator (demo works fully).
To enable LLM bios, set **one** key as a Worker secret (never commit keys):

```bash
wrangler secret put GROQ_API_KEY    # paste the free Groq key when prompted
# or: wrangler secret put GEMINI_API_KEY
```

## Local test of the Worker (no token needed)

```bash
npx wrangler@latest dev --port 8945   # serves the same worker + assets locally
curl -s localhost:8945/api/gallery
```

## Notes

- Free tier limits are far above what judges will use (100k requests/day).
- `server.mjs` stays as the local dev server (`node server.mjs` → 127.0.0.1:8931).
- Nothing in this repo contains a key or secret. `.gitignore` (if added)
  must keep `wrangler.toml`/`worker.mjs` public and exclude `.dev.vars`.
