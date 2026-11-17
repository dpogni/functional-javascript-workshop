# 10 · Your first custom hook: useToggle

**Stage:** 3 · Refs, effects & custom hooks · **Level:** Warm-up · **Topic:** Custom hooks · **File:** `useToggle.js`

**Builds on:** functional updates (01) and `useCallback` (07).  
**New here:** a custom hook is just a function whose name starts with `use`
and that calls other hooks. It lets you package stateful logic and reuse it.
Nothing new to learn about React itself; this is about the *shape*.

## Requirements

`export default function useToggle(initial = false)`

Returns an object `{ on, toggle, setOn, setOff }`:

- `on`: the current boolean, starting at `initial`.
- `toggle()`: flips it.
- `setOn()` / `setOff()`: force it to `true` / `false`.
- Calling `toggle()` twice in a row (in the same batch) must end up where it
  started. So: functional updates.
- `toggle`, `setOn` and `setOff` keep the **same function identity** across
  renders, so they're safe to pass to memoized children or effect deps.
- Two components using `useToggle` each get their own independent state.

## Check it

```bash
npm run check 10
```

<details><summary>Hint</summary>

```js
const [on, setValue] = useState(initial);
const toggle = useCallback(() => setValue((v) => !v), []);
```
Same pattern for `setOn` / `setOff`. Then `return { on, toggle, setOn, setOff }`.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [`useCallback` reference](https://react.dev/reference/react/useCallback)
- [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** package a small piece of stateful behaviour so any component can reuse it.

**Key concepts**

- **A custom hook is a function.** Its name starts with `use` and it calls other hooks. There is no other mechanism. The `use` prefix is what lets the linter apply the rules of hooks to it.
- **Hooks share logic, not state.** Each call to `useToggle()` gets its own `useState` slot, tied to the component that called it. Two components using the hook do not affect each other.
- **Design the return value as an API.** Callers get `{ on, toggle, setOn, setOff }` and never see the underlying setter. An object lets them pick what they need by name; an array (like `useState`) lets them rename freely. Either is fine if you are consistent.
- **Stable functions are a courtesy.** A hook's caller may put `toggle` in an effect's dependency list or pass it to a memoized child. If the hook returned a new function on every render, that effect would re-run and that child would re-render every time. Wrapping in `useCallback` makes the hook safe to use anywhere.

**How the solution works**

`useState(initial)` holds the boolean. `toggle` uses an updater (`v => !v`), which is what makes two toggles in one batch cancel out, and what allows an empty dependency list. `setOn` and `setOff` set fixed values.

**What an interviewer is looking for**

Custom hooks come up as "extract this logic". They watch for the naming convention, a sensible return shape, and whether you think about callers: referential stability and independent state per call.
</details>
