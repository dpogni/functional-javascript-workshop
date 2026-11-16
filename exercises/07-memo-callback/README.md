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
