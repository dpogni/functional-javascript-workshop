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
