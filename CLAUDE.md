# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Character Voice is a static website, deployed on Netlify. It has no build step, package manager, framework, linter or tests. You pick a category and an item, and the site generates a cartoon "character" with a quote and a joke, then reads them aloud with the browser's Web Speech API while animating a lip-synced mascot.

## Running locally

Serve the folder with any static server, then open http://localhost:8000:

```sh
python3 -m http.server 8000
```

Opening `index.html` directly also works for the most part, but some fetches and AdSense behave better over http.

## Architecture

- **Pages**: `index.html` (the generator), `blog.html` (the blog index), `blog/<slug>.html` (one page per article), `about.html`, `contact.html`, `privacy.html` and `terms.html`. Each page has its own copy of the `<nav class="navbar">`, footer, Google Fonts links and AdSense `<script>` tag. A change to the nav or footer has to be repeated in every HTML file.
- **`nav.js`**: the shared mobile-menu toggle. Every page loads it with `defer`. It expects `.nav-toggle` and `#primaryNavigation`.
- **`script.js`**: used only by `index.html`. It is a plain global script, loaded without `defer` at the end of `<body>`. It is split into numbered `// ===` sections:
  1. API URLs: JokeAPI, quotable-hub and dog.ceo, plus catfact.ninja inside the animals category.
  2. `categoryMap`: the data model. Each category has `label`, `colors`, an async `apiFetch(item)` and an `items` map of `{ label, emoji, color }`. To add a category or item, edit this object. The dropdowns, random generation and "popular characters" all read from it.
  3. `languageTranslations`: the spoken intro phrases for each BCP-47 language code. The fallback is `en-IE`.
  4. DOM references: element IDs that must exist in `index.html`.
  5. Voice selection: the picker offers **Kid** and **Teen** voices, defined in `VOICE_STYLES`. The radio is still named `voiceGender`, with values `kid` and `teen`.
     - Each style names a `base` (`female` or `male`) plus a `pitch` and `rate`.
     - `getVoiceForLanguageAndGender` picks a voice for that base by matching name keyword lists (`maleVoiceNames` and `femaleVoiceNames`) against `speechSynthesis.getVoices()`.
     - The Kid and Teen illustrations live in `characters.js` under `ART.voices`.
  6. Lip-sync: `speakCharacter` drives the mouth animation from `utterance.onboundary` word events. It falls back to timers when the browser sends no boundary events.
  7. Generation (sections 7 to 9): `generateDrama` fetches the joke and quote in parallel with `fetchWithTimeout`, falling back to built-in text, and renders the result into `#resultContent` as an HTML string. It also adds the share buttons, which use `data-share` attributes.
- **`characters.js`**: loaded right before `script.js` and exposes `window.CharacterArt`.
  - `render(categoryKey, itemKey, { mood, size, label })` returns hand-drawn SVG markup. There is one drawing function per item in `ART`; items without one fall back to a round character in the item's colour. A new item in `categoryMap` should get a drawing here.
  - Every character shares one face rig: eyes that blink and glance, eyebrows set by mood, and 9 mouth shapes switched by the SVG's `data-v` attribute. Birds use a beak that slides open with the `--open` CSS variable.
  - `createRig(svg)` drives the lip-sync. `speakWord` is called from `onboundary` events, and `playText` is the timing-based fallback.
  - The category/item `<select>`s are hidden. The `#categoryPicker` and `#itemPicker` card grids set their values.
- **Global functions**: inline `onclick` handlers rely on functions exposed on `window` (the `share*` functions, `copyToClipboard`, `replayVoice`, `stopVoice` and `generateFromPopular`). If you rename one, update its `window.` assignment too.
- **Ads**: AdSense publisher `ca-pub-8599952668216208`.
  - `index.html` has an inline ad-loader IIFE after `script.js`. It retries `adsbygoogle.push` until the container has a width, which works around "No slot size" errors, and exposes `window.debugAds()`.
  - `blog.html` uses plain inline `push({})` calls instead.
  - `ads.txt` must stay at the site root.
- **`style.css`**: one large stylesheet (about 4,400 lines) shared by all pages.
  - It has three `:root` blocks: near line 17, near line 2709, and in the final **"THEME: CANDY STUDIO"** block at the end of the file. Later blocks override earlier ones.
  - The current look lives in the Candy Studio block: Fredoka for headings, Nunito for body text, and the grape / bubblegum / sun palette as `--grape`, `--pink`, `--sun`, `--ink` and so on. It also remaps the old token names, and it holds the compact spacing.
  - Change the design in that block first. Many older rules use higher-specificity selectors such as `.controls .generate-btn` or `.content-section .content-card h3`, so an override has to match them.
  - Breakpoints are mostly 768px and 480px.
  - Several `prefers-reduced-motion` blocks cover the animations.

## Blog

- Each article is a standalone file in `blog/`. Those pages use root-absolute paths (`/style.css`, `/blog.html`), so test them through a local server, not `file://`.
- Each article has a canonical URL, Open Graph tags, `BlogPosting` JSON-LD and at most one ad unit.
- `blog.html` holds the index cards. When you add an article, also add:
  - a card in `blog.html`,
  - an entry in the "Start Here" list if it fits,
  - a `<url>` in `sitemap.xml`.

## SEO, ads and site identity

- **Live site:** `https://character-voice.netlify.app`. Netlify serves "pretty URLs", so canonical links and the sitemap use addresses like `/about` and `/blog/<slug>`, without `.html`.
- **One brand:** "Cartoon Character Fun". Don't reintroduce the old name "The Dramatic Plate" or the dead domain `thedramaticplate.ie`.
- **`SITE_URL`** in `script.js` builds the share links. If the site moves to a custom domain, update it together with the canonical tags, `og:url`/`og:image`, `robots.txt` and `sitemap.xml`.
- **Contact form:** submits through Netlify Forms (`data-netlify="true"`, form name `contact`).
- **AdSense requirements:** the privacy policy's "Advertising and Cookies" section holds the disclosures AdSense requires, so keep it.
- **Empty ad boxes:** CSS collapses ad containers until AdSense marks them `data-ad-status="filled"`.
- **Generator lines:** each character's headline line is original text from `MOOD_LINES` and `CATEGORY_LINES` in `script.js`. The bonus joke comes from JokeAPI.
