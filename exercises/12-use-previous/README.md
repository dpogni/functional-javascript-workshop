# 12 · usePrevious: track the previous value

**Stage:** 3 · Refs, effects & custom hooks · **Level:** Beginner · **Topic:** Custom hooks · **File:** `usePrevious.js` · ★ Interview problem

**Builds on:** `useRef` (09), custom hooks (10), effects (11).  
**New here:** a ref as a *mutable box* that survives renders without causing one, and the timing difference between "during render" and "in an effect".

## Requirements

`export default function usePrevious(value)`

- Returns the `value` the hook received **on the previous render**.
- Returns `undefined` on the first render.
- "Previous render" means literally that: if the component re-renders with the
  same value, `usePrevious` returns that same value (it tracks renders, not
  changes).
- Must **not** cause any extra renders (no `setState` inside the hook).
- Works with any value type (numbers, strings, objects, `null`...).

## Check it

```bash
npm run check 12
```

<details><summary>Hint</summary>

You need something that persists across renders but doesn't trigger a render
when it changes: `useRef`. Read the ref during render, and write the new value
into it in an effect (which runs *after* the render is committed).
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Referencing values with refs](https://react.dev/learn/referencing-values-with-refs)
- [`useRef` reference](https://react.dev/reference/react/useRef)
- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [Render and commit](https://react.dev/learn/render-and-commit)
- [Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** remember what a value was during the last render, without that memory causing another render.

**Key concepts**

- **A ref is a mutable box that survives renders.** `useRef(x)` returns the same `{ current }` object every time. Writing to `.current` does not schedule a render. That is exactly the difference from state, and exactly what is needed here.
- **Timing: render first, effects after.** During a render, the component function runs top to bottom and returns. Only after React commits the result do effects run.

**How the solution works**

```js
const ref = useRef(undefined);
useEffect(() => { ref.current = value; });
return ref.current;
```

Follow one render with `value = 2` after a render with `value = 1`:

1. The function runs. The box still contains `1` (written after the *previous* render). The hook returns `1`.
2. React commits.
3. The effect runs and writes `2` into the box, ready for next time.

On the very first render the box holds its initial `undefined`. The effect has no dependency array, so it runs after every render, which is why the hook tracks "the previous render" and not "the previous different value".

**Why not state?**

`setPrev(value)` in an effect would trigger a second render each time, and that render would see `prev` equal to the current value. The requirement "no extra renders" rules it out.

**A caveat worth mentioning in an interview**

The React docs advise against reading or writing `ref.current` during render, because it makes a component's output depend on something React does not track. This hook reads during render deliberately; it is a well-known pattern, but if you need the previous value to *decide what to render*, the docs recommend keeping it in state and updating it during render instead.
</details>
