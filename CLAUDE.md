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
npm run lint      # ESLint (flat config, eslint.config.js)
npm run format    # Prettier --write
```

A pre-commit hook (Husky, hooked via `core.hooksPath` at the repo root pointing to `sat-app/.husky` — needed because `sat-app/` isn't the git root) runs `lint-staged` on staged `.js`/`.jsx` files. GitHub Actions CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, and `npm run build` on push/PR to `main` on **Node 22** (bumped from 20 — `pdfjs-dist` requires `>=22.13.0`); Dependabot (`.github/dependabot.yml`) opens weekly update PRs for both npm (`sat-app/`) and GitHub Actions.

Copy `sat-app/.env.example` to `sat-app/.env` and set `VITE_OPENROUTER_API_KEY` before using any AI feature — `settingsStore.js` reads it as the default `apiKey`. `.env` is gitignored; never commit real keys.

When touching `src/services/pdfExtractor.js`, always smoke-test with `npm run build && npm run preview`, not just `npm run dev` — the pdf.js worker is loaded via an undocumented `?url` import suffix on a `.mjs` file that can behave differently between dev and a production build.

There is still no test framework and no `tsconfig.json` — the `typescript` devDependency is an unused Vite scaffold leftover; the project is plain `.jsx`, not `.tsx`. Don't invent `npm test` / type-check commands.

## Architecture

**Stack**: Vite + React 19 SPA, React Router v6, Zustand for state, a single hand-written global stylesheet (no Tailwind/CSS-in-JS).

**Routing** (`src/App.jsx`): `/login` is standalone; `/`, `/session/:id`, `/settings` are nested under `AppLayout`, which gates on `authStore.isLoggedIn` and redirects to `/login` otherwise. Login is a hardcoded demo credential (`demo`/`demo123`) checked in `LoginPage.jsx`.

**State (`src/stores/`)** — plain Zustand `create()`, **no persist middleware wired** despite README describing localStorage sync as the intended design:
- `authStore.js` — login flag only, resets on page refresh.
- `sessionStore.js` — a hardcoded mock `sessions` array; no create/update/delete actions beyond selecting the active session. Also holds the **`phase01` slice** (`rootObjective`, `functionTag`, `functionJustification`, `internalParameters`/`externalConstraints`/`recommendedTasks` as `{ id, value }` row arrays) plus `setPhase01Field`/`addPhase01Row`/`updatePhase01Row`/`removePhase01Row`/`applyPhase01Import` — this is the only phase's data living in the store; Phase02–05/Summary are still local component state.
- `settingsStore.js` — OpenRouter API key (defaults from `VITE_OPENROUTER_API_KEY`, see Commands) + selected model, in-memory only.

**Guided session flow** (`SessionPage.jsx` + `components/phases/Phase01–05.jsx` + `SessionSummary.jsx`): the 5-phase wizard (System Requirements → Variable Definition → Logic Debugging → Computation → Output Validation) is driven by **local `useState`** in `SessionPage.jsx` (`activePhase`, `maxUnlockedPhase`), not by `sessionStore` — phase progress (which phase you're on) is not written back to the store and is lost on refresh. Each `PhaseNN.jsx` is a self-contained form; **Phase01 is the exception** — its fields are controlled via `sessionStore`'s `phase01` slice (so data survives navigating away and back, unlike the others), and it has a real AI integration: the "📥 Import Data" button opens `ImportDataModal.jsx`, a 3-step wizard (Sumber Data → Analisis → Review) that extracts text from an uploaded file or pasted text (`src/services/fileExtractor.js`, dispatching to `pdfExtractor.js`/`xlsxExtractor.js` for `.pdf`/`.xlsx`, native `file.text()` for `.md`/`.txt`/`.json`/`.csv`), sends it to OpenRouter chat-completions (`src/services/openrouter.js`), and on accept applies the validated result to the form via `applyPhase01Import`. Phase02–05 still don't read/write global state or call an LLM — the OpenRouter integrations described in the README/PRD for Phase 03 (bias detection) and Phase 04 (Benefit/Cost mapping) are **not implemented**, those panels still show static/mock content.

**`src/services/`**: the app's first external-API/file-parsing layer (no `src/lib` exists). `openrouter.js` handles chat-completions calls, JSON-mode fallback (~16% of OpenRouter's catalog rejects `response_format`, so a 400 retries once without it), fence-stripping JSON extraction, and result validation/normalization. `fileExtractor.js` dispatches by file extension (not MIME type — inconsistent across browsers/OS). `pdfjs-dist` and `xlsx` (SheetJS) are both dynamically `import()`-ed inside `pdfExtractor.js`/`xlsxExtractor.js` so they never touch the initial bundle. **`xlsx` is installed from SheetJS's own CDN tarball** (`package.json` dependency is a URL, not a registry version) because the npm-registry `xlsx` package has been unmaintained since 2022 — Dependabot cannot see or update URL dependencies, so bumping it is manual.

**Gap between docs and code**: README's "Arsitektur File" section describes a larger target structure that does not exist yet — `pages/EisenhowerPage.jsx`, `components/session/`, `components/ui/`, `components/eisenhower/`, `components/charts/`, and a `utils/` folder (`evCalculator.js`, `biasAnalyzer.js`, `criteriaMapper.js`, `templateData.js`, `constants.js`). Treat that section of the README as a target architecture, not current fact — verify a file exists before assuming it does.

**PRD vs. README scope**: `prd-system architect thinking.md` describes a broader multi-user SaaS product (org roles, real-time collaboration). README's "Rencana Implementasi" section is the actual approved MVP scope the code follows (single-user, frontend-only, localStorage-intended, no PDF export). Where the two disagree, the README MVP decisions win.

**Styling**: everything lives in `src/index.css` — the whole design system (colors, radii, shadows) is defined as CSS custom properties on `:root`, plus hand-written utility classes (`.btn`, `.btn-primary`, `.card`, `.badge-draft`, `.phase-section`, etc.). Reuse existing variables/classes rather than introducing a new styling approach; inline `style={{}}` objects are also used throughout the existing code for one-off layout tweaks.

**Language**: all UI copy is Bahasa Indonesia — this is an explicit product decision (README decision #11), keep new UI text in Indonesian.
