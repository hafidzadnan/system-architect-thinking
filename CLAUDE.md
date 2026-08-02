# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The repo root holds product documents — `README.md` (includes an approved implementation plan), `prd-system architect thinking.md`, and a reference `.docx`. The actual application lives entirely in `sat-app/`. All commands below are run from `sat-app/`.

## Commands

```bash
cd sat-app
npm install
npm run dev       # Vite dev server
npm run build     # production build
npm run preview   # preview a production build
```

There is no lint script and no test framework configured. There is also no `tsconfig.json` — the `typescript` devDependency is an unused Vite scaffold leftover; the project is plain `.jsx`, not `.tsx`. Don't invent `npm run lint` / `npm test` / type-check commands.

## Architecture

**Stack**: Vite + React 19 SPA, React Router v6, Zustand for state, a single hand-written global stylesheet (no Tailwind/CSS-in-JS).

**Routing** (`src/App.jsx`): `/login` is standalone; `/`, `/session/:id`, `/settings` are nested under `AppLayout`, which gates on `authStore.isLoggedIn` and redirects to `/login` otherwise. Login is a hardcoded demo credential (`demo`/`demo123`) checked in `LoginPage.jsx`.

**State (`src/stores/`)** — plain Zustand `create()`, **no persist middleware wired** despite README describing localStorage sync as the intended design:
- `authStore.js` — login flag only, resets on page refresh.
- `sessionStore.js` — a hardcoded mock `sessions` array; no create/update/delete actions beyond selecting the active session.
- `settingsStore.js` — Gemini API key, in-memory only.

**Guided session flow** (`SessionPage.jsx` + `components/phases/Phase01–05.jsx` + `SessionSummary.jsx`): the 5-phase wizard (System Requirements → Variable Definition → Logic Debugging → Computation → Output Validation) is driven by **local `useState`** in `SessionPage.jsx` (`activePhase`, `maxUnlockedPhase`), not by `sessionStore` — phase progress is not written back to the store and is lost on refresh. Each `PhaseNN.jsx` is currently a self-contained presentational form with its own local state; none read/write global state, and none call an LLM yet. The Gemini API integrations described in the README/PRD (automated bias detection in Phase 03, Benefit/Cost criteria mapping in Phase 04) are **not implemented** — those panels currently show static/mock content.

**Gap between docs and code**: README's "Arsitektur File" section describes a larger target structure that does not exist yet — `pages/EisenhowerPage.jsx`, `components/session/`, `components/ui/`, `components/eisenhower/`, `components/charts/`, and a `utils/` folder (`evCalculator.js`, `biasAnalyzer.js`, `criteriaMapper.js`, `templateData.js`, `constants.js`). Treat that section of the README as a target architecture, not current fact — verify a file exists before assuming it does.

**PRD vs. README scope**: `prd-system architect thinking.md` describes a broader multi-user SaaS product (org roles, real-time collaboration). README's "Rencana Implementasi" section is the actual approved MVP scope the code follows (single-user, frontend-only, localStorage-intended, no PDF export). Where the two disagree, the README MVP decisions win.

**Styling**: everything lives in `src/index.css` — the whole design system (colors, radii, shadows) is defined as CSS custom properties on `:root`, plus hand-written utility classes (`.btn`, `.btn-primary`, `.card`, `.badge-draft`, `.phase-section`, etc.). Reuse existing variables/classes rather than introducing a new styling approach; inline `style={{}}` objects are also used throughout the existing code for one-off layout tweaks.

**Language**: all UI copy is Bahasa Indonesia — this is an explicit product decision (README decision #11), keep new UI text in Indonesian.
