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
- `sessionStore.js` — a hardcoded mock `sessions` array; no create/update/delete actions beyond selecting the active session. Also holds the **`phase01`/`phase02`/`phase03` slices**; Phase04–05/Summary are still local component state.
  - `phase01` — `rootObjective`, `functionTag`, `functionJustification`, `internalParameters`/`externalConstraints`/`recommendedTasks` as `{ id, value }` row arrays, plus `setPhase01Field`/`addPhase01Row`/`updatePhase01Row`/`removePhase01Row`/`applyPhase01Import`.
  - `phase02` — **holds only what Fase 01 doesn't already know**: `variables` is a map keyed by the *Fase 01 EVM row id* (`{ description, source, tag, thresholdType, thresholdValue }`), plus `taskInputs`/`extraTasks`/`plotted`/`dismissed` for the Eisenhower queue. The variable and task *lists* are derived at read time by the exported selectors `selectPhase02Variables(state)` and `selectPhase02UnplottedTasks(state)`, so editing or deleting an EVM row in Fase 01 propagates automatically with no sync effect. Both selectors return fresh arrays — call them through `useMemo`, never directly as a zustand selector.
  - `phase03` — `status` (`idle|running|error|done`), `error` as a plain `{ kind, message }`, `validations`, `analyzedAt`, `staleVariableIds`, `selected`. `setPhase02Variable` also pushes onto `staleVariableIds` when the edited variable was already analyzed — that's the revise → re-run loop (README #16/#17). `cancelPhase03Analysis` exists because `status: 'running'` is only valid while `Phase03` is mounted (the AbortController lives in the component); its unmount cleanup must release the status or the phase renders a permanent spinner.
- `settingsStore.js` — OpenRouter API key (defaults from `VITE_OPENROUTER_API_KEY`, see Commands) + selected model, in-memory only.

**Guided session flow** (`SessionPage.jsx` + `components/phases/Phase01–05.jsx` + `SessionSummary.jsx`): the 5-phase wizard (System Requirements → Variable Definition → Logic Debugging → Computation → Output Validation) is driven by **local `useState`** in `SessionPage.jsx` (`activePhase`, `maxUnlockedPhase`), not by `sessionStore` — phase progress (which phase you're on) is not written back to the store and is lost on refresh. Each `PhaseNN.jsx` is a self-contained form. **Phase01–03 are store-backed** (data survives navigating away and back; still lost on a full refresh) and **Phase04–05 are not** — they remain `useState` + `defaultValue` mockups, and the Phase 04 Benefit/Cost mapping OpenRouter integration described in the README/PRD is **not implemented**.

- **Phase01** — "📥 Import Data" opens `ImportDataModal.jsx`, a 3-step wizard (Sumber Data → Analisis → Review) that extracts text from an uploaded file or pasted text (`src/services/fileExtractor.js`, dispatching to `pdfExtractor.js`/`xlsxExtractor.js` for `.pdf`/`.xlsx`, native `file.text()` for `.md`/`.txt`/`.json`/`.csv`), sends it to OpenRouter (`src/services/openrouter.js`), and on accept applies the validated result via `applyPhase01Import`.
- **Phase02** — variable rows are derived from the Fase 01 EVM (names read-only, no CRUD here); the user fills description/source/tag/threshold. A `Hardcoded Data` tag with an empty source flags the row `.warning-row` inline. The Eisenhower matrix renders from `QUADRANTS.map()` (`src/utils/eisenhowerLogic.js`), not four copy-pasted blocks.
- **Phase03** — real in-app bias detection. The "🤖 Analisis Bias dengan AI" button calls `src/services/biasAnalyzer.js` with every Fase 02 variable; results render as a variable × 4-bias matrix. Clicking a ⚠️ cell opens a `.bias-card` with the AI's reason, sanitation recommendation, and an **inline revision form that writes straight back to the `phase02` slice** — which marks the variable stale and requires "🔄 Analisis Ulang" before the phase can be completed. The old copy-prompt-to-external-LLM + paste-JSON panel is gone. The runner mirrors `ImportDataModal`'s concurrency handling (AbortController, `runIdRef` stale-response guard, abort on unmount).

**`src/services/`**: the app's external-API/file-parsing layer (no `src/lib` exists). `openrouter.js` owns the shared transport — `requestJson({ apiKey, model, systemPrompt, userContent, signal })` handles the missing-key check, input truncation, JSON-mode fallback (~16% of OpenRouter's catalog rejects `response_format`, so a 400 retries once without it), HTTP-status → `AnalysisError` kind mapping, and fence-stripping JSON extraction. **Add a new AI feature by calling `requestJson` with your own prompt + validator, not by re-implementing fetch** — `analyzeDocument` (Fase 01) and `biasAnalyzer.js`'s `analyzeBias` (Fase 03) are both thin wrappers over it. `biasAnalyzer.js` builds its user message from live Fase 01+02 data (`buildBiasUserContent`) and normalizes the response **back onto the input variable list** in `validateBiasAnalysis`, so the matrix always matches Fase 02 exactly and a variable the model skipped defaults to `validated` rather than failing the whole run. `fileExtractor.js` dispatches by file extension (not MIME type — inconsistent across browsers/OS). `pdfjs-dist` and `xlsx` (SheetJS) are both dynamically `import()`-ed inside `pdfExtractor.js`/`xlsxExtractor.js` so they never touch the initial bundle. **`xlsx` is installed from SheetJS's own CDN tarball** (`package.json` dependency is a URL, not a registry version) because the npm-registry `xlsx` package has been unmaintained since 2022 — Dependabot cannot see or update URL dependencies, so bumping it is manual.

**Gap between docs and code**: README's "Arsitektur File" section describes a larger target structure that only partly exists. `src/utils/` now holds `constants.js` (bias types, tag/threshold options, U/I thresholds) and `eisenhowerLogic.js` (`getQuadrant`, `QUADRANTS`); README's `biasAnalyzer.js` lives in `src/services/` instead, next to the other API code. Still missing: `pages/EisenhowerPage.jsx`, `components/session/`, `components/ui/`, `components/eisenhower/`, `components/charts/`, and `utils/evCalculator.js`, `criteriaMapper.js`, `templateData.js`. Treat that section of the README as a target architecture, not current fact — verify a file exists before assuming it does.

**PRD vs. README scope**: `prd-system architect thinking.md` describes a broader multi-user SaaS product (org roles, real-time collaboration). README's "Rencana Implementasi" section is the actual approved MVP scope the code follows (single-user, frontend-only, localStorage-intended, no PDF export). Where the two disagree, the README MVP decisions win.

**Styling**: everything lives in `src/index.css` — the whole design system (colors, radii, shadows) is defined as CSS custom properties on `:root`, plus hand-written utility classes (`.btn`, `.btn-primary`, `.card`, `.badge-draft`, `.phase-section`, etc.). Reuse existing variables/classes rather than introducing a new styling approach; inline `style={{}}` objects are also used throughout the existing code for one-off layout tweaks.

**Language**: all UI copy is Bahasa Indonesia — this is an explicit product decision (README decision #11), keep new UI text in Indonesian.
