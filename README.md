# React Interview Workshop

Ten problems that keep showing up in React live-coding interviews. You write
the code in your editor, run one command, and get a **PASS / FAIL** grade from
an automated test suite.

| # | Problem | Level | Topic | You edit |
|---|---------|-------|-------|----------|
| 01 | [Counter with reset](exercises/01-counter/README.md) | Beginner | Hooks & state | `Counter.jsx` |
| 02 | [Toggle theme provider](exercises/02-theme-toggle/README.md) | Beginner | Context & patterns | `theme.jsx` |
| 03 | [usePrevious](exercises/03-use-previous/README.md) | Beginner | Custom hooks | `usePrevious.js` |
| 04 | [Stop wasteful list re-renders](exercises/04-memo-list/README.md) | Intermediate | Performance | `TodoList.jsx` |
| 05 | [Self-cycling traffic light](exercises/05-traffic-light/README.md) | Intermediate | Effects & timers | `TrafficLight.jsx` |
| 06 | [useDebounce](exercises/06-use-debounce/README.md) | Intermediate | Custom hooks | `useDebounce.js` |
| 07 | [OTP input](exercises/07-otp-input/README.md) | Advanced | Forms, events & refs | `OtpInput.jsx` |
| 08 | [Bug hunt: auto-counter stuck at 1](exercises/08-stale-closure/README.md) | Beginner | Debugging | `AutoCounter.jsx` |
| 09 | [useInterval with pause](exercises/09-use-interval/README.md) | Intermediate | Custom hooks | `useInterval.js` |
| 10 | [Multi-step signup wizard (useReducer)](exercises/10-signup-wizard/README.md) | Advanced | State machines & forms | `SignupWizard.jsx` |

## Setup

Requires Node 20+.

```bash
npm install
npm run progress
```

## The loop

1. **Read** the brief: `exercises/NN-name/README.md`. It is the spec, so the exact
   button text, labels and props it asks for matter.
2. **Code** the starter file in the same folder, in VS Code.
3. **Grade** it:

   ```bash
   npm run check 3        # grade exercise 3
   ```

   You get each requirement listed as ✓/×, then a final verdict:

   ```
    PASS  03 usePrevious: track the previous value  (5/5 tests)
   ```

4. **Track** your scoreboard:

   ```bash
   npm run progress
   ```

### Other commands

| Command | What it does |
|---------|--------------|
| `npm run check all` | Grade all ten exercises |
| `npm run watch 3` | Re-grade exercise 3 every time you save |
| `npm run dev` | Browser playground that renders *your* components, so you can click around |
| `npm run verify-solutions` | Run the grader against the reference solutions (proves the tests are fair) |

To start an exercise over: `git checkout -- exercises/03-use-previous`.

## Interview-style practice tips

- **Time-box it.** Real rounds give 20–45 min. Aim for: Beginner 15 min,
  Intermediate 25 min, Advanced 40 min.
- **Talk out loud** while you code, as you would with an interviewer.
  Especially on #04 (why `memo` alone isn't enough) and #08 (explain each bug).
- **Read the failing test name, not the test file.** The test names are
  written as requirements. Treat `tests/` as the hidden grader, and only open it
  if you're truly stuck.
- Each brief has a collapsed **Hint**. Try without it first.
- Your scoreboard is stored in `.progress.json` (git-ignored).

## Layout

```
exercises/   ← your workspace: briefs + starter code (edit these)
tests/       ← the grader (Vitest + React Testing Library)
solutions/   ← reference solutions. ⚠️ Spoilers! Look only after you pass or give up.
playground/  ← `npm run dev` browser sandbox
scripts/     ← the workshop CLI
```

## Under the hood

- **Vitest** + **jsdom** + **React Testing Library** + **user-event**.
- Timer exercises (05, 06, 08, 09) use fake timers, so they run instantly and
  also check that you **clean up**: no leaked or stacked timers.
- Tests import your code through the `@ex` alias (see `vite.config.js`), which
  `verify-solutions` points at `solutions/` instead.
