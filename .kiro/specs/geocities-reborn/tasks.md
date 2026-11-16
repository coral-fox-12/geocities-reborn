# Tasks — GeoCities Reborn

- [x] 1. Scaffolding and Kiro spec structure
  - Create repo layout per `.kiro/steering/structure.md`
  - Write steering (product, tech, structure) and this spec set
  - _Requirements: 8_

- [x] 2. Deterministic generator (`public/js/generator.js`)
  - Implement `hashSeed`, `mulberry32`, `pick`, theme packs (6), `parsePrompt`
  - Implement `buildPage` with all 9 required sections and inline scripts
    (guestbook + counter + sparkles + chiptune toggle)
  - Implement `planSteps` log lines
  - _Requirements: 1, 2, 3, 7_

- [x] 3. Chiptune engine (`public/js/chiptune.js`)
  - WebAudio square-wave sequencer, one original melody per theme, start/stop
  - _Requirements: 6_

- [x] 4. Portal UI (`public/index.html`, `public/css/style.css`, `public/js/app.js`)
  - Hero + prompt form + theme picker + agent plan panel + preview frame
  - Gallery rendering from `/api/gallery`
  - Download + regenerate actions
  - _Requirements: 1, 4, 5_

- [x] 5. Server (`server.mjs`)
  - Static serving, `/api/gallery`, `/api/generate` with optional Groq proxy
    and silent local fallback
  - _Requirements: 5, 8_

- [x] 6. Gallery samples
  - Generate 3 sample pages with the generator itself, commit as fixtures
  - _Requirements: 5, 7_

- [x] 7. Tests
  - `test/generator-test.mjs` (Node assertions)
  - `test/headless-check.mjs` (Playwright: load, zero console errors, full
    flow, screenshots)
  - Fix all failures
  - _Requirements: 1–8_

- [x] 8. Submission materials
  - `README.md`, `LICENSE` (MIT), `SUBMISSION.md` (checklist + demo script),
    `KIRO-USAGE.md` (prompt/session log)
  - Git init, first commit
  - _Requirements: 8_
