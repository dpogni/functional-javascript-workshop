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

<details><summary>Topics to read (official React docs)</summary>

- [`memo` reference](https://react.dev/reference/react/memo)
- [`useCallback` reference](https://react.dev/reference/react/useCallback)
- [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state)
- [Render and commit](https://react.dev/learn/render-and-commit)
- [Rendering lists (and why keys matter)](https://react.dev/learn/rendering-lists)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** changing one thing re-renders every row of a list; make each row re-render only when its own data changes.

**Why every row re-renders in the starter**

1. `TodoRow` is not memoized, so it renders whenever `TodoList` does.
2. Even if it were, `onToggle={() => toggle(todo.id)}` creates a new function per row per render, so that prop always looks changed.
3. `toggle` itself is recreated on each render because it closes over `todos`.

All three have to be fixed. Fixing one or two changes nothing, which is what makes this a good interview question.

**Key concepts**

- **`memo` compares props shallowly.** A row is skipped only if `todo` is the same object *and* `onToggle` is the same function as last time.
- **Stable callback via `useCallback` + updater.** `useCallback((id) => setTodos(prev => prev.map(...)), [])` reads nothing from the render scope, so one function serves for the component's whole life. Writing `todos.map(...)` inside it with `[]` would be a stale closure: the second toggle would start again from the initial list.
- **Pass the callback, do not wrap it.** The row receives `onToggle` and calls `onToggle(todo.id)` itself. The inline arrow moves into the memoized child, where it is harmless.
- **Structural sharing.** `prev.map(t => t.id === id ? { ...t, done: !t.done } : t)` returns the *same object* for untouched todos. Their rows see an identical `todo` prop and are skipped. A deep clone of the list would re-render everything.

**How the solution works**

`TodoRow` is wrapped in `memo`. `toggle` is wrapped in `useCallback` with an updater and passed straight through. Clicking "Clicks" re-renders `TodoList`, but every row gets identical props: zero row renders. Toggling one todo replaces one object: exactly one row render.

**What an interviewer is looking for**

That you can list all the reasons a memoized child still re-renders, and that you would measure first (React DevTools Profiler) before optimising. Mention that the React Compiler can do this memoization automatically, and that for very long lists virtualization matters more.
</details>
