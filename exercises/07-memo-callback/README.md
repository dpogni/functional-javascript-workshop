# 07 · React.memo + useCallback: one stable child

**Stage:** 2 · Context & memoization · **Level:** Warm-up · **Topic:** `memo` / `useCallback` · **File:** `NoteEditor.jsx`

**Builds on:** `useMemo` (06) and functional updates (01).  
**New here:** `React.memo` lets a component skip re-rendering when its props
are unchanged. But a function created inline is a *new* prop every render,
so you also need `useCallback` to keep the function's identity stable. This is
the single-child version of the list problem you'll meet in 13.

`NoteEditor.jsx` already *works*, but every keystroke re-renders `Toolbar`,
even though nothing about the toolbar changed.

## Requirements

Keep the existing behaviour and markup:

- `export default function NoteEditor()` with a textarea labelled **Note** and
  a `data-testid="length"` character count.
- `Toolbar` has two buttons: **Clear** (empties the note) and **UPPERCASE**
  (upper-cases the current note).
- **Do not remove** the `trackRender('toolbar')` call in `Toolbar`.

Performance goals (checked by the grader):

- Typing in the note re-renders `Toolbar` **zero** times.
- Clicking **Clear** / **UPPERCASE** re-renders `Toolbar` **zero** times.
- **UPPERCASE** must still act on the *latest* text, not the text from the
  first render.

## Check it

```bash
npm run check 7
```

<details><summary>Hint</summary>

1. `const Toolbar = memo(function Toolbar(...) { ... })`.
2. Wrap both handlers in `useCallback(..., [])`.
3. With an empty dependency array, the handler can't read `text` directly (it
   would be stuck with the first render's value). Use the functional form:
   `setText((t) => t.toUpperCase())`.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [`memo` reference](https://react.dev/reference/react/memo)
- [`useCallback` reference](https://react.dev/reference/react/useCallback)
- [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [Render and commit](https://react.dev/learn/render-and-commit)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** a child re-renders on every keystroke although nothing it shows has changed.

**Key concepts**

- **Children re-render with their parent by default.** When `NoteEditor` renders, React renders `Toolbar` too, whatever its props are.
- **`memo(Component)`** changes that: React skips the child if every prop is equal to last time (`Object.is`).
- **Functions break that comparison.** `const clear = () => setText('')` creates a brand-new function object on each render. To `memo`, a new function is a changed prop, so `memo` alone does nothing here.
- **`useCallback(fn, deps)`** returns the same function object until `deps` change. With `[]`, it is the same forever.
- **Stable callbacks and stale closures.** A function created once only sees the variables of the first render. `useCallback(() => setText(text.toUpperCase()), [])` would upper-case the empty string from render one. Listing `text` as a dependency fixes the staleness but gives a new function on each keystroke, defeating the purpose. The updater form, `setText(t => t.toUpperCase())`, needs no outside variable, so the dependency list can honestly be empty.

**How the solution works**

Three changes: wrap `Toolbar` in `memo`, wrap both handlers in `useCallback(..., [])`, and switch `uppercase` to an updater function. `Toolbar` then receives the same two function objects on every render and is skipped.

**The takeaway**

`memo` and `useCallback` are a pair. `memo` on a child is only as good as the stability of every prop you pass it. Exercise 13 applies the same idea to a list, where one unstable prop undoes it for every row.
</details>
