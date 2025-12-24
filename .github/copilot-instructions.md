# GitHub Copilot / AI Agent Instructions

Purpose: Provide focused, actionable knowledge so an AI coding agent can be productive immediately in this codebase.

## Quick start (dev & build)
- Install: `npm install`
- Dev server: `npm run dev` (Vite) — fast HMR
- Build for production: `npm run build`
- Preview production artifacts: `npm run preview` (use to test the service worker and static behavior)
- Code formatting: `npm run format` (Prettier on `src/**/*.{js,jsx,css}`)

## Big picture
- Single-page React app (no router). Entry: `src/main.jsx` → `src/App.jsx`.
- Modes: **Hebrew**, **English**, **Math** implemented as components under `src/components/modes/` and rendered inside `src/components/GameShell.jsx`.
- Offline-first intent: service worker at `public/service-worker.js` + static assets in `public/` (including `words_he.json`, `audio/`, `avatars/`).
- Local persistence via `localStorage` for user state (child name, scores, cached words, achievements).
- Lightweight pub/sub event bus: `src/lib/events.js` used for cross-component notifications (e.g., `unlock` events for badges).

## Key files & what to know 🔧
- `src/App.jsx` — top-level app state: `mode`, `name`, and loading of words (`loadWords`). Adds `rtl` class when `mode === 'hebrew'` for RTL styling.
- `src/data/wordsLoader.js` — loads `public/words_he.json` and caches it in `localStorage` under `words_he_cache`.
- `public/words_he.json` — canonical Hebrew word list schema. Fields used: `id`, `text`, `category`, `difficulty`, `audio_url`, `sentence_audio_url`, `options`, `correct_option`.
- `src/lib/hebrewHelpers.js` — distractor generation (edit distance + heuristics). If changing behaviour, ensure `generateDistractors` still returns 4 options and preserves order/shuffle expectations.
- `src/lib/achievements.js` — achievements storage (`achievements_v1` key) and unlocking logic used by `GameShell`.
- `src/lib/events.js` — simple `subscribe`/`publish` used widely (see `BadgeToast.jsx`, `Achievements.jsx`).
- `src/components/ParentDashboard.jsx` — edits words in-memory and writes `words_he_cache` to `localStorage`. NOTE: auth is client-side only (default password: `parent123`).
- `public/service-worker.js` — caches `'/'`, `/index.html`, `/words_he.json` by default. If adding audio, update SW to cache `/audio/*` or pattern-match and bump `CACHE_NAME`.

## Local state & development notes ⚠️
- LocalStorage keys to be aware of: `words_he_cache`, `points`, `streak`, `child_name`, and `achievements_v1`.
- Parent dashboard is intentionally simple and client-only; it's for quick editing and local testing (not secure).

## Debugging & testing tips
- To test service worker behavior locally, run: `npm run build` then `npm run preview` and open the site in a browser tab (SW only registers on production build).
- Clear local state when testing: open DevTools Console and run `localStorage.clear()` and to clear service worker cache: `caches.delete('grade3-cache-v1')` (or increment `CACHE_NAME` in `public/service-worker.js`).
- To see unlock events: look for `publish('unlock', name)` in code and `subscribe('unlock', ...)` handlers in UI components.

## Conventions & patterns
- No global state library; energetic use of `useState` + `localStorage` + `events` pub/sub.
- Components are simple, function components with PascalCase filenames under `src/components/`.
- All critical data flows are explicit props (e.g., `GameShell` receives `words`, `mode` flows from `App.jsx`).
- Formatting via Prettier (`npm run format`); there is no linter configured.

## When changing data or features — practical checklist ✅
- If you change words schema: update `public/words_he.json`, `wordsLoader`, and `ParentDashboard` sample shape.
- If you add audio: add MP3s to `public/audio/`, update `words_he.json` `audio_url` fields, and extend `public/service-worker.js` to cache audio (and bump `CACHE_NAME`).
- If you modify achievement logic, update `src/lib/achievements.js` and ensure consumers handle newly unlocked keys gracefully.
- When touching distractors, add tests or at least unit-checks for `generateDistractors(word, pool)` to guarantee 4 options and inclusion of the correct answer.

## PR guidance & safety notes
- Mention in PR description if the change requires a `CACHE_NAME` bump or changes to `public/words_he.json` or audio assets.
- Be explicit when the change alters localStorage keys or shape (include migration steps or a debug reset function where appropriate).
- Avoid adding secrets—Parent password is intentionally insecure for local demos.

---
If anything is unclear or you'd like more coverage (e.g., example unit tests for `hebrewHelpers` or a note about adding CI), tell me which area to expand and I'll iterate. 🙌
