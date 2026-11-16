# 13 · Stop wasteful list re-renders

**Stage:** 4 · Render performance · **Level:** Intermediate · **Topic:** Performance · **File:** `TodoList.jsx` · ★ Interview problem

**Builds on:** `memo` + `useCallback` on one child (07), immutable list updates (03).  
**New here:** the same idea across a whole list, where one careless inline function or one re-created object defeats the optimisation for every row.

`TodoList.jsx` already *works*, but it is slow: clicking the unrelated
**Clicks** button, or toggling a single todo, re-renders **every** row.
Fix it with `React.memo` and `useCallback` so rows only re-render when their
own data changes.

## Requirements

Keep the existing behaviour and markup:

- `export default function TodoList({ initialTodos })`, where each todo is
  `{ id, text, done }`.
- Each row is a checkbox labelled with the todo text; ticking it toggles `done`.
- The **Clicks: N** button increments a counter that has nothing to do with the
  list.
- **Do not remove** the `trackRender(todo.id)` call at the top of `TodoRow`:
  the grader uses it to count row renders.

Performance goals (checked by the grader):

- Clicking **Clicks: N** re-renders **zero** rows.
- Toggling one todo re-renders **only that row**.
- A toggled todo must still toggle correctly no matter how many times you click
  (watch out for stale closures once you add `useCallback`).

## Check it

```bash
npm run check 13
```

<details><summary>Hint</summary>

1. Wrap `TodoRow` in `memo`.
2. Make `onToggle` stable with `useCallback(..., [])` and a **functional**
   `setTodos` update, so it doesn't need `todos` in its dependency list.
3. Pass `onToggle` straight through. `onToggle={() => onToggle(todo.id)}`
   creates a new function every render and defeats `memo`; let the row call
   `onToggle(todo.id)` itself.
4. When toggling, return the *same object* for untouched todos so their props
   stay referentially equal.
</details>
