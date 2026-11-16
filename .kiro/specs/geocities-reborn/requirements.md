# Requirements — GeoCities Reborn (Kiroween 2026, category: Resurrection)

## Introduction
GeoCities Reborn is a web app that resurrects the dead personal-homepage web
(GeoCities, 1994–2009) as an AI agent. The agent "Webby" turns one sentence
from a visitor into a complete 1990s personal homepage, rendered live and
downloadable as a single standalone HTML file. The project is built with Kiro
(spec-driven: this document, `design.md`, `tasks.md` under `.kiro/specs/`).

## Glossary
- **Visitor:** the person using the app to create a homepage.
- **Webby:** the in-app agent persona that plans and builds the page.
- **Neighborhood:** a classic GeoCities theme pack (Area51, Hollywood,
  SunsetStrip, Heartland, EnchantedForest, SiliconValley).
- **Generated page:** a single self-contained HTML string produced by the
  generator; it has no external resources.
- **Gallery:** pre-generated sample homepages shipped with the app.

## Requirements

### Requirement 1 — One-sentence page generation
**User Story:** As a visitor, I want to type one sentence about myself and get
a complete retro homepage, so that I can have a personal page without writing
HTML.

#### Acceptance Criteria
1. WHEN the visitor submits a prompt and optionally a theme THEN the system
   SHALL display Webby's plan steps executing (parse, theme, draft, render,
   verify) before showing the page.
2. WHEN generation finishes THEN the system SHALL render the generated page
   live inside a retro browser frame on the same screen.
3. WHEN the prompt is empty THEN the system SHALL show a friendly inline
   error and SHALL NOT generate a page.
4. WHEN no LLM key is configured THEN the system SHALL generate the page with
   the built-in deterministic generator and SHALL NOT show any error.

### Requirement 2 — Six neighborhood themes
**User Story:** As a visitor, I want my page to look like a real GeoCities
neighborhood, so that it feels authentically 90s.

#### Acceptance Criteria
1. WHEN the visitor picks a theme THEN the generated page SHALL use that
   theme's palette, background pattern, divider style, and melody.
2. WHEN no theme is picked THEN the system SHALL choose a theme from the
   prompt's keywords (or a seeded default) and SHALL name the choice in the
   plan log.
3. THE system SHALL offer exactly six themes: Area51, Hollywood,
   SunsetStrip, Heartland, EnchantedForest, SiliconValley.

### Requirement 3 — Complete retro page contents
**User Story:** As a visitor, I want my page to have all the classic
GeoCities ingredients, so that it reads as a real homepage from 1998.

#### Acceptance Criteria
1. THE generated page SHALL contain: a marquee title, an about section, a
   favorites list, a shrine section, a working guestbook, a webring, a
   visitor counter, an under-construction badge, and a "best viewed" badge.
2. THE generated page SHALL contain zero external URLs (no http(s) links to
   outside resources) so it works offline.
3. WHEN the visitor signs the guestbook on a generated page THEN the entry
   SHALL persist in localStorage and SHALL appear on reload.

### Requirement 4 — Download as standalone HTML
**User Story:** As a visitor, I want to take my page home, so that I own it
forever.

#### Acceptance Criteria
1. WHEN the visitor clicks Download THEN the browser SHALL save the generated
   page as a single `.html` file.
2. THE downloaded file SHALL render identically when opened directly from
   disk, with no server and no network.

### Requirement 5 — Gallery of sample homepages
**User Story:** As a first-time visitor, I want to see example pages
immediately, so that I understand what the agent makes before I type anything.

#### Acceptance Criteria
1. WHEN the app loads THEN the gallery SHALL show at least three sample
   homepages with titles and themes.
2. WHEN the visitor clicks a sample THEN the system SHALL open it in the
   preview frame, fully interactive.
3. THE sample pages SHALL be produced by the generator itself, not
   hand-written.

### Requirement 6 — Chiptune and sparkles
**User Story:** As a visitor, I want the page to feel alive, so that the 90s
atmosphere is unmistakable.

#### Acceptance Criteria
1. WHEN the visitor enables music THEN the system SHALL play a looping
   chiptune melody for the current theme using WebAudio, with no audio files.
2. WHEN the visitor moves the pointer over the preview THEN a sparkle trail
   SHALL follow it.
3. THE music SHALL be off by default and SHALL have a visible mute control.

### Requirement 7 — Deterministic generation
**User Story:** As the developer, I want generation to be reproducible, so
that the gallery, tests, and demos always show the same pages.

#### Acceptance Criteria
1. WHEN the same prompt, theme, and seed are given THEN the generator SHALL
   produce a byte-identical page.
2. THE generator SHALL be pure functions with no network or clock dependency
   in its output path.

### Requirement 8 — Zero-dependency operation
**User Story:** As a judge, I want to run the app with one command, so that
testing it is effortless.

#### Acceptance Criteria
1. WHEN the judge runs `node server.mjs` THEN the app SHALL serve on a local
   port with no install step and no environment variables required.
2. THE repository SHALL contain no `node_modules` and no build step.
