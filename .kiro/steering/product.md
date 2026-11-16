# Product Steering — GeoCities Reborn

## What this is
GeoCities Reborn resurrects GeoCities (1994–2009), the dead personal-homepage
web, as an AI agent that builds 1990s personal homepages. A visitor describes
themselves in one sentence; the agent "Webby" plans the page, picks a classic
GeoCities neighborhood theme, drafts the sections, renders a full retro
homepage, and lets the visitor preview it, sign the guestbook, and download it
as a standalone HTML file.

## Why it matters (Kiroween category: Resurrection)
GeoCities was the first mass social web: 38 million personal pages, built by
ordinary people with raw HTML, tiled backgrounds, visitor counters and
guestbooks. It died in 2009. This project brings it back with today's
innovation — an agentic builder — while keeping the soul: chaotic, personal,
hand-made-feeling pages. Nostalgia is the impact; the agent is the technology.

## Core user journey (must work in under 60 seconds)
1. Land on the haunted 90s portal, see the gallery of sample homepages.
2. Type one sentence: who the page is for and what it celebrates.
3. Pick a neighborhood theme (Area51, Hollywood, SunsetStrip, Heartland,
   EnchantedForest, SiliconValley) or let the agent choose.
4. Watch Webby's plan execute step by step (parse → theme → draft → render →
   verify), then the page appears live in a retro browser frame.
5. Sign the guestbook, hear the chiptune, watch the visitor counter tick.
6. Download the page as a single standalone `.html` file.

## Non-goals
- No accounts, no database, no tracking. Guestbook/counter are local
  (localStorage) by design — the 90s web was personal, not surveilled.
- No external images: every visual is CSS, inline SVG, or emoji, so a
  downloaded page works forever, offline, anywhere.
- No paywall. An optional LLM key (Groq/Gemini free tier) upgrades the copy;
  without one, the built-in deterministic generator runs the whole show.

## Success criteria
- A stranger can generate a page they love in under a minute, with zero
  instructions.
- The demo video shows the full loop in under 3 minutes.
- The app runs with zero dependencies: `node server.mjs`, open the browser.
