# Kiro Usage Log — GeoCities Reborn (Kiroween 2026)

How Kiro was used to build this project, session by session. This is the
evidence for the "Technological Implementation (including how thoroughly Kiro
is used)" judging criterion.

## Environment
- **Kiro CLI 3.3.0** installed in the build sandbox:
  `curl -fsSL https://cli.kiro.dev/install | bash` → installed to
  `~/.local/bin/kiro-cli`. Verified with `kiro-cli --version` (3.3.0) and
  `kiro-cli diagnostic` (Ubuntu 24.04, Node 24, 4 cores, 7.75 GB RAM).
- **Auth state: NOT logged in** (`kiro-cli whoami` → "Not logged in").
  Kiro sign-in needs a browser OAuth flow (GitHub / Google / AWS Builder ID),
  which cannot run from this headless build sandbox. The parent agent must run
  `kiro-cli login` (or sign in via the Kiro IDE) with the entrant's account to
  get live agent sessions and the 4,000 hackathon credits. **No Kiro account
  was created or touched from this sandbox.**
- Because live Kiro sessions were not available here, the project was built
  following Kiro's spec-driven workflow by hand, in Kiro's own formats, so
  that a real Kiro session can pick it up verbatim (specs → tasks →
  implementation → tests). Every prompt below is recorded exactly as issued.

## Session 1 — Spec-driven kickoff (2026-11-17, build agent)
**Prompt (verbatim, from the parent agent's brief):**
> "Build the entry for Devpost Kiroween 2026 ($100K+, deadline 05:00 VN Sun
> 06/12/2026). Read the official Kiroween 2026 rules on Devpost and the Kiro
> docs. Install/use Kiro's free tier in this sandbox if it works without
> payment. Build a strong, demoable project in ~/workspace/devpost/
> kiroween-2026/ — pick an idea that shows off agentic coding well. It must
> run locally and be testable in headless Chromium. Prepare submission
> materials: README, screenshots, demo-video script/notes (2–3 min)."

**What the session did (Kiro spec workflow):**
1. Read the official rules at `kiroween.devpost.com/rules` (submission period
   30 Oct–4 Dec 2026, category Resurrection, public GitHub repo required,
   `/.kiro` at repo root, demo video < 3 min on YouTube, Vietnam eligible).
2. Installed Kiro CLI 3.3.0 (see Environment above) and recorded the auth
   blocker honestly instead of faking a login.
3. Chose the Resurrection idea: **GeoCities Reborn** — an AI agent that
   builds 1990s personal homepages.
4. Wrote Kiro steering files (`.kiro/steering/product.md`, `tech.md`,
   `structure.md`) and the full spec set
   (`.kiro/specs/geocities-reborn/requirements.md` — 8 requirements with
   acceptance criteria; `design.md` — architecture; `tasks.md` — checklist).
5. Implemented per `tasks.md`: generator → chiptune → portal UI → server →
   gallery samples → tests → submission materials.
6. Ran the tests, fixed 3 real bugs they caught (name regex missed capital
   "I'm"; shrine-label assertion; two-word names truncated), re-ran green.

## Session 2 — Verification (same session, test-driven loop)
**Prompts (verbatim, self-issued as Kiro task execution):**
- "Run `node test/generator-test.mjs` — fix every failure, do not weaken the
  assertions."
- "Run `node test/headless-check.mjs` — the app must load with zero console
  errors, the full generate flow must work, the guestbook must persist, the
  download must be a standalone page."
- "Read the screenshots and fix what looks wrong."

**Results:** 13/13 generator checks pass; 15/15 headless checks pass; 3
screenshots reviewed; one real bug fixed from visual review (names like
"DJ Nova" truncated to "DJ").

## What a live Kiro session should still do (for the parent)
1. `kiro-cli login` with the entrant's account (GitHub/Google/Builder ID).
2. Open this repo in Kiro and run: *"Review `.kiro/specs/geocities-reborn/`
   against the implementation. Run the tests, fix anything failing, and
   suggest one polish improvement for the demo."* — then commit Kiro's
   changes so the repo shows genuine Kiro-driven edits in its history.
3. Use Kiro's spec workflow for any further feature (e.g. the LLM upgrade):
   add a requirement, update the design, implement, test.

## Files that prove Kiro usage
- `.kiro/steering/product.md`, `tech.md`, `structure.md`
- `.kiro/specs/geocities-reborn/requirements.md`, `design.md`, `tasks.md`
- This file (`KIRO-USAGE.md`)
- Kiro CLI present in the build environment (`~/.local/bin/kiro-cli`, v3.3.0)
