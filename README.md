# React Interview Workshop

A guided path through the ten problems that keep showing up in React
live-coding interviews. Write your solution, in the browser or in your own
editor, and get a **PASS / FAIL** grade from an automated test suite.

The ten interview problems are marked ★. Between them are **14 short warm-up
exercises** that each introduce *one* new idea, so that by the time you reach a
★ problem you have already used every hook it needs. Every brief starts with a
**Builds on / New here** note telling you exactly what the step up is.

If it has been a while since you wrote React, go in order. If you only want the
interview problems, do the ★ ones and drop back to the warm-up before any that
feels like too big a jump.

### Stage 1 · State & props

| # | Exercise | Level | New idea | You edit |
|---|----------|-------|----------|----------|
| 01 | ★ [Counter with reset](exercises/01-counter/README.md) | Beginner | Hooks & state | `Counter.jsx` |
| 02 | [Controlled input: live greeting](exercises/02-controlled-input/README.md) | Warm-up | Controlled inputs & derived values | `Greeting.jsx` |
| 03 | [List state: shopping list](exercises/03-list-state/README.md) | Warm-up | Arrays in state, keys & form submit | `ShoppingList.jsx` |
| 04 | [Lifting state up: accordion](exercises/04-lifting-state/README.md) | Warm-up | Props, callbacks & shared state | `Accordion.jsx` |

### Stage 2 · Context & memoization

