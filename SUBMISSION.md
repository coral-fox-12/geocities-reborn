# Submission Checklist — Kiroween 2026 (GeoCities Reborn)

## Entry facts
- **Hackathon:** Kiroween 2026 — kiroween.devpost.com
- **Category:** Resurrection (bring dead tech back to life)
- **Deadline:** Fri 4 Dec 2026, 2:00 PM PT = **05:00 VN Sat 5 Dec 2026**
  (verified by date conversion; the task brief's "Sun 06/12" is one day
  late — the official rules are authoritative, use Sat 5 Dec)
- **Prizes:** 1st $30,000 / 2nd $20,000 / 3rd $10,000; Best Resurrection
  $5,000; Best Demo $1,000; Bonus Blog / Social Blitz available
- **Judging (5 criteria, equal weight):** Potential Impact · Technological
  Implementation (incl. how thoroughly Kiro is used) · Design · Innovation
  and Idea · Presentation
- **Eligibility:** Vietnam is NOT on the excluded list. Solo entry, age of
  majority. Project started 17 Nov 2026 — inside the submission period
  (30 Oct–4 Dec 2026). ✅

## What the Devpost form needs
- [ ] Title: **GeoCities Reborn — the dead web lives again**
- [ ] Tagline: *An AI ghost-agent that builds 1990s personal homepages.*
- [ ] Category: Resurrection
- [ ] Text description (features + functionality) — draft in `README.md`
- [ ] URL to the functional app — needs a public host (see "Still missing")
- [ ] Demo video link (YouTube, public, < 3 min) — script below
- [ ] Public GitHub repo URL (NOT GitLab/Bitbucket), MIT license detectable
      in the About section, `/.kiro` directory at the repo root
- [ ] "How Kiro was used" write-up — see `KIRO-USAGE.md`
- [ ] Bonus: Bonus Blog prize — publish a public blog post about Kiro + this
      build during the submission period and link it (top 100 get 2,000 bonus
      Kiro credits). Bonus: Social Blitz — post starting with
      `#KiroweenHackathon26` and link it.

## Demo video script (< 3 min, target 2:30)
| Time | Shot | Narration |
|---|---|---|
| 0:00–0:15 | Portal hero, starfield, ghost logo | "GeoCities hosted 38 million homepages — and died in 2009. This is GeoCities Reborn: an AI agent that builds 1990s homepages." |
| 0:15–0:45 | Type "I'm Mimi, a cat who rules the house", pick Enchanted Forest | "One sentence. Pick a neighborhood — or let Webby choose." |
| 0:45–1:15 | Webby's plan steps ticking, page appears in the browser frame | "Webby plans, drafts, renders, verifies — then your page is live. Marquee, shrine, guestbook, visitor counter." |
| 1:15–1:45 | Sign the guestbook, counter ticks, toggle the chiptune | "The guestbook works. The counter counts. The chiptune is… a choice." |
| 1:45–2:10 | Click a gallery sample, then Download; open the downloaded file offline | "Three neighbors already live here. And the page is yours — one file, works forever, no server." |
| 2:10–2:30 | Close on the `.kiro` specs folder + Kiro CLI version | "Built spec-first with Kiro: requirements, design, tasks — and every Kiro session logged." |

Screenshots for the storyboard: `test/screenshots/01-portal.png`,
`02-generated.png`, `03-sample.png` (re-take after final polish).

## Still missing before submit (parent's jobs — NOT this agent's)
1. **Separate Devpost account** — parent is creating it in a browser task
   (do NOT use the user's personal Devpost account; do NOT touch the
   Kiroween credit request — the user requests the 4,000 credits themselves
   on 2026-11-18, deadline to request: 1 Dec 12:00 PM PT).
2. **Kiro login** — run `kiro-cli login` with the entrant's account so the
   repo history shows a real Kiro session; see `KIRO-USAGE.md` § "What a
   live Kiro session should still do".
3. **Public GitHub repo** — create it, push this folder, confirm the MIT
   license shows in the About section and `/.kiro` is present at the root.
4. **Public app URL** — deploy the zero-dependency app somewhere free:
   Cloudflare Pages/Workers (free tier, no card — see the free-credits
   report) or any static host; the app also runs on `node server.mjs`.
   Judges must be able to open it without credentials.
5. **Demo video** — record per the script above (< 3 min), upload to
   YouTube as public, paste the link in the form.
6. **(Optional, high value) LLM upgrade** — set `GROQ_API_KEY` (free tier,
   no card) on the deployed server so bios are LLM-drafted; the demo works
   without it.
7. **(Optional) Bonus Blog + Social Blitz** — blog post + `#KiroweenHackathon26`
   post, links added to the form.

## Test evidence (this build)
- `node test/generator-test.mjs` — **13/13 pass** (determinism, all 6 themes,
  all 9 sections, no external URLs, HTML escaping, plan steps).
- `node test/headless-check.mjs` — **15/15 pass** (portal loads, gallery 3/3,
  empty-prompt error, full generate flow, guestbook persists after reload,
  download is standalone, regenerate works, sample renders, theme picker
  forces theme, **zero console/page errors**).
- Server: `node server.mjs` → http://127.0.0.1:8931, zero dependencies.
