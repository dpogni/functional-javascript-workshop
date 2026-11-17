# 06 · useMemo: don't redo expensive work

**Stage:** 2 · Context & memoization · **Level:** Warm-up · **Topic:** `useMemo` · **File:** `ProductSearch.jsx`

**Builds on:** derived values (02).  
**New here:** deriving a value during render is great until the computation is
expensive. `useMemo` caches the result and only recomputes when its
**dependencies** change.

`ProductSearch.jsx` already *works*. But it calls `slowFilter` on **every**
render, including when you tick the unrelated **Compact view** checkbox.

## Requirements

Keep the existing behaviour and markup:

- `export default function ProductSearch({ products })` (array of strings).
- A **Search** input filters the list (case-insensitive, done by `slowFilter`).
- `data-testid="count"` shows `N results`.
- A **Compact view** checkbox toggles `data-compact` on the wrapper.
- Keep using `slowFilter` from `./slowFilter.js` for the filtering (the grader
  counts its calls). Don't edit that file.

Performance goals (checked by the grader):

- Toggling **Compact view** does **not** call `slowFilter` again.
- Typing one character calls `slowFilter` exactly **once**.
- A new `products` array still recomputes the results (don't over-cache!).

## Check it

```bash
npm run check 6
```

<details><summary>Hint</summary>

```js
const results = useMemo(() => slowFilter(products, query), [products, query]);
```
The dependency array lists every value from the component scope that the
calculation reads. Leave one out and you get stale results; that's what the
"new `products`" test catches.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [`useMemo` reference](https://react.dev/reference/react/useMemo)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Keeping components pure](https://react.dev/learn/keeping-components-pure)
- [Render and commit](https://react.dev/learn/render-and-commit)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** a calculation runs on every render, including renders caused by state it does not depend on.

**Key concepts**

- **Any state change re-runs the whole component function.** Ticking "Compact view" changes `compact`, so the function runs again and `slowFilter(products, query)` runs with it, although neither input changed.
- **`useMemo(fn, deps)` caches a result between renders.** React calls `fn` on the first render, stores the result, and on later renders returns the stored result unless one of `deps` changed (compared with `Object.is`).
- **Dependencies must be complete.** The list names every reactive value the calculation reads. Leave out `products` and the list keeps showing results for the old array: a stale cache, which is a correctness bug, not a performance one.
- **It is an optimisation, not a guarantee.** The code must still be correct if React recomputes. So the function has to be pure.

**How the solution works**

One line changes: `const results = useMemo(() => slowFilter(products, query), [products, query])`. Toggling `compact` re-renders, but both dependencies are unchanged, so the cached array is returned.

**Note the reference comparison**

`products` is compared by identity. If a parent built a new array on every render (`products={[...]}` inline), the memo would miss every time. Memoization only helps when the inputs are stable.

**When to bother**

When the calculation is measurably slow, or when the result is passed to a memoized child or used as an effect dependency and so needs a stable identity. For cheap calculations, plain code is clearer. Do not reach for an effect plus state to "cache" a derived value; that is what `useMemo` is for.
</details>