| # | Exercise | Level | New idea | You edit |
|---|----------|-------|----------|----------|
| 05 | [Context basics: current user](exercises/05-context-basics/README.md) | Warm-up | `createContext` / `useContext` | `user.jsx` |
| 06 | [useMemo: don't redo expensive work](exercises/06-use-memo/README.md) | Warm-up | `useMemo` | `ProductSearch.jsx` |
| 07 | [React.memo + useCallback: one stable child](exercises/07-memo-callback/README.md) | Warm-up | `memo` / `useCallback` | `NoteEditor.jsx` |
| 08 | ★ [Toggle theme provider](exercises/08-theme-toggle/README.md) | Beginner | Context & patterns | `theme.jsx` |

### Stage 3 · Refs, effects & custom hooks

| # | Exercise | Level | New idea | You edit |
|---|----------|-------|----------|----------|
| 09 | [useRef + useEffect: focus management](exercises/09-ref-focus/README.md) | Warm-up | DOM refs & mount effects | `SearchBox.jsx` |
| 10 | [Your first custom hook: useToggle](exercises/10-use-toggle/README.md) | Warm-up | Custom hooks | `useToggle.js` |
| 11 | [useEffect with cleanup: useDocumentTitle](exercises/11-effect-basics/README.md) | Warm-up | Effects, dependencies & cleanup | `useDocumentTitle.js` |
| 12 | ★ [usePrevious: track the previous value](exercises/12-use-previous/README.md) | Beginner | Custom hooks | `usePrevious.js` |

### Stage 4 · Render performance

| # | Exercise | Level | New idea | You edit |
|---|----------|-------|----------|----------|
| 13 | ★ [Stop wasteful list re-renders](exercises/13-memo-list/README.md) | Intermediate | Performance | `TodoList.jsx` |

### Stage 5 · Timers

| # | Exercise | Level | New idea | You edit |
|---|----------|-------|----------|----------|
| 14 | [setTimeout with cleanup: "Saved!" flash](exercises/14-timeout-cleanup/README.md) | Warm-up | Timers in effects | `SaveButton.jsx` |
| 15 | ★ [Bug hunt: auto-counter stuck at 1](exercises/15-stale-closure/README.md) | Beginner | Debugging | `AutoCounter.jsx` |
| 16 | ★ [Self-cycling traffic light](exercises/16-traffic-light/README.md) | Intermediate | Effects & timers | `TrafficLight.jsx` |
| 17 | ★ [useDebounce](exercises/17-use-debounce/README.md) | Intermediate | Custom hooks | `useDebounce.js` |
| 18 | ★ [useInterval with pause](exercises/18-use-interval/README.md) | Intermediate | Custom hooks | `useInterval.js` |

### Stage 6 · Keyboard & focus

| # | Exercise | Level | New idea | You edit |
|---|----------|-------|----------|----------|
| 19 | [Keyboard events: tag input](exercises/19-tag-input/README.md) | Intermediate | `onKeyDown` | `TagInput.jsx` |
| 20 | [Refs to many elements: keyboard-navigable tabs](exercises/20-tabs-keyboard/README.md) | Intermediate | Array of refs & moving focus | `Tabs.jsx` |
| 21 | ★ [OTP input: verification code boxes](exercises/21-otp-input/README.md) | Advanced | Forms, events & refs | `OtpInput.jsx` |

### Stage 7 · Reducers & forms

| # | Exercise | Level | New idea | You edit |
|---|----------|-------|----------|----------|
| 22 | [useReducer basics: shopping cart](exercises/22-reducer-basics/README.md) | Intermediate | `useReducer` | `Cart.jsx` |
| 23 | [Form validation: login form](exercises/23-form-validation/README.md) | Intermediate | Validation, touched fields & submit | `LoginForm.jsx` |
| 24 | ★ [Multi-step signup form with useReducer](exercises/24-signup-wizard/README.md) | Advanced | State machines & forms | `SignupWizard.jsx` |

## Two ways to do the workshop

Both use the same briefs and the same tests, so a solution that passes in one
passes in the other.

### A. In the browser (LeetCode-style)

```bash
npm install
npm run dev          # then open http://localhost:5173
```

One page with everything:

- **Left:** the exercise list, grouped by stage, with ✓ / ✗ for each.
- **Middle:** the brief.
- **Right:** a code editor, and below it **Test results** and a live **Preview**
  of your component.

The editor auto-imports like VS Code: type `useState`, pick it from the
suggestion list with `Tab` or `Enter`, and `import { useState } from 'react'` is
added at the top of the file (or merged into the import that is already there).

Press **▶ Run tests** (or `Ctrl`/`⌘` + `Enter`) to grade. You get **Accepted** or
**Wrong Answer**, with every requirement listed as ✓/✗ and the reason for each
failure. **Reset** restores the starter code; **Solution** shows the reference
answer.

Your code and scoreboard are saved in that browser's `localStorage`, separately
from the files in `exercises/`. Nothing leaves your machine: the code is
compiled and tested inside the page.

`npm run build` produces a fully static site in `dist/` that can be hosted
anywhere. `.github/workflows/pages.yml` publishes it to GitHub Pages once this
is on the default branch and Pages is set to "GitHub Actions" in the repo
settings.

### B. In VS Code + terminal

Requires Node 20+.

```bash
npm install
npm run progress
```

1. **Read** the brief: `exercises/NN-name/README.md`. It is the spec, so the exact
   button text, labels and props it asks for matter.
2. **Code** the starter file in the same folder.
3. **Grade** it:

   ```bash
   npm run check 3        # grade exercise 3
   ```

   You get each requirement listed as ✓/×, then a final verdict:

   ```
    PASS  03 List state: shopping list  (8/8 tests)
   ```

4. **Track** your scoreboard:

   ```bash
   npm run progress
   ```

| Command | What it does |
|---------|--------------|
| `npm run check all` | Grade every exercise |
| `npm run watch 3` | Re-grade exercise 3 every time you save |
| `npm run verify-solutions` | Run the grader against the reference solutions (proves the tests are fair) |

To start an exercise over: `git checkout -- exercises/03-list-state`.
While `npm run dev` is running, `http://localhost:5173/playground/` renders the
components from your `exercises/` files so you can click around.

## Interview-style practice tips

- **Time-box the ★ problems.** Real rounds give 20–45 min. Aim for: Beginner
  15 min, Intermediate 25 min, Advanced 40 min. Warm-ups should take 5–15 min.
- **Talk out loud** while you code, as you would with an interviewer.
  Especially on #13 (why `memo` alone isn't enough) and #15 (explain each bug).
- **Read the failing test name, not the test file.** The test names are
  written as requirements. Treat `tests/` as the hidden grader, and only open it
  if you're truly stuck.
- Each brief ends with three collapsed sections. Open them in this order, and
  only as far as you need: **Hint** (a nudge), **Topics to read** (links to the
  relevant pages of the official React docs), **Full explainer** (the concepts
  behind the problem and how the solution works; spoilers).
- The terminal scoreboard is stored in `.progress.json` (git-ignored); the
  browser scoreboard in `localStorage`.

## Layout

```
exercises/   ← briefs + starter code (edit these in terminal mode)
tests/       ← the grader, shared by both modes
solutions/   ← reference solutions. ⚠️ Spoilers! Look only after you pass or give up.
web/         ← the browser workshop (UI, in-browser compiler and test runner)
playground/  ← renders your local exercises/ files (terminal mode)
scripts/     ← the terminal CLI
```

## Under the hood

- Terminal mode: **Vitest** + **jsdom** + **React Testing Library** + **user-event**.
- Browser mode: the editor code is compiled with **Sucrase** and the same test
  files run in a throw-away `<iframe>` against the real DOM, using a small
  harness (`web/runner/harness.js`) that provides Vitest's `describe` / `test` /
  `expect` / `vi` on top of `@vitest/expect`, `@vitest/spy` and
  `@sinonjs/fake-timers`.
- Timer exercises (14–18) use fake timers, so they run instantly and
  also check that you **clean up**: no leaked or stacked timers.
- Tests import the code under test through the `@ex` alias (see
  `vite.config.js`): your files in terminal mode, the editor contents in the
  browser, and `solutions/` for `verify-solutions`.
