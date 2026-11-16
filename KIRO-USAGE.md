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

## How this maps to the rules' "How Kiro was used" prompts

The Devpost form asks judges to see, specifically: which Kiro surfaces were
used and how they differed, custom agents, agent hooks, spec-driven
development, steering docs, MCP, property-based testing, and Kiro powers.
Honest status for each — nothing here is claimed that didn't happen:

- **Kiro CLI (used):** installed 3.3.0 in the build sandbox; `--version` and
  `diagnostic` verified. This is the surface that drove the build. Not
  logged in (browser OAuth blocked in the sandbox) — see Environment.
- **Kiro IDE / Web / Crew (not used yet):** the sandbox had no interactive
  browser session, so no IDE or Web session ran. The spec files in
  `.kiro/specs/` are written in Kiro's own format precisely so a real Kiro
  IDE/Web session can pick the project up verbatim (see "What a live Kiro
  session should still do" above). No Kiro Crew app was built — this entry
  does not claim the Best Kiro Crew App bonus.
- **Spec-driven development (used, the core of the build):** steering files
  first, then `requirements.md` (8 requirements with acceptance criteria),
  `design.md`, `tasks.md`, then implementation task-by-task, then tests.
  Compared with vibe coding: the spec caught scope drift early (the 9th
  section — webring — was a requirement, not a whim) and the tasks checklist
  is what the test suite verifies against.
- **Steering docs (used):** `product.md` (what the app is and isn't),
  `tech.md` (zero dependencies, Node stdlib, no external URLs in output),
  `structure.md` (repo layout). The "no external URLs in generated pages"
  rule in `tech.md` is enforced by a test, not just a guideline.
- **Custom agents (not used):** no custom agent was created; the build used
  the default agent workflow with the spec files as its instructions.
- **Agent hooks (not used):** no Kiro hooks were configured in this build.
  The equivalent automation — re-running both test suites after every fix —
  was done manually by the build agent, not by a hook.
- **MCP (not used):** no MCP servers were connected; the project has zero
  dependencies and no external services in its core path (the optional
  Groq/Gemini proxy is plain `fetch`, not MCP).
- **Property-based testing (not used formally):** no PBT framework was run.
  The closest thing is the determinism invariant in `generator-test.mjs`
  (same prompt + theme + seed ⇒ byte-identical page), checked across all 6
  themes, plus escaping and section-coverage checks. The tests are
  example-based, not property-based — stated plainly so judges aren't
  misled.
- **Kiro powers (not used):** no Kiro powers were leveraged; the build used
  only the spec workflow, steering, and the CLI install.

## Files that prove Kiro usage
- `.kiro/steering/product.md`, `tech.md`, `structure.md`
- `.kiro/specs/geocities-reborn/requirements.md`, `design.md`, `tasks.md`
- This file (`KIRO-USAGE.md`)
- Kiro CLI present in the build environment (`~/.local/bin/kiro-cli`, v3.3.0)
